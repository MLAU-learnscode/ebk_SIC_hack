/**
 * contract.ts — THE SINGLE SOURCE OF TRUTH FOR EVERY NAME THAT CROSSES A ROLE BOUNDARY.
 *
 * Owner:  B (Intelligence Lead). Nobody else edits this file.
 * Status: FROZEN as of end of Day 1. Changes require all three leads to agree in writing.
 *
 * WHY THIS FILE EXISTS
 * The classic hackathon failure is frontend and backend drifting on names —
 * `raiseeMember` vs `raise_member`, `status` vs `result`, `null` vs `false`.
 * If A imports these types, that drift becomes a red squiggle at 2pm instead of
 * a broken demo at 2am.
 *
 * THE ONE CASING RULE
 * Anything that comes out of, or goes into, a JSON file is snake_case, verbatim,
 * forever. No camelCase mapping layer anywhere. Yes, `profile.answers.founder.age`
 * looks un-idiomatic in React. That is the price of never renaming a field, and it
 * is a price worth paying on a three-day build.
 * React component names, props that never touch JSON, and local variables stay
 * camelCase/PascalCase as normal.
 *
 * ENUM VALUES are SCREAMING_SNAKE, except the three eligibility statuses, which are
 * lowercase snake_case because CONTEXT.md §7 names them verbatim and the pitch says
 * them out loud. Do not "tidy" these.
 */

/* ────────────────────────────────────────────────────────────────────────────
   1. PRIMITIVES
   ──────────────────────────────────────────────────────────────────────────── */

/** 'YYYY-MM-DD' */
export type IsoDate = string;
/** Full ISO 8601, e.g. '2026-09-08T14:03:00+08:00' — always produce with .toISOString() */
export type IsoDateTime = string;
/** kebab-case, e.g. 'raise-vfg-youth' */
export type GrantId = string;
/** snake_case, e.g. 'support_network' */
export type StepId = string;
/** Dot-path into FounderProfile['answers'], e.g. 'founder.age' */
export type FieldPath = string;

/**
 * Every async B→A call returns this. A never writes a try/catch.
 * Discriminate on `ok` and TypeScript narrows the rest for you.
 */
export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: AppError };

export interface AppError {
  code:
    | 'FIXTURE_MISSING'
    | 'NETWORK'
    | 'NOT_FOUND'
    | 'VALIDATION'
    | 'RATE_LIMITED'
    | 'UNKNOWN';
  /** Plain-language, already safe to render directly to the founder. */
  message: string;
  /** Developer detail. Never render this. */
  detail?: string;
}

/* ────────────────────────────────────────────────────────────────────────────
   2. THE PROFILE  (mirrors /data/profile.schema.json — keep them in lockstep)
   ──────────────────────────────────────────────────────────────────────────── */

export const PROFILE_VERSION = '1.0.0' as const;

export type Citizenship = 'SG' | 'PR' | 'OTHER';
export type VentureStage = 'IDEA' | 'PROTOTYPE' | 'OPERATING';
export type AmpRelationship = 'NONE' | 'IN_DISCUSSION' | 'LOR_ISSUED';
export type AccessNeed =
  | 'SCREEN_READER'
  | 'PLAIN_LANGUAGE'
  | 'EXTRA_TIME'
  | 'LARGE_TEXT'
  | 'VOICE_INPUT'
  | 'REDUCED_MOTION';

/**
 * NULL DISCIPLINE — read this twice.
 *   null  = we have not asked yet        → criterion is UNKNOWN
 *   false = the founder said no          → criterion is UNMET
 * These are not the same and the eligibility engine will not treat them the same.
 * Never initialise a field to false, '' or 0 to "make TypeScript happy".
 */
