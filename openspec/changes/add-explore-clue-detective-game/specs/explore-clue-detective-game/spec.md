# Spec: explore-clue-detective-game

## Purpose

Định nghĩa "Thám tử Đô Đô" (`clue_detective`) — game Khám phá offline dạy suy luận
loại trừ nhiều điều kiện có phủ định qua 6 bậc: Đô Đô đọc ba gợi ý (một "có", hai
"không có"), bé chạm đúng nhà của Đô Đô. Chi tiết: `design.md` của change này; số
đo tái lập bằng `research/`.

## ADDED Requirements

### Requirement: Puzzle local deterministic đúng envelope hiện hành

Game SHALL sinh mọi bài local từ generator có version + random seed, không request
mạng, chỉ dependency bundled; `dependencyManifest` SHALL không chứa audio pack.
Envelope SHALL đúng shape `ExploreExerciseEnvelope` hiện hành; `params` SHALL chứa
`level`, `form`, `houseCount`, `itemsPerHouse`, `clues` theo thứ tự đọc, `houses`
theo thứ tự hiển thị, `spotlight` và `cardsFaceDown`; `answer` SHALL là
`{ houseId }`. Mọi lần rút ngẫu nhiên SHALL có namespace theo bậc. Replay cùng
(level, seed) SHALL byte-identical sau khi bỏ `variantKey`/`bucketKey`, và
validator SHALL reject envelope không replay được.

#### Scenario: Chơi trong airplane mode

- **WHEN** bé mở `clue_detective` không có mạng
- **THEN** bài mới được sinh, validate và hiển thị mà không có API request

#### Scenario: Cùng seed sinh lại

- **WHEN** generator nhận cùng level và seed hai lần
- **THEN** hai envelope giống hệt từng byte sau khi bỏ `variantKey` và `bucketKey`

#### Scenario: Bài bị chuyển sang bậc khác

- **WHEN** `params.level` của một envelope bị đổi sang bậc khác
- **THEN** validator reject

### Requirement: Đúng một nhà thoả mọi gợi ý, kiểm độc lập

Validator SHALL tự tính, chỉ từ nhà và thẻ đang hiển thị (không đọc `answer`), tập
nhà thoả mọi gợi ý; tập đó SHALL có đúng một nhà và nhà đó SHALL là
`answer.houseId`. Mỗi bài SHALL có đúng một thẻ "có" và hai thẻ "không có", ba thẻ
khác món nhau; món của mỗi thẻ SHALL có ở ít nhất 1 nhà và vắng ở ít nhất 1 nhà.
Mọi nhà SHALL có đúng m món, không lặp món trong nhà, và không có hai nhà giống
hệt. Mọi món không được nhắc trong gợi ý SHALL có ở ít nhất 2 nhà.

#### Scenario: Bài sinh ra được kiểm

- **WHEN** một bài bất kỳ được generator sinh ra
- **THEN** đúng một nhà thoả cả ba gợi ý và nhà đó là đáp án đã ghi

#### Scenario: Đáp án bị sửa

- **WHEN** `answer.houseId` của một envelope bị đổi sang nhà khác
- **THEN** validator reject

#### Scenario: Món trong một nhà bị sửa

- **WHEN** một món trong cửa sổ của một nhà bị thay làm nhà đó cũng thoả mọi gợi ý
- **THEN** validator reject vì có hơn một nhà thoả mọi gợi ý

#### Scenario: Sai số thẻ hoặc sai dấu

- **WHEN** một envelope có một hoặc hai gợi ý, hoặc ba gợi ý mà số thẻ "có" khác 1
- **THEN** validator reject

### Requirement: Mỗi gợi ý đều cần thiết

Với mỗi gợi ý j, bỏ gợi ý j SHALL còn ít nhất 2 nhà thoả hai gợi ý còn lại. Diễn
lại theo thứ tự đọc SHALL khép ít nhất 1 nhà ở mỗi bước và cuối cùng còn đúng đáp
án. Trên bàn chưa có lần nhầm, khép các nhà vi phạm thẻ đầu SHALL còn ít nhất 3
nhà mở.

#### Scenario: Bỏ một gợi ý

- **WHEN** contract bỏ lần lượt từng gợi ý của mọi bài sinh từ seed 1 đến 2.000 ở mỗi bậc
- **THEN** mỗi lần bỏ đều còn ít nhất hai nhà thoả các gợi ý còn lại

#### Scenario: Diễn lại từng bước

- **WHEN** contract chạy diễn lại theo thứ tự đọc trên cùng các bài đó
- **THEN** mỗi bước khép ít nhất một nhà và bước cuối chỉ còn đáp án

### Requirement: Bộ sinh rút cấu trúc từ danh mục hoán đổi được chung cho ba dạng thẻ

