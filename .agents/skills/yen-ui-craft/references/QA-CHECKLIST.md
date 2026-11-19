# Yên web + Yên Lab QA acceptance checklist

Use this with `DESIGN.md` and the `yen-ui-craft` skill. Record real results, not expected outcomes. Recommended evidence: screenshots, URLs, browser/OS, source SHA, notes and reproducible steps.

## P0 — blocking functionality, safety, privacy

- [ ] Homepage link to Lab resolves to a real beta landing page (once shipped); all listed tools open their actual interaction.
- [ ] Every mini tool has a comprehensible start, stop/exit and reset; no infinite trap, blocked overlay or forced completion.
- [ ] Core action responds to mouse, keyboard and touch; active state and result are visible.
- [ ] No health claims of guaranteed benefit or clinical validation for a game implementation without direct evidence.
- [ ] No external storage, telemetry or persistence of moods/journal data without explicit authorization.
- [ ] No autoplay sound, flashing or essential audio cues.
- [ ] Error/network failure and unsupported-browser paths retain an understandable and usable fallback.
- [ ] Links and routing work on production origin and nested paths; security/CSP remains intact.

## P1 — visual, responsive, accessible, understandable

- [ ] Browser screenshots inspected at **320×640, 360×800, 390×844, 768×1024, 1440×900**; no accidental horizontal scroll, cut labels, offscreen CTA or sticky overlap.
- [ ] iPhone and Android touch, safe area, portrait/landscape, scroll restoration and back navigation checked.
- [ ] Main action remains discoverable in first screen; labels are literal and unambiguous even when copy is playful.
- [ ] Vietnamese diacritics render correctly; paragraph text normally ≥16px, ancillary touch UI ≥14px.
- [ ] Text normal contrast ≥4.5:1; large text and significant UI boundaries ≥3:1; do not signal success solely by color.
- [ ] Controls have meaningful labels, focus-visible, logical tab order, Enter/Space behavior and 44×44 CSS px touch targets.
- [ ] Dialogs and popovers: reachable close, Escape/back/overlay behavior as appropriate; focus management and scroll remain correct.
- [ ] Reduced-motion setting keeps all functions available; no content is invisible because animation was disabled.
- [ ] All active/exiting states render without overlap: initial, selected, running, paused, completed, reset, network error.
- [ ] Animation conveys state, stays interruptible and avoids layout thrashing / aggressive GPU effects.
- [ ] Existing site logo, typography and visual tone remain recognizable; no new generic card grid or unrelated theme.

## P2 — polish, robustness, performance

- [ ] Assess 200% browser zoom, long labels, smallest text width, screen readers, high-contrast settings and dark-mode surprises.
- [ ] Check slow CPU/network, large tap areas near edges, multi-tap/race conditions and page background/foreground resume.
- [ ] No console errors or broken asset requests during normal paths; no unexpected CDN/font blocking.
- [ ] Animations use CSS transforms/opacity when possible, avoid `transition: all`, and cancel cleanly on exit.
- [ ] No performance claim (e.g. 60fps) unless measured on a specified device; no invented screenshots or approvals.

## Required Yên Lab exercise record

`Name | user need | underlying method | evidence URL/date | evidence limitations | 1–5 min flow | interaction states | cautions | reduced-motion fallback | privacy notes | QA evidence | deployed SHA/URL`

## Release evidence

1. Run `node tools/audit-ui-design.mjs`.
2. Run relevant Node tests and Playwright tests, including new regressions for changes; preserve their exact output.
3. Review actual screenshots and keyboard/touch walkthrough for desktop and mobile viewports.
4. PR with summary, evidence, open defects and rollback path; require CI success before merge.
5. Confirm production route serves the expected revision; otherwise state **not verified in production**.

Node audits catch document-contract problems. They do **not** replace browser inspection, human/agent visual critique or real production verification.
