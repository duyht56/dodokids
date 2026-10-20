# Đề xuất: Ô thiếu không còn lộ đáp án (`fix-explore-missing-cell-leak`)

## Why

Ngày 2026-10-20 Claude và Codex rà các game Khám phá theo kỹ năng khảo sát vào
lớp 1 (hồ sơ `tmp/game-ideas-2026-10-20/`, báo cáo
https://claude.ai/artifact/8pyJoTdWxAhntRuTkgJ88g). Kết luận chung: chưa thêm
thẻ game mới, việc đầu tiên là sửa Ô thiếu (`missing_cell`) vì game đang lộ đáp
án.

Lỗi (đã xác minh 3 lần, 10.000/10.000 seed L1–L5):

- `missingCellGame.ts` dựng đủ ma trận Raven hàng × cột, xoá đúng 1 ô, rồi lấy
  nhiễu từ các ô **còn trên bảng**. Đáp án luôn là lựa chọn duy nhất bé chưa
  thấy trên bảng. Bé thắng 100% mà không cần đọc hàng hay cột.
- Ở L1–L2, lựa chọn "chung đặc điểm với mọi lựa chọn khác" cũng luôn là đáp án
  (100%); ở L3–L5 là 56%.
- Rà lại tìm thêm mẹo thứ ba: chọn lựa chọn có màu/hình/số chấm **xuất hiện ít
  nhất trên bảng** cũng đúng 100% (hàng và cột của ô trống thiếu một ô nên giá
  trị của chúng hiện ít hơn).
- Validator vẫn nhận các bài này; contract không có assert nào bắt được.

Với luật bậc §10 (vòng 6 bài, ≥ 4/6 đúng ngay lần đầu thì lên bậc, thêm tối đa
1 vòng), bé dùng mẹo qua 100% mọi bậc.

## What Changes

- **3×3 (bậc 3–5)**: ô "?" là một góc của một khối 2×2 trong bảng (hàng và cột
  của nó cộng một hàng, một cột khác). Ba góc còn lại bị **che** (ô có sọc, không
  chạm được). Bốn lựa chọn chính là bốn ô của khối. Mọi mẹo không nhìn vị trí đều
  về đúng mức đoán bừa 1/4; đọc một chiều được 1/2. Hàng và cột còn lại hiện đủ,
  nên bé đọc được thuộc tính nào chạy theo hàng.
- **2×2 (bậc 1–2)**: KHÔNG che ô nào. Che "2 ô chéo" như đề xuất ban đầu thì bảng
  chỉ còn hai ô chéo nhau, không cho biết thuộc tính nào chạy theo hàng, và ô
  chéo bị che lại đúng là đáp án của cách đọc ngược: bé suy luận đúng vẫn có thể
  bị chấm sai (design §3). Thay vào đó: nhiễu là một ô trên bảng cùng hàng hoặc
  cùng cột với ô "?", và một hình mang **một giá trị không có trên bảng**.
  "Không có trên bảng" còn 1/2, "chung đặc điểm nhiều nhất" còn 0.
- **Validator** chứng minh độc lập, chỉ từ phần đang hiện:
  - bảng chỉ đọc được **một cách** (đọc ngược hàng ↔ cột thì không khớp, hoặc
    không có lựa chọn nào khác hoàn thành ô "?");
  - mỗi hàng, mỗi cột còn ít nhất một ô hiện;
  - ô bị che là các góc của khối 2×2 chứa ô "?", và lựa chọn của mỗi ô bị che
    đều có trong các lựa chọn;
  - nhiễu ngoài bảng (2×2) có đúng một giá trị lạ và không chung giá trị nào với
    đáp án;
  - đúng một lựa chọn khớp cả hàng lẫn cột.
- **Diễn lại lời giải** sau mỗi bài đúng (chuẩn BRD §7.14): ô "?" điền ngay,
  rồi hàng của nó sáng, rồi cột, rồi các ô bị che mở ra, trong lúc Đô Đô nói
  câu thần chú «Nhìn hàng, nhìn cột, ghép đủ hai điều.». Xong mới
  `onAnswer(true)`. Clip mới `missing_cell_solve` chưa gen: im lặng tới batch
  audio kế tiếp, bong bóng hiện chữ.
- **Contract** thêm bộ giải ngây thơ (≥ 2000 seed mỗi bậc) và chặn ngưỡng:
  "không có trên bảng" ≤ 1/2 (L1–L2), ≤ 1/3 (L3–L5); "chung đặc điểm nhiều
  nhất" ≤ đoán bừa + 0,1; ở 3×3 không mẹo nào quá 1/2.
- **Tăng version**: `missing-cell-v2`, `missing-cell-validator-v2`,
  `missing-cell-config-v2`, manifest v2; mirror ở kido-server.
- **Giữ nguyên nội dung bậc**: cỡ lưới (2×2, 2×2, 3×3, 3×3, 3×3), số lựa chọn
  (3, 3, 4, 4, 4), loại hình theo bậc. Bốn câu `missing_cell_intro_2..5` của pack
  v7 vẫn đúng; câu đề `missing_cell_choose` giữ nguyên vì "ô trống" vẫn chỉ đúng
  ô "?" (ô bị che có sọc, không trống).

## Capabilities

### Modified Capabilities

- `explore-missing-cell-game`: ô bị che, nhiễu, bảng đọc một cách, chống mẹo,
  diễn lại lời giải, version v2. Delta viết trên bản của change chưa archive
  `add-explore-missing-cell-game`.

## Impact

- **mobile**: `src/explore/games/missingCellGame.ts`,
  `src/explore/renderers/MissingCellRenderer.tsx`, `src/explore/promptAudio.ts`
  (câu `missing_cell_solve` + `missingCellSolveKeys`),
  `scripts/verify-explore-missing-cell-contracts.cjs`.
- **kido-server**: `explore.registry.ts` (`BundledLocalGameSpec.version`,
  `missing_cell` v2), `explore.missing-cell.spec.ts`. Không push: push = deploy,
  chờ owner.
- **kido-pipeline**: `src/explore/exploreAudioInventory.ts` thêm câu
  `missing_cell_solve` (mirror bắt buộc của contract prompt-audio). Không gen
  clip. Không push.
- **docs**: BRD §7.12 (Ô thiếu), `AI_CONTEXT.md`.
- **Không đổi**: schema bài học, lesson, pipeline seed. App cũ vẫn chạy bản v1
  offline như cũ (Khám phá không lưu lịch sử bài, nên không cần migrate).
- **Ngoài phạm vi** (ghi để làm riêng): 11 seed `math_matrix_3x3` và 15 seed
  `math_matrix_2x2_adv` trong `kido-pipeline/seeds/` dính cùng mẹo "đáp án là lựa
  chọn duy nhất không có trên bảng" (design §8).
