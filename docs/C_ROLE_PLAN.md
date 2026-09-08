# Role C — Rules & Strategy Lead: audit and plan

Written 2026-09-08. Companion to `SOURCES.md` (the fact ledger) and
`INTERFACE_CONTRACT.md` (the C⇄B⇄A boundary).

---

## 1. What is GIVEN — settled by the brief, do not relitigate

These are decided. Spending time re-opening them is the single biggest time sink available
to this team.

- **Event and rubric** (CONTEXT §1) — deck due 10 Sep 10:00, five criteria at 20% each.
  60% of the score is deck and pitch, not code.
- **$0 architecture, no live model calls** (§7). Pre-filled fixtures, option A.
- **No LLM in the eligibility path, ever** (§7, §11). This is the soundness guarantee and
  the entire answer to the hallucination question in Q&A.
- **Repo layout and file ownership** (§7).
- **Rules JSON shape and the three output states** (§7) — `eligible_now`,
  `eligible_after_steps`, `not_a_fit`.
- **Non-negotiables** (§8), especially: schema frozen end of Day 1; C authors rules, B
  writes the function; feature freeze noon Day 3.
- **MVP scope** (§9) — 2–3 grants, readiness map, one generated output, accessibility
  basics. Nothing else.

## 2. What is PROVIDED — usable immediately, zero research needed

Everything C needs for the critical path is already in CONTEXT §5. **Nothing that blocks
you required any research at all** — that is the most important finding in this document,
because it means the Day 1 slip was avoidable and the remaining work is not
research-bound.

| Deliverable | Facts already available |
|---|---|
| `stages.json` | VFG's five stages with raiSE's own durations (§5), confirmed live |
| `rules/vfg-youth.json` | Age 18–35, SG/PR key applicant, raiSE membership, unincorporated → VWO partnership / beneficiary validation |
| `rules/startup-sg-founder.json` | AMP + Letter of Recommendation, first-timers only, SG/PR, ≥30% equity, never previously incorporated, no other gov funding for the concept |
| Deck: competitors | Full competitor table, coverage matrix, positioning one-liners, killer line (§6) |
| Deck: viability | "Who pays" framing — intermediary pays, framed as pathway not confirmed revenue (§10) |
| Deck: impact | PwD employment 32.7% → 40% by 2030 target (§5) |
| Q&A bank | Eight prepared answers (§10) plus claims discipline rules |

## 3. What NEEDED research — and where it landed

Done today. Full detail in `SOURCES.md`.

| Item | Outcome |
|---|---|
| Third grant for the MVP | **Resolved — Young ChangeMakers (NYC).** 15–35, SG/PR, no incorporation and no membership required, up to $3k–5k @ 80%, 6-month projects. It is the clean `eligible_now` our persona needs. |
| raiSE membership prerequisites | **Verified, and it is the best thing we found.** raiSE requires an ACRA-registered business, charges $100, and takes 4–8 weeks. |
| VFG (Youth) quantum | **CONTEXT.md is likely wrong.** §5 pairs "Youth" with "up to $300,000"; $300k is the *general* VFG figure. The youth track appears to be **S$20,000**. Do not put $300k next to "Youth" on a slide. |
| VFG (Youth) source URL | **Dead.** The URL in §7's example JSON 404s. Every rule needs a live `source_url`. |
| "SSO partnership" | **Wrong term.** Sources say VWO / SSA. SSO is a Social Service Office — a different entity. |
| Startup SG Founder quantum | **Vendor blogs only** (S$20–50k, 1:1 since Apr 2024). Attribute or omit; it is display metadata and no criterion depends on it. |
| Disability-specific track | **ELI Grant exists** (SG Enable / Tote Board, min $80k, disability innovation). It funds *projects by organisations*, not first-time founders — so it does not contradict our gap claim, and it is a better-informed answer than "we found nothing." |
| ACRA `resource_id` | **Still open.** Low priority, B needs it for `acra.ts`. |

### The finding that should shape the demo

A pre-incorporation founder cannot get raiSE membership, because raiSE requires an
ACRA-registered business. They cannot pass VFG stage 3, because only raiSE members
proceed. So the real path is a **chain**, and every link is sourced:

> register with ACRA → apply for raiSE membership ($100, 4–8 weeks) → then VFG, whose own
> five stages run 4–6 months

That chain *is* `eligible_after_steps` with `remedy_order`. It is the screen that proves
the product, and nothing in the market shows it to a founder today.

### Pick the three grants so the persona lands in three different states

