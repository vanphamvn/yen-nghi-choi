# Yên Lab · Smoke và bằng chứng phát hành (LAB-F09, #133)

Ngày: 19/11/2026 · M1.

## Chạy

```bash
npx playwright test --config playwright.lab-smoke.config.mjs                     # cục bộ, server fixture
LAB_BASE_URL=https://yencafeday.netlify.app LAB_EXPECT_SHA=<sha> npx playwright test --config playwright.lab-smoke.config.mjs
```

Không cần API key. Khi lỗi: giữ screenshot, video và trace (`test-results/lab-smoke/artifacts/`), báo cáo HTML `playwright-report/lab-smoke/`, JSON `test-results/lab-smoke/results.json`.

## Nội dung (`tests/yen-lab-smoke.spec.mjs`)

- Mỗi trang Lab (`PAGES`) ở **320×640, 360×800, 390×844, 768×1024, 1440×900**: HTTP 200, không lỗi console/JS, không asset cùng nguồn ≥ 400, mọi ảnh giải mã được (kể cả ảnh lazy), không tràn ngang, không có gì đè lên nút/link (kiểm tra `elementFromPoint` tại tâm dòng đầu của từng control). Ảnh chụp mỗi khung đính kèm báo cáo.
- Không link nội bộ chết (link ngoài như GitHub nguồn không tải trong test).
- Mỗi trò (`GAMES`): bắt đầu → tạm dừng → tiếp tục → dừng hẳn → làm lại → chạy đến hoàn tất bằng `page.clock`; reduced-motion vẫn hoàn tất và không có gì chuyển động.
- **Chỉ khi chạy với site đã deploy:** `build-info.json` phải báo đúng `LAB_EXPECT_SHA` (và `context=production` với URL production); mọi trang/CSS/JS Lab phải **giống từng byte** với commit đã checkout, ngoại trừ hai thứ Netlify tự chèn (comment “hosted on Netlify” và script toolbar `/.netlify/scripts/hud`). Ghi `test-results/lab-smoke/provenance.json` (URL, commit, deployId, context, phiên bản trình duyệt, thời điểm). Đã kiểm chứng: SHA sai → fail; file cục bộ khác production → fail.

Ghi chú host: Netlify chèn script toolbar công khai vào mọi trang production; nó chạy trong iframe `about:srcdoc` và CSP của Lab chặn code inline của nó (lỗi console từ `about:srcdoc` không tính là lỗi Lab). Tắt hẳn script này là cài đặt tài khoản Netlify của chủ quán, ngoài repo.

## Cổng tự động

- PR: workflow **Yên Lab foundation contract** chạy smoke trên server fixture.
- PR chạm Lab: workflow **Yên Lab deployed smoke** chờ deploy preview Netlify phục vụ đúng commit head của PR rồi chạy smoke trên preview.
- Push lên `main`: cùng workflow chờ production phục vụ đúng commit, chạy smoke trên `https://yencafeday.netlify.app`, ghi bản ghi phát hành (URL, commit, deploy, trình duyệt, pass/fail) vào job summary + artifact `yen-lab-deployed-smoke`.

Repo hiện **chưa có branch protection/required checks**, nên GitHub không tự chặn nút merge. Quy trình điều phối (AGENTS.md) không merge khi các check này chưa xanh, và cổng phát hành M1 (#134) chỉ bật link homepage khi lần chạy production của commit đó pass. Biến các check thành bắt buộc là cài đặt repo của chủ quán.