Generator SHALL chọn cấu trúc bàn (bàn bỏ tên món; A, B, C = món của thẻ 1, 2, 3
theo vị trí đọc; D, E, … = món đệm) bằng cách rút đều trong một danh mục chung
`CLUE_STRUCTURES[level]` dùng cho cả ba dạng thẻ (design §9): bậc 1–3 một cấu trúc
9 nhà × 2 món (K4 ∪ K3); bậc 4 ba cấu trúc 8 × 3 (cấu hình Möbius–Kantor, ba cách
đặt thẻ); bậc 5–6 ba cấu trúc 9 × 3 khuôn (a, c, d) = (3, 1, 0). Mọi cấu trúc SHALL
có khuôn đối xứng dấu: mỗi chữ ký một món đúng 1 nhà, ba chữ ký hai món cùng số nhà.
Generator SHALL rút cấu trúc trước và độc lập với dạng thẻ, rồi chỉ đặt tên món
(không xếp lại món đệm); đáp án SHALL là nhà có chữ ký một món của thẻ "có". Mọi cấu
trúc trong danh mục SHALL đạt R1–R12 với cả ba vai trò (thẻ "có" ở vị trí 1, 2, 3
trên cùng nhà, cùng món), nên bài sinh ra SHALL đạt validator ngay lần thử đầu. Từ
bậc 3, dạng thẻ (PNN, NPN, NNP) SHALL rút đều và độc lập cho từng bài theo seed,
không chia đều theo vòng (không túi ×2); ở bậc 1–2 dạng thẻ SHALL luôn là PNN.
Validator SHALL reject bài có multiset chữ ký không thuộc khuôn của bậc (R10). Vị
trí đáp án SHALL rút đều theo seed trên mọi ô, không dùng túi vị trí. Generator
SHALL loại cặp món trong `CLUE_NEAR_SOUND_PAIRS` ngay ở bước đặt tên, trước khi dựng
bàn, và không cặp nào trong danh sách đó SHALL cùng có mặt trên một bàn. Tên món
SHALL rút đều trên mọi phép gán món hợp lệ cho các chỗ A, B, C, D, … của cấu trúc
(không rút tuần tự rồi loại món gần âm của món đã chọn).

#### Scenario: Danh mục khớp thiết kế

- **WHEN** contract đọc `CLUE_STRUCTURES` của code
- **THEN** bảng bằng đúng bảng 7 dòng ở design §9 (bậc, nhà × món, khuôn, cấu trúc), không có cấu trúc hay trọng số riêng theo dạng thẻ, và mọi khuôn đối xứng dấu

#### Scenario: Khuôn ngoài bảng

- **WHEN** chữ ký các nhà của một envelope bị sửa thành một khuôn hợp lệ R1–R5 nhưng không phải khuôn của bậc
- **THEN** validator reject

#### Scenario: Dạng thẻ rút độc lập

- **WHEN** contract sinh bài từ seed 1 đến 2.000 ở mỗi bậc 3–6, và dựng vòng 6 bài bằng `planExploreRound`
- **THEN** ba dạng thẻ đều theo kiểm định χ² với p ≥ 0,001, và số bài mỗi dạng trong vòng khớp phân phối Bin(6, 1/3) theo χ² với p ≥ 0,001 (vòng không bị cân bằng ×2)

#### Scenario: Danh mục kiểm theo cả ba vai trò

- **WHEN** contract kiểm từng dòng của `CLUE_STRUCTURES` với thẻ "có" lần lượt ở vị trí 1, 2, 3 (đặt tên món bất kỳ không gần âm)
- **THEN** cả ba vai trò đạt R1–R12 và ba đáp án đôi một khác nhau

#### Scenario: Lần thử đầu đạt

- **WHEN** contract sinh bài từ seed 1 đến 2.000 ở mỗi bậc
- **THEN** mọi bài đạt validator ngay lần thử đầu và cấu trúc của mỗi bài là một dòng của danh mục bậc đó

#### Scenario: Vị trí đáp án đều

- **WHEN** contract sinh bài từ seed 1 đến 2.000 ở mỗi bậc
- **THEN** đáp án xuất hiện ở mọi ô và kiểm định χ² đều cho p ≥ 0,001

#### Scenario: Cặp gần âm trên bàn

- **WHEN** một envelope có cả "chú cá" và "hộp quà" trên bàn
- **THEN** validator reject

### Requirement: Hoán đổi được (R12) và chặn mẹo chỉ đọc thẻ "có"

Validator SHALL kiểm R12 trên từng bài: cấu trúc của bàn (bỏ tên món; A, B, C =
món thẻ 1, 2, 3 theo vị trí; so theo khoá chuẩn) SHALL thuộc
`CLUE_STRUCTURES[level]`. Mọi cấu trúc trong danh mục SHALL chặt: với cả ba vai trò,
nhóm tự đẳng cấu của bàn (đổi tên món giữ nguyên bàn) giữ món thẻ "có" SHALL đưa
nhà đáp án tới mọi nhà có món đó. Validator SHALL kiểm R6c trên từng bài: với cả ba
vai trò, mọi chiến lược không dùng phủ định của họ "lọc rồi xếp hạng" S16 (design §9:
17 bộ lọc không phủ định × chọn đều hoặc 17 thống kê × nhỏ nhất / lớn nhất), trừ
viết lại lời giải, SHALL đúng không quá 1/3. Contract SHALL tính chính xác từ danh
mục cận Bayes "chỉ đọc thẻ có" (bé biết cả danh mục và cách đặt tên món, chỉ dùng thẻ
"có"); cận đó SHALL bằng 1/3 mỗi bài, qua bậc không quá 19,1%.

#### Scenario: Cấu trúc cùng khuôn nhưng ngoài danh mục

