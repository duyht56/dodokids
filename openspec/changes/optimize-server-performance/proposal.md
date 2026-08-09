## Why

Đợt review performance phát hiện các hot-path và job của `kido-server` nạp nguyên collection/curriculum để lấy một/vài item, và một cấu hình Redis khiến cache tắt vĩnh viễn sau blip đầu tiên. Change này xử lý các mục performance server rõ ràng, giữ nguyên kết quả (chỉ nhanh/gọn hơn):

1. **`/lessons/today` nạp cả curriculum (HIGH, rank 3)** — cache-miss chạy `find({...week 1..maxWeek, $nin completed}).populate('activities')` KHÔNG `.limit()`, rồi `.toObject()` mọi doc chỉ để lấy bài canonical đầu tiên. Chi phí scale theo tổng nội dung publish; `invalidateRewardCaches` xoá key sau mỗi completion nên miss liên tục.
2. **Redis `retryStrategy` trả `null` (MEDIUM, rank 9)** — một blip Redis là ioredis ngừng reconnect vĩnh viễn; cache tắt cho tới khi restart, mọi read thành Mongo hit (gồm cả scan nặng của rank 3).
3. **`runWeeklyReports` collscan + N+1 (MEDIUM, rank 10)** — `find({weeklyReportEnabled:true})` trên field không index (default true, match ~mọi child), không `.lean()`, rồi gọi `getWeeklyReport` per child (re-`findOne` child đã có trong tay).
4. **`/lessons/practice` hydrate toàn bộ lịch sử (MEDIUM, rank 11)** — `find({$in completed}).populate('activities')` không `.lean()`, hydrate mọi Mongoose doc rồi shuffle để lấy 12.
5. **Report cache không giới hạn (LOW, rank 12)** — `ParentService.reportCache` là `Map` không TTL/LRU, key gồm `week` không range-check ⇒ rò rỉ RAM chậm.

## What Changes

- **lessons-today-query**: đẩy điều kiện canonical (imported + contentVersion non-empty + đúng 8 activities) và `.limit(1)` xuống Mongo, chỉ populate/`toObject` đúng một bài. Kết quả chọn không đổi.
- **redis-resilience**: `retryStrategy` trả backoff có giới hạn (self-healing) + `maxRetriesPerRequest` để lệnh không treo khi Redis down (vẫn fail-open qua `RedisService`).
- **weekly-reports-batch**: index `weeklyReportEnabled`, duyệt bằng `.lean().cursor()`, tính report inline từ child đã load (bỏ N+1).
- **practice-query**: thêm `.lean()` (+ populate) để bỏ overhead hydrate Mongoose doc.
- **report-cache-bounds**: giới hạn số entry (LRU) + range-check `week` (1..48) trước khi dùng làm cache key.

## Capabilities

### New Capabilities
- `lessons-today-query`: chọn bài "today" bằng truy vấn DB-filtered + limit, không over-fetch.
- `redis-resilience`: Redis client tự reconnect sau outage; lệnh không treo, cache fail-open.
- `weekly-reports-batch`: job weekly report chạy indexed + streaming + không N+1.
- `practice-query`: practice bank đọc lean, không hydrate thừa.
- `report-cache-bounds`: report cache có giới hạn kích thước + key bounded.

## Impact

- `kido-server/src/modules/lessons/lessons.service.ts` — `findToday` (rank 3), `getPractice` (rank 11).
- `kido-server/src/app.module.ts` — Redis options (rank 9).
- `kido-server/src/modules/progress/progress.service.ts` — `runWeeklyReports` + `getWeeklyReport` (rank 10).
- `kido-server/src/common/schemas/child.schema.ts` — index `weeklyReportEnabled` (rank 10).
- `kido-server/src/modules/parent/parent.service.ts` — report cache LRU + week range (rank 12).
- Cập nhật/ thêm test tương ứng.

## Out of Scope (deferred)

- rank 28 (single-flight chống stampead trên read-through cache) — low, độ lợi thấp.
- rank 30 (`freezeWeekPlan` re-fetch) — re-fetch còn giữ vai trò đúng đắn dưới concurrency; tối ưu 1-round-trip rủi ro cao hơn lợi ích.
- rank 11 bản đầy đủ (đẩy `$sample` xuống Activity collection) — cần inject `activityModel` + đổi hành vi; bản `.lean()` ở đây đã giảm phần lớn overhead.
