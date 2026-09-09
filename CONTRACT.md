# CONTRACT.md — names, shapes, and who touches what

**Owner:** B (Intelligence Lead) · **Status:** frozen v1.0.1 · **Read time: 5 min, saves 3 hours**

This is the anti-drift document. It exists because the reliable way to lose a hackathon
is not a missing feature — it's the frontend calling it `raiseeMember` while the rules
engine looks for `raise_member`, discovered at 11pm on Day 3.

Companion files, both authored by B, both frozen:

| File | What it is |
|---|---|
| `/data/profile.schema.json` | Machine-checkable definition of the profile |
| `/src/types/contract.ts` | Same thing as TypeScript + every function signature B exposes |

**If you import from `contract.ts`, drift becomes a compile error instead of a demo failure.**
That is the whole point. Do not redeclare these types locally.

---

## 1. The one casing rule

> **Anything that crosses the JSON boundary is `snake_case`, verbatim, forever.
> There is no camelCase mapping layer anywhere in this repo.**

| Thing | Case | Example |
|---|---|---|
| Profile fields, rule fields, fixture keys, API response keys | `snake_case` | `raise_member`, `amount_sought_sgd` |
| Enum *values* | `SCREAMING_SNAKE` | `AI_ESTIMATED`, `LOR_ISSUED` |
| The three eligibility statuses | `lowercase_snake` | `eligible_now` |
| Grant ids | `kebab-case` | `raise-vfg-youth` |
| Step ids, stage ids, screen ids | `snake_case` | `support_network` |
| React components | `PascalCase` | `ReadinessMap.tsx` |
| Hooks, handlers, UI-only local vars | `camelCase` | `useProfile`, `onSubmit` |
| TS types and interfaces | `PascalCase` | `EligibilityResult` |

Yes, `profile.answers.founder.age` reads oddly in JSX. That's deliberate. The cost of
un-idiomatic property names is one raised eyebrow; the cost of a rename layer is a whole
class of bugs we cannot afford to debug on Day 3.

**Exception, and only this one:** the three eligibility statuses stay lowercase because
CONTEXT.md §7 names them verbatim and we say them out loud in the pitch. Don't tidy them.

---

## 2. Null discipline — the rule most likely to be broken

```
null   = we haven't asked yet     → criterion outcome UNKNOWN
false  = the founder said no      → criterion outcome UNMET
```

These are **not** the same and the eligibility engine will not treat them the same.
A founder who hasn't reached the raiSE question yet is not disqualified; a founder who
said "no, I'm not a member" gets a remedy step.

- Never initialise a field to `false`, `''` or `0` to satisfy TypeScript. Use `null`.
- Never write `profile.answers.founder.age ?? 0`. Check for null explicitly.
- Empty string is never a valid stored value. If the founder skips, store `null`.

---

## 3. Field dictionary

Every field traces to a documented requirement in CONTEXT.md §5. **If a field has no
grant that needs it, it does not go in the schema** — that's how schemas rot.

### `answers.founder`

| Field | Type | Why it exists |
|---|---|---|
| `full_name` | `string \| null` | Drafting, team resumes |
| `age` | `number \| null` | VFG Youth 18–35 · **blocking, no remedy** |
| `citizenship` | `'SG' \| 'PR' \| 'OTHER' \| null` | VFG + Startup SG Founder · **blocking, no remedy** |
| `is_key_applicant` | `boolean \| null` | VFG requires the *key* applicant be SG/PR, not just a team member |
| `first_time_founder` | `boolean \| null` | Startup SG Founder · **blocking** |
| `previously_incorporated` | `boolean \| null` | Startup SG Founder, must be false · **blocking** |
| `equity_pct` | `number \| null` | Startup SG Founder, ≥30% held or proposed · **blocking** |
| `residing_in_sg` | `boolean \| null` | Young ChangeMakers · **blocking, terminal** |
| `access_needs` | `AccessNeed[]` | UI affordances only. **No rule file may ever read this field.** |

> `access_needs` is deliberately walled off from eligibility. Disability is our design
> constraint, never an eligibility input. Worth saying in Q&A if anyone asks.

### `answers.venture`

