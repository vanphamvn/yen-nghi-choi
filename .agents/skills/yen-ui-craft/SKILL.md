---
name: yen-ui-craft
description: Design, build, review and visually QA Yên Coffee & Tea's static website and evidence-informed Yên Lab beta mini tools, enforcing DESIGN.md, accessibility, responsive behavior and safe, purposeful motion.
---

# Yên UI Craft — Codex / Claude

Use this **before** any work on the homepage, site copy, Cục Yên web interactions, a new `lab/` mini tool, CSS, animation, mobile UX or visual QA. This is the active web-interface skill from 2026-11-19.

## Project boundaries

- Repository: `vanphamvn/yen-nghi-choi`, existing website at root, predominantly static HTML/CSS/JS. Do not convert it to React simply to use a component gallery.
- **New priority:** link the existing Yên website to a **Yên Lab Beta** page with multiple short, evidence-informed calming exercises. The former `game/preview-2d/` Phaser initiative is **paused**; do not autonomously resume its roadmap or replace the website with that game. Old game skills remain archival and are used only if the owner explicitly reactivates the game.
- Do not claim Yên Lab or any custom mini game itself is clinically validated. Underlying breathing, muscle relaxation, mindfulness or emotion-labeling methods have varying evidence strength; reference and qualify claims individually.
- No account, cookies, data storage, API key, microphone/camera or medical profiling without explicit authorization. No performance scoreboard or mandatory daily use.

## Read before editing

1. `AGENTS.md`, `DESIGN.md`, existing `index.html` and intended page/feature source.
2. `references/QA-CHECKLIST.md` for the release gates.
3. `references/RESEARCH-NOTES.md` for what the 12 public UI repositories do and **which parts are unsuitable** for Yên.
4. Existing tests, `playwright.config.mjs`, Netlify/Vercel deployment and relevant open PRs/issues. Respect the current CSP and zero-build approach.

## Workflow

### 1. Observe, then brief

Open the current page in an actual browser where available. Capture desktop (1440×900), iPhone-like (390×844), small Android (360×800), and 320px width if text changes. Inspect real content, focus states, overlays, typography, loading and interactions. Record observed vs inferred facts. Define one screen/interaction, its user job, success criterion, content truth and what stays unchanged.

### 2. Design with a persistent identity

Use `DESIGN.md` as the authority for palette, typography, geometry, voice and motion. Derive a page-specific style brief: primary action, single visual focal point, layout, major states, touch affordances, stop/exit, and fallback. Reuse the **existing** Yên mark and Cục Yên web personality. Do not borrow a brand from Awesome DESIGN.md or generate random "premium" gradients. New visual direction needs a reason tied to Yên.

### 3. Build the smallest complete interaction

Implement semantic HTML/CSS/vanilla JS. Prefer reusable small patterns and accessible controls. One action should cause one visible state change; a mini tool must really work, not just animate a mock preview. Use real Vietnamese copy. Provide finite interaction states: idle, active, pause/stop, complete, reset and error/reduced-motion where applicable. Keep the UI usable with low-end phones, and without sound.

**Motion decision tree:** CSS transitions for simple feedback; Web Animations API for small coordinated interactions; GSAP only after demonstrable timeline complexity and a justified bundle trade-off. Do not add React Bits, WebGL/Canvas UI or 3D Scroll World to a vanilla site by default. Always offer `prefers-reduced-motion` and graceful static fallback. No scrolljacking.

### 4. Critique and audit, separately

Borrow the *methods*, not copied rule files: Impeccable's critique/polish, Hallmark's hard floor, Taste Skill's browser gate, Emil Kowalski's animation discipline and Google DESIGN.md's structured tokens.

Two passes:
- **Critique:** hierarchy, contrast, clarity, originality, brand cohesion, restraint, inappropriate visual noise, readable copy.
- **Audit:** broken routes, overflow, tap targets, focus visibility, keyboard order, dialog dismissal, voiceover labels, reduced-motion, network errors, CSP, scripting off, performance and touch/landscape behavior.

Record each actionable finding with severity P0/P1/P2 and a location. Fix P0/P1 before release.

### 5. Verify and ship honestly

Run `node tools/audit-ui-design.mjs`, the relevant existing Node tests, and Playwright browser tests for the affected page; add a regression test for each fixed defect. Inspect screenshots at real browser scale, not just screenshots of code. Use a feature branch → PR → CI → merge only when checks are green → verify deployed revision and production URL. If no real browser or deploy confirmation is available, report it explicitly. No false claims of "visually approved", 60fps, production deployment, or owner signoff.

## Non-negotiable accessibility and trust

- WCAG AA contrast; visible keyboard focus; semantic labels; 44×44px touch targets; Vietnamese legibility; no clipped text at 320px.
- Avoid trapping users inside overlays or preventing scrolling; respect iOS safe areas and touch input.
- Never hide instructions behind hover, animation, voice or color alone.
- No autoplay audio, flicker, flashing or forced timed goals. Users can stop any exercise.
- Reflection input stays local to the current page and is optional; do not persist it.
- Present effects as **possible user experiences**, not medical outcomes. Provide a quiet exit path.

