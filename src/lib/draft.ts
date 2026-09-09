/**
 * draft.ts — funder-formatted answers with visible gap flags.
 * Owner: B.
 *
 * Same rule as elicit.ts: pre-generated from /prompts/draft.txt, no live call.
 *
 * The gap flags are not decoration. CONTEXT.md §4: "Every output has a visible
 * seam showing what came from the founder versus what was estimated." If A stops
 * rendering `gaps`, we lose the line we answer half of Q&A with.
 */

import type { DraftResult, FounderProfile, GrantId, Result } from '../types/contract';
import { USE_CACHED_RESPONSES } from '../types/contract';

import vfgStage1 from '../../fixtures/responses/draft-raise-vfg-youth-stage_1.json';

const FAKE_LATENCY_MS = 900;

const DRAFTS: Record<string, DraftResult> = {
  'raise-vfg-youth::stage_1_submit': vfgStage1 as unknown as DraftResult,
};

const key = (grantId: GrantId, stageId: string) => `${grantId}::${stageId}`;

export async function generateDraft(
  _profile: FounderProfile,
  grantId: GrantId,
  stageId: string,
): Promise<Result<DraftResult>> {
  if (!USE_CACHED_RESPONSES) {
    return {
      ok: false,
      error: {
        code: 'UNKNOWN',
        message: "We're running in offline mode right now.",
        detail: 'Live drafting is not wired in the client by design. See /prompts/draft.txt.',
      },
    };
  }

  await new Promise((res) => setTimeout(res, FAKE_LATENCY_MS));

  const cached = DRAFTS[key(grantId, stageId)];
  if (!cached) {
    return {
      ok: false,
      error: {
        code: 'FIXTURE_MISSING',
        message: "We haven't built the draft for this stage yet.",
        detail: `No fixture for ${key(grantId, stageId)}. Add fixtures/responses/draft-${grantId}-${stageId}.json`,
      },
    };
  }
  return { ok: true, data: cached };
}

/** Which grant+stage pairs actually have a draft. Lets A disable the button rather than fail on click. */
export function hasDraft(grantId: GrantId, stageId: string): boolean {
  return key(grantId, stageId) in DRAFTS;
}

/**
 * Split a section's text into runs so A can render highlights without doing
 * offset arithmetic in JSX:
 *
 *   {segments(section).map(s =>
 *     s.gap ? <mark title={s.gap.note}>{s.text}</mark> : <span>{s.text}</span>)}
 */
export function segments(section: DraftResult['sections'][number]) {
  const sorted = [...section.gaps].sort((a, b) => a.start - b.start);
  const out: Array<{ text: string; gap: (typeof sorted)[number] | null }> = [];
  let cursor = 0;

  for (const gap of sorted) {
    if (gap.start < cursor || gap.start > section.text.length) continue; // ignore overlaps / bad offsets
    if (gap.start > cursor) out.push({ text: section.text.slice(cursor, gap.start), gap: null });
    out.push({ text: section.text.slice(gap.start, gap.end), gap });
    cursor = gap.end;
  }
  if (cursor < section.text.length) out.push({ text: section.text.slice(cursor), gap: null });
  return out;
}

/** Rough word count, for "247 / 300 words" under a section. */
export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
