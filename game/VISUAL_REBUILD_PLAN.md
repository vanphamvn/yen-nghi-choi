# Yencafeday · Kế hoạch làm lại đồ họa bằng vertical slice

**Version:** v0.1 · 2026-11-16 · **Status:** In progress (P0), chưa chạm production.

## Vì sao phải làm lại?

BETA 02 chạy Babylon.js nhưng nhân vật và bối cảnh phần lớn được tạo bằng hình khối trong mã nguồn. Các thử nghiệm trước đo cú pháp/đường deploy, không có hình chụp WebGL ở điện thoại nên không chứng minh hình ảnh đạt yêu cầu.

**Quyết định:** Giữ gameplay, giữ Babylon.js. Tách **asset-production pipeline** khỏi **gameplay runtime**, chỉ khi vertical slice được nghiệm thu mới thay visual renderer trên route game thật.

## Phạm vi vertical slice

1. Một hero chibi thực sự có nguồn mesh và rig hợp lệ, không tạo từ spheres trong JS.
2. Một góc quầy pha chế Yên với một nhân viên NPC.
3. Ba hoạt ảnh hero: Idle, Walk, Interact; một tương tác lấy/đặt ly.
4. Hệ thống máy ảnh, ánh sáng và vật liệu đạt cùng art direction.
5. Một preview độc lập được duyệt bằng ảnh/chơi thử trên desktop + mobile.

## Milestones/Gates

| Gate | Issue | Phụ thuộc | Kết quả bắt buộc | Trạng thái |
|---|---|---|---|---|
| P0 Baseline + Art Lab | [#73](https://github.com/vanphamvn/yen-nghi-choi/issues/73) | Không | GLB viewer, animation, camera, FPS, ảnh PNG; baseline QA plan | Đang làm |
| P1 Art direction | [#74](https://github.com/vanphamvn/yen-nghi-choi/issues/74) | P0 | Character sheet 3 góc, 3 biểu cảm, concept quầy, palette duyệt | Draft brief |
| P2 Hero asset | [#75](https://github.com/vanphamvn/yen-nghi-choi/issues/75) | P1 duyệt | Model GLB + rig + 3 clips + attribution, kiểm tra Art Lab | Chưa làm |
| P3 Environment | [#76](https://github.com/vanphamvn/yen-nghi-choi/issues/76) | P1 duyệt | Một góc quầy đẹp, texture + ánh sáng + camera, có screenshot | Chưa làm |
| P4 Gameplay | [#77](https://github.com/vanphamvn/yen-nghi-choi/issues/77) | P2+P3 | 1 NPC, 1 tương tác có animation, không regression luồng ngày | Chưa làm |
| P5 Release | [#78](https://github.com/vanphamvn/yen-nghi-choi/issues/78) | P4 | Visual review desktop/mobile, đo FPS, giấy phép, rollback | Chưa làm |

**Quy trình:** mỗi gate có pull request riêng; không merge dựa trên việc “deploy xanh”. PR phải ghi ảnh bằng chứng, thiết bị thử, lỗi, số đo và liên kết issue.

## Asset contract

Mỗi asset 3D có:

- `id` duy nhất, `status` (`proposed`/`approved`/`rejected`), `path` self-hosted hoặc chưa có, `license`/author/source rõ ràng.
- GLB glTF 2.0 với textures embedded; metric units quy đổi nhất quán; Y up, forward hướng theo chuẩn ghi trong manifest.
- Animation clips tên cố định `Idle`, `Walk`, `Interact` với loop/transition; rig skinning không vỡ.
- Bounding box/ground pivot; tri count, texture dimensions, download size được ghi lại từ Art Lab.
- GLB chưa có provenance thì **không được merge**. Cần đảm bảo thương mại theo đúng điều khoản của từng nguồn.

Xem [asset manifest](./assets/asset-manifest.json).

## Definition of done của vertical slice

- [ ] So sánh concept vs screenshot thật cùng góc trên desktop 1440×900, iPhone 390×844 và Android 360×800.
- [ ] Nhân vật rõ silhouette khi thu nhỏ, chân không trượt, mặt/tóc/áo không lỗi; clip Idle/Walk/Interact chạy.
- [ ] NPC có idle/talk, một hành động cầm/đặt ly có contact với prop; quầy và tường không che hero.
- [ ] Luồng khám phá → bắt đầu ca → 3 nhiệm vụ → kết ca → ngày mới giữ nguyên, UI Objective không che scene.
- [ ] WebGL chạy thử trên thiết bị có tên cụ thể; target median ≥30 FPS Android tầm trung, ghi fps/load time/tris/draw calls.
- [ ] Có asset bill of materials và giấy phép; bản fail load hiện lỗi và không làm sập homepage.
- [ ] Có hình trước/sau và xác nhận nghiệm thu trước khi chấp nhận PR production.

## Kỹ thuật kiến trúc

```text
game/
  game.js                    # gameplay và vòng đời ca (giữ nguyên tới P4)
  world-babylon.js           # renderer BETA 02 (giữ nguyên trong production)
  ART_DIRECTION.md           # nguyên tắc mỹ thuật
  VISUAL_REBUILD_PLAN.md     # roadmap/gates
  assets/asset-manifest.json # asset contracts, chưa coi là approved
  art-lab/                   # preview riêng, không ảnh hưởng game thật
    index.html
    style.css
    app.js
```

Dự kiến P2/P3 đưa model source và asset self-hosted vào repo (hoặc kho assets có URL/version pin), `world-v2` dùng GLB loader và animation groups, sau đó tích hợp có feature flag. Bản này chưa đổi renderer game thật.

## Review/Pull Request checklist

```markdown
- [ ] Linked issue & gate
- [ ] Art concept / reference approved
- [ ] Screenshot actual WebGL (desktop+iOS+Android)
- [ ] Gameplay regression
- [ ] Performance measured, device model/browser recorded
- [ ] Asset provenance/license
- [ ] Failure fallback and rollback path
- [ ] Explicit release approval
```

### Rollback

Cho đến khi P5 qua, mọi thứ nằm trên nhánh feature và route `/game/art-lab/`. Không sửa `/game/` đang public, không chuyển URL điều hướng từ trang chủ. Nếu xảy ra lỗi Art Lab, đóng PR hoặc revert commit, gameplay hiện hành không bị ảnh hưởng.

### Căn cứ kỹ thuật

- [Babylon.js GLB loader](https://doc.babylonjs.com/features/featuresDeepDive/importers/loadingFileTypes/)
- [Babylon.js GLB animations](https://doc.babylonjs.com/features/featuresDeepDive/animation/animatedCharacter)
- [Babylon.js performance](https://doc.babylonjs.com/features/featuresDeepDive/scene/optimize_your_scene/)
- [Epic #72](https://github.com/vanphamvn/yen-nghi-choi/issues/72)