| Field | Type | Why it exists |
|---|---|---|
| `name` | `string \| null` | Drafting, ACRA lookup |
| `one_liner` | `string \| null` | AI-extracted at `venture_idea` · expect `AI_EXTRACTED` |
| `problem_statement` | `string \| null` | Drafting |
| `stage` | `'IDEA' \| 'PROTOTYPE' \| 'OPERATING' \| null` | Stage model, readiness copy |
| `incorporated` | `boolean \| null` | VFG: if false, VWO partnership / beneficiary validation expected · **blocking at stage 3, remediable** |
| `uen` | `string \| null` | ACRA lookup key |
| `incorporation_date` | `IsoDate \| null` | ACRA-sourced |
| `entity_type` · `entity_status` · `ssic_code` | `string \| null` | ACRA-sourced, read-only to the founder |
| `project_duration_months` | `number \| null` | Young ChangeMakers, ≤6 · **blocking, remediable** |

### `answers.impact`

| Field | Type | Why it exists |
|---|---|---|
| `beneficiary_group` | `string \| null` | VFG social impact narrative |
| `beneficiary_count_est` | `number \| null` | Usually `AI_ESTIMATED` — **this is the field we gap-flag in the demo** |
| `impact_description` | `string \| null` | Drafting |
| `beneficiary_validation` | `boolean \| null` | VFG, unincorporated applicants |
| `sso_partnership` | `boolean \| null` | VFG, unincorporated applicants. **Key is frozen but the term is wrong** — raiSE says VWO (Voluntary Welfare Organisation). Every founder-facing label says VWO |
| `sso_partner_name` | `string \| null` | Drafting |

### `answers.memberships`

| Field | Type | Why it exists |
|---|---|---|
| `raise_member` | `boolean \| null` | VFG · **blocking, REMEDIABLE** — this is the demo's `eligible_after_steps` driver |
| `raise_member_since` | `IsoDate \| null` | Display |
| `amp_relationship` | `'NONE' \| 'IN_DISCUSSION' \| 'LOR_ISSUED' \| null` | Startup SG Founder needs an AMP Letter of Recommendation · **blocking, REMEDIABLE** |
| `amp_name` | `string \| null` | e.g. `SMU IIE` |

### `answers.funding`

| Field | Type | Why it exists |
|---|---|---|
| `amount_sought_sgd` | `number \| null` | Drafting, grant sizing |
| `other_govt_funding` | `boolean \| null` | Startup SG Founder, must be false · **blocking, not remediable** |
| `other_govt_funding_detail` | `string \| null` | Drafting |
| `can_match_capital_sgd` | `number \| null` | Startup SG Founder matching capital · **non-blocking** — the 1:1 ratio is unverified, so we never block on it |

### `answers.readiness`

Documents VFG requires to *start* an application. Drives the "what you still need" panel —
**not** eligibility status.

`has_pitch_deck` · `has_acra_profile` · `has_management_accounts` ·
`has_financial_projections` · `has_team_resumes` · `team_size`

### `field_meta` — the seam

Keyed by dot-path (`'founder.age'`, `'impact.beneficiary_count_est'`).

```ts
{ source: 'FOUNDER' | 'AI_EXTRACTED' | 'AI_ESTIMATED' | 'ACRA' | 'DEFAULT',
  confirmed_by_founder: boolean,
  updated_at: IsoDateTime,
  note?: string }
```

**A's rendering rule — this is a demo-critical behaviour, not a nice-to-have:**

| Condition | Render |
|---|---|
| `source === 'AI_ESTIMATED'` | Gap flag, always |
| `confirmed_by_founder === false` | Gap flag, always |
| path missing from `field_meta` | Gap flag (unknown provenance) |
| `source === 'FOUNDER'` or `'ACRA'`, confirmed | Clean |

> *"Every output has a visible seam showing what came from the founder versus what was
> estimated."* — CONTEXT.md §4. If the seam isn't on screen, we can't say that line on stage.

---

## 4. What A can call (the B→A surface)

Full signatures in `contract.ts` §8. Summary:

| Module | Function | Sync? | Returns |
|---|---|---|---|
| `lib/eligibility.ts` | `evaluateGrant(profile, rule)` | **sync, pure** | `EligibilityResult` |
| `lib/eligibility.ts` | `evaluateAll(profile, rules)` | **sync, pure** | `ReadinessMap` |
| `lib/elicit.ts` | `getFirstStep()` | sync | `ElicitStep` |
| `lib/elicit.ts` | `getStep(stepId)` | sync | `Result<ElicitStep>` |
| `lib/elicit.ts` | `submitAnswer(profile, stepId, raw)` | async | `Result<ElicitResult>` |
| `lib/draft.ts` | `generateDraft(profile, grantId, stageId)` | async | `Result<DraftResult>` |
| `lib/acra.ts` | `lookupEntity(query)` | async | `Result<AcraMatch[]>` |
| `lib/glossary.ts` | `explain(term)` | sync | `string \| null` |

