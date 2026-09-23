# Kịch bản phỏng vấn cùng Đô Đô — v1 (draft, task 0.7)

> Draft nội dung cho change `add-dodo-interview-practice`. Mọi lời thoại Đô Đô
> tuân thủ `docs/KIDO_DODO_PERSONA.md` (canonical): xưng "Đô Đô", gọi "bé",
> câu ≤12 từ, mời gọi, không mệnh lệnh, không bao giờ nói "sai".
> Trạng thái: `draft` — chưa qua Human Gate, chưa được dùng trong phiên nào.

## 0. Tham số phiên (khớp proposal/spec, không tự đổi)

| Tham số | Giá trị |
|---|---|
| Số câu / phiên | 10 |
| Mode | `lam_quen` (thuần Việt), `english_basics`, `tong_hop_clc` |
| Thời lượng trả lời tối đa / câu | 60 giây, đồng nhất mọi câu (khớp spec: tự dừng tại 60 giây) |
| Giới hạn | 2 phiên/bé/ngày; 1 phiên trải nghiệm miễn phí/bé |
| Audio | 100% clip pre-generate TTS (Sulafat/Puck), lifecycle `draft → pending_review → approved → imported` |

v1 mỗi mode có đúng 10 câu = đúng 1 phiên, thứ tự cố định như bảng. Ngân hàng
mở rộng 50–100 câu (xáo thứ tự, biến thể) làm ở batch content sau, cùng lifecycle.

---

## 1. Ngân hàng câu hỏi v1

Nguyên tắc chấm cho cột `expected_hints`: đây là **các ý chấp nhận**, KHÔNG phải
đáp án mẫu. Mọi câu trả lời có chính kiến riêng, khác lạ, ngược số đông đều tính
`dung_chu_de='dung'` miễn là bám chủ đề. "Ví dụ đạt tối thiểu" là mức
`do_day_du=1` — chỉ cần ngắn gọn đúng ý là đạt, không yêu cầu nói thành câu dài.
Luật hào phóng: `do_tin_cay='thap'` ⇒ `dung_chu_de` BẮT BUỘC `'chua_ro'`,
không bao giờ `'lac_de'`.

### 1.1. Mode `lam_quen` — thuần Việt

| id | Lời Đô Đô đọc | expected_hints |
|---|---|---|
| iv_lq_01 | Chào bé! Đô Đô muốn làm quen nè. Bé tên là gì nha? | Nói được tên bất kỳ, tên thật hay biệt danh đều nhận (kể cả "Bin", "Xu"). Có họ tên đầy đủ thì `do_day_du` cao hơn. Ví dụ đạt tối thiểu: "Bin". |
| iv_lq_02 | Bé năm nay mấy tuổi rồi nè? | Nói được một con số tuổi hợp lý (3–8); đếm thành tiếng rồi chốt số vẫn nhận. Ví dụ đạt tối thiểu: "Năm tuổi". |
| iv_lq_03 | Nhà bé có những ai nè? Bé kể cho Đô Đô nghe nha. | Kể được ít nhất 1 thành viên (bố, mẹ, ông, bà, anh, chị, em…); mọi cấu trúc gia đình đều hợp lệ, không đòi "đủ bố mẹ". Kể kèm tên riêng, nghề, thú cưng đều nhận. Ví dụ đạt tối thiểu: "Có mẹ". |
| iv_lq_04 | Bé thích chơi gì nhất? Vì sao bé thích trò đó nè? | Bất kỳ sở thích nào, kể cả khác lạ (ngắm mưa, xếp dép, nghịch đất) — không có sở thích "chuẩn". Lý do trẻ con kiểu "vì vui", "vì thích" vẫn nhận; có lý do riêng thì `do_day_du` cao hơn. Ví dụ đạt tối thiểu: "Đá bóng". |
| iv_lq_05 | Bé kể về lớp mầm non của bé nha. Bé thích gì ở lớp nè? | Nhắc được bất kỳ điều gì về lớp: tên lớp, cô giáo, bạn, đồ chơi, món ăn, giờ ngủ… Chê lớp, kể chuyện không thích đi học vẫn là đúng chủ đề (có chính kiến). Ví dụ đạt tối thiểu: "Lớp có nhiều đồ chơi". |
| iv_lq_06 | Ở nhà, bé hay giúp bố mẹ việc gì nè? | Bất kỳ việc nhỏ nào: cất dép, lau bàn, tưới cây, trông em, gấp quần áo… "Chưa giúp gì" nói thật vẫn tính đúng chủ đề. Ví dụ đạt tối thiểu: "Cất dép". |
| iv_lq_07 | Khi buồn, bé thường làm gì cho vui lại nè? | Mọi cách tự xoa dịu đều nhận: ôm mẹ, khóc một chút, chơi đồ chơi, ngồi im, kể với ai đó… Không có đáp án "đúng cảm xúc". Ví dụ đạt tối thiểu: "Ôm mẹ". |
| iv_lq_08 | Bé thích ăn món gì nhất nè? Kể cho Đô Đô nghe nha! | Bất kỳ món nào, kể cả món "không lành mạnh" (kẹo, gà rán) — không phán xét. Tả thêm vị, ai nấu thì `do_day_du` cao hơn. Ví dụ đạt tối thiểu: "Phở". |
| iv_lq_09 | Lớn lên bé muốn làm gì nè? Bé kể Đô Đô nghe nha! | Mọi ước mơ đều hợp lệ, kể cả phi thực tế hay khác lạ (làm khủng long, lái tàu vũ trụ, bán kem). Ví dụ đạt tối thiểu: "Làm bác sĩ". |
| iv_lq_10 | Hôm nay có chuyện gì vui không bé? Bé kể một chuyện vui nha! | Kể được 1 sự việc bất kỳ hôm nay/gần đây; chuyện rất nhỏ (được ăn kem, thấy con mèo) vẫn nhận. "Hôm nay không vui" kèm lý do cũng là đúng chủ đề. Ví dụ đạt tối thiểu: "Được đi công viên". |

