## Purpose

Định nghĩa bộ art thưởng 48 tuần của Kido sao cho mỗi sticker có identity ổn định, dễ nhận biết với trẻ 4-6 tuổi, hiển thị tốt offline trên mobile và có thể kiểm tra/review lại một cách deterministic.

## ADDED Requirements

### Requirement: Fixed 48-sticker identity mapping
Hệ thống SHALL cung cấp đúng 48 PNG khác nhau cho `sticker-w01` đến `sticker-w48`, giữ nguyên mapping hiện tại giữa stable ID, week, world, Vietnamese name và `world-NN/week-WW.png`.

#### Scenario: Complete catalog export
- **WHEN** asset pack cuối được kiểm tra
- **THEN** có đúng 48 file tại bốn world, week liên tục 1-48, không thiếu/không trùng stable ID hoặc asset path

#### Scenario: Runtime compatibility
- **WHEN** asset pack mới thay placeholder hiện tại
- **THEN** mobile tiếp tục resolve bằng static `require` hiện có mà không cần đổi reward API, catalog identity hoặc navigation contract

### Requirement: Child-recognizable visual language
Mỗi sticker SHALL thể hiện một chủ thể chính đúng với Vietnamese name, có silhouette rõ, tỷ lệ hình lớn và chi tiết vừa đủ để trẻ 4-6 tuổi phân biệt ở cả collection cell nhỏ và reward reveal lớn.

#### Scenario: Small-cell recognizability
- **WHEN** sticker được render trong grid bốn cột trên phone
- **THEN** chủ thể chính vẫn nhận biết được mà không cần đọc label hoặc phóng to

#### Scenario: Similar-subject differentiation
- **WHEN** hai sticker có chủ thể gần nhau như `Mầm xanh`/`Lá non`, `Mặt trời`/`Hoa mặt trời` hoặc `Tên lửa`/`Tàu không gian`
- **THEN** silhouette, pose và dấu hiệu nhận dạng SHALL khác nhau rõ ràng, không chỉ đổi màu

### Requirement: Cohesive four-world art direction
Bộ sticker SHALL dùng cùng một phong cách mascot-adjacent với hình khối tròn, thân thiện, ánh sáng mềm, sticker rim màu kem và palette Kido; mỗi world SHALL có palette/motif riêng nhưng vẫn thuộc cùng một visual family.

#### Scenario: World grouping
- **WHEN** xem contact sheet gồm 12 sticker của một world
- **THEN** world đó có cảm giác nhất quán về palette và motif, đồng thời không làm các chủ thể bị hòa lẫn

#### Scenario: World completion sticker
- **WHEN** xem tuần 12, 24, 36 hoặc 48
- **THEN** sticker là một crest/emblem tổng kết world tương ứng, không dùng chữ và vẫn phân biệt được với 11 sticker thường

### Requirement: Production-ready transparent PNG exports
Mỗi asset cuối SHALL là PNG vuông 512x512 có alpha channel, góc canvas trong suốt, chủ thể nằm trọn trong safe area, không text, watermark, background scene, cast shadow hoặc chroma-key fringe.

#### Scenario: Alpha validation
- **WHEN** validation đọc bốn góc và alpha coverage của file
- **THEN** bốn góc trong suốt, subject coverage nằm trong ngưỡng quy định và không có dải nền phẳng còn sót lại

#### Scenario: Mobile rendering
- **WHEN** sticker hiển thị trên nền sáng, nền pastel và trạng thái locked tint
- **THEN** silhouette không bị cắt, không có halo màu key và vẫn giữ tương phản rõ

### Requirement: Deterministic review and provenance artifacts
Asset pack SHALL có manifest ghi stable ID, subject/name, world, final path, source prompt, chroma key, dimensions, alpha result và file hash; đồng thời có contact sheet toàn bộ 48 sticker và từng world.

#### Scenario: Reproducible review
- **WHEN** reviewer chọn một sticker từ contact sheet
- **THEN** reviewer truy được prompt, output path, hash và validation result tương ứng trong manifest

#### Scenario: Duplicate-art detection
- **WHEN** validation tính hash/perceptual identity của 48 file
- **THEN** pack bị fail nếu hai stable ID dùng cùng một bitmap hoặc nếu asset không khớp subject mapping

### Requirement: Staged replacement and rollback
Generated files SHALL được giữ trong staging cho đến khi đủ 48 file và vượt automated quality gate; chỉ sau đó mới thay 48 project paths trong một bước kiểm soát được, với placeholder mascot gốc vẫn có thể phục hồi từ asset nguồn hiện có.

#### Scenario: Partial generation failure
- **WHEN** một hoặc nhiều image generation/post-process job thất bại
- **THEN** các placeholder runtime hiện tại vẫn nguyên vẹn và pack chưa hoàn chỉnh không được copy một phần vào catalog paths

#### Scenario: Full pack promotion
- **WHEN** đủ 48 file vượt dimension, alpha, uniqueness, mapping và contact-sheet review gate
- **THEN** toàn bộ fixed paths được thay cùng một đợt và reward contract script tiếp tục pass
