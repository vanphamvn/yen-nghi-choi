# Cục Yên · Mascot model v1

Bộ nhân vật vector được dựng lại theo bảng tạo hình Cục Yên đã tạo. Đây là **bộ SVG có thể tái sử dụng**, không phải bản vector tự động truy vết từng pixel của ảnh minh họa gốc.

## Đặc điểm bắt buộc giữ cố định

- Dáng nhân vật: thân ngắn, mềm, đáy tròn, đỉnh caramel lệch có chỗ lõm nhẹ.
- Thân kem `#FFF4E3`; đỉnh caramel `#D9A066`; khăn xanh rêu `#7A8F5A`.
- Má đào `#F6B3A1`, viền xanh đậm `#2F4A2F`.
- Hai mắt nhỏ trên phần kem, miệng đơn giản; khăn xanh có nút ở giữa và biểu tượng lá nhỏ.
- Có thể thay biểu cảm, tay/chân, đạo cụ. Không đổi khuôn thân, cấu trúc phần caramel và khăn.

## Asset

- `mascot.svg`: sprite chính; 14 biến thể dùng cùng một tập hình học và màu.
- `preview.html`: trang xem và kiểm tra toàn bộ biến thể.

Tên biến thể:

`front`, `happy`, `sleepy`, `surprised`, `cheeky`, `shy`, `delighted`, `coffee`, `tea`, `spinning`, `resting`, `waving`, `side`, `back`.

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

Bảng tạo hình được sinh ra là PNG. Bộ hiện tại là bản dựng lại bằng SVG để dùng thật trong sản phẩm; không có tệp rig/mesh 3D, không phải file Figma gốc và chưa chuyển toàn bộ hoạt cảnh legacy trên trang sang mô hình này. Các hoạt cảnh phức tạp cần chuyển dần để không làm hỏng logic trò chơi.