### 1.2. Mode `english_basics` — tiếng Anh pre-A1

Persona giữ nguyên trong tiếng Anh: Đô Đô tự xưng "Đô Đô", gọi trẻ "you",
câu ngắn. Chấm hào phóng với phát âm trẻ Việt: nghe ra từ khóa là nhận,
không trừ vì accent; trả lời bằng tiếng Việt đúng ý vẫn tính đúng chủ đề
(ghi nhận trong báo cáo phụ huynh là "trả lời bằng tiếng Việt").

| id | Lời Đô Đô đọc | expected_hints |
|---|---|---|
| iv_en_01 | Hello hello! Đô Đô is happy to see you. What is your name? | Nói được tên, có hoặc không khung câu ("My name is…", "I'm…", hoặc chỉ tên trần). Ví dụ đạt tối thiểu: "Bin". |
| iv_en_02 | Đô Đô wants to know your age. How old are you? | Một con số tuổi bằng tiếng Anh hoặc tiếng Việt; "I'm five" hay "five" đều nhận. Ví dụ đạt tối thiểu: "Five". |
| iv_en_03 | What is your favorite color? | Bất kỳ màu nào, kể cả màu "lạ" (black, pink, rainbow); từ trần không cần "I like…". Ví dụ đạt tối thiểu: "Blue". |
| iv_en_04 | What is your favorite animal? | Bất kỳ con vật nào, kể cả đáng sợ (snake, shark, dinosaur) — sở thích riêng đều hợp lệ. Ví dụ đạt tối thiểu: "Cat". |
| iv_en_05 | Let's count together! Can you count from one to ten? | Đếm được dãy số tiếng Anh; nhảy/thiếu 1–2 số hoặc dừng ở 5–7 vẫn tính đúng chủ đề, `do_day_du` theo độ trọn vẹn. Ví dụ đạt tối thiểu: "One, two, three, four, five". |
| iv_en_06 | Who is in your family? Can you tell Đô Đô? | Kể ≥1 thành viên bằng tiếng Anh (mommy, daddy, brother…) hoặc tiếng Việt; mọi cấu trúc gia đình đều nhận. Ví dụ đạt tối thiểu: "Mommy and daddy". |
| iv_en_07 | What is your favorite food? | Bất kỳ món nào; món Việt phát âm tiếng Việt ("phở", "bánh mì") nhận trọn vẹn. Ví dụ đạt tối thiểu: "Pizza". |
| iv_en_08 | What do you like to do? | Bất kỳ hoạt động nào ("play", "draw", "swim", "watch TV") — không có đáp án ngoan/hư. Ví dụ đạt tối thiểu: "Play". |
| iv_en_09 | What is your favorite toy? | Bất kỳ đồ chơi nào, kể cả tên riêng nhân vật (Elsa, siêu nhân); từ tiếng Việt vẫn nhận. Ví dụ đạt tối thiểu: "Robot". |
| iv_en_10 | It is time to say goodbye. Can you say goodbye to Đô Đô? | Bất kỳ lời chào tạm biệt nào: "Goodbye", "Bye bye", "See you" — nói được là đạt trọn vẹn. Ví dụ đạt tối thiểu: "Bye bye". |

