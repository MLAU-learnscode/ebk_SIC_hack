# Version control guide

Three people, three days, one repo. This is deliberately minimal — the goal is to never
lose work and never block each other, not to run a textbook Git workflow.

## One-time setup (each person, once)

```bash
git clone https://github.com/MLAU-learnscode/ebk_SIC_hack.git
cd ebk_SIC_hack
git config user.name "Your Name"
git config user.email "you@example.com"
```

If you don't have push access yet, ask whoever owns the repo to add you as a collaborator
(GitHub repo → Settings → Collaborators).

## The model: one branch per owner, short-lived, merge often

Each role owns a lane (CONTEXT.md §8). Work on your own branch, push it, open a PR into
`main`, merge as soon as it doesn't break the click path. Don't let branches live more than
a few hours — the whole point of the frozen schema (§7, §8 non-negotiable #1) is that you
shouldn't need to.

```bash
git checkout main
git pull
git checkout -b a/screens        # or b/elicitation, c/rules — pick one prefix per person
# ... do work ...
git add <specific files>         # never `git add -A` blind — check what you're staging
git status                       # confirm nothing unexpected (no .env, no node_modules)
git commit -m "Add readiness map screen skeleton"
git push -u origin a/screens
```

Then open a PR on GitHub (`gh pr create` or the web UI) and merge it yourself once it
builds — with a 3-person team on a deadline, don't wait on formal review for every commit.
Reserve actual review for anything touching `profile.schema.json` or the rules JSON shape,
per §8 non-negotiable #1.

## Daily flow

- **Start of session:** `git checkout main && git pull` before branching off again, so
  you're never building on stale fixtures.
- **Commit small, commit often.** A commit per working increment (one screen, one rule
  file, one fixture) — not one giant end-of-day commit. If something breaks, you want a
  small diff to bisect, not a day's work.
- **Never commit secrets.** No `.env`, no API key, anywhere, ever — this build is
  explicitly $0/no-paid-API (CONTEXT §7, §11). The `.gitignore` already excludes `.env*`.
- **Never force-push `main`.** If you need to force-push your own feature branch after a
  rebase, that's fine; `main` is shared, treat it as append-only.

## Merge conflicts

They'll mostly happen in shared files: `profile.schema.json`, `stages.json`, rules JSON.
That's exactly why §8 non-negotiable #1 says the schema is frozen after Day 1 and changes
need all three people to agree first — so conflicts there should be rare by construction.

If you do hit one:
```bash
git checkout main && git pull
git checkout your-branch
git merge main          # resolve conflicts in your editor, then:
git add <resolved files>
git commit
git push
```
Never resolve a schema conflict alone — ping the other two first, per the non-negotiable.

## Feature freeze (Day 3, noon)

Per §8: after noon on Day 3, only bug fixes land, and only via merge to `main`. No new
branches, no new features. Tag the commit you're demoing from so you can always get back
to a known-good state:

```bash
git tag demo-ready
git push origin demo-ready
```

## Quick reference

| Situation | Command |
|---|---|
| Start new work | `git checkout main && git pull && git checkout -b yourname/thing` |
| Check what changed before committing | `git status` then `git diff` |
| Save work | `git add <files>` → `git commit -m "..."` → `git push` |
| Get teammates' latest | `git checkout main && git pull` |
| Recover a deleted/broken file | `git checkout main -- path/to/file` |
| See who changed what | `git log --oneline --all --graph` |
