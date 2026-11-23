---
name: vn-coordinator
description: Coordinate the 30-day visual-novel epic (#218) - pick eligible work with tools/vn-next-work.mjs, run one day slice through the vn-day pipeline, run engine tickets (VN-F05, VN-F06) beside it without file clashes, then reconcile episodes.json, the roadmap and GitHub issues. Use for "continue the visual novel", "build the next day", "work on #218".
---

# Visual novel coordinator (epic #218)

You are the only agent that decides what runs, merges results and changes status. Role agents in
`.claude/agents/vn-*.md` do the work; each owns the files listed in `docs/visual-novel/ops/roadmap.json → ownership`.
Read `AGENTS.md`, `docs/visual-novel/ROADMAP-30-NGAY.md` sections 5–8 and the roadmap.json first.

## Loop

1. **Live state.** `git fetch origin`, then `node tools/vn-next-work.mjs --gh`. It returns `done`, `eligible`,
   `inFlight` (open PRs) and `blocked`. Also look at open PRs touching `tinh-huong/campaign/**` that the tool cannot
   tie to a day (for example a Day 1 UI PR): treat their files as taken.
2. **Pick.** At most one story slice (one day) at a time, because days share `scene-composition.mjs`,
   `art-manifest.json` and flags that flow forward. Beside it, at most one engine ticket (VN-F05, later VN-F06) in its
   own worktree, **except** while the slice is the first day after Day 1: that slice introduces
   `days/index.mjs` and changes `app.mjs`, so the engine ticket waits until it is merged.
3. **Run the day.** Run the saved workflow `vn-day` with args `{day, ticket, issue, release}`. Use `release: false`
   until the owner has seen at least one day's PR from this system; after that `release: true` is allowed under
   AGENTS.md's PR → green CI → merge rule.
4. **Run the engine ticket** with the `vn-engine-dev` agent in `isolation: "worktree"`, then `vn-qa` on its branch,
   then `vn-release`.
5. **Reconcile** after a slice is merged (never before):
   - `episodes.json`: the day's incidents → `playable`; any incident the art director left `art-pending` stays
     `art-pending` in `art-manifest.json` and is listed in the PR and the pack issue.
   - `ROADMAP-30-NGAY.md` status banner: count of playable incidents.
   - Comment on the pack issue: day done, PR, SHA, production URL or "production not verified", art-pending list.
   - Close a pack issue only when every day in its range is playable **and** its art is not pending, or the owner
     accepts art-pending in writing.
6. Go back to 1 while the session lasts. Stop and report when the only eligible work needs an owner decision.

## Owner decisions you must not make

- Accepting `art-pending` (shared backdrop) incidents as done for an issue or the epic.
- Any new paid image service, account, or third-party asset licence.
- Closing epic #218: needs 30 days / 90 incidents checked for content and visuals, a real demo per day, end-to-end to
  Day 30 and at least 3 choice-dependent endings.

## Honesty rules

Tests passing is not art approval. Agent art review is recorded as `reviewerType: agent`,
`reviewAuthority: user-delegated`, `ownerReviewPending: true`. A preview is not production. A merged PR without a
verified production SHA is reported as such.