### 1.3. Mode `tong_hop_clc` — Việt + Anh + logic, phong cách khảo sát trường CLC

| id | Lời Đô Đô đọc | expected_hints |
|---|---|---|
| iv_th_01 | Bé tự giới thiệu cho Đô Đô nghe nha. Tên, tuổi, và điều bé thích nè! | Nói được ≥1 trong 3 ý (tên / tuổi / điều thích); đủ cả 3 là `do_day_du=3`. Trẻ tự thêm ý riêng (trường, nhà ở đâu) đều nhận. Ví dụ đạt tối thiểu: "Bé tên Na, năm tuổi". |
| iv_th_02 | Bố mẹ của bé làm nghề gì nè? | Nói được nghề của ≥1 người, mô tả kiểu trẻ con vẫn nhận ("mẹ gõ máy tính", "bố đi làm xa"); "không biết" thật thà tính đúng chủ đề mức thấp. Ví dụ đạt tối thiểu: "Mẹ làm bác sĩ". |
| iv_th_03 | Bé có năm cái kẹo, bé cho bạn hai cái. Bé còn mấy cái kẹo nè? | Đáp án đúng: "ba" (3 cái). Nói số khác vẫn là đúng chủ đề (đã hiểu và làm phép tính) — độ chính xác chỉ ghi trong báo cáo phụ huynh, không bao giờ nói "sai" với bé. Đếm nhẩm thành tiếng rồi ra kết quả càng tốt. Ví dụ đạt tối thiểu: "Ba". |
| iv_th_04 | Con mèo và con chó giống nhau chỗ nào? Khác nhau chỗ nào nè? | Nêu được ≥1 điểm giống HOẶC khác theo quan sát riêng (đều có bốn chân, đều có lông; chó sủa mèo kêu meo, chó to hơn…). Mọi so sánh hợp lý kiểu trẻ con đều nhận, kể cả góc nhìn lạ ("mèo leo cây được"). Ví dụ đạt tối thiểu: "Đều có bốn chân". |
| iv_th_05 | Nếu bé lạc bố mẹ ở siêu thị, bé làm gì nè? | Mọi hướng xử lý an toàn đều nhận: đứng yên chờ, tìm chú bảo vệ, tìm cô thu ngân, nhờ gọi loa, đọc số điện thoại bố mẹ, không đi theo người lạ. Không đòi đúng "quy trình chuẩn"; trẻ nêu 1 cách hợp lý là đạt. Ví dụ đạt tối thiểu: "Tìm chú bảo vệ". |
| iv_th_06 | Now, English time! Hello! What is your name? | Nói được tên, khung câu tiếng Anh có hay không đều nhận. Ví dụ đạt tối thiểu: "My name is Na" hoặc "Na". |
| iv_th_07 | Another English question! Can you count from one to five? | Đếm 1–5 tiếng Anh; thiếu/nhảy 1 số vẫn tính đúng chủ đề. Ví dụ đạt tối thiểu: "One, two, three, four, five". |
| iv_th_08 | Vì sao bé cần rửa tay trước khi ăn nè? | Mọi lý do hợp lý kiểu trẻ con: cho sạch, hết vi trùng, khỏi đau bụng, mẹ dặn… Cách diễn đạt riêng đều nhận. Ví dụ đạt tối thiểu: "Cho sạch tay". |
| iv_th_09 | Bé thích ngày nào nhất trong tuần? Vì sao bé thích ngày đó nè? | Bất kỳ ngày nào kèm lý do riêng (chủ nhật đi chơi, thứ hai gặp bạn, thứ sáu ăn gà rán) — không có ngày "đúng". Nói được ngày là đạt, có lý do thì `do_day_du` cao hơn. Ví dụ đạt tối thiểu: "Chủ nhật, vì được đi chơi". |
| iv_th_10 | Gặp cô giáo ở trường mới, bé muốn nói gì nè? | Mọi lời chào/giới thiệu/câu hỏi với cô đều nhận: "Con chào cô" (lời của bé, không thuộc phạm vi cấm persona), tự giới thiệu tên, hỏi lớp có gì… Cả câu ngộ nghĩnh ("Cô ơi lớp có đồ chơi không?") đều đạt. Ví dụ đạt tối thiểu: "Con chào cô ạ". |

