import type { EligibilityStatus } from '../types/contract';
import { STATUS_LABEL } from '../lib/eligibility';

/**
 * Status is signalled three ways at once — colour, glyph and word — so it
 * survives colour blindness, a projector with bad colour, and a screen reader.
 * Never reduce this to a coloured dot.
 */
const GLYPH: Record<EligibilityStatus, string> = {
  eligible_now: '✓',
  eligible_after_steps: '→',
  not_a_fit: '✕',
};

const CLASS: Record<EligibilityStatus, string> = {
  eligible_now: 'status-now',
  eligible_after_steps: 'status-after',
  not_a_fit: 'status-not',
};

export default function StatusBadge({ status }: { status: EligibilityStatus }) {
  return (
    <span className={`status ${CLASS[status]}`}>
      <span className="glyph" aria-hidden="true">{GLYPH[status]}</span>
      {STATUS_LABEL[status]}
    </span>
  );
}
