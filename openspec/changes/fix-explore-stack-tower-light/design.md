# Thiết kế: `fix-explore-stack-tower-light`

## 1. Đánh số lại bậc, lên v2

Hai cách: giữ số bậc cũ (2–5) hoặc đánh số lại (1–4). Chọn **đánh số lại**:

- Mọi game khác bắt đầu ở L1; `resolveStartingLevel` mặc định `levels[0] ?? 1`,
  server mặc định `[1..5]`, và khi bật lượt theo bậc thanh trên cùng hiện
  "Bậc N/max" — với 2–5 bé sẽ thấy "Bậc 2/5" ngay khi vào game.
- Cấu hình từng bậc giữ nguyên (L1 mới = L2 cũ …), generator không dùng số bậc
  ngoài `params.level`, nên cùng seed ra cùng khối; chỉ ánh xạ số bậc → luồng seed
  đổi. Theo lệ (missing-cell-v2), generator/validator/config/manifest lên v2 cùng
  lúc; server có `BundledLocalGameSpec.version` để mirror.

Giá trị bậc bắt đầu cũ đã lưu: một lượt progressive của Xếp tháp phủ cả bốn bậc
(`progressiveRunLevels` kẹp cửa sổ vào trong danh sách bậc), nên mọi giá trị đều mở
ở L1 — giá trị 5 không còn tồn tại cũng vậy (resolve → 4 → cửa sổ bắt đầu ở L1).
Không cần migration riêng; contract thử cả rác (0, âm, 2.5, "3", null).

## 2. Báo đặt sai

`place()` gọi `slideBack()` (phản hồi vật lý như cũ) rồi `onAnswer(false)`. Khung
chơi chung lo phần còn lại như với Soi gương: tiếng "thử lại", `hintLevel`
1 → 2 (renderer nhận qua `supportLevel`), hàng gợi ý + lời nhắc gắn với bài, không
đổi `index`. Bộ đếm trượt riêng của renderer (`max(supportLevel, slides/2)`) bị bỏ:
khung chơi đã nâng mức ở mỗi lần sai, giữ cả hai thì gợi ý tới sớm gấp đôi.
`onTryAgainSound` cũng bỏ (đó là kênh cho lỗi KHÔNG đi qua `onAnswer(false)`).

## 3. Ô chạm

React Native: "the touch area never extends past the parent view bounds" — nên
`hitSlop` trên nút nằm trong view cỡ khối không có tác dụng. Thay vào đó mỗi khối
trên sàn có một ô chạm (`layout.blocks[i].hit`):

- rộng `max(w + FLOOR_GAP, 48)`, các ô của một hàng nằm sát nhau, khối canh giữa
  ô → giữa hai khối vẫn ≥ một khe sàn;
- cao `max(h, 48)` tính từ vạch sàn của hàng; ô hàng dưới cùng phủ thêm dải đất
  12pt (cao `max(h + 12, 48)`), nên hàng dưới chỉ tốn `max(h, 36)` phía trên vạch;
- một hàng vừa khi các ô nằm trong lề cảnh và các KHỐI (không phải ô) trải ≤ 85%
  bề rộng — ô rộng của khối nhỏ chỉ thêm khoảng trống, không đẩy hàng xuống dòng.

Renderer: view ngoài là ô (dịch chuyển cùng khối khi bay lên công trình, xoay
nghiêng nằm ở view khối bên trong nên vẫn xoay quanh tâm khối như cũ); khối đã xếp
có `pointerEvents="none"`. Viền scene 2pt được trừ khi đo (con tuyệt đối nằm trong
viền).

Đánh đổi: hàng sàn cao tối thiểu 48pt lấy bớt chiều cao của tháp. Trên cảnh của
máy 375pt và 430pt cỡ khối gần như không đổi; tháp 5 khối trên máy 320pt nhỏ hơn
khoảng 15–20% (khối to nhất 51–55pt so với 59–68pt ở cảnh 276×308).

## 4. Tạm dừng

Dùng `useBusSequencer(paused)` (đã dùng ở Cân thăng bằng, Xe buýt): `later` chạy
trên `pausableTimers`, `play` dừng animation khi unmount, `reduceMotion` theo dõi
thay đổi. Một animation đang chạy được chạy nốt (như Đợt 1), nên Đô Đô leo từng
bước bằng nhịp `later` thay vì một `Animated.sequence` dài: tạm dừng giữ lại sau
bước đang nhảy (≤ 250ms). Lật thẻ: cả bốn timer (úp thẻ sai 700ms, giữ cặp đúng
260ms, đóng lượt nhìn trộm 1100ms, báo xong 420ms) qua `later`; lời báo xong đọc
`onAnswer` mới nhất qua ref, để một callback mới trong lúc dừng không huỷ lời báo.

## 5. Cảnh đổi cỡ giữa bài (review đối kháng 21/10, STACK-TOWER-01)

Báo sai làm dải gợi ý/phản hồi của màn chơi hiện ở mọi lần sai. Ở cỡ chữ mặc
định dải vẫn dưới `minHeight` 90pt, nhưng với cỡ chữ hệ thống lớn (Android 1,3×,
iOS XXXL) hoặc khi nhắc nghỉ mắt đang hiện, dải cao hơn và cảnh (`flex: 1`) thấp
đi ~20pt, rồi cao lại khi chữ «Bé thử lại nhé.» tắt sau 2,5 s. Trước đây mỗi lần
đổi cỡ là một bố cục mới: mọi khối bị `stopAnimation()` (khối đang trượt về bị
cắt), khối nhảy chỗ/đổi cỡ, và các bước leo đã hẹn đưa Đô Đô về toạ độ cũ.

- Bàn vẽ trên một view "sân khấu" `position: absolute; bottom: 0` cỡ đúng bố
  cục. Cảnh thấp đi thì sân khấu đi lên cùng sàn, chỉ phần trống phía trên bị che.
- `nextStackTowerSceneSize(current, measured, layout, touched)` (thuần): đổi bề
  rộng → tính lại; thấp đi → giữ nếu đỉnh bàn (`stackTowerContentTop`: chỗ cao
  nhất Đô Đô đứng) vẫn trong cảnh, không thì tính lại; cao lên → chỉ tính lại khi
  chưa chạm (để lần đo đầu như 520 → 620 trên máy vẫn dùng hết chỗ).
- Nhiều bàn sát mép trên (khoảng trống 8–20pt, vì bố cục dùng hết chiều cao),
  nên vẫn có lúc phải tính lại. Khi đó: khối trên sàn không bị dừng (hoạt ảnh trượt
  về kết thúc ở ô mới), khối đã xếp và Đô Đô nhảy tới toạ độ mới (Đô Đô tới đúng
  bước đang leo), mỗi bước leo đọc điểm đáp từ bố cục đang hiện lúc đến nhịp.

Không đổi khung chơi chung (phiên khác đang sửa `ExplorePlayScreen`).
