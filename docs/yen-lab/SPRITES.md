# Yên Lab · Painted Sprite Pack (art staging)

Generated 19/11/2026 for [Yên Lab epic #124](https://github.com/vanphamvn/yen-nghi-choi/issues/124).

## Inventory
- `games/g01`–`g20`: illustrated watercolor motifs for all 20 mini tools, not complete playable games.
- `shared/`: books, character poses, envelopes, notes, paper tags, leaves and decorative FX.
- `frames/book-flip-00.webp`–`07.webp`: eight painted book-page states.
- `atlases/book-pageflip.webp`: 4 columns × 2 rows, 410 × 410 pixels/frame, 180 ms nominal interval.
- `manifest.json`: machine-readable asset listing and animation metadata.

## Guardrails
- **Art stage only.** Do not replace existing production assets until owner visual approval and mobile QA.
- Game text, input and actions stay in semantic HTML. These raster images are visual accompaniments, not a substitute for real gameplay.
- No personal data. No animation in reduced-motion mode. No autoplay audio.
- Existing main website and Phaser archival code remain untouched.
- Artwork is AI-generated and newly created for Yên Lab. Maintain original files as source reference; do not imply clinical efficacy from visuals.
- Game panels include their painted paper backing. Shared assets and book flip should be composited over the cream-paper stage; inspect cropping and sizing per game before integration.

## Rendering book frames
Use `object-position` or a canvas `drawImage` source rectangle (4 × 2 grid). For a static fallback, use `frames/book-flip-00.webp`. Never create animation based only on CSS scale.

## Review
Check 320/360/390/768/1440, color consistency against existing `lab/assets`, every animated frame for ghost pixels / alpha fringes, min 44px touch targets, voiceover and reduced-motion.
