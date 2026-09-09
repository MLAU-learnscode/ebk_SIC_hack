/**
 * eligibility.ts — THE SOUNDNESS GUARANTEE.
 *
 * Owner: B. Nobody else edits this file.
 *
 * There is no model here and there never will be. This is a pure function over
 * hand-authored rules JSON. It runs with the wifi off, it returns the same answer
 * every time, and it cannot hallucinate. That property is the pitch (CONTEXT.md §4,
 * §7) — protect it.
 *
 * v1.0.1 — C's three amendments accepted 9 Sep:
 *   1. explicit `terminal` + `terminal_reason` (a missing remedy is now an error,
 *      not a silent life sentence)
 *   2. `when` guards and any_of `group`s
 *   3. `applies_at_stage` parsed and deliberately ignored
 *
 * NOTE FOR C: this is the product implementation. Your reference evaluator in
 * scripts/validate-rules.mjs stays independent on purpose — two implementations
 * that agree is evidence; one implementation is a hope. Diff them with
 * `npx tsx verify/cross-check.ts`.
 */

import type {
  Condition,
  Confidence,
  Criterion,
  CriterionOutcome,
  CriterionResult,
  EligibilityResult,
  EligibilityStatus,
  FieldPath,
  FounderProfile,
  GrantRule,
  ReadinessMap,
  Remedy,
  ResultWarning,
  RuleOp,
} from '../types/contract';

/* ── field resolution ───────────────────────────────────────────────────── */

/**
 * Resolve a dot-path like 'memberships.raise_member' against profile.answers.
 * Returns undefined if the path doesn't exist (a rules-authoring bug),
 * null if the founder hasn't answered yet (normal, mid-intake).
 */
export function resolveField(profile: FounderProfile, path: FieldPath): unknown {
  return path.split('.').reduce<unknown>((node, key) => {
    if (node === null || node === undefined || typeof node !== 'object') return undefined;
    return (node as Record<string, unknown>)[key];
  }, profile.answers);
}

/* ── the operators ──────────────────────────────────────────────────────── */

/**
 * CLOSED SET. Matches RuleOp in contract.ts exactly.
 * Returns null when the answer is unknown, so the caller can distinguish
 * "not asked yet" from "asked and failed" — see CONTRACT.md §2. This distinction
 * is the cold-start guarantee: an empty profile must produce unknowns and ZERO
 * blockers, or the readiness map paints everything red and the founder leaves.
 */
function applyOp(op: RuleOp, actual: unknown, expected: unknown): boolean | null {
  // `exists` is the one operator that is meaningful on a null value.
  if (op === 'exists') return actual !== null && actual !== undefined && actual !== '';

  if (actual === null || actual === undefined) return null; // UNKNOWN

  switch (op) {
    case 'eq':      return actual === expected;
    case 'neq':     return actual !== expected;
    case 'in':      return Array.isArray(expected) && expected.includes(actual as never);
    case 'not_in':  return Array.isArray(expected) && !expected.includes(actual as never);
    case 'gte':     return typeof actual === 'number' && actual >= Number(expected);
    case 'lte':     return typeof actual === 'number' && actual <= Number(expected);
    case 'gt':      return typeof actual === 'number' && actual > Number(expected);
    case 'lt':      return typeof actual === 'number' && actual < Number(expected);
    case 'is_true':  return actual === true;
    case 'is_false': return actual === false;
    case 'between': {
      if (!Array.isArray(expected) || expected.length !== 2) return null;
      const [min, max] = expected as [number, number];
      return typeof actual === 'number' && actual >= min && actual <= max; // inclusive both ends
    }
    default: {
      // Unreachable if C stuck to the closed set. Loud, not silent — a typo'd
      // operator quietly evaluating false would be the worst kind of demo bug.
      const never: never = op;
      throw new Error(
        `Unknown rule operator "${String(never)}". Operators are a closed set — see CONTRACT.md §6.`,
      );
    }
  }
}

function testCondition(profile: FounderProfile, cond: Condition, ctx: string): boolean | null {
  const actual = resolveField(profile, cond.field);
  if (actual === undefined) {
    throw new Error(
      `${ctx} references "${cond.field}", which does not exist in profile.answers. ` +
        `Check the field dictionary in CONTRACT.md §3.`,
    );
  }
  return applyOp(cond.op, actual, cond.value);
}

