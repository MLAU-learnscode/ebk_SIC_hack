# For Jun Yu — everything on my side is in the repo

From B (Nicole). Pull `main`, then read this. Five minutes.

Short version: **every function your screens need now exists and returns real
data.** Nothing on your side is blocked on me, and you never need to write a mock.

---

## 1. What landed

```
src/types/contract.ts    every type you need — import, never redeclare
src/lib/eligibility.ts   the readiness map engine — pure, sync, no model
src/lib/profile.ts       create / update / save the founder profile
src/lib/elicit.ts        the 10 intake questions + cached answers
src/lib/draft.ts         the generated answer + gap flags
src/lib/glossary.ts      jargon → plain language
src/lib/acra.ts          live company lookup (see §5)
fixtures/                the demo data behind all of it
```

**Don't edit anything in `src/lib/` or `src/types/`.** If you need something
changed there, message me — I'll ship it in minutes. That's the one rule that
keeps us out of merge hell.

---

## 2. Wiring the intake screen

```tsx
import { getFirstStep, getStep, submitAnswer, stepIndex, stepCount } from '../lib/elicit';
import { createEmptyProfile, applyElicitResult, loadProfile, saveProfile } from '../lib/profile';
import type { FounderProfile, ElicitStep } from '../types/contract';

const [profile, setProfile] = useState<FounderProfile>(() => loadProfile() ?? createEmptyProfile());
const [step, setStep] = useState<ElicitStep>(() => getFirstStep());
const [busy, setBusy] = useState(false);

async function onAnswer(raw: string) {
  setBusy(true);
  const res = await submitAnswer(profile, step.step_id, raw);
  setBusy(false);

  if (!res.ok) { setError(res.error.message); return; }   // message is already plain-language

  const next = applyElicitResult(profile, res.data);
  setProfile(next);
  saveProfile(next);

  setConfirmBack(res.data.confirm_back);                   // show this before moving on
  if (res.data.next_step_id) {
    const s = getStep(res.data.next_step_id);
    if (s.ok) setStep(s.data);
  } else {
    goTo('readiness_map');
  }
}
```

Progress bar: `stepIndex(step.step_id) + 1` of `stepCount()`.

**The confirm-back is not optional.** `res.data.confirm_back` is the sentence that
says back what we understood. Show it, let them say yes or fix it, and call
`confirmFields(profile, step.writes_fields)` on yes. It's the accessibility
promise and it's half the demo.

---

## 3. Wiring the readiness map — the important one

```tsx
import { evaluateAll, STATUS_LABEL, firstBlocker, terminalReasons } from '../lib/eligibility';
import rules from '../../data/rules/vfg.json';        // C's files
import ssf from '../../data/rules/startup-sg-founder.json';

const map = evaluateAll(profile, [rules, ssf]);        // synchronous. no await, no spinner.
```

**No `useEffect`, no loading state, no `await`.** Call it straight in render. It's
a pure function over local JSON — it cannot fail and it cannot be slow. Say that
on stage: *"this screen works with the wifi switched off."*

Already sorted closest-to-funded first. Every array below is **pre-filtered and
pre-sorted — render them as given, don't filter in JSX**:

```tsx
{map.results.map(r => (
  <article key={r.grant_id}>
    <h3>{r.grant_name}</h3>
    <Badge status={r.status}>{STATUS_LABEL[r.status]}</Badge>
    {r.quantum && <p className="quantum">{r.quantum}</p>}

    {/* green ticks — populated even when the status is bad. This is the
        emotional payoff of the map, not decoration. Always render it. */}
    <ul className="satisfied">
      {r.satisfied.map(c => <li key={c.field}>✓ {c.label}</li>)}
    </ul>

    {/* already ordered by remedy_order — the array order IS the instruction
        sequence. ACRA before raiSE, because raiSE won't take an unregistered
        business. Do not re-sort. */}
    {r.status === 'eligible_after_steps' && (
      <ol>{r.remedies.map(rem => (
        <li key={rem.order}>{rem.text}{rem.duration && <span> — {rem.duration}</span>}</li>
      ))}</ol>
    )}

    {r.status === 'not_a_fit' && (
      <ul>{terminalReasons(r).map((why, i) => <li key={i}>{why}</li>)}</ul>
    )}

    {r.warnings.map(w => (
      <aside key={w.id} role="note">
        {w.message}
        {w.confirm_with_funder && <em> Confirm with the funder before acting on this.</em>}
      </aside>
    ))}

    {r.has_unknowns && <p>Answer {r.unknown_count} more questions to be sure.</p>}

    <footer>Checked against <a href={r.source_url}>the funder's own page</a> on {r.last_checked}.</footer>
  </article>
))}
```

Three statuses to style: `eligible_now`, `eligible_after_steps`, `not_a_fit`.
`firstBlocker(r)` gives the one thing in the way, if you want a one-line subtitle.
`terminalReasons(r)` gives readable reasons for a `not_a_fit` card — never show
that state without saying why.

