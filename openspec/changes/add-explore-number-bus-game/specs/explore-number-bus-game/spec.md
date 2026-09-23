# Spec: explore-number-bus-game

## Purpose

Định nghĩa "Xe buýt hai tầng" (`number_bus`) — game Khám phá offline dạy tách
– gộp trong phạm vi 10 và chiến lược đếm thêm. Một exerciseType, mode qua
`params.mode` (GĐ1: `board_all`, `free_split`, `next_number`, `missing_part`,
`count_on`), generator deterministic + validator độc lập với luật "anti-copy
chỉ áp cho distractor", authored runPolicy 6 slot phẳng, re-model off-by-one
trong-bài, và support chỉ-TRỎ-không-ĐẾM-hộ. Chi tiết thiết kế: `design.md`
của change này (nguồn chuẩn khi spec cần diễn giải).

## ADDED Requirements

### Requirement: Puzzle local deterministic đúng envelope hiện hành

Game SHALL sinh mọi bài local từ generator có version + random seed, không
request mạng, chỉ dependency bundled. Envelope SHALL đúng shape
`ExploreExerciseEnvelope` hiện hành — không field top-level mới; `params` SHALL
chứa `level` (bắt buộc, variety tra theo đây) và `mode` (discriminator);
`params.options` CHỈ hợp lệ cho mode chọn-thẻ (`next_number`, `five_and`,
`count_on`, `make_ten`) và validator SHALL reject `options` ở mode dựng
(`board_all`, `free_split`, `missing_part`). Generator SHALL stamp
`runSlotKey` từ runSlot được truyền vào. Replay cùng (level, seed) SHALL
byte-identical sau khi bỏ `variantKey`/`bucketKey`, và validator SHALL reject
envelope không replay được.

#### Scenario: Chơi trong airplane mode

- **WHEN** bé mở `number_bus` không có mạng
- **THEN** bài mới được sinh, validate và hiển thị mà không có API request

#### Scenario: Mode dựng bị gắn options

- **WHEN** một envelope `missing_part` bị sửa để chứa `params.options`
- **THEN** validator reject

#### Scenario: Replay cùng seed

- **WHEN** generator nhận cùng (level, seed) hai lần
- **THEN** hai envelope byte-identical sau khi bỏ `variantKey`/`bucketKey`

### Requirement: Bất biến số học per-mode, anti-copy chỉ áp cho distractor

Validator SHALL tự suy lại đáp án bằng số học, độc lập với generator, theo
bảng bất biến mục 5 của `design.md`. Luật anti-copy SHALL phát biểu là: đáp án
đúng LUÔN có mặt trong options với mọi tham số; chỉ distractor mới bị cấm
trùng số đang nhìn thấy. Cụ thể: `make_ten` với k=5 SHALL hợp lệ (đáp án 5 =
k, cặp 5–5); `missing_part` với whole = 2×shown (bond đôi) SHALL hợp lệ tường
minh; `count_on` options L3–L4 SHALL BẮT BUỘC chứa distractor a+b−1, với
ngoại lệ documented duy nhất b=1 (distractor a+b−1 = a trùng numeral trên cửa
— được phép vì chính nó là lỗi chẩn đoán); `next_number` với n=1 SHALL dùng
options {2, 3, 4} và SHALL không render "0" khi level < L3.

#### Scenario: make_ten k=5

- **WHEN** generator sinh bài `make_ten` với k=5
- **THEN** đáp án 5 có mặt trong options và validator chấp nhận bài

#### Scenario: Bond đôi ở missing_part

- **WHEN** bài `missing_part` có whole = 6, shown = 3
- **THEN** validator chấp nhận (hidden = shown là hợp lệ)

#### Scenario: Thiếu bẫy off-by-one

- **WHEN** một bài `count_on` L3–L4 bị sửa để options không chứa a+b−1
- **THEN** validator reject

### Requirement: Coverage hai chiều mode↔level và vai-trò-slot