export interface ProfileAnswers {
  founder: {
    full_name: string | null;
    age: number | null;
    citizenship: Citizenship | null;
    is_key_applicant: boolean | null;
    first_time_founder: boolean | null;
    previously_incorporated: boolean | null;
    equity_pct: number | null;
    /** Young ChangeMakers: must be residing in SG. Added v1.0.1 at C's request. */
    residing_in_sg: boolean | null;
    /** Self-declared. Drives UI only. NO rule file may read this. */
    access_needs: AccessNeed[];
  };
  venture: {
    name: string | null;
    one_liner: string | null;
    problem_statement: string | null;
    stage: VentureStage | null;
    incorporated: boolean | null;
    uen: string | null;
    incorporation_date: IsoDate | null;
    entity_type: string | null;
    entity_status: string | null;
    ssic_code: string | null;
    /** Young ChangeMakers: project must run <= 6 months. Added v1.0.1 at C's request. */
    project_duration_months: number | null;
  };
  impact: {
    beneficiary_group: string | null;
    beneficiary_count_est: number | null;
    impact_description: string | null;
    beneficiary_validation: boolean | null;
    /**
     * MISNAMED, KEPT ANYWAY. raiSE's term is VWO (Voluntary Welfare Organisation),
     * not SSO (Social Service Office) — those are different things, and CONTEXT.md
     * §5 carries the same error. The field name is frozen and A is building on it,
     * so we fix the label the founder sees, not the key. Every founder-facing
     * string for this field says VWO.
     */
    sso_partnership: boolean | null;
    sso_partner_name: string | null;
  };
  memberships: {
    raise_member: boolean | null;
    raise_member_since: IsoDate | null;
    amp_relationship: AmpRelationship | null;
    amp_name: string | null;
  };
  funding: {
    amount_sought_sgd: number | null;
    other_govt_funding: boolean | null;
    other_govt_funding_detail: string | null;
    /**
     * Startup SG Founder matching capital. NON-BLOCKING by C's decision: the 1:1
     * ratio comes only from vendor blogs and ESG's own page 404'd, so blocking on
     * it would be the exact wrong answer this product exists to prevent.
     * Added v1.0.1.
     */
    can_match_capital_sgd: number | null;
  };
  readiness: {
    has_pitch_deck: boolean | null;
    has_acra_profile: boolean | null;
    has_management_accounts: boolean | null;
    has_financial_projections: boolean | null;
    has_team_resumes: boolean | null;
    team_size: number | null;
  };
}

/** The seam. This is the differentiator — render it, do not hide it. */
export type FieldSource =
  | 'FOUNDER'        // they typed or said it
  | 'AI_EXTRACTED'   // pulled from their own words — needs confirm-back
  | 'AI_ESTIMATED'   // we guessed — ALWAYS gap-flagged
  | 'ACRA'           // official registry
  | 'DEFAULT';       // schema default, never presented as fact

export interface FieldMeta {
  source: FieldSource;
  confirmed_by_founder: boolean;
  updated_at: IsoDateTime;
  /** Rendered verbatim in the gap-flag tooltip. Keep under 120 chars. */
  note?: string | null;
}

export type StageStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'SUBMITTED'
  | 'PASSED'
  | 'BLOCKED';

export interface StageProgress {
  grant_id: GrantId;
  stage_id: string;
  status: StageStatus;
  updated_at: IsoDateTime;
}

export interface FounderProfile {
  profile_version: typeof PROFILE_VERSION;
  profile_id: string;
  created_at: IsoDateTime;
  updated_at: IsoDateTime;
  answers: ProfileAnswers;
  /** Keyed by FieldPath. Absent key = UNKNOWN provenance = must be gap-flagged. */
  field_meta: Record<FieldPath, FieldMeta>;
  stage_progress?: StageProgress[];
  elicit_progress?: {
    completed_step_ids: StepId[];
    current_step_id: StepId | null;
  };
}

/* ────────────────────────────────────────────────────────────────────────────
   3. RULES  (C authors the JSON, B writes the function. Never the same file.)
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * CLOSED SET. C may not invent an operator that B has not implemented —
 * that is the single most likely silent failure in this build.
 * Need a new operator? Message B first, B ships it, then C uses it.
 */
export type RuleOp =
  | 'eq'
  | 'neq'
  | 'in'
  | 'not_in'
  | 'between'   // value: [min, max], INCLUSIVE both ends
  | 'gte'
  | 'lte'
  | 'gt'
  | 'lt'
  | 'is_true'   // sugar for eq/true
  | 'is_false'  // sugar for eq/false
  | 'exists';   // non-null

/** A field test. Criteria, `when` guards and warning triggers are all shaped like this. */
export interface Condition {
  field: FieldPath;
  op: RuleOp;
  value?: unknown;
}

