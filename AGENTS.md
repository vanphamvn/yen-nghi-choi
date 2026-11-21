# Active web/UI direction (owner decision 2026-11-19)

The owner **stopped the Yên Phaser 2D game initiative** and replaced its priority with a lightweight **Yên Lab Beta** page linked from the Yên website, offering optional, evidence-informed interactive calming tools. Do **not** autonomously resume the Phaser roadmap, build sprites, or run continuous game delivery. Preserve existing game files and historical instructions for archival/reference use only, unless the owner explicitly reactivates that game.

**Required for website/UI work:** read `DESIGN.md`, `.agents/skills/yen-ui-craft/SKILL.md`, and its QA checklist before changing the homepage, Yên Lab UI, typography, CSS, web animations or responsive behavior. Claude Code can discover the equivalent entrypoint in `.claude/skills/yen-ui-craft/SKILL.md`. Keep the existing static site and its brand identity; do not introduce heavy UI frameworks by default. Check visual behavior in real browsers and never claim a production deploy without verifying its commit/URL.

Well-being mini tools must have clear start/stop, accessible reduced-motion fallback and no unauthorized health-data capture. Scientific references support only the underlying techniques unless the custom game itself has been tested.

## Active Yên Lab coordination (owner decision 2026-11-19)

Use one coordinator agent for the active Yên Lab roadmap. The coordinator reads live issues/PRs and `docs/yen-lab/ops/roadmap.json`, selects work whose dependencies are satisfied, and assigns separate file ownership to implementation and independent QA agents. Keep integration, status reconciliation and release decisions with the coordinator; avoid concurrent edits to shared roadmap files.

During an active session, continue from one completed ticket to the next eligible ticket without asking the owner to repeat the prompt. Each implementation prompt session must complete at least one real roadmap ticket against its acceptance criteria, record actual tests/PR/SHA evidence and close it on GitHub. Do not create artificial tickets or close incomplete work to satisfy the minimum. If all eligible work is externally blocked, document the specific blocker and completed investigation honestly.

For source changes: branch → implement → independent review and relevant tests → PR → green CI → merge. User-facing release tickets additionally require actual browser checks and exact production SHA/URL. A docs-only foundation ticket does not imply a runtime release. Reconcile issue state and roadmap status after integration.

The owner separately authorized a background coordinator on 2026-11-19. The enabled task “Điều phối Yên Lab” resumes the loop hourly (the supported maximum frequency), using live repository state and the same acceptance/release gates. Check active runs and open PRs before assigning work to avoid overlapping mutations. Scheduled execution is not an always-running process and an enabled task is not proof that a run succeeded. Do not create additional schedules, paid jobs or services without a new request. Preserve the stopped Phaser initiative.

---

# Yên repository agent instructions

## Art-direction gate (required)

Whenever a task touches Yên 2D sprites, character art, props, backgrounds, sprite sheets, camera/world scale, effects, lighting, textures or animations, **read and apply `.agents/skills/yen-sprite-style/SKILL.md` before editing assets**.

Use the real role PNG sprite sheets as the visual canonical reference. Do not assume that "anime", "warm palette", or technically valid SVG/vector assets will match the existing painted chibi characters.

Never mark game art as visually approved based only on successful unit tests or use the project owner's name as a reviewer without an actual explicit review. Existing scene SVGs from PR #91 are quarantined style debt, **not approved assets**. See `game/preview-2d/assets/scene/art-style-policy.json`.

Run `node game/preview-2d/tools/audit-art-style.mjs` and the game contract tests for any game-art or sprite pipeline change. For finished art releases, also run `node game/preview-2d/tools/audit-art-style.mjs --strict` and address all blocking style debt. Create an actual contact sheet with at least two reference character poses and each new prop at runtime scale, record visual-review evidence and the actual reviewer identity. The owner explicitly delegated artwork self-review on 2026-11-16 ("ưu tiên tự duyệt artwork trước tôi sẽ kiểm tra sau"): Codex may review and integrate art before owner inspection. Record reviewerType=agent, reviewAuthority=user-delegated and ownerReviewPending=true; never impersonate human signoff.

