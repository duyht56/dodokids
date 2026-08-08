## ADDED Requirements

### Requirement: GET /progress/:childId trả về progress hiện tại
`GET /progress/:childId` SHALL trả về `progress` subdocument của child kèm `entitlement` summary. Response được cache Redis với TTL 60 giây.

#### Scenario: Lấy progress thành công
- **WHEN** `GET /progress/child_xK3mP9qRvT` và child tồn tại
- **THEN** response `200 OK` với `{ "currentWeek": 1, "currentDay": 1, "completedLessons": [], "streakCount": 0, "lastLessonDate": null, "stickersEarned": [], "entitlement": { "plan": "free", "status": "trial", "trialWeeksUnlocked": 2 } }`

#### Scenario: Cache hit trả về nhanh
- **WHEN** cùng `GET /progress/:childId` được gọi lần 2 trong vòng 60 giây
- **THEN** response đến từ Redis cache (header `X-Cache: HIT`) và không query MongoDB

#### Scenario: childId không tồn tại
- **WHEN** `GET /progress/child_notexist`
- **THEN** response `404 Not Found`

### Requirement: PATCH /progress/:childId/complete-lesson cập nhật progress sau khi hoàn thành lesson
`PATCH /progress/:childId/complete-lesson` SHALL nhận `{ lessonId, stars, activityResults }`, cập nhật `completedLessons`, tính `streakCount`, advance `currentDay`/`currentWeek`, xác định `stickerEarned` (nếu D5), invalidate Redis cache, trả về updated progress.

#### Scenario: Hoàn thành lesson D1 → currentDay tăng lên 2
- **WHEN** `PATCH /progress/child_x/complete-lesson` với `{ "lessonId": "w01-d1-toan", "stars": 3, "activityResults": [...] }`
- **THEN** `child.progress.currentDay` trở thành `2`, `completedLessons` chứa `"w01-d1-toan"`, response trả về `{ ..., "streakCount": 1, "stickerEarned": false }`

#### Scenario: Hoàn thành D5 → stickerEarned = true, currentWeek tăng
- **WHEN** complete-lesson với `lessonId` có `day === 5` và child chưa earn sticker tuần đó
- **THEN** response chứa `"stickerEarned": true`, `currentWeek` tăng lên `currentWeek + 1`, `currentDay` reset về `1`

#### Scenario: Lesson đã hoàn thành trước đó — idempotent, không duplicate
- **WHEN** `lessonId` đã tồn tại trong `completedLessons`
- **THEN** response `200 OK` với progress không thay đổi (không thêm duplicate vào `completedLessons`)

#### Scenario: Redis cache bị invalidate sau complete-lesson
- **WHEN** complete-lesson thành công
- **THEN** key Redis tương ứng `progress:{childId}` bị xóa, `GET /progress/:childId` tiếp theo sẽ query MongoDB
