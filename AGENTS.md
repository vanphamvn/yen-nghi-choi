# Active web/UI direction (owner decision 2026-11-19)

The owner **stopped the Yên Phaser 2D game initiative** and replaced its priority with a lightweight **Yên Lab Beta** page linked from the Yên website, offering optional, evidence-informed interactive calming tools. Do **not** autonomously resume the Phaser roadmap, build sprites, or run continuous game delivery. Preserve existing game files and historical instructions for archival/reference use only, unless the owner explicitly reactivates that game.

**Required for website/UI work:** read `DESIGN.md`, `.agents/skills/yen-ui-craft/SKILL.md`, and its QA checklist before changing the homepage, Yên Lab UI, typography, CSS, web animations or responsive behavior. Claude Code can discover the equivalent entrypoint in `.claude/skills/yen-ui-craft/SKILL.md`. Keep the existing static site and its brand identity; do not introduce heavy UI frameworks by default. Check visual behavior in real browsers and never claim a production deploy without verifying its commit/URL.

Well-being mini tools must have clear start/stop, accessible reduced-motion fallback and no unauthorized health-data capture. Scientific references support only the underlying techniques unless the custom game itself has been tested.

---

# Yên repository agent instructions

## Art-direction gate (required)

Whenever a task touches Yên 2D sprites, character art, props, backgrounds, sprite sheets, camera/world scale, effects, lighting, textures or animations, **read and apply `.agents/skills/yen-sprite-style/SKILL.md` before editing assets**.

Use the real role PNG sprite sheets as the visual canonical reference. Do not assume that "anime", "warm palette", or technically valid SVG/vector assets will match the existing painted chibi characters.

Never mark game art as visually approved based only on successful unit tests or use the project owner's name as a reviewer without an actual explicit review. Existing scene SVGs from PR #91 are quarantined style debt, **not approved assets**. See `game/preview-2d/assets/scene/art-style-policy.json`.

Run `node game/preview-2d/tools/audit-art-style.mjs` and the game contract tests for any game-art or sprite pipeline change. For finished art releases, also run `node game/preview-2d/tools/audit-art-style.mjs --strict` and address all blocking style debt. Create an actual contact sheet with at least two reference character poses and each new prop at runtime scale, record visual-review evidence and the actual reviewer identity. The owner explicitly delegated artwork self-review on 2026-11-16 ("ưu tiên tự duyệt artwork trước tôi sẽ kiểm tra sau"): Codex may review and integrate art before owner inspection. Record reviewerType=agent, reviewAuthority=user-delegated and ownerReviewPending=true; never impersonate human signoff.

For user-facing gameplay changes, a GitHub PR is **not** a finished production release. Verify exact commit and READY status of the production target, provide the playable URL, or explicitly report deployment blocked.

## Archived autonomous Game Yên completion (only if owner reactivates the 2D game)

For any game development session, first read `.agents/skills/yen-game-director/SKILL.md`, `game/preview-2d/ROADMAP.md`, and `game/preview-2d/ops/roadmap.json`. Select the next eligible issue using `node game/preview-2d/tools/next-work.mjs`. Use `.agents/skills/yen-game-release/SKILL.md` for every game-affecting PR and release. Apply the existing `yen-sprite-style` skill on every art task.

Each session should deliver the smallest independently usable production increment with verified SHA and working URL. If deployment is blocked by quota, permissions, branch protection, or browser availability, record the blocker and continue on an independent eligible task at the next scheduled session. Never fabricate owner art signoff, deployed code, FPS metrics, or user actions. Never repurpose old Babylon/GLB/3D issues as current Phaser 2D scope.

Automated sessions are allowed to advance safe, preapproved engineering tasks, tests and GitHub issues without repeated prompts. Account upgrades, external payments, production provider/domain changes, personal-data collection still require actual user authorization. Delegated agent art review is authorized; later owner inspection must remain honestly marked pending.
