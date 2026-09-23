# Quyết định implement GĐ1 `number_bus` (2026-09-23)

Nguồn chuẩn theo thứ tự: `../specs/explore-number-bus-game/spec.md` → `../design.md`
(rev. 3) → file này → bản thiết kế Claude Design trong thư mục này
(`storyboard-data.js` = toàn bộ storyboard/motion/a11y/câu hỏi mở dạng dữ liệu;
`Bus.dc.html`, `Screen.dc.html`, `Passenger.dc.html` = component + kích thước;
`overview.txt` = chữ trên bản thiết kế). Bản thiết kế là tham chiếu hình ảnh và
thời lượng; khi nó mâu thuẫn spec thì spec thắng, trừ các điểm ghi dưới đây.

## Trả lời 10 câu hỏi mở của Claude Design

1. **Hướng 1a "Sơ đồ phẳng"**: CHỐT.
2. **count_on L4 trên màn thấp (iPhone SE)**: CHỐT đề xuất — khi chiều cao bảng
   chơi không đủ cho xe 4 hàng + bến + thẻ, renderer dùng nhịp L3 (thẻ hiện sau
   khi chạm hết bạn ở bến) và ẩn dòng đề (câu vẫn được đọc). Quyết định theo đo
   layout thật (`onLayout`), không theo tên máy.
3. **count_on: cửa phủ tầng dưới (phần a), bạn mới lên tầng trên (phần b)**: CHỐT.
4. **L1 biển nóc trống, chấm hiện khi đọc tổng**: CHỐT.
5. **next_number dùng numeral rõ ở L2**: CHỐT (ngoại lệ numeral mờ của L2).
6. **Tín hiệu lượt 2 của free_split**: CHỐT ảnh cách chia ở góc + các bạn nhún
   mời. SỬA một điểm: nút Xong KHÔNG bị khoá chờ cách mới (tránh kẹt trẻ 4 tuổi).
   Xong luôn bật khi hai tầng đều có bạn; bấm Xong với bố cục TRÙNG một ảnh đã
   có → ảnh đó nhún, Đô Đô đọc lại thần chú, bài KẾT THÚC bình thường, không tính
   miss (đúng spec). Tối đa 2 lượt chia mỗi bài.
7. **Bóng mờ lắc lư = bạn thêm sau cùng**: CHỐT.
8. **make_ten xe một tầng**: GĐ2, không làm bây giờ.
9. **"Bé rủ ba mẹ chơi tách gộp nha!" ở màn kết lượt**: HOÃN (cần sửa màn kết
   lượt dùng chung). Clip `nb_home` vẫn nằm trong inventory audio.
10. **Màu tầng Okabe–Ito cam/xanh**: CHỐT. Tầng dưới nền `#FBE8C2` / viền nhấn
    `#B87A00` (bến `#E69F00`); tầng trên nền `#D8EEFB` / viền nhấn `#2B86BF`
    (bến `#56B4E9`).

## Quyết định về khung màn chơi dùng chung

- KHÔNG sửa `ExplorePlayScreen` cho game này (trừ dòng đọc level per-game của
  GĐ0). Thanh phản hồi dưới cùng trong bản thiết kế là mock của shell.
- Renderer tự vẽ **dải lời Đô Đô trong bảng chơi** (tiền lệ:
  `RoutePlannerRenderer` guidance): hiện câu Đô Đô đang nói của renderer và
  **thần chú tô màu từng phần** (tổng = `#E85328`, tầng dưới = `#B87A00`, tầng
  trên = `#2B86BF`) đồng bộ với highlight tầng. Shell vẫn hiện dòng "Bé thử lại
  nhé." / "Đúng rồi!" như mọi game khi `onAnswer` được gọi.
- Renderer gọi `onAnswer(true)` **sau khi xong nghi thức của chính nó** (thần
  chú, xe chạy / màn đứng yên chờ bé bấm mũi tên ở `missing_part`), vì shell
  phát lời khen và chuyển bài 650 ms sau `onAnswer(true)`.
