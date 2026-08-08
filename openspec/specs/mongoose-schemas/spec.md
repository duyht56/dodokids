# mongoose-schemas Specification

## Purpose
Mongoose schemas for `kido-server` runtime collections (children, lessons/activities, assets_library/activity_assets, iap_receipts, pipeline_logs) — field completeness, index/uniqueness, and audit requirements that publish ingest and runtime reads depend on.
## Requirements
### Requirement: Schema children đầy đủ fields và indexes
Schema `children` SHALL mirror interface trong backlog: `childId` (unique, format `child_{nanoid}`), `name`, `age` (4|5|6), `createdAt`, `progress` (subdocument), `entitlement` (subdocument). Index unique trên `childId`.

#### Scenario: Child document được tạo với đủ fields
- **WHEN** một Child document được insert với `name` và `age` hợp lệ
- **THEN** document tồn tại trong DB với `childId`, `createdAt` được auto-set, `progress` có default values, `entitlement.plan = 'free'`, `entitlement.status = 'trial'`

#### Scenario: progress subdocument có đúng shape
- **WHEN** đọc `child.progress`
- **THEN** nó chứa `currentWeek: number`, `currentDay: number`, `completedLessons: string[]`, `streakCount: number`, `lastLessonDate: Date | null`, `stickersEarned: number[]`, `lessonStars: Map<string, number>`

#### Scenario: lessonStars mặc định rỗng và lưu best-score
- **WHEN** một child document mới được tạo
- **THEN** `progress.lessonStars` là map rỗng; khi một lesson hoàn thành với 2 sao, map chứa entry lessonId → 2

### Requirement: Schema lessons và activities mirror kido-activity-schema.ts
Schema `lessons` SHALL có đủ fields của interface `Lesson`. Schema `activities` SHALL có `payload` dưới dạng `Schema.Types.Mixed` với `actionType` discriminator; enum `actionType` SHALL bao gồm `audio_select` bên cạnh 6 type hiện có (single_select, multi_select, sort_sequence, match_pair, count_tap, compare_tap) và watch_video. Index: `lessons` trên `{ week, day, subject }`, `activities` trên `{ lessonId }` và `{ 'meta.week', status }`.

#### Scenario: Lesson document chứa đúng 6 activities reference
- **WHEN** một Lesson được query với `populate('activities')`
- **THEN** `lesson.activities` là array 6 Activity documents đúng thứ tự `activityIndex`

#### Scenario: Activity với actionType 'single_select' lưu payload đúng
- **WHEN** một Activity document với `actionType: 'single_select'` được insert
- **THEN** `activity.payload` lưu đầy đủ `questionImage`, `options`, `correctAnswer`, `layout` mà không bị Mongoose cắt bớt

#### Scenario: Activity với actionType 'audio_select' lưu payload đúng
- **WHEN** một Activity document với `actionType: 'audio_select'` được insert
- **THEN** insert thành công và `activity.payload` lưu đầy đủ `options` (mỗi option có `optionId`, `audioRef`, `altTextVi`) và `correctAnswer` mà không bị Mongoose cắt bớt

#### Scenario: Activity audio_select không kèm questionImage vẫn hợp lệ
- **WHEN** một Activity document `audio_select` được insert với payload không có `questionImage`/`promptImage`
- **THEN** insert thành công (đề bài nằm ở audioScript, payload không bắt buộc ảnh)

### Requirement: Schemas assets_library và activity_assets có compound index cho asset lookup
Schema `assets_library` SHALL có compound index trên `{ 'attributes.category', 'attributes.object', 'attributes.color', 'attributes.size', 'attributes.pose', 'attributes.background', status }` để pipeline query "tìm asset sẵn có" chạy nhanh.

#### Scenario: Compound index tồn tại sau khi schema sync
- **WHEN** Mongoose sync schemas với MongoDB
- **THEN** collection `assets_library` có compound index trên 7 fields thuộc `attributes` + `status`

