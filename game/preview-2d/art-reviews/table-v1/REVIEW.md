# Table v1 approval candidate

Status: **agent-reviewed under explicit user delegation**. Reviewer: Codex.
Owner review is pending; no owner acceptance has been recorded. The owner directed
"ưu tiên tự duyệt artwork trước tôi sẽ kiểm tra sau" on 2026-11-16. The runtime
integration uses this recorded delegation, image fingerprint and visual proof.

Agent assessment: soft warm-brown outlines, painted wood/material, upper-left light,
elliptical camera view, transparent edges and 140x86 scale were compared with the
barista front/side and waiter front PNG pixels plus the Phaser review scene. These
checks pass the agent review; they are not a human signoff or automatic aesthetic test.

Canonical input: `assets/sprites/barista.png`, front frame 0 and side frame 4; comparison also includes `assets/sprites/waiter.png`, front frame 0.
Built-in image generation produced a single transparent round wooden table using
that actual sheet as the style input. No external/API-key image service was used.

Art contract: warm brown contours, soft hand-painted shading, irregular wood grain,
upper-left light, gently visible elliptical tabletop, three short legs, no chairs,
floor, text, cups or books. Character display: 117x146; candidate display: 140x86.
The sprite is bottom-centred with 8 px source padding around alpha >=4 bounds;
this removes disconnected near-transparent output specks without repainting it.
The original generated output is retained separately; WebP is lossless RGBA.

Prompt: create one isolated 2.5D café table matching the supplied barista PNG's
delicate warm outline, subtle painted materials and cream highlights; avoid flat
vector shapes, thick dark contours, glossy plastic rendering, baked checkerboard,
extra props and any new character artwork. Preserve a transparent background.

Review brush/edge treatment, wood material, light direction, perspective, relative
height/width and alpha before approval. The contact sheet provides exact runtime
dimensions plus a 1.8x detail view; index.html renders the same source in Phaser.
Owner inspection remains pending. Integration, collision, interaction state and browser regressions are required before merging.