Bảng mode↔level (design.md mục 3) và bảng vai-trò-slot (design.md mục 6) SHALL
là nguồn duy nhất quyết định mode; generator SHALL không tự quyết mode ngoài
hai bảng. Contract script SHALL assert hai chiều: (a) mọi mode declared của
giai đoạn đều reachable từ ít nhất một ô (slot × level), (b) mọi exercise sinh
ra có mode nằm trong bảng của level đó. GĐ1 SHALL chỉ khai 5 mode GĐ1. Tại
L3, không slot `count_on` chấm điểm nào SHALL đứng trước slot `next_number`
(warm-up tiên quyết).

#### Scenario: Mode khai mà không reachable

- **WHEN** một mode được khai trong config nhưng không ô (slot × level) nào
  sinh ra nó
- **THEN** contract script fail (chống dead-mode)

#### Scenario: Warm-up đứng sau bài cửa đóng ở L3

- **WHEN** runPolicy L3 bị sửa để một slot `count_on` chấm điểm đứng trước
  slot `next_number`
- **THEN** contract script fail

### Requirement: board_all giữ danh tính hai phần sau khi gộp

Bài `board_all` SHALL đặt hai nhóm ở hai bến, cùng loài, thuộc tính duy nhất
phân biệt hai phần là vị trí bến/tầng, mọi thuộc tính khác đồng nhất. Đô Đô
SHALL đếm mẫu từng bến (clip số) trước khi mở boarding. Nhóm bến 1 SHALL lên
tầng dưới, nhóm bến 2 SHALL lên tầng trên — sau khi gộp hai phần vẫn nhìn
thấy được. Mỗi chạm hợp lệ SHALL phát một tiếng đếm ([number:i]); chạm lại
bạn đã lên xe SHALL không làm bộ đếm nhảy. Mantra "Gộp [A] và [B] được [N]"
SHALL đồng bộ highlight: tầng dưới khi đọc [A], tầng trên khi đọc [B], cả xe
khi đọc [N] (reduce-motion: đổi độ đậm thay pulse). L1 SHALL không có thẻ
chọn — hoàn thành kiểu stack_tower.

#### Scenario: Gộp xong vẫn thấy hai phần

- **WHEN** bé mời hết 2 bạn bến trái và 1 bạn bến phải lên xe
- **THEN** xe hiển thị 2 bạn tầng dưới + 1 bạn tầng trên, và mantra highlight
  từng tầng theo lời đọc

#### Scenario: Chạm lại bạn đã lên

- **WHEN** bé chạm một bạn đã ngồi trên xe
- **THEN** bạn cười nhún vai, không phát tiếng đếm mới, bộ đếm giữ nguyên

### Requirement: free_split chấp nhận mọi phân hoạch và có lượt chia lại thật

Bài `free_split` SHALL chấp nhận MỌI phân hoạch p, q ≥ 1 với p + q = whole là
đáp án đúng (`acceptAll`) và đọc mantra "[whole] gồm [p] và [q]". Sau mantra
lượt 1, "Còn cách chia nào nữa nhỉ?" SHALL giữ nguyên bảng và mở lại input;
lượt 2 hợp lệ khi bố cục khác lượt 1 theo cặp CÓ THỨ TỰ (p, q); bấm Xong với
bố cục cũ SHALL kết bài bình thường qua mantra, không tính miss. Một tầng
trống khi bấm Xong SHALL được nhắc ("Tầng nào cũng cần có bạn nha!") và không
tính miss. Guidance SHALL không gợi cách chia nào "đúng hơn".

#### Scenario: Hai cách chia có thứ tự

- **WHEN** bé chia 5 thành (2, 3) ở lượt 1 rồi (3, 2) ở lượt 2
- **THEN** cả hai lượt được đọc mantra trân trọng và bài hoàn thành

#### Scenario: Giữ nguyên bố cục cũ ở lượt 2

- **WHEN** bé bấm Xong lượt 2 mà không đổi bố cục
- **THEN** Đô Đô đọc lại mantra và kết bài, không `onAnswer(false)`

### Requirement: missing_part công bố tổng bằng audio và dựng-rồi-kiểm

