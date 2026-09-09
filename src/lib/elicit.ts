/**
 * elicit.ts — the conversational intake.
 * Owner: B.
 *
 * CONTEXT.md §7.1: no live model call in the demo. Responses are pre-generated
 * from the real prompt template in /prompts/elicit.txt and committed as fixtures.
 * The live path exists below, behind USE_CACHED_RESPONSES, and is never reached
 * in the demo. No API key exists anywhere in this repo.
 *
 * The honest Q&A line: "The prompts and the pipeline are real. The outputs are
 * pre-generated so the demo doesn't depend on venue wifi. Live wiring is one flag."
 */

import type { ElicitResult, ElicitStep, Result, StepId } from '../types/contract';
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

/**
 * Process the founder's answer and hand back a sparse patch.
 *
 * `rawAnswer` is accepted and ignored in cached mode — the fixture is keyed on the
 * step, not the input. That is deliberate: the demo must produce the same screen
 * every time. Do not "improve" this by branching on the input.
 */
export async function submitAnswer(
  _profile: unknown,
  stepId: StepId,
  _rawAnswer: string | string[] | number | boolean,
): Promise<Result<ElicitResult>> {
  if (!USE_CACHED_RESPONSES) return submitAnswerLive(stepId);

  await new Promise((res) => setTimeout(res, FAKE_LATENCY_MS));

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
