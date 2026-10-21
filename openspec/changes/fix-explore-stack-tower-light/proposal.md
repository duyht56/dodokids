# Đề xuất: Xếp tháp cho Đô Đô — sửa nhẹ sau review 21/10 (`fix-explore-stack-tower-light`)

## Why

Bản review 12 game Khám phá ngày 2026-10-21 (Codex, báo cáo "Soát 12 game Khám
phá", kết quả gốc ở `tmp/explore-review-2026-10-21/codex-A.md`) xếp Xếp tháp vào
nhóm "làm lại hoặc gỡ". Owner chốt cùng ngày: **giữ game và sửa nhẹ**, không
thiết kế lại. Game có trong video quảng cáo, landing và claim C-50, và xếp thứ tự
4–5 vật vẫn đúng tuổi 4–5. Claude đã đọc mã trên mobile `main` @ `bcb3dab` (đã
có Đợt 1) và xác nhận bốn điểm cần sửa:

- **Bậc 1 "Bạn nào to hơn?" quá dễ.** Hai khối chênh ≥ 1,5 lần, chạm khối to là
  xong: đó là so sánh, chưa phải xếp thứ tự, và mỗi lượt đều mở bằng nó.
- **Đặt sai không được ghi nhận.** Khối sai chỉ trượt về sàn; renderer chỉ gọi
  `onAnswer(true)` khi xong tháp. Khung chơi chung vì vậy không biết bé đang gặp
  khó: không có hàng gợi ý, không có lời nhắc, và game không đủ điều kiện để sau
  này bật lượt theo bậc (luật đó cần mọi lần sai đi qua `onAnswer(false)`).
- **Vùng chạm nhỏ.** Code khai `hitSlop` 48pt nhưng view cha của nút chạm có đúng
  kích thước khối, và React Native không cho vùng chạm vượt khung view cha. Đo
  vùng chạm thật trên màn 320/375/430pt (bản cũ): bậc 5 khối nhỏ nhất 18×18pt,
  ở máy 320pt 276/300 khối dưới 44pt; bậc 2 (3 khối) 118/180 khối dưới 44pt.
- **Tạm dừng không dừng đồng hồ của game.** Đợt 1 thêm tạm dừng chung
  (`explore/pausableTimers.ts`, prop `paused`) nhưng Xếp tháp vẫn chạy nhịp leo
  của Đô Đô và báo xong bài sau hộp «Bé muốn nghỉ chưa?» (màn chơi đọc lời khen
  khi bé còn đang ở hộp thoát). Lật thẻ cũng vậy: thẻ sai tự úp, lượt nhìn trộm
  gợi ý tự đóng, bàn xong tự báo, tất cả phía sau hộp thoát.

Khi kiểm trên iOS Simulator còn thấy thêm một lỗi có sẵn: chấm của toa tàu
(`DotGroup`) mặc định màu coral `#FF6B35`, trùng đúng màu toa cam, nên toa cam
trông như không có chấm (khoảng 2/3 bảng toa chấm có toa cam).

## What Changes

- **Bỏ bậc "Bạn nào to hơn?"**, đánh số lại còn bốn bậc: L1 3 khối to→nhỏ, L2 4
  khối to/dài/cao, L3 4 toa chấm ít→nhiều, L4 5 khối to/dài/cao. Cấu hình từng
  bậc giữ nguyên như bậc cũ tương ứng (L2–L5 cũ), nên cùng seed vẫn ra cùng bài.
  Vì số bậc đổi, generator/validator/config/manifest lên **v2** (`stack-tower-v2`).
  Một lượt là bốn bảng, mỗi bậc một bảng (`PROGRESSIVE_RUN_SIZE.stack_tower = 4`),
  vẫn chạy progressive như cũ, **không** bật lượt theo bậc.
- **Giá trị bậc bắt đầu đã lưu** (`kido-parent-preferences` →
  `explore.startingLevelByGame.stack_tower`) từ bản cũ không gây lỗi: lượt luôn
  phủ cả bốn bậc nên mọi giá trị (1–5, 6, 99, 0, âm, số lẻ, chuỗi) đều mở ở bậc
  thấp nhất L1. Màn cài đặt phụ huynh vẫn không hiện Xếp tháp (không có lựa chọn
  nào đổi được lượt chơi).
- **Mỗi lần đặt sai gọi `onAnswer(false)`**, giữ nguyên phản hồi vật lý (thử lên
  công trình, nghiêng 8°, trượt về sàn). Khung chơi chung phát tiếng "thử lại",
  nâng mức gợi ý 1 → 2 (viền khối đúng tiếp theo, rồi làm mờ khối rõ sai), không
  chuyển bài. Renderer bỏ bộ đếm trượt riêng và `onTryAgainSound` (khung chơi đã
  phát tiếng đó cho lần sai được báo).
- **Ô chạm thật ≥ 48pt.** Bố cục thuần (`layoutStackTowerScene`) trả thêm ô chạm
  `hit` cho mỗi khối trên sàn: rộng bằng khối + khe sàn, tối thiểu 48pt mỗi chiều,
  ô trong một hàng nằm sát nhau (khối vẫn cách nhau ≥ một khe), các hàng cách
  nhau, ô hàng dưới cùng phủ xuống dải đất. Renderer lấy ô làm view chạm, vẽ khối
  bên trong; khối đã xếp không nhận chạm. Đo lại: mọi khối trên sàn ≥ 48×48pt ở
  320/375/430pt, không ô nào chồng nhau. Đổi lại, tháp 4–5 khối trên cảnh thấp
  (máy 320pt) nhỏ hơn trước một chút vì hàng sàn cao tối thiểu 48pt.
- **Tạm dừng chung cho Xếp tháp và Lật thẻ**: cả hai chạy nhịp qua
  `useBusSequencer(paused)` (đồng hồ `pausableTimers` của Đợt 1). Xếp tháp: mỗi
  bước leo của Đô Đô là một nhịp, nên khi tạm dừng Đô Đô đứng lại sau bước đang
  nhảy; tàu không chạy khỏi màn; báo xong chỉ sau khi quay lại. Lật thẻ: thẻ sai
  chờ úp, lượt nhìn trộm giữ nguyên, bàn xong chưa báo, cho tới khi quay lại (chạy
  tiếp phần thời gian còn lại).
- **Chấm toa tàu màu mực** (`palette.ink`) để thấy rõ trên mọi màu toa.
- Câu `tower_which_bigger` («Bạn nào to hơn?») rời danh mục câu
  (`promptAudio.ts`, inventory pipeline). File clip đã phát hành giữ nguyên.
- Test: `test:explore-stack-tower` viết lại (bốn bậc, ô chạm trong bố cục, đo
  vùng chạm thật qua harness trên 3 cỡ màn, báo sai, tạm dừng); `test:explore-memory`
  thêm kiểm tạm dừng qua harness; harness thêm `useReducer`, `Animated.ValueXY`,
  `Animated.add/multiply`.

Không đổi: luật lên bậc / lượt theo bậc, câu chữ trên màn hình, clip audio mới.

## Impact

- mobile (nhánh `fix/explore-stack-tower-light`): `games/stackTowerGame.ts`,
  `renderers/StackTowerRenderer.tsx`, `renderers/MemoryMatchRenderer.tsx`,
  `registry.ts` (cỡ lượt), `promptAudio.ts`, hai chú thích (cài đặt phụ huynh,
  contract parent-config), contract và harness.
- kido-server (nhánh local `fix/explore-stack-tower-light`, không push vì push =
  deploy): `explore.registry.ts` thêm `BundledLocalGameSpec.version` (giống từng
  dòng cơ chế của nhánh `fix/explore-missing-cell-leak`), `stack_tower` levels
  [1,2,3,4] v2; `explore.stack-tower.spec.ts` theo bốn bậc. Server chỉ quảng bá
  metadata: app đọc định nghĩa đóng gói cho game offline này, nên app cũ với
  server mới (và ngược lại) vẫn chơi được.
- kido-pipeline (commit local, không push): bỏ `tower_which_bigger` khỏi
  `exploreAudioInventory.ts`.
- Audio v8: không có clip mới. Lần xuất pack sau sẽ không còn key
  `tower_which_bigger` trong registry (file `.wav` cũ vẫn nằm trong assets).
- Claim C-50 ("xếp khối từ to đến nhỏ (Xếp tháp cho Đô Đô)") vẫn đúng: bậc đầu
  mới chính là 3 khối to→nhỏ. Không sửa.
- Specs: thêm requirement vào `explore-stack-tower-game` (thay các phần L1 so
  sánh, "không báo `onAnswer(false)`", "hit slop 48pt" và "L1→L5" của
  `add-explore-round-2-games`) và `explore-memory-match-game`.
