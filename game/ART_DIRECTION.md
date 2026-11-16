# YÊN GAME · Art Bible v0.1 (đề xuất, chưa duyệt)

> **Trạng thái:** DRAFT, áp dụng cho vertical slice, không tuyên bố asset production đã đạt. Mục tiêu là một game mô phỏng quán cà phê **ấm, mộc, tinh nghịch nhẹ**, không phải một game anime ngẫu nhiên đặt logo Yên.

## 1. Creative direction

**Một câu:** *Một góc quán ở Láng Dài được vẽ thành thế giới chibi có nhịp sống riêng, nơi người ta có thể làm việc hoặc chỉ ngồi chơi.*

Ba trụ cột:

1. **Có chất Yên thật:** ưu tiên quầy nước, sân và cây, ghế ngồi đơn giản, luồng take-away, nét chữ yên và cảm giác quán địa phương; không dựng một tiệm Nhật chỉ vì chọn style anime.
2. **Cozy nhưng không nhạt:** hình khối mềm, màu có chiều sâu, ánh sáng chiều dịu, animation có weight và pause; tránh nhấp nháy và chi tiết dày đặc.
3. **Game readability:** người chơi, NPC, vật tương tác và khu vực nhiệm vụ có silhouette rõ ngay trên màn điện thoại.

## 2. Style vocabulary

- **Tạo hình:** anime-chibi stylized, tỷ lệ đầu/thân dự kiến 1:2.6 đến 1:3.2, tay chân mềm, khuôn mặt rõ khi thu nhỏ.
- **Shader/material:** painted/anime-friendly, không chỉ ba dải màu phẳng; ưu tiên normal, AO có kiểm soát, vùng bóng mềm, chất liệu gỗ/gốm/vải đọc được.
- **Camera:** 3/4 isometric mềm, đủ gần để đọc biểu cảm; không để mái/tán cây che nhân vật.
- **Không khí:** ánh sáng nắng chiều tại Việt Nam, cây xào xạc, đồ vật có idle motion vừa phải; tránh hiệu ứng “đèn hội chợ”.
- **Không nên dùng:** ngẫu nhiên hoa anh đào/đèn lồng Nhật, tóc anime quá phức tạp, asset thiếu bản quyền, phối màu neon, tỷ lệ người và đồ vật không thống nhất.

## 3. Color system (working palette)

| Token | Hex | Sử dụng |
|---|---|---|
| Yen deep green | `#315D49` | logo, quầy, outline select |
| Leaf | `#7EAA8A` | cây, vùng phục vụ, accent mềm |
| Warm cream | `#F2E9D6` | tường, nền, highlights |
| Wood | `#B68E6B` | gỗ bàn, chân ghế, texture base |
| Clay accent | `#CF977D` | gốm, khăn, vai phụ |
| Ink | `#374B43` | chi tiết nét và UI |
| Sky | `#C5DADB` | xa cảnh, môi trường sáng |

Đây là token khởi điểm, cần đối chiếu ảnh thật của quán và bản phối cảnh kiến trúc.

## 4. Character brief: 1 hero đầu tiên

**Vai mẫu:** Nhân viên pha chế chibi. Chưa nhân bản thành 5 vai.

- **Silhouette:** đầu/ tóc, tạp dề, giày và hai bàn tay đọc được từ ảnh 360px.
- **Tính cách qua hình:** tỉnh bơ, chậm rãi, hơi tinh nghịch, không mặt cười vẽ lên mọi đồ vật.
- **Gương mặt:** mắt có mí / lông mày, 3 biểu cảm neutral, smile, surprised; không dùng hình cầu trắng đen thay mắt.
- **Bộ đồ:** áo đơn giản màu cream, tạp dề xanh lá, giày tối; phù hợp người làm quán thật.
- **Pose sheets:** front/side/back + 3 biểu cảm + pose đứng, đi, cầm ly.
- **Animation tối thiểu:** `Idle`, `Walk`, `Interact`, có loop và chuyển trạng thái; không trượt chân.
- **Mèo:** giữ thành asset/rig riêng, không gắn rig người lên mèo.

**Chưa có concept art nhân vật được duyệt.** Trước khi model, phải có ít nhất một sheet minh họa đầy đủ. Không coi asset procedural hiện tại là final.

## 5. Vertical slice environment

Chỉ một khu vực đủ để quay một video 20–30 giây: nhân vật đi tới quầy, NPC nhận order, một ly xuất hiện và được cầm/đặt đúng vị trí.

**Props cần có:** quầy pha chế, máy pha, 1 ly, 1 bàn 2 ghế, một chậu cây, một dấu hiệu thương hiệu Yên. Không nhồi cả quán vào trước khi góc này đẹp.

- **Ánh sáng:** key warm từ bên trái/phía trước, ambient mát nhẹ, shadow mềm bám mặt sàn.
- **Chất liệu:** gỗ nhìn là gỗ, gốm có roughness, cây có tán không phải nhiều sphere xanh giống nhau.
- **Camera:** một ảnh establishing 3/4 + một ảnh gần nhân vật trong khu quầy, nhân vật chiếm đủ diện tích màn hình mobile.
- **Silhouette:** quầy rõ khối và chiều cao; đường đi không bị chắn bởi visual props.

## 6. Gating và số liệu (mục tiêu, chưa chứng thực)

- **Visual gate:** concept vs screenshot thật ở cùng góc; 3 reviewer prompts: nhìn ra Yên? nhận ra nhân vật/vật? muốn khám phá?
- **Performance:** mục tiêu median ≥30 FPS trên ít nhất một Android tầm trung được chỉ định, kiểm tra thêm Safari iOS; lưu model thiết bị/OS/browser, dung lượng GLB, draw calls, thời điểm đo, thời gian load.
- **Asset budget thử nghiệm:** nhân vật mẫu <25k triangles; 1 texture atlas 1K khi có thể; asset <5 MB compressed; môi trường vertical slice đặt ngân sách sau baseline. Đây không phải chuẩn bắt buộc bất biến, phải đo thực tế.
- **Motion:** Idle 2–4s, Walk loop rõ chu kỳ, Interact có anticipation–action–settle; không làm character trôi.
- **UX:** Objective giữ collapsed mặc định, toast ngắn và không che nhân vật.

## 7. Những việc không làm trước khi vertical slice đạt

Không tạo 5 phiên bản nhân vật cùng lúc; không thêm nhiều NPC; không thêm vật liệu/postprocess đắt tiền để che model yếu; không đổi engine lần nữa chỉ vì bộ hình chưa đẹp; không merge vào `main` nếu thiếu ảnh QA và quyền sử dụng asset.

## 8. Review record

| Gate | Trạng thái | Bằng chứng |
|---|---|---|
| Direction brief | Draft | File này |
| 2D character sheet | Not started | Issue #74 |
| Approved rigged GLB | Blocked | Issue #75 |
| Approved corner | Blocked | Issue #76 |
| Gameplay integration | Blocked | Issue #77 |
| Real WebGL QA | Blocked | Issue #78 |

### Tài liệu liên quan

[Roadmap & release gate](./VISUAL_REBUILD_PLAN.md) · [Art Lab](./art-lab/) · [Epic #72](https://github.com/vanphamvn/yen-nghi-choi/issues/72)
