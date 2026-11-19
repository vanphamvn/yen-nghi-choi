# Cục Yên · Mascot model v2 · 3D sơn dầu

Bộ nhân vật vector được dựng theo bảng tạo hình Cục Yên 3D sơn dầu. Đây là **bộ SVG có thể tái sử dụng và chuyển động trên website**, không phải bản truy vết từng pixel của ảnh minh họa, không phải mô hình lưới 3D. Vân cọ được mô phỏng bằng SVG patterns; khối nổi bằng gradient, nếp màu và shadow nhẹ.

Tất cả 21 pose sử dụng **cùng bộ nhận diện sơn dầu** (khối kem, phần caramel ấm, khăn rêu có nếp vẽ, má đào). Đừng thay bằng các ảnh mascot phẳng đời cũ; nhân vật trong cutscene chỉ đổi tư thế/đạo cụ.


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

**Không dùng `<use href="/assets/cuc-yen/mascot.svg#…">` trên trang web.** iOS WebKit (Safari/Chrome trên iPhone) không áp dụng gradient/pattern/clipPath/filter khai báo bên trong `mascot.svg` khi tham chiếu qua `<use>` ngoài file, nên thân Cục Yên hiện trong suốt (chỉ còn viền). Trang web dùng sprite WebP nền trong suốt trong `sprites/`, do Chromium dựng từ chính `mascot.svg`:

```html
<svg viewBox="0 0 320 320" width="160" height="160" role="img" aria-label="Cục Yên đang chào bạn">
  <image href="/assets/cuc-yen/sprites/happy.webp" width="320" height="320"></image>
</svg>
```

Đổi biểu cảm trực tiếp trên một instance:

```js
document.querySelector("#my-cuc-yen image").setAttribute("href", "/assets/cuc-yen/sprites/sleepy.webp");
```

`mascot.svg` vẫn là nguồn gốc. Sau khi sửa nó, dựng lại toàn bộ sprite (800×800, WebP q0.9):

```bash
node tools/serve-lab-ux.mjs &
node tools/render-cuc-yen-sprites.mjs
```

`preview.html` vẫn dùng `<use>` vector để soát trên trình duyệt desktop; nó không phải trang công khai cho iPhone.

## Giới hạn của v1

Bảng tạo hình tham khảo được sinh ra là PNG với chất liệu sơn dầu nổi. Bộ hiện tại là bản dịch phong cách đó sang SVG để dùng thật trong sản phẩm; không có tệp rig/mesh 3D, không phải file Figma gốc. **Các nhân vật hiện ra trên website (Hero, 20 cutscene, nhân viên đóng dấu, nhân viên quay quà, phản ứng kết quả, khu đồ uống và Ghé quán) đều dùng chung sprite.** Phông cảnh và đạo cụ được vẽ riêng. Các CSS legacy không còn được dùng có thể dọn dẹp trong lần bảo trì tiếp theo.
