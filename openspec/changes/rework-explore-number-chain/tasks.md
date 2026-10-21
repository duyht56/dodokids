## 1. Game module (mobile `f1cd796`, nhánh `feat/explore-number-chain-rework`)

- [x] 1.1 `numberChainGame.ts` v2: bảng bậc mới (§2 design), hai ô theo thứ tự đề gốc (`blanks`, `answer.values`), chuỗi chọn đều trong các chuỗi hợp hạng đáp án đã rút.
- [x] 1.2 Thẻ nhiễu theo lỗi thật + số gần ≤ 4, hạng theo cỡ đều, mốc (số đầu vào / giữa phạm vi / số đang hiện), ô 2 tránh thẻ ô 1; không đổi `buildNearTargetOptions`.
- [x] 1.3 Validator v2 độc lập (số học, thứ tự ô, đúng một thẻ khớp máy mỗi ô, không thẻ là số đang hiện, thẻ sai = lỗi thật hoặc số gần, replay byte-identical).
- [x] 1.4 Hàm thuần: `numberChainStepHasDots`, `numberChainDimOptions(..., locked)`, `numberChainAskLine`, `numberChainMantraLine`, `numberChainLevelIntroLine`; registry dùng intro mới.

## 2. Renderer + lớp chơi

- [x] 2.1 `NumberChainRenderer`: ô đang điền / đã đúng / chờ; mọi lần sai `onAnswer(false)`; đúng ô 1 → hỏi ô 2 (cue); đúng ô 2 → diễn lại + thần chú rồi `onAnswer(true)`.
- [x] 2.2 Chấm: `DotGroup` thêm `size` + `changed` (không đổi hành vi cũ); máy có chấm trên đầu, cột máy rộng cố định; bong bóng cao hai dòng.
- [x] 2.3 Giảm chuyển động: từng bước đứng yên; tạm dừng qua `useBusSequencer(paused)`.
- [x] 2.4 `ExplorePlayScreen`: `number_chain` vào `RENDERER_CUED_PROMPT_GAMES`; `supportHintPhraseId` → `chain2_hint_dots`.

## 3. Audio (đợt v8, chưa thu)

- [x] 3.1 Khối liền cuối `PROMPT_PHRASES`: `game_number_chain`, `chain2_forward_q`, `chain2_reverse_q`, `chain2_ask_end`, `chain2_ask_start`, `chain2_mantra_forward`, `chain2_mantra_reverse`, `chain2_hint_dots`, `chain2_intro_3..5`; `numberChainKeys(mode, blankIndex)`, `numberChainMantraKeys`.
- [x] 3.2 Mirror kido-pipeline `exploreAudioInventory.ts` (pipeline `4d404d4`, local, không push; chưa bump pack).
- [x] 3.3 `npm run explore-lines:dump`: không đổi (câu không có số).
- [ ] 3.4 Đợt audio v8: gen + duyệt + export 11 clip trên (gom với các game khác), bump pack.

## 4. kido-server (`2e28ba1`, nhánh `feat/explore-number-chain-rework`, chưa push)

- [x] 4.1 `BundledLocalGameSpec.version` (giống hệt cơ chế 54b73d2), `number_chain` = 2.
- [x] 4.2 `explore.number-chain.spec.ts`: corpus hai ô, bậc 1 hai bước, tamper, catalog mirror v2.

## 5. Kiểm chứng

- [x] 5.1 Contract `test:explore-number-chain`: bảng bậc, mỗi bậc đổi một điều, bậc 1 hai bước, họ lỗi thật (≥ 50% thẻ sai, mỗi họ ≥ 10% ô), đo lối tắt 2000 vòng/bậc qua planner, support, test hành vi renderer bằng harness (sai/đúng ô 1/đúng ô 2/diễn lại/tạm dừng/giảm chuyển động/chấm theo bậc).
- [x] 5.2 Mọi `npm run test:*` của mobile xanh; `npx tsc --noEmit` sạch; `npm run lint` 0 lỗi (9 cảnh báo có sẵn).
- [x] 5.3 kido-server `npx jest src/modules/explore` (22 suite, 243 test) + `npm run build` xanh trên nhánh mobile này.
- [x] 5.4 iOS Simulator "Dodokids SE 375 chain" (375×667): bậc 1 (xuôi, chấm, sai → khoá + trợ giúp, đúng → diễn lại), bậc 2 (ngược, thần chú ngược hai dòng), bậc 4 (không chấm; trợ giúp 1 đưa chấm về). Dấu tiếng Việt không bị cắt; thẻ 66 pt.
- [ ] 5.5 Máy thật + nghe clip v8; thử với bé (bé hiểu "máy bớt → chấm rời đi" không).

## 6. Docs

- [x] 6.1 BRD §7.12 (mục Máy nối tiếp) + §10; `AI_CONTEXT.md`.
- [ ] 6.2 `KIDO_MARKETING_CLAIMS.md` C-50 (chỉ có ở bản chưa commit của checkout chính): câu claim vẫn đúng; khi bản v2 lên store, sửa nguồn "số trong khoảng 1–20" thành "1–10".
