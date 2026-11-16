# Yencafeday 2D · Visual game remake (reference-driven)

> **Status:** playable reference-style preview; **five imported 4×4 anime sprite sheets are now playable**; the illustrated café backdrop remains vector and visual sign-off is pending. The user-provided screenshot with a wood-and-green café, dark top HUD, left action menu and model-preview modal is the primary layout/art-direction reference.

## Live preview

- Netlify PR preview: https://deploy-preview-87--yencafeday.netlify.app/game/preview-2d/
- GitHub draft PR: https://github.com/vanphamvn/yen-nghi-choi/pull/87
- Existing production 3D game remains at `/game/` until actual visual approval and migration gate.

## Implemented

**Page appearance and playable UX**
- Full-bleed hand-drawn vector café background with textured tile floor, warm afternoon lighting, green vines, espresso machine, counter, cake display, tables, bench, scooter, brand sign.
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

The illustrated reference is **not** the current image texture itself. The game now uses **real RGBA PNG sprite art** for all playable roles and NPCs, sourced from the five user-approved/generated 4×4 sheets. The café scenery remains a project-owned scalable vector illustration. The screenshot is still an art-direction reference, not a pixel-perfect recreation.

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
  assets/cafe.svg        # original café stage painting (vector)
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
