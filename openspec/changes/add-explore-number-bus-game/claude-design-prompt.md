# Prompt cho Claude Design — UI/UX "Xe buýt hai tầng" (`number_bus`)

> Cách dùng: đính kèm 2 file dưới đây rồi dán toàn bộ khối prompt.
> - `mobile/src/assets/images/dodo.png` — mascot Đô Đô (bắt buộc)
> - `docs/kido-explore-hifi-review.png` — bản hi-fi Khám phá cũ, để bám style (bắt buộc)
> - (tuỳ chọn) 1–2 ảnh chụp simulator của một game Khám phá đang chạy, ví dụ "Xếp tháp cho Đô Đô"

```text
# VAI TRÒ
Bạn là product designer cao cấp chuyên app giáo dục cho trẻ 4–6 tuổi. Hãy thiết kế UI/UX hi-fi + storyboard tương tác cho một mini-game mới trong app Kido (Dodokids). Phần kỹ thuật và sư phạm đã chốt; việc của bạn là biến nó thành màn hình mà một bé CHƯA BIẾT ĐỌC nhìn là hiểu, chạm là chơi được, và dev React Native dựng lại chính xác được.

# BỐI CẢNH SẢN PHẨM
- Kido: app học cho bé 4–6 tuổi Việt Nam. Audio-first, visual-first: bé hiểu qua nghe – nhìn – chạm, không cần đọc chữ. Chữ trên màn chỉ là phụ đề cho phụ huynh; mọi hướng dẫn phải hiểu được khi tắt tiếng VÀ khi không đọc được chữ.
- Mascot: Đô Đô — chú khỉ đeo kính tròn xanh, áo hoodie xanh chữ "D" (xem dodo.png). Đô Đô xưng "Đô Đô", gọi trẻ là "bé". Tâm trạng thể hiện bằng chuyển động nhỏ: idle đứng yên, cheer nhảy nhẹ, think nghiêng đầu.
- "Khám phá" là khu chơi tự do, KHÔNG phần thưởng: không sao, XP, streak, đồng hồ đếm ngược, trạng thái thua, không bao giờ nói "Sai rồi".
- Game mới "Xe buýt hai tầng" dạy 2 phương pháp toán nền tảng trong phạm vi 10:
  1) TÁCH – GỘP: một số gồm hai phần (5 gồm 2 và 3).
  2) ĐẾM THÊM: giữ số lớn trong đầu rồi đếm tiếp (trong xe có 5, lên thêm 2 → "sáu, bảy").
  Thuật ngữ bắt buộc: "gộp", "tách", "gồm", "đếm thêm". Cấm "số liền sau", "phép cộng", "bằng".

# ẨN DỤ HÌNH ẢNH CỐT LÕI (không được phá)
- Xe buýt hai tầng của Đô Đô đón các bạn thú ở bến.
- BIỂN SỐ TRÊN NÓC = TỔNG. HAI TẦNG = HAI PHẦN. Đọc từ trên xuống giống sơ đồ tách–gộp trong SGK Toán lớp 1 Việt Nam.
- Khung ghế lớn dần theo cấp:
  L1: xe nhỏ hai tầng, 4 ghế rời mỗi tầng.
  L2: mỗi tầng là một hàng 5 ghế (five-frame).
  L3–L4: mỗi tầng là 2 hàng × 5 ghế = một ten-frame riêng; trong một tầng lấp hàng đầu 5 ghế trước.
- SỨC CHỨA MỖI TẦNG CỐ ĐỊNH THEO CẤP, KHÔNG BAO GIỜ THEO ĐÁP ÁN. Ghế trống khi bé làm đúng là bình thường, vẽ trung tính (không viền đứt, không trông như ô cần lấp).
- Hai tầng mang hai màu nhạt khác nhau, an toàn cho trẻ mù màu (bảng Okabe–Ito, mặc định tầng dưới cam #E69F00 nhạt, tầng trên xanh da trời #56B4E9 nhạt; được đổi trong Okabe–Ito nếu đụng màu coral của nút chính).
- Hành khách: các bạn thú. Hiện code dùng emoji làm NỘI DUNG câu đố (🐱🐶🐰🐻🐼🐷🐵🐸🐢🐟🐦🦋). Hãy đề xuất 2 phương án: (a) dùng emoji như nội dung, đặt trong "ghế"/khung tròn cho gọn gàng; (b) một bộ ~6 mặt thú vector phẳng đơn giản, dựng được bằng SVG. Mọi bạn trong MỘT bài cùng một loài.
- Tuỳ chọn: Đô Đô ngồi ghế lái, nhìn thấy qua kính trước.
- Chất Việt Nam nhẹ nhàng: xe đưa đón thân thiện, biển bến xe tròn đơn giản. Không lạm dụng hoạ tiết.

# DESIGN SYSTEM BẮT BUỘC (đang dùng trong app)
- Nền app cream #FFFBF5; surface #FFFFFF; surfaceSunk #F6F0E6; hairline #EFE9DF.
- Brand coral #FF6B35 (pressed #E85328, tint #FFEBE1, chữ coral trên tint #B23A16). Teal #12A79B / tint #E1F5F2 là accent "mát" của Khám phá.
- Chữ: ink #242631, inkSoft #4C5060, muted #8C8F9C. Success #2FA46A / tint #E4F5EC. Amber #F4A825 (chỉ cho gợi ý bóng đèn).
- Font: Baloo 2 (ExtraBold 800 cho số và tiêu đề, Bold 700 cho câu đề 18pt, Medium 500 cho body). Có dấu tiếng Việt chồng (ế, ầ, Ề) — chừa đủ line-height ≥ 1.6em, không cắt dấu.
- Bo góc: 8 / 12 / 18 / 24 / 32 / pill. Bóng ấm (#2A1B10, độ mờ 6–14%). Không gradient nhiều nấc, không glow chồng lớp.
- Icon UI: nét kiểu Lucide, KHÔNG BAO GIỜ dùng emoji làm icon UI. Emoji chỉ được là nội dung câu đố.
- Vùng chạm: tối thiểu 64pt, nút chính nên 88pt. Chỉ CHẠM, không kéo–thả.
- Mục tiêu thẩm mỹ: chuyên nghiệp, có chủ đích, "đỡ AI". Tránh sticker, lấp lánh, confetti.

# KHUNG MÀN CHƠI ĐÃ CÓ (vẽ vào để thấy ngữ cảnh, KHÔNG thiết kế lại)
- Thanh trên: nút tròn X (thoát) bên trái · thanh tiến độ + bộ đếm "3/6" ở giữa · nút tròn loa màu coral "Nghe lại câu hỏi" bên phải.
- Giữa: VÙNG BẢNG CHƠI = phần bạn thiết kế. Dòng đề (promptVi, Baloo Bold 18pt, màu ink) nằm ở đầu vùng bảng.
- Dưới: vùng phản hồi — Đô Đô 44pt + một dòng phản hồi ngắn; dòng gợi ý có icon bóng đèn amber khi bé cần trợ giúp.
- Cột nội dung rộng tối đa 900pt, lề ngang 20pt, căn giữa.
- Màn kết lượt đã có: Đô Đô cheer + "Mình luyện xong rồi!" + nút "Chơi lượt mới" / "Chọn trò khác".
- Một lượt chơi = 6 bài, cùng một cấp.

# NHỮNG GÌ CẦN THIẾT KẾ

## A. Bộ component (component sheet)
Xe buýt (L1 ghế rời / L2 five-frame mỗi tầng / L3–L4 ten-frame 2×5 mỗi tầng), ghế trống, ghế có bạn, bạn thú, biển tổng trên nóc, bến xe (1 bến và 2 bến), cửa xe đóng có numeral, rèm bán trong suốt tầng trên, bóng mờ (silhouette) bạn sau rèm, ô bến xe có một bạn chờ (đường thêm của mode rèm), đuôi/tai ló dưới rèm, nút "Xong", nút CTA "Tập tầm vông!", thẻ số (numeral Baloo 800 + DẢI CHẤM MỜ bên dưới làm neo hình ảnh), bong bóng số đếm bật lên khi chạm, bàn tay gợi ý (ghost-hand), các trạng thái pressed / disabled / đúng / chờ.

## B. Năm mode của giai đoạn 1 — mỗi mode một storyboard đủ trạng thái

1. board_all — "Bé mời từng bạn lên xe nhé!" (L1, gộp, không thể sai)
   - Hai nhóm bạn ở HAI bến (trái/phải), ví dụ 2 và 1.
   - Mở đầu: Đô Đô chỉ lần lượt từng bến, nhóm được chỉ sáng lên trong lúc đếm mẫu.
   - Bé chạm từng bạn → bạn bay vào xe; nhóm bến 1 lên TẦNG DƯỚI, nhóm bến 2 lên TẦNG TRÊN. Mỗi chạm hiện bong bóng số 1, 2, 3…
   - Chạm lại bạn đã lên xe → bạn nhún vai cười, số không nhảy.
   - Đủ khách → câu thần chú "Gộp 2 và 1 được 3" có highlight đồng bộ: tầng dưới sáng khi đọc "2", tầng trên sáng khi đọc "1", cả xe sáng khi đọc "3". Rồi xe chạy "bíp bíp".
   - L1 KHÔNG có numeral, không có thẻ chọn.

2. free_split — "Bé chia các bạn lên hai tầng nha!" (tách tự do)
   - N bạn (3–9) ngồi tầng dưới. Chạm một bạn → lên tầng trên; chạm bạn tầng trên → xuống lại.
   - Nút "Xong". MỌI cách chia đều đúng → "5 gồm 2 và 3".
   - Lượt 2: "Còn cách chia nào nữa nhỉ?" — bảng GIỮ NGUYÊN, mở lại cho bé chia kiểu khác. Thiết kế tín hiệu thị giác cho lời mời này (không dùng chữ).
   - Bấm Xong khi một tầng trống → "Tầng nào cũng cần có bạn nha!" (nhắc nhẹ, không phạt).

3. next_number — "Số nào đứng sau số 4?" (khởi động)
   - Xe đỗ ở biển bến số n. 3 thẻ số. Thẻ có dải chấm mờ.

4. missing_part — "Mấy bạn đang trốn sau rèm nhỉ?" (tìm phần thiếu, KHÔNG có thẻ)
   - Biển nóc ghi tổng (ví dụ 7). Tầng dưới thấy k bạn (khoá). Tầng trên che rèm bán trong suốt.
   - Đường thêm duy nhất là BẾN XE ở hàng dưới, cạnh nút CTA (ô ≥ 88pt): luôn đúng MỘT bạn đứng chờ; chạm → bạn nhảy lên trốn sau rèm, một bạn mới bước vào bến. Không dùng dấu "+", không đặt gì trên nóc ngoài biển tổng. Bạn đã thêm hiện dạng bóng mờ sau rèm — đếm được và chạm được (chạm để bạn đó về bến).
   - CTA "Tập tầm vông!" → rèm lay theo nhịp rồi:
     · Đúng: rèm mở hẳn, đếm kiểm chứng cùng nhau, thần chú "7 gồm 4 và 3", màn đứng yên tới khi bé bấm tiếp.
     · Thiếu: đúng MỘT cái đuôi/tai ló ra dưới mép rèm + "Vẫn còn bạn đang trốn kìa, bé thêm bạn nhé."
     · Thừa: đúng MỘT bóng mờ của bé lắc lư ngơ ngác rồi đứng yên + "Có chỗ không ai trốn đâu, bé bớt bạn nhé."
     · Tín hiệu giống nhau bất kể lệch bao nhiêu; giữ nguyên các bạn cho bé tự sửa.
   - Không có ô chọn đáp án nào hết.

5. count_on — cửa đóng, đếm thêm
   - Cửa xe đóng, trên cửa CHỈ có numeral a (ví dụ 5), cố ý KHÔNG có chấm. Đô Đô: "Trong xe có 5 bạn rồi nha."
   - b bạn (1–3) chờ ở bến. Bé chạm từng bạn → bạn lên xe, bong bóng số hiện 6, 7 (đếm tiếp từ a+1, không từ 1).
   - L3: thẻ đáp án chỉ hiện SAU KHI bé đã chạm hết bạn chờ. L4: thẻ hiện ngay.
   - 3 thẻ tổng, luôn có một thẻ "kém 1" (bẫy lỗi đếm lẫn số đầu).
   - Storyboard riêng cho khi bé chọn thẻ kém 1: thẻ tạm ẩn → Đô Đô "Số 5 ở trong xe rồi, mình đếm thêm nha!" → bé chạm lại từng bạn, bong bóng 6, 7 → thẻ hiện lại cho bé chọn.
   - Tuyệt đối không để tổng a+b hiện ra trước khi bé chọn.

## C. Trạng thái trợ giúp (dùng chung cho mọi mode)
- Gợi ý lần đầu mỗi mode: bàn tay mờ chỉ vào chỗ chạm đầu tiên ~2–3 giây, chạm màn là tắt.
- Trợ giúp mức 1 (sau 1 lần chưa đúng): chỉ TRỎ — bạn ở bến, bạn kế tiếp hoặc rèm nhấp nháy nhẹ. KHÔNG đếm hộ, KHÔNG lộ đáp án.
- Trợ giúp mức 2 (sau 2 lần): mở đường đếm tất cả nhưng KHÔNG BAO GIỜ lộ phần là đáp án. Cửa đóng: cửa trong dần hiện a chấm mờ (a vốn đang hiển thị). Rèm: biển tổng trên nóc hiện N chấm mờ theo hàng 5, không đánh dấu sẵn chấm nào, không chấm nào trong vùng rèm. Mode thẻ: làm mờ thẻ không thể đúng.
- Phản hồi "chưa đúng" luôn bằng VẬT LÝ nhẹ (rèm lay, ghế nhún lò xo, bạn tụt về bến), không có dấu X đỏ, không rung màn.

## D. Tiến trình cấp độ — một bảng so sánh L1 → L4
Cùng một bài minh hoạ ở 4 cấp: L1 ghế rời, không numeral · L2 five-frame, numeral mờ chồng lên chấm · L3 ten-frame, numeral rõ trên biển/cửa · L4 chấm + numeral song song.

## E. Giai đoạn 2 (ưu tiên thấp, 1 frame mỗi mục là đủ)
- five_and: hàng đầu tầng dưới đầy 5, n bạn tầng trên → chọn tổng.
- make_ten: ten-frame tầng dưới có sẵn k bạn (5–9) — ngoại lệ duy nhất: ở đây đọc ô trống chính là chiến lược cần dạy, biển nóc "10" chỉ ở dạng numeral; chọn phần thiếu; đúng → các bạn còn lại bay vào từng ghế, đếm k+1…10.
- L5: SAU khi bé làm đúng, hiện lớp phủ tĩnh "3 + 7 = 10" (lần duy nhất ký hiệu +/= xuất hiện trong game).
- Cổng chọn nhóm lên trước: hai nhóm hai bến, bé chạm nhóm nào lên trước thì nhóm đó thành numeral trên cửa.

## F. Màn phụ huynh (khu cha mẹ, sau cổng phụ huynh)
"Cài đặt Khám phá": danh sách game, mỗi game một bộ chọn cấp bắt đầu (L1…L5). Riêng "Xe buýt hai tầng" hiện tiêu chí "đã vững" từng cấp để phụ huynh tự quyết định nâng cấp:
- L1: bé nói được tổng ngay sau khi các bạn lên xe, không đếm lại từng bạn.
- L2: biết một phần, bé đoán ngay phần kia của 4–5.
- L3: trả lời "5 và mấy" không cần đếm từng ghế, không chọn thẻ kém 1.
- L4: tự nói tổng mà không đếm lại nhóm trong xe.
- L5: cặp quen nói ngay, cặp lạ tự đếm thêm.
Giọng văn ấm, ngắn, không dùng từ học thuật, không so sánh bé với bạn khác.

# CHỮ TRÊN MÀN (tiếng Việt, dùng NGUYÊN VĂN)
"Xe buýt hai tầng" · "Xe buýt của Đô Đô tới rồi!" · "Hôm nay mình chơi với số 7!" · "Bé mời từng bạn lên xe nhé!" · "Bé chia các bạn lên hai tầng nha!" · "Chia kiểu nào cũng được đó bé!" · "Còn cách chia nào nữa nhỉ?" · "Tầng nào cũng cần có bạn nha!" · "Số nào đứng sau số 4?" · "Có tất cả 7 bạn nhé." · "Mấy bạn đang trốn sau rèm nhỉ?" · "Tập tầm vông, tay không tay có!" · "Trong xe có 5 bạn rồi nha." · "Có tất cả mấy bạn trên xe?" · "Số 5 ở trong xe rồi, mình đếm thêm nha!" · "Có chỗ không ai trốn đâu, bé bớt bạn nhé." · "Vẫn còn bạn đang trốn kìa, bé thêm bạn nhé." · "Xe chạy nào, bíp bíp!" · "5 gồm 2 và 3" · "Gộp 2 và 1 được 3" · "Bé thử lại nhé." · "Bé rủ ba mẹ chơi tách gộp nha!"
Câu nhắc thừa/thiếu và câu gợi ý TUYỆT ĐỐI không chứa số hay từ chỉ số lượng.

# RÀNG BUỘC CỨNG
- Trẻ phải hiểu việc cần làm chỉ qua hình + chuyển động + giọng nói. Test bằng cách che hết chữ.
- Không ký hiệu + − = trước L5. Không số âm, không số > 10.
- Tổng / phần thiếu không bao giờ lộ ở trợ giúp mức 1. Khe rèm hé không bao giờ đủ để đếm.
- Chỉ một đường thêm duy nhất (bến xe); vùng thêm và vùng bớt không chồng lên nhau; nền không phải vùng chạm.
- Đếm được bằng mắt: chấm/bạn không chồng lấp, nhóm ≤ 4 xếp theo hình quen (subitize được).
- Tầng dưới / tầng trên phân biệt bằng cả màu LẪN vị trí (không chỉ dựa vào màu).
- Chuyển động chỉ dùng translate / scale / opacity / rotate (native driver). Mỗi animation phải có phiên bản giảm chuyển động (reduce motion): vào chỗ ngay, highlight đổi độ đậm thay nhấp nháy.
- Vừa khít màn nhỏ nhất iPhone SE 375×667 không cuộn; kiểm tra cả 430pt và iPad 768pt+.
- Không dark pattern, không pop-up mời mua, không so sánh.

# ĐẦU RA MONG MUỐN
1. Component sheet (mục A), có tên từng thành phần và kích thước.
2. Màn hình hi-fi cho iPhone 393×852 dọc, mỗi mode ở B đủ trạng thái; 1–2 màn iPad 11" (834×1194) cho thấy cột 900pt căn giữa.
3. Storyboard từng mode dạng khung liên tiếp, ghi chú thời lượng (ms) và thứ tự audio ↔ hình (ví dụ mantra: lời "2" ↔ tầng dưới sáng).
4. Bảng motion spec: tên animation, thuộc tính, thời lượng, easing, bản reduce-motion.
5. Bảng so sánh cấp độ (mục D) và frame giai đoạn 2 (mục E).
6. Màn phụ huynh (mục F).
7. Ghi chú accessibility: nhãn đọc màn hình tiếng Việt cho xe, tầng, ghế, thẻ, nút.
8. Danh sách câu hỏi mở / chỗ bạn đề xuất khác với đặc tả, kèm lý do.

Bắt đầu bằng 2–3 hướng hình ảnh khác nhau cho chiếc xe + bảng chơi của mode missing_part (mode khó thiết kế nhất) để chọn hướng, rồi mới triển khai toàn bộ.
```
