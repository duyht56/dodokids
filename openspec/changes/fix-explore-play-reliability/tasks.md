## 1. Lớp chơi chung (mobile `b6cee4d`, nhánh `fix/explore-dot1-bugs`)

- [x] 1.1 `explore/audio.ts`: `stillWanted` cho mọi lời phản hồi (hỏi lúc tới lượt), `dedupe` (gộp câu y hệt đang chờ), trả `true/false`; `stopExplorePromptAudio` xoá danh sách đang chờ.
- [x] 1.2 `ExplorePlayScreen`: token bài + cờ đã giải (layout effect theo `currentExercise`); retry/hint `dedupe` + bỏ khi đã giải/đổi bài; lời của renderer bỏ khi bài đã thay.
- [x] 1.3 `explore/pausableTimers.ts` (`schedule/pause/unpause/clear`); mọi timer của màn chơi đi qua nó.
- [x] 1.4 Tạm dừng khi hộp thoát mở hoặc `AppState` `background`/`inactive`: giữ timer, `stopExplorePromptAudio`, `disabled` + `paused` cho renderer, đọc lại câu hỏi khi quay lại; `paused?: boolean` trong `ExploreRendererProps`.
- [x] 1.5 Ú òa: dừng cửa sổ nhìn khi tạm dừng trước câu hỏi, nhìn lại đủ một lượt kèm câu «nhìn kỹ»; lượt nhìn lại ở hỗ trợ mức 2 chạy lại đủ.
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
- [ ] 4.4 Máy thật: chạm hai ngón ở Xe buýt; app ra nền trên Android (`AppState` chỉ báo `background`); cắt dấu ở câu hỏi Baloo trên iPhone SE với cỡ chữ lớn.
- [ ] 4.5 Đợt audio sau: đổi chữ "Mình…" của Đô Đô (feedback chung, Xưởng, Xe buýt) cùng clip theo luật one-batch.
- [ ] 4.6 Owner duyệt, merge nhánh `fix/explore-dot1-bugs` và phát hành.

## 8. Sau khi gộp Ô thiếu missing-cell-v2 vào main (review MC-LIFE-1, MC-LIFE-2)

(Số mục nối tiếp mục 5–7 trên nhánh tích hợp `integrate/explore-2026-10-21` của repo gốc.)

Mobile `6deb101`, nhánh `fix/explore-missing-cell-pause` tách từ `integrate/explore-2026-10-21` @ `c8acc10` (chưa push).

- [x] 8.1 MC-LIFE-2: `MissingCellRenderer` chạy nhịp lời giải trên `useBusSequencer(paused)`; câu thần chú qua `throughPause`; `onBoardBusy(true)` từ lần chạm đúng tới ngay trước `onAnswer(true)`, nhả khi unmount.
- [x] 8.2 MC-LIFE-1: `stillWanted` của lời nhắc/gợi ý trong màn chơi thêm `rendererBusyBoardRef.current !== board` (Ô thiếu, Ú òa; Dẫn đường tự nói lời sai nên không đổi).
- [x] 8.3 Test: `test:explore-play-shell` §9 (màn chơi + renderer thật, loa có thời lượng thật, clip thần chú đứng tạm tới audio v8), `test:explore-missing-cell` (lời giải qua tạm dừng, cờ bận, unmount); đỏ trên mã trước sửa. Probe `mc-stale-hint.cjs`: trước `0ms fb_hint_listen | 2260ms fb_hint_listen | 4770ms fb_praise_1`, sau (shell giả thêm luật bận) `0ms fb_hint_listen | 3850ms fb_praise_1`.
- [x] 8.4 Mobile: mọi `test:*`, `tsc`, `lint` xanh; kido-server `integrate/explore-2026-10-21` explore 246/246 với mobile nhánh này.
