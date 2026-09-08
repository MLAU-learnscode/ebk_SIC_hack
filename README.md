# ebk_SIC_hack

Vibe For Good 2026 — Social Impact Catalyst, Challenge #3.

A tool that helps underserved and disabled youth founders in Singapore find out which
grants they qualify for, what is blocking them, and in what order to fix it — before they
spend months writing an application they were never eligible for.

**Start here: [CONTEXT_SIC_ClaudeCode.md](./CONTEXT_SIC_ClaudeCode.md).** It is the source
of truth for what we are building, the roles, the schedule, and the rules everyone
(including Claude Code) must follow. Read it before writing any code.

---

## Quick start

No dependencies, no install, no API key. Node 18+ only.

```bash
git clone https://github.com/MLAU-learnscode/ebk_SIC_hack.git
cd ebk_SIC_hack
node scripts/validate-rules.mjs     # should print OK
```

Then read the file for your role:

| You are | Read | Then work on branch |
|---|---|---|
| **A — Experience Lead** | [docs/INTERFACE_CONTRACT.md](./docs/INTERFACE_CONTRACT.md) §4 (result shape) | `a/screens` |
| **B — Intelligence Lead** | [docs/INTERFACE_CONTRACT.md](./docs/INTERFACE_CONTRACT.md) §1–§5 | `b/elicitation` |
| **C — Rules & Strategy** | [docs/C_ROLE_PLAN.md](./docs/C_ROLE_PLAN.md) | `c/rules` |

[VERSION_CONTROL.md](./VERSION_CONTROL.md) covers how the three of us branch and merge
without stepping on each other.

---

## File structure

```
CONTEXT_SIC_ClaudeCode.md      The brief. Source of truth. Read first.
VERSION_CONTROL.md             Git workflow for the three of us.

docs/
  INTERFACE_CONTRACT.md        THE contract: who owns what, field paths, operators,
                               the result shape A renders, the amendments B signed off.
                               Read this before writing anything that crosses a role.
  SOURCES.md                   Every grant fact + its URL + primary/secondary confidence.
                               Also lists 4 corrections to CONTEXT.md. Q&A ammunition.
  C_ROLE_PLAN.md               Role C's audit and plan.

data/                          # the eligibility inputs — no code, no model, ever
  profile.schema.json          B owns. FROZEN. The shared spine: what we know about a
                               founder. A writes it, B reads it, C's rules address it.
  profile.fields.pending.json  C owns. Fields C needs that aren't in the schema yet.
                               Shrinks to empty as B merges them.
  rules/
    nyc-ycm.json               C owns. One file per grant. Each carries its own
    raise-vfg-youth.json       source_url, last_checked and confidence level.
    startup-sg-founder.json
  stages.json                  C owns. Multi-stage funnel model (VFG's 5 stages).
  schemas/                     C owns. Grant-specific answer mappings for drafting.
  glossary.json                C owns. Jargon -> plain language. (not yet written)

fixtures/                      # everything the demo runs on
  demo-founder.json            C owns. The demo persona, as a VALID FounderProfile.
                               A loads it directly — no adapter needed.
  eligibility-cases.json       C owns. 10 expected outputs. B's executable spec.
  responses/                   B owns. Pre-generated AI output for the demo.

prompts/                       B owns. Real prompt templates, committed. See CONTEXT §7.1.

scripts/
  validate-rules.mjs           Validates rules + fixture + cases. Contains a REFERENCE
                               EVALUATOR (not the product — do not import it).
  test-validator.mjs           21 adversarial cases proving the validator has no holes.

src/
  screens/                     A owns.
  components/                  A owns.
  lib/
    eligibility.ts             B owns. PURE FUNCTION. No model, ever.
    elicit.ts, draft.ts        B owns. Read fixtures; live path behind a flag.
    acra.ts                    B owns. Real call to data.gov.sg (free, no auth).
```

