# Thiết kế: Ú òa — "Dưới cốc này là gì?" (`upgrade-explore-peekaboo-cups`)

## Bối cảnh

Owner chốt ngày 2026-10-21: giữ Ú òa, thêm "Dưới cốc này là gì?" từ bậc 3. Hai
game trí nhớ của Khám phá phải khác nhau: **Lật thẻ** lật dần nhớ dần (nhớ qua
nhiều lần thử), **Ú òa** nhìn một lần nhớ cả bố cục (món nào ở chỗ nào).

Thước đo của owner (memory `dodokids-explore-game-value-bar`, mẫu là Cân thăng
bằng §7.14): (1) bậc đầu đã đòi suy luận thật, không phải "chạm hình giống";
(2) mỗi bậc gỡ một hỗ trợ; (3) có câu thần chú và diễn lại sau bài đúng; (4) đo
tỉ lệ qua vòng bằng mẹo theo luật lượt theo bậc (vòng 6 bài, ≥ 4 đúng ngay lần
đầu thì lên bậc, tối đa một vòng luyện thêm).

## Mục tiêu / Không làm

- Mục tiêu: thang 5 bậc từ "biến mất" (nhận ra món vừa đi) lên "dưới cốc" (nhớ
  món theo chỗ); mọi mẹo không cần nhớ ở mức đoán mò; diễn lại + câu kết; bong
  bóng đúng pha; vừa iPhone SE; chống lặp tình huống.
- Không làm: game mới, art mới (cốc vẽ bằng View), đổi luật lượt theo bậc, đổi mô
  tả catalog, render clip (đợt audio v8 chung).

## Thang bậc

| Bậc | Kiểu | Món | Thẻ | Câu hỏi | Bé làm | Hỗ trợ gỡ so với bậc trước |
|---|---|---|---|---|---|---|
| 1 | Biến mất | 3 | 4 | 1 | So trước–sau: món nào lúc nãy có, giờ không còn | (đầu thang) Các món khác vẫn hiện lúc trả lời; ô trống chỉ chỗ |
| 2 | Biến mất | 4 | 4 | 1 | Như bậc 1 | Thêm một món phải nhớ |
| 3 | Dưới cốc | 3 | 3 | 1 | Nhớ món theo chỗ: dưới cốc được chỉ là món gì | Không còn món nào hiện lúc trả lời; mọi thẻ đều là món đã thấy |
| 4 | Dưới cốc | 4 | 4 | 1 | Như bậc 3 | Thêm một cốc |
| 5 | Dưới cốc | 4 | 4 | 2 liền | Giữ hai chỗ: cốc thứ nhất đúng thì lật giữ nguyên, mũi tên sang cốc thứ hai | Phải giữ hai chỗ cùng lúc |

Bậc 3 lùi về 3 món vì kiểu bài mới khó hơn hẳn (nhớ theo chỗ, không còn gì để so).
Thời gian nhìn = 1 giây mỗi món, không dưới 3 giây (`peekabooLookMs`): 3, 4, 3, 4,
4 giây. Nhớ món nào ở chỗ nào cần lâu hơn nhận ra món đã thấy; owner duyệt
"khoảng 3 giây" ngày 2026-09-13 khi bàn có 2–5 món và đều là nhận biết.

### Bậc 1–2: bộ thẻ "biến mất"

v1 lấy mọi thẻ nhiễu ngoài tập ban đầu, nên thẻ quen duy nhất luôn đúng. v2 bộ
thẻ = **món mất + đúng 1 món còn trên bàn + các món lạ**. Hai điều kiện:

- "Lúc nãy có món này" loại được món lạ, còn lại {món mất, món còn trên bàn}.
- "Giờ không còn trên bàn" loại được món còn hiện, còn lại {món mất, các món lạ}.

Chỉ cả hai mới ra một thẻ. Codex cảnh báo đừng chỉ thay nhiễu bằng vật còn hiện
(sẽ thành mẹo "chọn món không có trên bàn"); bộ trộn này giữ mỗi điều kiện một
mình ≤ 1/2. Validator kiểm đúng các ràng buộc này (đúng một thẻ còn trên bàn, các
thẻ còn lại mới, giao của hai điều kiện là đúng món mất).

### Bậc 3–5: "Dưới cốc này là gì?"

