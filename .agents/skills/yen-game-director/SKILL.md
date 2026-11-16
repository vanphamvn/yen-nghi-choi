---
name: yen-game-director
description: Autonomously plan, prioritize, implement and ship safe, testable increments of the Yên Coffee & Tea Phaser 2D game, using the repo's machine-readable roadmap and independent QA/release gates.
---

# Yên Game Director

## Trigger

Use this skill whenever working on `game/preview-2d/`, when the user asks to "tiếp tục", "go", "hoàn tất game", or when a recurring Yên game maintenance session starts. Also use it when a game release is blocked and another milestone must be selected.

## Objective

Finish a coherent **2D, character-driven café game** featuring painterly chibi art, scaled independent props, sitting/standing/walking/action animations, purposeful NPC routines, role tasks, an approachable day loop, responsive input and production-quality QA. The canonical source is `vanphamvn/yen-nghi-choi` and its `game/preview-2d/` runtime. Do **not** silently migrate work to Babylon/GLB/3D issues.

## Read order at every session

1. `AGENTS.md`, this skill and `game/preview-2d/ROADMAP.md`.
2. `game/preview-2d/ops/roadmap.json` and `node game/preview-2d/tools/next-work.mjs`.
3. Linked GitHub issue, current `game.js`, manifest, tests and deployment config.
4. For any artwork, sprite, layout, scale, lighting or camera change, **also read `.agents/skills/yen-sprite-style/SKILL.md`** and its Style Bible *before* making art.
5. For CI, QA or production, **read `.agents/skills/yen-game-release/SKILL.md`** before release actions.

## Autonomous execution loop

1. **Reconcile real state**: inspect open PRs, issues, CI, main SHA, production deploy SHA and quota status. Never infer deploy success from a merge. Keep unknown as unknown.
2. **Select next eligible work**: highest-priority `todo` milestone whose dependencies are complete and which can ship a user-visible testable increment. Run `next-work.mjs` as deterministic guidance; if its candidate is blocked, record the blocker and choose another eligible stage. Do not spend an entire session planning when a safe implementation task exists.
3. **Define a vertical slice** with one observable user change, a repro or acceptance test and a rollback path. Aim for one reviewable PR per session. Work incrementally rather than merging half-completed visuals. Keep the current game playable.
4. **Develop** on `feat/game-<issue>-<topic>`, never modify production by unreviewed force pushes. Follow the style gate and transparent alpha/sprite atlas contracts. Do not fake art approval or animate missing art with CSS stretching and claim it is a sitting animation.
5. **Verify** syntax, existing Node tests, new regression tests, collision and input states. When browser testing is available, capture desktop 1440×900 and 390×844, plus 360×800; test 5 role paths and 6 NPC interactions. If the environment lacks a real browser, say so and keep browser sign-off pending.
6. **Ship** through CI -> PR -> merge -> production deploy check. Confirm exact production SHA and URL; monitor errors. If quota or authorization blocks deploy, use an already authorized deployment channel, but never silently change provider, alias, plan, credential or billing. If no prod channel works, record the blocker and stop labeling the increment shipped.
7. **Record state** in the issue and `ops/CHANGELOG-GAME.md` with test results, production URL/SHA, residual debt and next action. Edit `ops/roadmap.json` only for actual changes, not wishful completion.
8. **Continue** with the next vertical slice on subsequent scheduled sessions without requesting repeated prompts. Ask the owner only for a decision that cannot legitimately be made autonomously: non-delegated art decisions, real-world branding/claim, privacy or spending, external authorization or acceptance of final artistic direction. Meanwhile switch to independent code/QA items.

## Prioritization rules

P0 release safety and failing production > P1 blocked visual consistency / game-breaking input > P1 player/character actions and meaningful NPC behavior > P2 role/day loop and discovery > P2 mobile/performance/accessibility > P3 optional polish. A reproducible crash or broken deploy supersedes all cosmetic plans. Avoid duplicating already tracked work or reopening retired 3D issues.

## Stop conditions

A **session** may finish with an independently usable production increment and a concrete verification result. The **game** is finished only when every mandatory ROADMAP milestone is completed *and* the release skill's acceptance checklist passes on a production commit, including actual art-review evidence under the current owner-delegated review policy; never fabricate owner acceptance. A draft PR, green tests or a preview alone is not completion.

## Communication

Report in Vietnamese, concise, with: gameplay change, PR, CI, exact prod status and test URL, blocker (if any), remaining scope, next milestone. Avoid ungrounded claims of visual quality. If scheduled execution cannot access GitHub or a deploy tool, report that limitation; do not pretend background coding happened.

## Event-driven delivery contract

Use the existing `game-2d-contract.yml` workflow on every relevant push and pull request. Inspect both `sprites-and-routines` and `production-content` after merging to main. Download the production evidence artifact on failure; fix deployment freshness before reporting a release.

Actions runs validation and live-content verification; it does not author features, generate art, or start a coding agent. Continue implementation in the active coding session, selecting the next eligible roadmap item after each verified increment. Do not describe a recurring checker as continuous autonomous development. Do not add hourly or daily schedules as a substitute for the user's request to work continuously now.

Keep work bounded and recoverable: one branch per slice, no overlapping edits to the same work item, no self-triggering commits or unbounded workflow recursion. Reconcile a moved main branch before merging. Never bypass branch protection or auto-approve art. A missing coding runner or credential is an explicit blocker to unattended feature authoring.