- **WHEN** món đệm của một bài bậc 1–3 bị xếp lại thành cấu trúc "lăng trụ" AD BE CF AB AC BC DE DF EF (cùng khuôn, đạt R1–R11 và S16)
- **THEN** validator reject vì R12 trượt

#### Scenario: Mẹo Codex vòng 7

- **WHEN** chiến lược "có món thẻ có, rồi chọn nhà có tổng tần suất các món trong nhà nhỏ nhất" được chấm trên một bài bất kỳ
- **THEN** chiến lược đó đúng không quá 1/3

#### Scenario: Phản ví dụ của Codex không đạt danh mục

- **WHEN** contract kiểm bàn 8 × 2 AD, EF, FD, BE, AB, CE, AC, BC với thẻ có A, không B, không C
- **THEN** quỹ đạo nhà đáp án dưới nhóm giữ A chỉ có 1 nhà (không chặt) và cấu trúc không có trong danh mục của bậc nào

#### Scenario: Cận Bayes chỉ đọc thẻ có

- **WHEN** contract tính cận Bayes "chỉ đọc thẻ có" chính xác từ danh mục của mỗi bậc
- **THEN** cận đó bằng 1/3 mỗi bài và qua bậc không quá 19,1%

#### Scenario: Danh mục chặt

- **WHEN** contract tính nhóm tự đẳng cấu của từng dòng `CLUE_STRUCTURES`, giữ món thẻ "có" ở từng vai trò
- **THEN** quỹ đạo nhà đáp án chứa mọi nhà có món đó

#### Scenario: Đặt tên đều

- **WHEN** contract tính cận Bayes "chỉ đọc thẻ có" khi bé biết cả cách generator đặt tên món (chú cá / hộp quà rơi vào chỗ thẻ hay chỗ món đệm), và đếm trên seed 1 đến 2.000 mỗi bậc số lần chú cá / hộp quà nằm ở chỗ thẻ so với chỗ món đệm
- **THEN** cận đó bằng 1/3 trên mọi góc nhìn, và tỉ lệ chỗ thẻ / chỗ món đệm của chú cá / hộp quà khớp tỉ lệ số chỗ theo χ² với p ≥ 0,001

#### Scenario: Không lệch theo lịch sử trong vòng

- **WHEN** contract dựng ≥ 100.000 vòng mỗi bậc bằng `planExploreRound` thật và chấm mẹo "suy bộ ba món-thẻ của các bài trước từ đáp án đã công bố, loại giả thuyết đáp án mà planner sẽ tránh, chỉ đọc thẻ có"
- **THEN** mẹo đó đúng không quá 1/3 + 0,1 điểm phần trăm mỗi bài và ở bài thứ sáu, và game không khai chính sách tránh lặp theo tập món-thẻ

### Requirement: Đổi vai trò (R11) và chặn mẹo không đọc dấu

Validator SHALL kiểm R11 "đổi vai trò" trên từng bài: giữ nguyên nhà và ba món thẻ
theo thứ tự, đặt thẻ "có" lần lượt ở vị trí 1, 2, 3 (hai thẻ kia "không có"), cả ba
bài SHALL đạt R1–R6c và ba đáp án SHALL đôi một khác nhau. Contract SHALL đo một
thư viện mẹo mù dấu (bé thấy ba món thẻ và thứ tự thẻ nhưng không đọc dấu: món chung
của các nhà có đúng hai món-thẻ, món-thẻ ở nhiều nhà nhất, món-thẻ đồng xuất hiện
nhiều nhất, thẻ "có" ở một vị trí cố định, đổi vai trò theo luật bộ sinh) và cận
Bayes của mọi mẹo mù dấu; từ bậc 3 mỗi mẹo SHALL đúng không quá 1/3 trên từng bài
(tính trên ba vai trò) và cận Bayes SHALL không quá 1/3. Ở bậc 1–2, thẻ "có" luôn
đứng đầu là giàn đỡ có chủ đích; mọi mẹo mù dấu không dùng vị trí SHALL vẫn đúng
không quá 1/3 trên từng bài.

#### Scenario: Đổi vai trò trên mọi bài

- **WHEN** contract chạy R11 trên mọi bài sinh từ seed 1 đến 2.000 ở mỗi bậc
- **THEN** 100% bài đạt: ba vai trò đều hợp lệ R1–R6c và ba đáp án khác nhau

#### Scenario: Mẹo Codex vòng 6

- **WHEN** chiến lược "lấy món chung của các nhà có đúng hai món-thẻ, chọn nhà có món đó mà không có hai món-thẻ kia" được chấm trên một bài bậc 3–6, trung bình trên ba vai trò
- **THEN** chiến lược đó đúng không quá 1/3

#### Scenario: Cận Bayes mù dấu

- **WHEN** contract tính cận Bayes mù dấu chính xác từ danh mục và phân phối dạng thẻ của bậc 3–6
- **THEN** cận đó bằng 1/3 mỗi bài và qua bậc không quá 19,1%

#### Scenario: Một vai trò không hợp lệ

- **WHEN** một envelope bị sửa sao cho đặt thẻ "có" ở một vị trí khác làm bài trượt R2
- **THEN** validator reject và R11 báo trượt

### Requirement: Chặn mẹo theo thư viện chiến lược hữu hạn

