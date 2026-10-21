# Thiết kế: lượt theo bậc dùng chung

## 1. Điều kiện để một game theo luật

Một bài được tính "đúng ngay lần đầu" khi màn chơi không nhận `onAnswer(false)`
nào trước `onAnswer(true)` (`tries === 0`). Luật chỉ có nghĩa khi renderer báo
MỌI lần sai. Game chỉ gọi `onAnswer(true)` (Lật thẻ tìm cặp, Xếp tháp cho Đô
Đô, Dẫn đường cho Đô Đô, Xưởng luyện nét, hai mode của Xe buýt hai tầng) sẽ luôn
6/6 và lên bậc tự động, nên không được bật cho tới khi có kênh báo sai (BRD §7.13
đã dự kiến `onAnswer(correct, detail?)` ở GĐ2). `test:explore-leveled-rounds`
chặn điều này: nó đọc cây cú pháp của renderer (bỏ qua chú thích) và đòi một lời
gọi `onAnswer(...)` với đối số khác `true`.

Cập nhật 2026-10-21: Dẫn đường báo mỗi lần chạy hỏng và đã bật (change
`update-explore-route-mirror-leveled`); Xếp tháp đã báo lần đặt sai nhưng
chủ sản phẩm chọn chưa bật, nên vẫn chạy progressive.

## 2. Vòng là một batch một bậc

`createExploreRunBatch` giữ nguyên ba nhánh: authored (`runPolicy`),
progressive, batch một bậc. Game theo bậc không có `runPolicy` rời danh sách
progressive, nên đi nhánh batch một bậc: `provider.createBatch(game, level,
roundSize, { excludeVariantKeys: vòng trước })`. Planner chọn bài khác nhau,
tránh 6 bài vòng trước. Game có `runPolicy` (Cân thăng bằng) phải có đúng
`roundSize` slot và không slot nào lệch bậc.

**Lượt mới ("Chơi lượt mới")** bắt đầu lại ở bậc phụ huynh chọn, nên màn chơi
nhớ bài đã chơi ở từng bậc của lượt vừa rồi (`roundKeysByLevelRef`, tối đa 2
vòng = 12 bài, chỉ trong bộ nhớ) và vòng đầu lượt mới tránh bài của bậc đó —
không phải vòng cuối (thường ở bậc cao hơn). Provider giữ 2×count khoá loại trừ
cho batch nhiều bài (cửa sổ 8 cũ cắt mất 4 bài vòng đầu). Nhánh authored chỉ giữ
số khoá cũ còn chừa chỗ cho cả lượt (`capacity − số slot`, giữ khoá mới nhất):
Cân thăng bằng bậc 2 có đúng 12 bài, loại cả 12 thì planner hết bài chưa ra và
lặp bài trong vòng.

Cỡ vòng lấy từ `getExploreRunSize` (thứ tự: `runPolicy` → `roundSize` → cỡ
progressive → mặc định 5), nên màn chơi không cần nhánh riêng khi tạo vòng đầu
hay vòng sau.

## 3. Trộn đều mode trong một vòng

`planExploreRound` dừng rút khi đủ số bài khác nhau và mọi bucket có mặt. Với
vòng đầu (chưa có gì để tránh) nó dừng ở 6 bài đầu tiên, nên tỉ lệ mode ngẫu
nhiên: đo được khoảng 32% 3/3, 48% 4/2, 19% 5/1. Batch nhiều bài giờ rút tới khi
mỗi bucket có ≥ ⌈count/số bucket⌉ bài CHƯA RA, rồi chia vòng tròn (3/3 hoặc
2/2/2). Batch một bài (progressive, authored, game liên tục) không đổi.

## 4. Chuyển vòng

Dùng lại toàn bộ cơ chế của Cân thăng bằng: tiếng `level_up`/`correct`, câu
`fb_level_next` (không khen chung trước) hoặc lời khen + `fb_level_again`, bài
mới hiện sau 1,2 s nhưng khoá tới khi câu nói xong và hàng phản hồi rảnh; cả 6
chấm sáng khi xong vòng. Thêm: `lastPromptKeyRef` về null khi đổi vòng, nên game
câu đề cố định (Ô thiếu, Ú òa) đọc lại câu đề ở bài đầu vòng mới.

Ú òa bắt đầu đếm thời gian nhìn ngay khi gắn bài. Bài đầu vòng mới gắn lúc còn
khoá, nên đồng hồ cát sẽ chạy hết dưới câu "Giỏi quá! Mình lên bậc mới nhé!".
Giờ renderer có cờ `opened` (bật ở lần render đầu tiên bàn chơi được phép bấm),
và pha `show` chỉ chạy khi `opened`; trong lúc khoá bé thấy cả tập với đồng hồ
đầy. Ba renderer còn lại không có hẹn giờ lúc gắn bài.

## 5. Số liệu (đo bằng generator thật)

| Game | Bài/bậc thật | Giây/bài (ước) | Đoán bừa qua 4/6 |
|---|---|---|---|
| Tìm quy luật | 72 (L4) → 9825 | 8–25 | 4–12% |
| Ô thiếu | ≥ 960 | ~8–15 | ~34% nếu chỉ đọc một chiều |
| Ú òa | rất lớn | ~10 | thấp |
| Máy nối tiếp | ≥ 88 (L1) | ~8–15 | ~5–12% |
| Đúng vị trí (20/10) | rất lớn (đồ vật trên kệ); câu hỏi: L1 4, L2 10, L3 6, L4 16, L5 24 | ~5–10 | 6% (L1) → 0,06% (L5) |

Từ bậc 1 qua hết là 30 bài (~6–10 phút); tối đa 60 bài nếu bậc nào cũng luyện
thêm. Nhắc nghỉ 12 phút vẫn hoạt động như cũ.

## 6. Không làm ở thay đổi này

- ~~Câu giới thiệu từng bậc (`introLine`) cho 4 game~~ — làm sau trong chính
  thay đổi này (18/10): owner duyệt 16 câu `pattern_/missing_cell_/peekaboo_/
  chain_intro_2..5` (bậc 1 không có), nói sau "Giỏi quá! Mình lên bậc mới nhé!"
  qua `levelIntroLine` (promptAudio.ts); thêm vào pack v6, một batch.
- Năm game cần owner quyết (xem proposal; `ordinal_position` đã bật 20/10 kèm 4
  câu `ordinal_intro_2..5` ở pack v7). Một game chỉ cần thêm một dòng vào
  `LEVELED_ROUNDS` (kèm `roundSize`/`passCount` riêng nếu cần) khi điều kiện §1
  thoả.
