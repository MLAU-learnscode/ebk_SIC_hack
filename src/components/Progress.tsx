/**
 * Progress through intake. Deliberately shows "question N of M" as text as well
 * as a bar — a bar alone tells a screen-reader user nothing useful, and tells a
 * nervous founder nothing about how much is left.
 */
export default function Progress({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="progress">
      <span className="small" style={{ whiteSpace: 'nowrap' }}>
        Question {current} of {total}
      </span>
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label={`Question ${current} of ${total}`}
      >
        <div className="progress-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
