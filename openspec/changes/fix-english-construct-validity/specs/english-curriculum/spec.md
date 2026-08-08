## ADDED Requirements

### Requirement: Ranh giới đo được theo kênh kiểm tra

Chương trình tiếng Anh SHALL phân loại mỗi từ/cụm đích theo kênh kiểm được, và MUST NOT dùng kênh chọn-ảnh cho loại từ không có vật quy chiếu.

Bốn loại và kênh hợp lệ:

| Loại | Ví dụ | Kênh hợp lệ |
|---|---|---|
| Vật / thuộc tính / hành động nhìn thấy được | `cat`, `red`, `running` | audio → chọn ảnh |
| Hành vi ngữ dụng có ngữ cảnh | `hello`, `thank you` | tình huống → chọn clip (`audio_select`) |
| Biến cá nhân | tên thật, tuổi thật, sở thích thật của trẻ | offline-task (§6) |
| Từ chức năng | `I'm`, `a`, `is` | chỉ khi khác biệt ngữ pháp đổi nghĩa cả câu |

#### Scenario: Hành vi lời nói không được kiểm bằng chọn ảnh
- **WHEN** một seed có `targetWord` là hành vi lời nói (`hello`, `goodbye`, `thank you`) và `actionType` là `single_select`/`multi_select`
- **THEN** seed đó bị coi là không hợp lệ, vì mọi option buộc phải là ảnh người đang làm cử chỉ và trục phân biệt rút về quy ước vẽ tranh chứ không phải tiếng Anh

#### Scenario: Hành vi lời nói kiểm được qua audio_select
- **WHEN** một seed dùng `audio_select` với `promptImage` là tình huống (bạn vừa bước vào lớp) và options là clip (`Hello` / `Goodbye`)
- **THEN** seed hợp lệ, vì trẻ phải nối ngữ cảnh với clip tiếng Anh — đó là năng lực ngữ dụng tiếp nhận

#### Scenario: Biến cá nhân đẩy sang offline-task
- **WHEN** chỗ trống của mẫu câu là dữ liệu riêng của trẻ (tên thật, tuổi thật)
- **THEN** không sinh activity in-app cho chỗ trống đó; năng lực này chỉ đo qua offline-task với phụ huynh

### Requirement: Thứ tự 12 chủ đề theo trục ngữ pháp và khả năng đo

Bảng chủ đề SHALL đơn điệu theo trục ngữ pháp §3 (`be → have → like → can → prepositions → present continuous`) VÀ mỗi chủ đề MUST có đủ vốn từ đo được cho 32 activity (4 tuần × 8).

Q1 SHALL là `colors` (tuần 1–4) → `numbers` (5–8) → `shapes` (9–12). Cả ba thuộc khối `be` và có chi phí gen ảnh bằng 0.

#### Scenario: Q1 chạy hết vòng pipeline không tốn tiền gen ảnh
- **WHEN** seed Q1 chạy qua bước assets
- **THEN** mọi asset resolve từ `assets_library` hoặc Static Primitive Pack, không gọi Imagen

#### Scenario: Chủ đề mới phải qua kiểm khả thi vốn từ
- **WHEN** đề xuất một chủ đề vào bảng §4
- **THEN** chủ đề đó phải có ≥6 từ đích thuộc loại "vật/thuộc tính/hành động nhìn thấy được", hoặc phải khai báo rõ là chủ đề chạy bằng `audio_select`

### Requirement: hello là nghi thức xuyên suốt, không phải chủ đề chấm điểm

`hello` MUST NOT chiếm một block 4 tuần chấm điểm. Nội dung chào hỏi SHALL phân bổ vào: nghi thức mở bài (Đô Đô chào, không chấm), offline-task §6, và các item `audio_select` ngữ dụng rải xuyên chương trình.

#### Scenario: Nghi thức mở bài không sinh activity
- **WHEN** một lesson bắt đầu
- **THEN** Đô Đô chào bằng tiếng Anh như phơi nhiễm, và không có activity nào chấm điểm lời chào đó

#### Scenario: Self-introduction đo ở offline-task
- **WHEN** cần đo năng lực trẻ tự giới thiệu (`"Hello, I'm ___."`)
- **THEN** năng lực đó đo qua offline-task với phụ huynh, KHÔNG qua activity in-app — vì app không có mic và chỗ trống là tên riêng của trẻ

### Requirement: Mẫu câu là scaffold phơi nhiễm, không tự động là mastery claim

`sentencePattern` MUST NOT được diễn giải thành năng lực hiểu câu khi ảnh đúng được quyết định bởi một content word duy nhất.

#### Scenario: Câu một-từ-quyết-định không tính là nghe hiểu câu
- **WHEN** một seed dùng `"It's ___."` với chỗ trống là màu, và các option chỉ khác nhau ở màu
- **THEN** seed đó thuộc `en_word_recognition` về mặt đo lường, KHÔNG được gắn `en_listen_sentence`

#### Scenario: en_listen_sentence cần ≥2 thành phần câu phân biệt
- **WHEN** một seed gắn `en_listen_sentence`
- **THEN** các option phải khác nhau ở ≥2 thành phần của câu đang dạy, để nghe đúng một từ khoá là chưa đủ chọn đúng

### Requirement: Theme × skill feasibility matrix

Repo SHALL giữ một ma trận khai báo mỗi tổ hợp (chủ đề × skill) là `valid`, `invalid`, hoặc `asset-blocked`. Routine sinh seed MUST chọn skill từ ô `valid` của chủ đề đang làm, thay vì áp một template skill chung cho mọi chủ đề.

#### Scenario: Generator không được bịa skill cho chủ đề không đỡ được
- **WHEN** chủ đề là `colors` và skill `en_story_sequence` được đánh dấu `invalid` cho chủ đề đó
- **THEN** routine không sinh seed nào dùng `en_story_sequence` trong 4 tuần `colors`

#### Scenario: Ô asset-blocked không chặn seed nội dung
- **WHEN** một tổ hợp là `asset-blocked`
- **THEN** ma trận ghi rõ asset còn thiếu, và tổ hợp đó không được chọn cho tới khi asset sẵn sàng

### Requirement: Mẫu câu chỉ chạy bằng audio_select phải khai báo rõ

Chủ đề có `sentencePattern` là hành vi lời nói (ví dụ `animals`: `"Yes, I do. / No, I don't."`) SHALL khai báo pattern đó chỉ sinh được qua `audio_select`.

#### Scenario: animals không sinh bài chọn ảnh cho mẫu câu trả lời
- **WHEN** sinh seed cho chủ đề `animals` nhắm vào `sentencePattern`
- **THEN** seed phải dùng `audio_select`; từ vựng con vật vẫn dùng chọn ảnh bình thường
