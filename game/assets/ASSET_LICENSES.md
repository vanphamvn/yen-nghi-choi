# Yencafeday 3D assets · provenance

## `yen-barista-v1.glb`

| Field | Value |
|---|---|
| Creator | Original asset constructed for Yencafeday in this project |
| License | Project-owned original asset (no third-party meshes, textures or animation clips included) |
| Format | glTF 2.0 binary (.glb) |
| Size | 339,828 bytes |
| Geometry | 36 mesh primitives, 43 nodes, 15 material colors |
| Motion | `Idle` / `Walk` / `Interact` animation groups |
| Shape language | Stylized chibi barista, green apron, ivory shirt, dark hair, sculpted bangs, face details |
| Rendering | Babylon.js GLB loader, self-hosted at `/game/assets/yen-barista-v1.glb` |
| License attribution | None required for third-party assets because none were used |

### Quality limits, not marketing claims

This GLB was built from custom parameterized surfaces and articulated transform nodes. **It is not yet a Blender-sculpted, skinned skeletal-rig character**, and has not passed in-browser screenshot QA on real devices. Its role is an independent, animated, self-hosted replacement for the previous browser-generated humanoid figures. It is a practical step toward Issue #75, not proof of the final art-direction gate.

All four human player roles share this GLB with role color/accent variations; the playable cat continues using its distinct existing model. No external asset URL is required beyond Babylon.js library runtime (which is separately pinned).

### Compatibility and rollback

When GLB fetch/parse fails the existing Babylon procedural avatar remains visible and game controls stay accessible. To roll back, revert the BETA 03 PR or point the game back at the previous `world-babylon.js` renderer. Existing shift/NPC state remains the source of truth.

### Outstanding art work

- [ ] Artist-approved front/side/back character concept and expression sheet (Issue #74).
- [ ] UV-painted textures and skinned rig (Issue #75).
- [ ] Real foot contact and animation transitions with easing (Issue #75).
- [ ] In-browser visual screenshots and FPS verification (Issue #78).

No paid/unknown-license marketplace assets are included.
