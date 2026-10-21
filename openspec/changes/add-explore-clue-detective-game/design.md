# Thiết kế: Thám tử Đô Đô (`clue_detective`)

> Nguồn chuẩn của change. proposal/spec/tasks dẫn về đây khi cần chi tiết.
> Owner quyết định 2026-10-20: làm game Khám phá mới, catalog lên **13 thẻ**
> (không gộp thẻ cũ), muốn xem OpenSpec + 2 màn mock **trước khi code**. Thiết kế
> lấy từ 4 vòng tranh luận Claude × Codex và bản kiểm tra đối kháng
> (`tmp/game-ideas-2026-10-20/`: `claude-r1-slate.md` mục 2, `codex-r2.md`,
> `codex-r3.md`, `codex-r4.md`, `claude-r3-verdicts.json` khoá `clue_detective`),
> vòng review thứ năm (`codex-r5.md`, `clue-review-claude.json`), hai mô phỏng sau
> review (`clue-sim-leak.md`, `clue-sim-compare.md`), vòng review thứ sáu
> (`codex-r6.md`), mô phỏng khuôn đối xứng (`clue-sim-symmetric.md`) và vòng review
> thứ bảy (`codex-r7.md`). Bản 2026-10-20 thay bảng bậc cũ (7×3 → 7×4 có hai thẻ
> "có" → 9×3) bằng bảng **T-Lai** với bộ sinh **M**. Bản 2026-10-21 giữ lộ trình
> T-Lai nhưng bỏ hẳn bộ sinh M, vì Codex vòng 6 (mục 2A) chỉ ra khuôn M lộ đáp án
> cho bé **không đọc dấu thẻ** (100% ở cả 6 bậc); thay bằng **khuôn đối xứng dấu ở
> mọi bậc (P1)**. Cùng ngày, Codex vòng 7 chỉ ra P1 (món đệm xếp ngẫu nhiên) vẫn để
> một mẹo **chỉ đọc thẻ "có"** đúng 55–62% mỗi bài ở bậc 1–3, 5–6 (qua 70–82%);
> bản này (**P1-X**) giữ khuôn đối xứng nhưng chỉ rút cấu trúc trong một **danh mục
> hoán đổi được** cố định (mục 9): bậc 1–3 lên 9 nhà × 2 món, bậc 4 là cấu hình
> Möbius–Kantor 8 × 3, bậc 5–6 chỉ khuôn (3, 1, 0) (mục 5, 9, 10). Bản kiểm độc lập
> sau P1-X thêm luật **đặt tên đều** (mục 9): rút tên tuần tự có loại gần âm làm cận
> Bayes "chỉ đọc thẻ có" lên 33,9–36,2% mỗi bài. Codex vòng 7 chưa xem lại bản này.
> Script tái lập mọi số đo nằm trong
> `research/` của change (README có lệnh chạy và số mong đợi; P1 cũ đọc
> `research/p1-design.md`; script chỉ phục vụ M nằm ở `research/legacy/`).

## 1. Bài toán, construct và vì sao không "quá dễ"

**Thước đo của owner.** Ngày 2026-09-18 owner xoá Ai lạc đàn, Tìm bóng, Dọn đồ,
Cặp đôi hoàn hảo; lý do owner nói lại ngày 2026-10-20: "không có value lắm, quá
dễ, không có tính sư phạm". Chuẩn owner thích là Cân thăng bằng (BRD §7.14): 6
bậc, mỗi bậc gỡ một nấc hỗ trợ, có câu thần chú, sau mỗi bài đúng diễn lại lời
giải và chốt một câu. Game này phải qua đúng thước đo đó, nên **không có bậc tầm
thường kiểu "chạm hình giống"**: ngay bậc 1 bé đã phải dùng ba gợi ý thật, trong
đó hai gợi ý là phủ định. Cái giảm ở bậc đầu là **tải nhìn** (9 nhà × 2 món, đèn
soi, thẻ "có" đứng đầu), không phải logic.

**Lõi game.** Đô Đô đố: "Đô Đô đố bé: nhà Đô Đô là nhà nào?". Màn có 8 hoặc 9
ngôi nhà, cửa sổ mỗi nhà bày 2 hoặc 3 đồ vật. Đô Đô đọc ba gợi ý: một "có", hai
"không có" ("Nhà Đô Đô có quả táo." / "Nhà Đô Đô không có chú mèo đâu."), mỗi gợi
ý hiện thành một thẻ hình. Bé chạm đúng nhà.