Two rules that make A's life easy:

1. **Eligibility is synchronous and pure.** No `await`, no loading state, no error state.
   Call it directly in render. It cannot fail and it cannot hallucinate — that's the pitch.
2. **Every async call returns `Result<T>`.** A never writes try/catch:

   ```ts
   const res = await submitAnswer(profile, stepId, raw);
   if (!res.ok) return <Notice>{res.error.message}</Notice>;  // already plain-language
   applyPatch(res.data.patch);
   ```

`error.message` is always safe to render to the founder. `error.detail` never is.

**Patches are sparse.** `ElicitResult.patch` is a `DeepPartial` — merge it, don't assign it.
Replacing `profile.answers` with the patch wipes every earlier answer.

---

## 5. Fixtures, files and ids

```
/fixtures/responses/
  elicit-01-who_you_are.json
  elicit-02-citizenship.json
  elicit-03-access_needs.json
  elicit-04-venture_idea.json
  elicit-05-who_it_helps.json
  elicit-06-venture_stage.json
  elicit-07-founding_history.json
  elicit-08-support_network.json
  elicit-09-money.json
  elicit-10-what_you_have.json
  draft-raise-vfg-youth-stage_1.json
/fixtures/
  demo-founder.json          ← C authors this, Day 1, so A is never blocked
```

Zero-padded so they sort. `{kind}-{nn}-{step_id}.json`. Each file's body is an `ElicitResult`.

**Screen ids** (`SCREEN` in contract.ts): `welcome` · `intake` · `readiness_map` ·
`grant_detail` · `draft` · `profile_review`

**Intake order** (`ELICIT_STEP_ORDER`): `who_you_are` → `citizenship` → `access_needs` →
`venture_idea` → `who_it_helps` → `venture_stage` → `founding_history` →
`support_network` → `money` → `what_you_have`

**Grant ids:** `raise-vfg-youth` · `startup-sg-founder` · (third TBC by C)

---

## 6. Rule operators — closed set

C authors `/data/rules/*.json`; B implements the function that reads them. **C may not use
an operator B hasn't implemented.** This is the most likely silent failure in the build:
an unknown op either throws or, worse, quietly evaluates false.

`eq` · `neq` · `in` · `not_in` · `between` (inclusive `[min,max]`) · `gte` · `lte` ·
`gt` · `lt` · `is_true` · `is_false` · `exists`

Need another? Message B, B ships it, *then* use it. Never the other way round.

**Every criterion needs a `label`** — a plain-language restatement. A renders `label`,
never the raw `field` path.

**The fork — now explicit.** Every blocking criterion must declare **either** a `remedy`
**or** `terminal: true` with a `terminal_reason`. The engine **throws** if it has neither.

| Unmet blocking criterion | Result |
|---|---|
| has `remedy` | `eligible_after_steps` + the remedy joins the ordered list |
| `terminal: true` | `not_a_fit`, and `terminal_reason` is shown to the founder |
| neither | **build fails** |

This used to be inferred from a missing remedy. C pointed out the problem and was right:
forgetting to write a remedy looked identical to deciding someone is permanently
disqualified — and a founder acts on that answer. It is now impossible to express by
accident.

"You're not 18–35" is terminal. "You're not a raiSE member" has a remedy.

**Guards and groups.** A criterion may carry `when: {field, op, value}` — if it doesn't
hold, the criterion is `SKIPPED` and scores nothing; if the guard's own field is unknown,
the criterion is `UNKNOWN`. Criteria sharing a `group` id with `group_mode: "any_of"` are
scored together: MET if any member is MET. Needed because the operator set has no OR and
raiSE's rule is genuinely "VWO partnership AND/OR beneficiary validation".

`applies_at_stage` is parsed and deliberately ignored in v1 — treating everything as
applying now is more conservative and never wrong.

---

## 7. File ownership — one file, one owner, no exceptions

