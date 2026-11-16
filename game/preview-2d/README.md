# Yencafeday 2D · Visual game remake (reference-driven)

> **Status:** playable reference-style preview; **NOT the final hand-painted anime sprite pack**. The user-provided screenshot with a wood-and-green café, dark top HUD, left action menu and model-preview modal is the primary layout/art-direction reference.

## Live preview

- Netlify PR preview: https://deploy-preview-87--yencafeday.netlify.app/game/preview-2d/
- GitHub draft PR: https://github.com/vanphamvn/yen-nghi-choi/pull/87
- Existing production 3D game remains at `/game/` until actual visual approval and migration gate.

## Implemented

**Page appearance and playable UX**
- Full-bleed hand-drawn vector café background with textured tile floor, warm afternoon lighting, green vines, espresso machine, counter, cake display, tables, bench, scooter, brand sign.
- Reference-style chocolate-dark top HUD with day, game clock, simulated coins, peacefulness and energy.
- Left vertical menu: **Bắt đầu ca**, **Kết thúc ca**, **Xem trước model**, **Objective**, **Nhật ký**, **Túi đồ**; functional contextual states.
- Right-side model-preview modal: five selectable roles, 4 directions (front/right/back/left) for human roles, animated CSS idle/walk/interact *motions* over single-frame illustrations, six preview poses, role apply.
- Mobile responsive: compact top HUD, horizontally scrollable menu, full-width model modal, joystick and two buttons.
- Character movement changes front/side/back textures by actual direction. **This is not yet per-direction multi-frame animation**. Cat retains its own silhouette.

**Gameplay**
- Phaser **v4.2.1** (pinned CDN) with 2D world, foreground actors and camera following the player.
- Five playable roles: barista, waiter, guard, shipper, cat.
- Six NPCs with rotating dialogue and six environmental interaction stations.
- Explore freely before shifts, start shift manually, do three role-specific tasks, manually end after completion, review simulated rewards and continue to unlimited next days.
- WASD/arrows, E interact, Q ability, and touch joystick + action/skill buttons.
- Journal and bag persist only in **in-memory tab state**; no cookies/accounts/saved progress/no real rewards.
- Model preview opens on first load to match reference. **Close** or **Apply** to start walking.

## Art production gap

The illustrated reference is **not** the current image texture itself. The game uses project-owned, separate vector illustrations so UI and entities can be interacted with. The high-quality anime portrait from the reference is the target for production sprite art, not a finished integrated sprite.

The next art iteration must replace the temporary vector characters/background with an approved **hand-painted 2D asset pack**, with transparent four-direction sprites, consistent face and clothing, actual idle/walk/interact frame sets, scene depth/foreground occlusion and visually verified screenshots.

The screenshot itself cannot be pasted into Phaser as the whole background because its buttons, modal, and characters would become noninteractive, duplicated pixels. These elements must remain real UI/animated sprites.

## Acceptance criteria before switching `/game/`

- [x] Functional preview with major reference UI hierarchy recreated
- [x] Character direction art for all humans (front, side, back) and five roles
- [x] Logic tested for 5 roles, 6 NPCs, day-loop, UI
- [ ] User approves actual runtime visual design (not only reference artwork)
- [ ] Replace placeholder SVGs with hand-painted/animated production sprites
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
  assets/*-{side,back}.svg # directional actor artwork
  assets/*.svg           # characters / cat
```

Related work: [Epic #84](https://github.com/vanphamvn/yen-nghi-choi/issues/84), [Gameplay #85](https://github.com/vanphamvn/yen-nghi-choi/issues/85), [Art approval #86](https://github.com/vanphamvn/yen-nghi-choi/issues/86).
