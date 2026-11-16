# Yên: Ai đang làm việc? — MVP 3D

Một mini-game 3D chơi ngay trong trình duyệt tại `/game/`, tách biệt khỏi trang chủ Yên. Không dùng backend, tài khoản, phần thưởng thật hoặc lưu dữ liệu.

## Đã có trong bản này

- Năm nghề: Bảo vệ, Shipper, Pha chế, Phục vụ, Mèo cổ vũ.
- Phân bổ **12 điểm** cho Nhanh nhẹn, Khéo léo, Bình tĩnh, Duyên dáng; mỗi chỉ số từ 1 đến 5.
- Mô hình quán isometric 3D dựng bằng hình khối low-poly qua Three.js, nhân vật và đồ vật riêng.
- Di chuyển: WASD / phím mũi tên hoặc joystick cảm ứng. Bấm **E** / **Tương tác** ở vòng sáng để làm nhiệm vụ. Bấm **Q** / nút tuyệt chiêu.
- Mỗi nghề có 3 nhiệm vụ; tương tác mất thời gian theo chỉ số Khéo léo; có sự cố bất ngờ và kỹ năng riêng với cooldown.
- Hai chỉ số **Hiệu suất** và **Độ Yên**, đồng hồ 2 phút 30 giây, màn kết ca và chơi lại.
- Người chơi không cần cung cấp dữ liệu, kết quả biến mất khi rời trang.

## Chạy thử

Dự án Yên là website tĩnh, không cần npm hoặc bước build:

```bash
python -m http.server 8000
```

Mở http://localhost:8000/game/ . Cần kết nối mạng để tải Three.js phiên bản đã ghim từ jsDelivr khi bắt đầu chơi.

Kiểm tra nhanh mã nguồn (cần Node.js):

```bash
node --test tests/game-smoke.test.mjs
node --check game/game.js
```

## QA trước khi merge

- [ ] Desktop Chrome/Firefox/Safari: chọn đủ 5 vai, bớt và cộng điểm, bắt đầu khi tổng đúng 12.
- [ ] Bàn phím: WASD, các mũi tên, E, Q hoạt động, không cuộn trang khi chơi.
- [ ] Mobile Chrome Android và Safari iOS: joystick, tương tác, tuyệt chiêu, xoay ngang/dọc, không tràn màn hình.
- [ ] Mỗi vai: hoàn thành đủ 3 nhiệm vụ; kiểm tra game không lỗi khi nhiệm vụ cuối kết thúc.
- [ ] Dùng tuyệt chiêu và chờ cooldown; quan sát thanh Hiệu suất/Độ Yên đổi.
- [ ] Để đồng hồ hết giờ; thoát giữa ca; chơi lại và đổi vai.
- [ ] Giảm chuyển động (prefers-reduced-motion) và kiểm tra focus bàn phím trên màn chọn nghề.
- [ ] Kiểm tra trang chủ không bị ảnh hưởng; liên kết nhỏ “Vào ca 3D” hoạt động.
- [ ] Tắt mạng hoặc chặn CDN: màn báo lỗi được hiển thị thay vì trang trắng.

## Ngoài phạm vi bản đầu

- Multiplayer và đồng bộ phòng, điểm xếp hạng, đăng nhập hoặc lưu tiến độ.
- Thưởng tại quán thật; chưa liên kết vòng quay hoặc chương trình khách hàng thân thiết.
- Nhân vật 3D điêu khắc chất lượng cao, hoạt ảnh rigged, âm thanh và vật lý đồ uống.

**Về kiến trúc:** `game/index.html` chứa cấu trúc UI, `game/style.css` chứa layout responsive, `game/game.js` chứa logic và scene 3D. Thư viện Three.js chỉ tải khi người chơi bấm “Vào ca làm việc”, giúp trang chủ không phát sinh tải 3D.
