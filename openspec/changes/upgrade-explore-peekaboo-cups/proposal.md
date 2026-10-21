# Đề xuất: Ú òa nâng lên trí nhớ vị trí — "Dưới cốc này là gì?" (`upgrade-explore-peekaboo-cups`)

## Why

Ngày 2026-10-21 owner chốt sau review 12 game Khám phá (báo cáo "Soát 12 game
Khám phá", `tmp/explore-review-2026-10-21/`, mục B04, B05, B09, B10, E07): **giữ
Ú òa** và thêm kiểu bài **"Dưới cốc này là gì?" từ bậc 3**, để Khám phá có hai
game trí nhớ khác nhau. Lật thẻ là lật dần, nhớ dần. Ú òa là nhìn một lần, nhớ cả
bố cục.

Ú òa v1 không qua thước đo của owner (game phải đòi suy luận ngay từ bậc đầu,
mỗi bậc gỡ một hỗ trợ, có câu thần chú và diễn lại sau bài đúng):

- **Đáp án luôn là thẻ quen duy nhất.** Mọi thẻ nhiễu là món chưa từng hiện
  (`peekabooRecallGame.ts:179`), nên "chọn món đã thấy" đúng 100% ở cả năm bậc
  (đo lại: 2.000 vòng/bậc, qua vòng 4/6 = 1,00). Bé chỉ cần nhận ra món quen,
  không cần so trước và sau. Các bậc chỉ thêm món.
- **Bậc 1 quá dễ.** Hai món, hai thẻ: nhớ một món rồi đoán qua vòng 84% (97%
  trong hai vòng).
- **Lặp tình huống ghi nhớ** (B10): khoá chống lặp tính cả bộ thẻ nhiễu, nên cùng
  bố trí + cùng món bị lấy vẫn quay lại khi chỉ đổi nhiễu. Bậc 1: 23/4.000 vòng lặp
  trong vòng, 45/3.999 vòng lặp vòng trước.
- **Tràn màn hình iPhone SE** (B04): bậc 4–5 xếp 5 ô và 4 thẻ 76pt thành hai hàng
  mỗi loại, cao hơn vùng chơi; hàng bị gãy cũng phá bố cục trái–phải bé phải nhớ.
- **Bong bóng nói sai pha** (E07): lúc ghi nhớ bong bóng đã hỏi «Món đồ nào vừa
  biến mất rồi nhỉ?», kèm hai dòng «Cùng nhớ nhé…» và «Bé nhìn kỹ các món đồ
  nhé!» lặp ý.
- Không có câu thần chú, không diễn lại vì sao đúng (shell đổi bài sau 650 ms).

## What Changes

- **Thang 5 bậc mới, mỗi bậc gỡ một hỗ trợ** (chi tiết và số đo: `design.md`):

  | Bậc | Kiểu | Món | Thẻ | Gỡ so với bậc trước |
  |---|---|---|---|---|
  | 1 | Biến mất | 3 | 4: món mất + 1 món còn trên bàn + 2 món lạ | (đầu thang) |
  | 2 | Biến mất | 4 | 4: như bậc 1 | thêm một món phải nhớ |
  | 3 | Dưới cốc | 3 cốc | 3: đúng 3 món dưới cốc | không còn món nào hiện lúc trả lời, không còn thẻ lạ |
  | 4 | Dưới cốc | 4 cốc | 4 | thêm một cốc |
  | 5 | Dưới cốc | 4 cốc | 4, hỏi **hai cốc liền** | phải giữ hai chỗ cùng lúc |

- **Bậc 1–2 (nhập môn "biến mất")** giữ cách chơi cũ nhưng đổi bộ thẻ: món mất,
  ĐÚNG MỘT món còn trên bàn và món lạ. "Đã thấy" loại được món lạ, "không còn trên
  bàn" loại được món còn hiện; chỉ cả hai điều cùng lúc mới ra đáp án. Một mình
  từng điều đúng tối đa 1/2 thẻ.
- **Bậc 3–5 "Dưới cốc này là gì?"**: hiện các món, úp cốc lên hết, mũi tên (Đô Đô
  chỉ) trỏ một cốc, bé chọn món dưới cốc đó. Thẻ đáp án đúng bằng các món dưới
  cốc, không có món lạ, nên không còn mẹo loại trừ. Bậc 5: cốc thứ nhất đúng thì
  lật và giữ nguyên, mũi tên sang cốc thứ hai.
- **Câu thần chú** «Bé nhìn kỹ chỗ của từng món nhé!» là câu Đô Đô nói lúc nhìn ở
  bài cốc (bậc 1–2 giữ câu «Bé nhìn kỹ các món đồ nhé!» đã có tiếng).
- **Diễn lại sau bài đúng, rồi mới báo đúng**: bài biến mất — món bật về ô trống
  và Đô Đô nói «Lúc nãy món này nằm ở đây, rồi trốn mất đó!»; bài cốc — lật mọi cốc
  lần lượt trái → phải, ô được hỏi sáng lên, Đô Đô nói «Nhớ chỗ của từng món là tìm
  ra ngay!». Bản tĩnh khi bật giảm chuyển động (cốc mất/hiện ngay, mũi tên đứng
  yên). Đang tạm dừng thì không báo đúng tới khi chơi tiếp.
- **Thời gian nhìn**: 1 giây mỗi món, không dưới 3 giây (3, 4, 3, 4, 4 giây). Vẫn
  là đồng hồ cát không số; trả lời không giới hạn.
- **Bong bóng theo pha** (E07): nhìn → «Ú… òa!» → câu hỏi → câu kết. Bỏ dòng
  «Cùng nhớ nhé…» và dòng nhắc dưới thẻ; chỗ thẻ lúc chờ là khung viền đứt.
- **Khoá chống lặp** (B10) = kiểu bài + bố trí + món bị lấy / cốc được hỏi, không
  gồm thẻ.
- **Bố cục** (B04): một hàng món, một hàng thẻ ở mọi bậc; kích thước tính theo bề
  rộng thật và co theo chiều cao đo được (`renderers/peekabooLayout.ts`), thẻ
  ≥ 56pt. Bậc cao nhất giờ có 4 món (trước 5).
- **Trợ giúp**: mức 1 ở bài cốc nói «Bé nhớ lại xem món nào nằm ở chỗ này nhé.»
  (`supportHintPhraseId` nhận bài hiện tại); mức 2 lật lại cả bộ một lượt như cũ.
- **Version**: `peekaboo-recall-v2`, `-validator-v2`, `-config-v2`, manifest v2;
  kido-server mirror thêm `BundledLocalGameSpec.version` (giống từng dòng cơ chế
  của nhánh `fix/explore-missing-cell-leak`), `peekaboo_recall` = 2.
- **Audio**: 9 câu mới thành một khối cuối `PROMPT_PHRASES` (mobile + mirror
  kido-pipeline), chờ đợt audio chung v8; `peekaboo_intro_3` («bốn món đồ») nay
  đọc khi lên bậc 2. Thiếu clip thì chữ và hình vẫn đủ để chơi.
- **Contract** `test:explore-peekaboo` viết lại: thang bậc, chứng minh độc lập
  từng kiểu bài, tamper, bộ giải ngây thơ trên vòng thật của planner (mẹo không cần
  nhớ ≈ đoán mò, một manh mối không ra đáp án, nhớ một món đúng bằng tỉ lệ lý
  thuyết và giảm dần ở bài cốc, vị trí thẻ/cốc đều), không lặp tình huống, bố cục
  5 thiết bị, hành vi renderer mount thật.

## Impact

- mobile: `src/explore/games/peekabooRecallGame.ts`,
  `src/explore/renderers/PeekabooRecallRenderer.tsx`,
  `src/explore/renderers/peekabooLayout.ts` (mới), `src/explore/promptAudio.ts`,
  `src/screens/child/ExplorePlayScreen.tsx` (2 chỗ truyền bài hiện tại vào
  `supportHint*`), `scripts/verify-explore-peekaboo-contracts.cjs`,
  `scripts/verify-explore-play-shell-contracts.cjs` (§4 dùng bài bậc 1, đọc bong
  bóng qua testID).
- kido-server: `explore.registry.ts`, `explore.peekaboo-recall.spec.ts`.
- kido-pipeline: `src/explore/exploreAudioInventory.ts` (mirror 9 câu).
- docs: `KIDO_EXPLORE_BRD.md` mục Ú òa, `AI_CONTEXT.md`.
- Không đổi: mô tả catalog «Nhớ đồ vật rồi tìm món vừa biến mất», pack audio
  (vẫn v7), luật lượt theo bậc (6/4/1).
- Còn chờ owner: xem `design.md` mục "Quyết định cần owner".
