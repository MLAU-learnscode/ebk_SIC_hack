# Interface contract — C ⇄ B ⇄ A

Read this before writing code that crosses a role boundary. It exists so the three
branches merge without conflict and without anyone waiting on anyone.

Status: **proposed by C, 2026-09-08.** B and A: react on the PR, then we freeze.

---

## 0. Ownership, resolved

CONTEXT.md contradicts itself on `eligibility.ts` — §8's role table gives the "eligibility
function" to C, while §7's repo layout and non-negotiable #2 both give it to B. Two of
three say B, and non-negotiable #2 is explicit: *"C authors rules JSON, B writes the
function reading it. Never the same file."*

**Resolution: B owns `src/lib/eligibility.ts`. C owns everything that feeds it and the
test cases that prove it correct.** C never opens a file under `/src`. B never opens a file
under `/data` or `/fixtures/demo-founder.json`.

| Path | Owner | Consumed by |
|---|---|---|
| `src/screens/**`, `src/components/**` | A | — |
| `src/lib/eligibility.ts` | B | A |
| `src/lib/elicit.ts`, `draft.ts`, `acra.ts` | B | A |
| `data/profile.schema.json` | **B** (fields proposed by C) | A, C |
| `data/rules/*.json` | C | B |
| `data/stages.json` | C | A |
| `data/schemas/*.mapping.json` | C | B |
| `data/glossary.json` | C | A |
| `fixtures/demo-founder.json` | C | A, B |
| `fixtures/eligibility-cases.json` | C | B |
| `fixtures/responses/**` | B | A |
| `prompts/**` | B | — |

Zero file overlap means zero merge conflicts by construction. The only file with split
concerns is `profile.schema.json` — see §1.

---

## 1. `profile.schema.json` — the spine

