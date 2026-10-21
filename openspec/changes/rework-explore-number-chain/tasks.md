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

- [x] 3.1 Khối liền cuối `PROMPT_PHRASES`: `game_number_chain`, `chain2_forward_q`, `chain2_reverse_q`, `chain2_ask_end`, `chain2_ask_start`, `chain2_mantra_forward`, `chain2_mantra_reverse`, `chain2_hint_dots`, `chain2_intro_3`, `chain2_intro_4`; `numberChainKeys(mode, blankIndex)`, `numberChainMantraKeys`. Bậc 2 / bậc 5 dùng lại `chain_intro_2` / `chain_intro_4` (pack v7).
- [x] 3.2 Mirror kido-pipeline `exploreAudioInventory.ts` (pipeline `4d404d4`, local, không push; chưa bump pack).
- [x] 3.3 `npm run explore-lines:dump`: không đổi (câu không có số).
- [ ] 3.4 Đợt audio v8: gen + duyệt + export 10 clip trên (gom với các game khác), bump pack.

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
- [ ] 6.2 `KIDO_MARKETING_CLAIMS.md` C-50 (chỉ có ở bản chưa commit của checkout chính): câu claim vẫn đúng; khi bản v2 lên store, sửa nguồn "số trong khoảng 1–20" thành "0–20 (bậc 1–4: 0–10)".

## 7. Sửa sau review nhánh (Codex, 2026-10-21, `tmp/explore-review-2026-10-21/branch-review-confirmed.md`)

- [x] 7.1 NUMBER-CHAIN-01 (High): thẻ ngược dấu / chạy xuôi có mặt ở mọi ô (vòng 2 dùng bộ đối xứng, vòng 3 thay bằng phía rút độc lập, xem 8.1); bậc 1–4 thành 0–10 với máy 2–4, bậc 5 thành phạm vi 20 (máy bước 5 không còn chỗ cho thẻ ngược dấu); vòng bậc ≥ 2 = 2 xuôi + 4 ngược. Contract đo "bỏ qua dấu, chọn ngẫu nhiên" (= 50% ô), "không gỡ máy" (0%), "giỏi xuôi + đoán dấu chiều ngược" (≤ 30% vòng).
- [x] 7.2 NUMBER-CHAIN-02 (Medium): thẻ nào cũng cùng số hàng xóm ±1; contract đo "nhiều/ít hàng xóm" và "chiều + nhiều hàng xóm".
- [x] 7.3 NUMBER-CHAIN-03 (Low): thẻ đã chọn sai giữ dáng mờ qua lúc chuyển ô và lúc diễn lại (harness kiểm).
- [x] 7.4 NUMBER-CHAIN-04 (Low): bỏ "luôn có thẻ gần mọi mốc" (vòng 3 viết lại tiếp, xem 8.4).

## 8. Sửa vòng 3 (review trên nhánh tích hợp, `tmp/explore-review-2026-10-21/round3-residuals.md`)

- [x] 8.1 NEW-number-chain-0 (High): bỏ `centerPull`; phía thẻ lệch của cặp đáp án và cặp ngược dấu rút đều, độc lập, cùng "hai máy cùng dấu / khác dấu", trước khi chọn chuỗi. "Máy thêm chọn thẻ to nhất, máy bớt chọn bé nhất": 64–65% ô → 50%, qua vòng 17–18% → 3–4% (7–8%). Hạng đáp án theo cỡ 25% ± 1.
- [x] 8.2 NUMBER-CHAIN-01 phần ô 2: thẻ ô 1 không chứa thẻ ngược dấu ô 2 ("thẻ chưa thấy" 69–70% → 50%); cùng dấu rút đều ("xa số đã biết" 65–67% → 50%).
- [x] 8.3 Contract đo mọi mẹo trên vòng planner thật, có ngưỡng: không cần biết gì, chỉ biết chiều, chỉ biết số bước (bỏ qua dấu + mọi cách chọn tiếp), cấu trúc "gần số 5" ở đúng mức đo, chiều ngược; `NC_REPORT=1` in bảng (`research/shortcuts-v2-r3.txt`). Validator + spec server kiểm cấu trúc thẻ mới thay cho "đối xứng".
- [x] 8.4 NUMBER-CHAIN-04: design §4–§5, spec, proposal, BRD §7.12, AI_CONTEXT chỉ ghi số đo thật; bỏ "mức sàn 50/50" và ghi rõ dấu hiệu cấu trúc còn hở.
- [x] 8.5 Chạy lại probe của reviewer (chain-probe, chain-probe2, nc4-planner2, nc02 probe/examples) trên cây này: số khớp contract.
- [x] 8.6 **Owner approved 2026-10-21 — hướng A**: bỏ máy ±1, phạm vi 0–10 có số 0, bậc 5 lên 20, và giữ nguyên chỗ hở đã biết "ô giữa luôn gần số 5" (bỏ qua dấu + chọn số gần 5: 72% ô, qua 26–30% vòng ở bậc 1–4; giỏi xuôi + cách đó ở bài ngược: 63–66% vòng). Không gỡ được nếu giữ 0–10 + máy 2–4 + thẻ ngược dấu ở mọi ô (`research/structure-0-10.cjs`, design §4). Bậc 5 là cửa kiểm suy ngược (9–10% vòng). Ghi là chỗ hở đã biết; contract giữ ngưỡng ở mức đo. Ngoài ra, giới hạn của dạng bài "chiều + khoảng cách thẻ" (~76% ô 1, 87–88% ô 2; xem 8.9) cũng được ghi và khoá ở mức đo.
- [x] 8.7 Sau khi gộp với nhánh tích hợp (có `throughPause` từ 748b04e): câu thần chú của `NumberChainRenderer.replay()` đi qua `throughPause` (hoặc báo bận) để resume không đọc lại câu hỏi ô đã điền (round3-residuals ROUTE-MIRROR-03 mục 2; chưa nghe được tới khi có clip v8). Đã làm trên nhánh tích hợp: 0ca421f.
- [ ] 8.8 Xem lại chỗ hở 8.6 sau playtest với bé; nếu cần, hướng E (thiết kế lại riêng bài ngược) thành change riêng.
- [x] 8.9 Giới hạn của dạng "chọn 1 trong 4" (vòng kiểm cuối 2026-10-21): mọi luật chỉ dựa vào chiều + khoảng cách thẻ tới số đi vào máy chạm trần ~76% ô 1 và 87–88% ô 2 ở bậc 1–4 (bậc 5: 72% / 81%); "biết chiều, bỏ thẻ sát số vào, lấy thẻ gần nhất phía đó" qua 53–57% vòng (79–82%), bậc 5 24,5% (44%); trần cận Bayes qua 69–70% vòng (90–92%), bậc 5 53% (78%). **Dừng tinh chỉnh generator**; contract khoá ở mức đo + 3–4 điểm (mobile `8fdeeb0`, `research/shortcuts-v2-final.txt`). Đề xuất chuyển sang dạng "dựng đáp án" ở Đợt 3 chờ owner (ngoài change này).
- [x] 8.10 Tạm dừng rơi vào nhịp chuyển sang ô 2 (NEXT_CELL_MS) không còn đọc lại câu ô vừa điền: renderer cue câu ô 2 ngay khi tạm dừng, nhịp sau không cue lần hai (mobile `32162a9`; test đỏ trước khi sửa; gộp sạch với 0ca421f, probe màn chơi thật xác nhận).
