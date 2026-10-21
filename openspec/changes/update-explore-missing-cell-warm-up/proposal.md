# Đề xuất: Ô thiếu — lưới 2×2 thành bài làm quen không tính (`update-explore-missing-cell-warm-up`)

## Why

Sau review 12 game Khám phá ngày 2026-10-21 (báo cáo
https://claude.ai/artifact/7WpWjAMadYkp7eAP2j6Znj), anh Duy chốt: **giữ lưới 2×2
của Ô thiếu làm bài làm quen, không tính lên bậc.**

Lý do: bản sửa `fix-explore-missing-cell-leak` (missing-cell-v2) đã kín ở 3×3 (ô
"?" là một góc của khối 2×2, ba góc kia bị che, bốn lựa chọn là cả khối; mọi mẹo
không nhìn vị trí chỉ còn 1/4, đọc một chiều 1/2). Lưới 2×2 thì không kín được: che
chéo thì bảng đọc được hai cách, nên v2 không che gì và dùng một ô cùng hàng/cột
trên bảng + một hình mang giá trị lạ làm nhiễu. Bé bỏ thẻ có giá trị lạ, rồi bỏ thẻ
đã có trên bảng là **đúng 100%**, không cần hiểu hàng hay cột (contract đo được:
`notOnBoardValuesOnBoard` = 1,000 ở 2000 seed). Với luật vòng 6 bài / 4 đúng ngay
lần đầu, bé qua bậc 1–2 cũ bằng mẹo đó. Thước đo của owner cho game Khám phá là bậc
đầu đã phải suy luận thật.

## What Changes

- **Thang bậc chấm điểm chỉ còn 3×3**, đánh số lại L1–L3 với nội dung của L3–L5 cũ;
  mỗi bậc gỡ một hỗ trợ (design §2):

  | Bậc | Bảng | Gỡ so với trước |
  |---|---|---|
  | Làm quen (không tính) | 2×2 hình × màu, 3 lựa chọn, không che; bài đầu Đô Đô làm mẫu | — |
  | 1 | 3×3 hình × màu, 3 ô che, 4 lựa chọn | bỏ làm mẫu, bảng lớn hơn, có ô che |
  | 2 | 3×3 chấm × màu | một chiều phải đếm chấm |
  | 3 | 3×3 hình hoặc chấm | bảng đổi loại giữa các bài, bé tự tìm thuộc tính chạy theo hàng |

  Generator / validator / config / manifest lên **v3** (`missing-cell-v3`). Lưới
  2×2 là **bậc làm quen 0** của generator, nằm ngoài `levels` của game.
- **Bài làm quen**: 2 bài 2×2 mở lượt đầu tiên mỗi lần vào game, chỉ khi lượt bắt
  đầu ở L1. Bài 1: câu hỏi đọc xong, Đô Đô nói câu thần chú «Nhìn hàng, nhìn cột,
  ghép đủ hai điều.», hàng của ô "?" sáng rồi tới cột, các lựa chọn chỉ bấm được sau
  đó (hàng + cột vẫn sáng khi bé chọn). Bài 2: bé tự làm. Bài làm quen không thuộc
  vòng 6 bài, không đếm "đúng ngay lần đầu", đầu màn hình hiện «Làm quen 1/2» với hai
  chấm riêng. Hết bài làm quen: «Giỏi quá! Bé lên bậc mới nhé!» rồi «Bây giờ bảng có
  ba hàng ba cột, bé nhìn kỹ nhé!» (chỉ đọc, như câu giới thiệu bậc), bảng 3×3 đầu
  tiên khoá tới khi nói xong.
  Không có bài làm quen khi phụ huynh chọn bậc bắt đầu 2–3, và không có ở «Chơi lượt
  mới» (bé vừa chơi xong).
- **Khung chơi chung**: `ExploreLeveledRounds.warmUp` (bậc generator, số bài, số bài
  làm mẫu, câu kết) + `getExploreWarmUp(game, bậc bắt đầu)`; màn chơi đặt bài làm quen
  ở đầu danh sách bài và đếm riêng; prop renderer tuỳ chọn `demo`. Game khác không
  khai `warmUp` nên luật vòng không đổi (contract kiểm).
- **Bậc bắt đầu phụ huynh đã lưu** (`kido-parent-preferences` →
  `explore.startingLevelByGame.missing_cell`): store lên persist version 1, khi mở app
  lần đầu sau cập nhật giá trị cũ được chuyển sang bậc 3×3 nó từng chỉ: 1–3 → 1,
  4 → 2, ≥ 5 → 3 (bậc chung `startingLevel` cũ cũng được ghim cho riêng Ô thiếu).
  Giá trị rác vẫn bị bỏ như trước. Không crash; giá trị lạ còn sót vẫn bị kẹp.
- **Câu thoại**: không có clip mới. `missing_cell_intro_4/5` (đã duyệt) mở L2/L3,
  `missing_cell_intro_3` kết bài làm quen; `missing_cell_intro_2` («…có thêm bảng
  chấm…») rời danh mục câu (file clip đã phát hành giữ tới lần xuất pack sau).
- **Test** có ý nghĩa (mỗi kiểm mới đỏ khi cố tình làm hỏng mã): contract Ô thiếu
  (thang mới, bậc làm quen, mẹo loại trừ 100% ở 2×2, mọi mẹo ≤ 1/2 ở mọi bậc chấm
  điểm, diễn mẫu qua harness), play-shell §10 (màn chơi thật), leveled-rounds §7,
  parent-config (chuyển bậc qua lần mở lại app).

## Capabilities

### Modified Capabilities

- `explore-missing-cell-game`: ba bậc 3×3, bậc làm quen 2×2, diễn mẫu, chuyển bậc
  đã lưu, version v3. Delta viết trên bản của hai change chưa archive
  `add-explore-missing-cell-game` và `fix-explore-missing-cell-leak`.
- `explore-session-runtime`: thêm requirement "Unscored warm-up before the first
  round" (bên cạnh "Leveled rounds" của `update-explore-leveled-rounds`).

## Impact

- **mobile** (`feat/explore-missing-cell-warmup`): `games/missingCellGame.ts`,
  `renderers/MissingCellRenderer.tsx`, `registry.ts`, `rendererRegistry.tsx`,
  `screens/child/ExplorePlayScreen.tsx`, `promptAudio.ts`, `parentConfig.ts`,
  `store/parentPreferencesStore.ts`, bốn contract.
- **kido-server** (cùng tên nhánh, không push vì push = deploy):
  `explore.registry.ts` `missing_cell` levels [1,2,3] v3;
  `explore.missing-cell.spec.ts`.
- **kido-pipeline** (cùng tên nhánh, không push): bỏ `missing_cell_intro_2` khỏi
  `exploreAudioInventory.ts`.
- **docs**: BRD §7.12 + §10, `AI_CONTEXT.md`.
- **Không đổi**: schema bài học, luật vòng (6/4/1) và câu chữ của game khác. App cũ
  vẫn chạy bản v2 offline của nó (Khám phá không lưu lịch sử bài).
