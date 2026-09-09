# Groundwork — submission notes and 4-minute script

The deck does two jobs. Judges read it cold before the event, so it has to explain itself
with nobody talking over it. Then you present a subset of it in four minutes.

**17 slides: 13 core + 4 appendix.** Speaker notes are embedded in the .pptx.

---

## Which slides you actually present

| Slide | | Live? |
|---|---|---|
| 1 | Title | ✓ 0:08 |
| 2 | Ren — the founder | ✓ 0:32 |
| 3 | How we researched this | **read only** |
| 4 | Two gaps + the 5-stage timeline | ✓ 0:20 |
| 5 | Competitive landscape | ✓ 0:10 |
| 6 | What we built | ✓ 0:22 |
| 7 | **Demo** | ✓ 1:30 |
| 8 | Architecture — no model in the decision | ✓ 0:20 |
| 9 | What we chose not to do | **read only** |
| 10 | Three things we got wrong and caught | **read only** |
| 11 | Impact and scale | ✓ 0:18 |
| 12 | Viability and team | ✓ 0:25 |
| 13 | Close | ✓ 0:10 |
| A1–A4 | Sources · the ACRA→raiSE chain · roadmap · risks | **read only** |

**Live total: 3:55.** Set up the deck in presenter mode and skip 3, 9, 10 with two extra
clicks, or hide them in Google Slides for the live run and unhide before you submit.

The three read-only slides are the answer to *"did you actually analyse this, or did you
just prompt your way to it?"* — they're the reason the deck is 17 slides instead of 9.

---

## The script

### 1 · Title — 8s
> This is Groundwork. It gets first-time founders through funding applications they've
> never written before.

Don't read the slide. Move.

### 2 · Ren — 32s
> Ren is 24 and visually impaired. She runs a peer-support group for young adults losing
> their sight, and she wants to turn it into training she sells to employers.
>
> At nineteen she registered a tutoring company. It never traded. It was struck off.
> She doesn't know that permanently disqualifies her from Startup SG Founder.
>
> Right now she finds that out five months in, from a rejection email.
>
> Three things are broken. Eligibility is invisible. One funder makes you retell your
> venture five times. And the whole pipeline assumes you can see.

Slowest slide in the deck. This is where Problem & Solution is won.

### 4 · Two gaps — 20s
> Every AI grant tool starts by asking you to upload your past proposals, your annual
> report, your logic model. Ren has none of those. That's the cold-start gap.
>
> And every one of them fills one form, once. Ren's funder makes her retell the same
> venture five times over four to six months. You can dodge the first gap by picking one
> funder. You cannot dodge this one.

### 5 · Landscape — 10s
> The third row is the one that matters — following a single funder across every stage.
> Nobody else solves it. Grantable helps organisations that have already written things
> write more things faster. Our founders have never written anything.

### 6 · What we built — 22s
> Three parts. A readiness check that tells you where you stand before you spend the hours.
> One profile that feeds every funder and every stage. And an intake built for someone
> using a screen reader.
>
> One line to remember: AI drafts, extracts and translates. It never decides eligibility,
> and it never submits.

### 7 · DEMO — 90 seconds

**Open already mid-conversation. Do not type questions live.**

**Beat 1 — 20s**
> Ren has been talking for two minutes. Notice it doesn't just take what she said — it says
> it back. "So you'd be training employers, and you help around forty people a year. Have I
> got that right?" She corrects it here, not five months later.

**Beat 2 — 25s** *(cut to readiness map)*
> Three grants. Three different answers. Young ChangeMakers: she can apply now.
> VentureForGood: after two steps. Startup SG Founder: not a fit — and we tell her why.
> That struck-off company from when she was nineteen. Five months of work she now doesn't do.

**Beat 3 — 25s** *(tap the amber card)*
> And it's not a checklist, it's an order. Register with ACRA first, then apply to raiSE —
> because raiSE won't accept an unregistered business. Reverse those two steps and you've
> told her to do something impossible.

**Beat 4 — 20s** *(cut to draft)*
> Here's her answer, in the funder's format. And this highlight is the seam — that number
> came from us, not from her. She confirms it before it goes anywhere near a funder.

**If it breaks:** slide 7 carries the four beats as text. Talk through them, say *"the engine
behind it runs offline — I'll show you after"*, move on. **Never debug on stage.**

### 8 · Architecture — 20s
> The obvious question is what happens when the AI gets eligibility wrong. It can't.
> Eligibility isn't generated — it's a lookup against rules we wrote by hand, each one
> carrying the funder's own URL and the date we checked it.
>
> The screen you just saw works with the wifi switched off. That's the same design decision
> that makes it free to run.

### 11 · Impact — 18s
> We built for the hardest case on purpose. Design that works for a founder using a screen
> reader works for everyone behind her.
>
> Persons with disabilities in Singapore have a 32.7% employment rate. Employment is being
> worked on. Self-employment isn't — we found no dedicated track.

### 12 · Viability and team — 25s
> Founders never pay. The intermediaries do — raiSE, SG Enable, the mentor partners who
> screen these applications by hand today. They get pre-qualified, complete applications
> instead of half-finished ones.
>
> To be straight with you: that's a pathway to revenue, not confirmed revenue. Nobody has
> told us they'd pay yet.
>
> Three of us, three days, and every rule in the engine cites its source.

