# fixtures/ — read this before anyone answers a Q&A question about AI

Owner: B.

## What's in here

| File | What it is |
|---|---|
| `elicit-steps.json` | The ten intake questions. Content, not model output. |
| `responses/elicit-NN-*.json` | One cached `ElicitResult` per step |
| `responses/draft-*.json` | One cached `DraftResult` with gap flags |
| `demo-founder.json` | **C owns this.** Not written by B. |

## Provenance — the thing to be careful about

CONTEXT.md §7.1 is blunt about this, so this file is too:

> **Never hand-write fixture text and present it as model output.** Either it came
> from a real prompt (option A) or we describe it as pre-filled (option B).
> No third option.

**As shipped, the text in `responses/` is hand-authored placeholder content in the
correct shape.** It has not yet been through `/prompts/elicit.txt`. That means
right now we are honestly in **option B**, and the only truthful Q&A answer is
*"pre-filled for this prototype; the elicitation layer is the next build step."*

## Getting to option A (40 minutes, $0, much stronger answer)

The prompts in `/prompts/` are real and complete. To move to option A:

1. Open `/prompts/elicit.txt`.
2. For each of the ten steps, fill the placeholders — `{{step_id}}`,
   `{{question}}`, `{{writes_fields}}`, `{{raw_answer}}` (what Amirah would have
   said), `{{profile_answers_so_far}}`.
3. Paste into any free chat interface. Save the JSON it returns over the matching
   file in `responses/`.
4. Same for `/prompts/draft.txt` → `responses/draft-raise-vfg-youth-stage_1.json`.
5. Run `npx tsx verify/fixtures.test.ts` to confirm the shapes still validate.
6. Delete this section and note the date the fixtures were generated.

Then the answer becomes: *"The prompts and the pipeline are real. The outputs are
pre-generated so the demo doesn't depend on venue wifi. Live wiring is one config
flag."*

That is worth forty minutes. The rubric scores *"AI is used meaningfully, not just
added on"* under Problem & Solution, and elicitation is the exact thing that
separates us from Grantable.

## What does not change either way

The eligibility engine is live, deterministic and has no model in it. That claim
is true today and is the one to pivot to if anyone presses on the fixtures:

> "The eligibility engine you just saw *is* live — it's deterministic by design,
> which is why it can't hallucinate."
