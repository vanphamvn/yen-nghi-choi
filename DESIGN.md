---
version: alpha
name: Yên Coffee & Tea — Yên Lab
description: Existing Yên brand applied to a playful, low-stimulation, mobile-first collection of optional well-being mini tools.
colors:
  paper: "#f7f3e9"
  ink: "#243c35"
  muted: "#61746a"
  green: "#2e5a46"
  lime: "#dbe78d"
  pink: "#f6b4a6"
  lavender: "#dfd9f5"
  butter: "#f4d98a"
  white: "#ffffff"
  focus: "#a64b1d"
typography:
  body:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.6
  small:
    fontFamily: Noto Sans
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.5
  heading:
    fontFamily: Noto Serif
    fontSize: 40px
    fontWeight: 500
    lineHeight: 1.2
  label:
    fontFamily: Noto Sans
    fontSize: 16px
    fontWeight: 700
    lineHeight: 1.4
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
rounded:
  sm: 12px
  md: 20px
  lg: 28px
  pill: 999px
motion:
  feedback:
    duration: 160ms
    delay: 0ms
    timingFunction: ease-out
  transition:
    duration: 260ms
    delay: 0ms
    timingFunction: ease-in-out
components:
  primaryButton:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    borderRadius: "{rounded.pill}"
  page:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink}"
---

# Yên design system

**Status:** Canonical design direction for new Yên website improvements and the Yên Lab beta. Existing production CSS in `index.html` is the baseline implementation; it is not yet generated from these tokens. Resolve discrepancies deliberately rather than silently replacing the existing identity.

## Product and tone

Yên Coffee & Tea is a real café. The website offers a playful encounter with Cục Yên, then invites an optional offline visit. Yên Lab is a **beta** collection of short, evidence-informed interactive exercises for feeling a little calmer. It is not a medical device, diagnosis, treatment, leaderboard or compulsory wellness habit.

Keywords: *warm paper, quiet humor, tactile interaction, friendly clarity, playful restraint*. Avoid generic corporate SaaS cards, neon-glass dashboards, gamified performance pressure, casino-like rewards or laboratory impersonation.

Primary Yên Lab journey: **arrive → choose what you need → play one 1–5 minute activity → optionally reflect → leave or visit Yên**. Always permit skipping, stopping and exiting.

## Colors

The palette above reproduces the current site's primary color values (`--paper`, `--ink`, `--ink-muted`, `--green`, `--lime`, `--pink`, `--lav`, `--butter`). Prefer paper and ink as the dominant pair, green for primary affordances, and accents only when they clarify state.

Never rely on color alone. Check text contrast at actual rendered sizes: WCAG AA at least 4.5:1 for normal text, 3:1 for large text and meaningful UI boundaries. The existing `--ink-muted` on `--paper` must be rechecked whenever edited.

## Typography and Vietnamese copy

Keep Noto Sans for interface text and Noto Serif for selective editorial headlines, with system fallbacks. Respect Vietnamese accents at 320–390px widths and browser font substitution. Body is normally 16px or larger; captions not smaller than 14px for touch-first flows. Avoid tiny uppercase tracking, ambiguous Gen Z slang, decorative rotated labels covering text, and walls of instructional copy. One direct action and one short sentence per step.

The Cục Yên voice may be dry, unexpected and lightly absurd, but the action must always be obvious. A joke never replaces the name of a button, error or safety instruction.

## Layout and composition

Mobile first, then desktop. Content width approximately 1120–1248px on large screens with comfortable gutters. Compose a meaningful visual focal point per screen, not identical nested cards. Touch targets at least 44×44 CSS px. Test 320, 360, 390, 768 and 1440 viewport widths, including landscape, browser zoom and Vietnamese wrapping. No unintended horizontal scroll or overlays trapping interaction.

Use semantic native HTML. Define visible hover, pressed, focus, selected, disabled and error states. Do not depend on hover for touch.

## Motion and audio

Motion explains interaction (inhale/exhale, release, tap feedback), never merely decorates. Prefer opacity and transforms, brief eased transitions, and predictable stop/replay controls. Avoid flashing, autoplay sound, perpetual particle effects and long unskippable sequences. Respect `prefers-reduced-motion: reduce` and provide a functionally equivalent still version. Audio is off by default, always user-initiated, with visible mute/stop and without microphone permission.

A timed breathing guide must use unambiguous pacing and stop controls, never pressure users to hold their breath, and must not claim a guaranteed physiological effect.

## Visual assets

Reuse approved Yên branding and Cục Yên's established web identity; do not confuse it with the archived Phaser sprite-art policy. For *new* illustrations, define composition, palette, material and style up front. Visual polish needs real browser inspection at actual runtime scale; successful tests alone do not certify aesthetics. Avoid stock-looking placeholder imagery and copying competitors' assets.

## Interaction patterns

- Each mini tool has: plain-language name; one-line purpose; expected duration; optional intro; clear start, pause/exit and completion; optional reflection; explicit reset.
- State must be visible and explainable without audio, sound or animation.
- Do not collect or persist mood, journal text or health information. No analytics, cookies, external AI or storage without separate authorization.
- Any scientific claim needs a reference to research about the underlying technique. Never imply the custom game itself is clinically validated without evidence.
- No competitive scores, streaks, failure penalties, coercive nudges or claims that a person should feel better.
- On failure or slow devices, show useful text and accessible controls rather than a blank canvas.

## Components

For Yên Lab, default to vanilla HTML/CSS/JS, matching the existing static deployment and CSP. Native button, choice tile, focused exercise stage, progress indication, stop control and optional reflective prompt come before any animation library. Build custom components only where they aid comprehension.

React Bits, GSAP, Canvas UI and scroll-driven 3D are **inspiration, not dependencies**. Introducing any new framework, third-party code or render engine requires explicit justification, dependency/license review, a measured budget and fallbacks. Paid services/API keys require owner approval.

## Implementation contract

Read `AGENTS.md` and `.agents/skills/yen-ui-craft/SKILL.md` before building, redesigning or auditing Yên web UI. Use `.agents/skills/yen-ui-craft/references/QA-CHECKLIST.md` for visual and accessibility QA, and `RESEARCH-NOTES.md` for the external sources and their applicability.

Ship with actual browser evidence at multiple viewports and explicit deployment SHA. A PR, static screenshot, mockup or passing Node checks is **not** a verified production release.