---

## 2. Danh mục clip dẫn chuyện / phản hồi v1 (33 clip dẫn chuyện dưới đây + 7 clip feedback §2.1 = 40)

Tất cả là lời Đô Đô, pre-generate TTS, qua Human Gate. Cột "Khi phát" là ngữ
cảnh client phát clip — mọi trigger trong bảng dưới đều là tín hiệu tại client
hoặc trạng thái phiên, KHÔNG chờ kết quả chấm async. Riêng pool `clip_fb_*`
(§2.1) do worker chấm chọn async qua `feedback_template`, chỉ dùng cho báo cáo
phụ huynh và audio đọc lại — không chen vào luồng phiên đang chạy.

| id | Khi phát | Lời Đô Đô (transcript TTS) | Ngôn ngữ |
|---|---|---|---|
| clip_greeting_lq | Mở phiên mode `lam_quen` | Chào bé! Đô Đô đây! Hôm nay Đô Đô và bé cùng trò chuyện nha. Bé cứ thoải mái nói nè! | vi |
| clip_greeting_en | Mở phiên mode `english_basics` | Hello hello! Đô Đô is here! Today Đô Đô speaks English with you. Ready? Let's go! | en |
| clip_greeting_th | Mở phiên mode `tong_hop_clc` | Chào bé! Hôm nay có tiếng Việt, tiếng Anh, và câu đố nè. Bé thử cùng Đô Đô nha! | vi |
| clip_howto | Ngay sau greeting, lần đầu vào phiên (hoặc khi bé bấm nút "nghe lại cách chơi") | Bé thấy nút mic tròn không nè? Bé chạm một lần, rồi trả lời nha. Trả lời xong, bé chạm thêm lần nữa nè. Bé thử nha! | vi |
| clip_next_1 | Chuyển câu (pool xoay vòng, mode Việt) | Hay quá! Sang câu tiếp theo nha bé! | vi |
| clip_next_2 | Chuyển câu | Bé nói hay ghê! Câu tiếp theo nè! | vi |
| clip_next_3 | Chuyển câu | Đô Đô nghe rồi nè! Tiếp tục nha bé! | vi |
| clip_next_4 | Chuyển câu | Tuyệt quá! Bé nghe câu tiếp theo nha! | vi |
| clip_next_5 | Chuyển câu | Đô Đô thích câu trả lời này ghê! Câu tiếp theo nè! | vi |
| clip_retry_1 | Client phát hiện bản ghi quá ngắn/gần như im lặng (heuristic local, không phải kết quả AI) | Đô Đô chưa nghe rõ, bé nói lại giúp Đô Đô nha! | vi |
| clip_retry_2 | Như trên, biến thể | Ơ, tai Đô Đô nghe chưa rõ nè. Bé nói to hơn chút giúp Đô Đô nha! | vi |
| clip_retry_3 | Như trên, biến thể | Đô Đô nghe chưa kịp nè. Bé nói lại lần nữa nha! | vi |
| clip_timeout_1 | Bản ghi chạm 60 giây, tự dừng. Wording không gắn "câu tiếp theo": client phát tiếp clip_next_* (câu 1–9) hoặc vào màn kết phiên (câu 10) theo vị trí câu | Câu này tới đây thôi nè! Bé giỏi ghê! | vi |
| clip_timeout_2 | Như trên, biến thể xoay vòng (tránh lặp nguyên văn khi bé chạm 60 giây ở nhiều câu) | Ôi, hết giờ câu này rồi nè! Bé nói hay lắm! | vi |
| clip_cheer_mid_1 | Động viên giữa phiên (sau câu 4–6) | Bé đang làm tốt lắm nè! Cố lên nha! | vi |
| clip_cheer_mid_2 | Động viên giữa phiên, biến thể | Ôi, bé tự tin ghê! Đô Đô thích lắm nè! | vi |
| clip_cheer_mid_3 | Động viên giữa phiên, biến thể | Được một nửa rồi nè! Bé giỏi ghê! | vi |
| clip_end_tu_tin_1 | Kết phiên mức "tự tin" (bé trả lời đủ 10 câu, bản ghi dài, không bỏ câu) | Bé trả lời tự tin ghê! Đô Đô nể bé luôn nè! Hẹn bé lần sau nha! | vi |
| clip_end_tu_tin_2 | Như trên, biến thể | Bé nói rõ ràng, tự tin lắm nè! Đô Đô vui ghê! Bé giỏi lắm! | vi |
| clip_end_tot_1 | Kết phiên mức "tốt" (hoàn thành phần lớn câu) | Bé làm tốt lắm nè! Đô Đô rất vui được nghe bé nói! Hẹn bé lần sau nha! | vi |
| clip_end_tot_2 | Như trên, biến thể | Hôm nay bé nói hay ghê! Lần sau kể thêm cho Đô Đô nha! | vi |
| clip_end_luyen_them_1 | Kết phiên mức "luyện thêm" (bỏ nhiều câu / bản ghi rất ngắn) — vẫn thuần động viên, KHÔNG chê | Hôm nay bé đã rất cố gắng nè! Lần sau bé nói chuyện tiếp với Đô Đô nha! | vi |
| clip_end_luyen_them_2 | Như trên, biến thể | Bé chơi cùng Đô Đô vui ghê! Bé tới chơi tiếp nha, Đô Đô chờ bé nè! | vi |
| clip_daily_limit | Server từ chối phiên thứ 3 trong ngày — Đô Đô hẹn mai | Hôm nay Đô Đô và bé trò chuyện đủ rồi nè! Mai bé lại chơi với Đô Đô nha! | vi |
| clip_bye_1 | Đóng phiên, sau clip_end_* | Tạm biệt bé nha! Đô Đô chờ bé quay lại nè! | vi |
| clip_bye_2 | Như trên, biến thể | Bái bai bé! Hẹn gặp bé lần sau nha! | vi |
| clip_en_next_1 | Chuyển câu trong mode `english_basics` (và 2 câu Anh của `tong_hop_clc`) | Great job! Next question! | en |
| clip_en_next_2 | Như trên, biến thể | Wow, well done! Next one! | en |
| clip_en_next_3 | Như trên, biến thể | Đô Đô likes it! Next question! | en |
| clip_en_retry_1 | Như clip_retry_* (heuristic local bản ghi quá ngắn/gần im lặng) nhưng cho mode `english_basics` | Đô Đô didn't hear well. Can you say it again? | en |
| clip_en_timeout_1 | Bản ghi chạm 60 giây trong mode `english_basics`; cùng luật wording không gắn "next question" như clip_timeout_* | Time is up! You did great! | en |
| clip_en_cheer_mid_1 | Động viên giữa phiên mode `english_basics` (sau câu 4–6) | You are doing great! Keep going! | en |
| clip_en_bye_1 | Đóng phiên mode `english_basics`, sau clip_end_* | Goodbye! See you next time! | en |

