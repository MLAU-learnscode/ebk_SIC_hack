# ebk_SIC_hack

Vibe For Good 2026 — Social Impact Catalyst, Challenge #3.

**Start here: [CONTEXT_SIC_ClaudeCode.md](./CONTEXT_SIC_ClaudeCode.md).** It is the source
of truth for what we're building, the roles, the schedule, and the rules everyone
(including Claude Code) must follow in this repo. Read it before writing any code.

See [VERSION_CONTROL.md](./VERSION_CONTROL.md) for how the three of us branch, commit, and
merge without stepping on each other during the 3-day build.

## Checks

No dependencies, no install. Run both before merging anything that touches `/data` or
`/fixtures`:

```
node scripts/validate-rules.mjs    # rules, fixture and eligibility cases
node scripts/test-validator.mjs    # proves the validator itself has no holes
```

`validate-rules.mjs` fails the build if a grant rule loses its source, if a blocking
criterion would silently disqualify someone with no stated reason, or if a rules edit
changes what the demo persona sees. See [docs/INTERFACE_CONTRACT.md](./docs/INTERFACE_CONTRACT.md).

## Repo layout

```
/src
  /screens          # A owns
  /components       # A owns
  /lib
    elicit.ts       # B owns
    draft.ts        # B owns
    acra.ts         # B owns
    eligibility.ts  # B owns — pure function, no model, ever
/data
  profile.schema.json   # B owns, frozen after day 1
  glossary.json         # C owns
  /rules               # C owns
  /schemas             # C owns
  stages.json          # C owns
/prompts               # B owns
/fixtures
  demo-founder.json     # C owns
  /responses           # B owns
```

No `.env`, no API key, no secret in this repo. See CONTEXT §7 and §11.