/** How much we trust the source behind a rule. `primary` must cite a .gov.sg domain. */
export type Confidence = 'primary' | 'secondary' | 'unverified';

export interface Criterion extends Condition {
  /** blocking:true means failing this cannot be waved through. */
  blocking: boolean;
  /** Plain-language restatement shown to the founder. Required — no jargon-only criteria. */
  label: string;

  /**
   * THE FORK. A blocking criterion must declare ONE of these — the engine throws
   * if it has neither:
   *   remedy        → unmet becomes eligible_after_steps ("join raiSE first")
   *   terminal:true → unmet becomes not_a_fit ("you are not 18-35")
   *
   * This is explicit rather than inferred from a missing remedy, because
   * FORGETTING a remedy would otherwise be indistinguishable from DECIDING
   * someone is permanently disqualified — and a founder acts on that answer.
   * (C's amendment 1, accepted 9 Sep.)
   */
  remedy?: string;
  remedy_order?: number;
  remedy_url?: string;
  /** How long the remedy realistically takes, e.g. '4-8 weeks'. Shown next to the step. */
  remedy_duration?: string;
  terminal?: boolean;
  /** Required when terminal is true. Shown to the founder instead of a remedy. */
  terminal_reason?: string;

  /**
   * Guard. If the condition does not hold, the criterion is SKIPPED entirely —
   * it contributes nothing to the status. If the guard's own field is unknown,
   * the criterion is UNKNOWN (we cannot tell whether it applies).
   * (C's amendment 2, accepted 9 Sep.)
   */
  when?: Condition;

  /**
   * Criteria sharing a `group` id are scored together:
   *   any_of → group is MET if ANY member is MET;
   *            UNKNOWN if none MET and any member UNKNOWN;
   *            UNMET otherwise.
   * Needed because the operator set has no OR, and raiSE's rule is genuinely
   * "VWO partnership AND/OR beneficiary validation".
   * Members still appear individually in `criteria[]` so A can render them.
   */
  group?: string;
  group_mode?: 'any_of';

  /**
   * Which funnel stage this criterion actually bites at. IGNORED in v1 —
   * treating everything as applying now is more conservative and never wrong.
   * It is the hook for the vertical-progression screen. (C's amendment 3.)
   */
  applies_at_stage?: string;

  /** FieldPath this criterion's remedy cannot be started before. Used to sanity-check remedy order. */
  depends_on?: FieldPath;
}

/** Advisory note attached to a grant. Never affects status. */
export interface RuleWarning {
  id: string;
  /** Fires only when this holds. Omit to always fire. */
  when?: Condition;
  message: string;
  source_url?: string;
  /** true → render as "confirm with the funder", not as fact. */
  confirm_with_funder?: boolean;
}

export interface GrantRule {
  grant_id: GrantId;
  name: string;
  /** Provenance is mandatory. No rule ships without a source we can point a judge at. */
  source_url: string;
  last_checked: IsoDate;
  confidence?: Confidence;
  criteria: Criterion[];
  warnings?: RuleWarning[];
  /** Optional: documents needed to start, surfaced in the readiness panel. */
  required_documents?: string[];
  /** Free text, e.g. 'up to S$20,000'. Never compute or infer this. */
  quantum?: string;
}

/* ────────────────────────────────────────────────────────────────────────────
   4. ELIGIBILITY OUTPUT  (what the readiness map renders)
   ──────────────────────────────────────────────────────────────────────────── */

/** Verbatim from CONTEXT.md §7. Lowercase. Do not rename. */
export type EligibilityStatus =
  | 'eligible_now'
  | 'eligible_after_steps'
  | 'not_a_fit';

/** SKIPPED = a `when` guard excluded this criterion. It scores nothing. */
export type CriterionOutcome = 'MET' | 'UNMET' | 'UNKNOWN' | 'SKIPPED';

export interface CriterionResult {
  field: FieldPath;
  label: string;
  outcome: CriterionOutcome;
  blocking: boolean;
  /** The founder's actual value, for "you said 42" display. */
  actual: unknown;
  remedy?: string;
  remedy_order?: number;
  remedy_url?: string;
  remedy_duration?: string;
  terminal?: boolean;
  terminal_reason?: string;
  /** Group id, when this criterion is scored as part of an any_of group. */
  group?: string;
}

