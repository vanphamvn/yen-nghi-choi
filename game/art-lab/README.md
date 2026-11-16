# Yên Art Lab P0 · Model review tool

> Đây là **phòng thử nghiệm ở `/game/art-lab/`**, không phải bản game thay thế. Không có hero GLB nào được duyệt trong repo.

## Mục đích

Art Lab là nơi mở model 3D mới **trước khi** tích hợp vào `/game/`. Tránh tiếp tục quyết định mỹ thuật dựa trên shader/code test.

## Cách sử dụng

1. Mở `/game/art-lab/` qua một server HTTPS hoặc localhost; cần WebGL.
2. Chọn hoặc kéo thả **một file .glb** từ máy. File không được gửi tới server, chỉ được đọc và render cục bộ trong tab hiện tại.
3. Xoay/phóng to, đổi các góc trước/3⁄4/ngang/sau.
4. Chọn clip hoạt ảnh trong model; mặc định thử `Idle` nếu có.
5. Xem FPS median của **viewer**, mesh count và triangle count; xem các lỗi khi asset quá 40 MB.
6. Bấm **Chụp ảnh PNG** để thu bằng chứng QA cho từng góc. Ảnh của PNG chưa có metadata thiết bị, hãy ghi vào form review trong PR.
7. Đánh dấu checklist bằng tay sau khi đánh giá; checkbox không được lưu và **không thay thế sign-off**.

## Ranh giới kỹ thuật

- Sử dụng Babylon.js 9.36.0 và glTF/GLB loader 9.36.0 (UMD, pin version), chỉ trong Art Lab. Những bundle CDN này phù hợp P0 preview, **không coi là kiến trúc release production cuối**. Về sau dùng self-hosted modular bundle.
- Local file được đọc bằng Blob object URL và Babylon `LoadAssetContainerAsync` với plugin `.glb`. File phải self-contained; không hỗ trợ file `.gltf` tham chiếu tới texture hoặc `.bin` rời.
- Model mới được chuẩn hóa theo bounding box vào sân khấu 3D; không thay đổi dữ liệu GLB gốc.
- Animation groups của GLB được hiển thị theo tên, chưa có hệ thống chuyển animation giữa idle/walk/interact trong gameplay.
- **FPS viewer chỉ là phép đo tham khảo**, không phải FPS của màn chơi toàn quán. Draw calls hiện `–` nếu runtime không cung cấp counter đáng tin cậy.
- Reload trang thì mất asset đang xem, checklist và số đo. Không có tracking, cookies, localStorage.

## QA cho P0

- [ ] Trên desktop Chromium: tải GLB tự chứa dữ liệu, xoay camera, chọn animation, chụp PNG.
- [ ] Trên iOS Safari: mở file từ Files, thao tác touch và chụp screenshot.
- [ ] Trên Android Chrome: chọn file GLB, xoay/chụm, đọc hiệu năng, không bị đóng tab.
- [ ] Import GLB lỗi: hiện thông báo, không làm hỏng viewer.
- [ ] Đổi GLB: dispose scene asset cũ, animation không bị lặp ẩn.
- [ ] Không có `POST` hay upload model khi review.

## Các việc chưa được hoàn thành

- Chưa có asset GLB có nguồn/giấy phép đầy đủ trong manifest.
- Chưa có concept art được duyệt.
- Chưa có ảnh WebGL thật hoặc số đo điện thoại.
- Chưa tích hợp model rigged vào game hiện tại.

Xem [Art Bible](../ART_DIRECTION.md), [Roadmap](../VISUAL_REBUILD_PLAN.md), [Issue #73](https://github.com/vanphamvn/yen-nghi-choi/issues/73).
