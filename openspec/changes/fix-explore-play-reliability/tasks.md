## 1. Lớp chơi chung (mobile `b6cee4d`, nhánh `fix/explore-dot1-bugs`)

- [x] 1.1 `explore/audio.ts`: `stillWanted` cho mọi lời phản hồi (hỏi lúc tới lượt), `dedupe` (gộp câu y hệt đang chờ), trả `true/false`; `stopExplorePromptAudio` xoá danh sách đang chờ.
- [x] 1.2 `ExplorePlayScreen`: token bài + cờ đã giải (layout effect theo `currentExercise`); retry/hint `dedupe` + bỏ khi đã giải/đổi bài; lời của renderer bỏ khi bài đã thay.
- [x] 1.3 `explore/pausableTimers.ts` (`schedule/pause/unpause/clear`); mọi timer của màn chơi đi qua nó.
- [x] 1.4 Tạm dừng khi hộp thoát mở hoặc `AppState` `background`/`inactive`: giữ timer, `stopExplorePromptAudio`, `disabled` + `paused` cho renderer, đọc lại câu hỏi khi quay lại; `paused?: boolean` trong `ExploreRendererProps`.
- [x] 1.5 Ú òa: dừng cửa sổ nhìn khi tạm dừng trước câu hỏi, nhìn lại đủ một lượt kèm câu «nhìn kỹ»; lượt nhìn lại ở hỗ trợ mức 2 chạy lại đủ. Thu hẹp sau review đối kháng (C04, `upgrade-explore-peekaboo-cups`, mobile `f9bd17e`): chỉ tạm dừng TRONG lúc nhìn mới cho nhìn lại; đã che / đang lộ ô thì giữ nguyên bàn — spec delta của change này đã sửa theo trên nhánh tích hợp 21/10.
- [x] 1.6 `useBusSequencer(paused)` giữ nhịp (Cân thăng bằng, Xe buýt); không nhận nhịp sau unmount.
- [x] 1.7 Xe buýt: `stage.speak/say` trả Promise; `count_on`/`next_number` báo đúng sau khi lời kết đọc xong; `count_on` đọc số bạn đã lên/đã đếm từ ref.
- [x] 1.8 `balooLineBox(18, 24)` cho câu hỏi Máy nối tiếp / Đúng vị trí; `explore/reduceMotion.ts` — Đô Đô chờ biết thiết lập giảm chuyển động và theo dõi khi đổi.
- [x] 1.9 Test: `scripts/explore-render-harness.cjs`; `test:explore-play-shell`; §12 của `test:explore-number-bus`; cập nhật kiểm nguyên văn ở `test:explore-prompt-audio`, `test:explore-leveled-rounds`.

## 2. Xưởng luyện nét (mobile `067c7ee`)

- [x] 2.1 Renderer giữ và huỷ timer hoàn thành 320 ms khi unmount.
- [x] 2.2 Màn Xưởng chỉ nhận kết quả mang seed của bài đang luyện.
- [x] 2.3 Evaluator: nét ≤ 12 đơn vị chấm theo hình học; nét dài giữ ngưỡng ≥ 4 mẫu, báo `insufficientData`; renderer chỉ «nhìn theo các chấm tím» khi thiếu mẫu.
- [x] 2.4 Chữ trên màn hình: "con" → "bé" (4 chỗ).
- [x] 2.5 Test: `test:explore-tracing`.

## 3. Dẫn đường (mobile `bcb3dab`)

- [x] 3.1 Engine: `routeCheckpointProgress`, `nextRouteCheckpointCell`.
- [x] 3.2 Renderer: ✓ theo số điểm đã qua đúng thứ tự; ô gợi ý là điểm còn thiếu.
- [x] 3.3 Test: `test:explore-route-planner`.

## 4. Kiểm chứng

