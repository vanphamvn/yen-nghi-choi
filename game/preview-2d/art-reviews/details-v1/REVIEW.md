# Painted interaction details v1 — actual Codex assessment

Reviewer: Codex, agent under explicit user delegation of 2026-11-16.
Owner inspection remains pending. No owner signoff is claimed.

Inputs: actual barista.png (front/side), waiter.png (front), painted table from #112.
Built-in imagegen used those actual barista pixels as the supplied style input for
three separate calls; no API key. Original outputs retained by generation system;
sources.json records exact output IDs, dimensions, crops and normalized dimensions.
See BRIEF.md for the art contract written before generation.

Prompts: one isolated cream ceramic coffee cup with coffee and right handle, no saucer;
one open cream-paper brown-cover book, no readable text; one broad honey-cream cloth
cushion with restrained seam/folds. Each requested thin irregular warm-brown outline,
painted material shading, upper-left light, mild elevated front view matching actual
reference PNG, transparent background, no characters/floor/cast shadows or extra props,
no vector or glossy 3D appearance.

Visual assessment against contact-sheet.png: brush/line pass (soft warm contours and
nonuniform material shading); lighting pass (top-left highlights); perspective pass
(top surfaces align with table, cushion slightly elevated front); scale pass (cup
24x24, book35x17, cushion69x47 alongside 117x146 characters); alpha pass (real generated
alpha, no baked checkerboard). Source aspect ratios preserved within runtime pixel
rounding rather than stretching to the old SVG proportions. Small details naturally
lose texture at phone resolution; this is not a claim of legible book text.

Processing crops alpha>=4 bounds with4px padding, downsamples to <=384px, writes
lossless RGBA WebP. It does not repaint or replace alpha. Separate layers preserve
cup removal, book tilt effect and cushion displacement/reset. These effects do not
claim new seated or page-turn animation frames. Runtime screenshots at three viewports
are captured by browser CI; actual production verdict belongs in the release PR/issue.

Six active world SVGs remain. Strict art release is still blocked, not completed.

Browser regression exposed immediate undo at task completion: table/bench now keep
their completed state until explicit interaction or day reset. Asset network responses
are checked because Phaser exposes blob URLs for decoded image sources.
