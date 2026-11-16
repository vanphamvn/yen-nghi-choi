# Table v1 approval candidate

Status: **needs-owner-review**. No reviewer or approval date has been recorded.
Do not add this candidate to approvedArt or the primary game runtime without the
owner's explicit review. This page is an isolated Phaser comparison, not a game
art release. M1 remains in progress; M2/M3 remain blocked on artwork acceptance.

Canonical input: `assets/sprites/barista.png`, front frame 0 and side frame 4.
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
Human visual approval and integration/collision/occlusion testing remain pending.