Bài `missing_part` SHALL mở đầu audioRefs bằng công bố tổng («Có tất cả»
[number:whole] «bạn nhé.») trước câu hỏi — clip số bundled sẵn nên không rơi
vào im lặng best-effort. Tầng dưới SHALL hiển thị k bạn (khóa); tầng trên
SHALL là rèm bán trong suốt. Sức chứa mỗi tầng SHALL cố định theo level (L2:
1 hàng × 5 ghế; L3 trở lên: 2 hàng × 5 ghế) và SHALL KHÔNG BAO GIỜ phụ thuộc
đáp án — ghế trống còn lại khi bé đúng là trạng thái bình thường, được vẽ
trung tính (không viền đứt, không trông như ô cần lấp). Đường thêm bạn duy
nhất SHALL là BẾN XE (ô ≥ 88pt, luôn đúng một bạn đang chờ, không có hàng
đợi đếm được): chạm bạn ở bến → bạn nhảy lên trốn sau rèm; bến SHALL không
dùng glyph "+" và SHALL không nằm trên nóc xe. Bạn đã thêm SHALL hiển thị
dạng silhouette sau rèm — đếm được và chạm được (chạm để bạn đó về bến).
Kiểm tra: đúng → rèm mở, đếm kiểm chứng + mantra, màn đứng yên tới khi bé bấm
tiếp; thiếu → đúng MỘT cái đuôi/tai ló ra dưới mép rèm + `nb_still_hiding`;
thừa → đúng MỘT silhouette của bé lắc lư ngơ ngác rồi đứng yên +
`nb_nobody_there`. Tín hiệu thừa/thiếu SHALL giống nhau bất kể lệch bao
nhiêu (không bao giờ lộ độ lệch), giữ nguyên bạn cho bé tự sửa, câu báo SHALL
không chứa số.

#### Scenario: Trẻ chưa đọc được chữ số vẫn biết tổng

- **WHEN** một bài `missing_part` bắt đầu với biển số dạng numeral
- **THEN** audio công bố tổng phát trước câu hỏi, và audioRefs chứa
  [number:whole] (assert được ở contract script)

#### Scenario: Đoán thừa

- **WHEN** bé thêm nhiều bạn hơn phần thiếu và bấm kiểm tra
- **THEN** đúng một silhouette lắc lư rồi đứng yên, các bạn đã thêm giữ
  nguyên cho bé tự bớt, câu báo không chứa chữ số hay từ chỉ số lượng

#### Scenario: Ghế trống không lộ đáp án

- **WHEN** hai bài L3 có cùng tổng nhưng phần thiếu khác nhau
- **THEN** cả hai có cùng số ghế mỗi tầng; chỉ có biển tổng và số bạn đang
  thấy là khác

### Requirement: count_on cửa đóng với re-model off-by-one trong-bài

Bài `count_on` SHALL hiển thị numeral a trên cửa xe đóng — cố ý không kèm
chấm đếm được — và đọc «Trong xe có» [a] «bạn rồi nha.»; b ∈ 1–3 bạn chờ ở
bến. Mỗi chạm đưa một bạn lên xe SHALL phát [number:a+i]. L3 SHALL forced-tap
(thẻ chỉ hiện sau khi chạm hết); L4 thẻ hiện ngay. Khi bé chọn thẻ a+b−1,
renderer SHALL `onAnswer(false)` như thường rồi tự chạy re-model NGAY TRONG
bài: thẻ tạm ẩn → đọc «Số» [number:a] «ở trong xe rồi, mình đếm thêm nha!»
(ngoại lệ documented của luật không-số — a đang hiển thị) → chuyển forced-tap
đếm [a+1]…[a+b] → thẻ hiện lại cho bé chọn lại. Đáp án a+b SHALL không bao
giờ visible trước khi chọn.

#### Scenario: Đếm thêm theo chạm

- **WHEN** cửa ghi 5 và bé chạm lần lượt 2 bạn chờ
- **THEN** audio phát "sáu" rồi "bảy", không đếm lại từ 1

