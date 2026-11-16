# Yencafeday 2D · Visual game remake (reference-driven)

> **Status:** playable reference-style preview; **five imported 4×4 anime sprite sheets are now playable**; the café now uses a generated hand-painted WebP with separate transparent plant foreground; on-device visual sign-off remains pending. The user-provided screenshot with a wood-and-green café, dark top HUD, left action menu and model-preview modal is the primary layout/art-direction reference.

## Live preview

- Netlify PR preview: https://deploy-preview-87--yencafeday.netlify.app/game/preview-2d/
- GitHub draft PR: https://github.com/vanphamvn/yen-nghi-choi/pull/87
- Production `/game/` now uses Phaser 2D; the Babylon 3D rollback remains available at `/game/3d.html`.

## Implemented

**Page appearance and playable UX**
- Self-hosted 1440×900 illustrated WebP café interior with warm afternoon lighting, vines, espresso machine, pastries, tables, bench and scooter. Foreground leaf mask is a separate transparent WebP layer for actor occlusion.
- Reference-style chocolate-dark top HUD with day, game clock, simulated coins, peacefulness and energy.
- Left vertical menu: **Bắt đầu ca**, **Kết thúc ca**, **Xem trước model**, **Objective**, **Nhật ký**, **Túi đồ**; functional contextual states.
- Right-side model-preview modal: five selectable roles, 4 directions (front/right/back/left) for human roles, actual PNG-frame Idle/Walk/Interact cycling from 16-frame sprite sheets, six preview poses, role apply.
- Mobile responsive: compact top HUD, horizontally scrollable menu, full-width model modal, joystick and two buttons.
- Character movement uses multi-frame Phaser animations for down/right/up with left-facing mirrored right frames. Interact plays a non-looping four-frame sequence. Cat has its own 16-frame sprite sheet.

**Gameplay**
- Phaser **v4.2.1** (pinned CDN) with 2D world, foreground actors and camera following the player.
- Five playable roles: barista, waiter, guard, shipper, cat.
- Six NPCs with rotating dialogue and six environmental interaction stations.
- Explore freely before shifts, start shift manually, do three role-specific tasks, manually end after completion, review simulated rewards and continue to unlimited next days.
- WASD/arrows, E interact, Q ability, and touch joystick + action/skill buttons.
- Journal and bag persist only in **in-memory tab state**; no cookies/accounts/saved progress/no real rewards.
- Model preview opens on first load to match reference. **Close** or **Apply** to start walking.

## Art production gap

The illustrated reference is **not** the current image texture itself. The game now uses **real RGBA PNG sprite art** for all playable roles and NPCs, sourced from the five user-approved/generated 4×4 sheets. The café scenery is now a self-hosted 1440×900 painted WebP illustration, with a separate transparent foreground foliage texture. The screenshot is still an art-direction reference, not a pixel-perfect recreation.

The next art iteration should add **dedicated customer NPC sprite art**, refined foreground occlusion, and visual QA screenshots. Reader/guest NPCs temporarily reuse the existing five role packs, though no actor SVG is loaded by Phaser.

The screenshot itself cannot be pasted into Phaser as the whole background because its buttons, modal, and characters would become noninteractive, duplicated pixels. These elements must remain real UI/animated sprites.

## Acceptance criteria before switching `/game/`

- [x] Functional preview with major reference UI hierarchy recreated
- [x] Character direction art for all humans (front, side, back) and five roles
- [x] Logic tested for 5 roles, 6 NPCs, day-loop, UI
- [ ] User approves actual runtime visual design (not only reference artwork)
- [x] Replace SVG actors with five transparent PNG sprite sheets, 16 frames/role, 7 clip definitions (idle/walk/interact)
- [ ] Browser screenshot test desktop 1440×900, iPhone 390×844, Android 360×800
- [ ] Mobile 30 FPS median target measured on a real device
- [ ] Fix blocking visual/gameplay defects and check accessibility
- [ ] Explicit sign-off on production route replacement