- Hiện các món kèm đồng hồ cát → cốc úp xuống tất cả (rơi từ trên xuống) → mũi tên
  trỏ một cốc (cốc có viền vàng) → câu hỏi → bé chạm thẻ.
- Thẻ = đúng các món dưới cốc, xáo theo seed. Không có món lạ nên "đã thấy" vô
  dụng; không món nào hiện nên "không còn trên bàn" vô dụng.
- Cốc được hỏi: hoán vị theo seed, lấy `questions` cốc đầu, nên cốc đầu/giữa/cuối
  được hỏi đều nhau.
- Bậc 5: đúng cốc thứ nhất → cốc đó lật và giữ nguyên, bong bóng «Còn dưới cốc này
  là gì nhỉ?». Thẻ vẫn đủ 4 (thẻ món vừa lật vẫn chạm được; chạm vào là sai ở cốc
  thứ hai — "mỗi cốc một món" là suy luận hợp lệ). Một lần sai ở bất kỳ câu nào
  làm bài không còn "đúng ngay lần đầu".
- Chạm sai: rung nhẹ, `onAnswer(false)` ngay, không lật cốc nào.

## Câu thần chú, diễn lại, câu kết

- Câu thần chú (bài cốc): «Bé nhìn kỹ chỗ của từng món nhé!», Đô Đô nói khi cửa sổ
  nhìn mở; câu giới thiệu bậc 3 cũng nhắc «nhớ chỗ của từng món». Bậc 1–2 giữ
  «Bé nhìn kỹ các món đồ nhé!» (đã có tiếng, pack v7) — nếu dùng câu mới ở cả 5
  bậc thì bậc 1–2 câm tới đợt v8.
- Bài đúng → renderer chưa báo. Bài biến mất: món bật về ô trống (viền xanh), câu
  kết «Lúc nãy món này nằm ở đây, rồi trốn mất đó!» (trước–sau, gắn món với chỗ).
  Bài cốc: mọi cốc lật lần lượt trái → phải (cách nhau 220 ms), ô được hỏi sáng
  xanh, câu kết «Nhớ chỗ của từng món là tìm ra ngay!» (nhắc lại câu thần chú
  thành cách giải). Câu kết đi qua `onSpeakFeedback`; renderer chờ câu đọc xong
  (tối đa 6 giây) và bàn hiện đủ ít nhất 1,4 giây, rồi mới `onAnswer(true)` —
  giống Cân thăng bằng. Shell khen và chuyển bài như cũ.
- Câu kết không có "Đúng rồi!" vì shell khen ngay sau đó.
- Giảm chuyển động: cốc hiện/mất ngay, mũi tên đứng yên, món bật về không nảy;
  vẫn giữ 1,4 giây cho bé nhìn bố cục.
- Tạm dừng (hộp thoát / app ra nền) trong lúc diễn lại: giữ báo đúng tới khi chơi
  tiếp. Tạm dừng TRONG lúc nhìn: quay lại thì nhìn lại đủ một lượt kèm câu nhìn
  (với bài cốc là câu thần chú), như Đợt 1. Tạm dừng khi đã che / đã úp cốc / đang
  lộ ô trống: giữ nguyên bàn, chơi tiếp từ bước đó, không cho nhìn lại — review
  đối kháng Đợt 1 (C04, `tmp/explore-review-2026-10-21/dot1-review-confirmed.md`)
  xác nhận bản Đợt 1 hiện lại đủ bộ sau khi bé đã thấy ô trống, tức lộ món bị
  lấy. Thay kịch bản "Paused under the cover" của `fix-explore-play-reliability`.

## Bong bóng và tiếng theo pha (E07)

| Pha | Bong bóng | Tiếng (`onPromptCue` / `onSpeakFeedback`) |
|---|---|---|
| Nhìn | biến mất: «Bé nhìn kỹ các món đồ nhé!»; cốc: «Bé nhìn kỹ chỗ của từng món nhé!» | cùng câu |
| Che / lộ | «Ú… òa!» | — |
| Hỏi | «Món đồ nào vừa biến mất rồi nhỉ?» / «Dưới cốc này là gì nhỉ?» / bậc 5 câu 2 «Còn dưới cốc này là gì nhỉ?» | cùng câu |
| Đúng | câu kết | câu kết |

