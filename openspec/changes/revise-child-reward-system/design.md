## Context

Runtime hiện có ba nguồn trạng thái liên quan reward: MongoDB trong `kido-server`, `authStore` persisted trên mobile, và dữ liệu suy diễn riêng trong Achievements. `LessonPlayerScreen` gọi `PATCH /progress/:childId/complete-lesson`, sau đó tự gọi `completeDay`, `addXp`, `setStreak`, `setLessonStars`; khi request lỗi, các mutation local vẫn chạy. Điều này tạo hai ledger không có hàng đợi đồng bộ. Đồng thời sticker được suy ra từ D5 và bảng metadata chỉ có 12 tuần, trong khi lesson canonical có 8 hoạt động và chương trình có 48 tuần.

Change này đi qua mobile, lessons/progress API và Mongoose schema. Nó phải giữ anonymous household authorization, chạy được khi mất mạng sau khi lesson canonical đã cache, không làm mất dữ liệu XP/sticker legacy, và không yêu cầu dependency runtime mới.

## Goals / Non-Goals

**Goals:**

- Một completion canonical tạo ra cùng kết quả dù request được gửi lại, app restart hoặc hai thiết bị sync gần nhau.
- Mobile có thể phản hồi sao/sticker ngay khi offline rồi reconcile về snapshot server mà không cộng dồn thủ công.
- Sao dùng ngưỡng 8 hoạt động đã chốt; sticker dùng full-week completion trên một required-plan đã đóng băng cho child.
- Bộ sưu tập có 48 stable sticker IDs và local asset contract cho 4 thế giới.
- Badge là các mốc tích lũy đơn điệu, không thể bị khóa lại.
- API thay đổi theo hướng additive trong giai đoạn migration để mobile cũ không crash.

**Non-Goals:**

- Không xóa, reset hoặc định nghĩa economy/level cho XP; XP tiếp tục được tính nội bộ nhưng không hiển thị cho trẻ.
- Không đổi Adventure Map hoặc cách week node đang tổng hợp sao.
- Không thay đổi streak formula 7/14/30 ngoài việc ngăn milestone/badge bị phát lại sai.
- Không tạo reward cho Explore, Practice Bank, offline task, mock hoặc demo lesson.
- Không chống gian lận tuyệt đối với `attemptCount` do thiết bị báo; server chỉ xác minh canonical identity và tự tính sao từ results, không tin trường `stars` do client gửi.
- Không chốt art direction, tên bốn thế giới hoặc artwork cuối cùng trong tài liệu kỹ thuật này.

## Decisions

### 1. Tách score, completion reward và dữ liệu tương thích

- Sao là score duy nhất hiển thị cho trẻ: 6-8 first-try correct = 3, 3-5 = 2, 0-2 = 1.
- Sticker là completion reward của tuần và không phụ thuộc sao.
- Streak là habit signal, không tạo badge vĩnh viễn.
- XP vẫn được server cộng 100 cho first canonical completion để giữ contract/dữ liệu cũ, nhưng mobile không truyền XP vào Lesson Complete và không hiển thị XP.

Giữ XP nội bộ giúp rollout không cần migration phá hủy hoặc đổi báo cáo cũ. Xóa XP hoàn toàn chỉ nên thực hiện trong một change riêng sau khi xác nhận không còn consumer.

### 2. Lesson response mang canonical reward context

Mỗi lesson imported SHALL có `contentVersion` do server tạo deterministically từ canonical lesson/activity payload tại publish ingest. `GET /lessons/today` và direct lesson reads trả thêm:

```ts
interface RewardContext {
  eligible: true
  contentVersion: string
  weekPlanVersion: string
  requiredLessonIds: string[]
  stickerId: string
}
```

Khi child nhận lesson canonical đầu tiên của một week, server đóng băng `weekRewardPlans[week]` trong child progress từ tập lesson imported bắt buộc hiện tại. Những lesson publish sau không hồi tố làm mất sticker hoặc đổi required set của child đó. Stub/mock trả `eligible: false` và không có canonical version.

`isStickerDay` tiếp tục là presentation hint cho nội dung/UI; nó không quyết định eligibility.

### 3. Mobile ghi durable completion event trước khi cập nhật UI

Một store/service riêng (`rewardSyncStore`) persisted bằng AsyncStorage giữ queue theo child. Player chỉ enqueue khi `rewardContext.eligible === true`:

```ts
interface RewardCompletionEvent {
  schemaVersion: 1
  eventId: string
  childId: string
  lessonId: string
  contentVersion: string
  weekPlanVersion: string
  completedAt: string
  activityResults: Array<{
    activityId: string
    attemptCount: 1 | 2 | 3
    outcome: 'correct' | 'revealed'
  }>
  revealConsumed: boolean
}
```

Queue write phải hoàn tất trước khi điều hướng sang Lesson Complete. Mobile tạo một local projection từ event + frozen plan để hiển thị sao/sticker/streak tức thời; projection được đánh dấu pending và không được dùng như một lần cộng reward độc lập. Một single-flight sync drain gửi event tuần tự, retry với backoff, giữ event qua app restart và xóa event chỉ sau response thành công hoặc terminal validation error đã được surface.

Không chọn cách union/max tự do giữa local và server vì nó không thể phân biệt first completion, replay hoặc reward đã cấp.

### 4. Complete-lesson xử lý event bằng optimistic compare-and-swap

Endpoint hiện tại được mở rộng additive để nhận `eventId`, `contentVersion`, `weekPlanVersion`, `completedAt`, `activityResults`; trường client `stars` được chấp nhận tạm thời cho mobile cũ nhưng không authoritative.

Child progress thêm `rewardRevision` và một tập receipt gọn, có giới hạn, cho các event gần nhất. Server:

1. Xác minh household/child, lesson imported, `contentVersion`, frozen week plan và activity IDs.
2. Nếu receipt cho `eventId` tồn tại, trả kết quả đã lưu cùng snapshot hiện tại.
3. Đọc progress ở revision N, tính stars/best-star, first-completion effects, streak, position và sticker.
4. Ghi toàn bộ progress + receipt trong một atomic compare-and-swap yêu cầu revision vẫn là N; conflict thì đọc lại và retry bounded.
5. Invalidate progress/today/achievement caches rồi trả snapshot.

`completedLessons`, best-star và stable sticker ID là các monotonic guards nên receipt cũ đã prune vẫn không thể cộng lại XP/streak hoặc sticker. CAS serializes các event khác ID cho cùng child mà không phụ thuộc Redis lock hay Mongo transaction nhiều collection.

Response chuẩn:

```ts
interface RewardSyncResponse {
  eventId: string
  applied: 'first_completion' | 'replay' | 'duplicate'
  eventResult: {
    stars: 1 | 2 | 3
    bestStars: 1 | 2 | 3
    stickerEarned: StickerSummary | null
    streakMilestone: 7 | 14 | 30 | null
  }
  progress: RewardProgressSnapshot
}
```

Snapshot chứa position, completed lesson IDs, streak, XP total nội bộ, lessonStars, stable sticker IDs, last completion date và `rewardRevision`. Mobile thay thế các field canonical bằng snapshot thay vì gọi `completeDay/addXp/setStreak/setLessonStars` tuần tự.

### 5. Sticker dựa trên frozen full-week plan

Sau khi áp dụng một first completion, server lấy plan đã đóng băng cho week. Sticker được cấp khi mọi `requiredLessonIds` của plan đã nằm trong `completedLessons`; thứ tự hoặc day vừa hoàn thành không quan trọng. Vì vậy học bù lesson cuối cùng vẫn nhận sticker, D5 một mình không đủ, và plan partial hợp lệ không phạt child vì content chưa publish.

Sticker ID là deterministic theo week (`sticker-w01` ... `sticker-w48`). `stickerIdsEarned` dùng set semantics; response chỉ có `stickerEarned` khi event hiện tại thêm ID lần đầu. Replay và duplicate không reveal lại.

### 6. Catalog 48 sticker là manifest local có version

Mobile có một typed catalog với 48 entry:

```ts
interface StickerDefinition {
  stickerId: `sticker-w${string}`
  week: number
  world: 1 | 2 | 3 | 4
  nameVi: string
  assetKey: string
}
```

File contract cố định:

```text
mobile/src/assets/images/stickers/world-01/week-01.png
...
mobile/src/assets/images/stickers/world-04/week-48.png
```

Catalog được bundle local và có `catalogVersion`; API chỉ cần trả stable IDs/earned state. Trong migration window, server vẫn trả legacy `week/emoji/bg` để mobile cũ render được. Một validation script kiểm tra đủ 48 ID, week liên tục, world mapping và file tồn tại.

### 7. Lesson Complete dùng state machine hai pha

`LessonCompleteScreen` nhận `eventResult`/local projection, không nhận XP child-facing.