#### Scenario: Chọn thẻ kém-1

- **WHEN** bé chọn thẻ a+b−1
- **THEN** miss được tính, thẻ tạm ẩn, câu re-model phát, bài chuyển
  forced-tap đếm mẫu, rồi thẻ hiện lại — không lộ đáp án ở bất kỳ bước nào

### Requirement: Authored runPolicy 6 slot phẳng với level hiệu dụng

`number_bus` SHALL khai runPolicy `explore-run-v1` gồm 6 slot phẳng, slotKey
unique; vai trò slot SHALL chở qua `runSlot.constraints`
(`NumberBusSlotConstraints`: generatorHint/levelOffset) — KHÔNG đổi shape
`ExploreRunSlot`/`ExploreRunPolicy`. Nhánh authored của `createExploreRunBatch`
SHALL resolve level hiệu dụng = clamp(startingLevel + (levelOffset ?? 0),
game.levels) thay vì đọc `runSlot.level` tĩnh (GĐ1 mọi offset = 0), và
`params.level` SHALL bằng level được yêu cầu. Slot s1 SHALL là bài tách-gộp và
generator của s1 SHALL prepend nghi thức mở màn `nb_today` + [number:whole]
vào audioRefs. Contract script SHALL smoke-test trọn nhánh authored (lần đầu
có game thật dùng nhánh này).

#### Scenario: startingLevel per-game điều khiển run

- **WHEN** phụ huynh đặt startingLevel hiệu dụng L3 (qua GĐ0)
- **THEN** cả 6 slot sinh bài L3 theo bảng vai-trò-slot, `params.level` = 3 ở
  mọi envelope

#### Scenario: Nghi thức mở màn deterministic

- **WHEN** run được sinh với cùng seed
- **THEN** audioRefs của s1 luôn mở đầu bằng `nb_today` + [number:W] với W =
  whole của chính bài s1

### Requirement: Support chỉ TRỎ không ĐẾM hộ, dùng cơ chế leo thang sẵn có

Game SHALL không thêm supportPolicy mới — dùng nguyên leo thang sẵn có của màn
chơi (miss 1 → support 1, miss 2 → support 2, carry-over). Support 1 SHALL chỉ
TRỎ (pulse bạn ở bến/bạn kế tiếp/rèm lay + clip nhắc không số), không bao
giờ đếm hộ hay lộ đáp án. Support 2 SHALL mở đường quay về đếm-tất-cả ngay
trong bài nhưng SHALL KHÔNG BAO GIỜ làm lộ phần chính là đáp án: ở `count_on`
cửa xe trong dần hiện a chấm mờ (a vốn đang hiển thị bằng numeral); ở
`missing_part` biển tổng trên nóc hiện N chấm mờ theo cấu trúc hàng 5, không
đánh dấu sẵn chấm nào ứng với bạn đang thấy, và SHALL không hiện chấm nào
trong vùng rèm; ở mode thẻ SHALL làm mờ option không thể đúng. Cờ `reducedSupport` SHALL tắt micro-cue ghost-hand
nhưng giữ nguyên leo thang support. Các câu báo/hint thuộc tập
{`nb_nobody_there`, `nb_still_hiding`, `nb_both_decks`, `nb_split_any`,
`nb_another`, `nb_count_model`} SHALL không chứa chữ số lẫn từ chỉ số lượng —
nghiêm tuyệt đối, không allowlist (mảnh re-model nằm ngoài tập quét, là ngoại
lệ documented).

#### Scenario: Support 1 không đếm hộ

- **WHEN** bé miss lần đầu ở `missing_part`
- **THEN** rèm lay/bạn ở bến pulse kèm clip nhắc không số; số bạn sau rèm
  không được đọc to, không option/ô nào bị đánh dấu là đáp án

#### Scenario: Support 2 ở missing_part không lộ phần thiếu

- **WHEN** bé miss lần hai ở `missing_part`
- **THEN** biển tổng hiện N chấm mờ, vùng rèm không hiện chấm nào, và không
  chấm nào được đánh dấu sẵn là "đã có"

