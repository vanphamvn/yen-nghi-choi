# Yên repository agent instructions

## Art-direction gate (required)

Whenever a task touches Yên 2D sprites, character art, props, backgrounds, sprite sheets, camera/world scale, effects, lighting, textures or animations, **read and apply `.agents/skills/yen-sprite-style/SKILL.md` before editing assets**.

Use the real role PNG sprite sheets as the visual canonical reference. Do not assume that "anime", "warm palette", or technically valid SVG/vector assets will match the existing painted chibi characters.

Never mark game art as visually approved based only on successful unit tests or use the project owner's name as a reviewer without an actual explicit review. Existing scene SVGs from PR #91 are quarantined style debt, **not approved assets**. See `game/preview-2d/assets/scene/art-style-policy.json`.

Run `node game/preview-2d/tools/audit-art-style.mjs` and the game contract tests for any game-art or sprite pipeline change. For finished art releases, also run `node game/preview-2d/tools/audit-art-style.mjs --strict` and address all blocking style debt. Create an actual contact sheet with at least two reference character poses and each new prop at runtime scale, secure owner's visual signoff, and record approved art evidence.

For user-facing gameplay changes, a GitHub PR is **not** a finished production release. Verify exact commit and READY status of the production target, provide the playable URL, or explicitly report deployment blocked.