- Miss (đi qua `onAnswer(false)` để shell leo `supportLevel`): `missing_part`
  kiểm tra lệch; `next_number`/`count_on` chọn thẻ sai. KHÔNG phải miss:
  `board_all` (không thể sai), `free_split` bấm Xong khi một tầng trống.
  Khi miss: gọi `onAnswer(false)` TRƯỚC rồi mới `onSpeakFeedback([...])` để câu
  riêng của renderer đè lên câu thử-lại chung của shell.

## Hợp đồng dữ liệu (generator ↔ renderer)

- `exerciseType = 'number_bus'`, `gameCode = 'number_bus'`, levels GĐ1 = `[1,2,3,4]`.
- `params.level` và `params.mode` BẮT BUỘC; mode GĐ1: `board_all`, `free_split`,
  `next_number`, `missing_part`, `count_on` (type union có thể khai thêm
  `five_and`/`make_ten` nhưng generator/validator GĐ1 không sinh, config không khai).
- Sức chứa tầng theo level (không theo đáp án): L1 4 ghế rời/tầng (1 hàng × 4),
  L2 1×5, L3–L4 2×5 (lấp hàng đầu trước).
- Biển nóc theo level: L1 `blank` (chấm hiện khi đọc tổng), L2 `dim` (numeral
  30% chồng chấm; riêng next_number dùng `num`), L3 `num`, L4 `both` (pill số |
  chấm). count_on: biển `blank` tới khi bé chọn đúng.
- Loài: một loài mỗi bài, từ 6 con vật có sẵn trong pool thẻ Lật thẻ
  (`memory-cat`, `memory-dog`, `memory-rabbit`, `memory-bear`, `memory-panda`,
  `memory-pig`); emoji là NỘI DUNG câu đố. Nhãn a11y "bạn mèo", "bạn chó"…
- Phạm vi số & bảng vai trò slot: `../design.md` mục 3 và mục 6 (bảng slot ×
  level là nguồn DUY NHẤT quyết định mode; `generatorHint` chở trong
  `runSlot.constraints`).
- count_on options (3 thẻ, ≤ 10): `a+b` (đúng), `a+b−1` (bẫy bắt buộc ở L3–L4),
  thẻ thứ ba ưu tiên `a+b+1` nếu ≤ 10, nếu không thì số lớn nhất < `a+b−1` và
  ≠ `a`. Distractor không trùng `a` trừ ngoại lệ b=1.
- next_number options: `{n+1, n+2, n−1}`, riêng n=1 → `{2,3,4}`; mọi số ≤ 10.

## Điều chỉnh khi implement + kiểm trên simulator (2026-09-23)

- **Hai ngoại lệ có chủ đích với "không sửa `ExplorePlayScreen`"** (đều nhỏ,
  có lý do, ảnh hưởng đã khoanh vùng):
  1. Bỏ luật "không đọc lại đề trùng audioRefs" CHỈ cho run authored
     (`game.runPolicy`), vì bảng slot có hai bài cùng mode liền nhau và
     `missing_part` bắt buộc công bố tổng mỗi bài. 10 game khác không đổi.
  2. Dòng "Bé thử lại nhé." / "Mình nhìn kỹ lại nhé." tự tắt sau 2,5 s (mọi
     game). Lý do: renderer này tiếp tục chơi sau lần sai (làm mẫu lại, mở rèm,
     thần chú) nên câu thử-lại cũ nằm cạnh màn ăn mừng. Dòng gợi ý bóng đèn vẫn
     giữ theo mức trợ giúp.
- **count_on bong bóng đếm**: tắt khi thẻ hiện (L3 và lúc thẻ hiện lại sau làm
  mẫu), L4 không vẽ bong bóng — theo spec "đáp án a+b không bao giờ visible
  trước khi chọn" (spec thắng storyboard B5-03/06).
- **Bóng mờ sau rèm**: đĩa tối + hình bạn thú mờ, KHÔNG dùng style `filter`
  (iOS vẽ thành ô vuông xám, Android < 12 bỏ qua filter).
- **Catalog**: `number_bus`/`number_chain`/`ordinal_position` tạm nằm nhóm
  "Sắp xếp và dẫn đường" để giữ đúng thứ tự sư phạm; nhãn nhóm số riêng chờ
  product chốt.
- **Màn Cài đặt Khám phá** chỉ liệt kê game mà cấp bắt đầu thực sự đổi được
  lượt chơi (hiện: memory_match, number_bus, route_planner).