Ghi chú vận hành clip:

- Chuyển câu/cheer phát ngay sau khi bé dừng ghi âm, KHÔNG phụ thuộc kết quả
  chấm (chấm là async — spec "phiên không bao giờ chờ chấm").
- Mức kết phiên (`tu_tin` / `tot` / `luyen_them`) v1 chọn tại client theo tín
  hiệu hoàn thành (số câu có trả lời, tổng độ dài bản ghi) để màn kết thúc hiện
  ngay; biến thể `_1`/`_2` chọn ngẫu nhiên. Cả 3 mức đều là lời khen — không
  mức nào mang nghĩa chê.
- `clip_retry_*` chỉ trigger từ heuristic local (bản ghi <~1s hoặc gần im lặng)
  vì kết quả AI về sau khi phiên đã sang câu khác.
- `clip_end_*` CHỈ dùng cho màn kết phiên do client chọn; không bao giờ xuất
  hiện trong map `feedback_template` (§2.2). Feedback theo từng câu do worker
  chọn dùng pool `clip_fb_*` riêng (§2.1) — hai vai trò, hai cơ chế chọn,
  không dùng chung id clip.
- `clip_timeout_*` không nhắc "câu tiếp theo"/"next question" để phát đúng ở
  mọi vị trí, kể cả câu 10; điều hướng tiếp theo (sang câu sau hay vào kết
  phiên) do client quyết theo vị trí câu.
