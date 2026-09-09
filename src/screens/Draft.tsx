import { useEffect, useState } from 'react';
import type { DraftResult, FounderProfile, GrantId } from '../types/contract';
import { generateDraft, wordCount } from '../lib/draft';
import GapText from '../components/GapText';
import { useFocusHeading } from '../components/useAnnounce';

/**
 * The draft, with its seams showing.
 * Owner: A.
 *
 * A founder should never be able to send our estimate believing they wrote it.
 * Everything the system supplied rather than heard is highlighted, underlined,
 * marked with a flag glyph, announced to screen readers, and counted at the top
 * of the page. That redundancy is deliberate — CONTEXT.md §4 calls this the
 * visible seam, and it is the single claim we most need to be true.
 */
export default function Draft({
  profile,
  grantId,
  onBack,
}: {
  profile: FounderProfile;
  grantId: GrantId;
  onBack: () => void;
}) {
  const [draft, setDraft] = useState<DraftResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const headingRef = useFocusHeading<HTMLHeadingElement>(grantId);

  useEffect(() => {
    let live = true;
    void generateDraft(profile, grantId, 'stage_1_submit').then((res) => {
      if (!live) return;
      if (res.ok) setDraft(res.data);
      else setError(res.error.message);
    });
    return () => { live = false; };
  }, [profile, grantId]);

  const gapCount = draft?.sections.reduce((n, s) => n + s.gaps.length, 0) ?? 0;

  return (
    <div className="page-narrow stack-lg">
      <button type="button" className="btn btn-ghost" onClick={onBack}>← Back to the checklist</button>

      <div className="stack">
        <h1 ref={headingRef} tabIndex={-1} style={{ fontSize: '1.8em' }}>
          Your first draft
        </h1>
        <p className="lede">
          Written from your answers, in the funder's own format. Nothing here has been sent
          anywhere, and nothing will be until you say so.
        </p>
      </div>

      {error && <div className="notice notice-warn" role="alert"><p>{error}</p></div>}

      {!draft && !error && <p role="status" aria-live="polite">Putting your answers into their format…</p>}

      {draft && (
        <>
          <div className="notice notice-warn">
            <p className="notice-title">
              {gapCount === 0
                ? 'Everything below came from you'
                : `${gapCount} thing${gapCount === 1 ? '' : 's'} here came from us, not from you`}
            </p>
            <p className="small">
              Highlighted text is our estimate. Check each one before this goes near a funder —
              it will carry your name, not ours.
            </p>
            <p className="seam-key" style={{ marginTop: '0.6rem' }}>
              <span><mark className="gap">highlighted</mark> = we estimated it</span>
              <span>plain text = your own words</span>
            </p>
          </div>

          {draft.sections.map((sec) => (
            <section className="card stack" key={sec.funder_question}>
              <div>
                <h2 style={{ fontSize: '1.15em' }}>{sec.funder_question}</h2>
                {/* Plain language sits ALONGSIDE the funder's wording, never
                    replacing it — she has to recognise it on the real form. */}
                <p className="small">In plain words: {sec.plain_question}</p>
              </div>

              <GapText section={sec} />

              <p className="small">
                {wordCount(sec.text)}
                {sec.word_limit ? ` of ${sec.word_limit} words` : ' words'}
                {sec.gaps.length > 0 && ` · ${sec.gaps.length} flagged`}
              </p>
            </section>
          ))}

          <div className="card card-flat stack">
            <p className="notice-title">Before this goes anywhere</p>
            <ul className="criteria">
              <li><span className="mark mark-unknown" aria-hidden="true">1</span><span>Read every highlighted phrase and correct or confirm it.</span></li>
              <li><span className="mark mark-unknown" aria-hidden="true">2</span><span>Change anything that does not sound like you. It is your application.</span></li>
              <li><span className="mark mark-unknown" aria-hidden="true">3</span><span>We never submit on your behalf — you send it yourself, when you are ready.</span></li>
            </ul>
          </div>

          <p className="source">
            {draft.from_live_model
              ? 'Generated live.'
              : 'Pre-generated for this prototype so the demo does not depend on the venue network. The eligibility engine behind the previous screen is live and runs offline.'}
          </p>
        </>
      )}
    </div>
  );
}
