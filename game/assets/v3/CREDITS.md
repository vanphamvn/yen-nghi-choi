# Asset credits and provenance for Yencafeday BETA 03

All shipped third-party GLB assets under `game/assets/v3/` originate from **Kenney**, published under **Creative Commons Zero 1.0 Universal (CC0-1.0)**. Use in commercial games and modifications are permitted without mandatory attribution. Credit provided for transparency.

## Official author and packs

| Pack | Official source | Shipped GLBs |
|---|---|---|
| Kenney Mini Characters | https://kenney.nl/assets/mini-characters | 6 character variants (female a–c, male a–c) |
| Kenney Cube Pets | https://kenney.nl/assets/cube-pets | animal-cat |
| Kenney Furniture Kit | https://kenney.nl/assets/furniture-kit | kitchenbar, kitchencoffeemachine, table, chairmodernframecushion, chairrounded, benchcushion, plantsmall1, bookcaseopen |
| Kenney Food Kit | https://kenney.nl/assets/food-kit | cup-coffee, mug |
| Kenney Nature Kit | https://kenney.nl/assets/nature-kit | tree-default |

**Repackaged GLB source:** https://github.com/Hidencod/tge-assets (Kenney CC0 assets in a browser-friendly catalog). The corresponding source files were copied byte-for-byte via GitHub binary blobs, not regenerated with AI. Each file's exact Git blob SHA, upstream path and official pack link is recorded in [asset-manifest.json](../asset-manifest.json).

## Game production scope

- The characters and cat have original authored skinned geometry and embedded animation clips. Mini Characters includes `idle`, `walk`, `interact-right`, `sit` and others. The cat includes `idle`, `walk`, `gesture-positive`.
- Runtime scales/pivots assets to the game world and controls animation states through Babylon.js; the original GLB binaries are not edited.
- Built-in scene materials, ground texture, sign, architecture, interaction effects and game code are created for Yencafeday.
- `/game/?classic=1` remains an explicit fallback to the prior geometry-based renderer.

## Quality limitations

- These assets are **stylized low-poly**, not hand-modeled studio-quality anime or an approved custom Yên character lineup.
- Automated checks confirm valid GLB files and animations, but FPS and visuals still depend on the browser/device.
- The longer-term vertical-slice model/rig/art-approval work remains tracked in [issues #72–#78](https://github.com/vanphamvn/yen-nghi-choi/issues/72).
