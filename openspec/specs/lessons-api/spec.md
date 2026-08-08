# lessons-api

## Purpose

Defines lesson retrieval APIs for current lessons, direct lesson lookup, and practice activity retrieval.
## Requirements
### Requirement: GET /lessons/today trả về lesson của ngày hôm nay cho child
`GET /lessons/today?childId=` SHALL lookup `child.progress.currentWeek` và `currentDay`, query lesson từ DB, resolve asset URLs trong payload, và trả về lesson đầy đủ. Nếu không có content trong DB SHALL trả về stub response với `isStub: true`.

#### Scenario: Trả về lesson thực từ DB
- **WHEN** `GET /lessons/today?childId=child_x` và lesson tương ứng `currentWeek`/`currentDay` tồn tại với status `imported`
- **THEN** response `200 OK` với full lesson object, `isStub: false`, `activities` array 6 items đầy đủ payload và asset URLs đã resolved

#### Scenario: Stub response khi chưa có content
- **WHEN** `GET /lessons/today?childId=child_x` và không có lesson nào trong DB khớp với currentWeek/currentDay
- **THEN** response `200 OK` với `{ "isStub": true, "lessonId": "stub-w01-d1", "lessonTitle": "Nội dung đang được cập nhật", "activities": [] }`

#### Scenario: childId thiếu trong query
- **WHEN** `GET /lessons/today` không có `childId`
- **THEN** response `400 Bad Request` với `{ "message": "childId is required" }`

#### Scenario: Response được cache Redis 5 phút
- **WHEN** cùng `GET /lessons/today?childId=child_x` được gọi 2 lần trong 5 phút
- **THEN** lần 2 trả về từ Redis cache (header `X-Cache: HIT`)

### Requirement: GET /lessons/:lessonId trả về lesson cụ thể
`GET /lessons/:lessonId` SHALL trả về lesson đầy đủ theo `lessonId` (format `w{week}-d{day}-{subject}`), `404` nếu không tìm thấy hoặc status không phải `imported`.

#### Scenario: Lấy lesson hợp lệ
- **WHEN** `GET /lessons/w01-d1-toan` và lesson tồn tại với status `imported`
- **THEN** response `200 OK` với full lesson object bao gồm `activities[]` đầy đủ

#### Scenario: Lesson không tồn tại hoặc chưa được import
- **WHEN** `GET /lessons/w99-d1-toan`
- **THEN** response `404 Not Found`

### Requirement: GET /lessons/practice/:childId trả về activity ôn luyện
`GET /lessons/practice/:childId` SHALL trả về mảng activity rút từ các lesson đã hoàn thành của child (spaced repetition), tối đa ~12 activity đã shuffle, và `[]` khi child chưa hoàn thành lesson nào. Route static `practice/:childId` SHALL được đăng ký TRƯỚC route động `:lessonId` để không bị shadow.

#### Scenario: Child có lesson đã hoàn thành
- **WHEN** child có completedLessons chứa activities
- **THEN** endpoint trả tối đa 12 `Activity` đã shuffle từ các lesson đó

#### Scenario: Chưa hoàn thành lesson nào
- **WHEN** `completedLessons` rỗng
- **THEN** endpoint trả `[]` với `200 OK`

#### Scenario: Practice route không bị shadow
- **WHEN** request tới `GET /lessons/practice/abc123`
- **THEN** nó được xử lý bởi practice handler, không phải `:lessonId` handler

### Requirement: GET /lessons/prefetch-manifest returns entitlement-capped asset URLs
`GET /lessons/prefetch-manifest?childId=&lookaheadWeeks=` SHALL return a manifest
of image, audio, and video URLs for imported lessons from the child's current
week through the requested lookahead, capped by entitlement and the V1 maximum of
4 lookahead weeks.

#### Scenario: Manifest is capped by entitlement
- **WHEN** a child requests lookahead content beyond their entitlement
- **THEN** the response `toWeek` does not exceed the week allowed by the existing entitlement policy

#### Scenario: Manifest includes activity media URLs
- **WHEN** imported lessons contain nested payload asset URLs and `audioFiles`
- **THEN** the response includes deduped URL entries classified as `image`, `audio`, or `video`