- [x] 4.1 `npx tsc --noEmit`, `npm run lint` (0 lỗi, chỉ cảnh báo có sẵn), toàn bộ `npm run test:explore-*` (20 script) và mọi `test:*` khác của mobile xanh.
- [x] 4.2 Spec kido-server đọc mã mobile (`src/modules/explore`, 21 suite, 238 test) chạy trên nhánh mobile này: xanh.
- [x] 4.3 Kiểm tay iOS Simulator (iPhone 17e, dev client, Metro từ worktree): lời nhắc cũ bị bỏ khi chạm đúng (lỗi 1); Ú òa dừng sau hộp thoát và khi app ra nền, quay lại nhìn đủ 3,0 s (lỗi 2); Dẫn đường Chặng 5 không ✓ điểm đi sai thứ tự, gợi ý điểm còn thiếu (lỗi 5).
- [x] 4.3b Review đối kháng vòng 2 (`tmp/explore-review-2026-10-21/dot1-review-confirmed.md`): phần của phiên này ở mục 5; C01–C03, C07, C08, C10, C11-shell, C13 (màn chơi, Dẫn đường) do phiên route-mirror-leveled; C04 (Ú òa) do phiên peekaboo-cups.
- [ ] 4.4 Máy thật: chạm hai ngón ở Xe buýt; app ra nền trên Android (`AppState` chỉ báo `background`); cắt dấu ở câu hỏi Baloo trên iPhone SE với cỡ chữ lớn.
- [ ] 4.5 Đợt audio sau: đổi chữ "Mình…" của Đô Đô (feedback chung, Xưởng, Xe buýt) cùng clip theo luật one-batch.
- [ ] 4.6 Phát hành. (`fix/explore-dot1-bugs` đã fast-forward vào mobile `main`; nhánh `fix/explore-dot1-followup` chờ gộp.)

## 5. Sửa sau review vòng 2 (mobile nhánh `fix/explore-dot1-followup` từ `bcb3dab`)

- [x] 5.1 C12 (`91ffa31`): nét ngắn bắt đầu trong nửa đầu, một chạm là thiếu dữ liệu, tiến độ phải được đi thật; cử chỉ bị coi là nhảy không lưu tiến độ (mọi nét).
- [x] 5.2 C09, C14 (`91ffa31`): một lần sai một câu (câu hỗ trợ trùng thì không nói/hiện lại); lời hướng dẫn về một nét dedupe + bỏ khi nét xong / renderer đã đi; chữ "Bé…" trên Xưởng.
- [x] 5.3 C15 (`b2f504d`): `play()` của `useBusSequencer` chạy `onDone` như một nhịp (giữ khi pause, không chạy sau unmount).
- [x] 5.4 C16 (`b2f504d`): `throughPause` — count_on / next_number đọc lại lời kết bị pause cắt rồi mới báo.
- [x] 5.5 C05, C17 (`b2f504d`): board_all đếm mẫu lại từ đầu sau câu hỏi được đọc lại.
- [x] 5.6 C06 + phần Cân của C11 (`b2f504d`): câu gentle một lần và câu kết luận bị pause cắt thì nói lại.
- [x] 5.7 Harness: setState của class gom như React + `componentDidUpdate`.
- [x] 5.8 Kiểm chứng: tsc, `npm run lint` (0 lỗi), mọi `test:*` mobile, spec kido-server `src/modules/explore` (21 suite, 238 test) trên nhánh này; mỗi kiểm mới đỏ trên `bcb3dab`.
- [ ] 5.9 Audio v8: render lại `tracing_continue_glow`, `tracing_next_stroke`, `tracing_follow_dots` với «Bé…» (chữ trên màn đã đổi; `TRACING_GUIDANCE_TEXT` = transcript với «Mình» → «Bé»).
- [ ] 5.10 Chưa kiểm trên máy ảo/máy thật: các tình huống pause ở Xe buýt và Cân, chấm i/j bằng ngón tay thật.

## 6. Sửa sau review nhánh `fix/explore-dot1-followup` (`branch-review-confirmed.md`)