```text
stars phase
  -> nếu stickerEarned: sticker-reveal phase
  -> nếu không: CTA phase
```

Sticker reveal chỉ chạy khi `revealConsumed` của event còn false. CTA “Cất vào bộ sưu tập” đánh dấu consumed trước khi đi tiếp; app restart/retry/sync không phát lại. D1-D4, replay và mock/demo dùng stars/CTA flow không có sticker. Mock/demo có copy rõ là bài thử và không cập nhật collection.

### 8. Achievements derive từ monotonic metrics

Sáu badge mới:

| id | Điều kiện |
|---|---|
| `first_lesson` | canonical completed lessons >= 1 |
| `first_sticker` | stable sticker IDs >= 1 |
| `explorer_1` | >= 12 sticker |
| `explorer_2` | >= 24 sticker |
| `explorer_3` | >= 36 sticker |
| `journey_complete` | >= 48 sticker |

Không badge nào phụ thuộc current streak hoặc số sao nên earned state không thể quay về false. Achievements screen nhóm flat catalog thành bốn world, refresh khi focus và dùng local snapshot khi offline.

### 9. Ngưỡng sao được cấu hình tập trung nhưng contract giữ cố định

Mobile và server dùng helper testable tương ứng với cùng constants `THREE_STAR_MIN_FIRST_TRY = 6`, `TWO_STAR_MIN_FIRST_TRY = 3`. OpenSpec là nguồn contract; helper không tự đọc remote config trong V1. Sau beta có thể tạo change mới để điều chỉnh dựa trên distribution thực tế.

## Risks / Trade-offs

- **[Local projection có thể lệch snapshot]** → Chỉ project từ server-issued frozen plan; hiển thị pending state nội bộ, reconcile toàn bộ snapshot và không cấp reward cho mock.
- **[Child document tăng kích thước vì event receipts/plan]** → Chỉ 48 frozen week plans; receipt giữ bản ghi gọn và giới hạn số lượng, trong khi monotonic guards bảo vệ duplicate cũ.
- **[CAS conflict khi nhiều thiết bị sync]** → Retry bounded theo `rewardRevision`; event queue gửi tuần tự và test race hai event cùng lesson.
- **[Mobile cũ không hiểu sticker asset IDs]** → Server giữ legacy sticker metadata trong migration window; deploy server additive trước, mobile mới sau.
- **[48 artwork chưa sẵn sàng]** → Catalog/file contract có thể scaffold với test placeholders, nhưng task visual chỉ hoàn thành khi đủ 48 asset final và qua on-device QA.
- **[Client có thể giả attempt counts]** → Server không tin `stars`, xác minh lesson/activity identity và tự tính; anti-cheat mạnh hơn không thuộc threat model reward không quy đổi tiền.
- **[Ngưỡng 6/3 chưa có dữ liệu trẻ thật]** → Giữ đúng quyết định product hiện tại, instrument distribution trong beta và review bằng change riêng.

## Migration Plan

1. Thêm schema fields additive với defaults: lesson `contentVersion`; progress `stickerIdsEarned`, `weekRewardPlans`, `rewardRevision`, recent event receipts.
2. Backfill deterministic `contentVersion` cho imported lessons và map `stickersEarned: number[]` legacy sang `stickerIdsEarned`; giữ legacy fields để rollback.
3. Deploy server/API additive, vẫn chấp nhận payload cũ và vẫn trả legacy sticker metadata.
4. Ship mobile catalog, queue/snapshot reconciliation và UI hai pha; migrate persisted local state bằng deep defaults, không xóa pending data.
5. Bật canonical-only reward path sau khi mobile version mới ổn định; theo dõi validation conflicts, duplicate rate và queue age.
6. Xóa compatibility payload/legacy writes trong một change sau, không trong rollout này.

Rollback: mobile cũ tiếp tục dùng endpoint/legacy fields; server có thể tắt xử lý event fields và đọc `stickersEarned` cũ. Pending mobile events được giữ để retry sau khi forward-fix, không discard tự động.

## Open Questions

- Tên, chủ đề và artwork cuối cùng cho bốn thế giới/48 sticker cần product-art review; stable IDs và file paths không phụ thuộc quyết định đó.
- Ngưỡng sao 6/3 cần được kiểm chứng bằng phân bố first-try trong beta nhưng không chặn implementation.
- XP nội bộ có còn consumer dài hạn hay sẽ được deprecate hoàn toàn là quyết định của change sau.