Validator SHALL kiểm trên TỪNG bài một thư viện chiến lược hữu hạn, công khai
S1–S16 (design §9; S16 là họ "lọc rồi xếp hạng"), với quy tắc chấm cố định: bé chọn
đều trong tập ứng viên; tập rỗng thì đoán bừa (1/K); phép giao rỗng thì dùng bộ lọc
đầu; xếp hạng hoà thì chọn đều; phép giao và chiến lược viết lại lời giải không
tính. Trên từng bài: mọi chiến lược đơn không dùng phủ định (S1 với thẻ "có", S2,
S4, S5, S6, S7, S8, S9, S10, S11) SHALL đúng không quá 1/3; mọi phép giao hai bộ lọc
thuộc {S1 với thẻ "có", S2, S4, S6, S7, S8, S9, S10, S11}, trừ phép giao viết lại
lời giải, SHALL đúng không quá 1/3; mọi chiến lược không dùng phủ định của S16, trừ
viết lại lời giải, SHALL đúng không quá 1/3 (R6c); ở mọi bậc S1 với mọi thẻ và S3
SHALL đúng không quá 1/3. Qua bậc SHALL tính chính xác bằng Poisson–binomial từ xác
suất từng bài theo luật 6/4/1, không lấy mẫu lựa chọn của bé. Chỗ hở công khai (S13
quên một thẻ, S3∩S9) SHALL được đo như hàng rào chống xấu đi; S13 quên một thẻ
"không có" đúng 1/2 trên mọi bài là định lý của khuôn đối xứng (design §10), không
phải lỗi.

#### Scenario: Mẹo không dùng phủ định

- **WHEN** contract sinh 1.000 vòng × 6 bài mỗi bậc với seed gốc 1000 + chỉ số bậc và chấm mọi chiến lược không dùng phủ định, đơn, ghép và của họ S16
- **THEN** mỗi chiến lược đúng không quá 1/3 trên từng bài, qua bậc không quá 19,1%, và đoán bừa qua bậc không quá 0,6%

#### Scenario: Mẹo ghép Codex

- **WHEN** chiến lược "đúng 1 món-thẻ, rồi chọn nhà có tổ hợp duy nhất" (S8∩S9) được chấm trên một bài bất kỳ
- **THEN** chiến lược đó đúng không quá 1/3

#### Scenario: Coi thẻ "không có" là "có"

- **WHEN** chiến lược S4 "chọn nhà có đủ mọi món-thẻ" được chấm trên một bài bất kỳ
- **THEN** nếu tập ứng viên khác rỗng thì nó không chứa đáp án, còn nếu rỗng thì bé đoán bừa và đúng đúng 1/K

#### Scenario: Chỗ hở công khai không xấu đi

- **WHEN** contract tính chính xác từ danh mục `CLUE_STRUCTURES` qua bậc của S13 quên một thẻ và của S3 bỏ thẻ "có"
- **THEN** S13 tệ nhất không quá 57,0% ở mọi bậc, S3 không quá 8,0% ở bậc 1–3 và 5–6 và không quá 20,0% ở bậc 4

### Requirement: Sáu bậc, mỗi bậc thêm đúng một nấc khó

Game SHALL khai 6 bậc theo bảng T-Lai ở mục 5 `design.md`: bậc 1 PNN với thẻ "có"
đứng đầu, 9 nhà × 2 món (lưới 3–3–3), đèn soi; bậc 2 như bậc 1 bỏ đèn soi; bậc 3
các dạng PNN, NPN, NNP rút độc lập mỗi bài, 9 × 2; bậc 4 như bậc 3 với 8 × 3 (lưới
3–2–3); bậc 5 như bậc 4 với 9 × 3 (lưới 3–3–3); bậc 6 như bậc 5 với thẻ úp sau khi
đọc. Mỗi bậc SHALL khác bậc liền trước đúng một thứ làm khó thêm mà bé nhìn thấy;
riêng bậc 4 SHALL đồng thời bớt một nhà (9 → 8), vì 8 × 2 không có cấu trúc hoán
đổi được (design §9). Variety SHALL khai một bucket mỗi bậc; dạng thẻ và vị trí đáp
án SHALL không là bucket. Mỗi bậc SHALL có ít nhất 200 bài cụ thể phân biệt (chuẩn
hoá bỏ hoán vị nhà, giữ tên món, tức `variantKey`).

#### Scenario: Bàn bậc 3

- **WHEN** một bài bậc 3 được sinh
- **THEN** bàn có 9 nhà, mọi nhà có 2 món, dạng thẻ là một trong PNN, NPN, NNP, và `bucketKey` của bài không phụ thuộc dạng thẻ

#### Scenario: Bàn bậc 4

- **WHEN** một bài bậc 4 được sinh
- **THEN** bàn có 8 nhà, mọi nhà có 3 món, và mọi món trên bàn có ở đúng 3 nhà (cấu hình Möbius–Kantor)

#### Scenario: Đèn soi theo dấu chỉ ở bậc 1

- **WHEN** Đô Đô đọc thẻ "không có chú mèo" ở bậc 1
- **THEN** ký hiệu biển cấm phủ lên chú mèo ở mọi nhà có chú mèo, không có hiệu ứng lóe trên món đó, và ở bậc 2 trở lên không có đèn soi

