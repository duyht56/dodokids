## Context

Xem `proposal.md` cho động cơ. Runtime đã có catalog 48 stable ID/name/path, collection 4/6 cột và reward reveal; 48 PNG hiện tại chỉ là cùng một placeholder Đô Đô. Asset được bundle local nên kích thước, alpha, recognizability và deterministic filename quan trọng hơn scene complexity. Repo từng không có alpha-removal thật cho generated activity assets; change này chủ động thêm bước chroma-key removal và validation riêng cho sticker pack thay vì giả định model tạo alpha sạch.

## Goals / Non-Goals

**Goals:**

- Tạo một visual system duy nhất đủ gần ngôn ngữ mascot Kido nhưng không lặp mascot trong từng tuần.
- Tạo 48 chủ thể khác nhau, nhận biết được ở cell nhỏ, xuất 512x512 alpha PNG và giữ nguyên filename.
- Có staging, manifest, hashes, contact sheets và automated gates để review/rollback.
- Giảm rủi ro batch drift bằng anchor sticker và prompt scaffold dùng chung.

**Non-Goals:**

- Không đổi stable ID, Vietnamese name, world/week mapping, reward logic hoặc API.
- Không thêm animation/Lottie, text bên trong sticker hoặc background scene.
- Không dùng asset sinh động làm nguồn activity/pipeline; đây là mobile bundled reward art riêng.
- Không coi automated review là thay thế hoàn toàn cho final product/on-device approval.

## Decisions

### 1. Visual direction: soft 3D storybook sticker

Mỗi sticker dùng một chủ thể trung tâm với hình khối tròn, tỷ lệ hơi chibi, chất liệu matte-clay pha digital paint, highlight mềm, navy detail vừa phải và rim màu cream dày đồng nhất. Mức polish gần mascot hiện tại nhưng giảm chi tiết phụ để silhouette đọc tốt ở khoảng 64-80 px.

Alternative đã cân nhắc:

- Flat vector: rõ ở kích thước nhỏ nhưng lệch đáng kể với mascot/reward reveal hiện tại.
- Full 3D glossy: bắt mắt nhưng dễ tạo reflection, fringe và chi tiết quá nặng cho 48 bundled assets.
- Watercolor: ấm áp nhưng silhouette/alpha edge không ổn định khi thu nhỏ.

### 2. Four world palettes with subject color priority

- World 1 — Khu vườn: mint/leaf green, sun yellow, coral, sky accents.
- World 2 — Đại dương: sky/teal/blue, coral, pearl cream, amber accents.
- World 3 — Vũ trụ: navy/lavender/diamond, sky blue, sun yellow, coral accents.
- World 4 — Hành trình: coral/amber/green, mountain blue, cream, lavender accents.

World palette là accent/rim cue, không được ép chủ thể sai màu tự nhiên. Các cặp gần nhau phải khác silhouette/pose: mầm có hai lá và đất nhỏ; lá non là một chiếc lá; hoa mặt trời có cánh/ring; mặt trời là đĩa tròn có tia.

### 3. Completion weeks use crest composition

Tuần 12/24/36/48 dùng crest/emblem không chữ với 2-3 motif lớn của world và một silhouette bao ngoài rõ. Đây là ngoại lệ duy nhất cho quy tắc “một object”; vẫn tránh mini-scene và chi tiết vụn.

### 4. Built-in ImageGen plus chroma-key extraction

Mỗi asset là một ImageGen call riêng; không dùng `n` hoặc một contact sheet để cắt thành 48 file. Prompt chung yêu cầu nền key phẳng tuyệt đối, không shadow/reflection/floor. Chọn key theo chủ thể:

- `#ff00ff` cho subject có green/mint/teal đáng kể.
- `#00ff00` cho subject không có green để giảm risk giữ lại magenta accent.

Sau generation, helper cục bộ remove chroma key với auto border, soft matte và despill; retry một lần bằng edge-contract nếu còn fringe. Intermediate source không được copy thẳng vào runtime assets.

### 5. Anchor-first consistency

Bốn anchor đầu là tuần 01 `Mầm xanh`, 13 `Vỏ sò`, 25 `Tên lửa`, 37 `La bàn`. Chúng kiểm chứng shape language, rim, lighting, palette và alpha cho từng world. Prompt scaffold chỉ được khóa sau khi bốn anchor cùng đạt gate; 44 asset còn lại kế thừa anchor làm style reference khi route hỗ trợ, đồng thời lặp lại invariant trong mọi prompt.

### 6. Deterministic final exports

- Source generation: square, centered, generous padding.
- Final: 512x512 RGBA PNG, transparent corners, subject bbox mục tiêu 68-84% chiều dài cạnh.
- File: đúng `mobile/src/assets/images/stickers/world-NN/week-WW.png`.
- Staging: `mobile/.local-assets/reward-stickers/design-48-reward-sticker-assets/`.
- Review: `review/contact-sheet-all.png` và `review/world-01..04.png` trong change directory.
- Manifest: một JSON row/sticker với prompt, key color, source/final path, SHA-256, dimensions, alpha coverage và QA status.

### 7. Atomic promotion

Không overwrite placeholder theo từng job. Khi đủ 48 staged finals và validator pass, copy cả pack vào fixed runtime paths. Nếu promotion/verification fail, restore các path từ `mobile/src/assets/images/dodo.png`, vì placeholder hiện tại chính là cùng asset đó.

## Risks / Trade-offs

- [Batch style drift] → Dùng bốn anchor, shared scaffold, explicit invariants và contact-sheet comparison theo world.
- [Chroma key ăn vào subject hoặc để fringe] → Chọn key theo subject palette, soft matte/despill, validate transparent corners và inspect anchor trước batch.
- [AI thêm mặt/chữ không mong muốn] → Prompt cấm text/watermark; chỉ dùng gương mặt tối giản khi tự nhiên với phong cách trẻ em, không biến mọi object thành mascot.
- [Bundle tăng lớn] → Normalize 512x512, optimize PNG sau alpha extraction và đặt size budget theo file/pack.
- [48 ảnh đúng kỹ thuật nhưng khó phân biệt] → Gate ở 4-column contact sheet và explicit pairwise review cho các subject gần nhau.
- [Creative Production board không khả dụng trong session] → Lưu review artifacts bền vững trong change directory; board chỉ là presentation layer, manifest/contact sheet vẫn là source of truth.

## Migration Plan

1. Tạo manifest/prompt matrix và bốn anchor trong staging.
2. Review anchor, khóa scaffold và generate bốn world theo wave.
3. Remove chroma key, normalize 512x512, validate từng file và build contact sheets.
4. Chỉ khi pack đủ 48 và pass gates mới promote vào fixed paths.
5. Chạy mobile reward contract, lint/type-check liên quan và OpenSpec validation.
6. Sau product/on-device approval, đóng task artwork trong `revise-child-reward-system`; nếu bị reject, giữ stable IDs và regenerate đúng subject bị lỗi.

Rollback: copy lại `mobile/src/assets/images/dodo.png` vào 48 fixed paths hoặc restore các PNG trước promotion; không cần data/API migration.

## Open Questions

- Product/on-device approval cuối vẫn cần người dùng xác nhận từ contact sheet và render phone/tablet; việc này không thay đổi architecture hoặc task breakdown.
