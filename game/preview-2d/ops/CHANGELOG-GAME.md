# Yên 2D release journal

This file records **verified releases**, not PRs mistaken for production. Agents append one entry per deployment or clearly marked blocked attempt. Keep the newest entry at the top.

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
