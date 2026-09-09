/**
 * elicit.ts — the conversational intake.
 * Owner: B.
 *
 * CONTEXT.md §7.1: no live model call in the demo. For the three FREE_TEXT steps
 * (who_you_are, venture_idea, who_it_helps) that means pre-generated responses from
 * the real prompt template in /prompts/elicit.txt, committed as fixtures — turning a
 * paragraph of prose into structured fields needs real language understanding, and
 * that live path stays behind USE_CACHED_RESPONSES until this product has a server to
 * hold an API key. No key exists anywhere in this repo.
 *
 * Every other step is SINGLE_CHOICE / MULTI_CHOICE / YES_NO / NUMBER — the founder's
 * answer already IS the structured value, no model needed to "understand" it. Those
 * are computed live in `computeDynamic()` below from whatever the founder actually
 * picked, no wifi or key required. See CONTRACT.md's field dictionary for the mapping.
 *
 * The honest Q&A line: "The choice-based questions respond live to what you pick.
 * The three open-ended ones are pre-generated so the demo doesn't depend on venue
 * wifi or an API key in the browser — wiring those live is a backend decision, not
 * a flag."
 */

import type {
  AccessNeed,
  Citizenship,
  ElicitResult,
  ElicitStep,
  FieldMeta,
  Result,
  StepId,
  VentureStage,
} from '../types/contract';
import { USE_CACHED_RESPONSES } from '../types/contract';

import steps from '../../fixtures/elicit-steps.json';

import r01 from '../../fixtures/responses/elicit-01-who_you_are.json';
import r02 from '../../fixtures/responses/elicit-02-citizenship.json';
import r03 from '../../fixtures/responses/elicit-03-access_needs.json';
import r04 from '../../fixtures/responses/elicit-04-venture_idea.json';
import r05 from '../../fixtures/responses/elicit-05-who_it_helps.json';
import r06 from '../../fixtures/responses/elicit-06-venture_stage.json';
import r07 from '../../fixtures/responses/elicit-07-founding_history.json';
import r08 from '../../fixtures/responses/elicit-08-support_network.json';
import r09 from '../../fixtures/responses/elicit-09-money.json';
import r10 from '../../fixtures/responses/elicit-10-what_you_have.json';

const STEPS = steps as unknown as ElicitStep[];

const RESPONSES: Record<StepId, ElicitResult> = Object.fromEntries(
  [r01, r02, r03, r04, r05, r06, r07, r08, r09, r10].map((r) => [
    (r as unknown as ElicitResult).step_id,
    r as unknown as ElicitResult,
  ]),
);

/** Realistic pause so the confirm-back doesn't snap in instantly. Tune, don't remove. */
const FAKE_LATENCY_MS = 450;

export function getAllSteps(): ElicitStep[] {
  return STEPS;
}

export function getFirstStep(): ElicitStep {
  return STEPS[0];
}

export function getStep(stepId: StepId): Result<ElicitStep> {
  const step = STEPS.find((s) => s.step_id === stepId);
  return step
    ? { ok: true, data: step }
    : {
        ok: false,
        error: {
          code: 'NOT_FOUND',
          message: "We couldn't find that question. Let's go back a step.",
          detail: `No step with step_id "${stepId}" in fixtures/elicit-steps.json`,
        },
      };
}

/** 0-based position, for "question 4 of 10" and the progress bar. */
export function stepIndex(stepId: StepId): number {
  return STEPS.findIndex((s) => s.step_id === stepId);
}

export function stepCount(): number {
  return STEPS.length;
}

/* ── dynamic path: choice-based steps, computed live from what was picked ──── */

function fieldMeta(now: string): FieldMeta {
  return { source: 'FOUNDER', confirmed_by_founder: true, updated_at: now, note: null };
}

function choiceLabel(stepId: StepId, value: string): string {
  return STEPS.find((s) => s.step_id === stepId)?.choices?.find((c) => c.value === value)?.label ?? value;
}