/* ── criteria ───────────────────────────────────────────────────────────── */

function assertWellFormed(rule: GrantRule, c: Criterion): void {
  if (!c.blocking) return;
  if (c.remedy || c.terminal) return;
  throw new Error(
    `Rule "${rule.grant_id}": blocking criterion "${c.field}" has neither a remedy nor ` +
      `terminal:true. Refusing to guess — a forgotten remedy would tell a founder they are ` +
      `permanently disqualified. Add one or the other (CONTRACT.md §6).`,
  );
}

function evaluateCriterion(profile: FounderProfile, rule: GrantRule, c: Criterion): CriterionResult {
  assertWellFormed(rule, c);

  const base = {
    field: c.field,
    label: c.label,
    blocking: c.blocking,
    remedy: c.remedy,
    remedy_order: c.remedy_order,
    remedy_url: c.remedy_url,
    remedy_duration: c.remedy_duration,
    terminal: c.terminal,
    terminal_reason: c.terminal_reason,
    group: c.group,
  };

  // Guard. An unmet guard skips the criterion entirely; an UNKNOWN guard leaves
  // us unable to say whether it applies, so the criterion is UNKNOWN too.
  if (c.when) {
    const holds = testCondition(profile, c.when, `Rule "${rule.grant_id}" guard on "${c.field}"`);
    if (holds === false) {
      return { ...base, outcome: 'SKIPPED', actual: resolveField(profile, c.field) ?? null };
    }
    if (holds === null) {
      return { ...base, outcome: 'UNKNOWN', actual: resolveField(profile, c.field) ?? null };
    }
  }

  const actual = resolveField(profile, c.field);
  const passed = testCondition(profile, c, `Rule "${rule.grant_id}"`);
  const outcome: CriterionOutcome = passed === null ? 'UNKNOWN' : passed ? 'MET' : 'UNMET';

  return { ...base, outcome, actual: actual ?? null };
}

/* ── groups ─────────────────────────────────────────────────────────────── */

/**
 * any_of: MET if any member MET; UNKNOWN if none MET and any UNKNOWN;
 * SKIPPED if every member skipped; otherwise UNMET.
 * Members stay in `criteria[]` individually — this only decides what the group
 * contributes to the status.
 */
function groupOutcome(members: CriterionResult[]): CriterionOutcome {
  if (members.some((m) => m.outcome === 'MET')) return 'MET';
  const live = members.filter((m) => m.outcome !== 'SKIPPED');
  if (live.length === 0) return 'SKIPPED';
  if (live.some((m) => m.outcome === 'UNKNOWN')) return 'UNKNOWN';
  return 'UNMET';
}

/** One scoring unit per ungrouped criterion, plus one per group. */
function scoringUnits(criteria: CriterionResult[]): CriterionResult[] {
  const units: CriterionResult[] = [];
  const groups = new Map<string, CriterionResult[]>();

  for (const c of criteria) {
    if (!c.group) {
      units.push(c);
      continue;
    }
    const bucket = groups.get(c.group) ?? [];
    bucket.push(c);
    groups.set(c.group, bucket);
  }

  for (const [, members] of groups) {
    const head = members[0];
    units.push({
      ...head,
      outcome: groupOutcome(members),
      // A group is blocking if any member is.
      blocking: members.some((m) => m.blocking),
      terminal: members.some((m) => m.terminal),
    });
  }
  return units;
}

/* ── status ─────────────────────────────────────────────────────────────── */

/**
 * THE STATE MACHINE (agreed with C, 9 Sep):
 *
 *   any blocking UNMET and terminal        → not_a_fit
 *   else any blocking UNMET with a remedy  → eligible_after_steps
 *   else any blocking UNKNOWN              → eligible_after_steps
 *   else                                   → eligible_now
 *
 * Non-blocking failures never change the status. They surface as advice.
 * SKIPPED contributes nothing.
 */
function deriveStatus(units: CriterionResult[]): EligibilityStatus {
  const blocking = units.filter((u) => u.blocking);

  if (blocking.some((u) => u.outcome === 'UNMET' && u.terminal)) return 'not_a_fit';
  if (blocking.some((u) => u.outcome === 'UNMET' && !!u.remedy)) return 'eligible_after_steps';
  if (blocking.some((u) => u.outcome === 'UNKNOWN')) return 'eligible_after_steps';
  return 'eligible_now';
}

