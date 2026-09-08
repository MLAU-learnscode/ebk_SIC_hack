# CONTEXT.md

Read this first. This is the shared brief for every team member and for every Claude Code
session in this repo. If you are Claude Code: treat this file as the source of truth for
what we are building and why. Do not invent grant criteria, do not invent statistics.

---

## 0. The 60-second version

We are building a website that helps underserved and disabled youth founders in Singapore
get through funding applications.

The core insight: existing tools help organisations that have already written things write
more things faster. Our users have never written anything.

Two structural gaps nobody in the market fills:
1. **Cold start.** Every AI grant tool requires you to upload past proposals, annual
   reports, logic models. A first-time, pre-incorporation founder has none of these.
2. **Vertical stage progression.** Every tool is built to fill one form once. A single
   funder makes you re-narrate your venture across five stages over 4 to 6 months.

---

## 1. Event constraints

| Item | Value |
|---|---|
| Event | Vibe For Good 2026 (Social Impact Catalyst / Innovation) |
| Challenge statement | #3, by Social Impact Catalyst |
| Deck deadline | **10 Sep 2026, 10:00 a.m.** via Google Form, Google Slides or Canva link only |
| Pitch day venue | Ngee Ann Poly LT58A, 9 a.m. to 5 p.m. |
| Pitch format | 4-minute pitch + 4-minute Q&A, semi-final then final |
| Attendance | At least half the team must be present to pitch |
| Prize | SGD 2,500 + Quest Ventures / SIC startup resources |

**Challenge statement #3 (verbatim):** Entrepreneurship can create pathways to economic
mobility and social impact, yet youths from lower-income backgrounds, persons with
disabilities and other underserved communities may face greater barriers to accessing
capital, networks, skills and mentorship, particularly in developing countries. How might
we leverage AI to make entrepreneurship, especially social entrepreneurship, more
accessible and achievable for underserved youths?

### Judging rubric (five criteria, EQUAL weight, 20% each)

| Criterion | What they score |
|---|---|
| Problem & Solution | Real problem grounded in genuine need. AI used meaningfully, not bolted on. Feasible to build with realistic resources |
| Impact | Measurable impact on target community. Alignment with the chosen challenge statement. Scalable beyond prototype |
| Business Viability | Realistic revenue / sustainability model. Understanding of competitors and what's different. Pathway to scale |
| Team & Execution | Relevant skills, clear roles. Quality and clarity of the prototype/demo. Ability to iterate within the timeframe |
| Pitching | Clear structured storytelling within time. Demo shown clearly. Confident, credible Q&A answers |

**Implication: 60% of the score is won without writing code.** Do not let the build eat
the deck.

---

## 2. Target user

**Wedge (build for this person):** Singapore youth aged 18 to 35, with a disability,
pre-incorporation, trying to start a business or social enterprise. Never submitted a
funding application before.

**Expansion (say this on the scale slide):** low-income SG youth in informal micro-business
(home-based food, gig work).