- [x] 6.1 DOT1-FOLLOWUP-01 (`d570613`): nét ngắn đo quãng đi dọc nét (phần nét ngón tay phủ qua, phép chiếu thuần), không đo đường ngón tay; vuốt ngang qua chấm là thiếu dữ liệu, không lưu tiến độ.
- [x] 6.2 DOT1-FOLLOWUP-02 (`d570613`): ngưỡng "một chạm" = min(25% nét, nửa phần còn lại); tô tiếp từ 0,76–0,88 và từ vùng sáng đều xong.
- [x] 6.3 DOT1-FOLLOWUP-03 (`d570613`): `stage.mantra` đọc và thắp lại thần chú bị pause cắt (`useBusSequencer.nextPause`); xe chạy / hold / lượt sau chỉ sau lần đọc đó. Màn chơi (route-mirror `382984c`) coi thần chú là lời riêng của renderer nên không đọc đè câu hỏi.
- [x] 6.4 DOT1-FOLLOWUP-04 (`d570613`): bong bóng chữ cái «Bé tô theo chữ nhé.» (= clip `tracing_do_letter`); test kiểm chữ renderer vẽ ra và `promptVi` của mọi mục.
- [x] 6.5 Kiểm chứng như 5.8; mỗi kiểm mới đỏ trên `b2f504d`.
- [x] 6.6 Khoảng hở còn lại: pause trong ~450 ms giữa lúc thần chú nói xong và lúc xe chạy thì màn chơi vẫn đọc lại câu hỏi (renderer không còn đang nói) rồi «nb_go» cắt nó. → đóng ở 7.2.

## 7. Sửa sau vòng kiểm 3 trên cây gộp (`round3-residuals.md`, mobile `3f067b3`)

- [x] 7.1 NEW-dot1-0: `stage.mantra` cho cảnh đi tiếp (onDone) đúng một lần; pause sau lúc đó không đọc lại thần chú (lời có thể còn chờ sau câu khác) — hết «Còn cách chia nào nữa nhỉ?» hai lần, Xong mở giữa thần chú lượt 2, xe chạy và báo đúng hai lần.
- [x] 7.2 DOT1-FOLLOWUP-03 (phần còn lại): Xe buýt báo `onBoardBusy` (prop của route-mirror `748b04e`, cùng chữ trong `ExploreRendererProps`) từ lúc bé trả lời xong tới khi báo đúng (NumberBusRenderer xoá cờ trước `onAnswer(true)`; free_split lượt 1 hết bận khi hỏi cách chia khác). Pause sau lời thần chú, giữa số cuối và thần chú, hay lúc Ô thiếu chờ «Bài tiếp theo» không còn bị đọc lại câu hỏi. Màn chơi (route-mirror) đã bỏ đọc lại khi renderer bận; nhánh này không sửa `ExplorePlayScreen`.
- [x] 7.3 DOT1-FOLLOWUP-01 (phần còn lại): nét ngắn đo quãng đi tới dọc nét (từ chỗ đặt tay, chỉ phần vượt quá chỗ xa nhất đã tới); cử chỉ chỉ giữ tiến độ khi ≥ nửa chuyển động đi dọc nét — vuốt tay nghiêng/lượn qua chấm không để lại mực.
- [x] 7.4 DOT1-FOLLOWUP-02 (phần còn lại): chừa 0,5 đơn vị cho chỗ đặt tay trước mực (vùng sáng), ngưỡng chạm = min(25% nét, 1/3 phần còn lại), chấm đã tô ≥ ¾ thì chạm tới cuối là xong; tô tiếp từ đầu mực vẽ ra ở 0,6–0,85 đều xong.
- [x] 7.5 Kiểm chứng như 5.8, mỗi kiểm mới đỏ trên `d570613`; chạy lại probe của người kiểm (Xe buýt có mô phỏng `onBoardBusy` của màn chơi; Xưởng probe-eval/render/inkend/tolerance).
- [ ] 7.6 Còn lại / chưa kiểm: đặt tay trong vùng sáng xa trước mực ở 50–70% chấm được nhận ít hơn `main` (76%/67% so với 86%/95% trong probe-tolerance) vì bị coi là nhảy (lớp C12); bỏ pause lúc Ô thiếu đang chờ «Bài tiếp theo» thì im (không đọc lại câu hỏi); chưa thử trên máy ảo/máy thật.
