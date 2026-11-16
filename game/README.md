# Yên: Ai đang làm việc? — BETA liên tục theo ngày

Trò chơi 3D tại `/game/` chạy độc lập với website chính. Mỗi người chơi chọn một trong 5 nghề và phân bổ **12 điểm** cho 4 thuộc tính (1–5 điểm mỗi thuộc tính).

## Luồng chơi

1. **Vào quán khám phá**: người chơi xuất hiện trong thế giới 3D ở **Ngày 01**, chưa vào ca. Có thể đi tự do, trò chuyện với NPC và tương tác vật dụng; không tính thời gian, không bị trừ điểm, không có sự cố công việc.
2. **Bắt đầu ca**: người chơi tự bấm nút. NPC và vật dụng được **reset theo ca** (vị trí, hội thoại, trạng thái ly, cây, máy pha, đèn xe, biển, gối). Người chơi về điểm xuất phát. Hiệu suất/Độ Yên và tiến độ nhiệm vụ đặt lại. Bắt đầu đếm thời gian **tăng dần**, không có giới hạn.
3. **Làm việc**: mỗi nghề có 3 nhiệm vụ, 1 tuyệt chiêu có hồi chiêu, sự cố ngẫu nhiên khi còn đang làm việc. Người chơi vẫn có thể trò chuyện hoặc nghịch đồ giữa các nhiệm vụ.
4. **Đủ 3 nhiệm vụ**: game chuyển sang trạng thái **Sẵn sàng tan ca** nhưng thế giới 3D không dừng. Người chơi có thể tự do đi lại, chỉ khi bấm **Kết thúc ca** mới xem bảng tổng kết.
5. **Sang ngày mới**: bấm nút để tăng số ngày, đóng bảng tổng kết và quay lại chế độ khám phá trong **cùng scene 3D**. Có thể chơi tiếp không giới hạn số ngày hoặc đổi nghề để bắt đầu lại từ Ngày 01.

**Ghi chú:** Tiến trình hiện được lưu trong bộ nhớ của tab trình duyệt. Refresh hoặc đổi nghề sẽ bắt đầu lại từ Ngày 01, không có tài khoản, tracking hay dữ liệu lưu dài hạn.

## Đối tượng có thể tương tác

- **6 NPC:** hai khách, bảo vệ, pha chế, phục vụ và mèo. Các nhân vật có hoạt ảnh chuyển động nhẹ, nhiều câu đối thoại luân phiên, phản ứng sau khi trò chuyện và reset mỗi ca.
- **6 vật dụng/khu vực:** cổng/biển quán, máy pha, ly trên bàn, đèn xe giao hàng, gối trên ghế dài, cây xanh. Tương tác làm thay đổi trạng thái trực quan (bật/tắt, nhấc/đặt, chỉnh lại, tưới cây).
- Đi gần vật/người để thấy tên và nút **Khám phá** hoặc **Nói chuyện**. Mỗi nhiệm vụ trong ca có vòng sáng xanh, ưu tiên thao tác **Làm nhiệm vụ** nếu ở sát vị trí đó.

## Điều khiển

- Desktop: **WASD / mũi tên** để di chuyển, **E** tương tác, **Q** dùng tuyệt chiêu khi đang làm việc.
- Mobile: joystick cảm ứng và hai nút **Tương tác / Tuyệt chiêu**.
- Nút **Bắt đầu ca** và **Kết thúc ca** nằm trong bảng mục tiêu, dùng được cả bàn phím và cảm ứng.

## Chạy và kiểm thử

Dự án tĩnh, không cần npm:

```bash
python -m http.server 8000
node --test tests/game-smoke.test.mjs tests/game-day-loop.test.mjs
node --check game/game.js
```

Mở `http://localhost:8000/game/`. Three.js chỉ tải từ jsDelivr khi người chơi vào quán.

### QA checklist

- [ ] Chọn đủ 5 nghề, chia điểm hợp lệ, vào quán ở trạng thái khám phá.
- [ ] Di chuyển tự do trước ca; bấm E/nút tương tác để nói với 6 NPC và thử 6 vật dụng, quan sát thay đổi hình ảnh.
- [ ] Thử biến đổi máy pha và bàn, nói chuyện nhiều lần; bấm **Bắt đầu ca** và kiểm tra mọi trạng thái được reset.
- [ ] Để tab mở trước ca trên 3 phút: không có timeout, không tính điểm hay phát sinh sự cố.
- [ ] Trong ca, làm 3 nhiệm vụ cho mỗi vai; hoạt động bình thường sau nhiệm vụ cuối và hiện **Kết thúc ca**.
- [ ] Không thể kết thúc ca trước khi xong 3 nhiệm vụ; có thể tiếp tục đi lại sau khi xong.
- [ ] Để ca chạy trên 3 phút: thời gian vẫn tăng, không tự kết thúc.
- [ ] Bấm kết ca, xem điểm, sang ngày 2/3, kiểm tra NPC, đồ vật, HUD và nhiệm vụ reset mà không reload.
- [ ] Thử thoát và đổi nghề từ màn kết quả, xác nhận trở về Ngày 01.
- [ ] Trên Android và iOS: joystick, các nút đầu/kết ca, scroll bảng mục tiêu và màn kết ca trong portrait/landscape.
- [ ] Chặn CDN/WebGL: hiện thông báo lỗi; website Yên vẫn hoạt động.

**Chưa bao gồm:** Multiplayer, tài khoản, thưởng tại quán thật, model rigged, âm thanh, lưu nhiều phiên chơi.

## Mã nguồn

- `game/index.html`: các màn chọn nhân vật, khám phá, ca làm và kết quả.
- `game/style.css`: bố cục desktop/mobile, HUD và nhãn ca.
- `game/game.js`: mô hình 3D, NPC/đồ vật, điều khiển, giao tiếp, reset và vòng lặp ngày.
- `tests/game-day-loop.test.mjs`: bài kiểm thử logic ngày, NPC, vật dụng và chuyển ca bằng Node VM.