## File overview

```text
preview-2d/
  index.html             # real interactive HUD and preview modal
  style.css              # reference-inspired layout and responsiveness
  game.js                # Phaser scene + game logic + UI state machine
  assets/cafe.svg        # legacy original vector stage (kept for rollback)
  assets/cafe-painted.webp # new 1440×900 raster scene art
  assets/cafe-foreground.webp # alpha-cut foreground foliage for depth
  assets/sprites/*.png   # five original anime character spritesheets, 1024×1280 RGBA
  assets/sprites/manifest.json # roles, frame mapping, SHA-256, provenance
  assets/*.svg           # legacy authoring assets; no longer loaded for actors
```

Related work: [Epic #84](https://github.com/vanphamvn/yen-nghi-choi/issues/84), [Gameplay #85](https://github.com/vanphamvn/yen-nghi-choi/issues/85), [Art approval #86](https://github.com/vanphamvn/yen-nghi-choi/issues/86).


## Sprite integration v1

- Five assets in `assets/sprites/`: `barista.png`, `waiter.png`, `shipper.png`, `guard.png`, `cat.png`. Each contains **4 columns × 4 rows of 256×320** bottom-aligned, transparent frames, total 1024×1280.
- Normalization: remove disconnected background specks, reduce semi-transparent red/yellow halos and align character feet to a consistent pivot.
- Frame groups (row-major): idle-down 0–1, walk-down 2–3, idle-right 4–5, walk-right 6–7, idle-up 8–9, walk-up 10–11, interact 12–15. Mirror right to obtain left.
- All actor sprites use `this.load.spritesheet` and `this.add.sprite` in Phaser, with 35 named clips (7 × 5 roles). The modal cycles **real frame indices**, not CSS offsets on SVGs.
- NPC reader/guest temporarily reuse existing role sprites (waiter/shipper) pending bespoke customer art.
- Dedicated extracted frame PNGs are available in the downloadable sprite pack for editing. Runtime intentionally uses sheets rather than 80 network requests.
- Verify on mobile and desktop before replacing the 3D production route.

## Painted café scene integration (16/11/2026)

- The scene is now rendered from `assets/cafe-painted.webp` (1440×900, ~206 KiB), **not generated with SVG primitives**. It is an original AI-assisted illustration created for Yên, with a warm anime storybook look.
- `assets/cafe-foreground.webp` (1440×900 transparent, ~36 KiB) restores plants in front of actors for depth. The underlying café scene is full-bleed; the foreground occlusion texture is drawn at depth 950. Character sprites use their feet y-coordinate for depth sorting.
- The chalkboard says **yên / COFFEE & TEA** in localized Phaser text so it remains editable and crisp rather than text baked into the illustration.
- The collision map was adapted to the new furniture layout: counter, elliptical table, bench, scooter and planted left edge. Station coordinates now point to reachable floor by relevant props. `tests/game-2d-background.test.mjs` checks 6/6 stations and walkable connectivity.
- Original `assets/cafe.svg` is retained for future rollback, but no longer loaded by Phaser.
- **Known limitations:** This is one main painted scene with a transparent foliage layer, not a fully tiled/multilayer 2D map. Some furniture is painted into the background rather than animated objects. Real browser screenshot and mobile FPS QA remain necessary.

Source imagery was generated specifically for this project, not copied from a third-party game asset pack.

## Layered prop sprite scene (16/11/2026)

The preview now uses a **new architecture-only 1440×900 SVG backdrop** instead of drawing furniture into `cafe-painted.webp`. Six independent transparent Phaser SVG textures represent the door, counter, round table, bench, potted plant and delivery scooter. Cup, book and cushion are independent child sprites. Every major prop has a bottom-centre pivot, anchored world dimensions, contact shadow, individual depth and a collision footprint with reachable interaction stations.

On interaction: the café machine emits steam, table cup is picked up/returned, book tilts, bench cushion shifts, scooter headlamp switches on, door tilts and leaves react. NPC/character PNG sheets and existing gameplay remain. The old WebP scene files are retained in the repo for visual fallback, but are not loaded by the new runtime.

QA: `node --test tests/game-2d-background.test.mjs game/preview-2d/tests/game-contract.test.mjs` plus SVG XML parsing via Python's standard library. To inspect sprite positions in browser, use `/game/preview-2d/?qa=1` and `window.__yenQA.inspect().props`.

Known limits: the sprite props are newly authored vector art in a consistent warm game palette, not yet an anime-painted raster production atlas. Human sit/stand sprite sheets remain a separate art requirement. Actual mobile screenshot sign-off remains required.

## Art-style cohesion incident / reusable agent skill

**Root cause:** PR #91 authored nine props and one architecture background as independent vector SVGs with hard strokes, simple gradients and geometric shapes, while the canonical role sprites remain hand-drawn anime/chibi RGBA PNGs. The earlier tests verified valid SVG XML, collision, pivots and runtime animation, but never compared art styles at actual gameplay size. Similar colors do not make different render languages coherent.

**New safeguards:**
- Root `AGENTS.md` requires `.agents/skills/yen-sprite-style/SKILL.md` for game art and scene tasks.
- `assets/scene/art-style-policy.json` freezes the 10 historical vector snapshots in `art-reviews/legacy-svg/` as **unapproved archival comparisons** (exact Git blob SHA), freezes original character PNGs and historical painted WebPs, and requires human-reviewed side-by-side evidence for each new raster sprite.
- `tools/audit-art-style.mjs` is part of CI; new unreviewed art or modifications to quarantined SVGs fail. `node game/preview-2d/tools/audit-art-style.mjs --strict` additionally fails while mismatched legacy world art remains.
- `art-review.html` displays real character reference frames beside all current SVG props and both backgrounds, with the explicit “not yet visually approved” label.

**Important:** A passing CI is not a declaration of stylistic match. The new skill/policy make the mismatch visible and prevent compounding it. The ten legacy vector assets still require redrawing as consistent painterly sprites and owner review; they were **not** silently marked fixed.

## Autonomous game completion roadmap

The current Phaser 2D scope is tracked in [ROADMAP.md](ROADMAP.md), [machine-readable milestones](ops/roadmap.json), and [release journal](ops/CHANGELOG-GAME.md). The project-wide epic is [#94](https://github.com/vanphamvn/yen-nghi-choi/issues/94), with M0–M7 issues and the existing art-remediation issue [#93](https://github.com/vanphamvn/yen-nghi-choi/issues/93).

To choose safe next work: `node game/preview-2d/tools/next-work.mjs`. To validate the contract: `node game/preview-2d/tools/next-work.mjs --validate`.

Reusable skills: `.agents/skills/yen-game-director/SKILL.md` (scope and prioritization), `.agents/skills/yen-game-release/SKILL.md` (QA and shipped SHA), `.agents/skills/yen-sprite-style/SKILL.md` (art consistency). Agents can safely ship independent gameplay/QA increments while waiting on owner artistic approval; only a verified production deployment counts as shipped.

## Painted scene release candidate (2026-11-17)

All ten PR #91 vector world textures are archived only under `art-reviews/legacy-svg/`; the live Phaser game now loads the character-anchored painted `backdrop-painted-v1.png` and reviewed raster props. The door station and guard route moved to x≈535 in the game world to avoid overlap with the arched window. Review evidence `art-reviews/architecture-v1/contact-sheet.png` is a local preflight composition, **not** a genuine Phaser screenshot. Real browser evidence, production SHA checks and owner inspection remain separate requirements. Door open/closed alternate artwork and true character sitting animation are tracked work, not claimed finished.
