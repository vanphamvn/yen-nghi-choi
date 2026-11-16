# Yên 2D release journal

This file records **verified releases**, not PRs mistaken for production. Agents append one entry per deployment or clearly marked blocked attempt. Keep the newest entry at the top.

## 2026-11-16 | Production deployment verification gate

- Issue / PR: #95 / PR pending.
- Merged SHA: pending.
- Actual deployed SHA / provider / domain: Vercel production `yencafeday.vercel.app` reported `4bf4b938` as READY.
- Result: **BLOCKED**. Newer `main` had `58b33cb0` and Vercel returned build-rate-limit failure; Netlify production SHA could not be independently verified in this environment.
- Link to playable route: https://yencafeday.vercel.app/game/preview-2d/ (known older release).
- Automated tests: adding a read-only HTTPS boot/asset smoke and provider SHA gate. This is tooling, not a new release.
- Browser/mobile tests: not tested in this environment.
- Art proof/approval: not applicable to release tooling; the ten SVG style debts remain.
- Follow-up: wait for provider's existing quota to recover or use an explicitly authorized deployment route. Reverify provider SHA and smoke before marking M0 done.

## Baseline at roadmap creation, 2026-11-16

- Source: `vanphamvn/yen-nghi-choi`
- Game route: `/game/preview-2d/`
- Known finished source work: 5 PNG character sheets, NPC waypoints, independent SVG scene props, art-style skill and CI gate.
- Known unfinished work: art mismatch of 10 SVGs, genuine sitting/standing-up frames, stronger NPC activities, browser/mobile QA.
- Verified Vercel production SHA during inspection: `4bf4b938` (READY). Merged newer art changes were not verified on this production alias at inspection time.
- Required follow-up: confirm current main SHA and deployment state. Do not call this latest deploy without re-checking.

## Required release entry format

### YYYY-MM-DD | <short vertical slice>

- Issue / PR:
- Merged SHA:
- Actual deployed SHA / provider / domain:
- Result: SHIPPED | BLOCKED | ROLLED BACK | PREVIEW ONLY
- Link to playable route:
- Automated tests:
- Browser/mobile tests:
- Art proof/approval (if relevant):
- Error, rollback or follow-up:

A green CI badge without a production SHA cannot produce a SHIPPED entry.


## 2026-11-16 · #113 painted interaction details (production pending)

- Prior release #112 verified at b12e1236287928932a5d11f578c453c8070cdc51, Netlify production; run 43898668854 passed exact content/build provenance and 7 browser cases (2 mobile long-walkthrough skips). M1 complete under explicit delegated review, not owner signoff.
- Create #113–#116 as child slices of #93/#94. Replace cup/book/cushion with actual referenced painted RGBA assets, independent detail state preserved.
- Normalized source <=384 px per edge; runtime cup24x24/book35x17/cushion69x47 to avoid source distortion. Contact sheet and prompt provenance in art-reviews/details-v1.
- Remaining after this slice: six active SVG world textures (architecture, door, counter, bench, plant, scooter). Strict art release remains blocked; real mobile device FPS not measured.
- This entry describes implementation, not a claimed production release. Exact merge SHA, CI and live proof must be recorded in PR/issue after release.
- Browser gate caught task completion immediately undoing table/bench effects. Fixed completed furniture state persistence until explicit interaction/day reset; regression added. 47 local Node tests now pass. First browser attempt also exposed Phaser's blob-backed image URLs; asset load checks now inspect real successful network responses plus bound texture keys.


## 2026-11-17 · #114 counter/machine slice (production pending)

- Previous #117 released af691b72b90beac5e08d1eed6667a7d7a9f33240. Run43914783803 passed Node, browser and actual production jobs:10 browser passed/2 deliberate mobile-long skips; exact Netlify build/content verified.
- Repaint counter and machine from actual character PNG input. Same counter raster is split into complementary rear-top/front-fascia crops, barista stands between them; machine and steam are independent. Original counter SVG is frozen as history, not used at runtime.
- Counter360x91, machine85x72 preserve generated source ratios; collider reduced to940..1300,560..610; barista working feet995,570, station unchanged990,652.
- #118 records actual mobile screenshot clipping/overlap under #100, without claiming real-device QA. Five active legacy world SVGs remain after counter; strict final art audit remains blocked. Owner inspection pending.
- Exact release SHA and production verdict for this increment must follow in PR/issue after CI.
