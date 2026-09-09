import type { CriterionResult, FounderProfile, GrantId } from '../types/contract';
import { evaluateGrant, terminalReasons } from '../lib/eligibility';
import { ruleById } from '../lib/rules';
import { hasDraft } from '../lib/draft';
import StatusBadge from '../components/StatusBadge';
import { useFocusHeading } from '../components/useAnnounce';
import { humanise } from '../components/display';

/**
 * Every criterion, with the founder's own answer next to it.
 * Owner: A.
 *
 * The point of this screen is auditability: a founder can see exactly which
 * rule decided their result, what we think their answer was, and where the rule
 * came from. Nothing is hidden behind "you are not eligible".
 */

function Row({ c }: { c: CriterionResult }) {
  const mark =
    c.outcome === 'MET' ? { glyph: '✓', cls: 'mark-met', word: 'Met' }
    : c.outcome === 'UNKNOWN' ? { glyph: '?', cls: 'mark-unknown', word: 'Not answered yet' }
    : c.terminal ? { glyph: '✕', cls: 'mark-fatal', word: 'Not met, and cannot be fixed' }
    : { glyph: '!', cls: 'mark-unmet', word: 'Not met yet' };

  const shown = c.actual === null || c.actual === undefined ? null : humanise(c.actual, c.field);

  return (
    <li>
      <span className={`mark ${mark.cls}`} aria-hidden="true">{mark.glyph}</span>
      <span>
        <span className="sr-only">{mark.word}: </span>
        {c.label}
        {shown !== null && <span className="muted"> — you said {shown}</span>}
        {!c.blocking && <span className="muted"> · advisory only</span>}
        {c.outcome === 'UNMET' && c.remedy && (
          <span style={{ display: 'block' }} className="small">
            Fix: {c.remedy}{c.remedy_duration ? ` · ${c.remedy_duration}` : ''}
          </span>
        )}
        {c.outcome === 'UNMET' && c.terminal && c.terminal_reason && (
          <span style={{ display: 'block' }} className="small">{c.terminal_reason}</span>
        )}
      </span>
    </li>
  );
}

export default function GrantDetail({
  profile,
  grantId,
  onBack,
  onDraft,
}: {
  profile: FounderProfile;
  grantId: GrantId;
  onBack: () => void;
  onDraft: () => void;
}) {
  const headingRef = useFocusHeading<HTMLHeadingElement>(grantId);
  const rule = ruleById(grantId);
  if (!rule) {
    return (
      <div className="page-narrow stack">
        <p>We could not find that scheme.</p>
        <button type="button" className="btn" onClick={onBack}>Back to the map</button>
      </div>
    );
  }

  const r = evaluateGrant(profile, rule);
  const scored = r.criteria.filter((c) => c.outcome !== 'SKIPPED');
  const blocking = scored.filter((c) => c.blocking);
  const advisory = scored.filter((c) => !c.blocking);
  const reasons = terminalReasons(r);

  return (
    <div className="page-narrow stack-lg">
      <button type="button" className="btn btn-ghost" onClick={onBack}>← Back to all schemes</button>

      <div className="stack">
        <h1 ref={headingRef} tabIndex={-1} style={{ fontSize: '1.8em' }}>{r.grant_name}</h1>
        <StatusBadge status={r.status} />
        {r.quantum && <p className="small">{r.quantum}</p>}
      </div>

      {r.status === 'not_a_fit' && reasons.length > 0 && (
        <div className="notice" style={{ borderLeftColor: 'var(--red-line)', background: 'var(--tint-red)' }}>
          <p className="notice-title">Why this one is closed to you</p>
          <ul style={{ margin: '0.3rem 0 0', paddingLeft: '1.2rem' }}>
            {reasons.map((why, i) => <li key={i}>{why}</li>)}
          </ul>
          <p className="small" style={{ marginTop: '0.6rem' }}>
            This is worth knowing now rather than after months of work. The other schemes
            on your map do not have this rule.
          </p>
        </div>
      )}

      {r.remedies.length > 0 && (
        <div className="card stack">
          <h2 style={{ fontSize: '1.15em' }}>What to do, in order</h2>
          <ol className="steps">
            {r.remedies.map((rem) => (
              <li key={rem.order}>
                {rem.url ? <a href={rem.url} target="_blank" rel="noreferrer">{rem.text}</a> : rem.text}
                {rem.duration && <span className="dur"> · {rem.duration}</span>}
              </li>
            ))}
          </ol>
          <p className="small">
            Do these in the order shown. Later steps depend on earlier ones — applying for
            membership before the business is registered will simply be refused.
          </p>
        </div>
      )}

      <div className="card stack">
        <h2 style={{ fontSize: '1.15em' }}>Every rule, and where you stand</h2>
        <ul className="criteria">{blocking.map((c) => <Row c={c} key={c.field} />)}</ul>

        {advisory.length > 0 && (
          <>
            <h3 style={{ fontSize: '1em', marginTop: '0.75rem' }}>Helpful, but not required</h3>
            <ul className="criteria">{advisory.map((c) => <Row c={c} key={c.field} />)}</ul>
          </>
        )}
      </div>

      {rule.required_documents && rule.required_documents.length > 0 && (
        <div className="card card-flat stack">
          <h2 style={{ fontSize: '1.15em' }}>What they ask you to send</h2>
          <ul className="criteria">
            {rule.required_documents.map((d) => (
              <li key={d}><span className="mark mark-unknown" aria-hidden="true">•</span><span>{d}</span></li>
            ))}
          </ul>
          <p className="small">
            Most first-time founders have none of these. Having none of them does not
            disqualify you — it just tells you what to build next.
          </p>
        </div>
      )}

      {hasDraft(grantId, 'stage_1_submit') && (
        <div className="btn-row">
          <button type="button" className="btn" onClick={onDraft}>
            Start a draft for this scheme
          </button>
        </div>
      )}

      <p className="source">
        Rules read from <a href={r.source_url} target="_blank" rel="noreferrer">{r.source_url}</a> on{' '}
        {r.last_checked}. Confidence: {r.confidence}. Always confirm with the funder before you rely on it.
      </p>
    </div>
  );
}
