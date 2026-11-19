# Phaser archive and UI foundation audit

Audit date: 19/11/2026. Active product: [Yên Lab epic #124](https://github.com/vanphamvn/yen-nghi-choi/issues/124). Scope: [F01 #125](https://github.com/vanphamvn/yen-nghi-choi/issues/125) and [F02 #126](https://github.com/vanphamvn/yen-nghi-choi/issues/126).

## Workflow inventory and decision

| Resource | Observed trigger/behavior before change | Decision |
|---|---|---|
| `.github/workflows/game-2d-coding-runner.yml` | `workflow_run` after successful Game 2D sprite contract, configuration `push`/`pull_request`, manual dispatch; could call Codex with an API key and publish draft game PRs | Replace with a manual-only, read-only archive notice. No model action, credentials, code generation or publishing remains. A future owner reactivation requires a reviewed source change. |
| `.github/workflows/game-2d-contract.yml` | `push`/`pull_request` path filters and manual dispatch; tests archived game assets/runtime, browser smoke, production content | Keep unchanged. This is verification, not development. Successful runs no longer trigger the coding runner. |
| `.github/workflows/ui-design-contract.yml` | UI policy/design `push`/`pull_request`; runs design audit | Keep unchanged for active website work. |
| Netlify `netlify.toml` | Static publish root; build writes revision info through `game/preview-2d/tools/write-build-info.mjs` | Keep build command and source. The script is shared deployment provenance, not an autonomous development task. |
| ChatGPT task “Game Yên QA song song” | Automation inventory returned `is_enabled=false` on 19/11/2026 | Keep paused. No enabled Phaser task was returned. No unrelated task changed. |

The workflow inventory contained exactly the three workflow files above. None contained a `schedule` trigger. No source or asset under `game/` is deleted or rewritten. Existing `/game/` and `/game/preview-2d/` routes remain archived references; this change makes no claim about their live health or a new deployment. Repository variables/secrets and third-party provider jobs were not changed.

## Issue and PR triage

The following open Phaser tickets were read from the GitHub inventory and mapped against the archived roadmap. Recommended disposition is **close as `not_planned`**, linking #124 and #125, preserving existing discussion and acceptance evidence. Closing does not claim the original work completed:

| Tickets | Original scope | Reason |
|---|---|---|
| #84, #94 | Phaser migration and autonomous completion epics | Superseded by explicit owner product decision. |
| #86, #93, #115, #116 | Character/scene art and style remediation | Further Phaser art production is archived; unresolved debt stays documented. |
| #97, #98, #121 | Animation, NPC routine and café scene interaction | Further game gameplay development is archived. |
| #100, #101, #118 | Game QA/release and mobile defects | No active game release is planned; do not call outstanding checks passed. |

Older 3D issues #72, #73, #75, #76, #77, #78, #83 and draft PRs #79/#80 were also found open. They are **outside this Phaser freeze** and must stay unmerged; they are not candidates for the Lab roadmap. This audit does not alter their status. The only other open PR returned was Tarot draft #14, also outside scope. No open Phaser implementation PR was returned. Website QA/research issues #37/#38 remain outside the closure set.

External issue closures are separate from the source change; this document records the disposition, not an unperformed mutation. Reconcile GitHub state after publishing before marking F01 done.

## F02 / PR #123 evidence

- GitHub reports PR #123 merged, merge commit `173670191ccf33f32ba688f6dce24752a52aab59`.
- On PR head `226fe32019b6c510d03f340a7e80425ced5428ef`, checks `audit`, `sprites-and-routines`, `browser-smoke`, Netlify headers and Vercel preview completed successfully; Netlify redirect/pages checks were neutral. `production-content` was skipped for the PR context, not a production verification.
- Main contains `DESIGN.md`, canonical Codex/Claude skill entrypoints and QA checklist; README describes Yên Lab as not yet asserted deployed. The PR diff adds documentation/audit tooling, not React/GSAP/WebGL runtime dependencies.
- Re-run `npm run test:design` on the assembled checkout; a passing PR check does not replace verification of subsequent changes. Do not report F02 newly merged in this session or production verified from this audit.

## Verification and remaining gates

`node --test .github/codex/game-freeze.test.mjs` passed locally on 19/11/2026 (1 test, 0 failures; Node v24.22.1), checking that the archive workflow is manual-only, read-only and contains no model/publishing action. Review the preserved workflow diff and ensure site deployment configuration remains intact. This static freeze check is not homepage browser QA, provider revision verification or a production deploy. Record actual CI and production evidence in the release PR before closing release gates.