**Construct:** suy luận loại trừ nhiều điều kiện, có phủ định. Bé giữ ba điều
kiện cùng lúc, áp từng điều kiện để loại dần các nhà ("không phải nhà này, không
phải nhà kia, vậy là nhà còn lại"), và phải kìm phản xạ chạm vào nhà có món vừa
nghe tên khi gợi ý là "không có". Chuyển sang lớp 1: đọc hiểu đề có "không",
"chưa", "còn lại"; làm theo yêu cầu nhiều điều kiện; gạch dần khi làm bài khoanh.

**Neo dạng bài (nguồn yếu, ghi đúng mức).** Dạng bài lấy từ một câu trong đề
Đoàn Thị Điểm năm học 2011–2012 (Phần 4, câu 1): nhìn 3 lớp học, theo các gợi ý
phủ định ("cô không mặc váy", "lớp không có chậu hoa") tìm lớp của Mai. Nguồn
duy nhất là bài **báo đăng lại** (Tiền Phong 12/04/2013, lấy từ Infonet), không
rõ ai cung cấp đề và **trường không xác nhận**; từ 2024 ĐTĐ chỉ phỏng vấn. Vì vậy
game định vị là **"luyện suy luận nhiều điều kiện"**, KHÔNG nói "sát đề" hay
nhắc tên trường (CV 5208, CV 1161 cấm khảo sát năng lực khi tuyển lớp 1). Câu đề
gốc là câu nhớ (nhìn 10 giây rồi che); game bỏ áp lực thời gian (BRD §6.2) và
thay bằng thẻ úp không tính giờ ở bậc 6.

**Vì sao không "quá dễ" (đo được, không phải lời hứa; số ở mục 10, máy in ra từ
`research/`):**

- Đoán bừa qua bậc ≤ 0,6% (9 nhà: 1/9 mỗi bài → 0,4%; 8 nhà ở bậc 4: 1/8 → 0,6%).
- Chặn theo một **thư viện chiến lược hữu hạn, công khai** (mục 9): S1–S15 và họ
  **"lọc rồi xếp hạng" S16** (595 chiến lược không dùng phủ định), không phải "mọi
  chiến lược": mọi chiến lược trong thư viện **không dùng nghĩa phủ định**, kể cả
  mọi mẹo ghép hai bộ lọc (trừ phép giao viết lại lời giải), đúng **≤ 1/3 trên
  từng bài**, nên qua bậc **≤ 19,0%** ở cả 6 bậc. Validator kiểm điều này trên
  từng bài, không chỉ trung bình. Mẹo ghép Codex tìm ra ở vòng 5 (S8∩S9) và mẹo
  "có A, tổng tần suất nhỏ nhất" của vòng 7 đều còn 19,0%.
- **Chỉ đọc thẻ "có" thì không qua bậc** (Codex vòng 7): bàn rút từ một danh mục
  cấu trúc **hoán đổi được** (luật R12, mục 9), nên ba nhà có món thẻ "có" không
  phân biệt được bằng bất kỳ cách đếm nào trên bàn. **Mọi mẹo chỉ đọc thẻ "có", kể
  cả cận Bayes (bé biết cả danh mục)**, đúng 1/3 mỗi bài → qua **19,0%** ở mọi bậc.
  P1 trước đó (món đệm xếp ngẫu nhiên) để mẹo tệ nhất của S16 qua 58,6–82,6%.
- **Không đọc dấu thì không qua bậc** (Codex vòng 6, mục 2A): bé chỉ nhìn ba món
  trên thẻ, bỏ qua màu, vạch chéo và lời, rồi đoán thẻ nào là "có" từ cách các
  món-thẻ xếp trên bàn. Với khuôn đối xứng dấu, luật R11 "đổi vai trò" và dạng thẻ
  rút độc lập (mục 9), **mọi mẹo mù dấu, kể cả cận Bayes (bé biết cả bộ sinh)**,
  đúng 1/3 mỗi bài từ bậc 3 → qua **19,0%**. Bộ sinh M cũ để mẹo này đúng 100% ở cả
  6 bậc. Ở bậc 1–2 thẻ "có" luôn đứng đầu nên "thẻ đầu là thẻ có" đúng 100%: đó là
  **giàn đỡ có chủ đích** (bé mới học dấu); các mẹo mù dấu khác vẫn 19,0%.
- Mỗi gợi ý đều cần thiết: bỏ bất kỳ thẻ nào thì còn ≥ 2 nhà. Bậc nào cũng đúng
  1 "có" + 2 "không có" (khuôn đề ĐTĐ có 2 phủ định).
- **Chỗ hở công khai** (suy luận một phần CÓ dùng phủ định; mục 10):
  - **S13 quên một thẻ "không có"** (dùng đúng thẻ "có" và một thẻ "không có"):
    đúng **1/2 trên mọi bài**, qua **56,9% ở cả 6 bậc**. Đây là **định lý** của
    khuôn đối xứng (chứng minh ngắn ở mục 10), không do chọn khuôn hay cấu trúc. So
    với M: bậc 1–4 không đổi; bậc 5–6 tăng từ 33,1% lên 56,9%.
  - **S3∩S9** "bỏ thẻ có, chọn nhà có tổ hợp món-thẻ duy nhất": **100%** ở mọi
    bậc.
  - "Cần đủ thẻ mới ra đáp án duy nhất" KHÔNG chứng nhận bé đã dùng đủ thẻ. Hai
    cách kéo chỗ hở xuống là **dạy**: câu thần chú "đúng với cả ba thẻ" và diễn
    lại có lời khi bé nhầm (mục 2), không phải luật validator.

**Khác các game đã xoá ở đâu:**

| Game đã xoá | Bé làm gì | Vì sao dễ | Thám tử khác ở đâu (đo được) |
|---|---|---|---|
| Ai lạc đàn (`odd_one_out`) | chọn ô khác các ô còn lại trên 1 thuộc tính | đáp án nổi bật bằng mắt, 1 điều kiện | đáp án **không** nổi bật: mẹo "nhà lạ" (S9 lẻ tổ hợp, S10 món độc nhất, S11 ít trùng) qua ≤ 1,7%; mọi mẹo ghép "nhà lạ" với bộ lọc không phủ định ≤ 19,0%; R5 cấm đáp án có món riêng. Riêng "nhà lạ" ghép với hai thẻ "không có" (S3∩S9) vẫn 100%, đã công khai ở trên |
| Dọn đồ (`sort_bins`) | đưa từng vật vào thùng theo 1 thuộc tính | mỗi quyết định 1 điều kiện, nhìn là thấy | mỗi lần chọn là hội 3 điều kiện, 2 cái phủ định; dùng 1 thẻ đúng ≤ 1/3 (qua ≤ 19,0%) |
| Tìm bóng (`shadow_match`), Cặp đôi hoàn hảo (`visual_analogy`) | khớp hình / quan hệ thị giác | tri giác thuần | ghép hình thẻ với hình trong nhà không ra đáp án: "nhà có nhiều món-thẻ nhất" đúng 0%; đoán thẻ "có" từ cách món-thẻ xếp trên bàn mà không đọc dấu đúng ≤ 1/3 từ bậc 3 |

Với các game còn sống: Ô thiếu và Tìm quy luật là suy luật thị giác, không có
điều kiện bằng lời và không có phủ định; Ú òa là nhớ, không có logic. Lesson có
`math_conditional_count` (24 seed, hội điều kiện kèm phủ định trên thuộc tính
nhìn thấy), `lang_follow_instruction`, `lang_elimination`,
`math_logic_elimination`: chồng một phần về construct, nhưng là seed tĩnh, không
có diễn lại lời giải, không chặn mẹo theo từng bài, không leo bậc.

## 2. Chiến lược dạy: từng thẻ một

**Câu thần chú** (một clip, `clue_mantra`): **"Bé soi từng thẻ một. Nhà Đô Đô
đúng với cả ba thẻ."** (13 âm tiết, ≈ 3,0 s). Câu nói đúng việc bé làm trong đầu
(soi từng thẻ) và nhấn "cả ba thẻ", đánh thẳng vào chỗ hở S13.

- Câu thần chú **không bảo bé "đóng cửa"**: bé không có thao tác đóng cửa; chạm
  vào nhà là chọn, chạm nhà "chưa đúng" để đóng sẽ bị tính là nhầm. "Đóng cửa" chỉ
  dùng cho việc **Đô Đô** làm (diễn lại, trợ giúp mức 2). Không thêm thao tác
  "đóng cửa nháp" cho bé (cử chỉ thứ hai, bé 4 tuổi dễ lẫn).
- Câu thần chú và mọi câu hướng dẫn không dùng chữ "không" (để "không" chỉ mang
  nghĩa phủ định của gợi ý) và không dùng "khớp" (trừu tượng với bé 4 tuổi).
- **Khi nào nói:** bài đầu tiên của vòng KHÔNG có câu dạy ký hiệu (mục 4). Vòng
  đầu lượt (mọi bậc bắt đầu) và mọi vòng bậc 3–6: bài 1 (câu dạy ký hiệu đã nằm
  trong bài làm mẫu đầu lượt, không nằm trong bài nào của vòng). Các vòng sau ở
  bậc 1–2: bài 2 (bài 1 có câu nhắc ký hiệu). Câu thần chú và câu dạy ký hiệu không
  bao giờ cùng nằm trong phần đọc đề (khoá trước lần chạm đầu) của một bài. Ngoài
  kế hoạch đó, trợ giúp mức 1 sau lần nhầm cũng đọc câu thần chú (mục 8), kể cả ở
  bài vừa có câu nhắc ký hiệu: lúc này bé đã nhầm và cần đúng câu đó.

**Diễn lại lời giải + câu chốt sau MỌI bài đúng** (chuẩn §7.14), chốt một hành vi
(không còn nhánh tuỳ chọn):

- **Diễn lại có lời** ở bậc 1–2, và ở **mọi bậc** khi bài đó có ≥ 1 lần nhầm:
  1. Nhà bé chọn mở cửa, Đô Đô (`ExploreMascot`, mood `cheer`) ló ra.
  2. Mọi nhà mở lại (kể cả nhà bé đã chọn nhầm), thẻ ngửa hết.
  3. Theo thứ tự đọc, thẻ j sáng, Đô Đô đọc lại đúng clip của thẻ j → **ký hiệu
     của thẻ j phủ lên món đó ở mọi cửa sổ có nó** (vòng xanh với thẻ "có", biển
     cấm với thẻ "không có", mục 4) → các nhà chưa đúng thẻ j khép cửa chớp **cùng
     lúc**. R7 bảo đảm bước nào cũng khép ≥ 1 nhà. (Bóng mờ món thiếu chỉ dùng cho
     phản hồi một lần nhầm, mục 8, không có trong chuỗi này.)
  4. Còn đúng một nhà mở. Đô Đô chốt: **"Còn lại nhà này! Đây là nhà Đô Đô."**
     (`clue_found`).

  Bước 2–4 cũng chính là chuỗi hình của **bài làm mẫu đầu lượt** (mục 4): app chỉ
  có MỘT chuỗi hình cho việc loại nhà, dùng chung cho làm mẫu, diễn lại và buổi
  thử giấy.
- **Diễn lại ngắn** ở bậc 3–6 khi bài đúng **ngay lần đầu**: bước 1–2 như trên;
  bước 3 là đúng chuỗi hình trên nhưng không lời: thẻ sáng lần lượt (~600 ms mỗi
  thẻ), ký hiệu phủ lên món, nhà chưa đúng thẻ đó khép cửa im lặng; rồi câu chốt. ≈ 4 s, ngang Cân (~3 s). Bé đã tự làm đúng nên không nghe lại
  hướng dẫn chi tiết (tránh expertise reversal), nhưng vẫn thấy cách loại trừ.
- Như Cân: chờ `max(thời gian diễn lại, 1100 ms)` rồi 250 ms mới gọi
  `onAnswer(true)`.

Mỗi lần nhầm cũng thành một bước loại trừ hợp lệ: nhà nhầm khép cửa kèm lý do
(mục 8). Bé vì vậy nghe cách giải ở cả hai chiều: khi sai và khi đúng.

**Thời lượng ước tính** (229 ms mỗi âm tiết, đo trên 411 clip pack v7; nghỉ
280 ms giữa câu = `SENTENCE_GAP_MS`; nhãn món trung bình 2,2 âm tiết; khép cửa
300 ms). Task 10.1 đo lại bằng clip thật:

| Đoạn | Âm tiết | ≈ giây |
|---|---|---|
| `clue_ask` | 10 | 2,3 |
| `clue_has` / `clue_not` | 6,2 / 8,2 | 1,4 / 1,9 |
| Ba gợi ý (1 có + 2 không) | 22,6 | 5,2 |
| `clue_mantra` | 13 | 3,0 |
| `clue_sign_has` / `clue_sign_not` | 10 / 13 | 2,3 / 3,0 |
| `clue_found` | 9 | 2,1 |
| **Khoá đọc đề một bài** (`clue_ask` + 3 gợi ý + 3 nghỉ) | | **8,3** |
| Diễn lại có lời (3 gợi ý + 3 × (khép + nghỉ) + nghỉ + chốt) | | 9,3 |
| Diễn lại ngắn (3 × 600 ms + nghỉ + chốt) | | 4,1 |
| Bài làm mẫu đầu lượt (câu đố + 3 gợi ý + 2 câu dạy ký hiệu + 3 khép + chốt + 6 nghỉ, mục 4) | | 17,5 |
| Phản hồi một lần nhầm (luật + chỉ nhà, mục 8) | | 3,1–3,6 |

Tổng thời gian **chỉ ngồi nghe** mỗi vòng 6 bài khi bé đúng hết ngay lần đầu:

- Vòng đầu lượt ở bậc 1: bài làm mẫu ≈ 17,5 s; khoá bài 1 ≈ 11,6 s (thêm câu thần
  chú), bài 2–6 5 × 8,3 s → khoá ≈ 53,1 s; diễn lại có lời 6 × 9,3 ≈ 55,8 s →
  **≈ 126 s ≈ 2 phút 6 giây**.
- Các vòng sau ở bậc 1–2: khoá bài 1 ≈ 14,2 s (thêm 2 câu nhắc ký hiệu), bài 2 ≈
  11,6 s (thêm câu thần chú), bài 3–6 4 × 8,3 s → khoá ≈ 59 s; diễn lại có lời
  ≈ 56 s → **≈ 1 phút 55 giây**.
- Vòng bậc 3–6: khoá 6 × 8,3 + 3,3 ≈ 53 s; diễn lại ngắn 6 × 4,1 ≈ 25 s → **≈ 1 phút
  18 giây**; vòng đầu lượt khi phụ huynh đặt bậc bắt đầu 3–6 thêm bài làm mẫu
  (**≈ 1 phút 36 giây**).
- Mỗi lần nhầm cộng 3,1–3,6 s phản hồi, và bài đó chuyển sang diễn lại có lời
  (+ ≈ 5,2 s).
- Lượt từ bậc 1 tới hết (≥ 36 bài) ≈ 9 phút chỉ để nghe, chưa tính thời gian giải;
  BRD §5.1 đặt phiên 2–3 phút cho bé 4–5 tuổi. Nhắc nghỉ (`useBreakReminder`) vẫn
  chạy; rủi ro 5 ở mục 15.

**Thuật ngữ trẻ nghe:** *nhà Đô Đô, gợi ý, thẻ, thẻ xanh, thẻ có vạch chéo, có,
không có, soi, đúng với, còn lại*; "đóng cửa" chỉ trong câu Đô Đô tự làm. Không
dùng "loại trừ", "điều kiện", "sai", "khớp".

## 3. Đồ vật

14 món chính + 2 dự phòng, đều có sẵn trong `MEMORY_ASSETS`
(`mobile/src/explore/games/memoryAssets.ts`). Emoji là NỘI DUNG bài (như Lật thẻ,
Cân), không phải icon UI. Nhãn đọc là nhãn miền Bắc của game (`CLUE_ITEMS`), có
thể khác `labelVi` của Lật thẻ (ô tô: "chiếc ô tô" để dùng lại clip của Cân).
Thứ tự chỉ số cố định, chỉ được thêm cuối (chỉ số nằm trong khoá câu đọc).

| idx | assetId | emoji | nhãn đọc | clip nhãn đã duyệt |
|---|---|---|---|---|
| 0 | `memory-cat` | 🐱 | chú mèo | `balance-cat` |
| 1 | `memory-dog` | 🐶 | chú chó | `balance-dog` |
| 2 | `memory-fish` | 🐟 | chú cá | `count-fish` |
| 3 | `memory-bird` | 🐦 | chú chim | — |
| 4 | `memory-frog` | 🐸 | chú ếch | — |
| 5 | `memory-flower` | 🌼 | bông hoa | `count-flower` |
| 6 | `memory-cactus` | 🌵 | cây xương rồng | — |
| 7 | `memory-mushroom` | 🍄 | cây nấm | — |
| 8 | `memory-apple` | 🍎 | quả táo | `count-apple`, `balance-apple` |
| 9 | `memory-banana` | 🍌 | quả chuối | — |
| 10 | `memory-watermelon` | 🍉 | quả dưa hấu | `balance-watermelon` |
| 11 | `memory-gift` | 🎁 | hộp quà | — |
| 12 | `memory-car` | 🚗 | chiếc ô tô | `balance-car` |
| 13 | `memory-kite` | 🪁 | cánh diều | — |
| dự phòng | `memory-turtle` | 🐢 | chú rùa | — |
| dự phòng | `memory-butterfly` | 🦋 | chú bướm | — |

- **Nhãn dự phòng dùng "chú", không dùng "con"**: contract prompt-lines
  (`verify-explore-prompt-lines-contracts.cjs`) cấm token "con" trong mọi câu liền
  (luật xưng hô), nên "con rùa / con bướm" sẽ làm mọi câu liền của món đó trượt.
- **Cặp gần âm không cùng bàn** (`CLUE_NEAR_SOUND_PAIRS`, validator R9): chú cá /
  hộp quà; chú rùa / quả dưa hấu (khi dùng món dự phòng). Generator loại cặp gần
  âm **ngay ở bước đặt tên** (cả món-thẻ lẫn món đệm), trước khi dựng bàn, không
  sinh rồi mới để validator loại; bộ tên rút **đều trên mọi bộ hợp lệ** (mục 9
  "Đặt tên đều"). Buổi thử giấy (mục 4) được thêm cặp vào danh sách này.
- **Đã loại và lý do:** quả bóng, bong bóng, gấu bông (bóng/bông chỉ khác thanh,
  đụng "bông hoa"; "bong bóng" là từ miền Nam); chú gấu, gấu trúc (trùng chữ
  "gấu"); cà rốt (cá/cà), tàu hoả (tàu/táo), quả dứa (dứa/dưa), chú thỏ
  (thỏ/chó), chùm nho (chùm/chim), thuyền buồm (buồm/bướm); chú khỉ (Đô Đô là
  khỉ); cam, dâu, đào (quả tròn đỏ/cam như táo, khó với trẻ mù màu đỏ–lục);
  kiwi, chiếc lá (khó nhận ở cỡ nhỏ); xe buýt, xe đạp, tên lửa (chỉ giữ một loại
  xe).
- **Còn rủi ro:** chó, cá, chim, rùa, bướm cùng đi với "chú", chỉ khác vần; cặp
  cùng màu ở cỡ nhỏ (🍄/🍎 đỏ; 🐸/🌵/🍉 xanh lá; 🐦/🐟 xanh dương). Bước gọi tên
  trong buổi thử giấy kiểm cả hai; món nào ≥ 2/5 bé **nhận nhầm hình** thì thay
  bằng món dự phòng.

## 4. Ký hiệu "có" và "không có"

**Ràng buộc:** trên phiếu bài tập VN, "đánh dấu X", "gạch chéo" và "khoanh tròn"
đều nghĩa là CHỌN (đề gốc dùng đúng quy ước đó). Thẻ "có" thuận chiều quy ước
này, thẻ "không có" thì ngược. Vì vậy **không bao giờ dùng X hay gạch chéo trơn**
(không có vòng tròn viền) làm dấu "không có". Chưa có nghiên cứu nào đo trẻ mẫu
giáo hiểu biển cấm; trẻ mẫu giáo thường không tự giải mã ký hiệu giao diện
(Hiniker và cộng sự 2016). Ký hiệu phải được **dạy bằng làm mẫu** và **thử với bé
trước khi code renderer**.

**Phương án A (chọn): kiểu biển giao thông**, vẽ bằng `react-native-svg`
(`Circle`, `Line`), không dùng emoji làm dấu:

- Thẻ **"có"**: hình tròn, nền xanh nhạt đặc `#D8EEFB`, viền liền 4 pt `#0072B2`,
  emoji ở giữa (28 pt trên thẻ 56 pt; 30 pt trên thẻ 64 pt).
- Thẻ **"không có"**: hình tròn nền trắng, viền 6 pt `#D55E00`, vạch chéo 6 pt
  cùng màu từ góc 10 giờ xuống góc 4 giờ, như biển cấm theo QCVN 41:2019 (khối
  5–6 tuổi ở mầm non có học biển báo). Vạch vẽ đè lên emoji (thu nhỏ 2 pt, độ đậm
  85%) để vẫn thấy món.
- Hai thẻ khác nhau bằng **hình** (nền đặc / nền trắng có vạch), không chỉ bằng
  màu: in đen trắng vẫn phân biệt được (Okabe–Ito, an toàn mù màu).

**Phương án B (dự phòng): "món vắng"**: thẻ "có" như A; thẻ "không có" viền tròn
nét đứt xám `#6B7280`, emoji xám 35% độ đậm. Rủi ro: nét đứt đang nghĩa "ô trống
cần điền" ở Ô thiếu và Tìm quy luật; món mờ dễ đọc là "đã loại" vì game này làm
mờ nhà bị loại. Chỉ dùng nếu A trượt. Nếu chọn B: bóng mờ món thiếu ở mục 8 phải
đổi kiểu để không trùng thẻ, và câu `clue_sign_not` ("vạch chéo") phải sửa trước
khi gen audio.

**Soi theo dấu, không bao giờ "lóe" món bị cấm.** Trong app nhịp sáng nghĩa là
"chỗ này" (Cân: cân mẫu nhịp sáng; trợ giúp), và trẻ 3–4 tuổi nghe câu phủ định
thì mắt nhìn vào vật được nhắc tên trước (Nordmeyer & Frank 2014; Doyle và cộng
sự 2019). Vì vậy mọi chỗ game chỉ vào một món trong cửa sổ đều vẽ **đúng ký hiệu
của thẻ**:

- thẻ "có": **vòng xanh** `#0072B2` (viền 3 pt) quanh món;
- thẻ "không có": **ký hiệu biển cấm** (viền tròn + vạch chéo `#D55E00`) phủ lên
  món, như trên thẻ.

Dùng ở: đèn soi bậc 1 (mục 5), bài làm mẫu (dưới), phản hồi nhầm loại "có món bị
cấm" và diễn lại (mục 2, mục 8). Contract kiểm hai kiểu vẽ khác nhau theo dấu và
không có hiệu ứng nhịp sáng/lóe trên món của thẻ "không có".

**Dạy ký hiệu bằng một bài làm mẫu đầu lượt, ở mọi bậc bắt đầu** (Codex vòng 6,
mục 2B: làm mẫu phải là ĐÚNG chuỗi hình app chạy, và buổi thử giấy phải thử đúng
chuỗi đó):

- **Bài làm mẫu đầu lượt** (bàn hướng dẫn riêng): trước bài 1 của vòng đầu tiên
  trong lượt, ở **bất kỳ bậc bắt đầu nào**, Đô Đô tự giải một bàn của bậc đó. Bàn
  sinh bằng chính generator của bậc (seed riêng, namespace `demo`), qua validator,
  không trùng `variantKey` với bài nào của vòng; không tính điểm, không gọi
  `onAnswer`, không vào lượt theo bậc; bé chỉ xem (chạm nhà/thẻ lúc này chỉ nảy
  nhẹ).
- **Chuỗi hình = đúng chuỗi diễn lại** (mục 2, bước 2–4): mọi nhà mở → theo thứ tự
  đọc, thẻ j sáng (bậc 6: lật ngửa), Đô Đô đọc gợi ý j → **ký hiệu của thẻ j phủ lên
  món đó** ở mọi cửa sổ có nó (vòng xanh / biển cấm) → các nhà **chưa đúng thẻ j
  khép cửa chớp cùng lúc** → … → còn một nhà, Đô Đô ló ra ở nhà đó (như bước 1
  của diễn lại) và chốt `clue_found`. Không có thao tác nào khác (không gạt nhà ra,
  không làm mờ riêng, không trỏ nhà).
- Lần đầu thẻ "có" (hoặc "không có") xuất hiện trong bài làm mẫu, ngay sau câu
  gợi ý của thẻ đó và trước khi khép cửa, Đô Đô nói **"Thẻ xanh nghĩa là nhà Đô Đô
  có món này."** (`clue_sign_has`) hoặc **"Thẻ có vạch chéo nghĩa là nhà Đô Đô
  không có món này."** (`clue_sign_not` ⚠). Mọi bàn có đủ hai loại thẻ, nên một bài
  làm mẫu dạy cả hai. Câu gọi thẻ cấm theo **hình** ("vạch chéo"), không theo màu:
  `#D55E00` là đỏ cam, bé dễ gọi là "cam", và thiết kế phân biệt bằng hình cho trẻ
  mù màu.
- Cờ "đã dạy" (`has`, `not`) chỉ nằm trong bộ nhớ của lượt, mất khi thoát (đúng
  `explore-stateless-privacy`); phụ huynh đặt bậc bắt đầu 5 thì bé vẫn xem bài làm
  mẫu trước lần chạm nhà đầu tiên.
- **Nhắc lại ở bậc 1–2:** bài 1 của mỗi vòng SAU vòng đầu lượt: ngay sau câu gợi ý
  đầu tiên của mỗi loại thẻ, Đô Đô nói lại câu dạy ký hiệu và ký hiệu của thẻ phủ
  lên món đó ở mọi cửa sổ có nó 1,5 s rồi tắt (đúng bước "ký hiệu phủ lên món" của
  chuỗi trên; không khép nhà vì bé đang tự giải).
- **Khi thiếu clip** (`clue_sign_*` hoặc gợi ý) hay máy tắt tiếng: bài làm mẫu
  chạy **đúng chuỗi hình trên**, mỗi thẻ 1,2 s thay cho độ dài câu, nên bé vẫn được
  làm mẫu bằng đúng thứ app sẽ làm. Buổi thử giấy đo riêng trường hợp này bằng
  đúng chuỗi đó (bước 2).

**Cổng thử giấy với 5 bé (tasks 0.3–0.5), làm TRƯỚC khi code renderer:**

- **Bé:** 5 bé 4–6 tuổi, **≥ 2/5 bé 4,0–4,9 tuổi chưa luyện phiếu** (khán giả bậc
  1), ≥ 1 bé đã luyện phiếu (kiểm quy ước "X = chọn"). ~15 phút mỗi bé.
- **In:** đúng cỡ **máy nhỏ nhất** 360×640 theo số đo mục 11 (thẻ 56 pt; bàn 9×2
  emoji 32 pt, lưới 3–3–3; bàn 9×3 emoji 29 pt), mỗi bộ có **bản màu** và **bản đen
  trắng**; miếng ký hiệu trong suốt (vòng xanh, biển cấm) để làm đèn soi và làm
  mẫu; **nắp cửa chớp giấy** úp vừa cửa sổ mỗi nhà (đúng hình "khép cửa" của app)
  và một miếng hình Đô Đô.
- **Bước 1, gọi tên:** bé gọi tên 14 món + 2 món dự phòng; rồi người lớn nói tên,
  bé chỉ hình (cặp vần "chú …", cặp cùng màu). Ghi nguyên lời. **Phân biệt** gọi
  bằng từ khác nhưng nhận đúng hình ("con cún", "xe hơi": không tính lỗi) với
  **nhận nhầm hình** (gọi chú chim là "con cá", chỉ 🍄 khi nghe "quả táo": tính
  lỗi). Món ≥ 2/5 bé nhận nhầm hình → thay bằng món dự phòng.
- **Bước 2, tắt tiếng:** đưa riêng thẻ "không có chú mèo", hỏi "Thẻ này nói gì?",
  ghi nguyên lời (chưa làm mẫu). Rồi **làm mẫu bằng hình, không lời, đúng chuỗi bài
  làm mẫu của app** trên một bàn B1 9×2 in sẵn: lần lượt từng thẻ theo thứ tự đọc,
  người lớn chạm thẻ j → đặt miếng ký hiệu của thẻ j (vòng xanh / biển cấm) lên món
  đó ở **mọi** cửa sổ có nó → úp nắp cửa chớp lên **mọi** nhà chưa đúng thẻ j cùng
  lúc; sau thẻ 3 còn một nhà, người lớn đặt miếng hình Đô Đô lên cửa sổ nhà đó.
  **Không** gạt nhà ra, không chỉ tay vào nhà, không làm thao tác nào app không có.
  Rồi 4 bài 2 nhà chỉ nhìn thẻ, người lớn không nói.
- **Bước 3, làm mẫu bằng lời:** "Nhà Đô Đô không có chú mèo đâu", chỉ vào vạch
  chéo.
- **Bước 4:** 6 bài 3 nhà thẻ đơn bản **màu**, có đọc lời (3 "có", 3 "không có",
  xáo); rồi 4 bài bản **đen trắng**, không lời (2 + 2).
- **Bước 5, bàn thật:** 1 bàn **B1 9×2** (đọc lời, đèn soi bằng miếng trong suốt)
  và 1 bàn khó nhất **9×3** (đọc lời, không đèn soi), dùng đúng hai bàn mẫu ở mục
  11. Ghi: đúng/nhầm, thời gian, số lần nhận nhầm món, số lần đọc ngược dấu, số lần
  cần người lớn giúp. Bàn 9×3 là cấu hình Pappus (mọi món có ở đúng 3 nhà, mục 9),
  nên đây cũng là lần đầu thử loại bàn "đều" này với bé.
- **Đạt** khi cả bốn:
  1. Bước 4 bản màu: ≥ 4/5 bé đúng ≥ 5/6.
  2. Bước 4 bản đen trắng: ≥ 4/5 bé đúng ≥ 3/4.
  3. Không bé nào đọc ngược dấu ≥ 2 lần ở bước 4 (chọn nhà có món bị gạch ở bài
     "không có").
  4. Bước 2 (chỉ làm mẫu bằng hình): ≥ 3/5 bé đúng ≥ 3/4.
- **Bước 5** không tính đạt/trượt ký hiệu nhưng **chặn code renderer** nếu ở bàn
  B1 ≥ 2 bé 4 tuổi cần người lớn giúp, hoặc ở bàn 9×3 ≥ 2/5 bé nhận nhầm món ≥ 2
  lần: báo owner, xem lại cỡ emoji / bảng bậc trước khi code.
- Câu "Thẻ này nói gì?" ở bước 2 không tính đạt/trượt: ≥ 2 bé tự hiểu thẻ là
  "chọn" thì xác nhận câu dạy ký hiệu là bắt buộc (thiết kế mặc định đã có).
- **Trượt (1)–(3):** A trượt thì thử B với 5 bé khác; cả hai trượt thì **dừng game
  và báo owner**. **Trượt (4):** báo owner; game chỉ ra khi owner chấp nhận "lượt
  đầu cần bật tiếng".

## 5. Bậc (bảng T-Lai, khuôn đối xứng + danh mục hoán đổi được P1-X)

Một exerciseType `clue_detective`, 6 bậc. Quy ước: P = thẻ "có", N = thẻ "không
có", chuỗi theo thứ tự đọc (PNN = có, không, không). Mọi bài đúng 1 P + 2 N, ba
dạng thứ tự PNN, NPN, NNP. **Chữ ký** nhà = chuỗi bit theo thứ tự thẻ (bit j = 1
khi nhà có món của thẻ j): "100" ở dạng PNN = có món thẻ 1, không có món thẻ 2, 3
(đó là đáp án). **Khuôn** = multiset chữ ký các nhà, viết theo vị trí thẻ nên
không phụ thuộc dấu; **khuôn đối xứng dấu** (a, c, d) = a nhà `000`, mỗi chữ ký
một món (`100`, `010`, `001`) đúng 1 nhà, mỗi chữ ký hai món (`110`, `101`, `011`)
đúng c nhà, d nhà `111`. Đáp án là nhà có chữ ký một món của thẻ "có" (mục 9).
**Cấu trúc** = bàn bỏ tên món (món-thẻ gọi theo vị trí thẻ A, B, C; món đệm D, E,
…). Bộ sinh chỉ rút cấu trúc trong **danh mục hoán đổi được** `CLUE_STRUCTURES`
(mục 9), không còn xếp món đệm ngẫu nhiên (Codex vòng 7).

Mỗi bậc thêm **đúng một** nấc khó bé nhìn thấy; riêng bậc 4 bớt một nhà cùng lúc
(ghi chú dưới). Lưới 9 nhà xếp 3–3–3, 8 nhà xếp 3–2–3 (mục 11):

| Bậc | Tên | Dạng thẻ | Nhà × món | Hình trên màn | Thẻ | Đổi đúng một thứ | Danh mục cấu trúc (mục 9) |
|---|---|---|---|---|---|---|---|
| 1 | Đèn soi | PNN, thẻ "có" luôn đứng đầu | 9 × 2 | 18 + 3 = 21 | ngửa | (khởi đầu) bài làm mẫu đầu lượt + câu thần chú; **đèn soi theo dấu** khi đọc từng thẻ | K4 ∪ K3 (1) |
| 2 | Tự soi | PNN, thẻ "có" luôn đứng đầu | 9 × 2 | 21 | ngửa | bỏ đèn soi | K4 ∪ K3 (1) |
| 3 | Đổi chỗ thẻ | PNN / NPN / NNP, rút độc lập đều mỗi bài | 9 × 2 | 21 | ngửa | thẻ "có" không còn đứng đầu | K4 ∪ K3 (1) |
| 4 | Nhà ba món | PNN / NPN / NNP, rút độc lập đều mỗi bài | 8 × 3 | 24 + 3 = 27 | ngửa | mỗi nhà 3 món (và bớt 1 nhà, ghi chú dưới) | Möbius–Kantor 8₃ (3 cách đặt thẻ) |
| 5 | Nhiều nhà hơn | PNN / NPN / NNP, rút độc lập đều mỗi bài | 9 × 3 | 27 + 3 = 30 | ngửa | 9 nhà | K4 + HI, K4 + HIJ, Pappus 9₃ (3) |
| 6 | Nhớ thẻ | PNN / NPN / NNP, rút độc lập đều mỗi bài | 9 × 3 | 30 | úp sau khi đọc | thẻ úp, bé nhớ hoặc chạm lật để nghe lại | như bậc 5 (3) |

- **Bậc 4 đổi hai thứ (9 → 8 nhà, 2 → 3 món mỗi nhà).** Giữ luật R5 thì 8 × 2
  không có cấu trúc hoán đổi được nào, 9 × 3 khuôn (2, 1, 1) cũng không (mục 9,
  chứng minh ngắn). Vì vậy bậc 1–3 dùng 9 × 2 (21 hình), và giữa 9 × 2 với 9 × 3
  (30 hình) có bậc đệm 8 × 3 (27 hình). Bớt một nhà là bớt tải nhìn, nên bậc 4
  vẫn chỉ thêm một nấc khó (món mỗi nhà). Phương án giữ thang "mỗi bậc đổi đúng một
  thứ" là P1-X′ (8 nhà ở bậc 1–3, nới R5), câu hỏi (b) ở mục 15.
- **Đèn soi (bậc 1):** Đô Đô đọc thẻ nào thì ký hiệu của thẻ đó hiện trên món ở
  mọi cửa sổ có nó (vòng xanh / biển cấm, mục 4) trong lúc câu đang đọc, tắt khi
  câu xong; chạm thẻ nghe lại cũng soi lại. Đèn soi là hỗ trợ nhìn, không đổi số
  đo chống mẹo (bé chọn "nhà có vòng xanh" chính là S2 = 1/3 mỗi bài).
- **Thẻ "có" đứng đầu ở bậc 1–2 là giàn đỡ có chủ đích:** bé mới học dấu nên vị
  trí cũng nói thẻ nào là "có" (mẹo "thẻ đầu là thẻ có" đúng 100%). Mọi mẹo mù dấu
  khác vẫn 19,0% ở bậc 1–2, và từ bậc 3 vị trí không còn mang tin (mục 10).
- **Dạng thẻ rút độc lập từ bậc 3, KHÔNG chia đều ×2 mỗi vòng:** túi ×2 tạo lỗ ở
  mức vòng: bé không đọc dấu nhưng nhớ dạng các bài trước (thấy lại lúc diễn lại)
  và biết luật ×2 đúng 56,1%/bài, qua 66,6% (`round-leak.cjs`); rút độc lập còn
  19,0%. Cái giá: một vòng có thể lệch (vd 4 bài PNN), và xác suất cả 6 bài cùng
  PNN là (1/3)⁶ ≈ 0,1%.
- **Bỏ hẳn bài hai thẻ và dạng hai thẻ "có"** (PPN/PNP/NPP): bài hai thẻ luôn có
  mẹo không phủ định ≥ 1/2 (qua 56,9%); dạng hai thẻ "có" luôn có S2 hoặc S2∩S9
  ≥ 1/2 (bậc trộn qua ≥ 25,7%). Giới hạn cấu trúc ở mục 10.
- **Không bậc nào là "cổng chứng nhận dùng đủ 3 thẻ":** quên một thẻ "không có"
  vẫn qua 56,9% ở mọi bậc (định lý, mục 10). Tên bậc nói đúng cái đổi: "Nhiều nhà
  hơn", "Nhớ thẻ". Thẻ úp chỉ đến sau khi bé đã qua 9 nhà lúc thẻ còn ngửa.
- **Thẻ úp (bậc 6):** mặt lưng trung tính, chỉ có chấm thứ tự 1/2/3 (không lộ có
  hay không có). Thẻ nào **thiếu clip gợi ý thì luôn ngửa** (thiếu clip thì thẻ úp
  không còn cách đọc). Game chỉ hiện khi pack v8 có trong bundle (mục 13), nên
  trường hợp này chỉ xảy ra khi một clip lẻ bị thiếu.
- **Ít cấu trúc ở mọi bậc** (danh mục 1 / 1 / 1 / 3 / 3 / 3; tính cả dạng thẻ
  1 / 1 / 3 / 9 / 9 / 9 cấu trúc, mục 10). Đây là cái giá của tính hoán đổi được
  (mục 9): mọi cấu trúc khác của cùng khuôn hoặc để một mẹo trong họ S16 vượt 1/3,
  hoặc không chặt (thêm vào danh mục thì cận Bayes "chỉ đọc thẻ có" vượt 1/3). Bé
  có học thuộc cả danh mục cũng không vượt 1/3 mỗi bài (qua 19,0%) nếu không đọc thẻ
  "không có": đó là cận Bayes "chỉ đọc thẻ có", chặn cả mẹo chưa ai nghĩ ra, không
  chỉ thư viện (mục 10). Mẹo đọc một phần thẻ "không có" (S13, S3∩S9) không đổi so
  với P1. ≥ 200 bài cụ thể mỗi bậc vẫn đạt nhờ đổi tên món và vị trí (mục 10).

**Câu giới thiệu khi lên bậc** (sau `fb_level_next`; bậc 1 là nơi bắt đầu nên
không có; câu nào cũng có chữ "bé", không câu nào có chữ "không"; không câu nào
nhắc số nhà nên bậc 4 bớt một nhà (9 → 8) không phải sửa câu):

| Bậc | id | Câu |
|---|---|---|
| 2 | `clue_intro_2` | Bây giờ bé tự soi món trong từng nhà nhé! |
| 3 | `clue_intro_3` | Bây giờ thẻ xanh đổi chỗ, bé nghe kỹ từng thẻ nhé! |
| 4 | `clue_intro_4` | Bây giờ mỗi nhà có ba món, bé soi kỹ từng nhà nhé! |
| 5 | `clue_intro_5` | Bây giờ nhiều nhà hơn, bé soi đủ cả ba thẻ nhé! |
| 6 | `clue_intro_6` | Bây giờ thẻ úp lại, bé chạm thẻ để nghe lại nhé! |

"Thẻ xanh" đúng với cả phương án A và B (thẻ "có" giống nhau).

## 6. Lượt chơi theo bậc

Dùng nguyên luật chung BRD §10 / `LEVELED_ROUND_RULE` (`registry.ts`):
`clue_detective: { ...LEVELED_ROUND_RULE, introLine }`.

- Vòng 6 bài cùng một bậc, bắt đầu ở bậc phụ huynh chọn (`startingLevelByGame`,
  mặc định 1; game theo bậc nên phụ huynh chọn được mọi bậc).
- Đúng **ngay lần đầu** ≥ 4/6 thì lên bậc; chưa đạt thì luyện thêm tối đa 1 vòng
  bài mới; vòng thêm vẫn chưa đạt hoặc qua bậc 6 thì hết lượt. Từ bậc 1 tới hết
  ít nhất 36 bài.
- Xác suất qua bậc khi xác suất đúng mỗi bài là p: q = P(Bin(6, p) ≥ 4), qua =
  1 − (1 − q)². p = 1/3 → q = 73/729 = 10,0%, qua 19,0%. Khi p khác nhau giữa các
  bài, q tính chính xác theo Poisson–binomial từng vòng rồi lấy trung bình (không
  lấy mẫu lựa chọn của bé).
- Renderer gọi `onAnswer(false)` ngay mỗi lần chạm nhầm nhà, nên game đủ điều
  kiện chơi theo bậc (contract leveled-rounds đọc AST). Không thêm vào
  `isProgressiveExploreRunGame`.
- **Không dùng `runPolicy`**: vòng là batch một bậc của `LocalExploreProvider`.
  `planExploreRound` chia đều theo bucket (`takeBalanced` lấy vòng tròn từng
  bucket, `mobile/src/explore/variety.ts`), nên game này khai **một bucket mỗi
  bậc** (mục 9): dạng thẻ rút độc lập theo seed trong generator, KHÔNG thành bucket
  (bucket = dạng thẻ sẽ tạo đúng túi ×2 mà mục 5 cấm). **Vị trí đáp án đều theo
  seed, KHÔNG dùng túi vị trí**, nên mẹo "luôn chọn một ô" (S12) đúng 1/K, bằng
  đoán bừa (qua ≤ 0,6%).
- Bậc, số bài đúng lần đầu, số vòng thêm, cờ đã dạy ký hiệu (đã xem bài làm mẫu)
  chỉ nằm trong màn chơi đang mở.

## 7. Tương tác

**Luồng một bài:**

0. Chỉ trước bài 1 của vòng đầu lượt: **bài làm mẫu** (mục 4), Đô Đô tự giải một
   bàn bằng đúng chuỗi diễn lại (bước 2–4, rồi Đô Đô ló ra ở nhà còn lại), bé xem;
   xong thì bàn thật của bài 1 hiện.
1. Bài hiện; nhà và thẻ **khoá**. Renderer đọc `clue_ask` ("Đô Đô đố bé: nhà Đô
   Đô là nhà nào?").
2. Câu thần chú nếu đây là bài của nó (mục 2).
3. Từng thẻ theo thứ tự đọc: đúng lúc câu bắt đầu (`onStart`) thẻ sáng (bậc 6: lật
   ngửa) và, ở bậc 1, đèn soi theo dấu; Đô Đô đọc `clue_has` hoặc `clue_not` của
   món đó. Bài 1 các vòng sau ở bậc 1–2: câu nhắc ký hiệu + ký hiệu phủ lên món
   1,5 s ở lần đầu mỗi loại thẻ (mục 4). Bậc 6: thẻ úp lại khi câu xong. Nghỉ
   280 ms giữa các câu.
4. Mở khoá khi câu cuối xong: chạm nhà để chọn, chạm thẻ để nghe lại.

**Ai đọc đề (điều phối với màn chơi).** Hôm nay `ExplorePlayScreen` tự phát
`exercise.audioRefs` khi vào bài, trừ game trong `RENDERER_CUED_PROMPT_GAMES`
(hiện chỉ `peekaboo_recall`); `onPromptCue` trả `void`; nút 🔊 của game cued chỉ
lặp cue cuối. Để nguyên thì đề bị đọc hai lần, hoặc lời không khớp lúc sáng thẻ.
Chốt:

- Thêm `clue_detective` vào `RENDERER_CUED_PROMPT_GAMES`: màn chơi KHÔNG phát
  `audioRefs` khi vào bài (`audioRefs` vẫn ghi trong envelope cho contract và 🔊).
- Renderer đọc `clue_ask` và từng gợi ý bằng
  `onSpeakFeedback(refs, { gentle: true, onStart, stillWanted })`, từng câu một:
  `gentle` để chờ tên game / câu lên bậc của màn chơi đọc xong (không cắt ngang);
  `onStart` sáng thẻ (và đổi chữ dải lời) đúng lúc câu thật sự bắt đầu;
  `stillWanted` trả `false` khi bài đã đổi hoặc renderer đã unmount; chờ promise
  xong mới sang câu sau; **mở khoá khi promise của câu cuối xong**, kể cả khi
  promise trả `false` (câu bị bỏ). Thiếu clip thì mỗi thẻ sáng 1,2 s rồi đi tiếp.
- **Nút 🔊:** màn chơi gọi hàm đọc lại do renderer đăng ký (prop mới, vd
  `registerPromptReplay`); renderer đọc lại `clue_ask` + cả ba gợi ý **đồng bộ
  hình** (sáng từng thẻ; bậc 1 kèm đèn soi; bậc 6 lật rồi úp lại). Lúc đọc lại bàn
  không khoá: bé chạm nhà là chọn và lời đang đọc dừng.
- Màn chơi đưa thêm cho renderer **vị trí bài trong vòng** và một **bộ nhớ của
  lượt** (chỉ trong RAM, mất khi thoát), để renderer biết bài đầu vòng, bài của câu
  thần chú và cờ đã dạy ký hiệu.
- Contract (tasks 4.4) assert bốn tình huống: **đọc một lần** (màn chơi không phát
  `audioRefs` cho game này; mỗi gợi ý đọc đúng một lần mỗi bài); **chạm liên tục**
  (chạm nhà lúc khoá không xếp thêm lời, không tính lần chọn; chạm thẻ liên tục chỉ
  đọc câu của lần chạm mới nhất); **chuyển vòng** (câu lên bậc của màn chơi đọc
  trước, câu đầu của renderer chờ); **thoát giữa câu** (lời dừng, không gọi
  `onAnswer`, không còn timer chạy).

**Khoá lúc đọc không phải đếm ngược.** Không có đồng hồ, không mất gì. Trẻ hiểu
câu phủ định chậm hơn câu khẳng định và mắt nhìn vào vật được nhắc tên trước, kể
cả khi câu là "không có" (Doyle, Friesen, Reimer & Pexman 2019; Reuter, Feiman &
Snedeker 2018), nên một lần chạm vội vào nhà có món vừa nghe không được tính là
"sai lần đầu". Chạm nhà lúc khoá: nhà nảy nhẹ, không phản hồi sai, không tính lần
chạm, tắt bàn tay gợi ý.

- **Nghe lại không giới hạn.** Chạm thẻ: thẻ sáng (bậc 6 lật ngửa rồi úp lại sau
  khi câu xong + 600 ms; bậc 1 kèm đèn soi), Đô Đô đọc lại câu của thẻ.
- **Chọn nhà:** cả ngôi nhà là vùng chạm (98 × 70 pt ở 360×640 cỡ chữ 1,0; sàn
  contract ≥ 88 × 64 pt, mục 11). Nhà đã khép cửa không nhận chạm. Trong lúc Đô Đô nói câu phản hồi nhầm, nhà không nhận chạm
  (nảy nhẹ, không tính).
- **Bàn tay gợi ý** (`GhostHand`): bé chưa chạm gì **10 s** sau khi mở khoá và
  không chạm thẻ nào trong 5 s gần nhất, bàn tay chạm thử thẻ đầu và Đô Đô nói nhẹ
  "Bé chạm vào thẻ để nghe lại gợi ý nhé." (`clue_hint_1`, `gentle`/`stillWanted`).
  10 s vì bé 4–5 tuổi cần soát 8–9 nhà × 3 điều kiện (5 s sẽ hiện gần như mọi bài
  và cắt ngang lúc bé đang nghĩ); đo lại khi playtest. Một lần mỗi bài. Không bao
  giờ trỏ vào nhà. Tắt khi phụ huynh bật `reducedSupport`.
- **Không đếm ngược, không giới hạn thời gian, không điểm, không phần thưởng**,
  chỉ chạm (không kéo, không giọng nói).
- **Giảm chuyển động:** cửa khép/mở, lật thẻ, đèn soi hiện/ẩn tức thì; vẫn giữ
  thứ tự và lời nói.

## 8. Phản hồi và trợ giúp

Theo hợp đồng với màn chơi (như Cân): `onAnswer(true)` chỉ gọi sau màn kết; chạm
nhầm gọi `onAnswer(false)` TRƯỚC, rồi renderer mới nói câu của mình. Game nằm
trong `SELF_VOICED_MISS_GAMES` (`ExplorePlayScreen.tsx`), nên màn chơi không nói
thêm câu "thử lại" chung.

**Chạm nhầm: hai loại phản hồi, nói luật trước rồi mới chỉ nhà.** Hàm thuần
`clueViolation(params, house)` trả về, theo thứ tự đọc, các thẻ nhà đó vi phạm
(thẻ j, món, loại). Đô Đô nói về thẻ vi phạm **đầu tiên**, câu thứ nhất dùng lại
đúng clip gợi ý của thẻ đó:

| Loại | Hình | Lời Đô Đô |
|---|---|---|
| **Có món bị cấm** (vi phạm thẻ "không có") | thẻ j sáng; ký hiệu biển cấm phủ lên món đó trong cửa sổ nhà vừa chạm | `clue_not` của thẻ j ("Nhà Đô Đô không có chú mèo đâu.") rồi `clue_fb_extra` "Nhà này lại có chú mèo." |
| **Thiếu món phải có** (vi phạm thẻ "có") | thẻ j nhấp nháy; một bong bóng nhỏ trên mái hiện **bóng mờ viền đứt** của món (emoji xám 35%) | `clue_has` ("Nhà Đô Đô có quả táo.") rồi `clue_fb_missing` "Nhà này chưa có quả táo." |

- Câu thứ hai không mở đầu bằng khuôn câu gợi ý phủ định (bản trước: "Nhà này
  không có quả táo, mà…"), để bé đang chưa vững dấu không lẫn. Hai câu theo món
  này không có chữ "không", nên số clip ⚠ owner phải nghe riêng giảm từ 46 xuống
  16 (mục 12).
- Sau câu, nhà đó khép cửa và mờ đi (40%), bé chọn tiếp; bậc 6 thẻ j lật ngửa
  trong lúc nói rồi úp lại.
- Tỉ lệ loại vi phạm đầu tiên trên các nhà nhiễu (danh mục P1-X, `exact-x.cjs`):
  bậc 1–2 cấm 25% / thiếu 75%; bậc 3, 5–6 46 / 54; bậc 4 52 / 48. 38% (9 nhà) và 43%
  (8 nhà) nhà nhiễu vi phạm hơn 1 thẻ; chỉ thẻ đầu tiên được nói, để một lần nhầm là
  một lượt lời.
- **Không lộ đáp án (định nghĩa đo được):** sau một lần nhầm chỉ nhà vừa chạm đổi
  trạng thái; không hình nào trỏ hay làm sáng đáp án hoặc nhà chưa chạm.

**Trợ giúp theo `supportLevel`** (1 sau lần nhầm đầu, 2 sau lần thứ hai, tính cả
lần nhầm mang sang từ bài trước; renderer giữ trong `supportRef` và chỉ đưa trợ
giúp khi bàn đã mở khoá và câu phản hồi đã nói xong). Hàm thuần
`clueSupportCue(params, supportLevel, closedHouses)` để contract kiểm:

| Mức | Hình | Lời | Không bao giờ |
|---|---|---|---|
| 1 | từng thẻ sáng lần lượt (bậc 6 lật ngửa rồi úp lại; bậc 1 kèm đèn soi); không đổi nhà nào | `clue_mantra` rồi đọc lại ba gợi ý | không đổi trạng thái nhà, không trỏ nhà |
| 2 | thẻ 1 sáng, khép mọi nhà **chưa khép** vi phạm thẻ 1 | "Đô Đô đóng cửa giúp bé các nhà chưa đúng thẻ đầu nhé." (`clue_hint_2`) rồi đọc lại thẻ 1 | không khép đáp án; **không tự giảm số nhà mở từ ≥ 2 xuống 1** |

- R8 bảo đảm trên bàn chưa có lần nhầm, khép theo thẻ 1 còn ≥ 3 nhà mở ở mọi bậc
  (danh mục P1-X, `exact-x.cjs`: bậc 1–2 đúng 3; bậc 3 3–6; bậc 4 3–5; bậc 5–6 3–6).
- Nếu bé đã khép nhầm các nhà sống sót sau thẻ 1 và khép theo thẻ 1 chỉ còn đáp
  án, mức 2 **không khép thêm** mà làm như mức 1 (đọc lại ba thẻ). Số nhà mở có
  thể đã còn 1 do chính bé khép nhầm hết nhà khác; trợ giúp không bao giờ tự làm
  điều đó.
- Không làm mờ thẻ nào; trợ giúp không bao giờ đếm hộ hay đánh dấu đáp án.

## 9. Sinh bài và validator

**Định danh:** mã `clue_detective`, exerciseType `clue_detective`, generator
`clue-detective-v1`, validator `clue-detective-validator-v1`, config
`clue-detective-config-v1`, levels [1..6], local, offline. `dependencyManifest`
chỉ gồm generator, validator, config và asset `memory-*`; **không** đưa audio
pack vào (chưa game nào làm, và mỗi lần nâng pack lại phải sửa mirror server).

**Envelope** (`ExploreExerciseEnvelope` hiện hành, không đổi shape):

- `params`: `level`, `form` (vd `'NPN'`), `houseCount` K, `itemsPerHouse` m,
  `clues` [{ `itemId`, `has` }] theo thứ tự đọc, `houses` [{ `houseId`, `items` }]
  theo thứ tự hiển thị (hàng trên xuống, trái sang phải), `spotlight` (chỉ bậc 1),
  `cardsFaceDown` (chỉ bậc 6).
- `answer`: { `houseId` }. `promptVi`: câu đố + ba câu gợi ý. `audioRefs`: khoá
  `clue_ask` + ba câu liền gợi ý. `assetRefs`: các `memory-*` có trên bàn.

**Vì sao bỏ bộ sinh M (Codex vòng 6, mục 2A).** Bảng 18 khuôn M luôn có cặp món-thẻ
AB và AC (A = món của thẻ "có") nhưng không có BC. Bé chỉ nhìn ba món trên thẻ, bỏ
qua dấu: lấy món chung của các nhà có đúng hai món-thẻ (luôn là A), rồi chọn nhà có
A mà không có hai món kia: đúng 100% ở cả 6 bậc. Cận Bayes của mọi mẹo mù dấu dưới
M là 100%, và không bàn M nào đổi vai trò được (`sym-table.cjs`, dòng T-Lai). Mức
19% của thư viện S1–S15 vì vậy không còn biện minh được tải 7–9 nhà.

**Vì sao bỏ xếp món đệm ngẫu nhiên (Codex vòng 7).** P1 xếp món đệm ngẫu nhiên rồi
nhận khi thư viện S1–S15 đạt. Codex tìm ra một mẹo **chỉ đọc thẻ "có"**: lọc các nhà
có món đó, rồi chọn nhà có **tổng tần suất** các món trong nhà nhỏ nhất (tần suất =
số nhà có món đó, đếm trên toàn bàn). Mẹo này khác S2∩S11: S11 tìm cực tiểu trên
toàn bàn trước rồi mới giao. Phản ví dụ 8 × 2 (`codex-cx.cjs`): thẻ có A, không B,
không C; nhà AD, EF, FD, BE, AB, CE, AC, BC. Sau khi lọc A, tổng của AD / AB / AC là
5 / 6 / 6, nên mẹo đúng 100% ở vai trò này, trong khi thư viện cũ chỉ 1/3 ở cả ba
dạng.

- Trên P1 (6.000 bài mỗi bậc, `table-x.cjs`), mẹo đúng 55,7 / 55,5 / 55,4 / 38,4 /
  61,2 / 61,5% mỗi bài, qua 70,4 / 69,9 / 69,7 / 29,0 / 81,4 / 81,9%. **100% bài P1
  có ít nhất một mẹo không phủ định của họ S16 (dưới) vượt 1/3** (`measure-p1.cjs`).
  Mẹo tệ nhất của họ qua 70,4 / 69,9 / 69,7 / 58,6 / 82,3 / 82,6%: bậc 4 là "có A,
  chọn nhà có món đệm phổ biến nhất" (49,8% nếu bỏ thống kê món đệm), bậc 5–6 là "có
  A, chọn nhà có tổng bình phương tần suất nhỏ nhất".
- Vét cạn 8 × 2: chỉ 3 cấu trúc đạt luật cũ, cả 3 để mẹo này đúng 5/9 trung bình ba
  vai trò (qua 70,05%). Đổi seed hay tên món không sửa được.
- **Nguyên nhân:** lọc theo thẻ "có" còn ba nhà: đáp án (A + món đệm) và AB, AC (A +
  một món-thẻ khác). Món "khác" của đáp án là món đệm, mà món đệm có thống kê (tần
  suất, bậc đồng xuất hiện) khác món-thẻ.

**Sửa: tính hoán đổi được (exchangeability).** Cấu trúc bàn phải có những phép đổi
tên món giữ nguyên bàn, giữ nguyên món thẻ "có" và đưa nhà đáp án sang từng nhà khác
có món đó. Khi đó trên bàn không có gì phân biệt các nhà có món thẻ "có", nên **mọi
mẹo chỉ đọc thẻ "có"**, kể cả mẹo ngoài thư viện và kể cả khi bé biết cả danh mục,
đúng đúng 1/3 trên từng bài (cận Bayes "chỉ đọc thẻ có", `bayes-p.cjs`), với điều kiện
tên món rút đều ("Đặt tên đều", dưới mục Generator). Gọi cấu
trúc là **chặt** khi, với cả ba vai trò, mọi nhà chứa món thẻ "có" nằm trong một quỹ
đạo của nhóm tự đẳng cấu giữ món đó (`autom.cjs`).

Ví dụ 9 × 2 (bậc 1–3): ba nhà một món-thẻ dùng chung một món đệm D ("món đội lốt"),
thành AD, BD, CD, AB, AC, BC: đủ 6 cặp của {A, B, C, D} (đồ thị đầy đủ K4). Ba nhà
`000` là tam giác EF, EG, FG (K3). Giữ A, đổi chỗ B, C, D tuỳ ý thì bàn không đổi,
nên không thống kê nào phân biệt được AD, AB, AC. Ý ban đầu (K4 ở 8 × 2, hai nhà
`000` từ món khác) không làm được: hai nhà `000` khi đó trùng hệt (R4/R5, dưới).

**Bổ đề (khuôn (a, 1, 0)).** Xét bộ lọc S8 (ba nhà một món-thẻ) và bộ lọc "có món
thẻ có" (ba nhà) với cả ba vai trò (điều kiện kín 2). Mỗi thống kê phải hoặc hoà cả
ba nhà, hoặc đặt đáp án nằm giữa chặt. "Nằm giữa chặt" không thể đúng cùng lúc cho
cả ba vai trò, còn S8 buộc ba nhà một món-thẻ bằng nhau. Vậy **mọi thống kê bằng
nhau trên 6 nhà có món-thẻ**. Tổng / min / max tần suất cho: món thứ ba của AB, AC,
BC cùng tần suất t; món đệm của nhà một món-thẻ có tần suất {3, t}. Thống kê món đệm
buộc t = 3, tức là **mọi món trong 6 nhà có món-thẻ có ở đúng 3 nhà**.

**Vét cạn** (`enum.cjs`, cắt tỉa theo bổ đề; "đạt họ" = đạt R1–R11, thư viện S1–S15
và họ S16 không phủ định ≤ 1/3 với cả ba vai trò):

| Cấu hình | Cấu trúc thoả điều kiện cần | Đạt họ | Chặt | Ghi chú |
|---|---|---|---|---|
| 8 × 2 (2, 1, 0) | 0 | 0 | 0 | bất khả (dưới) |
| 9 × 2 (3, 1, 0) | 2 | 2 | **1** | K4 ∪ K3; cấu trúc kia ("lăng trụ" AD BE CF AB AC BC DE DF EF) đạt họ nhưng cận Bayes chỉ đọc thẻ có 100% |
| 8 × 3 (2, 1, 0) | 704 | 3 | **3** | cả 3 là cấu hình Möbius–Kantor 8₃ (dưới) |
| 9 × 3 (3, 1, 0) | 4.727 với t = 3 (42,4 triệu cách gán); mọi t: 9.763 | 45 | **3** | K4 + HI, K4 + HIJ, Pappus 9₃; t ≠ 3 không có cấu trúc nào đạt họ; dùng cả 45 thì cận Bayes chỉ đọc thẻ có 51,1%, có góc nhìn 100% |
| 9 × 3 (2, 1, 1) | 5.585 | 0 | 0 | bất khả (dưới) |

- **8 × 2 bất khả.** Lọc "có A": AB và AC cùng tổng 6, nên đáp án A·x chỉ hoà được
  khi x có ở đúng 3 nhà, và phải đúng với cả ba vai trò (x₁, x₂, x₃). Có 7 chỗ món
  đệm (3 ở nhà một món-thẻ, 4 ở hai nhà `000`). Nếu x₁ = x₂ = x₃ thì hai nhà `000`
  chỉ còn món mới, mỗi món ≥ 2 nhà (R5), nên hai nhà trùng hệt (R4). Nếu x nhận hai
  giá trị thì thừa 1 chỗ, không món nào điền được. Nếu x đôi một khác nhau thì cần 6
  chỗ ở hai nhà `000`, chỉ có 4. `enum.cjs 8x2`: 0 cách gán.
- **9 × 3 (2, 1, 1) bất khả.** S8 và thống kê món đệm buộc mọi món đệm trong nhà có
  món-thẻ cùng tần suất t. Lọc "có A" theo tổng tần suất: đáp án 4 + 2t, AB = AC =
  8 + t, ABC = 12, nên phải có t = 4 (nếu không, đáp án là cực trị duy nhất). 9 chỗ
  món đệm tần suất 4 cần đúng 3 món, còn 3 chỗ ở hai nhà `000`; mỗi món phải nằm ở cả
  hai nhà nên số chỗ phải chẵn: mâu thuẫn. Vì vậy bậc 5–6 chỉ dùng khuôn (3, 1, 0).
- **8 × 3 là cấu hình Möbius–Kantor 8₃**: 8 món, 8 nhà, mọi món ở đúng 3 nhà, hai món
  chung tối đa 1 nhà, nhóm tự đẳng cấu cấp 48. Đó là một bàn duy nhất (bỏ tên món)
  với 3 cách đặt bộ ba món-thẻ; đếm cho thấy bàn chỉ có thể có đúng 5 món đệm, đều có
  ở 3 nhà.
- **Pappus 9₃** (cấu trúc thứ ba của 9 × 3): 9 món, 9 nhà, mọi món ở đúng 3 nhà,
  nhóm tự đẳng cấu cấp 108. K4 + HI và K4 + HIJ có cùng 6 nhà món-thẻ kiểu K4 (D đội
  lốt, mọi món ở 3 nhà); mỗi nhà `000` chứa một trong E, F, G (món thứ ba của BC,
  AC, AB) cùng H, I (K4 + HI) hoặc hai trong H, I, J (K4 + HIJ), các món H, I, J chỉ
  nằm ở nhà `000`.
- **Không chọn:** hoán đổi theo phân phối (bàn không chặt, trộn trọng số để hậu
  nghiệm đều, `views.cjs`) nâng 9 × 3 lên khoảng 15 cấu trúc nhưng cần bảng trọng số
  và chỉ đúng trung bình, không đúng trên từng bàn. Nới R5 thành **R5′** (món chỉ ở
  nhà `000` được xuất hiện 1 lần) cho 8 × 2 hai cấu trúc chặt (K4 ∪ {EF, EG}, K4 ∪
  {EF, GH}) và 9 × 3 (2, 1, 1) một cấu trúc (khối bát diện ADE BDF CEF ABD ACE BCF
  ABC DEF + một nhà lẻ GHI; bốn nhà có món thẻ "có" nên cận Bayes chỉ đọc thẻ có
  1/4): phương án P1-X′, câu hỏi (b) ở mục 15.

**Bảng `CLUE_STRUCTURES[level]`** (danh mục hoán đổi được, dùng CHUNG cho cả ba dạng
thẻ; A, B, C = món của thẻ 1, 2, 3 theo **vị trí** đọc, không theo dấu; D, E, … = món
đệm; mọi cấu trúc của một bậc rút đều; contract so bằng đúng; `research/exact-x.cjs`,
`table-x.cjs`, `boards-x.cjs`, `enum.cjs` đọc thẳng bảng này qua
`research/design-x.cjs`):

| Bậc | Nhà × món | Khuôn (a, c, d) | Cấu trúc | Tên |
|---|---|---|---|---|
| 1–3 | 9 × 2 | (3, 1, 0) | `AD BD CD AB AC BC EF EG FG` | K4 ∪ K3 (D đội lốt) |
| 4 | 8 × 3 | (2, 1, 0) | `ADE BDF CEG ABG ACF BCH DGH EFH` | Möbius–Kantor 8₃, cách đặt 1 |
| 4 | 8 × 3 | (2, 1, 0) | `ADE BDF CFG ABG ACH BCE DGH EFH` | Möbius–Kantor 8₃, cách đặt 2 |
| 4 | 8 × 3 | (2, 1, 0) | `ADE BFG CDF ABH ACG BCE DGH EFH` | Möbius–Kantor 8₃, cách đặt 3 |
| 5–6 | 9 × 3 | (3, 1, 0) | `ADE BDF CDG ABG ACF BCE EHI FHI GHI` | K4 + HI |
| 5–6 | 9 × 3 | (3, 1, 0) | `ADE BDF CDG ABG ACF BCE EHI FHJ GIJ` | K4 + HIJ |
| 5–6 | 9 × 3 | (3, 1, 0) | `ADE BDF CEF ABG ACH BCI DHI EGI FGH` | Pappus 9₃ |

- Khuôn (a, c, d) = số nhà `000`, số bản mỗi chữ ký hai món, số nhà `111`; mỗi chữ
  ký một món đúng 1 nhà. `CLUE_TEMPLATES[level]` (luật R10) là cột khuôn: bậc 1–3 9
  nhà (3, 1, 0), bậc 4 8 nhà (2, 1, 0), bậc 5–6 9 nhà (3, 1, 0). Khuôn bất biến dưới
  mọi hoán vị ba vị trí thẻ, nên đặt thẻ "có" ở vị trí nào cũng ra bài hợp lệ, và
  **đáp án là nhà có chữ ký e_p** của dạng đang dùng (p = vị trí thẻ "có": `100` ở
  PNN, `010` ở NPN, `001` ở NNP).
- Mọi dòng là cấu trúc **chặt** và đạt R1–R12 với **cả ba vai trò** (contract và
  `exact-x.cjs` kiểm từng dòng). Bậc 1–3: A, B, C, D có ở 3 nhà, E, F, G ở 2 nhà. Bậc
  4–6: mọi món trong 6 nhà có món-thẻ có ở đúng 3 nhà (bổ đề); với Möbius–Kantor và
  Pappus, mọi món trên bàn đều ở đúng 3 nhà.
- Bàn cần 7 (9 × 2), 8 (8 × 3), 9 hoặc 10 món (9 × 3); pool 14 trừ cặp gần âm còn
  ≥ 13 món, nên đặt tên luôn được.
- Danh mục khuôn đối xứng (`sym-catalog.cjs`) vẫn đúng ở mức khuôn: với m = 2 loại
  mọi khuôn có d ≥ 1 (nhà `111` cần 3 món) hoặc c ≥ 2 (các nhà hai món-thẻ trùng hệt,
  R4); với m = 3 loại d ≥ 2 (R4); 7 nhà trượt (S3 = 1/2, hoặc không xếp được món đệm
  giữ mọi mẹo ghép ≤ 1/3 cho cả ba vai trò); 10 nhà vỡ lưới 3 × 3 (mục 14). Mọi khuôn
  đối xứng có S13 tệ nhất đúng 1/2 (56,9%), S3 = 1/(a + 1), S3∩S9 = 100% khi a ≥ 2.

**Điều kiện kín** (`clue-sim-symmetric.md` §6 và vòng 7; thiếu một điều kiện là mẹo
mù dấu hoặc mẹo chỉ đọc thẻ "có" trở lại; contract kiểm cả năm):

1. **Một danh mục chung cho cả ba dạng thẻ.** Bộ sinh rút cấu trúc TRƯỚC và độc lập
   với dạng; đáp án là nhà có chữ ký e_p của dạng đang dùng. Không được có cấu trúc
   hay trọng số riêng theo dạng; tên món rút độc lập với cấu trúc và dạng, và **đều
   trên mọi phép gán món hợp lệ** cho các chỗ A, B, C, D, … ("Đặt tên đều", dưới).
2. **Mọi cấu trúc đạt R4–R6c và R12 với CẢ BA vai trò** (đặt thẻ "có" ở vị trí 1, 2,
   3 trên cùng nhà, cùng món). Lọc danh mục theo một vai trò thì cách chọn cấu trúc
   tự mang tin về dấu: với P1, nhận món đệm chỉ theo vai trò thật đẩy cận Bayes mù
   dấu lên 58,7% (8×2), 33,5% (8×3), 29,5% (9×3 (3, 1, 0)), 26,6% (9×3 (2, 1, 1))
   (`accept-leak.cjs`).
3. **R11 "đổi vai trò"** (dưới): đặt thẻ "có" ở vị trí nào cũng ra bài hợp lệ
   (R1–R6c) và ba đáp án khác nhau. Contract kiểm R11 đạt 100% trên mọi bài, kèm
   thư viện mù dấu và cận Bayes.
4. **Từ bậc 3, dạng thẻ (PNN / NPN / NNP) rút ĐỘC LẬP đều theo seed cho từng bài**
   (namespace riêng; contract kiểm χ²), **không túi ×2** mỗi vòng: túi ×2 để bé
   không đọc dấu nhưng nhớ dạng các bài trước và biết luật ×2 đúng 56,1%/bài, qua
   66,6% (`round-leak.cjs`). Vì vậy dạng thẻ không là `bucketKey` (dưới).
5. **R12 "hoán đổi được"** (dưới): mọi cấu trúc trong danh mục đều chặt. Chỉ một cấu
   trúc không chặt là bé biết danh mục có mẹo chỉ đọc thẻ "có" vượt 1/3 trên bàn đó:
   9 × 2 thêm "lăng trụ" thì cận Bayes chỉ đọc thẻ có lên 66,7% trung bình, 100% trên
   bàn lăng trụ (`bayes-p.cjs 9x2 fam`).

**Generator** (deterministic theo `(level, seed)`, mọi lần rút có namespace theo
bậc; không còn vòng xếp món đệm):

```text
cấu trúc = rút đều trong CLUE_STRUCTURES[level] (bậc 1–3: 1 dòng; bậc 4: 3; bậc 5–6: 3),
           TRƯỚC và độc lập với dạng thẻ
form     = bậc 1–2: PNN; bậc 3–6: rút đều độc lập trong {PNN, NPN, NNP} (namespace `form`,
           KHÔNG túi, KHÔNG theo bucket của vòng)
tên món  = rút ĐỀU một phép gán món cho mọi chỗ A, B, C (thẻ 1, 2, 3), D, E, … (món đệm) của
           cấu trúc: xáo pool 14, lấy đủ số món theo thứ tự chỗ; có cặp gần âm thì xáo lại
           phần đặt tên (namespace `names`, trước khi dựng bàn). KHÔNG rút tuần tự rồi loại
           món gần âm của món đã chọn (lệch tên giữa chỗ thẻ và chỗ đệm, "Đặt tên đều" dưới)
nhà_i    = nhà i của cấu trúc sau khi đặt tên
đáp án   = nhà có chữ ký e_p (p = vị trí thẻ "có" của form)
vị trí   = ô của đáp án rút đều trong 0..K−1 theo seed (KHÔNG túi vị trí); nhà nhiễu xáo vào
           các ô còn lại; thứ tự món trong cửa sổ xáo theo seed
nhận nếu validate(params).ok; không thì thử tiếp (≤ 400 lần tổng, seed con)
```

Mọi dòng của danh mục đã đạt R1–R12 với cả ba vai trò trước khi vào bảng, nên
validate chỉ còn bắt lỗi đặt tên (R9) hay lỗi code; contract đòi lần thử đầu đạt
trên mọi seed. Mô phỏng (`research/table-x.cjs`, tên món thật, pool 14, R9): 6.000
bài mỗi bậc, **0 lỗi R1–R9, 0 bàn trượt R11**.

**Đặt tên đều** (kiểm độc lập sau P1-X, `research/naming-bias.cjs`). Tính hoán đổi
được chỉ cho cận Bayes "chỉ đọc thẻ có" = 1/3 khi mọi phép đổi tên giữ bàn có cùng
xác suất, tức khi bộ tên rút đều trên mọi phép gán hợp lệ. Rút tuần tự (thẻ 1 → 3
rồi D, E, …) và loại món gần âm ngay khi chọn (cách của `research/lib.cjs`
`nameBoard`, bản trước) làm lệch: chọn chú cá hay hộp quà sớm thì mỗi bước sau bớt
một món, nên hai món này hay rơi vào chỗ thẻ hơn chỗ đệm. Bé chỉ đọc thẻ "có" mà biết
điều đó tránh nhà có cá / quà trong các nhà có món thẻ "có": cận Bayes 33,9% (bậc
1–2), 34,1% (bậc 3), 36,2% (bậc 4), 34,5% (bậc 5–6) mỗi bài → qua 20,0 / 20,4 / 24,4 /
21,1% (góc nhìn tệ nhất 40,0%); mẹo đơn giản "né nhà có cá / quà" trên bộ sinh thật
33,9–34,1% → qua 20,0–20,4%. Đặt tên đều thì cận đúng 1/3 trên mọi góc nhìn (qua
19,0%). Không đổi số đo nào khác (thống kê S1–S16 và mẹo mù dấu không đọc tên món;
`table-x.cjs` in ra giống từng byte); contract kiểm (tasks 2.7).

**Thư viện chiến lược hữu hạn S1–S15** (định nghĩa trùng `research/lib.cjs`). "Món-
thẻ" = món của một trong ba thẻ. Mỗi chiến lược trả về một **tập ứng viên**:

| Mã | Bé làm gì | Tập ứng viên | Dùng phủ định? |
|---|---|---|---|
| S1@j | chỉ dùng thẻ j | nhà thoả riêng thẻ j | có nếu thẻ j là "không có" |
| S2 | bỏ hết thẻ "không có" | nhà thoả mọi thẻ "có" | không |
| S3 | bỏ hết thẻ "có" | nhà thoả mọi thẻ "không có" | có |
| S4 | coi "không có" là "có" | nhà có đủ mọi món-thẻ | không |
| S5 | đảo dấu mọi thẻ | nhà trái mọi thẻ | không |
| S6 / S7 | nhiều / ít món-thẻ nhất | nhà có số món-thẻ lớn / nhỏ nhất | không |
| S8 | đúng 1 món-thẻ ("đúng c món-thẻ" với mọi c; dạng 1 có + 2 không chỉ c = 1 trúng được) | nhà có đúng 1 món-thẻ | không |
| S9 | nhà "lẻ tổ hợp" | nhà có chữ ký mà không nhà nào khác có | không |
| S10 | nhà có món độc nhất | nhà có món chỉ nhà đó có | không |
| S11 | nhà ít trùng nhất | nhà có tổng (số nhà có cùng món − 1) nhỏ nhất | không |
| S12 | luôn chọn một ô cố định | ô đó | không |
| S13 | quên một thẻ (theo vị trí đọc, theo loại, hoặc ngẫu nhiên) | nhà thoả hai thẻ còn lại | có |
| S14 | mẹo ghép A∩B, A ≠ B thuộc {S2, S3, S4, S6, S7, S8, S9, S10, S11}, hoặc một vế là S1@j (198 phép giao có thứ tự) | giao hai tập | có nếu một vế dùng phủ định |
| S15 | S2∩S9 (tên riêng của mẹo Codex): có món thẻ có, rồi chọn nhà lẻ tổ hợp | giao | không |
| S16 | họ "lọc rồi xếp hạng" (dưới, Codex vòng 7): lọc nhà, rồi chọn nhà có một thống kê nhỏ / lớn nhất | tập sau xếp hạng | theo bộ lọc |

**Họ "lọc rồi xếp hạng" S16** (`research/fam.cjs`; công khai, hữu hạn). Bé lọc nhà
bằng một bộ lọc, rồi xếp hạng các nhà còn lại bằng một thống kê đếm trên bàn và chọn
nhà có giá trị nhỏ nhất hoặc lớn nhất (hoà thì chọn đều), hoặc chọn đều trong bộ
lọc. Chiến lược = bộ lọc × (chọn đều, hoặc thống kê × {nhỏ nhất, lớn nhất}). Mẹo
Codex vòng 7 = "có món thẻ có" × tổng tần suất, nhỏ nhất.

- **Bộ lọc không dùng phủ định (17):** không lọc; có món thẻ "có"; có ít nhất một
  món-thẻ; S8; S9; S6; S7; có món thẻ "có" ∩ S9; có món thẻ "có" ∩ S6 (nhiều món-thẻ
  nhất trong các nhà có món đó); S8 ∩ S9; đọc thẻ "không có" như thẻ "có" (có món
  thẻ "không có" thứ nhất; thứ hai; cả hai; có món thẻ "có" và món thẻ "không có"
  thứ nhất; … và thứ hai); S4; đảo dấu thẻ "có" (nhà không có món thẻ "có").
- **Bộ lọc có phủ định (10):** chỉ thẻ "không có" thứ nhất (S1); chỉ thẻ thứ hai; S3;
  S13 bỏ thẻ "không có" thứ hai; S13 bỏ thẻ thứ nhất; không có món thẻ "không có"
  thứ nhất ∩ có món thẻ thứ hai (đọc như "có"); chiều ngược lại; không có món thẻ
  "không có" thứ nhất ∩ S8; … thứ hai ∩ S8; S3 ∩ S9.
- **Thống kê (17), đếm trên toàn bàn, không đọc dấu:** tần suất các món trong nhà
  (tổng, nhỏ nhất, lớn nhất, tổng bình phương); số món chỉ một nhà có; số món có tần
  suất nhỏ nhất bàn; bậc đồng xuất hiện của món (số món khác từng cùng nhà với nó:
  tổng, nhỏ nhất, lớn nhất); số nhà khác chung ít nhất một món; số nhà chứa cùng cặp
  món (lớn nhất, tổng). Năm thống kê cần biết món nào nằm trên thẻ (không cần dấu):
  tần suất món đệm (trung bình, nhỏ nhất, lớn nhất), bậc đồng xuất hiện trung bình của
  món đệm, tổng tần suất món đệm. Nhà không có món đệm thì thống kê món đệm không xác
  định và nhà đó không vào phép xếp hạng (cả tập không xác định thì chọn đều).
- **Kích thước:** 17 × 35 = **595 chiến lược không dùng phủ định**, 10 × 35 = 350 có
  phủ định; cộng S1–S15 và 198 phép giao.
- **Viết lại lời giải** (đúng 100% trên mọi bàn tham chiếu: mọi khuôn hợp lệ K 6–9,
  m 2–3, món đệm ngẫu nhiên; `taut.cjs`), không tính là mẹo: "có món thẻ có ∩ S8" và
  "có món thẻ có ∩ S7" với mọi thống kê (70 chiến lược); riêng m = 2: "có món thẻ có"
  và "có món thẻ có ∩ S9" với thống kê món đệm (sau khi lọc, chỉ đáp án có món đệm).
  **Tổng tần suất món đệm** cũng tách khỏi nhóm "không phủ định": trên mọi bàn đạt
  họ, mọi món đệm trong nhà có món-thẻ có ở 3 nhà, nên với các nhà đó thống kê này
  bằng 3 × số món đệm của nhà; trong bộ lọc "có món thẻ có", xếp theo nó chính là
  "có món thẻ có ∩ S7".
- **Cận Bayes "chỉ đọc thẻ có"** (`bayes-p.cjs`): bé thấy bàn, biết món thẻ "có",
  không dùng hai thẻ kia, và biết cả danh mục; chọn nhà có xác suất hậu nghiệm lớn
  nhất. Cận này chặn mọi mẹo chỉ đọc thẻ "có", kể cả mẹo ngoài S16. Với danh mục chặt
  và đặt tên đều (ở trên) nó bằng 1/(số nhà có món thẻ "có") = 1/3 trên từng bài, kể
  cả khi bé biết cách đặt tên (`naming-bias.cjs`).

**Thư viện mù dấu B** (`research/sym.cjs`; Codex vòng 6). Bé thấy ba món trên thẻ
và thứ tự thẻ nhưng **không đọc dấu** (màu, vạch chéo, lời): mỗi mẹo đoán vị trí
thẻ "có" từ bàn, rồi giải đúng theo dấu đã đoán (bản mạnh nhất của mỗi mẹo):

| Mã | Đoán thẻ "có" là |
|---|---|
| B-codex (i) | món chung của các nhà có đúng hai món-thẻ (mẹo Codex vòng 6) |
| B-freq (ii) | món-thẻ có ở nhiều nhà nhất |
| B-cooc (iii) | món-thẻ đồng xuất hiện với món-thẻ khác nhiều nhất; hoặc cặp ít đi cùng nhất là hai thẻ "không có" |
| B-pos (iv) | thẻ ở vị trí 1 (hoặc 2, hoặc 3) |
| B-R (v) | đổi vai trò, giữ vai cho đúng 1 nhà / đạt R1 + R2 / biết luật bộ sinh (R1–R3 + mọi mẹo không phủ định ≤ 1/3) |
| Bayes | cận trên mọi mẹo mù dấu, kể cả mẹo chưa nghĩ ra: bé biết cả bộ sinh, chọn vai trò có xác suất hậu nghiệm lớn nhất |

Hoà thì bé chọn đều trong các vị trí hoà. Với danh mục chung + điều kiện kín ở
trên, xác suất hậu nghiệm của ba vai trò luôn bằng nhau từ bậc 3, nên mọi mẹo mù
dấu (kể cả Bayes) đúng đúng 1/3 mỗi bài. Ở bậc 1–2, B-pos vị trí 1 đúng 100% (giàn
đỡ, mục 5); mọi mẹo khác 1/3.

**Quy tắc chấm (cố định, contract dùng đúng các quy tắc này):**

- Bé chọn đều trong tập ứng viên: p = 1/|tập| nếu đáp án thuộc tập, 0 nếu không.
- **Tập rỗng → đoán bừa** trong mọi nhà: p = 1/K. (Vì vậy S4 ở bàn không có nhà
  `111` ra 1/K, không phải 0.)
- **Phép giao rỗng → dùng bộ lọc đầu**: A∩B = ∅ thì bé chỉ áp A (B không loại thêm
  được thì bỏ qua B); A rỗng thì đoán bừa.
- **Phép giao viết lại lời giải** không tính là mẹo: phép giao có tập ứng viên
  đúng bằng {đáp án} trên MỌI bàn hợp lệ của dạng thẻ (vét cạn K = 4..9, m = 2..4).
  Với dạng 1 có + 2 không, trong nhóm không phủ định đó là S2∩S8, S8∩S2,
  S1@thẻ có∩S8, S8∩S1@thẻ có ("có món thẻ có, và chỉ có đúng một món-thẻ"). Trong
  S16 là danh sách viết lại lời giải ở trên (kể cả tổng tần suất món đệm).
- **S16:** xếp hạng hoà thì chọn đều trong các nhà hoà; bộ lọc rỗng thì đoán bừa
  (1/K); thống kê món đệm bỏ qua nhà không có món đệm (cả tập không có thì chọn đều).
- Phân loại: chiến lược **không dùng phủ định** = không vế nào là S3, S13 hay
  S1@thẻ "không có", và với S16 là bộ lọc thuộc 17 bộ lọc không phủ định; còn lại
  là **suy luận một phần có phủ định**. Thư viện B **không đọc dấu** (cả "có" lẫn
  "không có").
- Mẹo mù dấu trên một bài: p = trung bình trên ba vai trò (dạng rút đều) của [nhà
  mẹo chọn = đáp án của vai trò đó]; R11 bảo đảm ba đáp án khác nhau, nên mẹo đoán
  một vai trò cố định từ bàn đúng đúng 1/3.
- Qua bậc: q = P(≥ 4/6) Poisson–binomial chính xác từ p từng bài; qua =
  1 − (1 − q)². Dạng và cấu trúc rút độc lập mỗi bài nên mỗi bài đúng với cùng
  xác suất E[p], và qua = 1 − (1 − P(Bin(6, E[p]) ≥ 4))².

**Validator độc lập** (chỉ đọc nhà và thẻ đang hiển thị, không đọc `answer` khi
suy ra nghiệm; replay byte-identical sau khi bỏ `variantKey`/`bucketKey`):

- **R0** gameCode/exerciseType/versions đúng; `level` ∈ 1..6; K, m, `form`,
  `spotlight`, `cardsFaceDown` đúng bảng bậc (bậc 1–2 chỉ PNN); mọi món thuộc
  pool; `promptVi`, `audioRefs`, `assetRefs` khớp hàm dựng.
- **R1** Đúng 1 nhà thoả mọi thẻ, và đó là `answer.houseId`.
- **R2** Mỗi thẻ đều cần thiết: bỏ thẻ j thì còn ≥ 2 nhà (tương đương: có nhà chỉ
  vi phạm đúng thẻ j).
- **R3** Đúng 1 thẻ "có" + 2 thẻ "không có"; ba thẻ khác món; món của mỗi thẻ có ở
  ≥ 1 nhà và vắng ở ≥ 1 nhà (món của thẻ "không có" luôn có trên bàn, nên câu phủ
  định có ngữ cảnh).
- **R4** Mọi nhà đúng m món, không lặp món trong nhà, không có 2 nhà giống hệt.
- **R5** Mọi món không được nhắc có ở ≥ 2 nhà: đáp án không có món riêng nào ngoài
  món-thẻ.
- **R6** (thư viện, chiến lược đơn) Trên **từng bài**, mọi chiến lược đơn không
  dùng phủ định (S1@thẻ có, S2, S4, S5, S6, S7, S8, S9, S10, S11) đúng ≤ 1/3; thêm
  mọi S1@j và S3 ≤ 1/3 ở **mọi bậc** (khuôn đối xứng có S3 = 1/(a + 1): 1/4 ở 9
  nhà, 1/3 ở 8 nhà; bản M chỉ đòi ở bậc 1–4). S12 bảo đảm bằng vị trí đều theo seed
  (contract kiểm χ²).
- **R6b** (mẹo ghép) Trên **từng bài**, mọi phép giao hai bộ lọc thuộc
  {S1@thẻ có, S2, S4, S6, S7, S8, S9, S10, S11}, trừ phép giao viết lại lời giải,
  đúng ≤ 1/3 (gồm S15 và mẹo S8∩S9).
- **R6c** (họ S16, Codex vòng 7) Trên **từng bài**, với **cả ba vai trò**, mọi
  chiến lược không dùng phủ định của S16, trừ viết lại lời giải (kể cả tổng tần suất
  món đệm), đúng ≤ 1/3 (gồm mẹo Codex vòng 7).
- **R7** Diễn lại theo thứ tự đọc: bước nào cũng khép ≥ 1 nhà, cuối cùng còn đúng
  đáp án (danh mục P1-X, `exact-x.cjs`: PNN 6/1/1 ở 9 nhà, 5/1/1 ở 8 nhà; NPN
  3/4/1 và 3/3/1; NNP 3/2/3 và 3/2/2).
- **R8** Khép theo thẻ 1 còn ≥ 3 nhà mở (mọi bậc).
- **R9** Không có cặp trong `CLUE_NEAR_SOUND_PAIRS` cùng trên bàn.
- **R10** Multiset chữ ký các nhà (theo vị trí thẻ) thuộc `CLUE_TEMPLATES[level]`
  (cột khuôn của `CLUE_STRUCTURES`), và đáp án là nhà có chữ ký e_p của `form`.
- **R11** (đổi vai trò) Giữ nguyên nhà và ba món thẻ theo thứ tự, đặt thẻ "có" lần
  lượt ở vị trí 1, 2, 3 (hai thẻ kia "không có"): cả ba bài đạt R1–R6c (R6/R6b với
  phân loại "không phủ định" theo mọi dạng có thể), và ba đáp án đôi một khác nhau.
- **R12** (hoán đổi được, Codex vòng 7) Cấu trúc của bàn (bỏ tên món; A, B, C = món
  của thẻ 1, 2, 3 theo vị trí; khoá chuẩn ở dưới) thuộc `CLUE_STRUCTURES[level]`.
  Mọi dòng của bảng là chặt: với cả ba vai trò, nhóm tự đẳng cấu của bàn giữ món
  thẻ "có" đưa nhà đáp án tới mọi nhà có món đó (contract kiểm trên bảng, như
  `exact-x.cjs`). Phản ví dụ của Codex (8 × 2) trượt R12: không có trong bảng, và
  không chặt (quỹ đạo đáp án ở vai trò A chỉ có 1 nhà; `codex-cx.cjs`).

S13 và các mẹo ghép có vế phủ định (vd S3∩S9) **không** bị chặn theo từng bài: đó
là chỗ hở công khai (mục 1, mục 10). Contract đo chúng làm hàng rào chống xấu đi.
Riêng mẹo chỉ đọc thẻ "có" bị chặn bằng R12 (cận Bayes), không chỉ bằng thư viện.

**Chuẩn hoá khi đếm** (dùng cho `variantKey` và cho số ở mục 10):

- **Bài cụ thể** = bỏ hoán vị nhà, giữ tên món: multiset {tập món mỗi nhà} + thẻ
  theo thứ tự đọc (món, dấu) + tập món của đáp án. Đây là `variantKey`: một vòng
  không có hai bài chỉ khác chỗ xếp nhà.
- **Cấu trúc** = bài cụ thể bỏ thêm tên món: món-thẻ gọi theo vị trí thẻ, món đệm
  đổi tên tự do (ma trận nhà × món đệm, cột sắp xếp); vét mọi hoán vị nhà trong
  cùng nhóm chữ ký, lấy khoá nhỏ nhất (`canonKey` trong `research/lib.cjs`). Dạng
  thẻ là một phần của cấu trúc khi đếm số ở mục 10 (danh mục × dạng). R12 so khoá
  không kèm dạng với từng dòng của `CLUE_STRUCTURES[level]` (`structKey` trong
  `research/design-x.cjs`).

**Variety** (`CLUE_DETECTIVE_VARIETY`):

- `bucketKey` = **một bucket mỗi bậc** (vd `clue_l3`), KHÔNG ghép dạng thẻ hay vị
  trí đáp án: `planExploreRound` chia đều theo bucket, nên bucket = dạng thẻ sẽ dựng
  đúng túi ×2 mà điều kiện kín 4 cấm. Dạng thẻ và vị trí đáp án rút độc lập theo
  seed trong generator (contract kiểm χ² cả hai, và số bài mỗi dạng trong vòng do
  `planExploreRound` dựng khớp Bin(6, 1/3)).
- `variantKey` = bài cụ thể (trên).
- **KHÔNG khai `QUESTION_POLICIES`** cho game này (Codex vòng 8,
  `tmp/game-ideas-2026-10-20/codex-r8.md`). Chính sách tránh lặp theo tập món-thẻ
  làm phân phối có điều kiện theo lịch sử mất đối xứng: bài trước công bố đáp án nên
  suy được bộ ba món-thẻ cũ mà không đọc thẻ phủ định; bài sau có cùng lõi thì giả
  thuyết đáp án đòi lại bộ ba đó bị planner loại, mẹo "chỉ đọc thẻ có" đạt 1/2 thay
  vì 1/3. Đo qua `planExploreRound` thật (100.000 vòng/bậc): 33,58%/bài, bài thứ
  sáu 33,83%, vượt cận 1/3. Hai bài liền trùng nguyên bộ ba chỉ khoảng 0,3% nên bỏ
  chính sách không mất gì. Trùng một món-thẻ giữa hai bài liền vẫn có thể xảy ra (vd
  "có mèo" rồi "không có mèo" là phép thử phủ định tốt).
- **Luật cho mọi chính sách chống lặp về sau** (kể cả `variantKey` không trùng trong
  vòng): quyết định nhận/loại một bài SHALL bất biến giữa các giả thuyết đáp án hoán
  đổi được, tức loại cả quỹ đạo của bàn chưa gán thẻ, không loại riêng một vai trò.
  Contract đo mẹo "suy bài trước rồi loại" qua planner thật (tasks 2.7).
- `capacityByLevel` ≥ 200 mỗi bậc (mục 10).

## 10. Số đo chống mẹo và số bài

Máy in ra ngày 2026-10-21 (Node 24) bằng script trong `research/`, đọc thẳng bảng
bậc (mục 5) và danh mục `CLUE_STRUCTURES` (mục 9) từ file này. Ô = đúng mỗi bài →
qua bậc. Bảng chính: `node exact-x.cjs`, số **chính xác** (trung bình đều trên danh
mục × dạng thẻ của bậc, không lấy mẫu; tên món không đổi số đo nào trừ R9).
`node table-x.cjs` lấy mẫu 6.000 bài mỗi bậc với tên món thật (pool 14, R9) và
trùng bảng này. Mô hình giả định bé nhìn đúng mọi món.

**Bảng 6 bậc (tóm tắt, `node exact-x.cjs`):**

| Bậc | Cấu hình | Hình | Danh mục (cấu trúc) | Đoán bừa | Không phủ định tệ nhất (S1–S15 + S16) | Cận Bayes chỉ đọc thẻ có | Mù dấu trừ vị trí / kể cả | S13 tệ / ngẫu nhiên | S3 | S3∩S9 |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 9×2 PNN | 21 | 1 (1) | 0,4% | 19,0% | 19,0% | 19,0% / 100,0% | 56,9% / 36,5% | 7,4% | 100,0% |
| 2 | 9×2 PNN | 21 | 1 (1) | 0,4% | 19,0% | 19,0% | 19,0% / 100,0% | 56,9% / 36,5% | 7,4% | 100,0% |
| 3 | 9×2 PNN/NPN/NNP độc lập | 21 | 1 (3) | 0,4% | 19,0% | 19,0% | 19,0% / 19,0% | 56,9% / 36,5% | 7,4% | 100,0% |
| 4 | 8×3 PNN/NPN/NNP độc lập | 27 | 3 (9) | 0,6% | 19,0% | 19,0% | 19,0% / 19,0% | 56,9% / 43,2% | 19,0% | 100,0% |
| 5 | 9×3 PNN/NPN/NNP độc lập | 30 | 3 (9) | 0,4% | 19,0% | 19,0% | 19,0% / 19,0% | 56,9% / 36,5% | 7,4% | 100,0% |
| 6 | 9×3 PNN/NPN/NNP độc lập | 30 | 3 (9) | 0,4% | 19,0% | 19,0% | 19,0% / 19,0% | 56,9% / 36,5% | 7,4% | 100,0% |

Mù dấu "kể cả vị trí" ở bậc 1–2 là mẹo "thẻ đầu là thẻ có" (giàn đỡ có chủ đích,
mục 5). Đoán bừa 0,4% (9 nhà) / 0,6% (bậc 4); mọi mẹo không phủ định của S1–S15 và
S16 (kể cả mọi mẹo ghép và mẹo Codex vòng 7) ≤ 19,0%; cận Bayes "chỉ đọc thẻ có"
19,0%; mọi mẹo mù dấu, kể cả cận Bayes, 19,0% từ bậc 3; S13 56,9% ở mọi bậc (định
lý dưới); S3 7,4% (9 nhà), 19,0% (bậc 4); S3∩S9 100%.

**Bảng đầy đủ (`node exact-x.cjs`):**

| Chiến lược (chính xác) | B1 9×2 | B2 9×2 | B3 9×2 | B4 8×3 | B5 9×3 | B6 9×3 |
|---|---|---|---|---|---|---|
| Dạng thẻ | PNN | PNN | PNN/NPN/NNP rút độc lập | PNN/NPN/NNP rút độc lập | PNN/NPN/NNP rút độc lập | PNN/NPN/NNP rút độc lập |
| Đoán bừa / S12 một ô cố định | 11,1% → 0,4% | 11,1% → 0,4% | 11,1% → 0,4% | 12,5% → 0,6% | 11,1% → 0,4% | 11,1% → 0,4% |
| S1 một thẻ tốt nhất (mọi thẻ) | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% |
| S2 bỏ hết thẻ "không có" | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% |
| S4 coi "không có" là "có" / S5 đảo dấu | 11,1% → 0,4% / 0,0% → 0,0% | 11,1% → 0,4% / 0,0% → 0,0% | 11,1% → 0,4% / 0,0% → 0,0% | 12,5% → 0,6% / 0,0% → 0,0% | 11,1% → 0,4% / 0,0% → 0,0% | 11,1% → 0,4% / 0,0% → 0,0% |
| S6 / S7 nhiều / ít món-thẻ nhất | 0,0% → 0,0% / 0,0% → 0,0% | 0,0% → 0,0% / 0,0% → 0,0% | 0,0% → 0,0% / 0,0% → 0,0% | 0,0% → 0,0% / 0,0% → 0,0% | 0,0% → 0,0% / 0,0% → 0,0% | 0,0% → 0,0% / 0,0% → 0,0% |
| S8 đúng 1 món-thẻ | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% |
| S9 nhà lẻ tổ hợp | 16,7% → 1,7% | 16,7% → 1,7% | 16,7% → 1,7% | 16,7% → 1,7% | 16,7% → 1,7% | 16,7% → 1,7% |
| S10 món độc nhất / S11 ít trùng nhất | 11,1% → 0,4% / 0,0% → 0,0% | 11,1% → 0,4% / 0,0% → 0,0% | 11,1% → 0,4% / 0,0% → 0,0% | 12,5% → 0,6% / 12,5% → 0,6% | 11,1% → 0,4% / 7,4% → 0,1% | 11,1% → 0,4% / 7,4% → 0,1% |
| S8∩S9 (mẹo Codex vòng 5) / S15 = S2∩S9 | 33,3% → 19,0% / 33,3% → 19,0% | 33,3% → 19,0% / 33,3% → 19,0% | 33,3% → 19,0% / 33,3% → 19,0% | 33,3% → 19,0% / 33,3% → 19,0% | 33,3% → 19,0% / 33,3% → 19,0% | 33,3% → 19,0% / 33,3% → 19,0% |
| Không phủ định tệ nhất, S1–S15 (đơn + 198 phép giao) | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% |
| Mẹo Codex vòng 7 (có A, tổng tần suất nhỏ nhất) | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% |
| **S16 không phủ định tệ nhất (595)** | **33,3% → 19,0%** | **33,3% → 19,0%** | **33,3% → 19,0%** | **33,3% → 19,0%** | **33,3% → 19,0%** | **33,3% → 19,0%** |
| S16 không phủ định, không dùng thống kê món đệm | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% |
| **Cận Bayes "chỉ đọc thẻ có"** | **33,3% → 19,0%** | **33,3% → 19,0%** | **33,3% → 19,0%** | **33,3% → 19,0%** | **33,3% → 19,0%** | **33,3% → 19,0%** |
| S3 bỏ hết thẻ "có" (phủ định) | 25,0% → 7,4% | 25,0% → 7,4% | 25,0% → 7,4% | 33,3% → 19,0% | 25,0% → 7,4% | 25,0% → 7,4% |
| **S13 quên 1 thẻ, tệ nhất** | **50,0% → 56,9%** | **50,0% → 56,9%** | **50,0% → 56,9%** | **50,0% → 56,9%** | **50,0% → 56,9%** | **50,0% → 56,9%** |
| S13 quên 1 thẻ ngẫu nhiên | 41,7% → 36,5% | 41,7% → 36,5% | 41,7% → 36,5% | 44,4% → 43,2% | 41,7% → 36,5% | 41,7% → 36,5% |
| **S3∩S9 (suy luận một phần tệ nhất)** | **100,0% → 100,0%** | **100,0% → 100,0%** | **100,0% → 100,0%** | **100,0% → 100,0%** | **100,0% → 100,0%** | **100,0% → 100,0%** |
| S16 có phủ định tệ nhất (350) | 100,0% → 100,0% | 100,0% → 100,0% | 100,0% → 100,0% | 100,0% → 100,0% | 100,0% → 100,0% | 100,0% → 100,0% |
| Mù dấu (i) mẹo Codex vòng 6 | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% |
| Mù dấu (ii) món-thẻ ở nhiều nhà nhất / (iii) đồng xuất hiện | 33,3% → 19,0% / 33,3% → 19,0% | 33,3% → 19,0% / 33,3% → 19,0% | 33,3% → 19,0% / 33,3% → 19,0% | 33,3% → 19,0% / 33,3% → 19,0% | 33,3% → 19,0% / 33,3% → 19,0% | 33,3% → 19,0% / 33,3% → 19,0% |
| Mù dấu (iv) thẻ "có" ở vị trí 1 | 100,0% → 100,0% | 100,0% → 100,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% |
| Mù dấu (v) đổi vai trò, biết luật bộ sinh | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% | 33,3% → 19,0% |
| **Mù dấu tệ nhất trừ vị trí / kể cả vị trí** | **33,3% → 19,0% / 100,0% → 100,0%** | **33,3% → 19,0% / 100,0% → 100,0%** | **33,3% → 19,0% / 33,3% → 19,0%** | **33,3% → 19,0% / 33,3% → 19,0%** | **33,3% → 19,0% / 33,3% → 19,0%** | **33,3% → 19,0% / 33,3% → 19,0%** |
| **Cận Bayes mọi mẹo mù dấu** | **100,0% → 100,0%** | **100,0% → 100,0%** | **33,3% → 19,0%** | **33,3% → 19,0%** | **33,3% → 19,0%** | **33,3% → 19,0%** |
| Danh mục: R1–R11 ba vai trò, S16 ≤ 1/3, chặt (R12) | đạt | đạt | đạt | đạt | đạt | đạt |
| Danh mục / cấu trúc (tính cả dạng thẻ) | 1 / 1 | 1 / 1 | 1 / 3 | 3 / 9 | 3 / 9 | 3 / 9 |

**So với P1 (bản trước vòng 7, món đệm xếp ngẫu nhiên; `node table-x.cjs`, 6.000
bài mỗi bậc):**

| Bậc | P1: cấu hình | P1: mẹo Codex vòng 7 | P1: S16 không phủ định tệ nhất | P1: S16 không dùng thống kê món đệm | P1-X: cả ba cột |
|---|---|---|---|---|---|
| 1 | 8×2 PNN | 55,7% → 70,4% | 55,7% → 70,4% (mẹo Codex) | 55,7% → 70,4% | 33,3% → 19,0% |
| 2 | 8×2 PNN | 55,5% → 69,9% | 55,5% → 69,9% (mẹo Codex) | 55,5% → 69,9% | 33,3% → 19,0% |
| 3 | 8×2 độc lập | 55,4% → 69,7% | 55,4% → 69,7% (mẹo Codex) | 55,4% → 69,7% | 33,3% → 19,0% |
| 4 | 8×3 độc lập | 38,4% → 29,0% | 50,7% → 58,6% (có A, món đệm phổ biến nhất) | 47,1% → 49,8% | 33,3% → 19,0% |
| 5 | 9×3 trộn | 61,2% → 81,4% | 61,7% → 82,3% (có A, tổng bình phương tần suất nhỏ nhất) | 61,7% → 82,3% | 33,3% → 19,0% |
| 6 | 9×3 trộn | 61,5% → 81,9% | 61,9% → 82,6% (như bậc 5) | 61,9% → 82,6% | 33,3% → 19,0% |

`node measure-p1.cjs`: **100% bài P1 ở mọi bậc có ít nhất một mẹo không phủ định
của S16 vượt 1/3.** Mọi cột khác của P1 (mù dấu, S13, S3, S3∩S9, R11, 0 lỗi) như bản
trước (`table.cjs`, `exact.cjs`, `validate-sym.cjs` đọc `research/p1-design.md`).

Các số khác máy in ra:

- `node exact-x.cjs` (chính xác, không lấy mẫu): mọi dòng của danh mục đạt R1–R12
  với cả ba vai trò; định lý S13 "quên thẻ 'không có' = 1/2" đúng trên mọi cấu trúc ×
  dạng; S11 0% (9 × 2), 12,5% (bậc 4), 7,4% (bậc 5–6); R8 còn mở sau thẻ 1: 3 (bậc
  1–2), 3–6 (bậc 3), 3–5 (bậc 4), 3–6 (bậc 5–6); nhà nhiễu vi phạm đầu là "cấm" /
  "thiếu" 25% / 75% (bậc 1–2), 46% / 54% (bậc 3, 5–6), 52% / 48% (bậc 4), vi phạm hơn
  1 thẻ 38% (9 nhà), 43% (8 nhà); R7 PNN 6/1/1 (9 nhà), 5/1/1 (8 nhà), NPN 3/4/1,
  3/3/1, NNP 3/2/3, 3/2/2. Contract tính ngưỡng theo cách này nên không dao động theo
  seed. `CATSET=CAT5 node exact-x.cjs`: phương án P1-X′ (mục 15).
- `node table-x.cjs` (6.000 bài mỗi bậc, tên món thật): P1-X trùng bảng trên, cột
  mù dấu "kể cả vị trí" ở bậc 3–6 dao động 19,7–21,8% vì mẹo vị trí đúng 0 hoặc 1 mỗi
  bài; **0 lỗi R1–R9, 0 bàn trượt R11**; cấu trúc thấy 1 / 1 / 3 / 9 / 9 / 9 (cả danh
  mục).
- `node codex-cx.cjs`: phản ví dụ Codex vòng 7: vai trò A mẹo đúng 1,000, vai trò B,
  C 0,333; thư viện cũ 0,333 ở cả ba dạng; quỹ đạo đáp án vai trò A 1/3 nhà (không
  chặt); R12 loại.
- `node enum.cjs <cấu hình>`: bảng vét cạn ở mục 9; danh mục chặt vét được **khớp**
  `CLUE_STRUCTURES` (9 × 2, 8 × 3, 9 × 3 (3, 1, 0)). `node bayes-p.cjs <cấu hình>
  strict`: cận Bayes chỉ đọc thẻ có 33,3% mỗi bài với danh mục; `fam` (mọi cấu trúc
  đạt họ): 66,7% (9 × 2), 51,1% (9 × 3 (3, 1, 0)).
- `node taut.cjs`: danh sách viết lại lời giải của S16 (mục 9).
- `node naming-bias.cjs`: cận Bayes "chỉ đọc thẻ có" khi bé biết cả cách đặt tên.
  Đặt tên đều (đang dùng, `xgen.cjs`): 1/3 trên mọi góc nhìn, qua 19,0% mọi bậc. Rút
  tuần tự loại gần âm ngay khi chọn (bản trước): 33,9 / 34,1 / 36,2 / 34,5% mỗi bài
  (bậc 1–2 / 3 / 4 / 5–6) → qua 20,0 / 20,4 / 24,4 / 21,1% (mục 9 "Đặt tên đều").
- `node boards-x.cjs 7`: hai bàn mẫu mục 11, đã qua R1–R12, S1–S16, thư viện mù dấu.
- `node accept-leak.cjs`, `node round-leak.cjs`: điều kiện kín 2 và 4 (mục 9).
- P1 (`table.cjs`, `exact.cjs`, `validate-sym.cjs`, `boards.cjs`, đọc
  `research/p1-design.md`): in lại đúng số bản trước. `sym.cjs` đã sửa cho khớp chữ
  của bộ sinh P1: trượt 40 lần xếp món đệm thì rút lại khuôn và món đệm (≤ 10 lần)
  rồi báo lỗi, thay vì trả bản tốt nhất (Codex vòng 7, mục 1.3). Trên 120.000 bài
  nhánh dự phòng chưa lần nào chạy (tối đa 18 lần xếp), nên số đo P1 giống từng byte;
  riêng `sym-catalog.cjs` (dò cả khuôn không xếp được, vd 7×2) bật chế độ `lenient`
  giữ hành vi cũ.
- Lịch sử (bộ sinh M, `research/legacy/`): `legacy/table.cjs` in lại bảng §10 bản
  2026-10-20 giống từng byte (seed 1000 và 2000); `legacy/exact-m.cjs` đọc bảng 18
  khuôn đã làm tròn (lưu ở `legacy/m-templates.md`): S13 tệ nhất bậc 5–6 33,1%, S3
  31,0%, S3∩S9 99,5%, S2∩S9 18,9%; `legacy/validate.cjs`: 66.000 bài, 0 lỗi R1–R5 +
  R9.

**Định lý S13 (vì sao quên một thẻ "không có" luôn đúng 1/2).** Gọi p là vị trí
thẻ "có", q và r là hai thẻ "không có". Khuôn đối xứng có đúng 1 nhà e_p (đáp án),
c nhà mỗi chữ ký hai món, d nhà `111`.

1. Nếu c ≥ 2 thì không chữ ký hai món nào duy nhất, nên S2∩S9 (có món thẻ "có",
   rồi chọn nhà lẻ tổ hợp) ⊆ {đáp án, nhà `111`}: đúng ≥ 1/2, trượt R6b. Vậy c = 1.
2. Với c = 1, quên thẻ q (dùng thẻ "có" và thẻ r) còn đúng hai nhà: e_p và
   e_p + e_q. Bé chọn đều nên đúng 1/2 trên **mọi** bài, mọi K, mọi m, mọi dạng.
   Qua bậc = 1 − (1 − 22/64)² = 56,9%.

Vậy với khuôn đối xứng, "chặn mọi mẹo không phủ định ở 1/3" kéo theo "quên một thẻ
'không có' đúng 1/2"; không chọn khuôn đối xứng nào tránh được. Quên thẻ "có" chỉ
còn S3 = 1/(a + 1); quên ngẫu nhiên = (1/(a + 1) + 1/2 + 1/2) / 3 (36,5% ở a = 3,
43,2% ở a = 2). Tính hoán đổi được (R12) không đổi khuôn, nên định lý giữ nguyên.

**So với P1 và bộ sinh M (cái giá và cái được):**

| | T-Lai, bộ sinh M | P1 (trước vòng 7) | P1-X (đang chọn) |
|---|---|---|---|
| Không phủ định tệ nhất, S1–S15 | 19,0% | 19,0% | 19,0% |
| Mẹo chỉ đọc thẻ "có" (họ S16), tệ nhất | chưa đo | 58,6–82,6% | 19,0% |
| Cận Bayes "chỉ đọc thẻ có" | chưa đo | không chặn | 19,0% |
| Mẹo mù dấu và cận Bayes, bậc 3–6 | 100% | 19,0% | 19,0% |
| S13 tệ nhất | 56,9% (bậc 1–4), 33,1% (bậc 5–6) | 56,9% | 56,9% |
| S13 ngẫu nhiên | 32,4% (bậc 5–6) | 43,2% / 39,8% (bậc 5–6) | 36,5% / 43,2% (bậc 4) |
| S3 bỏ thẻ "có" | 31,0% (bậc 5–6) | 19,0% / 12,4% (bậc 5–6) | 7,4% / 19,0% (bậc 4) |
| S3∩S9 | 100% / 99,5% | 100% | 100% |
| Đoán bừa | 1,0% (bậc 1–4) | 0,6% / 0,4% (bậc 5–6) | 0,4% / 0,6% (bậc 4) |
| Nhà × món, bậc 1–6 | 7×2 ×3, 7×3, 9×3 ×2 | 8×2 ×3, 8×3, 9×3 ×2 | 9×2 ×3, 8×3, 9×3 ×2 |
| Hình trên màn | 17 / 17 / 17 / 24 / 30 / 30 | 19 / 19 / 19 / 27 / 30 / 30 | 21 / 21 / 21 / 27 / 30 / 30 |
| Cấu trúc bậc 1–6 (thấy trên 6.000 bài) | 6 / 6 / 18 / 4.172 / 5.372 / 5.342 | 3 / 3 / 9 / 5.604 / 5.845 / 5.865 | **1 / 1 / 3 / 9 / 9 / 9** (cả danh mục) |
| Bộ sinh | 18 khuôn theo dạng thẻ | 3 khuôn + xếp món đệm ngẫu nhiên | 7 cấu trúc cố định, chỉ đặt tên |

Số M lấy từ `legacy/exact-m.cjs` và dòng T-Lai của `sym-table.cjs`; số P1 từ
`table-x.cjs`, `table.cjs`; M chưa đo với S16.

**Đọc bảng:**

- **Mọi chiến lược không dùng phủ định trong S1–S15 và S16, kể cả mọi mẹo ghép và
  mẹo Codex vòng 7, ≤ 1/3 mỗi bài → qua bậc ≤ 19,0% ở cả 6 bậc;** đoán bừa ≤ 0,6%.
  S12 bằng đúng đoán bừa vì vị trí đáp án rút đều theo seed.
- **Chỉ đọc thẻ "có" thì không qua bậc:** cận Bayes "chỉ đọc thẻ có" 1/3 mỗi bài →
  19,0% ở mọi bậc. Con số này chặn cả mẹo chưa ai nghĩ ra và cả bé đã học thuộc danh
  mục, không chỉ thư viện hữu hạn, với điều kiện năm điều kiện kín ở mục 9 đúng
  (contract kiểm).
- **Không đọc dấu thì không qua bậc từ bậc 3:** mọi mẹo mù dấu, kể cả cận Bayes, ≤ 1/3
  mỗi bài → 19,0%.
- **Chỗ hở công khai:** S13 quên một thẻ "không có" 56,9% ở mọi bậc (định lý); S3
  "bỏ thẻ có" 7,4% (9 nhà), 19,0% (bậc 4); S3∩S9 100%. Cả ba đều dùng đúng nghĩa phủ
  định của ít nhất một thẻ (suy luận một phần thật). Câu thần chú "đúng với cả ba
  thẻ" và diễn lại có lời sau lần nhầm là hai cách chính để kéo chỗ hở này xuống.
- **Viết lại lời giải không bị chặn, và không cần chặn:** bé biết món nào nằm trên
  thẻ thì "có món thẻ có, ít món-thẻ nhất" (S2∩S8 của thư viện, "có món thẻ có ∩
  S7" của S16) chính là lời giải; muốn dùng nó bé vẫn phải coi hai món kia là món
  phải tránh.
- "Cần đủ thẻ để xác định duy nhất" (R2) không chứng nhận bé đã dùng đủ thẻ.
- Mô hình giả định bé nhìn đúng mọi món; mẹo "nhà lạ" (S9) đòi so tập món-thẻ giữa
  8–9 nhà, chưa có bằng chứng bé 4–6 tuổi thấy nó dễ hơn tự giải. Buổi thử giấy và
  playtest kiểm giả định này, kể cả bàn "mọi món đúng 3 nhà" của bậc 4–6.

**Giới hạn cấu trúc** (vét cạn mọi khuôn thoả R1–R5, có chứng minh ngắn trong
`clue-sim-compare.md` §2, `clue-sim-leak.md` §3 và `clue-sim-symmetric.md` §1):

1. **Bài 2 thẻ PN, K = 4..7:** luôn có mẹo không phủ định đúng ≥ 1/2 (qua 56,9%).
   Ở 4 nhà S2 và S8 đều 1/2; từ 5 nhà, nhà nào bị S2 loại thì S8∩S9 vẫn ≥ 1/2.
   Bàn 4×2 PN chỉ có 1 khuôn, 1 cấu trúc.
2. **Bài 3 thẻ ở 5×2:** chỉ 2 khuôn, cả hai có S8 = 1/2 (qua 56,9%). 6×2 có 8
   khuôn nhưng chỉ 1 khuôn giữ mọi mẹo không phủ định ≤ 1/3, và khuôn đó có S3 = 1/2
   (qua 56,9%; 3 cấu trúc). Vì vậy bài 3 thẻ cần ≥ 7 nhà để giữ cả S3 ≤ 1/3 (khuôn
   bất kỳ; khuôn đối xứng dấu cần ≥ 8 nhà, mục 7 dưới; thêm tính hoán đổi được thì
   m = 2 cần 9 nhà, mục 8 dưới).
3. **T2 – dạng 2 thẻ "có"** (PPN/PNP/NPP): nhà có cả hai món thẻ "có" chỉ mang
   chữ ký đáp án hoặc `111`. Một nhà `111` thì S2 = 1/2; ≥ 2 nhà `111` thì S2∩S9
   chỉ còn đáp án (100%). Bậc trộn 6 thứ tự qua ≥ 25,7% (7–9 nhà), 35,9% (6×3).
4. **Quên-1-thẻ ≤ 1/3 và mọi mẹo không phủ định ≤ 1/3 loại trừ nhau (T4):** muốn
   quên thẻ j chỉ đúng ≤ 1/3 thì phải có ≥ 2 nhà mang chữ ký "đáp án đổi đúng bit
   j"; khi mọi nhà "gần đúng" đều có từ 2 bản, S2∩S9 chỉ còn {đáp án, nhà `111`}
   nên ≥ 1/2 (min đo được 0,500 ở K = 8, 9, 10). Cho phép khuôn và trọng số riêng
   theo dạng thẻ, giữ mọi mẹo không phủ định ≤ 1/3 thì S13 thấp nhất (`node
   gate-explore.cjs`): 8 nhà **41,8%**, 9 nhà **32,9%**, 10 nhà **26,3%**; bộ sinh M
   đi đường này và lộ dấu (mẹo mù dấu 100%). Khuôn đối xứng: S13 đúng 56,9% (định lý
   trên); khuôn đóng vai trò: xem mục 7 dưới.
5. **T1 – dạng 1 có + 2 không:** S3 ≤ 1/3 kéo theo S3∩S9 = 100% (8×2, 8×3, 9×3):
   S3 chỉ chứa hai loại chữ ký (đáp án và `000`) mà `000` phải lặp.
6. **T3 – mọi cặp thẻ:** (dùng hai thẻ đó)∩S9 luôn ≥ 1/2, và bằng 1 khi riêng cặp
   đó ≤ 1/3.
7. **Khuôn đối xứng ở 7 nhà không đạt** (`sym-catalog.cjs`): 7×2 (1, 1, 0) không
   xếp được món đệm giữ mọi mẹo ghép ≤ 1/3 cho cả ba vai trò (thử 40 lần, trượt
   100%) và có S3 = 1/2; 7×3 (1, 1, 0) có S3 = 1/2 (trượt R6). Vì vậy P1 dùng 8 nhà
   ở bậc 1–4. Hướng nới "khuôn đóng vai trò" (không đối xứng, cùng trọng số ba dạng;
   mù dấu vẫn ≤ 1/3): 9×3 hạ S13 xuống 46,1% nhưng S3 lên 44,3%; 10×3 S13 39,7%, S3
   37,4% nhưng vỡ lưới 3 × 3 (`RC=1 node sym-catalog.cjs`, `node sym-table.cjs 1000
   RC9,RC10`). Không dùng.
8. **Tính hoán đổi được (vòng 7, `enum.cjs`, mục 9):** giữ R5 thì 8 × 2 (2, 1, 0) và
   9 × 3 (2, 1, 1) không có cấu trúc nào đạt họ S16 (chứng minh ngắn ở mục 9); 9 × 2
   (3, 1, 0) có đúng 1 cấu trúc chặt (K4 ∪ K3); 8 × 3 (2, 1, 0) chỉ có cấu hình
   Möbius–Kantor (3 cách đặt thẻ); 9 × 3 (3, 1, 0) có 3 cấu trúc chặt trong 45 cấu trúc
   đạt họ. Vì vậy P1-X dùng 9 nhà ở bậc 1–3 và chỉ khuôn (3, 1, 0) ở bậc 5–6.

**Số bài phân biệt** (chuẩn hoá ở mục 9; danh mục `CLUE_STRUCTURES`, cấu trúc tính
cả dạng thẻ; `table-x.cjs` thấy đủ cả danh mục trên 6.000 bài mỗi bậc):

| Bậc | Danh mục | Cấu trúc (× dạng thẻ) | Bài cụ thể (cận dưới) |
|---|---|---|---|
| 1, 2 | 1 | 1 | ≥ 1 × 2.112 = 2.112 |
| 3 | 1 | 3 | ≥ 3 × 2.112 = 6.336 |
| 4 | 3 | 9 | ≥ 9 × 2.112 = 19.008 |
| 5, 6 | 3 | 9 | ≥ 9 × 2.112 = 19.008 |

2.112 = số bộ ba món-thẻ có thứ tự từ pool 14 (14 × 13 × 12 = 2.184) bỏ 72 bộ chứa
cặp gần âm chú cá / hộp quà; mỗi bộ ba trên một cấu trúc là một bài cụ thể khác,
chưa tính đổi tên món đệm (mỗi bộ ba còn hàng trăm cách đặt tên D, E, …). ≥ 200 bài
mỗi bậc và cả game (BRD §8.4) đạt ở mức bài cụ thể. Ở mức cấu trúc, mọi bậc đều ít
(1 / 1 / 3 / 9 / 9 / 9): đó là cái giá của tính hoán đổi được (mục 5, mục 9), và
câu hỏi (b) ở mục 15.

## 11. Bố cục 375×667 và 360×640

Đo theo vùng thật (`layout.ts` thuần, kiểu `balanceScale/layout.ts`), không theo
thiết bị. Từ trên xuống: dải lời Đô Đô (mascot 30 + chữ, 2 dòng) → hàng 3 thẻ gợi
ý → lưới nhà. 9 nhà (bậc 1–3, 5–6) xếp **3–3–3**, 8 nhà (bậc 4) xếp **3–2–3**
(hàng giữa 2 nhà, so le vào giữa); luôn 3 hàng × tối đa 3 cột, nên lưới 9 nhà cao
đúng bằng lưới 8 nhà và lưới 7 nhà (2–3–2) của các bản trước: mọi số đo chiều cao
dưới đây không đổi khi bậc 1–3 lên 9 nhà. Chiều ngang khả dụng = màn − 40 (gutter
như Cân). Nhà = mái + cửa sổ; "khép cửa" là cửa chớp đóng lên cửa sổ. Cửa sổ 1 × 2
khi m = 2; 2 × 2 khi m = 3 (ô thứ tư trống, thứ tự món xáo theo seed nên vị trí
trong cửa sổ không mang nghĩa). Thứ tự ô (`houses` theo thứ tự hiển thị): 9 nhà:
hàng trên ô 1–3, hàng giữa ô 4–6, hàng dưới ô 7–9; 8 nhà: hàng trên ô 1–3, hàng
giữa ô 4–5, hàng dưới ô 6–8.

**Luật co:**

- Hệ số co `fit = min(1, chiều cao đo được / chiều cao cần)` áp cho cả cụm (thẻ,
  nhà, emoji, khe); **sàn emoji ≥ 22 pt**.
- Dải lời **2 dòng** (chữ 14–15, co chữ tối đa 0,75). Nếu giữ dải lời mà emoji
  trong nhà < 26 pt thì **bỏ dải lời** trên màn đó (tiền lệ Cân bỏ dải lời khi
  bảng thấp, `balanceScale/layout.ts`), rồi tính lại. Bỏ dải lời không mất dữ kiện:
  thẻ hình, đèn soi, phản hồi hình và lời Đô Đô vẫn đủ (game chỉ hiện khi pack v8
  có trong bundle, mục 13).
- Khe giữa nhà: cột 12 pt, hàng 8 pt (**≥ 8 pt**), vì chạm trượt sang nhà bên là
  mất "đúng ngay lần đầu".
- iPad: phóng theo vùng đo, tối đa 1,35 lần (như Cân).

| pt | 375×667, m = 2 (bậc 1–3) | 375×667, m = 3 (bậc 4–6) | 360×640, m = 2 | 360×640, m = 3 |
|---|---|---|---|---|
| Vùng bàn chơi (trừ top bar 72, vùng phản hồi 90, inset 20/0 hoặc 24/48, lề trong 2 × 8) | 469 | 469 | 390 | 390 |
| Dải lời 2 dòng + khoảng 8 | 52 | 52 | 52 | **bỏ** (giữ thì emoji chỉ 22) |
| Hàng thẻ + khoảng 8 | 64 + 8 | 64 + 8 | 56 + 8 | 56 + 8 |
| Còn cho lưới | 345 | 345 | 274 | 326 |
| Nhà (rộng × cao) | 103 × 74 | 103 × 108 | 98 × 70 | 98 × 102 |
| Cửa sổ, ô, emoji | 1 × 2, ô 42, emoji 34 | 2 × 2, ô 38, emoji 30 | 1 × 2, ô 40, emoji 32 | 2 × 2, ô 36, emoji 29 |
| Lưới 3 hàng (khe hàng 8) | 238 | 340 | 226 | 322 |
| Dư (chiều cao) | 107 | 5 | 48 | 4 |
| Bề ngang hàng 3 nhà (3 nhà + 2 khe cột 12) / khả dụng (màn − 40) | 333 / 335 | 333 / 335 | 318 / 320 | 318 / 320 |

- Bàn dày nhất là **bậc 5–6: 9 × 3 = 27 món + 3 thẻ**, ở 360×640 bỏ dải lời, dư
  4 pt: đây là rủi ro đọc món (mục 15). Buổi thử giấy in đúng cỡ này. Bậc 4 (8 × 3,
  24 món + 3 thẻ) dùng đúng số đo cột m = 3 (cùng 3 hàng). Bậc 1–3 (9 × 2, 18 món
  + 3 thẻ) dùng cột m = 2: thêm một nhà ở hàng giữa không đổi chiều cao.
- Bề ngang: hàng 3 nhà (cả 8 lẫn 9 nhà) dư 2 pt ở cả hai màn; hàng giữa 2 nhà của
  lưới 8 nhà rộng 218 / 208 pt, căn giữa.
- Top bar (minHeight 72) và vùng phản hồi (minHeight 90) giãn khi tăng cỡ chữ hệ
  thống, nên contract đo cả ở cỡ chữ 1,3.
- **Contract bố cục** (tasks 2.7): ở 375×667 và 360×640, cỡ chữ 1,0 và 1,3: lưới
  vừa không cuộn (cả chiều cao lẫn bề ngang hàng 3 nhà, lưới 3–3–3 với m = 2 và
  m = 3, lưới 3–2–3 với m = 3);
  emoji ≥ 22 pt; khe giữa nhà ≥ 8 pt; vùng chạm mỗi nhà ≥ 88 × 64 pt; hàng thẻ
  vừa một hàng; **số dòng** các câu dài nhất trên dải lời
  (`clue_hint_2` 53 ký tự, `clue_sign_not` 53, `clue_mantra` 50, gợi ý dài nhất
  "Nhà Đô Đô không có cây xương rồng đâu." 38) ≤ 2 ở mọi cỡ còn dải lời; cỡ nào
  không vừa thì layout phải bỏ dải lời ở cỡ đó.

**Hai màn mock để owner duyệt (task 0.1)** (bàn in bằng `node boards-x.cjs 7`; ★ =
đáp án, [bit] = chữ ký theo thứ tự thẻ, chỉ để đối chiếu, không vẽ lên màn):

1. **Bậc 1 "Đèn soi", 9 × 2 dạng PNN, cấu trúc K4 ∪ K3**, vẽ ở cả 375×667 và
   360×640, lúc Đô Đô đang đọc thẻ thứ hai ("Nhà Đô Đô không có cây nấm đâu."): thẻ
   "có quả chuối" và hai thẻ "không có" kiểu A; ký hiệu biển cấm phủ lên cây nấm ở
   các nhà có nấm (không lóe); chữ trên dải lời. Thẻ: CÓ quả chuối · KHÔNG CÓ cây
   nấm · KHÔNG CÓ hộp quà. Nhà (lưới 3–3–3, ô 1 → 9):
   - ô 1: cây nấm + hộp quà [011]
   - ô 2: chiếc ô tô + chú mèo [000]
   - ô 3: cây nấm + quả chuối [110]
   - ô 4: cánh diều + cây nấm [010]
   - ô 5: hộp quà + cánh diều [001]
   - ô 6: quả chuối + hộp quà [101]
   - ô 7: cây xương rồng + chiếc ô tô [000]
   - ô 8: chú mèo + cây xương rồng [000]
   - ô 9: ★ cánh diều + quả chuối [100]

   Cánh diều là món đội lốt D (cùng quả chuối, cây nấm, hộp quà có ở đúng 3 nhà);
   chiếc ô tô, cây xương rồng, chú mèo (tam giác K3) mỗi món 2 nhà. Kiểm
   (`boards-x.cjs`): R1–R9 đạt (không có chú cá); bỏ thẻ 1 / 2 / 3 còn 4 / 2 / 2 nhà;
   diễn lại khép 6 / 1 / 1; mọi mẹo không phủ định (S1–S15 và cả họ S16) 1/3, mẹo
   Codex vòng 7 1/3; S13 1/2; S3 1/4; S3∩S9 1; mù dấu 1/3 trừ "thẻ đầu là thẻ có" (= 1,
   giàn đỡ bậc 1–2); quỹ đạo đáp án dưới nhóm giữ món thẻ "có" 3 / 3 / 3 nhà (chặt,
   R12); đổi vai trò cùng bàn: PNN → ô 9, NPN → ô 4, NNP → ô 5 (R11).
2. **Bậc 6 "Nhớ thẻ", 9 × 3 dạng NPN, cấu hình Pappus 9₃, ở 360×640** (không dải
   lời), ngay sau một lần chạm nhầm loại "thiếu món": thẻ 1 và thẻ 3 úp (chấm thứ
   tự), thẻ 2 (thẻ "có") lật ngửa nhấp nháy, bóng mờ viền đứt của cánh diều trên mái
   nhà nhầm, nhà đó đang khép cửa. Thẻ: KHÔNG CÓ chú ếch · CÓ cánh diều · KHÔNG CÓ
   chú chó. Nhà (lưới 3–3–3, ô 1 → 9):
   - ô 1: cánh diều + hộp quà + chú chó [011]
   - ô 2: chiếc ô tô + hộp quà + bông hoa [000] ← chạm nhầm
   - ô 3: chú ếch + cánh diều + chiếc ô tô [110]
   - ô 4: ★ quả táo + chú mèo + cánh diều [010]
   - ô 5: chú mèo + bông hoa + chú chó [001]
   - ô 6: chú chim + chú chó + chú ếch [101]
   - ô 7: hộp quà + chú chim + quả táo [000]
   - ô 8: chiếc ô tô + chú chim + chú mèo [000]
   - ô 9: quả táo + bông hoa + chú ếch [100]

   Bé vừa chạm nhầm ô 2 "chiếc ô tô + hộp quà + bông hoa" (đúng thẻ 1 và thẻ 3, thiếu
   cánh diều ở thẻ 2); lời: "Nhà Đô Đô có cánh diều." rồi "Nhà này chưa có cánh
   diều.". Kiểm (`boards-x.cjs`): R1–R9 đạt (có hộp quà, không có chú cá); mọi món
   trên bàn có ở đúng 3 nhà; bỏ thẻ còn 2 / 4 / 2 nhà; diễn lại khép 3 / 4 / 1; mọi
   mẹo không phủ định (S1–S15 và cả họ S16) 1/3; S13 1/2; S3 1/4; S3∩S9 1; mọi mẹo
   mù dấu 1/3 (từ bậc 3 dạng rút đều nên mẹo vị trí cũng 1/3 khi tính trên ba vai
   trò); quỹ đạo đáp án 3 / 3 / 3 nhà (chặt, R12); đổi vai trò cùng bàn: PNN → ô 9,
   NPN → ô 4, NNP → ô 5 (R11).

Cả hai bàn mẫu dùng làm bàn thật ở bước 5 của buổi thử giấy (mục 4).

## 12. Audio (pack v8)

Một batch, giọng VieNeu `dodo-clone2`, **temperature 0.7** (pipeline `.env` đang
1.2 cho lesson: phải chạy `VIENEU_TEMPERATURE=0.7`, run từ chối nếu khác), câu
liền như pack v5–v7. Xưng "Đô Đô", gọi "bé", câu ngắn (≤ 13 từ; câu giới thiệu
bậc ≤ 15 như các game khác), không có chữ "sai", "khớp", "con". Không TTS lúc chơi.
⚠ = câu có chữ "không".

**Câu liền theo món** (`promptLines.ts`, domain = 14 món của `CLUE_ITEMS`; khoá
`explore-audio:vi:line:<templateId>:<món>:v1`, kèm clip ghép dự phòng):

| templateId | Câu (ví dụ "chú mèo") | Số câu |
|---|---|---|
| `clue_has` | Nhà Đô Đô có chú mèo. | 14 |
| `clue_not` ⚠ | Nhà Đô Đô không có chú mèo đâu. | 14 |
| `clue_fb_extra` | Nhà này lại có chú mèo. | 14 |
| `clue_fb_missing` | Nhà này chưa có chú mèo. | 14 |

"đâu" cuối câu là dấu phủ định thứ hai, đỡ cho bé nghe sót chữ "không". Câu theo
món làm thành line (không phải phrase) vì chỉ line qua bước kiểm tốc độ đọc
`exploreLineQc.ts`. Phản hồi nhầm dùng lại `clue_has` / `clue_not` làm câu luật
(mục 8).

**Câu cố định** (`PROMPT_PHRASES`, tiền tố `clue_`):

| id | Câu |
|---|---|
| `game_clue_detective` | Thám tử Đô Đô (đổi trước khi gen nếu owner chọn tên khác, câu hỏi (c)) |
| `clue_ask` | Đô Đô đố bé: nhà Đô Đô là nhà nào? |
| `clue_mantra` | Bé soi từng thẻ một. Nhà Đô Đô đúng với cả ba thẻ. |
| `clue_found` | Còn lại nhà này! Đây là nhà Đô Đô. |
| `clue_sign_has` | Thẻ xanh nghĩa là nhà Đô Đô có món này. |
| `clue_sign_not` ⚠ | Thẻ có vạch chéo nghĩa là nhà Đô Đô không có món này. |
| `clue_hint_1` | Bé chạm vào thẻ để nghe lại gợi ý nhé. |
| `clue_hint_2` | Đô Đô đóng cửa giúp bé các nhà chưa đúng thẻ đầu nhé. |
| `clue_intro_2..6` | 5 câu ở mục 5 |

**Clip ghép dự phòng cho line:** 5 mảnh câu ("Nhà Đô Đô có", "Nhà Đô Đô không
có" ⚠, "đâu.", "Nhà này lại có", "Nhà này chưa có") + 14 nhãn `clue-*` trong
`PROMPT_LABELS` (7 nhãn cùng chữ với clip đã duyệt nên pipeline dùng lại, chỉ tổng
hợp mới 7; kiểm lại lúc gen).

**Dùng lại, không gen:** `fb_praise_1..4`, `fb_level_next`, `fb_level_again`,
`fb_run_complete`, `fb_play_again`, `fb_break`. (`fb_play_again` "Bé muốn chơi lại
không?" có chữ "không" nghi vấn, là câu dùng chung nói khi đã hết lượt, ngoài luật
`clue_*`.)

**Tổng theo T-Lai:** 56 line + 13 câu cố định + 5 mảnh + 14 nhãn = **88 khoá mới,
81 lần tổng hợp** (bỏ phần ghép dự phòng: 69). So với bản trước: bỏ câu giới
thiệu dạng hai thẻ "có", câu phản hồi theo món không còn chữ "không", mảnh ghép 7
→ 5. Pack **`explore-audio-vi-v8`** gộp luôn câu mới của Ô thiếu
`missing_cell_solve` ("Nhìn hàng, nhìn cột, ghép đủ hai điều.", mobile `f579d30`
nhánh `fix/explore-missing-cell-leak`, chưa gen clip) theo luật một đợt một pack
(BRD §9): **89 khoá mới, 82 lần tổng hợp**, pack ≈ 486 + 89 = 575 clip. Nếu owner
duyệt câu giới thiệu bậc của 4 game đang chờ (leveled-rounds task 4.1) trước khi
chạy batch thì gộp vào v8, không thì thành v9.

**Human Gate cho câu có chữ "không" (bắt buộc, không duyệt gộp):**

- **16 clip ⚠**: 14 `clue_not` + `clue_sign_not` + mảnh "Nhà Đô Đô không có".
  Owner **tự nghe riêng từng clip** có chữ "không"; checklist có dòng "số chữ
  'không' nghe được bằng số chữ 'không' trong câu". Pack v6 từng được "duyệt hết
  không nghe"; với game này cách đó **không được phép** cho clip ⚠ vì chữ "không"
  là toàn bộ dữ kiện.
- Nghe thêm: 14 `clue_has` (TTS không tự chèn "không"), 14 `clue_fb_missing`
  ("chưa có" không bị đọc thành "không có"), nghe liền các câu chim / cá / chó /
  rùa / bướm để bắt gần âm, và chuỗi clip ghép dự phòng ("Nhà Đô Đô không có" +
  nhãn + "đâu.").
- **Quy trình reject → sinh lại một khoá** (thay cho "gen 3 take" của bản trước,
  vì pipeline giữ một clip mỗi transcript): owner reject clip nghe chưa rõ →
  lần `generate` sau sinh lại đúng khoá đó → nghe lại, lặp tới khi đạt. Câu liền
  bị reject đã được pipeline sinh lại take mới; clip inventory (`clue_sign_not`, các
  mảnh) hiện "dùng lại cái đã có" nên cần lệnh sinh lại đúng một khoá (tasks 6.1).
  **Không dùng `--force`** (sinh lại cả ~486 clip và đưa cả pack về
  `pending_review`).
- Không có ASR; QC tốc độ (`exploreLineQc.ts`) không thay việc nghe rõ chữ
  "không".
- **Thời gian nghe thực tế 10–15 phút** (~60 clip cần nghe kỹ + các vòng sinh lại).

**Thiếu clip:** im lặng như mọi game Khám phá; thẻ hình, đèn soi, làm mẫu bằng
hình và phản hồi hình vẫn đủ để chơi. Bậc 6: thẻ thiếu clip luôn ngửa (mục 5).

## 13. Đăng ký, catalog, server, docs

- **Ba danh sách `EXPLORE_GAME_CODES`** (`docs/kido-explore-contract.ts`,
  `mobile/src/types/explore.ts`, kido-server `explore.types.ts`): thêm
  `clue_detective` **ở cuối** (13 mã; contract Xe buýt bắt `number_bus` đứng ngay
  sau `number_chain`).
- **Catalog 12 → 13 thẻ** (owner đồng ý 2026-10-20). Tên "Thám tử Đô Đô" (câu hỏi
  (c)), mô tả "Nghe gợi ý, tìm đúng nhà của Đô Đô". `GAME_COPY` đặt sau
  `missing_cell`; nhóm catalog **"Quy luật"** (đề xuất giữ tên nhóm; sau
  `pattern_finder`, `missing_cell`). Thumbnail: dùng `EXPLORE_FALLBACK_ICONS`
  `house` (có sẵn ở `Icon.tsx`) tới khi có PNG clay.
- `masteryCriteria.ts`, 6 câu "khi nào bé vững":
  1. Bé nghe ba gợi ý (thẻ xanh đứng đầu, hai thẻ vạch chéo) và chọn đúng nhà khi
     món được soi.
  2. Bé tự soi món trong từng nhà, không cần đèn soi.
  3. Thẻ xanh ở chỗ nào, bé vẫn chọn đúng nhà.
  4. Mỗi nhà có ba món, bé vẫn soi đủ ba thẻ và chọn đúng.
  5. Bàn chín nhà, mỗi nhà ba món, bé vẫn chọn đúng nhà Đô Đô.
  6. Thẻ úp, bé nhớ hoặc tự chạm lật để nghe lại rồi chọn đúng.
- **Chỉ hiện khi pack v8 có trong bundle.** Thiếu pack thì bậc 6 thẻ úp vô nghĩa
  (thẻ thiếu clip luôn ngửa) và câu dạy ký hiệu im. Code merge trước với bundled
  `catalogVisible: false`; bật hiển thị trong cùng commit export pack v8 vào app.
  Không dùng `pendingGame` (hiện thẻ "Sắp ra mắt"). Không thêm audio pack vào
  `dependencyManifest`.
- **Server mirror đúng cờ bundled ở mọi commit:** `explore.contract-codes.spec.ts`
  so từng trường với bundled mobile, kể cả `catalogVisible`; còn
  `bundledLocalDefinition` (server) đang cố định `catalogVisible: true`. Vì vậy:
  commit server Thám tử làm TRƯỚC khi bật hiển thị (bước 3) phải thêm trường tuỳ
  chọn `catalogVisible` vào `BundledLocalGameSpec` và đặt `false`; khi mobile bật
  hiển thị (tasks 7.3) thì đổi server sang hiện trong cùng đợt, trước khi push.
  Ngoại lệ duy nhất là kill switch (bước 7): server ẩn chặt hơn bundled, kèm ngoại
  lệ có tên trong spec.
  Push server một lần **sau** tasks 7.3, nên lần deploy duy nhất mang cờ hiện. Nếu
  owner cho deploy server lúc mã còn ẩn thì phải có lần deploy thứ hai để bật (hiển
  thị là AND, server ẩn thì app không hiện).
- **Hiển thị hiệu lực** = bundled AND server (fail-closed). App bỏ qua mã chỉ có
  trên server (`registry.ts`); khi server chưa có mã thì app dùng bản bundled.
- **Thứ tự merge / deploy (cứng):**
  1. Merge nhánh Ô thiếu vào `main` **trước**: mobile `f579d30` và server
     `54b73d2` (cùng nhánh `fix/explore-missing-cell-leak`). Mobile sửa
     `missingCellGame.ts`, `promptAudio.ts` (`missing_cell_solve`),
     `MissingCellRenderer.tsx`, contract Ô thiếu; server sửa `explore.registry.ts`
     (thêm `BundledLocalGameSpec.version`, `missing_cell` v2) và
     `explore.missing-cell.spec.ts`. Chạy lại `test:explore-missing-cell` và test
     server sau merge. Change này không sửa `missingCellGame.ts` hay contract riêng
     của Ô thiếu.
  2. Commit mobile Thám tử (`catalogVisible: false`).
  3. Commit server Thám tử, rebase lên trường `version` mới: union
     `explore.types.ts` + `PUBLIC_GAMES` + `BUNDLED_LOCAL_GAMES` + spec đếm 13 trong
     **cùng một commit**, `catalogVisible` mirror bundled (ở trên). Guard
     `explore.registry.ts:558` (dòng trên `main` hiện tại; ~566 sau khi merge Ô
     thiếu) ném lỗi lúc khởi động khi `PUBLIC_GAMES.length !==
     EXPLORE_GAME_CODES.length` hoặc thiếu definition.
  4. Server `npm test` + `npm run build` với working tree mobile đã có cả
     missing-cell-v2 lẫn Thám tử (`explore.contract-codes.spec.ts` import mobile);
     ghi lại SHA docs/mobile/server đã kiểm, push đúng các SHA đó.
  5. Push server **chỉ khi owner cho phép**, sau tasks 7.3, gộp Ô thiếu + Thám tử
     trong **một lần deploy** (push `main` = deploy; workflow không có bước test
     trước deploy).
  6. **Smoke test** sau deploy: server khởi động (health), catalog Khám phá trả 13
     mã, `missing_cell` ở v2, `clue_detective` có trong catalog với đúng cờ hiển
     thị; app bản đang chạy vẫn mở catalog bình thường.
  7. **Rollback** (Codex vòng 6 mục 1.9: revert mã server KHÔNG ẩn game). Số dòng
     dưới đây là trên `main` hiện tại (2026-10-21); file server lệch vài dòng sau khi
     merge Ô thiếu. Tách hai việc, kèm một giới hạn:
     - **Server hỏng** (health đỏ, catalog lỗi, server không khởi động): `git
       revert` commit server Thám tử (và commit Ô thiếu nếu lỗi do nó) rồi push =
       một lần deploy tiến, không quay về bản deploy cũ (không đụng phần consent).
       Việc này chỉ sửa server; nó **không ẩn** Thám tử: server không còn bản ghi
       `clue_detective` thì `isExploreGameCatalogVisible`
       (`mobile/src/explore/registry.ts:447–455`) lấy `serverVisible = true` khi
       không có bản ghi server (dòng 453), nên app đã bật hiển thị vẫn hiện game
       bằng bản bundled (`selectVisibleExploreCatalog`, dòng 462).
     - **Muốn ẩn game** (lỗi nội dung, audio, bé chơi kẹt): dùng **kill switch**,
       GIỮ bản ghi server và đặt `catalogVisible: false` cho `clue_detective` trong
       `BUNDLED_LOCAL_GAMES` (`kido-server/src/modules/explore/explore.registry.ts`;
       trường tuỳ chọn thêm vào `BundledLocalGameSpec` (dòng 108) ở bước 3, vì
       `bundledLocalDefinition` dòng 170–179 đang cố định `catalogVisible: true`).
       Cùng commit thêm ngoại lệ có tên cho `clue_detective` trong
       `explore.contract-codes.spec.ts` (`MIRRORED_FIELDS` dòng 11–24 so cả
       `catalogVisible` với bundled mobile; ngoại lệ chỉ cho phép server ẩn chặt
       hơn bundled, không cho chiều ngược lại), rồi `npm test` + `npm run build`,
       owner duyệt push. Hiển thị hiệu lực = bundled AND server (`registry.ts`
       dòng 452–454), nên app ẩn thẻ ngay khi tải được catalog server, và màn chơi
       chặn cả lối vào trực tiếp (`ExplorePlayScreen.tsx:245`).
     - **Giới hạn kill switch:** app không cache catalog server
       (`getExploreCatalog`, `mobile/src/services/exploreApi.ts:21`; lỗi mạng thì
       `ExploreCatalogScreen.tsx:126–145` đặt `serverGames = null` và dùng
       bundled), nên máy offline vẫn thấy game. Muốn tắt cả offline phải ra bản
       app hoặc OTA có bundled `catalogVisible: false`.
- **kido-pipeline:** mirror inventory + pack v8, commit local, **không push**
  (push = tự deploy GCP VM).
- **Docs:** BRD §7.15 (theo mẫu §7.14: mục tiêu, neo nguồn yếu, câu thần chú, bảng
  bậc, hướng dẫn, lượt, đồ vật, ký hiệu, audio, chỗ hở công khai), §10 (thêm Thám
  tử vào danh sách game chơi theo bậc), §9 (pack v8), sửa tiêu đề §7 "DANH MỤC 8
  TRÒ CHƠI" đã cũ; `AI_CONTEXT.md` (13 mã, pack v8, gạch đầu dòng Thám tử; dòng
  "Public server catalog count is 13" khi đó mới đúng); `KIDO_MARKETING_CLAIMS.md`
  C-50 ("Thám tử Đô Đô có trong code, chưa lên store; public copy giữ nguyên tới
  khi lên store"); `KIDO_EXPLORE_THUMBNAIL_PROMPTS.md` §10.

**Effort: L, cộng 1–2 tuần lịch cho các cổng** (thử giấy 5 bé, có thể thêm 5 bé
nếu A trượt; owner nghe audio; playtest). Code: khoảng 15 file mobile (game,
layout, renderer, registry, variety, rendererRegistry, thumbnails, mastery,
catalog, play screen, audio, promptAudio, promptLines + JSON sinh, capability,
4–5 contract script), server 3–4 file + spec, pipeline 2–3 file (thêm lệnh sinh
lại một khoá) + batch ~82 clip, docs 4 file. Mốc so sánh: Cân thăng bằng
~3.500 dòng trong 24 file mobile và 138 clip. Lát cắt: A module thuần + contract
(song song thử giấy) → B điều phối đọc đề + renderer + đăng ký (ẩn) → C audio v8
+ Human Gate + bật hiển thị cùng commit export pack (tasks 7.3) → D server (một lần
deploy) + docs + playtest.

## 14. Ngoài phạm vi

- Bài 2 gợi ý; dạng hai thẻ "có" (PPN/PNP/NPP); bàn 10 nhà (khuôn đối xứng đạt
  nhưng vỡ lưới 3 × 3); khuôn "đóng vai trò" không đối xứng (hạ S13 nhưng đẩy S3
  lên 37–44%): giới hạn cấu trúc ở mục 10.
- Quay lại bộ sinh M, hoặc dùng khuôn / trọng số riêng theo dạng thẻ: phá điều kiện
  kín 1 (mục 9), mẹo không đọc dấu vượt 1/3 (với M: 100%).
- Quay lại xếp món đệm ngẫu nhiên (P1), hay thêm cấu trúc không chặt vào danh mục:
  phá R12, mẹo chỉ đọc thẻ "có" vượt 1/3 (P1: 58,6–82,6% qua bậc). Hoán đổi theo
  phân phối (bảng trọng số, ~15 cấu trúc 9 × 3) chỉ đúng trung bình, không dùng.
- 8 × 2 ở bậc 1–3 và khuôn (2, 1, 1) ở bậc 5–6: bất khả khi giữ R5 (mục 9); chỉ làm
  được nếu owner nới R5 thành R5′ (phương án P1-X′, câu hỏi (b)).
- Gợi ý theo thuộc tính khác món (màu cửa, mái, số tầng, "nhà có hai con mèo"):
  để sau, khi lõi đã qua playtest.
- Đổi luật giữa chừng (`rule_switch`: cùng cảnh, luật mới làm đáp án cũ sai): hướng
  mở rộng sau, chưa thiết kế.
- "Nhìn cảnh rồi che" có đồng hồ cát như đề gốc: cần owner mở ngoại lệ §6.2; mặc
  định tắt, thay bằng thẻ úp.
- Bài 4 gợi ý trở lên, gợi ý "hoặc", gợi ý về vị trí nhà.
- "Lọc nhà" (chạm hết nhà không có X rồi bấm Xong) và thao tác "đóng cửa nháp" cho
  bé: chỉ dùng 1 điều kiện hoặc cần cử chỉ thứ hai.
- Nút "nghe cách giải đầy đủ" sau diễn lại ngắn: xem lại sau playtest.
- Câu hỏi "Vì sao bé chọn nhà này?" để bé nói cho bố mẹ (không chấm, không ghi âm):
  ý dùng chung nhiều game, chưa làm.
- Vẽ riêng hình clay cho đồ vật và nhà (emoji + View, như Cân).
- Nhớ bé đã qua phần dạy ký hiệu giữa các lượt: Khám phá không lưu lịch sử.

## 15. Rủi ro và câu hỏi cho owner

**Rủi ro:**

1. **Bé đọc ngược thẻ "không có"** (quy ước phiếu "X = chọn") hoặc nghe sót chữ
   "không": game dạy sai. Giảm: ký hiệu A có vòng tròn; bài làm mẫu đầu lượt ở mọi
   bậc bắt đầu, đúng chuỗi diễn lại; soi theo dấu, không lóe món bị cấm; khoá chạm
   lúc đọc; "đâu" cuối câu; cổng thử giấy 5 bé thử đúng chuỗi app (A rồi B, cả hai
   trượt thì dừng). Bé không đọc dấu mà đoán theo cách xếp món thì chỉ đúng 1/3 mỗi
   bài từ bậc 3; bé chỉ đọc thẻ "có" cũng chỉ đúng 1/3 mỗi bài ở mọi bậc (mục 10).
2. **Audio chữ "không" bị nuốt** ("hông có", thanh ngang bị "có" lấn) và lọt qua
   Human Gate vì không có ASR. Giảm: owner nghe riêng 16 clip ⚠ + 14 `clue_has` +
   14 `clue_fb_missing`; reject → sinh lại một khoá; checklist đếm chữ "không";
   temp 0.7.
3. **Màn 360×640 dày ở bậc 5–6**: 27 món + 3 thẻ, emoji 29 pt khi bỏ dải lời, lưới
   dư 4 pt; bé nhìn sót món thì mô hình "nhìn đúng mọi món" sai và số đo chống mẹo
   không còn phản ánh đúng. Giảm: in thử đúng cỡ (bước 5), contract bố cục cả cỡ
   chữ 1,3, playtest máy nhỏ.
4. **Chỗ hở công khai**: S13 quên một thẻ "không có" 56,9% ở mọi bậc (định lý của
   khuôn đối xứng; bậc 5–6 tăng 23,8 điểm so với M); S3∩S9 100% (mục 10). Đều là
   suy luận một phần có dùng phủ định. Danh mục hoán đổi được không đổi hai số này.
5. **Thời lượng**: ≈ 2 phút 6 giây chỉ nghe ở vòng đầu lượt bậc 1 (có bài làm mẫu),
   ≈ 1 phút 55 giây các vòng sau bậc 1–2, ≈ 1 phút 18 giây ở bậc 3–6; lượt đầy đủ
   ≈ 9 phút nghe, dài hơn phiên 2–3 phút của BRD §5.1. Giảm: diễn lại ngắn từ bậc
   3, nhắc nghỉ; đo P95 khi playtest.
6. **Ít cấu trúc ở mọi bậc** (1 / 1 / 3 / 9 / 9 / 9 tính cả dạng thẻ; danh mục
   1 / 1 / 1 / 3 / 3 / 3), so với khoảng 5.600 ở P1: bé có thể nhận ra "bàn quen"
   (cùng hình dạng, khác tên món). Học thuộc danh mục không giúp vượt 1/3 nếu không
   đọc thẻ "không có" (cận Bayes "chỉ đọc thẻ có", mục 10), cũng không giúp bé mù
   dấu; nhưng mẹo đọc một phần thẻ "không có" mà khai thác danh mục (ngoài thư viện)
   vẫn có thể có. Giảm: playtest để ý mẫu chọn lặp; câu hỏi (b).
7. **Dạng thẻ rút độc lập**: một vòng bậc 3–6 có thể lệch (vd 4 bài PNN), bé thấy
   "thẻ xanh đổi chỗ" ít hơn kỳ vọng ở vòng đó. Chấp nhận để vị trí thẻ không mang
   tin về dấu ở mức vòng (túi ×2 qua 66,6%, mục 5).
8. **Mô hình giả định bé nhìn đúng mọi món**: mẹo "nhà lạ" có thể khó hơn đọc phủ
   định với bé thật (hoặc ngược lại). Giảm: bước 5 thử giấy, playtest.
9. Rủi ro owner xoá như các game cũ: giảm bằng các số đo ở mục 1 và 10; mock và thử
   giấy cho owner thấy trước khi tốn effort L.
10. **Server**: push = deploy; lệch số mã giữa `PUBLIC_GAMES` và
    `EXPLORE_GAME_CODES` làm server không khởi động; nhánh Ô thiếu cùng sửa
    `explore.registry.ts`. Giảm: thứ tự merge cứng, một commit, test server trước,
    owner duyệt push, smoke test; server hỏng thì revert, muốn ẩn game thì kill
    switch `catalogVisible: false` (revert không ẩn game, mục 13).
11. **Bàn "đều" chưa thử với bé, và bậc 4 đổi hai thứ**: bậc 4–6 dùng bàn mà mọi món
    trong nhà có món-thẻ (Möbius–Kantor, Pappus: mọi món trên bàn) có ở đúng 3 nhà;
    chưa biết bé thấy loại bàn này dễ hay khó nhìn hơn bàn P1. Bậc 4 vừa thêm món mỗi
    nhà vừa bớt một nhà (9 → 8). Giảm: bước 5 thử giấy dùng bàn Pappus (mục 11);
    playtest để ý chỗ chuyển bậc 3 → 4; câu hỏi (b).
12. **Lệch theo lịch sử trong vòng**: số đo giả định cấu trúc và dạng rút độc lập
    mỗi bài. Codex vòng 8 nối bộ sinh vào `planExploreRound` thật và thấy
    `QUESTION_POLICIES` theo tập món-thẻ đẩy mẹo "chỉ đọc thẻ có" lên 33,58%/bài
    (mục 9). Đã bỏ chính sách này. Còn `variantKey` không trùng trong vòng (xác suất
    trùng rất nhỏ vì số bài cụ thể hàng triệu). Giảm: contract dựng vòng bằng planner
    thật, kiểm χ² dạng thẻ và cấu trúc, và đo hậu nghiệm theo lịch sử (tasks 2.7).

**Câu hỏi cho owner (trả lời ở task 0.6):**

- **(a)** Chấp nhận **quên 1 thẻ "không có" vẫn qua 56,9% ở mọi bậc** để mẹo đoán
  thẻ "có" mà không đọc dấu chỉ còn ≤ 19%? Đây là định lý của khuôn đối xứng (mục
  10), không có khuôn đối xứng nào tránh được. Cái giá so với bộ sinh M: bậc 5–6
  quên 1 thẻ từ 33,1% lên 56,9%. Cái được: mù dấu từ 100% xuống 19,0% (từ bậc 3,
  kể cả cận Bayes), S3 bậc 5–6 từ 31,0% xuống 7,4%.
- **(b)** Chấp nhận **P1-X** (đang chọn, mục 5, 9): danh mục rất ít cấu trúc (1 / 1
  / 3 / 9 / 9 / 9 tính cả dạng thẻ, so với khoảng 5.600 ở P1; bài cụ thể vẫn hàng
  nghìn mỗi bậc nhờ đổi tên món), bậc 1–3 lên 9 nhà (21 hình), và bậc 4 đổi hai thứ
  (9 → 8 nhà, 3 món mỗi nhà)? Cái được: mọi mẹo chỉ đọc thẻ "có" từ 58,6–82,6%
  xuống 19,0% (kể cả cận Bayes), S3 ở 9 nhà còn 7,4%. Phương án khác:
  - **P1-X′** nới R5 thành **R5′** (món chỉ ở nhà `000` được xuất hiện 1 lần; đáp án
    vẫn không có món riêng): giữ 8 nhà ở bậc 1–3 (19 hình) nên thang "mỗi bậc đổi
    đúng một thứ" nguyên vẹn; 2 / 2 / 6 / 12 / 12 / 12 cấu trúc (8 × 2: K4 ∪ {EF,
    EG}, K4 ∪ {EF, GH}; 8 × 3 thêm mặt phẳng Fano + một nhà lẻ; bậc 5–6 trộn (3, 1,
    0) + (2, 1, 1) 50/50). Mọi mẹo không phủ định 19,0%; cận Bayes chỉ đọc thẻ có
    19,0% (bậc 1–4), 12,4% (bậc 5–6); S3 19,0% (bậc 1–4), 12,4% (bậc 5–6); 0 lỗi
    luật (`CATSET=CAT5 node exact-x.cjs`, `RUN=X5 node table-x.cjs`). Vét 9 × 3
    (3, 1, 0) dưới R5′ chưa chạy xong; danh mục tạm dùng 3 cấu trúc của R5.
  - Giữ P1 (món đệm xếp ngẫu nhiên, khoảng 5.600 cấu trúc): mẹo chỉ đọc thẻ "có"
    qua 58,6–82,6% (Codex vòng 7 CHƯA DUYỆT).
- **(c)** Tên game: giữ **"Thám tử Đô Đô"** (đang chọn) hay đổi **"Tìm nhà Đô Đô"**
  vì Đô Đô là người đố, bé là người tìm? Đổi thì đổi trước khi gen clip
  `game_clue_detective`.
- **(d)** Ai tổ chức buổi thử giấy 5 bé, và khi nào.

**Đề xuất (không cần trả lời nếu đồng ý):** nhóm catalog giữ tên "Quy luật"
(phương án khác Codex gợi ý: "Quy luật và suy luận").
