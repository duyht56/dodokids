# Đề xuất: Sửa lỗi kỹ thuật khu Khám phá — Đợt 1 sau review 21/10 (`fix-explore-play-reliability`)

## Why

Ngày 2026-10-21 owner nhờ Codex review cả 12 game Khám phá (báo cáo "Soát 12 game
Khám phá", kết quả gốc ở `tmp/explore-review-2026-10-21/`). Báo cáo chia việc ba
đợt. Đợt 1 là các lỗi kỹ thuật không cần quyết định thiết kế; Claude đã đọc code
và xác nhận từng lỗi trên mobile `main` @ `ca25e9c`:

- **Lời nhắc của bài cũ phát đè sang bài mới.** `explore/audio.ts` nối mọi lời
  phản hồi thành một hàng đợi, không gắn với bài. Bé chạm sai liên tiếp rồi chạm
  đúng: màn chơi đổi bài sau 650 ms nhưng các câu «Mình nhìn kỹ lại nhé.» còn
  chờ vẫn phát lần lượt trên bài mới, và câu hỏi của bài mới phải chờ chúng.
- **Bấm X giữa bài, bài vẫn chạy phía sau.** Hộp «Bé muốn nghỉ chưa?» chỉ khoá
  chạm theo phase; đồng hồ của renderer vẫn chạy. Ú òa hết 3 giây nhìn sau hộp
  thoát, quay lại thì đồ đã bị che. App ra nền cũng vậy.
- **Xưởng luyện nét**: timer 320 ms báo hoàn thành không bị huỷ khi rời bài, nên
  bé quay về thư viện trong lúc đó thì màn tự chuyển nét / báo "đã luyện hết
  nhóm". Nét chấm của i/j tô đủ nhưng chỉ gửi 2–3 mẫu chạm thì bị coi là "nhảy"
  và bé nghe «Bắt đầu ở ngôi sao…».
- **Dẫn đường**: ô điểm kiểm tra được đánh ✓ theo tập ô đã đi qua, trong khi
  engine đòi đúng thứ tự; gợi ý luôn chỉ điểm thứ nhất kể cả khi đã xong.
- **Xe buýt**: hai chạm trong cùng một nhịp render cùng đọc «5, 5» rồi kẹt (thẻ
  không hiện); bài chuyển sang bảng mới khi lời kết «N! Có tất cả N bạn nhé.»
  của bảng cũ còn đang đọc.
- Nhỏ: hai câu hỏi Baloo 18/24 thiếu `balooLineBox` (dấu tiếng Việt dòng đầu có
  thể bị cắt trên iOS); Đô Đô nhảy trước khi biết thiết lập giảm chuyển động;
  Xưởng còn gọi trẻ là "con" trên màn hình.

## What Changes

- **Lời phản hồi gắn với bài** (`explore/audio.ts`, `ExplorePlayScreen.tsx`):
  `playExploreFeedbackAudio` nhận `stillWanted` (hỏi lúc tới lượt, không phải
  lúc xếp hàng) và `dedupe` (câu y hệt đang chờ thì gộp), trả `true/false`. Màn
  chơi gắn mỗi lời nhắc/gợi ý với token của bài và cờ "đã giải"; lời của renderer
  gắn với bài. Bỏ khi rời Khám phá cũng xoá danh sách đang chờ. Chuỗi kết luận có
  chủ đích của Cân thăng bằng và Xe buýt không đổi (renderer chờ chúng đọc xong
  rồi mới báo đúng).
- **Tạm dừng chung**: lượt chơi tạm dừng khi hộp thoát mở hoặc app không ở
  foreground (`AppState` `background`/`inactive`). Khi tạm dừng: timer của màn
  chơi được giữ (`explore/pausableTimers.ts`), Đô Đô im và hàng đợi bị xoá,
  renderer bị khoá và nhận prop `paused`; khi quay lại, timer chạy tiếp phần còn
  lại và câu hỏi của bài được đọc lại. Ú òa dừng cửa sổ nhìn và cho nhìn lại đủ
  một lượt khi bé quay lại (cả lượt "nhìn lại" ở hỗ trợ mức 2) — chỉ khi tạm dừng
  trong lúc nhìn; đã che / đang lộ ô thì giữ nguyên bàn (C04, xem
  `upgrade-explore-peekaboo-cups`). Cân thăng bằng
  và Xe buýt giữ các nhịp của `useBusSequencer`.
- **Xưởng luyện nét**: giữ và huỷ timer hoàn thành khi unmount; màn Xưởng chỉ
  nhận kết quả mang đúng mã bài (seed) đang luyện. Nét ngắn (≤ 12 đơn vị, tức
  chấm i/j) chấm theo hình học; nét dài giữ nguyên ngưỡng ≥ 4 mẫu, nhưng thiếu
  mẫu được báo riêng (`insufficientData`) và bé được chỉ «nhìn theo các chấm tím»
  thay vì quay lại ngôi sao. Chữ trên màn hình gọi trẻ là "bé".
- **Dẫn đường**: ✓ theo số điểm kiểm tra đã qua ĐÚNG THỨ TỰ
  (`routeCheckpointProgress`, cùng luật với `executeRoute`); gợi ý chỉ điểm tiếp
  theo còn thiếu (`nextRouteCheckpointCell`).
- **Xe buýt**: `stage.speak/say` trả Promise; `count_on` và `next_number` chỉ
  báo đúng khi lời kết đọc xong (và không sớm hơn nhịp cũ); số bạn đã lên / đã
  đếm lại đọc từ ref cập nhật ngay trong handler; sequencer không nhận nhịp mới
  sau khi cảnh đã unmount.
- Nhỏ: `balooLineBox(18, 24)` cho câu hỏi Máy nối tiếp / Đúng vị trí; Đô Đô chờ
  biết thiết lập giảm chuyển động và theo dõi khi nó đổi (`explore/reduceMotion.ts`).
- Test: thêm `test:explore-play-shell`, `test:explore-tracing`,
  `test:explore-route-planner`; mở rộng `test:explore-number-bus` (§12, chạy cảnh
  thật qua harness `scripts/explore-render-harness.cjs`); cập nhật hai kiểm
  nguyên văn trong `test:explore-prompt-audio` và `test:explore-leveled-rounds`.

Sau review đối kháng vòng 2 (`dot1-review-confirmed.md`), thêm: nét chấm i/j
phải tô thật (không còn xong bằng hai lần chạm, cử chỉ bị coi là nhảy không lưu
tiến độ); một lần sai một câu ở Xưởng; Xe buýt giữ báo cáo khi xe chạy đi lúc
pause, đọc lại lời kết bị cắt, board_all đếm lại sau câu hỏi; Cân nói lại câu
một lần và câu kết bị pause cắt.

Không đổi: generator, validator, version game, luật lên bậc, bố cục, clip audio.
Chữ "Mình…" của Đô Đô và câu nói có clip đi cùng đợt audio sau (luật one-batch).

## Impact

- Code: chỉ `mobile/` (nhánh `fix/explore-dot1-bugs`). Không đổi contract server,
  pipeline hay audio inventory.
- Specs: thêm requirement vào `explore-session-runtime`,
  `explore-tracing-workshop`, `explore-route-planner-game`,
  `explore-number-bus-game`, `explore-peekaboo-recall-game`.
- kido-server: các spec đọc mã mobile (`explore.*.spec.ts`) vẫn xanh (21 suite,
  238 test) — `explore.stateless-privacy.spec` cấm chữ "resume" trong màn chơi,
  nên API bộ hẹn giờ dùng `pause/unpause`.
