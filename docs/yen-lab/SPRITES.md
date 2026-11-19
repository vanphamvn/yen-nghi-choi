# Yên Lab sprite pack · 19/11/2026

**Trạng thái:** Art staging, chưa thay asset trên production, không tự nhận đã QA hay được chủ quán duyệt.

## Những gì PR lưu
- 20 minh họa cho G01–G20 trong `games/`; 7 game chứa nhiều trạng thái trong một strip và cần căn frame trước khi gắn animation runtime.
- 18 sprite vật thể dùng chung trong `shared/`: 5 pose Cục Yên, sách, mẩu giấy, lá, phong bì, hiệu ứng.
- 8 frame lật trang 410×410 và atlas 4×2 trong `frames/`, `atlases/`.
- `manifest.json`, trang [preview.html](../../lab/assets/sprites/preview.html) dùng để duyệt, test Node `tests/yen-lab-sprite-manifest.test.mjs`.

## Chú ý
- Sổ trên bàn chỉ để chọn trò. Bấm vào tên trò phải chuyển tới route riêng; không thêm gameplay vào sổ.
- Đây là artwork mới được tạo, texture màu nước và nền giấy. **Một số sprite dùng chung còn nền giấy và viền crop**, chưa đạt chuẩn sprite trong suốt; cần kiểm tra visual trước khi dùng.
- Không thay artwork Cục Yên đang có mà chưa xác nhận khả năng đồng bộ tạo hình.
- Không lưu người chơi/tâm trạng trong ảnh; text trong game phải là HTML. Reduced-motion dùng hình tĩnh; không autoplay.
- Mọi hiệu ứng hoạt hình chỉ là trang trí, không được coi là bằng chứng hiệu quả của phương pháp tâm lý.

## Kiểm tra
`node --test tests/yen-lab-sprite-manifest.test.mjs` kiểm tra tham chiếu và định dạng WebP.
Trang preview cho phép chủ động phát 8 frame lật sách, không tự chạy khi tải.
Kiểm tra bằng mắt ở kích thước 320/360/390/768/1440 trước khi merge; cần đánh giá asset so với bộ tranh hiện có ở `lab/assets`.