#### Scenario: Đủ bài mỗi bậc

- **WHEN** contract đếm `variantKey` khác nhau trên bài sinh từ seed 1 đến 2.000 ở mỗi bậc
- **THEN** mỗi bậc có ít nhất 200 bài

### Requirement: Renderer đọc đề, nghe lại, không đếm ngược

`clue_detective` SHALL nằm trong `RENDERER_CUED_PROMPT_GAMES`: màn chơi SHALL không
phát `audioRefs` khi vào bài; renderer SHALL đọc câu đố rồi lần lượt ba gợi ý qua
`onSpeakFeedback` với `gentle`, `onStart` và `stillWanted`, làm sáng thẻ đúng lúc
câu bắt đầu, và chờ câu xong mới sang câu sau. Nhà và thẻ SHALL khoá tới khi câu
cuối xong (thiếu clip thì mỗi thẻ sáng 1,2 s rồi mở khoá); chạm nhà lúc khoá SHALL
không tính là một lần chọn và không gọi `onAnswer`. Sau khi mở khoá, chạm một thẻ
SHALL đọc lại gợi ý đó, không giới hạn số lần, và nút 🔊 SHALL đọc lại câu đố và ba
gợi ý đồng bộ với thẻ sáng. Ở bậc 6 thẻ SHALL úp sau khi đọc và lật ngửa khi được
chạm, trừ thẻ thiếu clip, luôn ngửa. Game SHALL không có đồng hồ, giới hạn thời gian
hay trạng thái thua, và chỉ dùng chạm.

#### Scenario: Đề đọc một lần

- **WHEN** một bài `clue_detective` mới hiện
- **THEN** màn chơi không phát `audioRefs`, và mỗi gợi ý được renderer đọc đúng một lần trước khi mở khoá

#### Scenario: Chạm vội lúc Đô Đô đang đọc

- **WHEN** bé chạm một nhà nhiều lần khi Đô Đô đang đọc gợi ý thứ hai
- **THEN** không lần chạm nào được tính, không có `onAnswer(false)`, không có lời nào được xếp thêm, và Đô Đô đọc tiếp

#### Scenario: Chuyển vòng

- **WHEN** bé lên bậc và màn chơi đang đọc câu lên bậc
- **THEN** câu đố của bài mới chỉ bắt đầu sau khi câu lên bậc đọc xong

#### Scenario: Thoát giữa câu

- **WHEN** bé thoát màn chơi khi Đô Đô đang đọc gợi ý
- **THEN** lời dừng, `onAnswer` không được gọi và không còn timer nào chạy

#### Scenario: Thẻ úp được chạm

- **WHEN** bé chạm một thẻ úp ở bậc 6 sau khi bàn đã mở khoá
- **THEN** thẻ lật ngửa, Đô Đô đọc lại gợi ý của thẻ, rồi thẻ úp lại

#### Scenario: Thiếu clip ở bậc thẻ úp

- **WHEN** clip gợi ý của một thẻ bậc 6 không có trong pack
- **THEN** thẻ đó luôn ngửa và bài vẫn chơi được

### Requirement: Bài làm mẫu đầu lượt dạy ký hiệu bằng đúng chuỗi diễn lại

