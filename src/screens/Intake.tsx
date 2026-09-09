import { useMemo, useState } from 'react';
import type { ElicitResult, ElicitStep, FounderProfile } from '../types/contract';
import { getFirstStep, getStep, submitAnswer, stepIndex, stepCount } from '../lib/elicit';
import { applyElicitResult, confirmFields } from '../lib/profile';
import { lookup } from '../lib/glossary';
import Progress from '../components/Progress';
import VoiceInput from '../components/VoiceInput';
import { useFocusHeading } from '../components/useAnnounce';

/**
 * Intake — one question per screen.
 * Owner: A.
 *
 * The three things this screen exists to do, in order of how much they matter:
 *
 *  1. ONE QUESTION AT A TIME. A form with twenty fields is a wall. Twenty
 *     screens with one field each is a conversation, and it is navigable by
 *     keyboard, by screen reader, and by someone whose attention is going.
 *  2. SAY IT BACK. After every answer we repeat what we understood and wait
 *     for a yes. That is the confirm-back loop from CONTEXT.md §4, and it is
 *     the difference between a founder correcting us now and a funder reading
 *     our guess later.
 *  3. NEVER RUSH. No timers, no auto-advance, no disabled back button.
 */

type Phase = { kind: 'asking' } | { kind: 'confirming'; result: ElicitResult };

