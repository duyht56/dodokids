# Đề xuất: Làm lại Máy nối tiếp theo đúng đề gốc (`rework-explore-number-chain`)

## Why

Review 12 game Khám phá ngày 2026-10-21 (Codex, báo cáo "Soát 12 game Khám phá",
kết quả gốc `tmp/explore-review-2026-10-21/`, mục C05, C06, E14) chấm Máy nối tiếp
1/5 về sư phạm và đề xuất "nâng cấp lớn; cân nhắc gỡ". Owner chốt **giữ và sửa**
(2026-10-21) vì game bám tài liệu luyện vào lớp 1 của chính owner: cuốn "Tách gộp
phạm vi 10", Bài 3 — chuỗi "6 →−4→ □ →+2→ □", bé điền **cả hai ô**, có cả chiều
xuôi lẫn suy ngược tìm số đầu. Claude đã đọc code mobile `main` @ `bcb3dab` và đo
lại qua planner thật:

- **Bậc 1–2 chỉ cần một phép tính.** Hai bậc đầu hiện sẵn số giữa, bé chỉ tìm
  một ô (`numberChainGame.ts:48`). Sang bậc 3 số giữa mới ẩn, cùng lúc phạm vi
  tăng lên 15.
- **Không có vật làm điểm tựa.** Chỉ có số và ký hiệu "+2", "−1"; curriculum §4
  nguyên tắc 1 đòi nhóm chấm/vật trước ký hiệu.
- **Mẹo "chọn số gần nhất" thắng.** Thẻ nhiễu lấy quanh đáp án
  (`buildNearTargetOptions`), nên chọn thẻ gần số giữa nhất qua vòng 4/6 ở bậc
  1/2: **74,4% / 57,0%** (tính cả vòng luyện **93,3% / 82,3%**); bậc 3–5 chọn thẻ
  gần số đang hiện vẫn qua 21–28% vòng (đoán mò ≈ 3–10%).
- **Đúng xong chỉ chuyển bài**, không diễn lại máy làm gì, không có câu chốt.

Thước đo của owner cho game Khám phá: bậc đầu đã phải suy luận thật, mỗi bậc gỡ
một hỗ trợ, có câu thần chú và diễn lại sau bài đúng như Cân thăng bằng (BRD §7.14).

## What Changes

- **Điền hai ô theo thứ tự đề gốc.** Xuôi: ô giữa rồi ô cuối. Ngược: ô giữa (gỡ
  máy thứ hai từ số cuối) rồi ô đầu. Một bài chỉ tính "đúng ngay lần đầu" khi cả
  hai ô đều đúng lần đầu; mọi lần sai ở ô nào cũng báo `onAnswer(false)`. Ô đang
  điền viền xanh, ô đã đúng giữ số (viền xanh lá), hàng thẻ đổi theo ô.
- **Nhóm chấm làm điểm tựa** (`DotGroup` của `VisualMathPrimitives`, thêm cỡ nhỏ
  hàng 5 và chấm "thêm"/"bớt"): dưới số đã biết và trên máy của bước có chấm; máy
  thêm có chấm xanh rơi vào, máy bớt có chấm bị gạch rời đi. Không bao giờ vẽ chấm
  ở ô đang hỏi.
- **Bảng tiến trình mới, mỗi bậc đổi đúng một điều** (bậc 1 đã hai bước):

  | Bậc | Chiều (vòng 6 bài) | Chấm | Máy | Phạm vi |
  |---|---|---|---|---|
  | 1 | 6 xuôi | cả hai máy | bước 2–4 | 0–10 |
  | 2 | **2 xuôi + 4 ngược** | cả hai máy | bước 2–4 | 0–10 |
  | 3 | 2 xuôi + 4 ngược | **chỉ máy tính trước** | bước 2–4 | 0–10 |
  | 4 | 2 xuôi + 4 ngược | **không chấm** | bước 2–4 | 0–10 |
  | 5 | 2 xuôi + 4 ngược | không chấm | bước 2–4 | **0–20** |

  Máy bước 2–4 như đề gốc (−4, +2); máy ±1 không có (owner chưa chốt việc bỏ, bản
  này không đưa lại). Bậc 1–4 trong "phạm vi 10" (có số 0) để thẻ ngược dấu luôn có
  chỗ trong phạm vi; bậc 5 lên 20 chỉ sau khi đã bỏ hết chấm (máy bước 5 trong 0–10
  không có chỗ cho thẻ ngược dấu). Bài ngược là đa số mỗi vòng (2 gỡ máy thêm + 2
  gỡ máy bớt) để bé giỏi chiều xuôi mà đoán dấu chiều ngược không qua vòng nhờ bài
  xuôi.