## Boot and first-tap reliability in Facebook/Safari webviews

Reported on Netlify PR #241: buttons may look ready immediately after a new page load/reload but fail to react for several taps. Repeated initial tap diagnosis in Chromium (including CPU/network throttling) was successful; **the exact Facebook/iOS failure is not yet reproduced**, so avoid attributing it definitively to hover or one specific event.

- The fixed 50/50 game must use **stable viewport height** (`100svh` where supported, with a fallback), not dynamic `100dvh` for the main interactive grid. Mobile browser chrome can alter `dvh` during the first seconds and move hit targets under the finger.
- Never display **apparently actionable** story buttons before modules, scenario catalog, listeners and initial layout have settled. Use a short, clearly identified loading state; replace it with choices only once initialized. Do not rely on first paint or a static HTML label as proof of interactivity. Loading must not hide errors or take indefinitely.
- Accept a native `click` for keyboard/mouse/assistive tech. For touch browsers, support a carefully guarded short touch gesture and dedupe it against `pointerup` and the synthesized click. Track the original touch target/position so a browser toolbar reflow does not silently cancel a legitimate short tap. Do not trigger a choice on `touchstart`, drag or `touchcancel`.
- Avoid layout-changing hover/active transforms and avoid fixed overlays intercepting buttons. Keep three choices fully visible in the lower half. After each successful action, transition visibly and synchronously. Never silently swallow an exception without visible error feedback.
- **Owner-preview gate remains in force:** implement on PR #241, wait for Netlify Preview success, share the updated link, stop for owner retest on iPhone/Facebook. Only after approval run the full independent QA/merge/production sequence.

## Reliable single-tap actions on iOS / in-app browsers

The owner observed that a visual-novel button can appear inert on the first tap but activate after repeated taps (21 Nov 2026, Netlify Preview #241). CSS touch `:hover` and `:active` must **never translate or move a tappable target beneath a finger**; confine movement-style hover to `(hover: hover) and (pointer: fine)`. On `(hover: none)`, taps may change color or inset shadows but not geometry. All decision and continue/recover/replay buttons require `touch-action: manipulation`, stable minimum 44px targets, and a synchronous visual state transition from a successful action. Do not let an overlay steal pointer events from the story controls. Avoid mobile double-activation (touch pointerup followed by synthetic click) and retain keyboard/screen-reader activation through semantic buttons.

If a platform preview toolbar overlaps the page, log this as an external overlay and provide safe-area/layout resilience; do not claim CSS changes fix a third-party browser toolbar. Once preview feedback is approved, run touch-pointer tests in iPhone-like viewports, quick taps, keyboard and a full walkthrough with real screenshots before merge.

## Visual-novel dialogue hierarchy and owner preview gate

For `/tinh-huong/campaign/` on portrait phones, the painted stage owns the **upper 50%**, and the story/game HUD owns the **lower 50%**. Content priority in the lower half is: **the situation, every answer (all three, at least 44px tap height), then rewards**. Never cover answer buttons with XP, inventory, floating panels, ribbons, fixed-position badges, or other UI. During the **observe/choose** phase, hide the optional XP/rank card if it competes with choices; show the XP/rank reward card after a decision and in the day debrief. Do not force a scroll to expose an answer. Treat 320×480, 375×667, 390×660, 390×844 and short landscape as required regression sizes when QA is authorized.

Avoid generic speaker nameplates such as “Người cùng ca”. Narration and dialogue should be immediately readable, without extra forms, duplicate instructions, or status/debug labels. Remove the unused DOM and JS bindings when removing a nameplate, rather than hiding a single text value.

**Owner-directed preview-first workflow (2026-11-21):** when the owner requests changes to these game scenes, apply relevant rules/skills first, implement the UI on an unmerged branch, publish a **fresh Netlify Deploy Preview**, and send its verified URL **before** QA, merging or production rollout. Stop and await explicit owner approval. The preview's build-status confirmation is not an art review or post-approval QA gate. Only after approval run QA, handle findings, then merge and verify production. Do not imply a preview was approved just because it deployed.

## Mini-game acceptance template

For each new Yên Lab tool, record: **name and goal**, underlying technique and source, intended audience / cautions, 1–5 minute loop, full interaction states, reduced-motion equivalent, accessibility controls, privacy behavior, mobile screenshots, browser test evidence and deployment SHA. A calming animation without real interaction does **not** meet the game/tool acceptance criterion.

## Deliverable and reporting

Return the exact changed paths, PR/commit, meaningful test results, real screenshots or URLs when available, limitations and deployment status. Avoid a generic UI quality score without inspection evidence.

**References:** `references/RESEARCH-NOTES.md` and `references/QA-CHECKLIST.md`. External repos are inspiration and research, not silently installed packages or automatic permission to copy source.