#### Scenario: Tìm library asset theo attributes trả kết quả đúng
- **WHEN** query `assets_library.findOne({ 'attributes.category': 'animal', 'attributes.object': 'cat', status: 'approved' })`
- **THEN** query dùng compound index (explain plan hiện `IXSCAN`) và trả về đúng asset nếu tồn tại

### Requirement: Schema iap_receipts và pipeline_logs có đủ fields cho audit
Schema `iap_receipts` SHALL lưu `childId`, `platform`, `productId`, `purchaseToken/receiptData`, `verifiedAt`, `plan`, `expiresAt`, `isActive`. Schema `pipeline_logs` SHALL lưu `activityId`, `week`, `step`, `status`, `durationMs`, `error`, `retryCount`, `createdAt`.

#### Scenario: IAP receipt document được insert và query theo childId
- **WHEN** query `iap_receipts.find({ childId, isActive: true })`
- **THEN** trả về tất cả active subscriptions của child đó

### Requirement: Library assets store canonical identity and visual capabilities

The `assets_library` schema SHALL add structured identity fields for theme, object, color, variant, view, and style version; alpha/crop quality metadata; transform eligibility; and generation revision. Existing category/object/color/pose fields MAY remain as compatibility fields during migration.

#### Scenario: Generated guava record stores reusable identity

- **WHEN** a green whole-guava sprite is created
- **THEN** its document records normalized identity, alpha status, crop metadata, transform policy, style version, generation revision, and review status

### Requirement: Canonical sprite identity is unique

The schema SHALL enforce or transactionally guarantee uniqueness for the normalized logical sprite identity and style version. Concurrent requests SHALL not create duplicate logical assets.

#### Scenario: Duplicate concurrent insert

- **WHEN** two workers insert the same normalized sprite identity concurrently
- **THEN** one logical asset remains and both workflows resolve to it

### Requirement: Asset review and generation failures are auditable

Library assets SHALL retain generation/review status, structured failure code, rejection reason, generation revision, timestamps, and source prompt/style version needed to reproduce or deliberately regenerate an image.

#### Scenario: Alpha QA failure is stored

- **WHEN** background removal fails alpha quality checks
- **THEN** the library record preserves the failure code and metrics without marking the asset approved or alpha-capable

### Requirement: Activity display metadata survives persistence and publish

Optional count-tap surface metadata and option display variants SHALL survive pipeline persistence, publish payload construction, server ingest, lesson reads, and mobile mapping.

#### Scenario: Published comparison retains display variants

- **WHEN** an approved comparison activity is published with two options using `small` and `large`
- **THEN** the runtime lesson returned to mobile preserves both semantic variants unchanged

#### Scenario: Published pastel count-tap retains its surface token

- **WHEN** an approved pastel-mode count-tap activity is published with a resolved pastel token
- **THEN** the runtime lesson preserves the surface mode and token so mobile and web render the same stable surface

### Requirement: Collection audio_library
Hệ thống SHALL có collection `audio_library` mirror `assets_library` cho clip âm thanh tái dùng. Mỗi document SHALL gồm: `audioId` (word-key chuẩn hoá), `lang` (`'vi'` | `'en'`), `transcript`, `audioUrl` (nullable khi chưa gen), `usageCount`, `usedInActivities` (string[]), `status` (mirror AssetStatus), `createdAt`, `approvedAt` (nullable). Index duy nhất SHALL trên `{ audioId, lang }`.

#### Scenario: Get-or-create theo word-key
- **WHEN** pipeline yêu cầu clip cho `{ audioId: 'cat', lang: 'en' }` lần đầu
- **THEN** một document mới được tạo với `usageCount` 1; lần yêu cầu sau cho cùng key SHALL tái dùng document đó và tăng `usageCount`

#### Scenario: Cùng word khác lang là hai bản ghi
- **WHEN** cần clip `{ audioId: 'ca', lang: 'vi' }` và `{ audioId: 'ca', lang: 'en' }`
- **THEN** hai document riêng biệt tồn tại (unique theo cặp audioId+lang)