**No `.env`, no API key, no secret in this repo.** The build costs $0 and the eligibility
engine is a pure function over local JSON — that is both the cost decision and our
soundness claim, and they are the same decision. See CONTEXT §7 and §11.

---

## How to use this

### Run the checks

Run both before merging anything that touches `data/` or `fixtures/`:

```bash
node scripts/validate-rules.mjs     # rules, fixture, and the 10 eligibility cases
node scripts/test-validator.mjs     # proves the validator itself still catches things
```

Warnings do not fail the build; errors exit non-zero.

### What will fail your build

These are deliberate. The harmful failure in this product is not a crash — it is telling a
founder they qualify when they do not, or that a door is closed when it is not.

| Check | Why it exists |
|---|---|
| A blocking criterion with no `remedy` and no `terminal: true` | Forgetting a remedy silently means "permanently disqualified". A dead end must say it is one, and why. |
| A prerequisite ordered *after* the step depending on it | Otherwise we tell a founder to do something impossible. |
| A field name not in `profile.schema.json` | A field that does not resolve reads as `null` and silently changes the answer. |
| A rule reading `founder.access_needs` | Accessibility data must never gate a grant. |
| `confidence: "primary"` citing a non-government domain | A vendor blog cannot back a claim we state flat on stage. |
| Any `api_key` or model reference under `data/rules/` | The eligibility path stays a pure function. |
| **DEMO DRIFT** — the persona's states changing | `demo-founder.json` declares `_expected_states` and the validator asserts them. Do not "fix" this by editing the expected values; work out why the result moved. |

### Add a grant

1. Create `data/rules/<grant-id>.json`. Copy the shape from an existing one.
2. Every criterion uses a dot-path into `answers` (`founder.age`, not `age`) and an
   operator from the closed set in [INTERFACE_CONTRACT.md](./docs/INTERFACE_CONTRACT.md) §2.
3. Give the file a `source_url`, a `last_checked` date, and a `confidence` of `primary`
   or `secondary`. Add the fact to [docs/SOURCES.md](./docs/SOURCES.md) with its URL.
   **If a rule is not in SOURCES.md with a live link, it does not ship.**
4. Every blocking criterion needs either a `remedy` + `remedy_order`, or
   `terminal: true` + a `terminal_reason`.
5. Run `node scripts/validate-rules.mjs`.

### Change a grant's criteria

Run the validator afterwards. If it reports `DEMO BROKEN`, a rules edit changed what the
demo persona sees — that is the guard working. Find out why before touching
`_expected_states`.

### Add an eligibility test case

Append to `fixtures/eligibility-cases.json`. Each case is a partial `answers` object, a
`grant_id`, and an `expect` block (`state`, `blocker_fields`, `unknown_fields`,
`blockers_in_order`, `has_terminal_blocker`). Include a `why_it_matters` line — a case
nobody understands gets deleted by the next person.

---

## The three eligibility states

| State | Means |
|---|---|
| `eligible_now` | Every blocking criterion satisfied, nothing unknown. |
| `eligible_after_steps` | Something is blocking but remediable, **or** we still have questions. Carries an ordered remedy chain. |
| `not_a_fit` | A blocking criterion failed with no possible remedy (age, citizenship, past incorporation). |

`null` means **unknown, not failure**. The profile starts empty — that is the entire
premise — so null-as-failure would paint every grant red and null-as-pass would promise
eligibility we cannot support. Unknowns are their own bucket, separate from blockers.

---

## House rules

- **AI drafts, extracts, and translates. It never decides eligibility and never submits.**
  That single line answers most Q&A challenges.
- Never invent a grant criterion, a statistic, or a competitor feature.
- Government facts (raiSE, EnterpriseSG, ACRA, MSF): state flat. Vendor and review-blog
  figures: attribute, never assert. `confidence` in each rules file tracks which is which.
- Accessibility is a hard requirement, not a stretch goal.
- Feature freeze noon on day 3. Merge to `main` only.