export default function Intake({
  profile,
  onProfile,
  onDone,
}: {
  profile: FounderProfile;
  onProfile: (p: FounderProfile) => void;
  onDone: () => void;
}) {
  const step: ElicitStep = useMemo(() => {
    const id = profile.elicit_progress?.current_step_id;
    if (!id) return getFirstStep();
    const s = getStep(id);
    return s.ok ? s.data : getFirstStep();
  }, [profile.elicit_progress?.current_step_id]);

  const [phase, setPhase] = useState<Phase>({ kind: 'asking' });
  const [text, setText] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const headingRef = useFocusHeading<HTMLHeadingElement>(`${step.step_id}-${phase.kind}`);
  const index = stepIndex(step.step_id);

  function reset() {
    setText('');
    setPicked([]);
    setError(null);
  }

  async function send() {
    setBusy(true);
    setError(null);
    const raw =
      step.input_kind === 'MULTI_CHOICE' ? picked
      : step.input_kind === 'NUMBER' ? Number(text || 0)
      : step.input_kind === 'YES_NO' ? picked[0] === 'yes'
      : step.input_kind === 'SINGLE_CHOICE' ? (picked[0] ?? '')
      : text;

    const res = await submitAnswer(profile, step.step_id, raw);
    setBusy(false);
    if (!res.ok) { setError(res.error.message); return; }
    setPhase({ kind: 'confirming', result: res.data });
  }

  /* Yes, that's right → store the answer, mark the fields confirmed, move on. */
  function accept(result: ElicitResult) {
    let next = applyElicitResult(profile, result);
    next = confirmFields(next, Object.keys(result.field_meta_patch));
    onProfile(next);
    reset();
    setPhase({ kind: 'asking' });
    if (!result.next_step_id) onDone();
  }

  /* Not quite → keep the answer but leave the fields unconfirmed, so they stay
     gap-flagged everywhere downstream until the founder fixes them. */
  function amend(result: ElicitResult) {
    onProfile(applyElicitResult(profile, result));
    reset();
    setPhase({ kind: 'asking' });
  }

  if (phase.kind === 'confirming') {
    const r = phase.result;
    return (
      <div className="page-narrow stack-lg">
        <Progress current={index + 1} total={stepCount()} />

        <div className="card stack">
          <h1 ref={headingRef} tabIndex={-1} style={{ fontSize: '1.5em' }}>
            Have we got this right?
          </h1>

          {/* Announced politely so a screen reader reads it without interrupting. */}
          <p className="lede" role="status" aria-live="polite" style={{ fontSize: '1.15em', color: 'var(--ink)' }}>
            {r.confirm_back}
          </p>

          <div className="btn-row">
            <button type="button" className="btn" onClick={() => accept(r)}>
              Yes, that's right
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => amend(r)}>
              Not quite — keep going, I'll fix it later
            </button>
          </div>

          <p className="small">
            If it isn't right, nothing is lost. We keep what you said and mark it as
            needing your attention, so it shows up flagged before anything is sent.
          </p>
        </div>
      </div>
    );
  }

  const canSend =
    step.optional ||
    (step.input_kind === 'MULTI_CHOICE' ? picked.length > 0
      : step.input_kind === 'SINGLE_CHOICE' || step.input_kind === 'YES_NO' ? picked.length === 1
      : text.trim().length > 0);

  return (
    <div className="wrap-narrow stack-lg">
      <Progress current={index + 1} total={stepCount()} />

      <form
        className="card stack"
        onSubmit={(e) => { e.preventDefault(); if (canSend && !busy) void send(); }}
      >
        <div>
          <h1 ref={headingRef} tabIndex={-1} style={{ fontSize: '1.5em' }}>
            {step.question}
          </h1>
          <p className="small" style={{ marginTop: '0.5rem' }}>{step.why}</p>
        </div>

        {error && (
          <div className="notice notice-warn" role="alert">
            <p>{error}</p>
          </div>
        )}

        {/* ── free text and short text ── */}
        {(step.input_kind === 'FREE_TEXT' || step.input_kind === 'SHORT_TEXT') && (
          <div className="stack">
            <label htmlFor="answer" className="sr-only">{step.question}</label>
            {step.input_kind === 'FREE_TEXT' ? (
              <textarea
                id="answer" className="field" value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Take as long as you like. There is no word limit and no timer."
              />
            ) : (
              <input id="answer" className="field" value={text} onChange={(e) => setText(e.target.value)} />
            )}
            <div className="btn-row">
              <VoiceInput onTranscript={setText} />
              {text && <span className="small">We'll show you what we understood before saving anything.</span>}
            </div>
          </div>
        )}

        {step.input_kind === 'NUMBER' && (
          <div>
            <label htmlFor="answer" className="sr-only">{step.question}</label>
            <input
              id="answer" className="field" inputMode="numeric" value={text}
              onChange={(e) => setText(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="A rough figure in Singapore dollars"
              style={{ maxWidth: '16rem' }}
            />
          </div>
        )}

        {/* ── choices: the whole row is the target, and the funder's own term
             sits under the plain one rather than replacing it ── */}
        {(step.input_kind === 'SINGLE_CHOICE' || step.input_kind === 'MULTI_CHOICE') && (
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="sr-only">{step.question}</legend>
            <div className="choice-list">
              {(step.choices ?? []).map((c) => {
                const multi = step.input_kind === 'MULTI_CHOICE';
                const on = picked.includes(c.value);
                const g = c.funder_term ? lookup(c.funder_term) : null;
                return (
                  <label className="choice" key={c.value}>
                    <input
                      type={multi ? 'checkbox' : 'radio'}
                      name="choice"
                      checked={on}
                      onChange={() =>
                        setPicked(multi ? (on ? picked.filter((v) => v !== c.value) : [...picked, c.value]) : [c.value])
                      }
                    />
                    <span>
                      <span className="choice-label">{c.label}</span>
                      {c.funder_term && (
                        <span className="choice-term">
                          Funders call this “{c.funder_term}”{g ? ` — ${g.plain}` : ''}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

        {step.input_kind === 'YES_NO' && (
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="sr-only">{step.question}</legend>
            <div className="choice-list">
              {[{ v: 'yes', l: 'Yes, I have registered a company before' },
                { v: 'no', l: 'No, never' }].map((o) => (
                <label className="choice" key={o.v}>
                  <input
                    type="radio" name="yesno" checked={picked[0] === o.v}
                    onChange={() => setPicked([o.v])}
                  />
                  <span className="choice-label">{o.l}</span>
                </label>
              ))}
            </div>
          </fieldset>
        )}

        <div className="btn-row" style={{ marginTop: '0.5rem' }}>
          <button type="submit" className="btn" disabled={!canSend || busy}>
            {busy ? 'One moment…' : 'Continue'}
          </button>
          {step.optional && (
            <button type="button" className="btn btn-ghost" onClick={() => void send()}>
              Skip this one
            </button>
          )}
        </div>
        <p className="small">
          Question {index + 1} of {stepCount()}. Nothing here is submitted to a funder.
        </p>
      </form>
    </div>
  );
}