export interface Remedy {
  order: number;
  text: string;
  url?: string;
  duration?: string;
  /** Which criterion this unblocks — lets A link the remedy back to the row. */
  field: FieldPath;
}

export interface ResultWarning {
  id: string;
  message: string;
  source_url?: string;
  confirm_with_funder?: boolean;
}

export interface EligibilityResult {
  grant_id: GrantId;
  grant_name: string;
  source_url: string;
  last_checked: IsoDate;
  confidence: Confidence;
  status: EligibilityStatus;
  quantum?: string;

  /** Every criterion, in rule order, SKIPPED ones included. */
  criteria: CriterionResult[];

  /**
   * Pre-bucketed views of `criteria`, so A filters nothing.
   * `satisfied` is populated even when status is bad — the green ticks are the
   * emotional payoff of the readiness map, not decoration.
   * `blockers` is PRE-SORTED by remedy_order: render the array as given and the
   * order IS the founder's instruction sequence.
   */
  satisfied: CriterionResult[];
  blockers: CriterionResult[];
  unknowns: CriterionResult[];

  /** Ordered, deduplicated, ready to render as a numbered list. */
  remedies: Remedy[];
  /** Advisory only. Never affects status. */
  warnings: ResultWarning[];

  /** True if any criterion is UNKNOWN. Drives "answer 2 more questions to be sure". */
  has_unknowns: boolean;
  unknown_count: number;
  evaluated_at: IsoDateTime;
}

export interface ReadinessMap {
  /** Sorted: eligible_now, then eligible_after_steps (fewest remedies first), then not_a_fit. */
  results: EligibilityResult[];
  evaluated_at: IsoDateTime;
}

/* ────────────────────────────────────────────────────────────────────────────
   5. ELICITATION  (one question per screen — CONTEXT.md §11 accessibility)
   ──────────────────────────────────────────────────────────────────────────── */

export type ElicitInputKind =
  | 'FREE_TEXT'
  | 'SHORT_TEXT'
  | 'NUMBER'
  | 'SINGLE_CHOICE'
  | 'MULTI_CHOICE'
  | 'YES_NO';

export interface ElicitChoice {
  /** Stored verbatim into the profile — must match the enum in the schema. */
  value: string;
  /** Plain language shown to the founder. */
  label: string;
  /** Optional funder's own term, shown ALONGSIDE label, never replacing it. */
  funder_term?: string;
}

export interface ElicitStep {
  step_id: StepId;
  /** The question, in plain language, second person. */
  question: string;
  /** One sentence of why we're asking. Renders under the question. */
  why: string;
  input_kind: ElicitInputKind;
  choices?: ElicitChoice[];
  /** Which profile fields this step can populate. */
  writes_fields: FieldPath[];
  /** Founder may skip; skipping leaves the fields null, never false. */
  optional: boolean;
  /** Fixture backing this step, relative to /fixtures/responses/. */
  fixture: string;
}

/** What B hands back after an answer is processed. */
export interface ElicitResult {
  step_id: StepId;
  /** Sparse patch. Merge into profile.answers — do NOT replace the tree. */
  patch: DeepPartial<ProfileAnswers>;
  /** Meta for every field in the patch. Keys must match the patch's paths. */
  field_meta_patch: Record<FieldPath, FieldMeta>;
  /**
   * The confirm-back sentence (CONTEXT.md §4). A MUST render this and get a
   * yes before setting confirmed_by_founder = true.
   * e.g. "So: you're 24, Singaporean, and you want to hire deaf baristas. Right?"
   */
  confirm_back: string;
  next_step_id: StepId | null;
}

/* ────────────────────────────────────────────────────────────────────────────
   6. DRAFTING  (funder-formatted answers with visible gap flags)
   ──────────────────────────────────────────────────────────────────────────── */

export interface DraftGapFlag {
  /** Which field in the draft is soft. */
  field: FieldPath;
  /** Character offsets into `text`, so A can highlight inline. */
  start: number;
  end: number;
  source: FieldSource;
  /** Shown in the flag. e.g. "We estimated this. Confirm before you submit." */
  note: string;
}