Two things please don't drop:

- **The `last_checked` + source-link footer.** It's how we answer "what if your
  data is stale", and it's the difference between a rules engine and a guess.
- **`r.warnings`.** One of them warns that taking a small grant may close off a
  bigger one later. That's the product being genuinely useful, and it only helps
  if it's on screen at the moment of decision.

A criterion with `outcome: 'SKIPPED'` doesn't apply to this founder — don't render
it at all.

---

## 4. Wiring the draft screen

```tsx
import { generateDraft, segments, wordCount } from '../lib/draft';

const res = await generateDraft(profile, 'raise-vfg-youth', 'stage_1_submit');
if (!res.ok) return <Notice>{res.error.message}</Notice>;

{res.data.sections.map(sec => (
  <section key={sec.funder_question}>
    <h3>{sec.funder_question}</h3>
    <p className="plain">{sec.plain_question}</p>   {/* alongside, never replacing */}

    <p>{segments(sec).map((s, i) =>
      s.gap
        ? <mark key={i} title={s.gap.note} data-source={s.gap.source}>{s.text}</mark>
        : <span key={i}>{s.text}</span>
    )}</p>

    <small>{wordCount(sec.text)} / {sec.word_limit} words</small>
  </section>
))}
```

`segments()` does the character-offset arithmetic for you.

**The `<mark>` is the money shot of the demo.** It's the visible seam — the thing
that shows what the founder said vs what we estimated. Make it clearly visible
(and not by colour alone — it needs a border or an icon too, for the accessibility
story and for anyone colourblind in the room).

---

## 5. Two things still open

**C's rules files.** `data/rules/*.json` is C's, not mine. If they're not pushed
yet, `evaluateAll` has nothing to iterate — build against the shapes in
`verify/eligibility.test.ts` meanwhile, they're the real thing.

**ACRA dataset ids.** `acra.ts` needs one real `resource_id`. Open
`https://api-production.data.gov.sg/v2/public/api/collections/2/metadata` in a
browser, copy a `datasetId`, paste it into `RESOURCE_IDS`. Until then the lookup
returns a clean "type it in instead", which is a fine demo path — don't let it
block you.

---

## 6. If you're using Claude to build the screens

Give it `CONTEXT.md`, `CONTRACT.md`, `contract.ts`, and this file. Then paste:

```
I own ONLY /src/screens/** and /src/components/**.

- Import all types from src/types/contract.ts. Never redeclare a type
  locally. Never edit contract.ts.
- Do NOT create or edit anything in /src/lib/ — those files already exist
  and another teammate owns them. Import from them using the signatures in
  HANDOFF-TO-A.md.
- Use the exact field names in CONTRACT.md §3. snake_case, no renaming.
- null means "not asked yet", false means "founder said no". Never collapse
  them, never default a field to false or "".
- evaluateAll() is synchronous and pure. No spinner, no useEffect, no
  loading state on the readiness map.
- Render gap flags from field_meta per CONTRACT.md §3, and from
  DraftResult.gaps on the draft screen. Never signal a gap by colour alone.
- Accessibility is a hard requirement: semantic HTML, real <label>s, visible
  focus rings, no time limits, one question per screen, generous text size.

Stack: React + TypeScript + Vite. Screens to build: the SCREEN constant in
contract.ts.
```

The "do NOT touch /src/lib/" line is the one that matters. Without it Claude
notices those files and cheerfully rewrites them, and then we have two
eligibility engines and a genuine merge conflict.

---

## 7. What changed since yesterday (v1.0.1)

C shipped the rules files and caught three things. All additive — **nothing you
already wrote breaks**, but pull before you go further:

- `EligibilityResult` gained `satisfied[]`, `blockers[]`, `unknowns[]`,
  `warnings[]`, `confidence`, `quantum`. Existing fields unchanged.
- `CriterionOutcome` gained `SKIPPED` (a criterion that doesn't apply to this
  founder). Don't render those rows.
- Profile gained three nullable fields: `founder.residing_in_sg`,
  `venture.project_duration_months`, `funding.can_match_capital_sgd`.
  `profile_version` stays `1.0.0`, so saved profiles still load.
- Anywhere you show the VWO partnership field to a founder, the words are **VWO
  (Voluntary Welfare Organisation)** — not SSO. The field key stays
  `impact.sso_partnership`; only the label changes. CONTEXT.md has this wrong.

## 8. Sanity check before you sleep

```bash
npx tsc --noEmit                      # must be clean
npx tsx verify/eligibility.test.ts    # 36 checks, must all pass
npx tsx verify/cross-check.ts         # B's engine vs C's spec — must agree
```

If `tsc` complains about a field name, the contract is right and the screen is
wrong — that's the whole point of the setup. Message me if you think it's the
other way round.
