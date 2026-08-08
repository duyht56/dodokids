# content-pipeline-flow Specification (delta)

## ADDED Requirements

### Requirement: Pipeline xử lý actionType compare_tap end-to-end
Pipeline (generate → review → assets → publish) SHALL chấp nhận seed và activity với `actionType: 'compare_tap'` như một trong các action type MVP. Generate prompt SHALL có chỉ dẫn payload compare_tap (objectAsset duy nhất + leftCount/rightCount/correctSide/mode, không questionImage); mechanics validator SHALL chạy bộ rule compare_tap trước LLM review; seed lint SHALL chấp nhận cặp (`math_compare_quantity`, `compare_tap`); publish guard SHALL kiểm objectAsset đã resolve imageUrl trước khi publish.

#### Scenario: Seed compare_tap chạy trọn pipeline
- **WHEN** một seed `math_compare_quantity` với actionType `compare_tap` và answerSpec dạng "vật = quả táo đỏ; trái = 5, phải = 2; hỏi = nhiều hơn; đúng = trái" được đưa vào pipeline
- **THEN** activity được generate với payload compare_tap hợp lệ, qua mechanics + review, objectAsset được sinh 1 ảnh transparent, và activity đạt trạng thái pending_review

#### Scenario: Publish guard chặn asset chưa resolve
- **WHEN** một activity compare_tap được publish khi objectAsset chưa có imageUrl
- **THEN** publish guard từ chối với lỗi nêu rõ asset thiếu

### Requirement: math_compare_quantity chuyển sang compare_tap
`math_compare_quantity` SHALL không còn thuộc nhóm PRIMITIVE_SKILLS (giải pháp thẻ chấm tạm thời); seed mới của skill này SHALL dùng actionType `compare_tap`. Các skill so sánh khác của domain cmp (length/height/weight/capacity) SHALL giữ single_select 2 options không questionImage.

#### Scenario: Seed mới của compare_quantity
- **WHEN** routine sinh seed tuần mới cho `math_compare_quantity`
- **THEN** seed có actionType `compare_tap` và answerSpec theo format compare_tap

#### Scenario: compare_length không đổi
- **WHEN** một seed `math_compare_length` (single_select) được generate
- **THEN** payload có 2 options là 2 vật cùng loại khác chiều đo, không có questionImage, và không bị ép sang compare_tap