Bỏ dòng «Cùng nhớ nhé…» và dòng nhắc dưới thẻ. Chỗ thẻ lúc chưa hỏi là các khung
viền đứt (không chữ). Trợ giúp mức 1 ở bài cốc: «Bé nhớ lại xem món nào nằm ở chỗ
này nhé.» (bài biến mất giữ «…món nào vừa trốn đi nhé.»); mức 2 «Đô Đô cho bé xem
lại một lần nữa nhé!» và lật lại cả bộ một lượt có đồng hồ cát.

## Bố cục (B04)

`renderers/peekabooLayout.ts` (thuần, contract gọi trực tiếp): món một hàng, thẻ
một hàng ở mọi bậc (hàng gãy làm mất trái–phải). Ô = lớn nhất vừa bề rộng
(56–104pt), thẻ = lớn nhất vừa bề rộng (56–92pt), rồi cùng co theo chiều cao đo
được (`onLayout`). iPhone SE 375×667, bậc 4–5: vùng 335pt, ô 76pt (4×76 + 3×10 =
334), thẻ 74pt (4×74 + 3×12 = 332), cả bàn cần 328pt trong ~445pt còn lại khi có
dòng gợi ý + nhắc nghỉ. Contract kiểm SE, 17e, 17 Pro, iPad mini, iPad 13".

## Khoá chống lặp (B10)

`variantKey` = `peekaboo:<kiểu>:<số món>:<bố trí>:x<ô bị lấy>` hoặc
`…:a<cốc được hỏi>`, KHÔNG gồm thẻ. Hai bài chỉ khác nhiễu/thứ tự thẻ là cùng một
tình huống ghi nhớ nên planner loại nhau.

## Số đo lối tắt (trước → sau)

Chạy thật: `createExploreRunBatch` + `LocalExploreProvider` như màn chơi, 2.000
cặp vòng 6 bài mỗi bậc (vòng sau tránh vòng trước), bộ giải ngây thơ. Ô: đúng mỗi
bài / qua vòng 4/6 / qua trong hai vòng. Script đo (chạy được cả v1 lẫn v2) và
kết quả thô: `tmp/explore-review-2026-10-21/peekaboo-cups/` của checkout chính
(`tmp/` không commit; `node measure-peekaboo.cjs <mobileRoot> 2000`). Phần gate
nằm trong `verify-explore-peekaboo-contracts.cjs` §6.

| Bậc | v1 "chọn món đã thấy" | v1 nhớ 1 món rồi đoán | v2 đoán mò | v2 mẹo không cần nhớ tệ nhất¹ | v2 "đã thấy" một mình | v2 "không còn trên bàn" một mình | v2 nhớ 1 món rồi đoán |
|---|---|---|---|---|---|---|---|
| 1 | 1,00 / 1,00 / 1,00 | 0,76 / 0,84 / 0,97 | 0,25 / 0,04 / 0,08 | ≈ đoán mò | 0,50 / 0,35 / 0,58 | 0,33 / 0,10 / 0,20 | 0,56 / 0,46 / 0,70 |
| 2 | 1,00 / 1,00 / 1,00 | 0,56 / 0,46 / 0,70 | 0,25 / 0,04 / 0,08 | ≈ đoán mò | 0,51 / 0,35 / 0,58 | 0,34 / 0,10 / 0,19 | 0,50 / 0,34 / 0,55 |
| 3 | 1,00 / 1,00 / 1,00 | 0,50 / 0,34 / 0,58 | 0,33 / 0,10 / 0,18 | 0,34 / 0,11 / 0,21 | = đoán mò | = đoán mò | 0,67 / 0,68 / 0,90 |
| 4 | 1,00 / 1,00 / 1,00 | 0,41 / 0,18 / 0,34 | 0,25 / 0,04 / 0,08 | 0,25 / 0,04 / 0,08 | = đoán mò | = đoán mò | 0,51 / 0,36 / 0,57 |
| 5 | 1,00 / 1,00 / 1,00 | 0,37 / 0,14 / 0,25 | 0,06 / 0,00 / 0,00 | 0,08 / 0,00 / 0,00 | = đoán mò | = đoán mò | 0,25 / 0,04 / 0,08 |

¹ Thẻ đầu / giữa / cuối, thẻ ở cùng vị trí với cốc, món hiện nhiều nhất trên bài
hay trong vòng, loại đáp án câu trước, món của cốc đầu / cốc giữa (bài cốc). v1
"món hiện nhiều nhất trên bài" cũng đúng 100% (món mất hiện cả lúc nhìn lẫn ở
thẻ); v2 bài biến mất = 0 (món còn trên bàn hiện nhiều nhất).

