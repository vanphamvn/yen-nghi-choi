# Research notes: 12 upstream design repos

Checked 2026-11-19. These repositories are **references**, not dependencies. Summaries below reflect project descriptions, not an endorsement of every technique. Follow each upstream license and review the exact asset/code license *before copying*. No third-party source code was copied into this skill.

| Source | Useful principle for Yên | Adoption decision |
| --- | --- | --- |
| [UI/UX Pro Max](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Design-system reasoning, color/type/layout guidance, actionable UX patterns | **Use methodology**, not an auto-generated replacement brand |
| [Awesome DESIGN.md](https://github.com/VoltAgent/awesome-design-md) | Examples of documented visual identity and consistent interface rules | **Use format ideas**; don't paste another brand's DESIGN.md |
| [Open Design](https://github.com/nexu-io/open-design) | Collaborative brief → prototype → review loop | **Borrow process**; no external studio, login or paid service required |
| [Taste Skill](https://github.com/Leonxlnx/taste-skill) | Actual-browser layout, responsive and performance gate | **Adopt verification principle**; do not install whole toolchain by default |
| [Impeccable](https://github.com/pbakaus/impeccable) | Separate critique, audit, clarify, polish and harden passes | **Adopt checklist**; do not promise its CLI has run |
| [React Bits](https://github.com/DavidHDev/react-bits) | Micro-interaction examples and movement language | **Reference only**; React dependency is unjustified for current vanilla site; review license |
| [Emil Kowalski Skills](https://github.com/emilkowalski/skills) | Appropriate timing/easing, animation restraint, review | **Prioritize** for meaningful tactile feedback, not decorative looping |
| [Hallmark](https://github.com/nutlope/hallmark) | Design quality floor, focus and contrast, responsive checks, anti-template critique | **Adopt hard floor** without inheriting arbitrary aesthetics |
| [Google DESIGN.md](https://github.com/google-labs-code/design.md) | Persistent markdown visual specification with machine-readable YAML tokens | **Adopt** in root `DESIGN.md`; alpha spec, review against upstream version |
| [GSAP Skills](https://github.com/greensock/gsap-skills) | Timelines, lifecycle cleanup, performance, reduced-motion handling | **Optional** only for real animation complexity and measured cost |
| [Scroll World](https://github.com/oso95/scroll-world) | Immersive scroll storytelling | **Reject for Yên Lab beta**: paid/video pipeline, heavy interaction and distraction |
| [Canvas UI](https://github.com/DavidHDev/canvas-ui) | WebGL over live interactive DOM; fallback planning | **Reject by default**: GPU/performance and accessibility risk outweigh usefulness for a calming 1–5 min tool |

## Yên-specific synthesis

1. **Identity before novelty.** Preserve Yên's existing warm paper, forest ink, Noto type and lightly absurd Cục Yên voice.
2. **One interaction per screen.** A quiet start and visible stop control are more important than particle effects.
3. **Quality is a verified behavior.** A screenshot is evidence of a rendered state, not evidence of functionality; tests are evidence of logic, not visual taste.
4. **No unnecessary stack migration.** The current website deploys statically; avoid React/Three/Canvas or external builders to gain effects that CSS and vanilla JS can provide.
5. **Research ≠ clinical validation.** Link claims to the underlying technique, check the study population and uncertainty; beta games remain unvalidated implementations.
6. **Production truth.** A merged PR does not prove Netlify/Vercel is serving that commit. Record exact deployment SHA and URL.

## Safe introduction of an upstream dependency

If a future feature genuinely needs an external library: document the purpose, bundle increase, compatibility with the site's CSP and mobile browsers, license/attribution requirements, fallback when unavailable, reduced-motion behavior, tests and an exit/removal plan. Paid API use, new accounts, user data processing, or provider/domain changes need explicit owner authorization. Do not vendor wholesale third-party skill catalogs into the Yên repository.
