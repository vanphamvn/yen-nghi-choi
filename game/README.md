# Yencafeday 3D · BETA 03

**Một game mô phỏng làm việc và ngồi chơi trong quán Yên Coffee & Tea.**

Phiên bản này thay renderer nhân vật procedural của BETA 02 bằng **model GLB có rig/animation thật**, nội thất từ bộ asset CC0 và một góc quán dựng lại bằng Babylon.js. Mục tiêu hiện tại là **cozy stylized 3D playable**, không khẳng định đã đạt mức anime studio.

## Truy cập

- **Game mới:** `/game/`
- **Phiên bản renderer cũ:** `/game/?classic=1`
- **Art Lab để xem GLB và animation:** `/game/art-lab/`

Trang chủ đã có liên kết **Chơi thử game Yencafeday** với nhãn BETA.

## Vòng chơi

1. **Chọn 1 trong 5 vai:** Bảo vệ, Shipper, Pha chế, Phục vụ, Mèo cổ vũ. Chia 12 điểm kỹ năng qua 4 thuộc tính, mỗi thuộc tính 1–5.
2. **Vào quán khám phá:** di chuyển tự do, nói chuyện với 6 NPC, tương tác với các vật dụng, không có giới hạn thời gian.
3. **Mở Objective → Bắt đầu ca:** mọi NPC, vật dụng, tiến độ và điểm số reset theo ca; thời gian đếm tăng từ 00:00.
4. **Làm 3 nhiệm vụ của nghề:** đi đến vòng sáng, tương tác và dùng kỹ năng đặc biệt nếu muốn. Khi xong nhiệm vụ vẫn tiếp tục ở trong quán.
5. **Mở Objective → Kết thúc ca:** xem kết quả, **Sang ngày mới** để trở lại khám phá trong cùng một scene 3D. Có thể chơi bao nhiêu ngày tùy thích trong một phiên mở trang.

Trạng thái không lưu vào tài khoản hay bộ nhớ dài hạn; tải lại trang sẽ bắt đầu từ Ngày 01.

## Đồ họa và hoạt ảnh

- `world-v3.js` dùng Babylon.js 9.36.0 + GLB loader, tải động sau khi chọn vào quán.
- Có **6 biến thể humanoid rigged** với các clip `idle`, `walk`, `interact-right` và **một mèo 3D** có `idle`, `walk` và gesture.
- **11 loại props GLB** từ Kenney Furniture/Food/Nature và phần kiến trúc do dự án dựng: quầy, mái hiên, nền gỗ, cửa sổ, biển yên, cây, đèn, lối đi.
- 21 lượt container import trong scene hiện tại; reuse đường dẫn asset GLB self-hosted, không tải model từ domain thứ ba.
- Phần thoại NPC phát animation talk/idle; người chơi chuyển idle/walk/interact theo điều khiển.
- Camera 3/4 orthographic có follow và zoom gần hơn trong portrait.
- Có nút Objective đóng mặc định, toast thoại không che game, joystick cảm ứng và nút hành động.

## Kiểm thử và QA

```bash
python -m http.server 8000
node --test tests/game-smoke.test.mjs tests/game-day-loop.test.mjs \
  tests/game-anime-ui.test.mjs tests/game-art-lab.test.mjs \
  tests/game-v3-assets.test.mjs
```

**Kiểm thử 16/11/2026:** 23/23 Node checks đạt. Chromium headless với WebGL SwiftShader mở đủ 5 vai; viewport desktop 1440×900 và mobile-emulated 390×844; Art Lab mở GLB rigged 32 clips, không phát hiện page exception. Các con số này **không thay thế kiểm thử trên iPhone/Android thật**. Xem [QA record](./qa/BETA03_QA.md) cùng [ảnh desktop](./qa/v3-desktop-chromium.jpg) và [ảnh mobile mô phỏng](./qa/v3-mobile-chromium-emulation.jpg).

## Giấy phép và nguồn

Kenney Mini Characters, Cube Pets, Furniture Kit, Food Kit và Nature Kit: **CC0 1.0**. Bộ GLB self-hosted được copy byte-for-byte từ [Hidencod/tge-assets](https://github.com/Hidencod/tge-assets). Xem [CREDITS](./assets/v3/CREDITS.md) và [manifest bao gồm blob SHA](./assets/asset-manifest.json). Không có đăng nhập, tracking, upload asset khách hoặc thưởng tại quán.

## Giới hạn và việc tiếp theo

- Hình ảnh hiện là **stylized low-poly với rigged assets**, chưa phải concept, model và biểu cảm anime được làm riêng cho Yên.
- Những nhiệm vụ hiện vẫn dùng action progress đơn giản, chưa có animation riêng cho từng hành động phục vụ/pha chế.
- Chưa có benchmark FPS trên thiết bị Android/iOS thực; chưa có gamepad, multiplayer hay nhiệm vụ tự do vô hạn.
- Roadmap tiếp tục theo [Art Direction](./ART_DIRECTION.md), [Visual Rebuild Plan](./VISUAL_REBUILD_PLAN.md) và [Epic #72](https://github.com/vanphamvn/yen-nghi-choi/issues/72).

**Release strategy:** Phát hành BETA 03 ở đường dẫn chính sau QA; giữ bản cũ qua `?classic=1` để khôi phục nếu gặp lỗi WebGL/GLB.
