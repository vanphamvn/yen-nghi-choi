# Yên · Coffee & Tea

Một góc website tương tác của quán **Yên Coffee & Tea**, với nhân vật Cục Yên và 20 hoạt cảnh SVG. Đây không phải website đặt hàng.

Website: https://yen-nghi-choi.vercel.app/

## Hướng phát triển UI mới (19/11/2026)

Dự án Phaser 2D trong `game/preview-2d/` đã **tạm ngưng theo quyết định chủ quán**. Hướng phát triển tiếp theo là dẫn khách từ website Yên đến trang **Yên Lab Beta**, gồm các mini tool tương tác ngắn, dựa trên những kỹ thuật thư giãn/chánh niệm có nghiên cứu. Phần beta này **chưa được khẳng định đã triển khai**; không mô tả các game tự tạo là được chứng minh lâm sàng.

Bộ quy chuẩn dành cho Codex và Claude Code:
- [DESIGN.md](DESIGN.md): nhận diện thị giác, token, giọng điệu và tương tác.
- [Yên UI Craft Skill](.agents/skills/yen-ui-craft/SKILL.md): quy trình thiết kế → triển khai → kiểm tra.
- [Tham chiếu 12 repo](.agents/skills/yen-ui-craft/references/RESEARCH-NOTES.md) và [checklist QA](.agents/skills/yen-ui-craft/references/QA-CHECKLIST.md).
- Kiểm tra hợp đồng skill/tokens: `npm run test:design` (không thay thế browser QA).

## Chạy cục bộ

Không cần framework, package manager hay database. Chạy bằng bất kỳ static server:

```bash
python -m http.server 8000
```

Sau đó mở http://localhost:8000/ . Tránh mở bằng `file://` vì một số trình duyệt giới hạn tải file liên quan.

## Deploy lên Vercel

1. Import repository GitHub này vào Vercel.
2. Chọn **Framework Preset: Other** và **Root Directory: /**.
3. Giữ `vercel.json` và `robots.txt` như cấu hình hiện tại.

Dự án Vercel hiện tại đã liên kết với GitHub. Push lên nhánh `main` sẽ kích hoạt deploy tự động trên cùng domain, không cần tạo dự án mới.

## Deploy lên Netlify

Repository này đã có `netlify.toml`, nên Netlify có thể phục vụ nguyên bộ website tĩnh và asset SVG mà không cần npm hoặc build framework.

1. Mở [Netlify: Add new project](https://app.netlify.com/start) → **Import an existing project** → **GitHub**.
2. Cho phép Netlify truy cập repository private `vanphamvn/yen-nghi-choi`, chọn nhánh **main**.
3. **Base directory:** để trống. **Build command:** để trống. **Publish directory:** `.` (root).
4. Chọn **Deploy / Publish**. Netlify sẽ tự động triển khai những commit tiếp theo của `main`.
5. Kiểm tra `/`, `/assets/cuc-yen/mascot.svg`, `/assets/cuc-yen/preview.html` và các hoạt cảnh qua `/assets/cuc-yen/stories-preview.html`.

Tương tự Vercel, các header trong `netlify.toml` đang giữ website ở trạng thái `noindex` đến khi chủ quán cho phép lập chỉ mục. Không xóa `netlify.toml` khi chuyển hosting.

## Font tiếng Việt

Bản GitHub-ready sử dụng Google Fonts Noto Sans, Noto Serif và Noto Sans Mono. Đã loại bỏ 9 khai báo `@font-face` trỏ tới các file WOFF2 không tồn tại trong bộ source, tránh request 404 khi deploy mới. Có CSS fallback hệ thống nếu Google Fonts không tải được.

## Bảo mật & SEO

`vercel.json` và `robots.txt` vẫn đang ngăn lập chỉ mục. Nội dung website hiện viết theo trạng thái quán đã mở, nhưng chỉ gỡ `noindex` sau khi chủ quán xác nhận ngày mở thực tế và duyệt SEO/ảnh chia sẻ/thông tin vận hành.

## Mã nguồn

- `index.html`: bố cục, hoạt cảnh và nội dung chính.
- Vòng quay Yên được nhúng trực tiếp vào `index.html` (CSS/JS) để tránh lỗi tải tài nguyên rời, với 8 phần thưởng *mô phỏng*, chưa có giá trị đổi ưu đãi tại quán. Không lưu lượt quay hay dữ liệu người chơi.
- Mục 01 đã được thay bằng **Sở cấp phép nghỉ của Cục Yên**: nộp đơn → chọn 3 mục → ấn mộc → giấy phép tượng trưng → gợi ý đồ uống và chỉ đường đến quán. Không lưu kết quả và không tạo voucher thật. Xem [đặc tả cùng checklist QA](docs/permit-office-v1.md) và các issue #15–#24.
- Bộ **Tarot 78 lá** vẫn tạm dừng và không hiển thị ở production; bản nháp ở nhánh `feature/tarot-v2-foundations`, Draft PR #14, các issue #2–#13. Bộ Bói tâm trạng cũ được lưu trong lịch sử Git để có thể rollback khi cần.
- `yen-logo.svg`: logo chính thức.
- `vercel.json`, `robots.txt`: cấu hình deploy và SEO.
- Font được tải qua Google Fonts; không lưu trữ file font trong repository.

Không chứa API key, database connection hoặc tài khoản người dùng.