- **Thẻ nhiễu theo lỗi thật** (4 thẻ mỗi ô): đáp án, thẻ ngược dấu (ở chiều ngược:
  chạy máy xuôi thay vì gỡ) — **có mặt ở mọi ô** — và một thẻ lệch một (lệch hai khi
  lệch một đụng số cấm) cạnh mỗi thẻ. Phía thẻ lệch của từng cặp và "hai máy cùng
  dấu / khác dấu" rút đều, độc lập, trước khi chọn chuỗi; thẻ ô 1 không chứa đáp án
  lẫn thẻ ngược dấu của ô 2. Đo qua planner (design §5): mẹo không cần biết gì
  ≤ 8% bài; chỉ biết chiều (kể cả "máy thêm chọn thẻ to nhất") hay chỉ đếm số bước
  mà bỏ qua dấu ≈ 50% mỗi ô, qua vòng ≤ 4,5%; không gỡ máy ở chiều ngược không bao
  giờ đúng. **Còn một dấu hiệu cấu trúc chưa gỡ**: ô giữa là số đi vào máy 2 nên ở
  0–10 đáp án ô 1 không bao giờ xa số 5 hơn thẻ ngược dấu; bé đếm k bỏ qua dấu rồi
  chọn số gần 5 qua 26–30% vòng ở bậc 1–4 (bậc 5: 9–10%). Gỡ nó cần đổi tham số nội
  dung owner đang chốt (design §4), contract giữ nó không nặng thêm. Lỗi "quên một
  máy" chỉ có khi trùng chỗ (5–12% ô). Không thẻ nào là số đang hiện. Hàm dùng chung
  `buildNearTargetOptions` không đổi.
- **Diễn lại sau bài đúng**: máy chạy xuôi từng chặng — chấm chạy qua máy (thêm:
  rơi vào; bớt: rời đi), máy nhịp sáng — trong lúc Đô Đô nói câu thần chú «Qua máy
  thêm thì nhiều lên, qua máy bớt thì ít đi.» (chiều ngược: «Đi ngược: máy thêm thì
  bớt, máy bớt thì thêm.»). Chỉ báo `onAnswer(true)` khi diễn xong và câu đã đọc
  xong. Giảm chuyển động: cùng các bước, đứng yên từng bước. Tạm dừng giữ nhịp.
- **Trợ giúp**: mức 1 đưa chấm trở lại cho máy đang tính (kèm câu «Bé đếm chấm rồi
  xem máy thêm hay bớt nhé.»), mức 2 làm mờ một thẻ sai chưa chạm (không bao giờ
  mờ thẻ sai cuối cùng).
- **Câu hỏi từng ô do renderer cue**: `number_chain` vào
  `RENDERER_CUED_PROMPT_GAMES`; nút loa nhắc đúng câu của ô đang điền.
- **Version**: `number-chain-v2` / `number-chain-validator-v2` /
  `number-chain-config-v2` / manifest v2; kido-server mirror bằng
  `BundledLocalGameSpec.version` (cơ chế giống hệt nhánh Ô thiếu).
- **Audio v8 (chưa thu)**: `game_number_chain` (tên game, trước đây thiếu) +
  `chain2_forward_q`, `chain2_reverse_q`, `chain2_ask_end`, `chain2_ask_start`,
  `chain2_mantra_forward`, `chain2_mantra_reverse`, `chain2_hint_dots`,
  `chain2_intro_3`, `chain2_intro_4`. Bậc 2 và bậc 5 dùng lại `chain_intro_2`,
  `chain_intro_4` (pack v7); `chain_forward`, `chain_reverse`, `chain_intro_3`,
  `chain_intro_5` giữ trong inventory nhưng không còn nói. Thiếu clip thì chữ + chấm
  vẫn đủ chơi.

## Impact

- Mobile (`feat/explore-number-chain-rework`): `explore/games/numberChainGame.ts`,
  `explore/renderers/NumberChainRenderer.tsx`,
  `explore/components/VisualMathPrimitives.tsx` (`DotGroup` thêm prop tuỳ chọn),
  `explore/promptAudio.ts`, `explore/registry.ts`,
  `screens/child/ExplorePlayScreen.tsx` (một dòng), contract
  `scripts/verify-explore-number-chain-contracts.cjs`,
  `scripts/verify-explore-prompt-audio-contracts.cjs`.
- kido-server (`feat/explore-number-chain-rework`, chưa push):
  `explore.registry.ts`, spec mới `explore.number-chain.spec.ts`.
- kido-pipeline (local, không push): `exploreAudioInventory.ts` mirror câu mới.
- Docs: BRD §7.12 + §10, `AI_CONTEXT.md`.
- Không đổi contract wire, `actionType`, lifecycle; Khám phá vẫn offline,
  stateless, không lưu kết quả.