export interface DraftSection {
  /** Funder's own question, verbatim from their form. */
  funder_question: string;
  /** Plain-language restatement. Shown alongside, not instead of. */
  plain_question: string;
  text: string;
  word_limit?: number;
  gaps: DraftGapFlag[];
}

export interface DraftResult {
  grant_id: GrantId;
  stage_id: string;
  sections: DraftSection[];
  generated_at: IsoDateTime;
  /** false in demo. Surfaces in the UI as "pre-generated for reliability". */
  from_live_model: boolean;
}

/* ────────────────────────────────────────────────────────────────────────────
   7. ACRA  (data.gov.sg — free, no auth, real network call)
   ──────────────────────────────────────────────────────────────────────────── */

export interface AcraMatch {
  uen: string;
  entity_name: string;
  entity_type: string | null;
  entity_status: string | null;
  registration_incorporation_date: IsoDate | null;
  primary_ssic_code: string | null;
  primary_ssic_description: string | null;
}

/* ────────────────────────────────────────────────────────────────────────────
   8. THE B→A FUNCTION SURFACE
   These signatures are the contract. A codes against them from hour one and is
   never blocked waiting for B's implementation.
   ──────────────────────────────────────────────────────────────────────────── */

/**
 * src/lib/eligibility.ts — PURE. Synchronous. No fetch, no model.
 * Deterministic given (profile, rule). The implementation takes an optional
 * third `now` argument so tests can pin the timestamp; callers ignore it.
 */
export type EvaluateGrant = (profile: FounderProfile, rule: GrantRule) => EligibilityResult;
export type EvaluateAll = (profile: FounderProfile, rules: GrantRule[]) => ReadinessMap;

/** src/lib/elicit.ts — reads /fixtures/responses/. Live path exists but is behind the flag. */
export type GetStep = (stepId: StepId) => Result<ElicitStep>;
export type GetFirstStep = () => ElicitStep;
export type SubmitAnswer = (
  profile: FounderProfile,
  stepId: StepId,
  rawAnswer: string | string[] | number | boolean,
) => Promise<Result<ElicitResult>>;

/** src/lib/draft.ts */
export type GenerateDraft = (
  profile: FounderProfile,
  grantId: GrantId,
  stageId: string,
) => Promise<Result<DraftResult>>;

/** src/lib/acra.ts — real call, free endpoint, no key. */
export type LookupEntity = (query: string) => Promise<Result<AcraMatch[]>>;

/** src/lib/glossary.ts — static lookup, never a model. */
export type Explain = (term: string) => string | null;

/* ────────────────────────────────────────────────────────────────────────────
   9. CONFIG
   ──────────────────────────────────────────────────────────────────────────── */

export const USE_CACHED_RESPONSES = true as boolean;

/**
 * Canonical screen ids. A owns the components; these ids are the join between
 * A's routes, B's fixtures and C's stage model, so they live here.
 */
export const SCREEN = {
  WELCOME: 'welcome',
  INTAKE: 'intake',
  READINESS_MAP: 'readiness_map',
  GRANT_DETAIL: 'grant_detail',
  DRAFT: 'draft',
  PROFILE_REVIEW: 'profile_review',
} as const;
export type ScreenId = (typeof SCREEN)[keyof typeof SCREEN];

/** Canonical intake order. B's fixtures are named after these, zero-padded. */
export const ELICIT_STEP_ORDER: StepId[] = [
  'who_you_are',       // 01 → founder.full_name, founder.age
  'citizenship',       // 02 → founder.citizenship, founder.is_key_applicant
  'access_needs',      // 03 → founder.access_needs        (optional, UI only)
  'venture_idea',      // 04 → venture.one_liner, venture.problem_statement
  'who_it_helps',      // 05 → impact.beneficiary_group, impact.beneficiary_count_est
  'venture_stage',     // 06 → venture.stage, venture.incorporated, venture.uen
  'founding_history',  // 07 → founder.first_time_founder, .previously_incorporated, .equity_pct
  'support_network',   // 08 → memberships.*, impact.sso_partnership
  'money',             // 09 → funding.*
  'what_you_have',     // 10 → readiness.*
];

/* ────────────────────────────────────────────────────────────────────────────
   10. UTILITY
   ──────────────────────────────────────────────────────────────────────────── */

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