**Long-term (challenge statement's "developing countries" clause):** ASEAN underserved youth.

Accessibility built for the wedge makes the product better for everyone else. That is the
argument: accessibility is the design constraint that produces the differentiator, not
charity work bolted on.

---

## 3. The three problems

### P1. Eligibility is invisible until you've already spent the hours
Founders don't learn whether they qualify until deep into the process. VFG requires raiSE
membership and, for unincorporated applicants, an SSO partnership or beneficiary
validation. Other schemes have their own age, citizenship and partner rules. None surfaced
upfront in one place. Founders build a deck and financials before discovering they never
qualified.

### P2. Repeated re-narration (two axes, keep them distinct)

| Axis | What repeats | Example |
|---|---|---|
| **Horizontal** | Same facts, reformatted per funder | VFG's deck format vs Startup SG Founder's form vs a bank microloan |
| **Vertical** | Same venture, retold at growing depth to ONE funder over months | VFG's 5 stages: deck, meeting, shortlist, detailed proposal with projections, committee pitch |

Vertical is the sharper claim. A founder can avoid horizontal by picking one funder. They
cannot avoid vertical. **Nobody in the market solves vertical.**

### P3. The pipeline assumes a sighted, neurotypical, admin-fluent applicant

| Barrier | Looks like | Excludes |
|---|---|---|
| Sighted | Dense PDFs, small text, portals that break screen readers | Visually impaired founders |
| Neurotypical | Unstructured text, unclear multi-step flows, unexplained jargon | ADHD, dyslexia, autism |
| Admin-fluent | Expected to produce a 2-year projection or formatted deck unaided | No business education, no mentor access |

P3 compounds P2: fighting the interface adds cost on top of every retelling.

**Parked, do not build:** alternative credit scoring for the informal economy. Real problem,
but you cannot demo a counterparty agreeing to underwrite on it, and it drags you into
credit regulation. Roadmap slide only.

---

## 4. Solution modules

| Module | Solves | AI does | Guardrail |
|---|---|---|---|
| **Readiness Check** | P1 | Turns free text into structured profile fields | Eligibility decided by a **rules engine, never the LLM**. Every result carries `last_checked` and "confirm with the funder" |
| **One Profile, Many Applications** | P2 | Drafts funder-formatted answers from the profile; builds a first-pass projection from plain answers | Nothing submits without founder review. Every AI-supplied number gets a visible gap flag |
| **Accessible-first intake** | P3 | Rewrites jargon to plain language on demand | Confirm-back loop after every extraction. Plain-language sits *alongside* the real funder term, not replacing it. WCAG structure is design work, not AI |

**The one line that answers almost any Q&A challenge:**
> AI drafts, extracts, and translates. It never decides eligibility and never submits.
> Every output has a visible seam showing what came from the founder versus what was
> estimated.

---

## 5. Verified facts (safe to state, with sources)

Do not state anything below without the source. Do not add to this list without a source.

### raiSE VentureForGood (source: raise.sg/ventureforgood-grant)
Five stages, with raiSE's own stated durations:
1. Submit application (pitch deck + management accounts by email) — 3 weeks
2. First meeting (1-on-1 with portfolio manager) — 3 weeks
3. Shortlisting (only raiSE members proceed) — 3 weeks
4. Final evaluation (detailed proposal + financial projections aligned to social impact
   milestones) — 4 to 8 weeks
5. Pitching to Evaluation Committee — 4 to 8 weeks

**Total: roughly 4 to 6 months before any money.**

Documents required to *start*: pitch deck, ACRA profile, management accounts up to 2 years
(if applicable), financial projections of at least 2 years, founding team resumes.

VFG (Youth): ages 18 to 35, key applicant must be Singaporean or PR, must be a raiSE
member. Unincorporated applicants should show an SSO partnership and/or beneficiary
validation. Grants up to $300,000. Competitive grant call, decisions final.

### Startup SG Founder (source: EnterpriseSG / AMP pages)
- Must apply **through an Accredited Mentor Partner (AMP)**. 17 appointed in the first
  batch, including NUS Enterprise, NTUitive, SMU IIE, ACE.
- The AMP screens for qualification, then **works with the applicant to draw up a
  development plan with milestones**, then recommends to the agency.
- Requires a Letter of Recommendation from an AMP to apply.
- First-time entrepreneurs only. Singapore citizens/PRs. Must hold (or propose to hold) at
  least 30% equity. Must not have previously incorporated. Business concept must not have
  received other government funding.
- You do not need to incorporate to apply.
- Grant quantum and matching ratio have changed over time across sources — **verify current
  figures before quoting a number on stage.**

### Myinfo Business (source: singpass.gov.sg, GovTech)
- With owner consent, auto-populates online forms with corporate profile, address,
  ownership, shareholders, financial highlights, from ACRA and other agencies.
- Already powers grant applications to the Business Grants Portal.
- Stated benefits: minimise repetitive filling, fewer human errors, less need for physical
  documents.
- **Integration requires a linkup request via the Singpass API Developer & Partner Portal,
  government-assessed. Not obtainable in a hackathon.** Mock it, label it roadmap.

### SME Centres (source: enterprisesg.gov.sg)
- EnterpriseSG + 5 trade associations, **10 centres** across Singapore.
- Free 1-on-1 business advisory, covering government grants, financing, productivity, HR.
- Limitations for our user: capacity-bound and appointment-based; SME-framed (PSG, EDG,
  MRA) not social enterprise; assumes an operating business; advice is verbal and
  ephemeral.

### PwD employment (source: MSF)
- PwD employment rate 32.7% in 2022/2023, aspirational target 40% by 2030.
- We found **no dedicated PwD entrepreneurship track** in SG. Treat as a gap we could not
  disprove, **not** as a confirmed absence.

### Market context (source: vendor and review blogs — ATTRIBUTE, DO NOT ASSERT)
- A 2026 sector report cited in reviews: 68% of nonprofits say time is their primary
  challenge in grant seeking; 24% say lack of staff is their biggest barrier to applying
  at all.
- Grantable: ~$50 to $150/mo. Core mechanic is "Smart Content Library" / org memory — you
  upload strategic plan, programme descriptions, past funded proposals, outcome reports,
  staff bios, budget summaries at setup.
- Instrumentl: ~$179 to $499/mo. Discovery and pipeline management, US funder database.

---

## 6. Competitors and our position

| Competitor | Type | Usable in SG | Where it stops |
|---|---|---|---|
| GoBusiness Gov Assist | SG gov directory + e-Adviser | Yes, native | Search-shaped not answer-shaped. Returns entries, you do the cross-referencing. No VFG. No drafting. Not accessible-first |
| SME Centres | SG gov, human advisory | Yes, native, free | Capacity-bound, SME-framed, assumes operating business, advice is ephemeral |
| Grantable | US SaaS | Yes | **Requires documents you don't have.** No eligibility gate. Fills one form once |
| Instrumentl | US SaaS | Technically | US funder database, surfaces zero SG grants. Priced for 20+ grant teams |

### Coverage matrix (● full, ◐ partial, ○ none)

| | P1 Eligibility | P2a Horizontal | P2b Vertical | P3 Accessibility |
|---|---|---|---|---|
| GoBusiness | ◐ | ○ | ○ | ○ |
| SME Centres | ◐ | ○ | ○ | ○ |
| Grantable | ○ | ● | ○ | ○ |
| Instrumentl | ◐ | ◐ | ◐ | ○ |
| **Us** | ● | ● | ● | ● |

**The P2b column is empty for everyone else. That is the pitch.**

### Positioning one-liners
| Their promise | Our promise |
|---|---|
| GoBusiness: "here is what exists" | "here is what to do next" |
| SME Centres: "book a slot and talk to someone" | "the mechanical 80% handled, so scarce human hours go to judgement" |
| Grantable: "upload your RFP, get a draft" | "you have nothing to upload, so we build the profile by talking to you" |
| Instrumentl: "track 20 grant relationships" | "get your first one right" |

### The killer line
> Grantable helps organisations that have already written things write more things faster.
> Our users have never written anything.

### Prior art we extend (strong for SG judges)
The Singapore government has already implemented both halves of our thesis, separately,
for the mainstream case:
- **Myinfo Business** proves you should never re-enter what the system already knows. It
  cannot help someone with no ACRA record yet.
- **The AMP network** proves first-time founders need something drawn out of them before
  they can apply. It does not scale, and it gates on whether you are worth a mentor's hour.

We sit between the two: **the pre-incorporation founder who has nothing for Myinfo to
prefill and hasn't yet earned an AMP's time.**

---

## 7. Architecture

**Hard constraint: this build costs $0.** No paid APIs, no paid hosting, no API keys in the
repo. Every layer below is either a local file, a pure function, a free public endpoint, or
a browser built-in.

| Layer | What | Cost | Notes |
|---|---|---|---|
| Frontend | SPA, one question per screen | $0 | Voice via browser Web Speech API — built in, no key, Chrome |
| Elicitation | **Pre-filled / cached responses** read from `/fixtures/responses/` | $0 | No live model call. See §7.1 |
| Eligibility | **Pure function over rules JSON. No LLM.** | $0 | The soundness guarantee. Runs offline. Never put a model here |
| Drafting | **Pre-filled** funder-formatted output with gap flags | $0 | No live model call |
| Jargon rewrite | Static lookup dictionary, `/data/glossary.json` | $0 | Never needed a model |
| Persistence | Profile JSON in browser storage, versioned by stage | $0 | P2 vertical |
| Verification | data.gov.sg ACRA lookup | $0 | Free forever under Open Data Licence, no auth |
| Hosting | GitHub Pages / Netlify / Vercel / Cloudflare Pages free tier | $0 | See §7.2 |

**The readiness map — our single best screen — has no model dependency and never did.**
It is a pure function over local JSON. It works with the wifi switched off and it cannot
hallucinate. Zero-cost architecture and our soundness claim are the same design decision.
Say this on stage.

### 7.1 The pre-filled approach

We are not making live model calls. Demo content is pre-generated and committed as
fixtures. Two ways to author that content — **prefer A**:

| | How | Q&A line | Risk |
|---|---|---|---|
| **A. Prompt-authored (preferred)** | Write real prompt templates into `/prompts/`. Run them once through any free chat interface with the demo persona's inputs. Save outputs to `/fixtures/responses/` | "The prompts and pipeline are real, outputs are pre-generated for demo reliability, live wiring is one config flag" | Low. ~40 min of work, $0 |
| **B. Hand-authored** | Team writes the fixture text directly | "We used pre-filled options; AI is a roadmap item" | Higher. See warning below |

**Warning on option B.** The rubric explicitly scores *"AI is used meaningfully to solve it,
not just added on"* under Problem & Solution, at an AI hackathon with Claude SG as knowledge
partner. Saying "we skipped AI due to cost" is weak in that room — the actual spend for this
build is a few dollars, so cost is not a credible constraint to judges assessing commercial
viability. It also undercuts our core differentiator: our gap versus Grantable is **cold
start**, and cold start is solved by *elicitation*. If elicitation is just a form, we are a
form builder and Grantable wins on everything else.

Option A gives an identical demo, identical $0 cost, and a much stronger answer.

**Never** hand-write fixture text and present it as model output. Either it came from a real
prompt (option A) or we describe it as pre-filled (option B). No third option.

Config flag `USE_CACHED_RESPONSES` defaults to `true`. Live wiring stays in the code, off.
No API key ever enters the frontend or the repo.

### 7.2 Hosting

**What we actually submit is the deck, not a website.** A shareable Google Slides or Canva
link by 10 Sep 10:00 a.m. The organisers' "test in incognito" warning is about *that link*.

The prototype is demoed live from a laptop during the 4-minute pitch. No URL is required.

| Setup | Purpose | Priority |
|---|---|---|
| **Run locally on the presenting laptop** | The actual demo. No wifi dependency at all | **Primary. Lowest risk** |
| Static host (GitHub Pages etc.), free tier | Learning goal + backup if the laptop dies | Secondary, nice to have |

Static hosting means everything runs client-side. Fine for us: rules engine is a pure
function, fixtures are local files, ACRA is a public no-auth endpoint. **Because there is no
backend, no API key may ever be shipped to the client — the pre-filled approach removes that
problem entirely.**

### Endpoints

**Usable now, no gate:**
- `https://data.gov.sg/api/action/datastore_search?resource_id={id}` — ACRA registered
  entities: UEN, name, type, status, registration date, primary SSIC, address. 1.5M+
  records, monthly updates, free under Open Data Licence. No auth needed (API key only
  raises rate limits). **Split into 27 datasets by first letter — hardcode one or two for
  the demo.**
- `https://api-production.data.gov.sg/v2/public/api/collections/2/metadata` — collection
  metadata for discovering dataset ids.
- `https://api.anthropic.com/v1/messages` — the AI layer.

**Gated, roadmap only:** Myinfo Business API, Business Grants Portal.

**There is no public API for SG grant criteria.** Not GoBusiness, not raiSE, not
EnterpriseSG. Rules are hand-authored JSON. This is a feature: every rule cites its source
and is auditable.

### Repo layout
```
/src
  /screens          # A owns
  /components       # A owns
  /lib
    elicit.ts       # B owns — reads fixtures, live path behind flag
    draft.ts        # B owns — reads fixtures, live path behind flag
    acra.ts         # B owns — real call, free endpoint
    eligibility.ts  # B owns — PURE FUNCTION, no model, ever
/data
  profile.schema.json   # B owns, FROZEN after day 1
  glossary.json         # C owns — jargon to plain language lookup
  /rules
    vfg.json            # C owns
    startup-sg-founder.json
  /schemas
    vfg.mapping.json    # C owns
  stages.json           # C owns
/prompts                # B owns — real prompt templates, committed
  elicit.txt
  draft.txt
/fixtures
  demo-founder.json     # C writes day 1 so A is never blocked
  /responses            # B owns — pre-generated demo content
    elicit-step-1.json ... elicit-step-n.json
    draft-vfg-answer.json
```

**No `.env`, no API key, no secret in this repo.**

### Rules JSON shape
Every rule carries its provenance:
```json
{
  "grant_id": "raise-vfg-youth",
  "name": "VentureForGood (Youth)",
  "source_url": "https://www.raise.sg/ventureforgood-youth.html",
  "last_checked": "2026-09-07",
  "criteria": [
    { "field": "age", "op": "between", "value": [18, 35], "blocking": true },
    { "field": "citizenship", "op": "in", "value": ["SG", "PR"], "blocking": true },
    { "field": "raise_member", "op": "eq", "value": true, "blocking": true,
      "remedy": "Apply for raiSE membership", "remedy_order": 1 }
  ]
}
```
Three output states per grant: `eligible_now`, `eligible_after_steps` (with an ordered
remedy list), `not_a_fit`.

---

## 8. Roles

| Role | Owns (code) | Owns (deck) |
|---|---|---|
| **A. Experience Lead** | Screens, voice input, accessibility, demo click path | Problem, target user, empathy, demo walkthrough, UX |
| **B. Intelligence Lead** | Claude calls, profile schema, gap flags, ACRA lookup, integration | Solution architecture, AI soundness, how-it-works, feasibility |
| **C. Rules & Strategy Lead** | Rules JSON, schema mappings, stage model, eligibility function, fixtures | Competitors, business viability, impact metrics, Q&A bank |

### Schedule

| | Day 1 (7 Sep) | Day 2 (8 Sep) | Day 3 (9 Sep) |
|---|---|---|---|
| **A** | Repo scaffold, 3 screens on fixture JSON, click path end to end | Voice input, accessibility pass, polish readiness map | Integrate by noon, rehearse demo 10+ times |
| **B** | **Freeze `profile.schema.json`**, ship elicitation call | Drafting with gap flags, ACRA lookup, wire to A | Bug fixes only after noon |
| **C** | VFG rules JSON + stage model, write `demo-founder.json` for A | 2 more grants, schema mappings, eligibility function | Deck lock, Q&A bank, full rehearsal |

### Non-negotiables
1. `profile.schema.json` frozen end of day 1. Changes need all three to agree in writing.
2. C authors rules JSON, B writes the function reading it. Never the same file.
3. A builds against C's fixtures from hour one. Never blocked on B.
4. **Feature freeze noon on day 3.** Merge to `main` only.
5. Demo done = click path runs 3 times in a row without crashing on the presenting laptop.
6. Everyone rehearses the pitch. Q&A is explicitly scored.
7. Slides drafted from day 1, not day 3.
8. Test the submitted link in incognito. Organisers explicitly disclaim access issues.

---

## 9. MVP scope

**Build:** rules engine with 2 to 3 SG grants, conversational intake, readiness map, one
generated output with gap flags, accessibility basics.

**Mock in slides:** multi-funder submission, partner dashboard, ASEAN expansion, Myinfo
prefill.

**Do not build:** alternative credit scoring, document upload parsing, real submission to
any portal.

### The 90-second demo
1. Open on intake **already mid-conversation** (do not type every question live, too slow)
2. Cut to readiness map showing 3 grants in 3 different states
3. Tap the `eligible_after_steps` one, show the blocking step and the remedy order
4. Cut to a generated answer with its gap flag

Story: found out fast, told exactly what's missing, got a draft instead of a blank page.

---

## 10. Q&A prep

| Question | Answer |
|---|---|
| What if the AI hallucinates eligibility? | It can't. Eligibility is a lookup against hand-authored rules with cited sources, not a generation. The LLM only structures the founder's input |
| Isn't this just GoBusiness with a nicer front end? | GoBusiness answers "what schemes exist." Founders are asking "what should I do next." It's retrieval-shaped, not answer-shaped. It also has no VFG and no drafting |
| Couldn't Grantable add a questionnaire? | Their engine retrieves and reuses an existing library. Elicitation is a different problem: drawing out facts never articulated, then validating them back. And it doesn't fix their second gap, that their unit of work is one document, not a multi-month funnel |
| Why hasn't this been built? | Every incumbent is US or UK/EU and none encode SG social enterprise criteria. Geography alone isn't a moat, but combined with cold start and vertical progression it is |
| Who pays? | Founder side free. The intermediary pays: raiSE, VFG (Youth) partners like NUS Enterprise, SG Enable. They get pre-qualified, complete applications and lower screening cost. **Frame as pathway to revenue, not confirmed revenue — nobody has told us they'd pay** |
| Are you replacing SME Centres / AMPs? | No. We handle the mechanical 80% so scarce human advisory hours go to judgement calls. We feed their pipeline |
| Is this actually running live? | **If option A (§7.1):** "The prompts and pipeline are real. Outputs are pre-generated so the demo doesn't depend on venue wifi. Live wiring is one config flag." **If option B:** "Pre-filled for this prototype; the elicitation layer is the next build step." Then immediately pivot: "The eligibility engine you just saw *is* live — it's deterministic by design, which is why it can't hallucinate" |
| Where does AI actually add value here? | Elicitation. Everything else in the market assumes you have documents to upload. Our users have never written anything, so the hard part is drawing facts out of someone and structuring them — not retrieving what they already wrote |

### Claims discipline
- raiSE, EnterpriseSG, ACRA, MSF, Singpass facts: **state flat.**
- Grantable / Instrumentl pricing and user counts, and the 68%/24% stat: **attribute,
  don't assert.** "According to industry reviews..."
- Never say "there is no agentic solution." Say **"we found no agentic solution covering
  SG social enterprise and youth grants."**
- Never invent a statistic, a competitor feature, or a grant criterion.

---

## 11. Notes for Claude Code

- **This build costs $0.** Do not add a paid dependency, do not write code that calls a
  paid API at runtime, do not create a `.env` or ask for an API key. Demo content comes
  from `/fixtures/responses/`.
- Do not put an LLM in the eligibility path. Ever. It is the pitch's soundness guarantee.
- Do not fabricate grant criteria. If a rule isn't in section 5, it needs a source URL
  before it goes in a rules file.
- Do not attempt Myinfo Business integration. It is government-gated. Mock the button.
- Accessibility is a hard requirement, not a stretch goal: semantic labels, focus order,
  no time limits, generous text size, one question per screen.
- Prefer shipping 3 screens that work over 8 that don't. The rubric scores demo clarity.
- When in doubt about scope, re-read section 9.