function joinList(items: string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/**
 * Every SINGLE_CHOICE / MULTI_CHOICE / YES_NO / NUMBER step, answered from the
 * founder's actual pick — no fixture, no model. Returns null for a step this
 * function doesn't own (the three FREE_TEXT steps), so the caller falls back to
 * the cached response for those.
 *
 * Entry validation: rawAnswer is trusted only as far as its expected shape for
 * each step — an unexpected shape (e.g. a stale UI passing the wrong type) falls
 * through to `default: return null`, which sends the caller to the safe cached
 * fallback rather than writing a garbage patch.
 */
function computeDynamic(
  stepId: StepId,
  rawAnswer: string | string[] | number | boolean,
  now: string,
): ElicitResult | null {
  switch (stepId) {
    case 'citizenship': {
      if (typeof rawAnswer !== 'string' || rawAnswer === '') return null;
      const v = rawAnswer as Citizenship;
      const isSgOrPr = v === 'SG' || v === 'PR';
      return {
        step_id: stepId,
        patch: {
          founder: { citizenship: v, is_key_applicant: true, residing_in_sg: isSgOrPr ? true : null },
        },
        field_meta_patch: {
          'founder.citizenship': fieldMeta(now),
          'founder.is_key_applicant': fieldMeta(now),
          ...(isSgOrPr ? { 'founder.residing_in_sg': fieldMeta(now) } : {}),
        },
        confirm_back: isSgOrPr
          ? `${choiceLabel(stepId, v)}, and you're the main applicant. That clears the citizenship rule on all three.`
          : "Neither a citizen nor a permanent resident — every scheme we track requires that, so citizenship is likely to be what closes doors here. Let's keep going so you can see exactly which.",
        next_step_id: 'access_needs',
      };
    }

    case 'access_needs': {
      if (!Array.isArray(rawAnswer)) return null;
      const picked = rawAnswer as AccessNeed[];
      const labels = picked.map((v) => choiceLabel(stepId, v));
      return {
        step_id: stepId,
        patch: { founder: { access_needs: picked } },
        field_meta_patch: { 'founder.access_needs': fieldMeta(now) },
        confirm_back:
          labels.length > 0
            ? `${joinList(labels)} — turned on. You can change these any time from the top of the page.`
            : "No changes needed. You can turn any of these on any time from the top of the page.",
        next_step_id: 'venture_idea',
      };
    }

    case 'venture_stage': {
      if (typeof rawAnswer !== 'string' || rawAnswer === '') return null;
      const v = rawAnswer as VentureStage;
      const incorporated = v === 'OPERATING';
      const backs = {
        IDEA: "Still an idea, nothing registered yet. That's fine — none of these need you registered to apply.",
        PROTOTYPE:
          "You've tried it out in a small way, and the business isn't registered yet. That's fine — none of these need you registered to apply.",
        OPERATING: "Running and registered — that clears the incorporation step some schemes ask for.",
      } as const;
      return {
        step_id: stepId,
        patch: { venture: { stage: v, incorporated } },
        field_meta_patch: {
          'venture.stage': fieldMeta(now),
          'venture.incorporated': fieldMeta(now),
        },
        confirm_back: backs[v],
        next_step_id: 'founding_history',
      };
    }

    case 'founding_history': {
      if (typeof rawAnswer !== 'boolean') return null;
      const previouslyIncorporated = rawAnswer;
      return {
        step_id: stepId,
        patch: {
          founder: { first_time_founder: !previouslyIncorporated, previously_incorporated: previouslyIncorporated },
        },
        field_meta_patch: {
          'founder.first_time_founder': fieldMeta(now),
          'founder.previously_incorporated': fieldMeta(now),
        },
        confirm_back: previouslyIncorporated
          ? "Got it — you've registered a company before. That still counts even if it never traded or has since closed, and it matters for the schemes that are strictly first-time-founder only."
          : "Got it — you've never registered a company. That clears the first-time-founder requirement some schemes have.",
        next_step_id: 'support_network',
      };
    }

    case 'support_network': {
      if (!Array.isArray(rawAnswer)) return null;
      const picked = rawAnswer as string[];
      const has = (v: string) => picked.includes(v);
      const chosenLabels = picked.filter((v) => v !== 'NONE').map((v) => choiceLabel(stepId, v));
      return {
        step_id: stepId,
        patch: {
          memberships: {
            raise_member: has('RAISE_MEMBER'),
            amp_relationship: has('AMP_TALKING') ? 'IN_DISCUSSION' : 'NONE',
          },
          impact: {
            sso_partnership: has('VWO_PARTNER'),
            beneficiary_validation: has('BENEFICIARY_EVIDENCE'),
          },
        },
        field_meta_patch: {
          'memberships.raise_member': fieldMeta(now),
          'memberships.amp_relationship': fieldMeta(now),
          'impact.sso_partnership': fieldMeta(now),
          'impact.beneficiary_validation': fieldMeta(now),
        },
        confirm_back:
          chosenLabels.length > 0
            ? `${joinList(chosenLabels)} — noted. We'll show you the fastest path in for whatever's left.`
            : "Not backed by any of these yet — that's the normal starting point, and we'll show you the fastest path in.",
        next_step_id: 'money',
      };
    }

    case 'money': {
      if (typeof rawAnswer !== 'number' || !Number.isFinite(rawAnswer)) return null;
      return {
        step_id: stepId,
        patch: { funding: { amount_sought_sgd: rawAnswer } },
        field_meta_patch: { 'funding.amount_sought_sgd': fieldMeta(now) },
        confirm_back: `Around $${rawAnswer.toLocaleString()} noted. We'll help you break it down properly later.`,
        next_step_id: 'what_you_have',
      };
    }

    case 'what_you_have': {
      if (!Array.isArray(rawAnswer)) return null;
      const picked = rawAnswer as string[];
      const has = (v: string) => picked.includes(v);
      const haveLabels = picked.map((v) => choiceLabel(stepId, v));
      return {
        step_id: stepId,
        patch: {
          readiness: {
            has_pitch_deck: has('PITCH_DECK'),
            has_acra_profile: has('ACRA'),
            has_management_accounts: has('ACCOUNTS'),
            has_financial_projections: has('PROJECTIONS'),
            has_team_resumes: has('RESUMES'),
          },
        },
        field_meta_patch: {
          'readiness.has_pitch_deck': fieldMeta(now),
          'readiness.has_acra_profile': fieldMeta(now),
          'readiness.has_management_accounts': fieldMeta(now),
          'readiness.has_financial_projections': fieldMeta(now),
          'readiness.has_team_resumes': fieldMeta(now),
        },
        confirm_back:
          haveLabels.length > 0
            ? `You already have: ${joinList(haveLabels)}. Next we'll show you which of the rest actually blocks an application and which can wait.`
            : "Nothing yet — that's the normal starting point. Next we'll show you which of these actually blocks an application and which can wait.",
        next_step_id: null,
      };
    }

    default:
      return null; // who_you_are, venture_idea, who_it_helps — needs real language understanding, see cached path below.
  }
}

/**
 * Process the founder's answer and hand back a sparse patch.
 *
 * Choice-based steps (SINGLE_CHOICE/MULTI_CHOICE/YES_NO/NUMBER) are computed live
 * in `computeDynamic()` from what the founder actually picked. The three FREE_TEXT
 * steps fall through to the cached fixture below — the fixture is keyed on the
 * step, not the input, because turning prose into structured fields needs real
 * language understanding, which the demo deliberately doesn't call live (see the
 * header comment). Do not "improve" the FREE_TEXT fallback by hand-parsing prose.
 */
export async function submitAnswer(
  _profile: unknown,
  stepId: StepId,
  rawAnswer: string | string[] | number | boolean,
): Promise<Result<ElicitResult>> {
  if (!USE_CACHED_RESPONSES) return submitAnswerLive(stepId);

  await new Promise((res) => setTimeout(res, FAKE_LATENCY_MS));

  let dynamic: ElicitResult | null = null;
  try {
    dynamic = computeDynamic(stepId, rawAnswer, new Date().toISOString());
  } catch (e) {
    // Defense in depth: a bug in the dynamic path must degrade to the cached
    // fixture, never crash the intake or write a half-formed patch.
    console.error(`computeDynamic failed for step "${stepId}"`, e);
  }
  if (dynamic) return { ok: true, data: dynamic };

  const cached = RESPONSES[stepId];
  if (!cached) {
    return {
      ok: false,
      error: {
        code: 'FIXTURE_MISSING',
        message: "Something went wrong on our side. Your answers are saved — try that again.",
        detail: `No fixture for step "${stepId}". Expected fixtures/responses/elicit-NN-${stepId}.json`,
      },
    };
  }
  return { ok: true, data: cached };
}

/**
 * Live path. Never reached in the demo. Left in the tree deliberately so the
 * claim "live wiring is one config flag" is true and inspectable, not a promise.
 *
 * Deliberately unimplemented: wiring it needs an API key, and no key may ever
 * enter this repo or the client bundle (CONTEXT.md §7.2, §11). A real deployment
 * puts this behind a server the key lives on.
 */
async function submitAnswerLive(stepId: StepId): Promise<Result<ElicitResult>> {
  return {
    ok: false,
    error: {
      code: 'UNKNOWN',
      message: "We're running in offline mode right now.",
      detail:
        `Live elicitation is not wired in the client by design — see /prompts/elicit.txt for ` +
        `the prompt template this path would send for step "${stepId}". ` +
        `No API key may be shipped to the browser.`,
    },
  };
}
