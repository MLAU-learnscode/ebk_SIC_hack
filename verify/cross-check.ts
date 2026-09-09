/**
 * cross-check.ts — run C's executable spec against B's product implementation.
 * Run: npx tsx verify/cross-check.ts
 *
 * C's scripts/validate-rules.mjs contains an independent REFERENCE EVALUATOR.
 * Two implementations that agree is evidence; one implementation is a hope.
 * This harness feeds C's fixtures/eligibility-cases.json through the real engine
 * and reports any disagreement, so we find it here rather than on a projector.
 *
 * ── IF THIS FILE ERRORS ON C'S CASE FORMAT ──────────────────────────────────
 * I wrote the adapter below without having seen eligibility-cases.json. If the
 * shape differs, fix `adaptCase` only — never the engine, and never C's fixture.
 * The adapter is the only part allowed to know about C's file layout.
 */

import { readFileSync, existsSync } from 'node:fs';
import type { EligibilityStatus, FounderProfile, GrantRule } from '../src/types/contract';
import { evaluateGrant } from '../src/lib/eligibility';
import { createEmptyProfile } from '../src/lib/profile';

const CASES = './fixtures/eligibility-cases.json';
const RULES_DIR = './data/rules';
const DEMO_FOUNDER = './fixtures/demo-founder.json';
const NOW = '2026-09-09T10:00:00+08:00';

interface NormalisedCase {
  name: string;
  grant_id: string;
  profile: FounderProfile;
  expected_state: EligibilityStatus;
  expected_blocker_count?: number;
  expected_unknown_count?: number;
}

/** THE ONLY PART THAT KNOWS C'S FILE LAYOUT. Adjust here if the shape differs. */
function adaptCase(raw: Record<string, unknown>, i: number, demoAnswers: Record<string, unknown>): NormalisedCase {
  const answers = (
    raw.profile_ref === 'demo-founder' ? demoAnswers : raw.profile ?? raw.answers ?? raw.input ?? {}
  ) as Record<string, unknown>;

  // C's cases may hold either a bare `answers` tree or a whole FounderProfile.
  const base = createEmptyProfile(NOW);
  const looksLikeFullProfile = 'answers' in answers;
  const profile: FounderProfile = looksLikeFullProfile
    ? ({ ...base, ...(answers as object) } as FounderProfile)
    : ({ ...base, answers: deepMerge(base.answers, answers) } as FounderProfile);

  // C's `expect` is an object ({ state, blocker_fields, unknown_fields, ... }), not a bare string.
  const expect = (raw.expect ?? {}) as Record<string, unknown>;

  return {
    name: String(raw.name ?? raw.id ?? raw.description ?? `case ${i + 1}`),
    grant_id: String(raw.grant_id ?? raw.grant ?? ''),
    profile,
    expected_state: (raw.expected_state ?? expect.state ?? raw.expected) as EligibilityStatus,
    expected_blocker_count: (raw.expected_blockers ?? (expect.blocker_fields as unknown[] | undefined)?.length) as
      | number
      | undefined,
    expected_unknown_count: (raw.expected_unknowns ?? (expect.unknown_fields as unknown[] | undefined)?.length) as
      | number
      | undefined,
  };
}

function deepMerge(base: unknown, patch: unknown): unknown {
  const obj = (v: unknown): v is Record<string, unknown> =>
    typeof v === 'object' && v !== null && !Array.isArray(v);
  if (!obj(base) || !obj(patch)) return patch ?? base;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    out[k] = obj(v) && obj(base[k]) ? deepMerge(base[k], v) : v;
  }
  return out;
}

function loadRules(): Map<string, GrantRule> {
  const map = new Map<string, GrantRule>();
  for (const f of ['nyc-ycm', 'raise-vfg-youth', 'startup-sg-founder']) {
    const path = `${RULES_DIR}/${f}.json`;
    if (!existsSync(path)) continue;
    const rule = JSON.parse(readFileSync(path, 'utf8')) as GrantRule;
    map.set(rule.grant_id, rule);
  }
  return map;
}

function main(): void {
  if (!existsSync(CASES)) {
    console.log(`SKIP  ${CASES} not found — pull branch c/rules first.`);
    process.exit(0);
  }

  const rules = loadRules();
  if (rules.size === 0) {
    console.log(`SKIP  no rule files in ${RULES_DIR} — pull branch c/rules first.`);
    process.exit(0);
  }

  const demoAnswers = (
    existsSync(DEMO_FOUNDER) ? (JSON.parse(readFileSync(DEMO_FOUNDER, 'utf8')).answers ?? {}) : {}
  ) as Record<string, unknown>;

  const parsed = JSON.parse(readFileSync(CASES, 'utf8')) as unknown;
  const rawCases = (Array.isArray(parsed) ? parsed : (parsed as { cases?: unknown[] }).cases ?? []) as Record<
    string,
    unknown
  >[];

  let failures = 0;
  for (const [i, raw] of rawCases.entries()) {
    const c = adaptCase(raw, i, demoAnswers);
    const rule = rules.get(c.grant_id);
    if (!rule) {
      console.log(`SKIP  ${c.name} — no rule loaded for "${c.grant_id}"`);
      continue;
    }

    let got: ReturnType<typeof evaluateGrant>;
    try {
      got = evaluateGrant(c.profile, rule, NOW);
    } catch (e) {
      console.log(`FAIL  ${c.name} — engine threw: ${e instanceof Error ? e.message : String(e)}`);
      failures++;
      continue;
    }

    const problems: string[] = [];
    if (c.expected_state && got.status !== c.expected_state) {
      problems.push(`state: expected ${c.expected_state}, got ${got.status}`);
    }
    if (c.expected_blocker_count !== undefined && got.blockers.length !== c.expected_blocker_count) {
      problems.push(`blockers: expected ${c.expected_blocker_count}, got ${got.blockers.length}`);
    }
    if (c.expected_unknown_count !== undefined && got.unknowns.length !== c.expected_unknown_count) {
      problems.push(`unknowns: expected ${c.expected_unknown_count}, got ${got.unknowns.length}`);
    }

    if (problems.length) {
      console.log(`FAIL  ${c.name}\n      ${problems.join('\n      ')}`);
      failures++;
    } else {
      console.log(`PASS  ${c.name} → ${got.status}`);
    }
  }

  console.log(
    failures === 0
      ? `\nCROSS-CHECK: ${rawCases.length} cases, B's engine agrees with C's spec`
      : `\nCROSS-CHECK: ${failures} DISAGREEMENT(S) — one of us is wrong, resolve before the demo`,
  );
  process.exit(failures === 0 ? 0 : 1);
}

main();
