# Yên · Coffee & Tea

Một góc website tương tác của quán **Yên Coffee & Tea**, với nhân vật Cục Yên và 20 hoạt cảnh SVG. Đây không phải website đặt hàng.

Website: https://yen-nghi-choi.vercel.app/

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

## Font tiếng Việt

Bản GitHub-ready sử dụng Google Fonts Noto Sans, Noto Serif và Noto Sans Mono. Đã loại bỏ 9 khai báo `@font-face` trỏ tới các file WOFF2 không tồn tại trong bộ source, tránh request 404 khi deploy mới. Có CSS fallback hệ thống nếu Google Fonts không tải được.

## Bảo mật & SEO

`vercel.json` và `robots.txt` vẫn đang ngăn lập chỉ mục. Nội dung website hiện viết theo trạng thái quán đã mở, nhưng chỉ gỡ `noindex` sau khi chủ quán xác nhận ngày mở thực tế và duyệt SEO/ảnh chia sẻ/thông tin vận hành.

## Mã nguồn

- `index.html`: bố cục, hoạt cảnh và nội dung chính.
- Vòng quay Yên được nhúng trực tiếp vào `index.html` (CSS/JS) để tránh lỗi tải tài nguyên rời, với 8 phần thưởng *mô phỏng*, chưa có giá trị đổi ưu đãi tại quán. Không lưu lượt quay hay dữ liệu người chơi.
- Mục 01 cho phép chuyển giữa **Bói tâm trạng** (52 thẻ, mỗi ngày 7 thẻ) và **Tarot 78 lá** (22 Major Arcana + 4 chất × 14 lá Minor Arcana). Chế độ Tarot trải 3 lá **Gốc rễ / Hiện tại / Hướng tiếp theo**, rút không trùng, tùy chọn nghĩa đảo ngược. Trải bài mang tính chiêm nghiệm, không khẳng định tiên tri, không lưu dữ liệu người chơi; mã CSS/JS nhúng trực tiếp vào `index.html`.
- `yen-logo.svg`: logo chính thức.
- `vercel.json`, `robots.txt`: cấu hình deploy và SEO.
- Font được tải qua Google Fonts; không lưu trữ file font trong repository.

Không chứa API key, database connection hoặc tài khoản người dùng.