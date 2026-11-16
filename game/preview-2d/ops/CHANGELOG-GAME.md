# Yên 2D release journal

This file records **verified releases**, not PRs mistaken for production. Agents append one entry per deployment or clearly marked blocked attempt. Keep the newest entry at the top.

## 2026-11-16 | Role onboarding and complete five-role browser walkthrough

- Issues / PR: #99, #96 / #111.
- Merged SHA: `5d95054e958f0a07d305b2a1c95057dbde45e76d`.
- Result: SHIPPED on Netlify; source/build provenance and asset content match.
- Production evidence: https://github.com/vanphamvn/yen-nghi-choi/actions/runs/43895628731.
- Browser production: 7 passed, 2 explicitly skipped. All five roles completed three tasks, finished shifts and advanced days via real keyboard/buttons using the supported Canvas fallback. Default-renderer boot/input passed at desktop and both mobile viewport sizes.
- Long-case CI navigation was stabilized by sampling after key release; software WebGL had about 9 FPS. This is a runner observation, not a physical-device benchmark.
- No owner approval was invented. The subsequent owner instruction authorizes delegated agent artwork review before later owner inspection.
- Follow-up: integrate the agent-reviewed reference table and continue replacing quarantined scene artwork.

## 2026-11-16 | Mobile input and production browser gates

- Issue / PR: #100 / #110.
- Merged SHA: `ae11ea39ff62937f5b6334d64fd6c510b56abb38`.
- Result: SHIPPED. Netlify build provenance and runtime/asset hashes matched the merge; production browser checks passed.
- Evidence: https://github.com/vanphamvn/yen-nghi-choi/actions/runs/43891612260.
- Node regression: 43 pass. Browser: 3/3 viewport scenarios passed both checkout and real production at 1440x900, 390x844 and 360x800.
- Verified: role selection, focus wrap/restore, keyboard/joystick movement, menu input reset, shift start, no horizontal overflow and no page exceptions.
- These are emulated viewport checks, not physical-device FPS measurements. M6 remains in progress.
- The unused API coding runner now pauses without failure when no key exists. Development remains in ChatGPT Work; scheduled QA stays read-only.
- Follow-up: real-control five-role day walkthrough and owner review of the reference table.

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
