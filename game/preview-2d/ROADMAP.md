# Game Yên 2D | Product roadmap and autonomous execution contract

**Authoritative game:** `game/preview-2d/` on `vanphamvn/yen-nghi-choi`. Legacy Babylon/GLB/3D issues are out of this roadmap. The game is a relaxed, exploratory, character-based 2D café experience, not an account/reward/checkout app.

**Operating rule:** each development session should end with an independently **testable production increment** when the deployment platform permits it. A PR or a preview does not count as production. Never misreport production deployment. If release is blocked, preserve a green, reviewable PR and publish an accurate blocker/status.

**State source:** `ops/roadmap.json`; select next issue using `node game/preview-2d/tools/next-work.mjs`. The milestones are outcome gates, not a promise that all art and engineering are complete now.

## Product vision

A guest can walk into a cozy Yên café, choose a character, see a room that uses the **same painted chibi art direction**, discover people and objects that move with convincing proportions, sit/read/drink/talk, do optional role-specific tasks, and return without pressure or fake real-life prizes. The page must remain understandable on a small phone.

## Ordered workstreams

| ID | Gate | Work to deliver | Acceptance proof |
| --- | --- | --- | --- |
| M0 | Release reliability | Confirm a working production deployment pipeline (Vercel quota currently implicated), aligned routes/aliases, safe rollback and smoke tests | production `READY`, matched SHA, game boot + interaction URL |
| M1 | Art foundation | inspect real chibi PNGs, produce character-vs-prop contact sheet at runtime scale, approve one painted reference prop and art spec | actual reference images, proof board, actual delegated Codex art review; owner checks later |
| M2 | Cohesive sprite scene | redraw 10 quarantined vector world assets as painterly raster sprites; consistent perspective, alpha, pivots, occlusion, collision, states | strict art gate, screenshot review at 3 viewports, six prop interactions |
| M3 | Character activities | dedicated sitting, standing-up, drinking, reading, talking frames, correct animations for NPCs and player | real frames for all claimed poses, stable feet, transitions and tests |
| M4 | NPC life simulation | believable paths, pauses, sitting areas, purposeful actions, conversation that reflects current context, safe route replanning | 6 NPCs follow routines for an entire day, player interaction stays in sync |
| M5 | Purposeful game loop | clear onboarding, role-choice, optional work/play rhythms, 3 achievable tasks, reset/day loop and discoverable actions | end-to-end role walkthrough and game progress without dead ends |
| M6 | UX, accessibility, performance | touch-friendly UX, keyboard and screen-reader semantics, reduced motion, texture budget and mobile performance | real 1440×900, 390×844, 360×800 QA with recorded evidence |
| M7 | Release candidate | regression, privacy/branding review, owner art acceptance, P0/P1 closure, rollback and published build | complete release checklist, exact production SHA, playable domain |

M0 must be tackled first to recover a shipping path. M1 is the visual design dependency for M2/M3. M1 shipped in #112 under explicit delegated review; M2 proceeds via #113–#116. M4/M5/M6 can be improved independently. M7 requires M0 through M6. The status files distinguish `todo`, `in-progress`, `blocked` and `done`; no unchecked claim of success.

## Rules for independent completion without additional prompts

1. Pull the latest repository and deployment state; check prior issues and PRs; select the highest-priority unblocked slice that **changes the game players can use**. 
2. Create or update a GitHub issue describing one visible increment and a reproducible acceptance test.
3. Implement source + test + optional screenshot evidence in a feature branch. Do not use generic SVG shapes in place of approved painterly sprites.
4. Follow `.agents/skills/yen-game-director/SKILL.md`, `yen-sprite-style/SKILL.md` for artwork, and `yen-game-release/SKILL.md` for QA/deployment.
5. Run CI; review; merge; verify production URL and exact SHA. File release evidence in `ops/CHANGELOG-GAME.md`.
6. If a blocker needs explicit human judgment (art approval, brand claims, money, account connection), document it and work on an independent milestone. **Never fabricate approval.**
7. Repeat this cycle on the next scheduled execution while work remains. Avoid auto-creating duplicate issues and unbounded PR churn.

## Known problems (2026-11-16)

- Current scene SVGs in `assets/scene/` differ visually from approved PNG role art. They are explicitly unapproved in the art-style policy; issue #93 tracks repainting.
- Existing characters have idle/walk/interact frames, not dedicated seated/standing-up/reading/drinking clips.
- Some NPCs are placeholders/reuse role sprite art; their behavior is rudimentary and must be expanded without fake poses.
- Game presently has no fully verified cross-device visual sign-off or actual mobile FPS measurements.
- The most recent verified Vercel production SHA during planning was `4bf4b938`, older than merged art/skill changes, with deployment quota/build-rate failures reported. This is a **historical check**, not a claim about current state. Always re-check before reporting.

## Definition of done

**For a slice:** visible player change, acceptance test(s), no known P0 crash, PR merge, verified production SHA and playable link. If deployment blocked, status = blocked/not shipped.

**For the full game:** all M0–M7 acceptance gates, approved unified art style, all advertised actions genuinely animated, NPC routines and correct interaction, responsive/accessible/mobile QA, complete playable loop, and stable production release. Scope growth beyond this MVP requires a new recorded decision, not silent invention.

## Current asset queue (2026-11-16)

Table shipped in #112. #113 cup/book/cushion; #114 counter/machine; #115 bench/plant/scooter; #116 door/backdrop. Art is not complete until all active legacy world vectors are replaced and strict audit passes. Codex reviews under explicit delegation, owner inspection remains pending.