For user-facing gameplay changes, a GitHub PR is **not** a finished production release. Verify exact commit and READY status of the production target, provide the playable URL, or explicitly report deployment blocked.

## Netlify Preview game tap safety (21/11/2026)

Interactive game review links should append `?ntl-drawer-state=hidden` to the **Deploy Preview URL**. Netlify's injected 48px-wide-bottom iframe Drawer was directly observed to intercept `Tiếp tục ca sau` taps; a first touch reaches the game once the Drawer is disabled. Do not merge to production before owner preview approval, and do not confuse overlay interception with bugs in the game's own click handlers.

## Netlify-only deployments (21/11/2026)

Yên is deployed and previewed on **Netlify only**. Do not initiate Vercel deployments, create Vercel PR previews or treat a Vercel status check as release evidence. The Vercel project `yen-nghi-choi` has Ignored Build Step set to `exit 0`; `vercel.json` sets `git.deploymentEnabled: false` to disable automatic Git deployments for every branch, with `ignoreCommand: "exit 0"` as a second safety mechanism. Existing Vercel domains/deployments can remain accessible but are no longer a release target. Continue to verify the exact SHA/READY status of Netlify Preview before owner review, and Netlify production after authorized merge. Do not disable or delete the Vercel project to achieve this.

GitHub Actions runner startup failures (empty runner name, zero executed steps, immediate failure and missing logs) are an account/runner provisioning blocker, not a passed or failed application test. Do not suppress GitHub Actions failures, weaken assertions or claim QA passed; inspect Actions usage/billing/runner eligibility and rerun CI when runner access is restored.

## Visual novel preview-first approval and choice visibility (21/11/2026)

For `/tinh-huong/campaign/`, follow the owner-directed sequence: update rules/skill if needed → implement UI on a feature branch → **deploy and share a real Netlify Preview link** → **wait for explicit owner approval** → only then perform QA, merge or production deployment. Don't auto-merge this preview. Read `.agents/skills/yen-ui-craft/SKILL.md` for the story HUD hierarchy: all three choices must fit within the lower portrait half before any XP/reward panel; generic speaker label “Người cùng ca” is not part of the UI.

## Active visual novel scene-composition rule

For all work on `/tinh-huong/campaign/` or future illustrated `Một Tháng Không Yên` scenes, **read `.agents/skills/yen-visual-novel-staging/SKILL.md` and `docs/visual-novel/SCENE-SPATIAL-RULES.md` before positioning characters or props**. Cục Yên, employees and customers must stand on the painted floor; coffee equipment and receipts require a painted support surface. Layout coordinates are physical *contact anchors*, not arbitrary image centers. Use `tinh-huong/campaign/scene-composition.mjs` as the source of truth for roles, z-order and furniture-relative y positions, and run `tests/yen-campaign-scene-composition.test.mjs` plus visual browser QA. Do not add prop manipulation to this choice-driven visual novel or treat a reused archived art asset as an instruction to resume Phaser.

## Archived autonomous Game Yên completion (only if owner reactivates the 2D game)

For any game development session, first read `.agents/skills/yen-game-director/SKILL.md`, `game/preview-2d/ROADMAP.md`, and `game/preview-2d/ops/roadmap.json`. Select the next eligible issue using `node game/preview-2d/tools/next-work.mjs`. Use `.agents/skills/yen-game-release/SKILL.md` for every game-affecting PR and release. Apply the existing `yen-sprite-style` skill on every art task.

Each session should deliver the smallest independently usable production increment with verified SHA and working URL. If deployment is blocked by quota, permissions, branch protection, or browser availability, record the blocker and continue on an independent eligible task at the next scheduled session. Never fabricate owner art signoff, deployed code, FPS metrics, or user actions. Never repurpose old Babylon/GLB/3D issues as current Phaser 2D scope.

Automated sessions are allowed to advance safe, preapproved engineering tasks, tests and GitHub issues without repeated prompts. Account upgrades, external payments, production provider/domain changes, personal-data collection still require actual user authorization. Delegated agent art review is authorized; later owner inspection must remain honestly marked pending.
