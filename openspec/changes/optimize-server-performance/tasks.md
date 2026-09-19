## 1. findToday — filter canonical in DB + limit (rank 3)

- [x] 1.1 `lessons.service.ts findToday`: thêm filter `contentVersion:{$type:'string',$ne:''}` + `$expr $size activities === CANONICAL_ACTIVITY_COUNT` vào query, `.limit(1)`; giữ `.populate('activities')`
- [x] 1.2 Chọn bài từ kết quả (vẫn `.find(isCanonicalLesson)` như belt-and-suspenders); giữ nguyên STUB khi rỗng
- [x] 1.3 Cập nhật `lessons.service.spec.ts`: thêm `limit` vào mock query chain

## 2. Redis resilience (rank 9)

- [x] 2.1 `app.module.ts`: `retryStrategy` trả `Math.min(times*200, 2000)` (giữ warn lần đầu); thêm `maxRetriesPerRequest: 2`

## 3. runWeeklyReports — indexed + streaming + no N+1 (rank 10)

- [x] 3.1 `child.schema.ts`: `weeklyReportEnabled` thêm `index: true`
- [x] 3.2 `progress.service.ts`: tách helper `weeklyReportFromProgress(progress)`; `getWeeklyReport` dùng helper
- [x] 3.3 `runWeeklyReports`: `.select(...).lean().cursor()` + tính report inline (bỏ re-`findOne` per child)

## 4. getPractice — lean (rank 11)

- [x] 4.1 `lessons.service.ts getPractice`: `.populate('activities').lean()`, bỏ `toObject()`, giữ shuffle+slice(12)

## 5. report cache bounds (rank 12)

- [x] 5.1 `parent.service.ts`: report cache thành LRU có `MAX_REPORT_CACHE_ENTRIES` (move-to-end on hit, evict oldest on set)
- [x] 5.2 `getReport`: range-check `week` (1..48) trước khi tạo cache key

## 6. Tests & verify

- [x] 6.1 `lessons.service.spec.ts`: findToday vẫn trả canonical/stub đúng với chain mới (mock `limit`)
- [x] 6.2 Test: `getPractice` trả tối đa 12 activity từ completed (mock lean) + rỗng khi chưa completed
- [x] 6.3 `npm run build && npm test` ⇒ 41 suites / 357 tests pass, build sạch

## Notes

- Production code mới lint sạch; 3 lỗi lint còn lại (`lessons.service.ts` / `progress.service.ts` `JSON.parse(cached)` ở cache-hit) là có sẵn từ trước.
- Deferred: rank 28 (single-flight), rank 30 (`freezeWeekPlan` re-fetch), rank 11 bản đầy đủ (`$sample` xuống Activity collection) — xem proposal "Out of Scope".