CONTEXT §9 wants three grants in three states on screen. Choose deliberately:

| Grant | State for our persona | Why it lands there |
|---|---|---|
| **Young ChangeMakers** | `eligible_now` | 15–35, SG/PR, no incorporation, no membership needed |
| **VFG (Youth)** | `eligible_after_steps` | the ACRA → raiSE chain above. **The hero screen.** |
| **Startup SG Founder** | `eligible_after_steps` + warning | needs an AMP Letter of Recommendation and 1:1 matching capital, plus the sequencing warning below |

**The sequencing warning is the sharpest beat in the demo.** Startup SG Founder requires
the concept has not received other government funding. YCM *is* government funding. Taking
the small grant first may close off the large one — an interaction no founder can see and
no competitor surfaces. We ship it as a warning with "confirm with the funder", never as
an assertion, because we have not confirmed the interpretation with either funder. That
restraint is also the honest answer if a judge pushes on it.

---

## 4. Plan

We are on Day 2 of a three-day schedule with Day 1 undone. The saving grace is §2 — none
of the remaining critical path is research-bound.

### Today (8 Sep) — ordered by who you unblock

| # | Task | Unblocks | Est |
|---|---|---|---|
| 1 | **Field vocabulary PR to B** (`data/profile.fields.proposal.json`, written) | B *and* A. Everything waits on the frozen schema | 30 min |
| 2 | `fixtures/demo-founder.json` — the persona, landing in the three states above | A, immediately | 45 min |
| 3 | `data/stages.json` — VFG's five stages, durations verified today | A's vertical-progression screen | 30 min |
| 4 | `data/rules/nyc-ycm.json` — simplest, proves the shape end to end | B | 30 min |
| 5 | `data/rules/vfg-youth.json` — the remedy chain, `remedy_order` 1→2→3 | B. **Highest demo value** | 1 hr |
| 6 | `fixtures/eligibility-cases.json` — expected outputs B codes against | B, without touching B's file | 45 min |
| 7 | `data/rules/startup-sg-founder.json` + sequencing warning | B | 45 min |
| 8 | `data/glossary.json` — jargon → plain language (VWO, AMP, ACRA, UEN, raiSE member, management accounts) | A | 30 min |

Stop at #6 if time runs short. Two grants that work beat three that half-work, and §9 says
2–3.

### Tonight — the 60%

Deck sections C owns: competitors, business viability, impact metrics. All source material
is in §6 and §10; this is assembly, not invention. Do not let it slide to Day 3 —
non-negotiable #7 exists because it always slides.

### Day 3 (9 Sep)

Deck lock. Q&A bank. Full rehearsal. **Feature freeze noon.** Add the four CONTEXT.md
corrections from `SOURCES.md` to the Q&A prep — a judge who knows the sector is exactly
who will ask about the $300k.

### Day 4 (10 Sep)

Submit by 10:00. Test the link in incognito (non-negotiable #8).

---

## 5. Merging cleanly with B

Full detail in `INTERFACE_CONTRACT.md`. The three things that matter:

1. **The ownership contradiction is resolved.** §8's table gives C the eligibility
   function; §7 and non-negotiable #2 give it to B. B owns `eligibility.ts`. C owns the
   rules and the test cases. C never opens a file under `/src`; B never opens one under
   `/data`. **Zero file overlap means merge conflicts are structurally impossible** — the
   one exception is `profile.schema.json`, handled by a single PR today.

2. **The operator set is closed.** `eq`, `neq`, `in`, `not_in`, `between` (inclusive),
   `gte`, `lte`, `gt`, `lt`, `exists`. C writes only these; B implements only these.
   Adding one is a contract change needing both.

3. **The null-value question must be settled before B writes the function.** CONTEXT §7
   defines three states but never says what happens when a profile field is `null` — and
   our whole premise is a profile that starts empty. Treat null as fail and every grant
   renders red; treat it as pass and we lose the soundness claim. The contract proposes
   keeping three states and splitting the reasons into `blockers` vs `unknowns`. **Get B's
   agreement on this today** — it is cheap now and expensive after `eligibility.ts` exists.

The chain from C to A runs through B: C's rules → B's engine → A's readiness map. So the
result shape in `INTERFACE_CONTRACT.md` §4 is really a three-way agreement. Two things A
must be able to count on: `satisfied` is populated even when the state is bad (the green
ticks are the emotional payoff, not decoration), and `blockers` arrives pre-sorted by
`remedy_order` so A renders the array as given.
