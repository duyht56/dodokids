# content-pipeline-flow Specification (delta)

## MODIFIED Requirements

### Requirement: Pipeline generate/review/audio chấp nhận audio_select
Pipeline generate, review, và audio step SHALL xử lý `actionType: 'audio_select'` cho subject `tieng_viet`/`tieng_anh`. Generate SHALL sinh payload đúng contract (2–3 options có audioRef + altTextVi ≤4 từ, correctAnswer 1 optionId, không questionImage bắt buộc). Mechanics validator SHALL áp R-rule audio_select (số options 2..3, mỗi option có audioRef, correctAnswer khớp đúng 1 optionId, altTextVi ≤4 từ, cấm assetRef/correctAnswers). Audio step SHALL sinh clip cho mỗi option theo lang của subject (EN→ElevenLabs, VI→TTS), tái dùng `audio_library` cho audioRef type 'library'.

#### Scenario: Generate audio_select hợp lệ
- **WHEN** pipeline generate một activity `audio_select` cho skill `en_phonics_initial`
- **THEN** payload có 2–3 options mỗi option audioRef + altTextVi ≤4 từ, đúng 1 correctAnswer, và pass mechanics validator

#### Scenario: Audio step tái dùng library clip
- **WHEN** audio step gặp option audioRef type 'library' audioId 'cat' đã có trong `audio_library`
- **THEN** step KHÔNG gen lại mà trỏ audioUrl có sẵn và tăng `usageCount`, thêm activityId vào `usedInActivities`

#### Scenario: Audio step gen clip mới cho activity ref
- **WHEN** audio step gặp option audioRef type 'activity' cho âm "/b/" chưa có clip
- **THEN** step gen clip theo lang của subject và lưu vào activity audio, không đụng `audio_library`

### Requirement: Publish resolve audioRef sang URL
Publish/transfer SHALL resolve mỗi `audioRef.audioId` thành `audioUrl` thực (library hoặc activity) trước khi đẩy sang kido-server, và SHALL strip field `transcript` (chỉ sống Generate→Audio). Publish guard SHALL từ chối activity audio_select nếu bất kỳ option nào thiếu audioUrl resolve được.

#### Scenario: Publish với audioRef resolve đủ
- **WHEN** publish một activity audio_select mà mọi option đều có audioUrl resolve được
- **THEN** guard cho qua và payload publish chứa audioUrl, không còn transcript

#### Scenario: Publish chặn audioRef gãy
- **WHEN** một option có audioId không resolve được sang audioUrl
- **THEN** guard báo lỗi và chặn publish activity đó
