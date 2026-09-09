# The interface — what's built and why

Branch: `a/screens` · Stack: React 18 + TypeScript + Vite · **Zero runtime dependencies beyond React.**

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build into dist/
npm run typecheck    # must be clean
npm run test:rules   # 36 engine checks
npm run test:schema  # 7 schema checks
```

---

## The six screens

| Screen | What it does |
|---|---|
| **Welcome** | Two entry points: start fresh, or **"Pick up Ren's session"** which replays her first five answers and drops you at question six. The demo opens mid-conversation because typing five answers live burns half the 90 seconds. |
| **Intake** | One question per screen. Voice input, then a **confirm-back** step that says what we understood and waits for a yes. |
| **Readiness map** | `evaluateAll()` called **synchronously in render** — no await, no spinner, no `useEffect`. Three cards, three states, ordered remedies, source link and last-checked date on every one. |
| **Grant detail** | Every criterion with the founder's own answer beside it, blocking rules separated from advisory ones, and the terminal reason spelled out when a scheme is closed. |
| **Draft** | Funder-formatted answers with the **visible seam** — every estimated span highlighted, underlined, flagged and announced. |
| **Profile review** | The provenance ledger. Every field, its value, and whether it came from her, our rephrasing, or our estimate. |

## Accessibility — the decisions, not just the checklist

Our wedge user has a disability. That is the design constraint, so these are load-bearing, not polish:

- **Focus moves to the heading on every screen change.** Without it a screen-reader user presses Continue, the view swaps, and their cursor is stranded on a button that no longer exists. Invisible to sighted users, which is exactly why it usually gets skipped. (`useFocusHeading`)
- **Colour is never the only signal.** Every status carries a glyph (`✓ → ✕`) and a word alongside the colour, so it survives colour blindness and a bad projector. Gap flags get a highlight *and* a dotted underline *and* a ⚑ *and* off-screen text.
- **Text scales by token, not by zoom.** The A / A / A control drives `--step`, which everything else is sized from — so the layout stretches instead of overlapping. Verified at largest size with no overflow.
- **Nothing times out, auto-advances, or moves.** No carousels, no toasts, no disabled back. `prefers-reduced-motion` and the manual toggle both kill transitions.
- **The whole choice row is the target**, ≥44px, with the label wired to the input.
- **`access_needs` never touches eligibility.** It shapes the interface and nothing else — the schema forbids any rule file from reading it. Worth saying out loud in Q&A.
- **Plain language sits *beside* the funder's term, never replacing it.** "Funders call this *incorporated*". She has to recognise the word on the real form.
- **Enum values never reach the founder.** `IN_DISCUSSION` renders as "In conversation with one", `25000` as "S$25,000". (`components/display.ts`)

## How this fits B's side

Every screen imports from `src/types/contract.ts` and calls `src/lib/*`. No type is redeclared locally, and nothing in `src/lib/` or `src/types/` was edited to make the UI work — if a screen needed something the contract didn't offer, the screen changed.

**One new file on B's side:** `src/lib/rules.ts` globs `data/rules/*.json`. When C's files land it picks them up automatically with no code change. Until then it falls back to `rules.fallback.ts` and the app shows a banner saying so.

**Delete `src/lib/rules.fallback.ts` the moment C's rules are merged.** Those are example rules following the documented criteria — they are not the source-verified versions, and nobody should show one to a judge as if it were.

## What changed on B's side while building this

The fixtures were re-cut around **Ren**, to match the pitch deck. They previously used a different persona, which would have put the demo and the deck out of step. Same shapes, same schema, new content — and the three states still land:

| Scheme | Ren's result |
|---|---|
| Young ChangeMakers | `eligible_now` |
| VentureForGood (Youth) | `eligible_after_steps` — ACRA, then raiSE |
| Startup SG Founder | `not_a_fit` — the company she registered at 19 |

## Known gaps

- **ACRA lookup is not wired into a screen yet.** `lib/acra.ts` works but still needs a real `resource_id`, and there is no natural place for it until a founder says they *are* registered.
- **No usability testing with screen-reader users.** We built to the standard and to the patterns; we have not watched a real user. Appendix A4 of the deck says so, and we should keep saying so.
- **Voice input is Chrome and Edge only.** The button simply does not render elsewhere; typing always works.
