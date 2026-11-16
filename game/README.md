# Yencafeday 3D BETA · 03

Trò chơi mini web 3D cho **Yên Coffee & Tea**. Thiết kế mới sử dụng **Babylon.js 9.36.0** làm 3D engine thay cho renderer Three.js cũ, với mô hình quán diorama phong cách anime, nhân vật chibi và ánh sáng cel-shading nhiều cấp.

## Tính năng và trải nghiệm

- Chọn **5 nghề** (Bảo vệ, Shipper, Pha chế, Phục vụ, Mèo cổ vũ); chia **12 điểm** cho 4 thuộc tính.
- Chế độ **khám phá tự do**: di chuyển qua quán và nói chuyện với 6 NPC (2 khách, 3 nhân viên, 1 mèo), tương tác với 6 khu vực/vật dụng.
- **Tự bắt đầu ca**, hoàn thành 3 nhiệm vụ theo nghề, tự **kết thúc ca**, xem kết quả và **sang ngày mới** không phá scene. Không giới hạn thời gian hoặc ngày chơi trong phiên.
- **Objective thu gọn mặc định** thành một nút trạng thái nhỏ: Khám phá / 1/3 / Xong 3/3. Chỉ khi người chơi bấm mới mở bảng. Sau khi vào ca hoặc chuyển ngày, panel tự đóng.
- Lời thoại NPC và thông báo tương tác hiển thị qua **toast nhỏ phía dưới**, không cần mở Objective.

## Dựng hình 3D

- `game/world-babylon.js` tạo Babylon `Engine`, `Scene`, camera orthographic, model, trang trí và shader cel-shading 3 cấp.
- Quán Yên được dựng lại với mái che, cửa sổ, đèn lồng, biển Yên, quầy, máy pha, kệ, bàn ghế, cây cối, lối vào và xe giao nước.
- Nhân vật chibi 3D có khuôn mặt, tóc, trang phục theo nghề; mèo có tai, mắt và đuôi. Các mô hình dùng geometry tự dựng, không lấy asset có bản quyền bên ngoài.
- Babylon.js chỉ được **lazy-load khi người dùng bấm Vào quán khám phá**. Bản BETA đang dùng file UMD ghim phiên bản trên jsDelivr; dự án nên chuyển sang bundle self-hosted khi sản phẩm trưởng thành.
- `game/game.js` chỉ giữ luật chơi, kỹ năng, đối thoại, tương tác, reset và trạng thái ngày; scene và asset 3D nằm trong module riêng.

## Điều khiển

- Desktop: WASD hoặc phím mũi tên để đi; E tương tác; Q dùng kỹ năng khi làm việc.
- Mobile: joystick và nút Tương tác / Tuyệt chiêu.
- Nút **Objective** ở góc trên để mở bảng nhiệm vụ, nơi có nút Bắt đầu ca hoặc Kết thúc ca tùy trạng thái.

## Chạy thử và kiểm tra

Dự án tĩnh, không cần bước build:

```bash
python -m http.server 8000
node --test tests/game-smoke.test.mjs tests/game-day-loop.test.mjs tests/game-anime-ui.test.mjs
node --check game/game.js
```

Mở http://localhost:8000/game/ trong trình duyệt hỗ trợ WebGL.

### Kiểm thử trực quan cần thực hiện trước khi coi BETA ổn định

- [ ] Trên Chrome/Safari/Firefox: Babylon scene lên hình không trắng/đen, cel-shading và outlines không vỡ, không lỗi shader.
- [ ] Trên iOS Safari và Chrome Android: kiểm tra tốc độ khung hình, nhiệt máy, joystick và nút tương tác.
- [ ] Objective mặc định đóng; bấm mở/đóng, scroll nội dung; vẫn đọc được lời thoại NPC khi đóng.
- [ ] Kiểm thử cả 5 avatar, vị trí xuất hiện, camera theo người chơi, va chạm bàn/quầy/xe.
- [ ] Bắt đầu ca và tương tác cả 6 loại vật dụng; xác nhận props/NPC reset.
- [ ] Hoàn thành 3 nhiệm vụ, kết ca và sang nhiều ngày; không mất scene hoặc crash WebGL.
- [ ] Quay về chọn nhân vật, rồi trở lại game; scene trước đã dispose hoàn chỉnh.
- [ ] Bật network throttling hoặc chặn CDN; thông báo lỗi xuất hiện thay vì trang trắng.
- [ ] Xem UI portrait/landscape và màn hình thấp; nút Objective không che joystick và hành động.

**Giới hạn:** hình ảnh hiện là mô hình 3D anime tạo bằng code, chưa phải các nhân vật rigged/animation chất lượng studio. Chưa có multiplayer, tài khoản, bảng xếp hạng hay phần thưởng đổi tại quán. Không lưu thông tin cá nhân.

## BETA 03 · Self-hosted hero GLB + animation integration

- `game/assets/yen-barista-v1.glb` is an original, self-hosted 339,828-byte glTF 2.0 file with `Idle`, `Walk`, `Interact` animation clips and detailed chibi-style facial/clothing components.
- Babylon.js GLB loader is pinned to v9.36.0 and loaded only after entering the game. If GLB fails, procedural fallback remains playable.
- The human roles use a shared animated barista base with role-specific colors and accessory silhouettes (guard hat, shipper backpack, waiter tray). The cat remains a distinct feline avatar.
- `world-babylon.js` handles the animated character, a closer mobile camera, contact-shadow stage dressing and moving steam from the café counter.
- The existing loop, NPC interactions, start/end shift, next day, mobile controls and collapsed Objective remain unchanged.
- The new model is articulated using transform-node animation, **not a production-quality skinned/rigged Blender asset**. Visual QA with actual browser screenshots and mobile FPS is still required before calling art direction complete.
- Asset provenance and limitations: [assets/ASSET_LICENSES.md](./assets/ASSET_LICENSES.md).
- New structural regression: `node --test tests/game-v3-asset.test.mjs`.

**Production release policy:** This BETA 03 remains clearly marked as a work in progress. It improves playable character presentation but does not close art issues #74–#78; the more ambitious artist-approved model and environment remain in the roadmap. Source-level tests cannot substitute for human visual approval.
