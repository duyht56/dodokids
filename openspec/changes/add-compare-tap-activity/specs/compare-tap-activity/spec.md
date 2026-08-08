# compare-tap-activity Specification (delta)

## ADDED Requirements

### Requirement: Compare_tap payload contract
Activity với `actionType: 'compare_tap'` SHALL có payload gồm: `objectAsset` (MỘT AssetReference duy nhất, vật đơn lẻ, dùng chung cho cả 2 bên), `objectName` (tên tiếng Việt của vật), `leftCount` và `rightCount` (số nguyên 1..6, khác nhau), `correctSide` (`'left'` | `'right'`), `mode` (`'more'` | `'less'`). Payload SHALL NOT chứa `questionImage` hoặc `options`.

#### Scenario: Payload hợp lệ
- **WHEN** generator xuất activity compare_tap với objectAsset "quả táo đỏ", leftCount 5, rightCount 2, mode 'more', correctSide 'left'
- **THEN** mechanics validator trả về danh sách lỗi rỗng

#### Scenario: correctSide không khớp mode
- **WHEN** payload có leftCount 5, rightCount 2, mode 'more' nhưng correctSide 'right'
- **THEN** validator báo lỗi correctSide phải là bên có số lượng lớn hơn khi mode là 'more'

#### Scenario: Hai bên bằng nhau bị chặn
- **WHEN** payload có leftCount 4 và rightCount 4
- **THEN** validator báo lỗi leftCount và rightCount phải khác nhau

### Requirement: Chênh lệch số lượng theo difficulty
Mechanics validator SHALL kiểm chênh lệch `|leftCount − rightCount|` theo `meta.difficulty`: warmup ≥ 3, core ≥ 2, challenge ≥ 1. Chênh lệch nhỏ (ví dụ 4 vs 5) SHALL hợp lệ ở mức challenge — thay thế anti-pattern cũ cấm chênh lệch nhỏ, vì tap-đếm cho bé công cụ kiểm chứng thay vì chỉ ước lượng bằng mắt.

#### Scenario: Chênh lệch 1 ở warmup bị chặn
- **WHEN** activity warmup có leftCount 4, rightCount 5
- **THEN** validator báo lỗi chênh lệch phải ≥ 3 ở mức warmup

#### Scenario: Chênh lệch 1 ở challenge hợp lệ
- **WHEN** activity challenge có leftCount 4, rightCount 5
- **THEN** validator không báo lỗi chênh lệch

### Requirement: Sinh asset — 1 sprite transparent duy nhất
Assets step SHALL sinh đúng MỘT ảnh cho compare_tap: `objectAsset` với background hint `transparent` (vật đơn lẻ cắt nền sạch, như targetAsset của count_tap). Hệ thống SHALL NOT sinh ảnh nền scene hay ảnh nhóm vật cho compare_tap; app render 2 khung bằng gradient pastel và nhân bản sprite.

#### Scenario: Chỉ 1 Imagen call
- **WHEN** assets step xử lý activity compare_tap
- **THEN** chỉ objectAsset được đưa vào hàng sinh ảnh, với prompt vật đơn lẻ nền transparent

### Requirement: Render 2 khung sprite nhân bản chính xác
Mobile SHALL render 2 khung trái/phải cạnh nhau; khung trái chứa đúng `leftCount` sprite và khung phải đúng `rightCount` sprite, mọi sprite render từ cùng `objectAsset`. Vị trí sprite trong mỗi khung SHALL lấy từ layout seeded không chồng lấn (dẫn xuất từ activity id + suffix bên), ổn định qua re-mount và khác nhau giữa 2 bên.

#### Scenario: Số lượng đúng tuyệt đối
- **WHEN** activity có leftCount 5, rightCount 2 được render
- **THEN** khung trái hiển thị đúng 5 sprite và khung phải đúng 2 sprite, tất cả cùng một hình vật

#### Scenario: Layout ổn định
- **WHEN** cùng activity được unmount rồi render lại
- **THEN** vị trí sprite mỗi bên giữ nguyên như lần render trước

### Requirement: Tap-đếm từng bên (giàn giáo)
Mỗi khung SHALL có counter độc lập. Tap một sprite chưa đếm SHALL highlight sprite (viền coral + badge số thứ tự), tăng counter của bên đó, và đọc số đếm tiếp theo của bên đó qua TTS. Sprite đã đếm SHALL NOT đếm lại. Hệ thống SHALL có nút reset xóa toàn bộ trạng thái đếm 2 bên.

#### Scenario: Đếm bên trái không ảnh hưởng bên phải
- **WHEN** bé đã tap 3 sprite bên trái rồi tap 1 sprite bên phải
- **THEN** counter trái hiển thị 3, counter phải hiển thị 1, và TTS đọc "Một" (số đếm của bên phải)

#### Scenario: Reset xóa cả 2 bên
- **WHEN** bé bấm nút đếm lại
- **THEN** mọi highlight, badge và counter của cả 2 khung về 0

### Requirement: Trả lời bằng chọn khung, bất cứ lúc nào
Hệ thống SHALL cho phép chọn đáp án (vùng chọn của khung trái hoặc phải, hit-target ≥ 44pt, tách biệt khỏi vùng sprite) tại BẤT KỲ thời điểm nào — không yêu cầu đếm xong. Chọn đúng `correctSide` SHALL báo kết quả correct; chọn sai SHALL báo wrong, hiển thị phản hồi sai trên khung đã chọn, rồi tự reset trạng thái chọn sau ~900ms để bé đếm tiếp và chọn lại.

#### Scenario: Trả lời không cần đếm
- **WHEN** bé chưa tap sprite nào và chọn ngay khung có nhiều vật hơn (mode 'more')
- **THEN** kết quả correct được báo

#### Scenario: Chọn sai rồi thử lại
- **WHEN** bé chọn khung sai
- **THEN** khung đó hiển thị trạng thái sai, kết quả wrong được báo, và sau ~900ms bé có thể tiếp tục đếm và chọn lại; trạng thái đếm không bị mất