Say the "not confirmed revenue" line out loud. It defuses the question before it's asked.

### 13 · Close — 10s
> Singapore already built both halves of this for people who already have a company.
> Ren doesn't have one yet. That's the gap we sit in.
>
> She finds out on day one, not month five.

Stop talking. Take the questions.

---

## Q&A bank

Most hard questions are answered by a slide you didn't present. Turn to it.

**What if the AI hallucinates eligibility?** → *slide 8*
It can't. Eligibility is a lookup against hand-authored rules with cited sources, not a
generation. The model only structures what the founder tells us. 36 automated tests on that
engine, all passing.

**Is this actually running live?** → *slide 8*
The eligibility engine you saw *is* live — deterministic by design, which is why it can't
hallucinate. The drafting outputs are pre-generated so the demo doesn't depend on venue wifi.
*(⚠ Only add "the prompts and pipeline are real" once someone has actually run
`/prompts/*.txt` through a model and replaced the fixtures — see `fixtures/README.md`.
Until then say "pre-filled for this prototype", then pivot straight back to the engine.)*

**How do you know your grant rules are right?** → *slides 3 and 10, appendix A1*
Every criterion came off the funder's own page and carries the URL and the date we checked
it. Our own working brief had three errors in it — we caught them by going back to the
sources. Appendix A1 lists every claim and where it came from.

**Isn't this just GoBusiness with a nicer front end?** → *slide 5, appendix A2*
GoBusiness answers "what schemes exist." Founders are asking "what do I do next." It's
retrieval-shaped, not answer-shaped. And it can't tell you that raiSE membership requires
ACRA registration, so the steps have to happen in that order — that's analysis, not a
directory listing.

**Couldn't Grantable just add a questionnaire?** → *slide 4*
Their engine retrieves and reuses an existing library. Elicitation is a different problem —
drawing out facts nobody has ever written down, then validating them back. And it doesn't
fix their second gap: their unit of work is one document, not a multi-month funnel.

**Who pays?** → *slide 12*
Founders never do. The intermediary does — raiSE, SG Enable, mentor partners. They get
pre-qualified applications and lower screening cost. That's a pathway, not a signed customer.

**Are you replacing SME Centres or mentor partners?** → *slide 12*
No. We handle the mechanical eighty percent so their scarce hours go to judgement calls.
We feed their pipeline.

**Why didn't you build credit scoring for the informal economy?** → *slide 9*
Real problem, and we considered it seriously. But we can't demo a lender agreeing to
underwrite on it, and it puts a student prototype inside credit regulation. Roadmap, not
product.

**Why no Myinfo integration?** → *slide 9*
Two reasons. It needs a government-assessed linkup through the Singpass partner portal —
not obtainable in three days. And it can't help Ren anyway: she has no ACRA record to
prefill. That's exactly the gap we sit in.

**Have you tested with disabled users?** → *appendix A4*
Not yet, and we won't claim otherwise. We built to WCAG structure and the interaction
patterns the research points to. Testing with screen-reader users is the first thing we'd do
next — with actual users, not a proxy.

**What happens when a funder changes a criterion?** → *appendix A4*
One-line data edit, not a code change. Every rule shows its last-checked date to the founder.
At scale the maintainer is the intermediary who already owns that criterion.

**Where does AI actually add value?** → *slide 4*
Elicitation. Everything else in the market assumes you have documents to upload. Our
founders have never written anything, so the hard part is drawing facts out of someone and
structuring them — not retrieving what they already wrote.

---

## Claims discipline — read before you speak

**State flat** (primary sources): raiSE's five stages and 4–6 month durations · raiSE
membership requiring ACRA registration · Startup SG Founder first-time-only, the Accredited
Mentor Partner route, 30% equity · ACRA / data.gov.sg · Myinfo Business · MSF's 32.7%
disability employment rate and the 40% by 2030 target.

**Attribute, never assert:** anything about Grantable or Instrumentl, and the 68% / 24%
figures — *"according to industry reviews."*

**Never say** "there is no agentic solution" or "there is no support for disabled founders."
Say **"we found no…"** every time.

**Do not put S$300,000 next to "VentureForGood (Youth)".** That's the general VFG track.
The figure is deliberately absent from the deck — keep it out of your answers too.

**Never invent** a statistic, a competitor feature, or a grant criterion.

---

## Before you submit — deadline 10 Sep, 10:00

- [ ] Import the .pptx into Google Slides (File → Import slides) or Canva
- [ ] **Set sharing to "Anyone with the link — Viewer"**
- [ ] **Open the link in an incognito window.** The organisers explicitly disclaim access issues
- [ ] Check the speaker notes survived the import
- [ ] Check the ● ◐ ○ symbols on slide 5 render — swap for filled/half/empty shapes if not
- [ ] Swap the product name if the team dislikes "Groundwork" (slides 1, 5, 13)
- [ ] Slide 12 shows roles, not names — add names if the team wants them
- [ ] Confirm the three grant names and states on slide 7 match what the demo actually shows
- [ ] Give slides 4, 5, 9, 11, 12 and A1 to the Rules & Strategy lead first — those overlap
      their ownership under CONTEXT §8