- Mode `english_basics`: mọi điểm chuyển trong phiên dùng clip tiếng Anh
  (`clip_en_next_*`, `clip_en_retry_1`, `clip_en_timeout_1`,
  `clip_en_cheer_mid_1`); các clip Việt tương ứng chỉ dùng cho mode Việt và các
  câu Việt của `tong_hop_clc`. **Quyết định v1 (song ngữ có chủ đích):** trong
  `english_basics` có đúng HAI điểm chen tiếng Việt: (i) `clip_howto` — cố ý
  giữ tiếng Việt để bé hiểu luật bấm mic ngay lần đầu vào phiên; (ii) cụm kết
  phiên phát `clip_end_*` (khen + hẹn, tiếng Việt) rồi `clip_en_bye_1` (tạm
  biệt tiếng Anh). Pool hướng dẫn + khen kết phiên thuần Anh làm ở batch
  content sau.

### 2.1. Pool clip feedback theo câu (worker chọn qua `feedback_template`)

Pool riêng cho feedback THEO TỪNG CÂU, tách hẳn khỏi clip kết phiên: `clip_end_*`
chỉ do client chọn cho màn kết thúc và KHÔNG xuất hiện trong map §2.2. Lời các
clip này không chứa lời hẹn/tạm biệt nên phát đúng ngữ cảnh ở bất kỳ câu nào.

**Một nguồn sự thật duy nhất cho text:** text canonical của mỗi
`feedback_template` là hằng `INTERVIEW_FEEDBACK_TEMPLATES` trong
`kido-pipeline/src/scripts/interview-rubric.prompt.ts`; transcript TTS của clip
tương ứng PHẢI trùng từng chữ với text đó (bảng dưới đã trùng; Human Gate đối
chiếu khi duyệt). Sửa text một bên thì phải sửa bên kia trong cùng change —
không soạn lời mới ở runtime.

| id clip | feedback_template | Lời Đô Đô (transcript TTS = text canonical trong prompt.ts) | Ngôn ngữ |
|---|---|---|---|
| clip_fb_tu_tin_1 | fb_tu_tin_1 | Bé nói to rõ ghê, Đô Đô thích lắm! | vi |
| clip_fb_tu_tin_2 | fb_tu_tin_2 | Bé trả lời tự tin quá, Đô Đô khen bé nè! | vi |
| clip_fb_tot_1 | fb_tot_1 | Bé trả lời hay lắm, Đô Đô vui ghê! | vi |
| clip_fb_tot_2 | fb_tot_2 | Đô Đô nghe bé kể, thích lắm luôn! | vi |
| clip_fb_luyen_them_1 | fb_luyen_them_1 | Bé thử kể thêm một chút nữa nha! | vi |
| clip_fb_luyen_them_2 | fb_luyen_them_2 | Bé nói thêm cho Đô Đô nghe với nha! | vi |
| clip_fb_chua_nghe_ro | fb_chua_nghe_ro | Đô Đô chưa nghe rõ, bé nói lại giúp Đô Đô nha! | vi |

