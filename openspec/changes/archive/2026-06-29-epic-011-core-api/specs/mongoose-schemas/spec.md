## ADDED Requirements

### Requirement: Schema children đầy đủ fields và indexes
Schema `children` SHALL mirror interface trong backlog: `childId` (unique, format `child_{nanoid}`), `name`, `age` (4|5|6), `createdAt`, `progress` (subdocument), `entitlement` (subdocument). Index unique trên `childId`.

#### Scenario: Child document được tạo với đủ fields
- **WHEN** một Child document được insert với `name` và `age` hợp lệ
- **THEN** document tồn tại trong DB với `childId`, `createdAt` được auto-set, `progress` có default values, `entitlement.plan = 'free'`, `entitlement.status = 'trial'`

#### Scenario: progress subdocument có đúng shape
- **WHEN** đọc `child.progress`
- **THEN** nó chứa `currentWeek: number`, `currentDay: number`, `completedLessons: string[]`, `streakCount: number`, `lastLessonDate: Date | null`, `stickersEarned: number[]`

### Requirement: Schema lessons và activities mirror kido-activity-schema.ts
Schema `lessons` SHALL có đủ fields của interface `Lesson`. Schema `activities` SHALL có `payload` dưới dạng `Schema.Types.Mixed` với `actionType` discriminator. Index: `lessons` trên `{ week, day, subject }`, `activities` trên `{ lessonId }` và `{ 'meta.week', status }`.

#### Scenario: Lesson document chứa đúng 6 activities reference
- **WHEN** một Lesson được query với `populate('activities')`
- **THEN** `lesson.activities` là array 6 Activity documents đúng thứ tự `activityIndex`

#### Scenario: Activity với actionType 'single_select' lưu payload đúng
- **WHEN** một Activity document với `actionType: 'single_select'` được insert
- **THEN** `activity.payload` lưu đầy đủ `questionImage`, `options`, `correctAnswer`, `layout` mà không bị Mongoose cắt bớt

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
