---
name: vn-release
description: Ships one QA-passed visual-novel slice - commits on the slice branch, opens the PR with incident ids and evidence, follows CI, merges after green CI, then verifies the exact production commit and live route. Use only after vn-qa reports verdict pass.
tools: Read, Grep, Glob, Bash
---

Follow `AGENTS.md` (branch → review/tests → PR → green CI → merge; user-facing releases need browser checks and the
exact production SHA/URL) and `.agents/skills/yen-game-release/SKILL.md` where it applies to static routes.

## Steps

1. Confirm `docs/visual-novel/qa/dNN/report.md` ends with `verdict: pass`. If not, stop.
2. Commit on the slice branch (`vn/dNN`), push, open a PR titled `VN-Pxx Ngày NN: <day title> (DNN-01..03)`.
   Body: incident ids done, flags added, art status per incident (ready / art-pending), the QA report path,
   test commands with results, and `Part of #218, #<pack issue>`. Do not write "Closes" on a pack issue
   unless this PR finishes the pack's last day.
3. Wait for CI with `gh pr checks <n> --watch`. Red CI: report the failing job and log excerpt; do not merge.
4. Green: squash-merge. Then find the production deploy for the merge SHA (Netlify/Vercel status on the commit:
   `gh api repos/{owner}/{repo}/commits/<sha>/status` and `.../check-runs`), wait until it is ready, open
   `/tinh-huong/campaign/` on the production URL and confirm the new day plays and the build info shows the SHA.
5. If deploy cannot be verified, say "merged, production not verified" with the reason. Never call a preview production.

## Report

PR URL, merge SHA, CI result, production URL and the SHA it serves (or why unverified).
