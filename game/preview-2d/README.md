# Yencafeday 2D · Vertical slice preview

> **Cảnh báo mỹ thuật:** Route này là **prototype Phaser 4**. Hình nhân vật vector và nội thất đang dùng để kiểm tra gameplay. Concept anime màu nước chất lượng cao được tạo để người dùng xem trước, **chưa chốt thành sprite atlas** và chưa tích hợp vào game.

## Cách xem

Preview: \`/game/preview-2d/\` trên Netlify deploy preview của PR #87. **Không sửa /game/** đang chạy, không thay link từ trang chủ.

Chọn một trong 5 vai (Pha chế, Phục vụ, Bảo vệ, Shipper, Mèo cổ vũ), chọn Vào quán khám phá. Đi bằng WASD/mũi tên hoặc joystick trên điện thoại, đến gần NPC hoặc 6 vị trí quán, nhấn **E** hoặc **Tương tác**. Mở Nhiệm vụ để **Bắt đầu ca**, làm đủ 3 việc theo nghề, **Kết thúc ca**, rồi **Sang ngày mới**. Không đếm ngược thời hạn. Q hoặc Tuyệt chiêu dùng khi đang làm việc. Nhân vật, NPC, props được reset mỗi ngày.

## Động cơ và asset

- Phaser 4.2.1, cố định phiên bản tải từ jsDelivr.
- Tất cả SVG trong \`assets/\` là bản vector thử nghiệm do dự án tạo mới; không dùng asset từ nguồn thương mại không rõ quyền. Các ảnh concept trong chat chưa được export thành asset WebGL có hướng đi/bộ frame chính xác.
- Bối cảnh \`cafe.svg\` rộng 1440×900 cho góc quán 2D. Character placeholders \`barista.svg\`, \`guard.svg\`, \`shipper.svg\`, \`waiter.svg\`, \`guest.svg\`, \`reader.svg\`, \`cat.svg\`.
- 5 vai và 6 NPC, nhiệm vụ và hoạt động theo một state machine nhỏ ở \`game.js\`. Objective chỉ mở khi nhấn, độc lập giao diện HUD, trạng thái trong RAM.
- Browser mobile camera theo người chơi, điều khiển pointer, không tài khoản/cookies/localStorage.

## Giới hạn demo (được biết)

- Character placeholders là **ảnh SVG một frame**, nên chuyển động đi tạm dùng sway/tween. **Không phải spritesheet/animation thật.**
- Concept được duyệt rồi mới vẽ sprite atlas front/back/left/right + idle/walk/interact, cả NPC và mèo. Không dùng hình mock UI làm game texture.
- Layer collision là hình chữ nhật đơn giản; game chính cần tile collision/pathing/foreground occlusion và NPC routines.
- Chưa có screenshot trình duyệt WebGL thật trong môi trường hiện tại, chưa đo FPS iPhone/Android. CI xanh không phải visual QA.
- Game 3D hiện tại vẫn nguyên vẹn tại \`/game/\`, PR preview giữ **draft**.

## QA tối thiểu cần duyệt trước khi đổi route production

- [ ] Art direction được người dùng duyệt, chủ yếu nhân vật chibi và bối cảnh quán Việt Nam.
- [ ] Các sprite atlas thật dùng cùng style, không dính viền giấy, alpha sạch, trọn bộ 4 hướng.
- [ ] Idle/Walk/Interact có 4–8 frame hoặc animation skeleton 2D, không méo mặt/tay.
- [ ] Screenshot 1440×900 desktop, 390×844 iOS Safari, 360×800 Android Chrome.
- [ ] Median >=30 FPS ở Android thử nghiệm, camera, touch, controls không che nhân vật.
- [ ] Test 5 vai, 6 NPC, 6 props, 3 nhiệm vụ mỗi vai, vòng chơi nhiều ngày.
- [ ] Provenance, kích thước texture, network offline behavior, rollback plan.
- [ ] Người dùng xác nhận thay \`/game/\` trên prod.

## Links

- [Epic #84](https://github.com/vanphamvn/yen-nghi-choi/issues/84)
- [Playable vertical slice #85](https://github.com/vanphamvn/yen-nghi-choi/issues/85)
- [Art/animation approval #86](https://github.com/vanphamvn/yen-nghi-choi/issues/86)
- [Draft PR #87](https://github.com/vanphamvn/yen-nghi-choi/pull/87)
