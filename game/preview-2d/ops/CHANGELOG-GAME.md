# Yên 2D release journal

This file records **verified releases**, not PRs mistaken for production. Agents append one entry per deployment or clearly marked blocked attempt. Keep the newest entry at the top.

## 2026-11-16 | NPC routines and verifiable Netlify releases

- Issues / PRs: #95 / #108; #98 / #109.
- Merged game SHA: `a640958a1ab573a2bff1633c1709b423a26800c5`.
- Production: Netlify https://yencafeday.netlify.app/game/preview-2d/.
- Result: SHIPPED for the NPC slice. Provider-generated build metadata matches the merge SHA, production context, main branch and site ID; all runtime and asset content hashes pass.
- Evidence: https://github.com/vanphamvn/yen-nghi-choi/actions/runs/43889826169.
- Automated tests: 42 passing; 600-second NPC route simulation, full conversation hold/resume and shift reset; all five roles still complete 3 tasks and advance days.
- Browser: live production boot, role apply, start shift and contextual Mèo Mướp dialogue observed through UI. Not real-device mobile FPS or full browser traversal.
- Art: unchanged. No sitting/reading/drinking frames or art approval claimed; legacy SVG style debt remains.
- Rollback: revert #109 for NPC behavior; legacy renderer remains at /game/3d.html.
- Next: mobile input/focus safety and repeatable browser checks. M4 remains in progress.

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
