import type { FounderProfile, GrantId } from '../types/contract';
import { evaluateAll, firstBlocker, terminalReasons } from '../lib/eligibility';
import { RULES } from '../lib/rules';
import StatusBadge from '../components/StatusBadge';
import { useFocusHeading } from '../components/useAnnounce';

/**
 * The readiness map — our single best screen.
 * Owner: A.
 *
 * evaluateAll is a PURE, SYNCHRONOUS function over local JSON. No await, no
 * spinner, no loading state, no useEffect. It cannot fail and it cannot be
 * slow, and it works with the network disconnected. Do not "improve" this by
 * making it async.
 *
 * Every card shows what is already satisfied, not only what is missing. A
 * founder who has been told no by four portals needs to see the green ticks.
 */
export default function ReadinessMap({
  profile,
  onOpenGrant,
  onReview,
  onBackToIntake,
}: {
  profile: FounderProfile;
  onOpenGrant: (id: GrantId) => void;
  onReview: () => void;
  onBackToIntake: () => void;
}) {
  const map = evaluateAll(profile, RULES);
  const headingRef = useFocusHeading<HTMLHeadingElement>('readiness');

  const open = map.results.filter((r) => r.status !== 'not_a_fit').length;
  const unanswered = map.results.reduce((n, r) => Math.max(n, r.unknown_count), 0);

  return (
    <div className="page stack-lg">
      <div className="stack prose">
        <h1 ref={headingRef} tabIndex={-1} style={{ fontSize: '1.9em' }}>
          {open === 0
            ? 'None of these three are open to you right now.'
            : open === map.results.length
              ? 'All three of these are open to you.'
              : `${open} of ${map.results.length} are open to you.`}
        </h1>
        <p className="lede">
          Checked against each funder's own published criteria. Nothing here is a guess —
          if a rule is not on the funder's page, it is not in this list.
        </p>
        {unanswered > 0 && (
          <p className="small">
            Some answers are still missing, so a few results are provisional.{' '}
            <button type="button" className="btn btn-ghost" onClick={onBackToIntake}>
              Answer the rest
            </button>
          </p>
        )}
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '1.25rem' }}>
        {map.results.map((r) => {
          const cls = r.status === 'eligible_now' ? 'is-now' : r.status === 'eligible_after_steps' ? 'is-after' : 'is-not';
          const blocker = firstBlocker(r);
          const reasons = terminalReasons(r);
          return (
            <li key={r.grant_id}>
              <article className={`card grant-card ${cls} stack`}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div style={{ flex: '1 1 20rem' }}>
                    <h2 style={{ fontSize: '1.3em' }}>{r.grant_name}</h2>
                    {r.quantum && <p className="small">{r.quantum}</p>}
                  </div>
                  <StatusBadge status={r.status} />
                </div>

                {/* not_a_fit must always say WHY. A bare red card is the thing
                    the product exists to replace. */}
                {r.status === 'not_a_fit' && reasons.length > 0 && (
                  <div className="notice" style={{ borderLeftColor: 'var(--red-line)', background: 'var(--tint-red)' }}>
                    <p className="notice-title">Why</p>
                    <ul style={{ margin: '0.3rem 0 0', paddingLeft: '1.2rem' }}>
                      {reasons.map((why, i) => <li key={i}>{why}</li>)}
                    </ul>
                  </div>
                )}

                {r.status === 'eligible_after_steps' && r.remedies.length > 0 && (
                  <div>
                    <p className="notice-title" style={{ marginBottom: '0.4rem' }}>
                      {r.remedies.length === 1 ? 'One step to go' : `${r.remedies.length} steps, in this order`}
                    </p>
                    <ol className="steps">
                      {r.remedies.map((rem) => (
                        <li key={rem.order}>
                          {rem.url ? <a href={rem.url} target="_blank" rel="noreferrer">{rem.text}</a> : rem.text}
                          {rem.duration && <span className="dur"> · {rem.duration}</span>}
                        </li>
                      ))}
                    </ol>
                    {blocker && (
                      <p className="small" style={{ marginTop: '0.5rem' }}>
                        The order matters — later steps depend on earlier ones.
                      </p>
                    )}
                  </div>
                )}

                {r.satisfied.length > 0 && (
                  <details>
                    <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
                      {r.satisfied.length} thing{r.satisfied.length === 1 ? '' : 's'} you already meet
                    </summary>
                    <ul className="criteria" style={{ marginTop: '0.6rem' }}>
                      {r.satisfied.map((c) => (
                        <li key={c.field}>
                          <span className="mark mark-met" aria-hidden="true">✓</span>
                          <span><span className="sr-only">Met: </span>{c.label}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}

                {r.warnings.map((w) => (
                  <div className="notice notice-warn" key={w.id} role="note">
                    <p className="notice-title">Worth checking first</p>
                    <p className="small">{w.message}</p>
                    {w.confirm_with_funder && (
                      <p className="small" style={{ marginTop: '0.35rem', fontWeight: 600 }}>
                        We have not confirmed this with the agencies — ask them before you decide.
                      </p>
                    )}
                  </div>
                ))}

                <div className="btn-row">
                  <button type="button" className="btn btn-secondary" onClick={() => onOpenGrant(r.grant_id)}>
                    See the full checklist
                  </button>
                </div>

                <p className="source">
                  Checked against{' '}
                  <a href={r.source_url} target="_blank" rel="noreferrer">the funder's own page</a>{' '}
                  on {r.last_checked}. Confirm with the funder before you rely on it.
                </p>
              </article>
            </li>
          );
        })}
      </ul>

      <div className="btn-row">
        <button type="button" className="btn btn-secondary" onClick={onReview}>
          Review everything we recorded
        </button>
      </div>
    </div>
  );
}