Trước bài 1 của vòng đầu tiên trong lượt, ở bất kỳ bậc bắt đầu nào, renderer SHALL
chạy một bài làm mẫu: Đô Đô tự giải một bàn của bậc đó (sinh bằng generator của bậc,
qua validator, không trùng `variantKey` với bài nào của vòng), không tính điểm,
không gọi `onAnswer`, bé chỉ xem. Chuỗi hình của bài làm mẫu SHALL đúng chuỗi diễn
lại: theo thứ tự đọc, thẻ j sáng, ký hiệu của thẻ j phủ lên món đó ở mọi cửa sổ có
nó, các nhà chưa đúng thẻ j khép cửa chớp cùng lúc, cuối cùng còn một nhà, Đô Đô
ló ra ở nhà đó và nói câu chốt; SHALL không có thao tác nào khác. Lần đầu mỗi loại thẻ trong bài làm mẫu, ngay
sau câu gợi ý của thẻ đó, Đô Đô SHALL nói câu dạy ký hiệu tương ứng ("Thẻ xanh nghĩa
là nhà Đô Đô có món này." / "Thẻ có vạch chéo nghĩa là nhà Đô Đô không có món
này."). Khi thiếu clip hoặc máy tắt tiếng, bài làm mẫu SHALL chạy đúng chuỗi hình
đó. Ở bậc 1–2, bài 1 của mỗi vòng sau vòng đầu lượt SHALL nhắc lại câu dạy ký hiệu
và phủ ký hiệu lên món. Cờ đã dạy SHALL chỉ nằm trong bộ nhớ của lượt. Câu thần chú
và câu dạy ký hiệu SHALL không cùng nằm trong phần đọc đề (trước lần chạm đầu) của
một bài; trợ giúp mức 1 sau lần nhầm vẫn đọc câu thần chú.

#### Scenario: Bắt đầu ở bậc cao

- **WHEN** phụ huynh đặt bậc bắt đầu là 5 và bé vào lượt mới
- **THEN** trước lần chạm nhà đầu tiên bé xem bài làm mẫu, nghe cả `clue_sign_has` lẫn `clue_sign_not`, và thấy các nhà chưa đúng từng thẻ khép cửa tới khi còn một nhà

#### Scenario: Bài làm mẫu không tính

- **WHEN** bài làm mẫu chạy xong
- **THEN** `onAnswer` không được gọi, số bài của vòng không đổi, và `variantKey` của bàn mẫu khác mọi bài trong vòng

#### Scenario: Thần chú tách khỏi câu dạy ký hiệu

- **WHEN** contract lập kế hoạch lời cho mọi bậc bắt đầu 1–6 và mọi vị trí bài trong vòng
- **THEN** phần đọc đề của không bài nào có cả `clue_mantra` lẫn `clue_sign_has` hoặc `clue_sign_not`

#### Scenario: Thiếu clip dạy ký hiệu

- **WHEN** pack không có clip `clue_sign_not` hoặc máy tắt tiếng
- **THEN** bài làm mẫu vẫn chạy đúng chuỗi hình: ký hiệu biển cấm hiện trên món của thẻ "không có" ở mọi cửa sổ có nó, rồi các nhà có món đó khép cửa chớp

### Requirement: Phản hồi sai nói luật trước, đúng loại vi phạm

Khi bé chạm một nhà không phải đáp án, renderer SHALL gọi `onAnswer(false)` trước,
rồi lấy gợi ý đầu tiên theo thứ tự đọc mà nhà đó vi phạm. Nếu nhà có món bị cấm,
renderer SHALL phủ ký hiệu biển cấm lên món đó trong cửa sổ, đọc lại clip gợi ý
"không có" của thẻ đó rồi nói "Nhà này lại có <món>.". Nếu nhà thiếu món phải có,
renderer SHALL làm nhấp nháy thẻ và hiện bóng mờ của món, đọc lại clip gợi ý "có"
rồi nói "Nhà này chưa có <món>.". Sau đó nhà đó SHALL khép cửa, mờ đi và không
nhận chạm nữa trong bài; trong lúc nói, nhà SHALL không nhận chạm. Sau một lần nhầm
SHALL chỉ nhà vừa chạm đổi trạng thái, và không hình nào SHALL trỏ hay làm sáng đáp
án.

#### Scenario: Nhà có món bị cấm

- **WHEN** gợi ý là "có quả táo", "không có chú mèo", "không có cây nấm" và bé chạm một nhà có quả táo và chú mèo
- **THEN** `onAnswer(false)` được gọi, biển cấm phủ lên chú mèo của nhà đó, Đô Đô nói "Nhà Đô Đô không có chú mèo đâu." rồi "Nhà này lại có chú mèo.", và nhà đó khép cửa

#### Scenario: Nhà thiếu món phải có

- **WHEN** với cùng ba gợi ý, bé chạm một nhà không có quả táo
- **THEN** thẻ "có quả táo" nhấp nháy, bóng mờ quả táo hiện trên nhà đó, Đô Đô nói "Nhà Đô Đô có quả táo." rồi "Nhà này chưa có quả táo.", và nhà đó khép cửa

### Requirement: Trợ giúp không lộ đáp án

Trợ giúp mức 1 SHALL chỉ đọc lại câu thần chú và ba gợi ý, làm sáng lần lượt từng
thẻ, không đổi trạng thái nhà nào. Trợ giúp mức 2 SHALL khép các nhà chưa khép vi
phạm gợi ý đầu tiên, SHALL không bao giờ khép đáp án, và SHALL không tự làm số nhà
mở giảm từ 2 trở lên xuống còn 1; nếu khép như vậy chỉ còn đáp án thì mức 2 SHALL
không khép thêm và làm như mức 1. Bàn tay gợi ý SHALL chỉ trỏ thẻ, không bao giờ
trỏ nhà, chỉ hiện sau 10 s không chạm, và SHALL tắt khi phụ huynh bật giảm hỗ trợ.

#### Scenario: Mức 2 trên bàn chưa có lần nhầm (hàm thuần)

- **WHEN** contract gọi `clueSupportCue` với mức 2 trên một bài vừa sinh, chưa nhà nào khép
- **THEN** chỉ các nhà vi phạm gợi ý đầu bị khép và còn ít nhất 3 nhà mở

#### Scenario: Mức 2 khi khép thêm sẽ chỉ còn đáp án

- **WHEN** bé đã khép nhầm mọi nhà thoả gợi ý đầu ngoài đáp án và trợ giúp mức 2 được đưa ra
- **THEN** không nhà nào bị khép thêm và Đô Đô đọc lại câu thần chú và ba gợi ý

### Requirement: Diễn lại lời giải và câu chốt sau mỗi bài đúng

Khi bé chạm đúng nhà (ở lần thử bất kỳ), renderer SHALL mở cửa nhà đó, mở lại mọi
nhà, rồi theo thứ tự đọc làm sáng từng thẻ, phủ ký hiệu của thẻ đó lên món của nó ở
mọi cửa sổ có món (vòng xanh / biển cấm) và khép cùng lúc các nhà bị thẻ đó loại;
cuối cùng SHALL nói câu chốt "Còn lại nhà này! Đây là nhà Đô Đô.". Chuỗi hình này
SHALL là cùng một chuỗi với bài làm mẫu đầu lượt (cùng hàm bước diễn lại). Ở bậc 1–2, và ở
mọi bậc khi bài có ít nhất một lần nhầm, mỗi bước SHALL đọc lại gợi ý của thẻ (diễn
lại có lời). Ở bậc 3–6 khi bé đúng ngay lần đầu, các bước SHALL im lặng (diễn lại
ngắn). `onAnswer(true)` SHALL chỉ được gọi sau khi diễn lại xong (tối thiểu
1.100 ms) và một lần mỗi bài.

#### Scenario: Bậc 4 đúng ngay lần đầu

- **WHEN** bé chạm đúng nhà ngay lần đầu ở bậc 4
- **THEN** ba thẻ sáng lần lượt không đọc lại gợi ý, các nhà bị loại khép cửa, Đô Đô nói câu chốt, rồi `onAnswer(true)` được gọi đúng một lần

#### Scenario: Bậc 4 sau một lần nhầm

- **WHEN** bé chạm đúng nhà ở bậc 4 sau một lần nhầm
- **THEN** mỗi bước diễn lại đọc lại gợi ý của thẻ trước khi khép nhà, rồi Đô Đô nói câu chốt

### Requirement: Ký hiệu có và không có

Thẻ "có" và thẻ "không có" SHALL khác nhau bằng hình, không chỉ bằng màu, và vẫn
phân biệt được khi in đen trắng. Thẻ "không có" SHALL không bao giờ là dấu X hay
vạch chéo trơn: nếu có vạch chéo thì SHALL nằm trong viền tròn kiểu biển cấm.
Không dùng emoji làm dấu. Mọi chỗ game chỉ vào một món trong cửa sổ SHALL vẽ đúng
ký hiệu của thẻ (vòng xanh cho "có", biển cấm cho "không có") và SHALL không làm
lóe hay nhịp sáng món của thẻ "không có".

#### Scenario: Kiểm nguồn thẻ

- **WHEN** contract đọc mã nguồn thẻ gợi ý
- **THEN** vạch chéo chỉ được vẽ cùng viền tròn và không có ký tự X, ×, ✕ hay ❌ làm dấu

#### Scenario: Soi theo dấu

- **WHEN** contract gọi `clueSpotlight` cho một thẻ "có" và một thẻ "không có"
- **THEN** thẻ "có" trả kiểu vòng xanh, thẻ "không có" trả kiểu biển cấm, và không kiểu nào là nhịp sáng

### Requirement: Lượt gồm nhiều vòng 6 bài, lên bậc khi làm tốt

Game SHALL khai lượt theo bậc bằng luật chung `LEVELED_ROUND_RULE` (vòng 6 bài cùng
một bậc; đúng ngay lần đầu ít nhất 4/6 thì lên bậc; chưa đạt thì luyện thêm tối đa
một vòng bài mới; vòng thêm vẫn chưa đạt hoặc qua bậc 6 thì hết lượt) với câu giới
thiệu riêng cho mỗi bậc 2–6; câu giới thiệu nào cũng SHALL có chữ "bé" và không có
chữ "không". Renderer SHALL gọi `onAnswer(false)` ở mọi lần chạm nhầm nhà. Một vòng
SHALL không có hai bài trùng `variantKey`. Phụ huynh SHALL chọn được mọi bậc 1–6
làm bậc bắt đầu.

#### Scenario: Bé lên bậc

- **WHEN** bé làm đúng ngay lần đầu 4/6 bài của vòng bậc 1
- **THEN** Đô Đô nói "Giỏi quá! Mình lên bậc mới nhé!" và "Bây giờ bé tự soi món trong từng nhà nhé!", rồi vòng bậc 2 bắt đầu

#### Scenario: Không luyện mãi một bậc

- **WHEN** bé chưa đạt cả vòng bậc 5 lẫn vòng luyện thêm bậc 5
- **THEN** lượt kết thúc với "Mình luyện xong rồi! Bé muốn chơi lại không?"

### Requirement: Audio render trước và quy ước xưng hô

Mọi câu Đô Đô SHALL lấy từ clip render trước trong pack audio (không TTS lúc
chơi). Câu theo món SHALL là câu liền, có clip ghép dự phòng. Khi thiếu clip, game
SHALL im lặng câu đó nhưng thẻ hình, đèn soi, làm mẫu bằng hình và phản hồi hình
SHALL vẫn đủ để chơi hết bài. Quy ước xưng hô cho mọi câu mới của game (`clue_*`):
Đô Đô tự xưng "Đô Đô", câu nhắc tới người chơi SHALL gọi "bé", và không câu nào
SHALL dùng "con", "cô", "thầy", "sai" hay "khớp". Trong các câu `clue_*`, chữ
"không" SHALL chỉ xuất hiện trong `clue_not` (kể cả mảnh ghép dự phòng của nó) và
`clue_sign_not`; câu thần chú, câu hướng dẫn, câu phản hồi và câu giới thiệu bậc
SHALL không có chữ "không".

#### Scenario: Chơi khi một clip bị thiếu

- **WHEN** app chạy với pack thiếu clip gợi ý của một món
- **THEN** thẻ của gợi ý đó sáng 1,2 s, bàn vẫn mở khoá, bé chọn được nhà, phản hồi sai và diễn lại vẫn hiện bằng hình

#### Scenario: Kiểm xưng hô

- **WHEN** contract tách từ mọi câu `clue_*` (câu cố định và câu liền của mọi món)
- **THEN** không câu nào có token "con", "cô", "thầy", "sai" hay "khớp", và câu nào nhắc tới người chơi đều dùng "bé"

### Requirement: Bố cục vừa màn nhỏ

Layout SHALL tính theo vùng đo được, không theo thiết bị, với hệ số co
`fit = min(1, đo / cần)` và sàn emoji 22 pt. Dải lời SHALL tối đa 2 dòng; nếu giữ
dải lời làm emoji trong nhà nhỏ hơn 26 pt thì layout SHALL bỏ dải lời trên màn đó.
Khe giữa hai nhà SHALL ít nhất 8 pt. Lưới 9 nhà SHALL xếp 3–3–3 và lưới 8 nhà 3–2–3
(luôn 3 hàng); hàng 3 nhà cùng 2 khe cột SHALL vừa bề ngang khả dụng.

#### Scenario: Bàn dày nhất trên máy nhỏ

- **WHEN** contract dựng bố cục bậc 5 (9 nhà × 3 món) ở 360×640 với cỡ chữ 1,0 và 1,3
- **THEN** lưới vừa không cuộn, emoji ít nhất 22 pt, khe giữa nhà ít nhất 8 pt, và vùng chạm mỗi nhà ít nhất 88 × 64 pt

#### Scenario: Lưới bậc 1 và bậc 4 trên máy nhỏ

- **WHEN** contract dựng bố cục bậc 1 (9 nhà × 2 món) và bậc 4 (8 nhà × 3 món) ở 375×667 và 360×640 với cỡ chữ 1,0 và 1,3
- **THEN** bậc 1 xếp 3–3–3, bậc 4 xếp 3–2–3, cả hai vừa không cuộn cả chiều cao lẫn bề ngang, emoji ít nhất 22 pt và khe giữa nhà ít nhất 8 pt

#### Scenario: Câu dài nhất trên dải lời

- **WHEN** contract đo số dòng của `clue_hint_2`, `clue_sign_not`, `clue_mantra` và gợi ý dài nhất ở 375×667 và 360×640, cỡ chữ 1,0 và 1,3
- **THEN** ở mọi cỡ còn dải lời, mỗi câu chiếm không quá 2 dòng

### Requirement: Không lưu lịch sử, không phần thưởng

Mọi trạng thái chơi (nhà đã khép, lần nhầm, trợ giúp, bậc, bài đã ra, cờ đã dạy ký
hiệu) SHALL chỉ nằm trong bộ nhớ của màn chơi và mất khi thoát, đúng
`explore-stateless-privacy`. Game SHALL không có điểm, sao, streak hay phần thưởng.

#### Scenario: Thoát giữa lượt

- **WHEN** bé thoát giữa lượt rồi vào lại
- **THEN** lượt mới bắt đầu từ bậc phụ huynh đặt, bài làm mẫu chạy lại, và không còn gì của lượt trước

### Requirement: Hiện trong catalog khi đủ audio

`clue_detective` SHALL có trong cả ba danh sách `EXPLORE_GAME_CODES` (docs, mobile,
kido-server), cùng thứ tự, ở cuối, thành 13 mã. Catalog bundled SHALL chỉ hiện
"Thám tử Đô Đô" (hoặc tên owner chốt) trong nhóm "Quy luật" khi pack
`explore-audio-vi-v8` có trong bundle; trước đó `catalogVisible` bundled SHALL là
`false`. Khi server đã có mã này, `catalogVisible` của server SHALL bằng đúng cờ
bundled ở cùng revision. Hiển thị hiệu lực SHALL là bundled AND server
(fail-closed): server chỉ ẩn được, không lộ lại game đã ẩn; khi server chưa biết mã
này, app SHALL dùng bản bundled. Vì vậy revert mã server SHALL không được dùng để
ẩn game; muốn ẩn game sau phát hành SHALL dùng kill switch: giữ bản ghi server của
`clue_detective` với `catalogVisible` là `false` (ngoại lệ duy nhất cho luật server
mirror cờ bundled, có tên trong spec contract-codes).

#### Scenario: Chưa có pack v8

- **WHEN** app có code `clue_detective` nhưng bundle chưa có pack v8
- **THEN** thẻ game không hiện trong catalog trẻ và không có thẻ "Sắp ra mắt"

#### Scenario: Server chưa deploy mã mới

- **WHEN** app có pack v8 và `clue_detective` nhưng catalog server chưa có mã này
- **THEN** thẻ "Thám tử Đô Đô" vẫn hiện và chơi được bằng bản bundled

#### Scenario: Server tắt game

- **WHEN** catalog server đánh dấu `clue_detective` không hiển thị
- **THEN** thẻ không hiện trong catalog trẻ và lối vào trực tiếp màn chơi bị chặn

#### Scenario: Revert mã server không ẩn game

- **WHEN** commit server Thám tử bị revert (catalog server không còn mã `clue_detective`) trong khi bundled đã bật hiển thị
- **THEN** thẻ vẫn hiện bằng bản bundled, nên ẩn game phải dùng kill switch chứ không dùng revert
