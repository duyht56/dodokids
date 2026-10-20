# Đề xuất: Lượt theo bậc cho các game Khám phá cùng luật (`update-explore-leveled-rounds`)

## Why

Owner chốt cho Cân thăng bằng ngày 2026-10-17: một lượt không dừng ở 6 bài mà
gồm nhiều vòng 6 bài cùng một bậc, làm tốt thì lên bậc (xem
`add-explore-balance-scale-game` design §5). Ngày 2026-10-18 owner yêu cầu: "Xem
các game còn lại, game nào cùng rule như thế thì làm luôn".

Bốn game đang chạy "progressive" (5 bài, mỗi bài một bậc L1→L5) có đúng điều
kiện của luật: mỗi bài là một lựa chọn đúng/sai, mọi lần sai đều báo về màn chơi
(`onAnswer(false)`), kho bài mỗi bậc đủ cho hai vòng không lặp. Hôm nay mỗi bậc
bé chỉ gặp một bài, rồi lên bậc kể cả khi sai nhiều, và bậc bắt đầu phụ huynh
chọn không có tác dụng (cửa sổ 5 bài luôn là L1→L5).

## What Changes

- **Luật chung** (`registry.ts`, `LEVELED_ROUND_RULE`): vòng 6 bài cùng một
  bậc; đúng ngay lần đầu ≥ 4/6 thì lên bậc; chưa đạt thì luyện thêm tối đa một
  vòng (bài mới); vòng thêm vẫn chưa đạt hoặc qua bậc cao nhất thì hết lượt.
  `ExploreLeveledRounds` có thêm `roundSize`; `getExploreRunSize` trả cỡ vòng.
- **Bật cho 4 game**: `pattern_finder` (Tìm quy luật), `missing_cell` (Ô thiếu),
  `peekaboo_recall` (Ú òa), `number_chain` (Máy nối tiếp). Bỏ chúng khỏi
  `isProgressiveExploreRunGame`, nên một vòng là batch một bậc của
  `LocalExploreProvider`. Phụ huynh chọn được mọi bậc bắt đầu.
- **Thêm `ordinal_position` (Đúng vị trí)** (owner đồng ý 2026-10-20): rào cản
  "câu hỏi chưa có tiếng" đã gỡ ngày 19/10 (mỗi bài đọc đúng câu của nó bằng câu
  liền `ord_tap`/`ord_tap_row`, pack v7). Renderer báo mọi lần chạm sai
  (`onAnswer(false)`), cùng luật 6/4/1.
- **Vòng trộn đều mode** (`planExploreRound`): batch nhiều bài rút tới khi mỗi
  bucket có đủ ⌈count/số bucket⌉ bài chưa ra (trước đây vòng đầu lệch 5/1 khoảng
  1/5 số lần).
- **Màn chơi**: bài đầu vòng mới đọc lại câu đề (game câu đề cố định trước đây
  chỉ nói một lần mỗi lượt).
- **Ú òa**: đồng hồ cát chỉ bắt đầu khi bàn chơi mở, không chạy hết trong lúc
  Đô Đô nói câu lên bậc.
- **Chưa làm, chờ owner** (luật hoặc game phải đổi): `mirror_build`, `stack_tower`,
  `route_planner` (chưa có kênh báo sai), `number_bus` (BRD §7.13 cần playtest
  trước). `ordinal_position` từng nằm ở đây (câu hỏi chưa có tiếng, bé chưa biết
  đọc sẽ kẹt bậc 1) cho tới 2026-10-20. `spin_pattern` (kho bậc 1 chỉ 4 bài) cũng
  từng ở đây; ngày 2026-10-20 nó thành họ `rotation` ở bậc 3 của Tìm quy luật
  (change `merge-explore-spin-into-pattern`) nên chơi theo bậc cùng game đó. **Không hợp**: `memory_match` (lật sai là cách chơi, không có "sai"),
  `tracing_workshop` (màn riêng, bậc là mức trợ giúp).
- Audio: dùng lại `fb_level_next`/`fb_level_again` của pack v6; thêm 16 câu
  giới thiệu từng bậc cho 4 game (bậc 2–5, owner duyệt câu 18/10, một batch vào
  pack v6); 4 câu `ordinal_intro_2..5` cho Đúng vị trí (owner duyệt câu và clip
  20/10, thêm vào pack v7 chưa phát hành, không bump version).

## Capabilities

### Modified Capabilities

- `explore-session-runtime`: lượt của game theo bậc là chuỗi vòng một bậc; bậc
  vòng sau được chọn từ số bài đúng lần đầu của vòng trước, chỉ trong bộ nhớ.
- `explore-missing-cell-game`, `explore-peekaboo-recall-game` (spec trong change
  chưa archive `add-explore-missing-cell-game`, `add-explore-peekaboo-recall-game`):
  câu "một bài mỗi bậc L1→L5" đổi thành lượt theo bậc; Ú òa thêm: thời gian nhìn
  bắt đầu khi bàn chơi mở.

## Impact

- **mobile**: `src/explore/registry.ts`, `src/explore/variety.ts`,
  `src/screens/child/ExplorePlayScreen.tsx`,
  `src/explore/renderers/PeekabooRecallRenderer.tsx`, `src/explore/promptAudio.ts`;
  script mới `verify-explore-leveled-rounds-contracts.cjs`
  (`test:explore-leveled-rounds`); sửa contract pattern / missing-cell /
  peekaboo / number-chain / ordinal-position.
- **kido-pipeline**: mirror câu intro trong `exploreAudioInventory.ts`.
- **kido-server**: spec pattern / missing-cell / peekaboo-recall (import registry
  mobile). Không đổi code server, không đổi `kido-explore-contract.ts` (bảng
  luật nằm ở mobile, không theo config server).
- **docs**: BRD §6.1, §7.7, §7.12, §7.14, §10; `AI_CONTEXT.md`;
  `EXPLORE_ZERO_HISTORY.md`.
- Không đổi generator/validator/version, không lưu gì (zero history): bậc, số
  bài đúng lần đầu, số vòng thêm chỉ nằm trong màn chơi đang mở.
- Lượt dài hơn: từ bậc 1 qua hết 5 bậc là 30 bài (tối đa 60 nếu bậc nào cũng
  luyện thêm), vượt "5–8 lượt tương tác" cũ của BRD §6.1 như Cân thăng bằng.
- Spec delta viết trên bản `fix-explore-catalog-round-1` (chưa archive) của
  requirement "Transient play run".
