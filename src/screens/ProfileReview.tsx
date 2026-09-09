import type { FieldPath, FounderProfile } from '../types/contract';
import { isGapFlagged, listGaps, confirmFields } from '../lib/profile';
import { useFocusHeading } from '../components/useAnnounce';
import { humanise, SOURCE_WORD } from '../components/display';

/**
 * Everything we recorded, and where each piece came from.
 * Owner: A.
 *
 * This screen is the provenance ledger. A founder can see, field by field,
 * whether a value is their own words, our rephrasing, or our estimate — and
 * confirm the ones we guessed. It is also the answer to "what does the AI
 * actually do here": every AI_EXTRACTED and AI_ESTIMATED row on this page.
 */

const LABELS: Record<string, string> = {
  'founder.full_name': 'Your name',
  'founder.age': 'Your age',
  'founder.citizenship': 'Citizenship',
  'founder.is_key_applicant': 'You are the main applicant',
  'founder.residing_in_sg': 'Living in Singapore',
  'founder.first_time_founder': 'First business',
  'founder.previously_incorporated': 'Registered a company before',
  'founder.equity_pct': 'Share of the business you hold',
  'founder.access_needs': 'How you want the page to work',
  'venture.name': 'Business name',
  'venture.one_liner': 'One-line description',
  'venture.problem_statement': 'The problem you are solving',
  'venture.stage': 'How far along you are',
  'venture.incorporated': 'Registered with ACRA',
  'venture.project_duration_months': 'Length of your first phase',
  'impact.beneficiary_group': 'Who you help',
  'impact.beneficiary_count_est': 'How many people you help',
  'impact.impact_description': 'What changes for them',
  'impact.beneficiary_validation': 'You can show who you help',
  'impact.sso_partnership': 'A VWO partners with you',
  'memberships.raise_member': 'raiSE member',
  'memberships.amp_relationship': 'Mentor partner',
  'memberships.amp_name': 'Which mentor partner',
  'funding.amount_sought_sgd': 'How much you need',
  'funding.other_govt_funding': 'Had other government funding',
  'funding.can_match_capital_sgd': 'Money of your own you can put in',
  'readiness.has_pitch_deck': 'Pitch deck',
  'readiness.has_acra_profile': 'ACRA profile',
  'readiness.has_management_accounts': 'Management accounts',
  'readiness.has_financial_projections': 'Financial projections',
  'readiness.has_team_resumes': 'Team CVs',
  'readiness.team_size': 'People on the team',
};



function readValue(profile: FounderProfile, path: FieldPath): string {
  const v = path.split('.').reduce<unknown>(
    (n, k) => (n && typeof n === 'object' ? (n as Record<string, unknown>)[k] : undefined),
    profile.answers,
  );
  return humanise(v, path);
}

export default function ProfileReview({
  profile,
  onProfile,
  onBack,
}: {
  profile: FounderProfile;
  onProfile: (p: FounderProfile) => void;
  onBack: () => void;
}) {
  const headingRef = useFocusHeading<HTMLHeadingElement>('review');
  const paths = Object.keys(profile.field_meta);
  const gaps = listGaps(profile);

  return (
    <div className="page-narrow stack-lg">
      <button type="button" className="btn btn-ghost" onClick={onBack}>← Back to all schemes</button>

      <div className="stack">
        <h1 ref={headingRef} tabIndex={-1} style={{ fontSize: '1.8em' }}>
          Everything we recorded
        </h1>
        <p className="lede">
          Every answer, and where it came from. Anything we worked out ourselves is marked,
          so you always know which parts are yours.
        </p>
      </div>

      {gaps.length > 0 && (
        <div className="notice notice-warn">
          <p className="notice-title">{gaps.length} need{gaps.length === 1 ? 's' : ''} your eye</p>
          <p className="small">
            These are things we estimated or rephrased and you have not confirmed yet.
            They stay flagged in every draft until you do.
          </p>
          <div className="btn-row" style={{ marginTop: '0.7rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => onProfile(confirmFields(profile, gaps))}
            >
              I have read them all — mark as checked
            </button>
          </div>
        </div>
      )}

      {paths.length === 0 && <p className="muted">Nothing recorded yet.</p>}

      <div className="card stack">
        {paths.map((p) => {
          const meta = profile.field_meta[p];
          const flagged = isGapFlagged(profile, p);
          return (
            <div
              key={p}
              style={{
                display: 'grid',
                gap: '0.15rem 1rem',
                gridTemplateColumns: '1fr',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'baseline', flexWrap: 'wrap' }}>
                <strong>{LABELS[p] ?? p}</strong>
                {flagged && (
                  <span className="status status-after" style={{ fontSize: '0.72em' }}>
                    <span className="glyph" aria-hidden="true">⚑</span>
                    needs checking
                  </span>
                )}
              </div>
              <div>{readValue(profile, p)}</div>
              <div className="small">
                {SOURCE_WORD[meta.source] ?? meta.source}
                {meta.note ? ` · ${meta.note}` : ''}
              </div>
            </div>
          );
        })}
      </div>

      <p className="source">
        Kept in this browser only. Nothing is uploaded, and clearing your browser data
        removes it.
      </p>
    </div>
  );
}