#### Scenario: Máy quét transcript

- **WHEN** contract script quét transcript của tập clip báo/hint liệt kê
- **THEN** không transcript nào chứa chữ số hay từ chỉ số lượng

### Requirement: Audio một batch pack v4, best-effort trừ công-bố-tổng

Toàn bộ clip mới của game (kể cả câu của mode GĐ2) SHALL nằm trong MỘT batch
duy nhất → pack `explore-audio-vi-v4`, namespace `nb_*` + các mảnh ghép, mọi
câu ≤ 12 từ, đúng persona Đô Đô (xưng "Đô Đô" gọi "bé"); danh sách clip chốt
tại design.md mục 7 và mirror trong
`kido-pipeline/src/explore/exploreAudioInventory.ts`. `next_number` SHALL tái
dùng clip `number_which_after` sẵn có (không thu clip mới). `nb_chant` ("Tập
tầm vông, tay không tay có!") SHALL là clip đọc-nhịp có tiêu chí cắt tại Human
Gate — game không phụ thuộc chant. Thiếu clip SHALL không chặn chơi (im lặng,
promptVi + hình tự đứng), trừ công-bố-tổng của `missing_part` vốn là clip số
đã bundled. Transcript SHALL verbatim với text màn hình, key sinh cùng chỗ với
text trong renderer.

#### Scenario: Pack chưa export

- **WHEN** pack v4 chưa được approve/export
- **THEN** các key `nb_*` resolve về im lặng, game vẫn chơi được đầy đủ, và
  công bố tổng của missing_part vẫn phát (clip số bundled)

### Requirement: Feedback không tiêu cực, không trạng thái thua

Chưa đúng SHALL không bao giờ là lời phán xét: phản hồi vật lý (rèm lay, ghế
nhún, bạn "tụt" về bến), câu báo không số, không countdown, không "Thua",
không streak; run 6 slot kết bằng "Mình luyện xong rồi!" — chơi lại là lựa
chọn. Thẻ đáp án numeral SHALL kèm dải chấm mờ làm neo pictorial. Ký hiệu
+/−/= SHALL bị cấm trước L5 (L5 GĐ2: chỉ hiện SAU khi đúng, lớp phủ tĩnh).
Mọi motion SHALL dùng native driver và SHALL bỏ qua khi hệ thống bật reduced
motion. Emoji SHALL chỉ là nội dung puzzle, không phải icon UI hay mascot.
Game SHALL không persist hay report gì ngoài `onAnswer`
(`explore-stateless-privacy`).

#### Scenario: Reduced motion

- **WHEN** hệ thống bật reduced motion
- **THEN** chạm vẫn cập nhật state/âm thanh/`onAnswer`, mantra dùng đổi độ đậm
  thay pulse, không animation bay/lay

### Requirement: Đồng bộ contract codes và catalog

`number_bus` SHALL được thêm vào `EXPLORE_GAME_CODES` ở cả ba nơi
(`docs/kido-explore-contract.ts`, `mobile/src/types/explore.ts`,
`kido-server/src/modules/explore/explore.types.ts`), và trong cùng change ba
danh sách SHALL được đồng bộ về nguồn chuẩn mobile hiện hành + `number_bus`
(12 code) — gỡ thế hệ cũ `number_explorer`/`odd_one_out`/`sort_bins` khỏi
docs/server, thêm `ordinal_position`/`number_chain`/`spin_pattern` còn thiếu.
Catalog child-facing SHALL theo thứ tự mới có chủ đích: `…memory_match →
stack_tower → number_bus → number_chain → mirror_build…` (comment đầu mảng
ghi thứ tự là sư phạm). kido-server SHALL cập nhật registry + assertion số
game public tương ứng.

#### Scenario: Ba danh sách đồng nhất

- **WHEN** so sánh `EXPLORE_GAME_CODES` ở docs, mobile và kido-server sau
  change
- **THEN** ba danh sách bằng nhau và chứa `number_bus`