| Path | Owner | Others may |
|---|---|---|
| `/src/screens/**` | **A** | read only |
| `/src/components/**` | **A** | read only |
| `/src/App.tsx`, router, `index.css`, tokens | **A** | never touch |
| `/src/lib/elicit.ts`, `draft.ts`, `acra.ts`, `eligibility.ts` | **B** | read only |
| `/src/types/contract.ts` | **B** | **import from, never edit** |
| `/data/profile.schema.json` | **B** | read only |
| `/prompts/**` | **B** | read only |
| `/data/rules/*.json`, `/data/schemas/*.json`, `stages.json`, `glossary.json` | **C** | read only |
| `/fixtures/demo-founder.json` | **C** | read only |
| `/fixtures/responses/**` | **B** | read only |
| `package.json`, `package-lock.json` | **A only runs installs** | see below |

**Need a change in someone else's file? Message them. Do not edit it "quickly" — that is
exactly the edit that conflicts.**

---

## 8. Git protocol

Branches: `feat/a-screens` · `feat/b-lib` · `feat/c-rules`. Merge to `main` only.

1. **Commit small, commit often.** A 20-line commit conflicts survivably; a 400-line one doesn't.
2. **`git pull` before every push.** Every time.
3. **Never edit a file you don't own.** 90% of conflicts die right here.
4. **Only A installs packages.** Need a dependency? Ask A, A installs, A pushes, you pull.
5. **Lockfile conflict → never hand-merge.** `git checkout --ours package-lock.json && npm install`, commit the result.
6. **Feature freeze noon Day 3.** After that: bug fixes on `main` only, and only if the click path breaks.
7. **No `.env`, no API key, ever** (CONTEXT.md §11). If you find yourself typing `VITE_..._KEY`, stop.

---

## 9. Changing the frozen schema

`profile.schema.json` and `contract.ts` are frozen. Changing a field name mid-build costs
roughly an hour across three people, so:

1. Post in the group chat: **which field, what to, why.**
2. All three thumbs-up. In writing, in the chat, so there's a record.
3. **B makes the edit** — to both `profile.schema.json` and `contract.ts`, same commit.
4. B posts "schema updated, pull now."

**Additive changes** (a brand-new optional field, nullable) need only B's sign-off and a
heads-up. Rename or type change needs all three. After noon on Day 3: nothing changes.

---

## 10. Day 2 handshake — B ↔ A

- [ ] B pushes `contract.ts` + `profile.schema.json` — **A pulls before writing any more state code**
- [ ] A replaces every locally-declared profile/result type with imports from `contract.ts`
- [ ] B pushes stub `lib/*.ts` returning fixture data with the real signatures — A wires screens to the real function names today, not to a temporary mock
- [ ] A confirms the gap-flag rendering rule (§3) is wired to `field_meta`, not to a bespoke flag
- [ ] A confirms `evaluateAll` is called synchronously — no spinner on the readiness map
- [ ] C confirms rules JSON uses only §6 operators and every criterion carries a `label`
- [ ] All three: `npx tsc --noEmit` passes before anyone goes to sleep

---

## 11. If you disagree with a name

Say so **today**. A name that's wrong but frozen costs less than a name that's right but
changed on Day 3. The schema is frozen at end of Day 1 precisely so that the argument
happens now, cheaply, instead of during integration.


---

## 12. Changelog

**v1.0.1 — 9 Sep.** All additive; `profile_version` deliberately stays `1.0.0` so saved
profiles and existing fixtures keep loading.

- Profile: `founder.residing_in_sg`, `venture.project_duration_months`,
  `funding.can_match_capital_sgd` (all nullable, all at C's request for Young ChangeMakers
  and Startup SG Founder).
- Criterion: `terminal`, `terminal_reason`, `when`, `group`, `group_mode`,
  `applies_at_stage`, `depends_on`, `remedy_duration`.
- Rule: `confidence`, `quantum`, `warnings[]`.
- Result: `satisfied[]`, `blockers[]` (pre-sorted by remedy order), `unknowns[]`,
  `warnings[]`, `confidence`, `quantum`. `CriterionOutcome` gained `SKIPPED`.
- Operators: added `gt`, `lt`.
- **VWO, not SSO.** raiSE's term is Voluntary Welfare Organisation. `impact.sso_partnership`
  keeps its key (frozen, A depends on it) but every founder-facing label says VWO.
  CONTEXT.md §5 carries the same error — don't copy it onto a slide.
