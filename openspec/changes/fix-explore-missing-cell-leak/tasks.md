## 1. Generator và validator (`mobile/src/explore/games/missingCellGame.ts`)

- [x] 1.1 `MissingCellLevelConfig` thêm `coveredCount` (0, 0, 3, 3, 3) và `offBoardOptions` (1, 1, 0, 0, 0). Giữ cỡ lưới, số lựa chọn, loại hình theo bậc.
- [x] 1.2 `MissingCellParams` thêm `coveredIndices` (tăng dần, không gồm ô "?"); `cells` để `null` ở ô "?" và ô bị che.
- [x] 1.3 3×3: chọn thêm một hàng và một cột theo seed, che ba góc còn lại của khối 2×2, lựa chọn = bốn ô của khối (design §2).
- [x] 1.4 2×2: không che; nhiễu = một ô cùng hàng hoặc cùng cột trên bảng + một hình chung giá trị kia của ô đó và mang một giá trị không có trên bảng (`offBoardValue`, không để vuông cạnh thoi) (design §3).
- [x] 1.5 Validator độc lập: ô ẩn, mỗi hàng/cột còn ô hiện, bảng đọc một cách (thử đọc ngược), khối 2×2, lựa chọn thuộc khối hoặc là nhiễu ngoài bảng đúng số lượng và không chung giá trị với đáp án, lựa chọn của mọi ô ẩn có mặt, đúng một lựa chọn hoàn thành (design §4).
- [x] 1.6 `missingCellHiddenTokens(params)`: lời giải cho từng ô ẩn, đọc từ phần hiện (renderer dùng để mở ô che).
- [x] 1.7 `missingCellVariantKey` phân biệt ô "?" (`?`) và ô che (`#`).
- [x] 1.8 Tăng version: `missing-cell-v2`, `missing-cell-validator-v2`, `missing-cell-config-v2`, manifest `missing-cell-manifest-v2`, dependency generator/validator/config `2`.

## 2. Renderer và audio

- [x] 2.1 `MissingCellRenderer.tsx`: ô che là `View` sọc chéo (`CoverHatch`, nền trũng), không chạm được, nhãn «Ô đang che».
- [x] 2.2 Bài đúng: điền ô "?", rồi sáng hàng (500 ms), thêm cột (1200 ms), mở ô che (1900 ms); bong bóng hiện câu thần chú; `onAnswer(true)` sau khi câu nói xong và ≥ 2600 ms. Giảm chuyển động: bỏ hiệu ứng bật, giữ các bước.
- [x] 2.3 `promptAudio.ts`: câu `missing_cell_solve` «Nhìn hàng, nhìn cột, ghép đủ hai điều.» + `missingCellSolveKeys()`.
- [x] 2.4 kido-pipeline `exploreAudioInventory.ts`: mirror câu `missing_cell_solve`.
- [x] 2.5 (chờ owner) Gen clip `missing_cell_solve`, owner nghe duyệt, export pack (batch v8). Không gen trong change này — xong 21/10: pack `explore-audio-vi-v8`, owner nghe duyệt 55 clip, nhánh `feat/explore-audio-v8`.
- [x] 2.6 Kiểm trên máy ảo iPhone 17e (390pt): bảng 3×3 bậc 3 (ô che, đáp án, diễn lại đủ bước rồi qua bài 2/6), bảng 2×2 bậc 1 (đủ 3 ô, nhiễu ngoài bảng, điền + câu thần chú).

## 3. Contract và kiểm

- [x] 3.1 `verify-explore-missing-cell-contracts.cjs`: pin version, `coveredCount`/`offBoardOptions`, số lựa chọn, loại hình theo bậc.
- [x] 3.2 Mỗi bài: ô ẩn, khối, lựa chọn thuộc khối, nhiễu ngoài bảng, lựa chọn của mọi ô ẩn, số lựa chọn trùng bảng, lời giải `missingCellHiddenTokens`, bảng đọc một cách, một chiều không đủ (3×3 cả hai trục; 2×2 một trục).
- [x] 3.3 Bộ giải ngây thơ trên 2000 seed mỗi bậc; chặn "không có trên bảng" ≤ 1/2 (L1–L2) / ≤ 1/3 (L3–L5), "chung nhiều nhất" ≤ đoán bừa + 0,1, "chỉ giá trị có trên bảng" ≤ 1/2 (L1–L2), mọi mẹo ≤ 1/2 ở 3×3; in bảng số đo.
- [x] 3.4 Tamper: hiện ô che, bỏ ô che khỏi danh sách, bảng cũ một ô ẩn, dời ô che, nhiễu lấy từ bảng thay ô che (3×3); che thêm ô chéo, thay nhiễu ngoài bảng bằng ô chéo (2×2).
- [x] 3.5 Renderer: ô che, chỉ lựa chọn chạm được, các bước diễn lại, câu thần chú, `onAnswer(true)` một chỗ và sau lời giải.
- [x] 3.6 kido-server `explore.registry.ts`: `BundledLocalGameSpec.version`, `missing_cell` v2; `explore.missing-cell.spec.ts` theo luật mới (khối, nhiễu ngoài bảng, một cách đọc, chống mẹo trên 400 seed, tamper bảng cũ / che chéo, pin version).
- [x] 3.7 `cd mobile && npx tsc --noEmit`, eslint các file đổi, 17/17 `npm run test:explore-*`; `cd kido-server && npx jest src/modules/explore` (21 suite), `npm run build`; `cd kido-pipeline && npx vitest run src/explore`.

## 4. Tài liệu

- [x] 4.1 BRD §7.12 (Ô thiếu): ô che, nhiễu, diễn lại lời giải, câu thần chú.
- [x] 4.2 `docs/AI_CONTEXT.md`: mục Ô thiếu.
- [x] 4.3 `update-explore-leveled-rounds/design.md`: ghi chú con số "~34%" dưới-ước lượng, trỏ về change này.

## 5. Phát hành (chờ owner)

- [ ] 5.1 Push kido-server (= deploy) khi owner cho phép. App không so version của catalog server với bản bundled (game local chỉ lấy cờ hiển thị từ server), nên thứ tự deploy không làm hỏng app; push chỉ để catalog server khớp bản app mới. App cũ vẫn chạy v1 offline.
- [ ] 5.2 Playtest với trẻ: ô sọc có được hiểu là "đang che" không, diễn lại 2,6 giây có dài quá không.
- [ ] 5.3 (việc riêng) Sửa luật soạn seed và 26 seed ma trận lesson (design §8).
- [ ] 5.4 (việc riêng) Tiêu chí "Khi nào bé đã vững?" cho Ô thiếu, owner duyệt câu chữ.