`clip_fb_chua_nghe_ro` trùng lời với `clip_retry_1` nhưng là id riêng vì hai cơ
chế chọn khác nhau (retry do heuristic client giữa phiên, fb do worker chấm);
khi import có thể tái dùng cùng một asset audio. Pool v1 thuần Việt cho cả 3
mode; template tiếng Anh theo câu (rubric §5.2, ví dụ "Great answer! Đô Đô is
so happy!") đòi hỏi thêm id mới vào `INTERVIEW_FEEDBACK_TEMPLATES` trước — làm
ở batch content sau, sửa prompt.ts và bảng này trong cùng change.

### 2.2. Map `feedback_template` → clip

`feedback_template` trong JSON chấm (`{ nghe_duoc_gi, do_tin_cay, dung_chu_de,
do_day_du, tin_hieu_tu_tin, feedback_template }`) là **id**; text hiển thị trong
báo cáo phụ huynh và audio đọc lại (nếu phát) lấy theo text canonical nói trên ở
§2.1 (bằng đúng transcript clip, vì hai bên bắt buộc trùng từng chữ).

Worker đánh giá các điều kiện dưới đây **theo thứ tự từ trên xuống, khớp điều
kiện đầu tiên thì dừng** — các dòng loại trừ lẫn nhau và khớp 1-1 với 3 mức
hiển thị phụ huynh ở rubric §3. Ký hiệu: `tu_tin?`/`ngap_ngung?` = prefix của
`tin_hieu_tu_tin`.

| Thứ tự | feedback_template | Clip | Điều kiện | Mức rubric §3 tương ứng |
|---|---|---|---|---|
| 1 | fb_chua_nghe_ro | clip_fb_chua_nghe_ro | `dung_chu_de='chua_ro'` (bao gồm mọi ca `do_tin_cay='thap'` theo luật hào phóng) — nhận về phía Đô Đô, không bao giờ quy thành "trả lời sai" | *(không phải mức)* "Đô Đô chưa nghe rõ câu này" |
| 2 | fb_luyen_them_1 / fb_luyen_them_2 | clip_fb_luyen_them_1 / clip_fb_luyen_them_2 | CHỈ khi `dung_chu_de='lac_de'` (theo luật hào phóng chỉ xảy ra khi `do_tin_cay='cao'`; chi tiết chỉ vào báo cáo phụ huynh, với bé vẫn thuần động viên) | "Cùng bé luyện thêm" |
| 3 | fb_tu_tin_1 / fb_tu_tin_2 | clip_fb_tu_tin_1 / clip_fb_tu_tin_2 | `dung_chu_de='dung'` và `do_day_du>=2` và `tu_tin?` | "Tự tin" |
| 4 | fb_tot_1 / fb_tot_2 | clip_fb_tot_1 / clip_fb_tot_2 | `dung_chu_de='dung'` còn lại (`do_day_du=1` hoặc `ngap_ngung?`) | "Tốt" |

Biến thể `_1`/`_2` xoay vòng để tránh lặp trong một phiên. Thứ tự bảng này trùng
với bảng CÁCH CHỌN FEEDBACK trong `interview-rubric.prompt.ts` — khi sửa một
bên phải sửa cả hai, giữ cùng thứ tự first-match.

---

## 3. Ràng buộc bắt buộc của kịch bản

1. **Audio-only:** không câu hỏi hay clip nào yêu cầu bé nhìn tranh, đọc chữ,
   hay thao tác trên màn hình ngoài nút mic. Câu logic (iv_th_03, iv_th_04)
   thiết kế thuần nghe-nghĩ-nói. Đã rà 30 câu + 40 clip: đạt.
2. **Pre-generate + Human Gate:** toàn bộ lời thoại trong file này sẽ sinh audio
   TTS qua pipeline hiện có (giọng Sulafat/Puck) và đi đủ lifecycle
   `draft → pending_review → approved → imported`. Không TTS runtime; câu chưa
   `approved` không được xuất hiện trong bất kỳ phiên nào.
3. **Persona lint:** mọi dòng lời thoại ở đây phải qua lint xưng hô (task 2.5):
   fail khi Đô Đô dùng "con" gọi trẻ hoặc "cô"/"thầy"/"mình"/"tớ"/"tôi" tự xưng.
   Các chỗ dùng "con" trong file này đều là loại từ ("con mèo", "con chó",
   "con số", "con vật") hoặc lời của bé/nói với cô giáo trong `expected_hints`
   (không phải lời Đô Đô) — hợp lệ theo `docs/KIDO_DODO_PERSONA.md` §1. Riêng
   "cô giáo" ở ngôi thứ ba NẰM TRONG lời Đô Đô (iv_lq_05, iv_th_05, iv_th_10)
   là nhắc tới người khác — hợp lệ theo persona §1; lint task 2.5 phải có
   waiver cho mẫu "cô giáo/cô + danh xưng nghề" ở ngôi thứ ba, chỉ fail khi
   Đô Đô TỰ XƯNG "cô".
4. **Không nói "sai" với bé:** máy không nghe được → `fb_chua_nghe_ro` (nhận về
   phía Đô Đô); trả lời lệch chủ đề → chi tiết chỉ vào báo cáo phụ huynh, bé chỉ
   nhận động viên. Văn bản báo cáo phụ huynh dùng giọng "Kido" trung tính,
   ngoài phạm vi persona Đô Đô.
5. **Gate POC Phase 0:** kịch bản này chỉ ship khi POC đạt ≥85% hiểu đúng trên
   câu rõ ràng VÀ 0 false-negative gắt; file audio câu trả lời xóa ngay sau khi
   chấm xong.
