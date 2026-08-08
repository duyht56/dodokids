# mongoose-schemas Specification (delta)

## MODIFIED Requirements

### Requirement: Schema lessons và activities mirror kido-activity-schema.ts
Schema `lessons` SHALL có đủ fields của interface `Lesson`. Schema `activities` SHALL có `payload` dưới dạng `Schema.Types.Mixed` với `actionType` discriminator; enum `actionType` SHALL bao gồm `audio_select` bên cạnh 6 type hiện có (single_select, multi_select, sort_sequence, match_pair, count_tap, compare_tap) và watch_video. Index: `lessons` trên `{ week, day, subject }`, `activities` trên `{ lessonId }` và `{ 'meta.week', status }`.

#### Scenario: Activity với actionType 'audio_select' lưu payload đúng
- **WHEN** một Activity document với `actionType: 'audio_select'` được insert
- **THEN** insert thành công và `activity.payload` lưu đầy đủ `options` (mỗi option có `optionId`, `audioRef`, `altTextVi`) và `correctAnswer` mà không bị Mongoose cắt bớt

#### Scenario: Activity audio_select không kèm questionImage vẫn hợp lệ
- **WHEN** một Activity document `audio_select` được insert với payload không có `questionImage`/`promptImage`
- **THEN** insert thành công (đề bài nằm ở audioScript, payload không bắt buộc ảnh)

## ADDED Requirements

### Requirement: Collection audio_library
Hệ thống SHALL có collection `audio_library` mirror `assets_library` cho clip âm thanh tái dùng. Mỗi document SHALL gồm: `audioId` (word-key chuẩn hoá), `lang` (`'vi'` | `'en'`), `transcript`, `audioUrl` (nullable khi chưa gen), `usageCount`, `usedInActivities` (string[]), `status` (mirror AssetStatus), `createdAt`, `approvedAt` (nullable). Index duy nhất SHALL trên `{ audioId, lang }`.

#### Scenario: Get-or-create theo word-key
- **WHEN** pipeline yêu cầu clip cho `{ audioId: 'cat', lang: 'en' }` lần đầu
- **THEN** một document mới được tạo với `usageCount` 1; lần yêu cầu sau cho cùng key SHALL tái dùng document đó và tăng `usageCount`

#### Scenario: Cùng word khác lang là hai bản ghi
- **WHEN** cần clip `{ audioId: 'ca', lang: 'vi' }` và `{ audioId: 'ca', lang: 'en' }`
- **THEN** hai document riêng biệt tồn tại (unique theo cặp audioId+lang)
