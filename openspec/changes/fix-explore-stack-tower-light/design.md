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

## 5. Cảnh đổi cỡ giữa bài (review đối kháng 21/10, STACK-TOWER-01, vòng kiểm 3)

Báo sai làm dải gợi ý/phản hồi của màn chơi hiện ở mọi lần sai. Ở cỡ chữ mặc
định dải vẫn dưới `minHeight` 90pt, nhưng khi nhắc nghỉ mắt đang hiện (~30pt)
hoặc cỡ chữ hệ thống lớn (Android 1,3×: ~20pt) dải cao hơn, cảnh (`flex: 1`) mất
chừng đó ở ĐÁY, rồi lấy lại khi chữ «Bé thử lại nhé.» tắt sau 2,5 s.

Bản đầu (d4162b6) neo bàn vào đáy cảnh và chỉ giữ bố cục khi bàn còn vừa. Vòng
kiểm 3 cho thấy chưa đủ: bố cục vốn dùng hết chiều cao (bàn cột cao luôn chỉ còn
8–9pt phía trên, ~2/3 bàn tháp dưới 20pt), nên phần lớn bàn vẫn bị tính lại (khối
co lại, nhảy chỗ, khối đang thử bay tới đích cũ); bàn còn chỗ thì cả bàn nhảy
lên xuống theo dải; bàn giữ lại có thể sát mép trên, cắt cú nhảy của Đô Đô.

Cách làm hiện tại:

- **Treo từ đỉnh.** Sân khấu `position: absolute; top: 0` cỡ đúng bố cục. Cảnh mất
  chiều cao ở đáy thì mép trên không dịch: không gì trên bàn di chuyển.
- **Dải dự phòng dưới sàn.** `layoutStackTowerStage` chọn bố cục lớn nhất vẫn chừa
  `STACK_TOWER_FLOOR_RESERVE` (32pt) dưới các ô chạm hàng dưới và
  `STACK_TOWER_SCENE_PAD` (8pt) trên chỗ đứng cao nhất của Đô Đô. Nó dùng khoảng
  trống phía trên trước (dịch bàn lên), nên bàn còn chỗ (tàu, toa chấm, phần lớn
  bàn trên máy 430pt) giữ nguyên cỡ; chỉ bàn chật mới thu nhỏ, và chỉ khi bố cục
  thu vẫn **đọc được** (`stackTowerLayoutReadable`: hai khối kề cỡ giữ tỉ lệ của
  bậc, trừ 0,05 làm tròn, và chênh ≥ `STACK_TOWER_MIN_STEP` = 6pt; Đô Đô còn pad
  8pt). Bố cục gốc đã ở giới hạn thì không thu, cảnh đó chừa ít dự phòng hơn (vòng
  kiểm 4: bản trước thu tới khi hai khối bằng cỡ, tháp L4 xuống 19×18 / 18×18).
  Dải đất vẽ từ vạch sàn tới đáy cảnh, nên phần dự phòng trông là nền sàn.
- **Bố cục gốc lấy lại chỗ ô chạm đã tốn.** Khoảng giữa hai hàng sàn, và giữa
  hàng sàn trên cùng với vạch xây, chỉ cần đủ khoảng hở nhìn thấy (10 / 18pt);
  phần ô chạm cao hơn khối đã là khoảng hở, nên các ô có thể sát nhau.
- `nextStackTowerSceneSize`: đổi bề rộng → tính lại; thấp đi → giữ khi cảnh còn
  chứa hết các ô chạm hàng dưới (`stackTowerContentBottom`), tức tới hết dự
  phòng; cao lên → chỉ tính lại khi chưa chạm.
- **Khi buộc tính lại** (co quá dự phòng): khối đã xếp và Đô Đô sang toạ độ mới
  (Đô Đô tới đúng bước đang leo, mỗi bước leo đọc điểm đáp khi tới nhịp); khối
  đang thử lên công trình bỏ đích cũ và nảy thẳng về ô mới.

Giá: trên cảnh thường của máy 320pt và 375pt, tháp và dãy cột nhỏ đi khoảng 6–25%
(trung vị 86–94% cỡ khối to nhất); tàu và toa chấm không đổi; máy 430pt hầu như
không đổi. Máy 375/430pt giữ đủ 32pt ở mọi bàn; máy 320pt giữ đủ ở mọi bàn trừ
tháp 5 khối (đã ở giới hạn đọc: còn 4–32pt, trung vị 10pt).

Giới hạn còn lại (có từ trước nhánh này): ở cảnh 276×308 của máy 320pt, 6/19 tháp
5 khối và phần lớn tàu 5 toa có hai khối kề chênh dưới 6pt (4–5pt; tỉ lệ vẫn đạt)
ngay ở bố cục gốc, vì bề rộng/chiều cao không đủ cho 5 vật cùng sàn chạm 48pt.
Bản cũ `bcb3dab` (bậc 5 cũ) cũng vậy: 5/19 tháp, bước nhỏ nhất 4pt. Không đổi khung chơi chung (phiên khác đang sửa `ExplorePlayScreen`).
