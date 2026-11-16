---
name: yen-game-release
description: QA, visual regression, production verification and rollback discipline for shipping playable Yên 2D game increments.
---

# Yên Game QA & Release

This skill applies to every game-affecting PR and deployment. **Production-ready is not the same as GitHub merged.**

## Start with facts

Read `game/preview-2d/ROADMAP.md`, `ops/roadmap.json`, `AGENTS.md`, and the actual changed game files. Identify what the current production serves: `main` SHA, Vercel domain SHA, Netlify status if verifiable, route `/game/preview-2d/` vs `/game/`. When source and deployed SHA differ, declare deployment blocked or stale.

## QA matrix

| Area | Minimum |
| --- | --- |
| Boot | No missing CDN/texture, uncaught exception, black screen or console error |
| Input | WASD/arrows, touch joystick, E/Q, modal keyboard escape and focus, loss-of-focus reset |
| Characters | all 5 roles; directions idle/walk/interact, alpha edges, feet pivots and camera follow |
| NPC | all 6 routines, dialogue proximity after walking, no furniture penetration or indefinite stall |
| Props | all 6 stations approachable, contacts/occlusion, separate art and visible interaction response |
| Game loop | explore -> start shift -> 3 tasks -> finish -> day reset; no accidental currency/reward promises |
| Visual style | identical character art language across the painterly background, props, actions; human side-by-side approval |
| Screen sizes | desktop 1440×900, iPhone 390×844, narrow Android 360×800 |
| Access | readable contrast, buttons reachable, touch target size, reduced-motion support, no focus trap |
| Performance | record real-device p50 FPS and memory; target >=30 FPS median on supported mobile, without inventing measurements |
| Privacy | no user account, tracking, unnecessary storage, forced permission or real-currency exchange |
| Release | CI green, merge provenance, production SHA verified, playable route and rollback path |

Use actual results only. If a test environment cannot perform a test, mark **not tested** rather than passed.

## Pre-merge

1. Run `node --check game/preview-2d/game.js`.
2. Run `node game/preview-2d/tools/audit-art-style.mjs` and `node --test game/preview-2d/tests/*.test.mjs tests/game-2d-background.test.mjs` for visual/game changes.
3. For final art acceptance, also require `node game/preview-2d/tools/audit-art-style.mjs --strict`; failure means **art debt remains**.
4. Run `node game/preview-2d/tools/next-work.mjs --validate` to ensure the roadmap is structurally sound.
5. Review actual screenshots or video of the changed scene if possible, including animation transitions. Run accessibility checks; document missing coverage.
6. Only then merge, respecting explicit repository/branch approval settings.

## Deploy

1. Capture the exact expected merge SHA.
2. Prefer the repository's already linked production deployment mechanism; inspect provider deployment records.
3. Confirm `READY` and a matching commit SHA on the real production domain before calling it released. The deployment's URL must serve the expected route and assets.
4. If deploy fails (e.g. Vercel free-tier build quota), do **not** equate a ready preview with prod. Record the error and an authorized fallback path; avoid repeated API attempts that cannot succeed.
5. After deployment, check first-load and one interactive smoke scenario on the deployed URL, not only local source. Record browser test limitations.
6. Restore previous verified production deployment if a release is clearly broken, only where rollback access and authorization exist.

## Read-only production smoke verification

Use `node game/preview-2d/tools/production-smoke.mjs --url https://yencafeday.vercel.app/game/preview-2d/ --expected-sha <MAIN_SHA> --deployed-sha <PROVIDER_SHA>` after inspecting the actual deployment record. SHA values must be full 40-character commit IDs. The script checks the HTML, JavaScript, CSS, sprite manifest, barista PNG, scene texture and art-style policy over HTTPS. A Vercel "READY" result for a stale SHA still fails.

For hosts where deployment SHA metadata cannot be obtained, use `--smoke-only`, but its successful status is **SMOKE_PASS_UNVERIFIED_SHA**, not a verified release. Never treat it as proof that `main` shipped. This is a network/asset smoke check, not a real browser or visual QA.

## What can be automated

GitHub status/CI, syntax, sprite manifest integrity, collision footprints, expected asset presence, prompt/skill references, roadmap schema, deployment SHA comparisons and smoke HTTP checks when tools permit. Do **not** claim perceptual style matching, natural dialogue, true mobile FPS or owner approval based on static tests.

## Release report template

- Work item / issue:
- Changes visible to players:
- PR and merge SHA:
- Unit, animation, input, accessibility, visual tests: pass/fail/not tested
- Production domain and target route:
- Provider status + deployed SHA:
- Blocking defects and rollback strategy:
- Next eligible milestone:

## Final game acceptance

All mandatory roadmap items `done`, no failing P0/P1 bug, approved artwork reference evidence, real-browser/mobile QA, playable complete daily loop, exact production commit verification and owner-visible release notes. If any is missing, call the build a beta, not a finished game.

## Automatic live-content evidence

The `production-content` job runs after successful main-branch contract checks and waits for the already linked Netlify deployment. It compares SHA-256 hashes of index.html, game.js, style.css and every PNG/WebP/SVG/JSON under the 2D assets directory against the checked-out commit. HTTP 200 fallback pages, stale sprites, redirects and failed downloads fail the gate. Evidence is retained as `game-production-content` for 14 days.

Run `node game/preview-2d/tools/verify-live.mjs` to reproduce. A `CONTENT_MATCH` result proves equality of the checked game files at observation time; it is not provider deployment-SHA verification, browser gameplay QA, visual approval, or real-device performance evidence. Continue using the provider SHA gate and the QA matrix above for final release acceptance. The workflow does not deploy or write game features and needs no new hosting secret.
