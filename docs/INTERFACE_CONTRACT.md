# Interface contract — C ⇄ B ⇄ A

Read this before writing code that crosses a role boundary. It exists so the three
branches merge without conflict and without anyone waiting on anyone.

Status: **live, updated 2026-09-09.** §1 is reconciled against B's shipped
`profile.schema.json`. §2's amendments and §1's three pending fields still need B's
sign-off.

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
| `data/profile.schema.json` | **B** — shipped, committed verbatim | A, C |
| `data/profile.fields.pending.json` | C — additions requested of B | B |
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
drafting reads it. It is frozen (non-negotiable #1) and changes need all three of us to
agree in writing.

**Status: RESOLVED 2026-09-09.** B shipped `data/profile.schema.json` and it is committed
here verbatim. C's earlier `profile.fields.proposal.json` is deleted — superseded, and
keeping two vocabularies is exactly how they drift apart. **The validator now derives its
field vocabulary from B's schema directly**, so a rule cannot reference a field the schema
does not define.

B's schema is better than C's proposal in four places and was adopted wholesale:
`is_key_applicant` (VFG requires the *key* applicant be SG/PR — C missed it),
`amp_relationship` as an enum rather than a boolean (it captures `IN_DISCUSSION`, a real
state a boolean would flatten), `access_needs` as an array instead of a crude
`has_disability` flag, and `field_meta` — the provenance seam, which C had no equivalent for.

### How rules address fields

Rules use **dot-paths into `answers`**: `founder.age`, `venture.incorporated`,
`memberships.raise_member`. The same key shape `field_meta` uses. C's rules were flat and
have all been migrated.

| C's original name | B's schema path | Note |
|---|---|---|
| `age` | `founder.age` | |
| `citizenship` | `founder.citizenship` | |
| `first_time_entrepreneur` | `founder.first_time_founder` | renamed |
| `previously_incorporated` | `founder.previously_incorporated` | |
| `equity_pct` | `founder.equity_pct` | |
| `is_incorporated` | `venture.incorporated` | renamed |
| `acra_uen` | `venture.uen` | renamed |
| `raise_member` | `memberships.raise_member` | |
| `has_amp_lor` (boolean) | `memberships.amp_relationship` (enum) | **type change** — `eq "LOR_ISSUED"` |
| `has_vwo_partnership` | `impact.sso_partnership` | see naming note below |
| `has_beneficiary_validation` | `impact.beneficiary_validation` | |
| `received_other_gov_funding` | `funding.other_govt_funding` | renamed |
| `social_need` | `venture.problem_statement` | |
| `beneficiary_group` | `impact.beneficiary_group` | |
| `has_disability` | `founder.access_needs` (array) | **never an eligibility input** |

`founder.access_needs` is UI-only. The schema says no rule file may reference it, and the
validator enforces that with a dedicated test — accessibility data must never gate a grant.

### B: three fields C needs added

Tracked in `data/profile.fields.pending.json` so C never edits your frozen file. The
validator accepts them so the build stays green, and warns on every one until they land.

| Field | Type | Needed by | Blocking? |
|---|---|---|---|
| `founder.residing_in_sg` | boolean | YCM | **yes** |
| `venture.project_duration_months` | integer | YCM | **yes** |
| `funding.can_match_capital_sgd` | number | Startup SG Founder | no — drop it if reopening the schema is expensive |

The first two are demo-critical. YCM is the only grant the persona reaches `eligible_now`
on, so without them the readiness map loses its green card and drops to two states. They
did not appear in your draft because YCM is not in CONTEXT §5 — it came out of C's source
verification on 8 Sep (`docs/SOURCES.md`).

### Naming note — do not act on this before the pitch

`impact.sso_partnership` should be `vwo_partnership`. raiSE's wording is VWO (Voluntary
Welfare Organisation) / SSA; an SSO is a Social Service Office, a different kind of entity.
CONTEXT §5 carries the same error, so it is inherited, not B's.

**Recommendation: leave the key alone.** It is frozen, A is already building against it,
and a rename on Day 3 costs more than it buys. Fix the founder-facing *label* to say
"Voluntary Welfare Organisation (VWO)" and rename the key after the hackathon.

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
  "field": "memberships.raise_member",
  "op": "eq",
  "value": true,
  "blocking": true,
  "requirement": "Must be a raiSE member",
  "remedy": "Apply for raiSE membership ($100, 4–8 weeks)",
  "remedy_order": 2,
  "remedy_est_weeks": 8,
  "depends_on": ["venture.incorporated"],
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
{ "field": "founder.first_time_founder", "op": "eq", "value": true,
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
{ "field": "impact.beneficiary_validation", "op": "eq", "value": true,
  "group": "vfg-unincorporated-evidence", "group_mode": "any_of",
  "when": { "field": "venture.incorporated", "op": "eq", "value": false } }
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
  "satisfied":  [ { "field": "founder.age", "requirement": "Aged 18–35" } ],
  "blockers":   [ { "field": "memberships.raise_member", "requirement": "...", "remedy": "...",
                    "remedy_order": 2, "remedy_est_weeks": 8 } ],
  "unknowns":   [ { "field": "impact.sso_partnership", "requirement": "..." } ],
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
node scripts/validate-rules.mjs    # rules + fixture + 10 eligibility cases
node scripts/test-validator.mjs    # 21 adversarial cases proving the validator has no holes
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

`fixtures/demo-founder.json` declares an `_expected_states` block, and the validator
asserts it. If anyone edits a rule in a way that changes what the persona sees, the build
fails with `DEMO BROKEN` naming the grant and the drift.

Without it, the failure mode is silent: someone tightens a criterion on Day 3, the
readiness map quietly drops from three states to two, and nobody notices until the demo is
on a projector. Do not "fix" a `DEMO BROKEN` failure by editing `_expected_states` to match
— work out why the result moved.

---

## 6. Merge protocol

- Branch off `main`, merge back within hours, never days.
- **C never edits `/src`. B never edits `/data` or `fixtures/demo-founder.json`.**
- The one exception is `profile.schema.json`: one PR from C today, B merges and freezes.
- Anything that changes this contract is a PR against *this file*, tagged to all three.
- Feature freeze noon Day 3 (9 Sep); after that, bug fixes only, merged to `main`.
