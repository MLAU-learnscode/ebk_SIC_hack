/**
 * profile.ts — creating and updating the founder profile.
 * Owner: B.
 *
 * A calls these instead of hand-merging state. The merge is the place where
 * "null means not asked" quietly turns into "false means no" if you write it
 * carelessly, so it lives here once rather than in every screen.
 */

import type {
  ElicitResult,
  FieldMeta,
  FieldPath,
  FounderProfile,
  ProfileAnswers,
} from '../types/contract';
import { PROFILE_VERSION } from '../types/contract';

/** Every field null, every branch present. The shape the schema expects on day one. */
export function createEmptyProfile(now: string = new Date().toISOString()): FounderProfile {
  const answers: ProfileAnswers = {
    founder: {
      full_name: null,
      age: null,
      citizenship: null,
      is_key_applicant: null,
      first_time_founder: null,
      previously_incorporated: null,
      equity_pct: null,
      residing_in_sg: null,
      access_needs: [],
    },
    venture: {
      name: null,
      one_liner: null,
      problem_statement: null,
      stage: null,
      incorporated: null,
      uen: null,
      incorporation_date: null,
      entity_type: null,
      entity_status: null,
      ssic_code: null,
      project_duration_months: null,
    },
    impact: {
      beneficiary_group: null,
      beneficiary_count_est: null,
      impact_description: null,
      beneficiary_validation: null,
      sso_partnership: null,
      sso_partner_name: null,
    },
    memberships: {
      raise_member: null,
      raise_member_since: null,
      amp_relationship: null,
      amp_name: null,
    },
    funding: {
      amount_sought_sgd: null,
      other_govt_funding: null,
      other_govt_funding_detail: null,
      can_match_capital_sgd: null,
    },
    readiness: {
      has_pitch_deck: null,
      has_acra_profile: null,
      has_management_accounts: null,
      has_financial_projections: null,
      has_team_resumes: null,
      team_size: null,
    },
  };

  return {
    profile_version: PROFILE_VERSION,
    profile_id: crypto.randomUUID(),
    created_at: now,
    updated_at: now,
    answers,
    field_meta: {},
    stage_progress: [],
    elicit_progress: { completed_step_ids: [], current_step_id: null },
  };
}

/**
 * Merge a sparse patch into the profile. Returns a NEW profile — never mutates,
 * so React state updates behave.
 *
 * Only keys present in the patch are touched. A key explicitly set to null in the
 * patch DOES clear the value (the founder went back and unanswered something);
 * a key simply absent is left alone. That distinction matters when someone edits
 * an earlier answer.
 */
export function applyElicitResult(
  profile: FounderProfile,
  result: ElicitResult,
  now: string = new Date().toISOString(),
): FounderProfile {
  const answers = deepMerge(profile.answers, result.patch) as ProfileAnswers;

  const field_meta: Record<FieldPath, FieldMeta> = {
    ...profile.field_meta,
    ...result.field_meta_patch,
  };

  const completed = new Set(profile.elicit_progress?.completed_step_ids ?? []);
  completed.add(result.step_id);

  return {
    ...profile,
    answers,
    field_meta,
    updated_at: now,
    elicit_progress: {
      completed_step_ids: [...completed],
      current_step_id: result.next_step_id,
    },
  };
}

/** Mark a field as confirmed after the founder says yes to the confirm-back prompt. */
export function confirmFields(
  profile: FounderProfile,
  paths: FieldPath[],
  now: string = new Date().toISOString(),
): FounderProfile {
  const field_meta = { ...profile.field_meta };
  for (const p of paths) {
    const meta = field_meta[p];
    if (meta) field_meta[p] = { ...meta, confirmed_by_founder: true, updated_at: now };
  }
  return { ...profile, field_meta, updated_at: now };
}

/**
 * Should A show a gap flag on this field? See CONTRACT.md §3.
 * Unknown provenance counts as a gap — silence is not a clean bill of health.
 */
export function isGapFlagged(profile: FounderProfile, path: FieldPath): boolean {
  const meta = profile.field_meta[path];
  if (!meta) return true;
  return meta.source === 'AI_ESTIMATED' || !meta.confirmed_by_founder;
}

/** Every gap-flagged path, for the "before you submit" review screen. */
export function listGaps(profile: FounderProfile): FieldPath[] {
  return Object.keys(profile.field_meta).filter((p) => isGapFlagged(profile, p));
}

/* ── persistence (CONTEXT §7: browser storage, versioned by stage) ───────── */

const STORAGE_KEY = 'founder_profile_v1';

export function saveProfile(profile: FounderProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch {
    // Private browsing, storage full, or storage disabled. Not fatal — the
    // session keeps working in memory. Never let this break the demo.
  }
}

export function loadProfile(): FounderProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as FounderProfile;
    // A profile written by an older schema is discarded rather than migrated.
    if (parsed.profile_version !== PROFILE_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearProfile(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* see saveProfile */
  }
}

/* ── internals ──────────────────────────────────────────────────────────── */

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function deepMerge(base: unknown, patch: unknown): unknown {
  if (!isPlainObject(base) || !isPlainObject(patch)) return patch;
  const out: Record<string, unknown> = { ...base };
  for (const [k, v] of Object.entries(patch)) {
    if (v === undefined) continue; // absent means "leave alone"
    out[k] = isPlainObject(v) && isPlainObject(base[k]) ? deepMerge(base[k], v) : v;
  }
  return out;
}
