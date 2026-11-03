# Cục Yên · Mascot model v1

Bộ nhân vật vector được dựng lại theo bảng tạo hình Cục Yên đã tạo. Đây là **bộ SVG có thể tái sử dụng**, không phải bản vector tự động truy vết từng pixel của ảnh minh họa gốc.

## Đặc điểm bắt buộc giữ cố định

- Dáng nhân vật: thân ngắn, mềm, đáy tròn, đỉnh caramel lệch có chỗ lõm nhẹ.
- Thân kem `#FFF4E3`; đỉnh caramel `#D9A066`; khăn xanh rêu `#7A8F5A`.
- Má đào `#F6B3A1`, viền xanh đậm `#2F4A2F`.
- Hai mắt nhỏ trên phần kem, miệng đơn giản; khăn xanh có nút ở giữa và biểu tượng lá nhỏ.
- Có thể thay biểu cảm, tay/chân, đạo cụ. Không đổi khuôn thân, cấu trúc phần caramel và khăn.

## Asset

- `mascot.svg`: sprite chính; 21 biến thể dùng chung một tập hình học, tỷ lệ và màu sắc.
- `preview.html`: trang xem và kiểm tra toàn bộ biến thể.

Tên biến thể:

**Vai thường:** `front`, `happy`, `sleepy`, `surprised`, `cheeky`, `shy`, `delighted`, `coffee`, `tea`, `spinning`, `resting`, `waving`, `side`, `back`, `wink`.

**Vai nhân viên quầy:** `clerk`, `clerk-ready`, `clerk-spin`, `clerk-win`, `clerk-stamp`, `barista`.

Khác biệt duy nhất của vai nhân viên là **mũ nhỏ** gắn thêm từ `cy-clerk-cap`; phần thân, khăn, mặt và đường viền giữ nguyên. `barista` dùng cùng mẫu người và có thêm pose cầm cà phê.

20 hoạt cảnh của nút “Đừng bấm cái này” được dựng bằng `renderYenScene()`, lấy nhân vật từ chính sprite này và tách đạo cụ/phông cảnh ra bên ngoài.

## Sử dụng trên website

```html
<svg viewBox="0 0 320 320" width="160" height="160"
     role="img" aria-label="Cục Yên đang chào bạn">
  <use href="/assets/cuc-yen/mascot.svg#cuc-yen-happy"></use>
</svg>
```

Đổi biểu cảm trực tiếp trên một instance mà không nhân bản file:

```js
const pose = document.querySelector("#my-cuc-yen use");
pose.setAttribute("href", "/assets/cuc-yen/mascot.svg#cuc-yen-sleepy");
```

**Lưu ý:** SVG tải từ cùng origin. Để dùng ngoài website Yên, tải theo cả `mascot.svg` vào dự án mới. Để export PNG, mở `preview.html` và dùng công cụ xuất ảnh SVG ở trình duyệt/thiết kế.

## Giới hạn của v1

Bảng tạo hình được sinh ra là PNG. Bộ hiện tại là bản dựng lại bằng SVG để dùng thật trong sản phẩm; không có tệp rig/mesh 3D, không phải file Figma gốc. **Các nhân vật hiện ra trên website (Hero, 20 cutscene, nhân viên đóng dấu, nhân viên quay quà, phản ứng kết quả, khu đồ uống và Ghé quán) đều dùng chung sprite.** Phông cảnh và đạo cụ được vẽ riêng. Các CSS legacy không còn được dùng có thể dọn dẹp trong lần bảo trì tiếp theo.