function collectRemedies(units: CriterionResult[]): Remedy[] {
  const seen = new Set<string>();
  return units
    .filter((u) => u.outcome === 'UNMET' && !!u.remedy)
    .map((u) => ({
      order: u.remedy_order ?? 999,
      text: u.remedy as string,
      url: u.remedy_url,
      duration: u.remedy_duration,
      field: u.field,
    }))
    .filter((r) => (seen.has(r.text) ? false : (seen.add(r.text), true)))
    .sort((a, b) => a.order - b.order)
    // Re-number 1..n so the UI can render the array as-is.
    .map((r, i) => ({ ...r, order: i + 1 }));
}

function collectWarnings(profile: FounderProfile, rule: GrantRule): ResultWarning[] {
  return (rule.warnings ?? [])
    .filter((w) => {
      if (!w.when) return true;
      return testCondition(profile, w.when, `Rule "${rule.grant_id}" warning "${w.id}"`) === true;
    })
    .map(({ id, message, source_url, confirm_with_funder }) => ({
      id,
      message,
      source_url,
      confirm_with_funder,
    }));
}

/* ── public API ─────────────────────────────────────────────────────────── */

export function evaluateGrant(
  profile: FounderProfile,
  rule: GrantRule,
  now: string = new Date().toISOString(),
): EligibilityResult {
  const criteria = rule.criteria.map((c) => evaluateCriterion(profile, rule, c));
  const units = scoringUnits(criteria);

  // Buckets are built from `criteria` (what A renders), not from scoring units.
  const satisfied = criteria.filter((c) => c.outcome === 'MET');
  const unknowns = criteria.filter((c) => c.outcome === 'UNKNOWN');
  const blockers = criteria
    .filter((c) => c.blocking && c.outcome === 'UNMET')
    .sort((a, b) => (a.remedy_order ?? 999) - (b.remedy_order ?? 999));

  return {
    grant_id: rule.grant_id,
    grant_name: rule.name,
    source_url: rule.source_url,
    last_checked: rule.last_checked,
    confidence: (rule.confidence ?? 'secondary') as Confidence,
    status: deriveStatus(units),
    quantum: rule.quantum,
    criteria,
    satisfied,
    blockers,
    unknowns,
    remedies: collectRemedies(units),
    warnings: collectWarnings(profile, rule),
    has_unknowns: unknowns.length > 0,
    unknown_count: unknowns.length,
    evaluated_at: now,
  };
}

/** Sort order for the readiness map: closest to funded, first. */
const STATUS_RANK: Record<EligibilityStatus, number> = {
  eligible_now: 0,
  eligible_after_steps: 1,
  not_a_fit: 2,
};

export function evaluateAll(
  profile: FounderProfile,
  rules: GrantRule[],
  now: string = new Date().toISOString(),
): ReadinessMap {
  const results = rules
    .map((r) => evaluateGrant(profile, r, now))
    .sort((a, b) => {
      const byStatus = STATUS_RANK[a.status] - STATUS_RANK[b.status];
      if (byStatus !== 0) return byStatus;
      // Within eligible_after_steps: fewest steps to unblock, first.
      const bySteps = a.remedies.length - b.remedies.length;
      if (bySteps !== 0) return bySteps;
      return a.grant_name.localeCompare(b.grant_name);
    });

  return { results, evaluated_at: now };
}

/* ── helpers A will want ────────────────────────────────────────────────── */

/** Human-readable status, for badges. Keep the wording — it's in the pitch. */
export const STATUS_LABEL: Record<EligibilityStatus, string> = {
  eligible_now: 'You can apply now',
  eligible_after_steps: 'You can apply after a few steps',
  not_a_fit: 'Not a fit right now',
};

/** The single blocking thing standing in the way, or null. Drives the map's subtitle. */
export function firstBlocker(result: EligibilityResult): CriterionResult | null {
  return result.blockers[0] ?? result.unknowns.find((c) => c.blocking) ?? null;
}

/** Why a founder can never qualify, for the not_a_fit card. Empty unless status is not_a_fit. */
export function terminalReasons(result: EligibilityResult): string[] {
  return result.blockers
    .filter((b) => b.terminal)
    .map((b) => b.terminal_reason ?? b.label);
}
