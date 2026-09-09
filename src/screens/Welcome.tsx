import type { FounderProfile } from '../types/contract';
import { createEmptyProfile, applyElicitResult } from '../lib/profile';
import { getAllSteps } from '../lib/elicit';
import cached from '../../fixtures/responses/elicit-01-who_you_are.json';
import c2 from '../../fixtures/responses/elicit-02-citizenship.json';
import c3 from '../../fixtures/responses/elicit-03-access_needs.json';
import c4 from '../../fixtures/responses/elicit-04-venture_idea.json';
import c5 from '../../fixtures/responses/elicit-05-who_it_helps.json';
import type { ElicitResult } from '../types/contract';

/**
 * The demo opens mid-conversation on purpose (CONTEXT.md §9) — typing five
 * answers live burns half the 90 seconds. "Pick up Ren's session" replays the
 * first five cached answers instantly and drops you at question six.
 */
function seedMidConversation(): FounderProfile {
  const first5 = [cached, c2, c3, c4, c5] as unknown as ElicitResult[];
  return first5.reduce<FounderProfile>((p, r) => applyElicitResult(p, r), createEmptyProfile());
}

export default function Welcome({
  hasSaved,
  onStart,
  onResume,
  onSeed,
}: {
  hasSaved: boolean;
  onStart: () => void;
  onResume: () => void;
  onSeed: (p: FounderProfile) => void;
}) {
  return (
    <div className="page-narrow stack-lg">
      <div className="stack">
        <h1 style={{ fontSize: '2.2em' }}>
          Find out what you qualify for before you spend the hours.
        </h1>
        <p className="lede">
          Most funding applications assume you already have a company, a pitch deck and
          two years of accounts. If you have none of that yet, this is for you. Answer
          questions one at a time, out loud if you prefer, and we will tell you which
          schemes are open to you and exactly what stands in the way.
        </p>

        <div className="btn-row" style={{ marginTop: '0.5rem' }}>
          <button type="button" className="btn" onClick={onStart}>
            Start — {getAllSteps().length} questions
          </button>
          {hasSaved && (
            <button type="button" className="btn btn-secondary" onClick={onResume}>
              Pick up where I left off
            </button>
          )}
        </div>

        <p className="small">
          Nothing is submitted anywhere. Your answers stay in this browser, and you can
          stop and come back whenever you like — there is no time limit on any screen.
        </p>
      </div>

      <div className="card card-flat">
        <p className="notice-title">Demo shortcut</p>
        <p className="small" style={{ marginBottom: '0.9rem' }}>
          Loads Ren's first five answers and drops you at question six, mid-conversation.
        </p>
        <button type="button" className="btn btn-secondary" onClick={() => onSeed(seedMidConversation())}>
          Pick up Ren's session
        </button>
      </div>
    </div>
  );
}