Vị trí thẻ đáp án và cốc được hỏi đều (mỗi chỗ 1/n ± 0,01). Lặp tình huống: v1
bậc 1 23/4.000 vòng trong vòng, 45/3.999 với vòng trước; v2 0 ở mọi bậc.

"Nhớ 1 món rồi đoán" không phải mẹo né kỹ năng: đó là chính kỹ năng ở mức thấp
(nhớ một chỗ). Tỉ lệ lý thuyết của nó là 2/n ở bài cốc một câu, nên contract chặn
theo tỉ lệ đó và đòi nó giảm rõ từ bậc 3 → 4 → 5 (0,67 → 0,51 → 0,25); bậc 5 chỉ
qua vòng 4%.

## Phương án đã cân nhắc

- **Bậc 3 = 4 cốc** (nhớ 1 món qua vòng 36% thay vì 68%). Không chọn: bậc 3 là
  bậc đầu của kiểu bài mới, khó hơn hẳn nhận biết; 3 cốc là trò "cốc" quen thuộc
  của trẻ 4–5 tuổi. Đổi chỉ cần sửa `PEEKABOO_RECALL_LEVELS[3]` — xem quyết định
  cần owner.
- **Bậc 5 "hai món nào đổi chỗ" / cốc tráo chỗ**: cần chọn cặp (giao diện hai
  chạm) hoặc theo dõi chuyển động (không làm được bản tĩnh khi giảm chuyển động),
  và là năng lực theo dõi, không phải nhớ bố cục. Chọn "hai cốc liền".
- **Thẻ nhiễu toàn món còn trên bàn**: "chọn món không có trên bàn" đúng 100% (cảnh
  báo của Codex). Bộ trộn giữ mỗi điều kiện ≤ 1/2.
- **Câu kết đọc tên món** («Dưới cốc này là quả táo»): cần 37 nhãn + câu liền mới
  cho mỗi món; để sau nếu owner muốn.
- **Lật cốc chỉ chỗ món bé chạm sai**: lộ thêm thông tin (bậc 5 có thể lộ đáp án
  câu sau). Không làm.

## Rủi ro

- Bậc 3 vẫn qua vòng 68% nếu chỉ nhớ một chỗ (xem trên).
- Câu mới im tới đợt v8: bài cốc chỉ có chữ + hình cho câu thần chú, câu hỏi, câu
  kết. Bé chưa biết đọc vẫn chơi được (mũi tên + cốc + thẻ), nhưng chưa nghe câu
  thần chú.
- Món lặp lại giữa các bài trong một vòng (kho 37 món, 6 bài × 4–6 món) — cố ý không
  chặn (gây nhiễu nhẹ, là một phần độ khó của trí nhớ); mẹo "món hiện nhiều nhất
  trong vòng" đo ≈ đoán mò.
- File chung với các nhánh song song: `promptAudio.ts` (khối cuối
  `PROMPT_PHRASES`, `supportHintPhraseId` thêm tham số), `ExplorePlayScreen.tsx`
  (2 dòng), kido-server `explore.registry.ts` (cơ chế `version` giống từng dòng
  nhánh Ô thiếu và nhánh Dẫn đường/Soi gương), kido-pipeline inventory.

## Quyết định cần owner

1. Bậc 3 bắt đầu bằng 3 cốc (đề xuất) hay 4 cốc.
2. Thời gian nhìn 1 giây mỗi món (3–4 giây) thay cho 3 giây cố định.
3. Bậc 1 có 4 thẻ (món mất + 1 còn trên bàn + 2 lạ) — trước đây 2 thẻ.
4. Duyệt 9 câu mới (nghe ở đợt v8) — danh sách trong `tasks.md`.
5. C-50 (`KIDO_MARKETING_CLAIMS.md`, đang nằm ở thay đổi chưa commit của việc SEO
   landing): khi bản có bài cốc lên store, sửa "nhớ đồ vật rồi tìm món vừa biến
   mất (Ú òa)" thành "nhớ đồ vật rồi tìm món vừa biến mất, và nhớ món nào nằm dưới
   cốc nào (Ú òa)".