This is the one genuinely shared artifact. A's screens write it, C's rules read it, B's
drafting reads it. It is frozen end of Day 1 (non-negotiable #1) and changes after that
need all three of us to agree in writing.

**Process:** C proposes the field vocabulary (below and in
`data/profile.fields.proposal.json`), because C is the only one who knows what the grant
criteria actually need. B formalises it into `profile.schema.json` with types and defaults,
and freezes it. C then writes rules referencing only these field names.

### Proposed fields

Every field is nullable. `null` means "not yet asked" and is handled per §3.

| Field | Type | Required by | Notes |
|---|---|---|---|
| `age` | integer | VFG Youth, YCM | |
| `citizenship` | `"SG" \| "PR" \| "OTHER"` | VFG, YCM, SSGF | |
| `residing_in_sg` | boolean | YCM | |
| `is_incorporated` | boolean | VFG, SSGF | |
| `acra_uen` | string | raiSE prereq | feeds `acra.ts` lookup |
| `raise_member` | boolean | VFG | blocking |
| `has_vwo_partnership` | boolean | VFG | unincorporated path (VWO, not SSO — see SOURCES.md) |
| `has_beneficiary_validation` | boolean | VFG | unincorporated path |
| `first_time_entrepreneur` | boolean | SSGF | |
| `previously_incorporated` | boolean | SSGF | distinct from `is_incorporated` |
| `equity_pct` | number | SSGF | ≥30 |
| `received_other_gov_funding` | boolean | SSGF | see sequencing warning, §4 |
| `has_amp_lor` | boolean | SSGF | |
| `can_match_capital_sgd` | number | SSGF | 1:1 matching |
| `project_duration_months` | integer | YCM | ≤6 |
| `has_disability` | boolean | — | **routing and impact metrics only, never an eligibility criterion** |
| `social_need` | string | drafting | free text from elicitation |
| `beneficiary_group` | string | drafting | free text from elicitation |

---

## 2. Rules JSON — the closed operator set

C writes only these operators. B implements exactly these and no others. Adding an
operator is a contract change requiring both of us.

| `op` | `value` shape | Semantics |
|---|---|---|
| `eq` / `neq` | scalar | strict equality |
| `in` / `not_in` | array | membership |
| `between` | `[min, max]` | **inclusive** both ends |
| `gte` / `lte` / `gt` / `lt` | number | numeric compare |
| `exists` | `true` / `false` | field is non-null |

### Criterion shape

```json
{
  "field": "raise_member",
  "op": "eq",
  "value": true,
  "blocking": true,
  "requirement": "Must be a raiSE member",
  "remedy": "Apply for raiSE membership ($100, 4–8 weeks)",
  "remedy_order": 2,
  "remedy_est_weeks": 8,
  "depends_on": ["is_incorporated"],
  "applies_at_stage": 3
}
```

- `blocking: true` → failing it puts the grant in `eligible_after_steps` (remediable) or
  `not_a_fit` (see `terminal` below).
- `blocking: false` → advisory only; surfaces as a warning, never changes state.
- `remedy_order` sequences the steps a founder must take. **This is the product.**
- `depends_on` lets C express that a remedy is gated on another field, so B can order the
  chain correctly rather than showing steps that can't be started yet.

### Amendments — B, these came out of encoding the real criteria

Writing the three grant files exposed three gaps in the shape above. All are implemented
in the reference evaluator in `scripts/validate-rules.mjs` and enforced by the validator.

**1. `terminal` + `terminal_reason` — required, and the most important line in this file.**

A blocking criterion with no `remedy` silently means `not_a_fit`: permanently
disqualified. So *forgetting to write a remedy* looks identical to *deciding someone is
beyond help*. That is a wrong answer a real founder would act on.

A dead end must now declare itself:

```json
{ "field": "first_time_entrepreneur", "op": "eq", "value": true,
  "blocking": true, "terminal": true,
  "terminal_reason": "There is no action a founder can take to become a first-time entrepreneur again." }
```

The validator rejects any blocking criterion that has neither a `remedy` nor
`terminal: true`. Omission can no longer masquerade as judgement.

**2. `when` guard + `group` / `group_mode: "any_of"` — needed for real criteria.**

raiSE's rule is "VWO partnership **and/or** beneficiary validation", and it only applies to
unincorporated applicants. The closed operator set has no OR and no conditional, so the
choice was to add these or to fudge the criteria — and CONTEXT §11 forbids fudging.

```json
{ "field": "has_beneficiary_validation", "op": "eq", "value": true,
  "group": "vfg-unincorporated-evidence", "group_mode": "any_of",
  "when": { "field": "is_incorporated", "op": "eq", "value": false } }
```

Semantics: a criterion whose `when` guard does not hold is skipped entirely. A group passes
if any member passes; it is unknown if none pass and any is unknown. The validator rejects
groups that mix blocking and non-blocking members or that carry differing guards, because
either makes the group's effect on state ambiguous.

**3. `applies_at_stage` — advisory, safe to ignore in the MVP.**

VFG genuinely accepts unincorporated applicants at stage 1; the raiSE membership gate bites
at stage 3 (shortlisting). Marking ACRA registration as a flat requirement would be wrong,
and a sector-literate judge would catch it.

**You can ship v1 ignoring this field.** Treating every criterion as applying now is
strictly more conservative — it surfaces a real requirement early rather than inventing one.
That is a safe degradation, not a bug. It is also the hook for the vertical-progression
screen if there is time.

### Grant-level `warnings`

Grants carry a `warnings` array for non-blocking, cross-grant risks. Each has `message`,
`confirm_with_funder`, an optional `related_grant_id`, and an optional `when` guard. See §4.

### Grant file shape

```json
{
  "grant_id": "raise-vfg-youth",
  "name": "VentureForGood (Youth)",
  "funder": "raiSE",
  "source_url": "https://www.raise.sg/ventureforgood-grant/",
  "last_checked": "2026-09-08",
  "quantum_note": "Up to S$20,000 (youth track), per published grant listings",
  "confidence": "secondary",
  "criteria": [ ... ],
  "stages_ref": "raise-vfg"
}
```

`confidence` is `"primary"` or `"secondary"` and drives whether the UI shows an
"according to published listings" qualifier. This is our claims-discipline rule (CONTEXT
§10) enforced in data rather than in someone's memory on stage.

---

## 3. The unknown-value problem — decide this first

CONTEXT §7 specifies three output states but does not say what the engine does when a
profile field is `null`. This matters more here than in a normal product: **our entire
premise is that the profile starts empty and fills up over months.** At the moment the
readiness map first renders, most fields are null.

Treating null as *fail* paints every grant red and destroys the demo's emotional beat.
Treating null as *pass* gives false hope and breaks our soundness claim.

**Proposal — keep the three states, split the reasons.** A criterion whose field is `null`
is neither satisfied nor failed; it lands in `unknowns`. State is then:

| State | Condition |
|---|---|
| `eligible_now` | every blocking criterion satisfied, no unknowns |
| `eligible_after_steps` | at least one blocking criterion failed **with** a remedy, **or** unknowns remain and nothing is hard-failed |
| `not_a_fit` | at least one blocking criterion failed **without** a remedy |

A's UI renders "2 steps to go" differently from "3 questions left", but both live in the
same state. This respects the frozen three-state spec while staying honest about
incompleteness.

**B: if you disagree, say so on the PR before you write the function.** This is the one
decision that is expensive to change later.

**Implemented and proven.** `fixtures/eligibility-cases.json` case 1 is the cold-start
assertion: an empty `{}` profile against YCM must yield `eligible_after_steps` with four
unknowns and **zero** blockers. Run `node scripts/validate-rules.mjs` to see it hold. If
your implementation renders an empty profile as all-red or all-green, that case fails.

---

## 4. Result shape — what `eligibility.ts` returns

C's test cases assert against this. A renders it. B produces it.

```json
{
  "grant_id": "raise-vfg-youth",
  "name": "VentureForGood (Youth)",
  "state": "eligible_after_steps",
  "source_url": "https://www.raise.sg/ventureforgood-grant/",
  "last_checked": "2026-09-08",
  "confidence": "secondary",
  "satisfied":  [ { "field": "age", "requirement": "Aged 18–35" } ],
  "blockers":   [ { "field": "raise_member", "requirement": "...", "remedy": "...",
                    "remedy_order": 2, "remedy_est_weeks": 8 } ],
  "unknowns":   [ { "field": "has_vwo_partnership", "requirement": "..." } ],
  "warnings":   [ { "message": "...", "confirm_with_funder": true } ]
}
```

Three things A must be able to rely on:
- `satisfied` is populated even when the state is bad — the green ticks are the emotional
  payoff of the readiness map, not decoration.
- `blockers` is **pre-sorted by `remedy_order`**. A renders the array as given.
- Every result carries `last_checked` and the UI shows "confirm with the funder"
  (CONTEXT §4 guardrail). Non-negotiable.

`warnings` carries non-blocking cross-grant risks — see the sequencing warning below.

### The sequencing warning

Startup SG Founder requires that the business concept **has not received other government
funding** (CONTEXT §5). YCM is government funding. So taking a small YCM grant early may
close off a much larger SSGF grant later — an interaction no founder can currently see,
and one no competitor surfaces.

We must not assert that YCM definitively disqualifies you; that is an interpretation we
have not confirmed with either funder. It ships as a `warning` with
`confirm_with_funder: true`, which is exactly what our own guardrail demands. Honest and
still the sharpest thing in the demo.

---

## 5. How C unblocks B without touching B's file

Shipped. B writes `eligibility.ts` until all of this passes:

```
node scripts/validate-rules.mjs    # rules + fixture + 9 eligibility cases
node scripts/test-validator.mjs    # 15 adversarial cases proving the validator has no holes
```

- **`fixtures/eligibility-cases.json`** — 9 expected outputs, each with a
  `why_it_matters` note. Covers cold start, the ordered remedy chain, terminal dead ends,
  both limbs of the `any_of` group, and the `when` guard skipping a group entirely.
- **`scripts/validate-rules.mjs`** contains a **reference evaluator**. It is *not* the
  product implementation and **B must not import it** — it exists so C can assert the demo
  still holds, and so you have an executable spec to diff against. If your implementation
  and the reference disagree, one of us is wrong and we want to know here rather than on
  stage.

This is how C owns correctness without owning your file, and it means you can start before
reading a single rules file.

### The guard that protects the demo itself

`fixtures/demo-founder.json` declares an `expected_states` block, and the validator
asserts it. If anyone edits a rule in a way that changes what the persona sees, the build
fails with `DEMO BROKEN` naming the grant and the drift.

Without it, the failure mode is silent: someone tightens a criterion on Day 3, the
readiness map quietly drops from three states to two, and nobody notices until the demo is
on a projector. Do not "fix" a `DEMO BROKEN` failure by editing `expected_states` to match
— work out why the result moved.

---

## 6. Merge protocol

- Branch off `main`, merge back within hours, never days.
- **C never edits `/src`. B never edits `/data` or `fixtures/demo-founder.json`.**
- The one exception is `profile.schema.json`: one PR from C today, B merges and freezes.
- Anything that changes this contract is a PR against *this file*, tagged to all three.
- Feature freeze noon Day 3 (9 Sep); after that, bug fixes only, merged to `main`.
