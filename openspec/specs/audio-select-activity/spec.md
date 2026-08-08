# audio-select-activity Specification

## Purpose
TBD - created by archiving change add-audio-select-activity. Update Purpose after archive.

## Requirements

### Requirement: Audio_select payload contract
Activity với `actionType: 'audio_select'` SHALL có payload gồm: `options` (2..3 phần tử `AudioOptionCard`), `correctAnswer` (optionId của đúng 1 đáp án), và `promptImage` (TÙY CHỌN, `AssetReference` — scaffold thị giác, thường bỏ trống). Mỗi `AudioOptionCard` SHALL gồm `optionId`, `audioRef` (`AudioReference`), `altTextVi`. Payload SHALL NOT chứa `assetRef` (thẻ ảnh), `questionImage` bắt buộc, hay `correctAnswers` (multi). Đề bài đọc cho bé SHALL nằm ở `audioScript.question`, không phải trong payload.

#### Scenario: Payload hợp lệ
- **WHEN** generator xuất activity audio_select với 3 options (mỗi option có audioRef + altTextVi ≤4 từ) và correctAnswer khớp một optionId
- **THEN** mechanics validator trả về danh sách lỗi rỗng

#### Scenario: correctAnswer không khớp option nào
- **WHEN** payload có options `opt_1`, `opt_2` nhưng correctAnswer là `opt_3`
- **THEN** validator báo lỗi correctAnswer phải là optionId của một option có trong danh sách

#### Scenario: Dùng thẻ ảnh bị chặn
- **WHEN** một option có `assetRef` (ảnh) thay vì `audioRef`
- **THEN** validator báo lỗi audio_select chỉ dùng audioRef, không dùng assetRef

### Requirement: Guardrail bộ nhớ làm việc
Vì cả đề lẫn đáp án đều là âm thanh, mechanics validator SHALL enforce: số `options` trong khoảng 2..3 (KHÔNG 4+); mỗi clip đáp án dài **≤ 4 từ** (đo qua `altTextVi`/`transcript`); và runtime SHALL cho phát lại mỗi clip **không giới hạn số lần**. Mục tiêu: bài đo năng lực ngôn ngữ, không đo trí nhớ nghe ngắn hạn.

#### Scenario: Bốn options bị chặn
- **WHEN** activity audio_select có 4 options
- **THEN** validator báo lỗi audio_select tối đa 3 options

#### Scenario: Clip đáp án quá dài bị chặn
- **WHEN** một option có altTextVi/transcript 6 từ
- **THEN** validator báo lỗi mỗi clip đáp án phải ≤ 4 từ

### Requirement: AudioReference và audio_library
Clip âm thanh của option SHALL được trỏ qua `AudioReference { type, audioId, altTextVi, transcript? }`. `type: 'library'` SHALL tra collection `audio_library` theo word-key chuẩn hoá và tái dùng (tăng `usageCount`); `type: 'activity'` SHALL trỏ clip đặc thù activity (âm vị/câu không phải từ thật, không tái dùng). `audio_library` SHALL lưu 1 clip/word-key/lang, mọi activity dùng lại cùng clip đó.

#### Scenario: Từ thật tái dùng qua library
- **WHEN** hai activity khác nhau cùng cần clip "cat" (lang en) với audioRef type 'library', audioId 'cat'
- **THEN** cả hai trỏ cùng một bản ghi `audio_library`, `usageCount` = 2, chỉ sinh clip một lần

#### Scenario: Âm vị không phải từ dùng activity ref
- **WHEN** option là âm đầu "/b/" (không phải từ tái dùng)
- **THEN** audioRef có type 'activity' và không tạo bản ghi library

### Requirement: Giới hạn subject
Activity `audio_select` SHALL chỉ hợp lệ cho `subject` `tieng_viet` hoặc `tieng_anh`. Seed lint và generate SHALL từ chối `audio_select` khi `subject === 'toan'`.

#### Scenario: audio_select trong môn Toán bị chặn
- **WHEN** một seed có subject 'toan' và actionType 'audio_select'
- **THEN** lint báo lỗi audio_select không dùng trong môn Toán

### Requirement: Render thẻ audio với nút phát lại độc lập
Mobile SHALL render 2–3 thẻ đáp án; mỗi thẻ SHALL có nút phát (▶, hit-target ≥ 44pt) phát `audioRef` của thẻ đó, tách biệt khỏi vùng chọn thẻ. Bé SHALL phát lại mỗi clip không giới hạn lần và chọn đáp án tại bất kỳ thời điểm nào. Chọn đúng `correctAnswer` SHALL báo correct; chọn sai SHALL báo wrong không phán xét rồi cho chọn lại (không mất trạng thái nghe).

#### Scenario: Nghe từng thẻ rồi chọn
- **WHEN** bé bấm play thẻ 1, nghe, bấm play thẻ 2, nghe, rồi tap chọn thẻ 2 là correctAnswer
- **THEN** kết quả correct được báo

#### Scenario: Phát lại nhiều lần
- **WHEN** bé bấm nút play của một thẻ 3 lần liên tiếp
- **THEN** clip phát lại đủ 3 lần, không bị khoá và không tự chuyển bài

#### Scenario: Chọn sai rồi thử lại
- **WHEN** bé chọn thẻ sai
- **THEN** thẻ đó báo trạng thái sai không phán xét, sau ~900ms bé chọn lại được, các clip vẫn phát lại được
