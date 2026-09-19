# Design — optimize-server-performance

## rank 3 — findToday: filter canonical in the DB, limit 1

`isCanonicalLesson` = `lessonStatus==='imported'` + `contentVersion` non-empty string + `activities.length === 8`. Crucially `activities.length` is known from the UNpopulated lesson doc (it stores `ObjectId[]`), and `contentVersion`/`lessonStatus` are scalar fields — so the whole canonical predicate can run in Mongo:

```
find({
  lessonStatus: 'imported',
  lessonId: { $nin: completedLessons },
  week: { $gte: 1, $lte: maxWeek },
  contentVersion: { $type: 'string', $ne: '' },
  $expr: { $eq: [{ $size: { $ifNull: ['$activities', []] } }, CANONICAL_ACTIVITY_COUNT] },
}).sort({ week: 1, day: 1 }).limit(1).populate('activities')
```

Only ONE lesson is populated/`toObject()`ed instead of the whole unlocked curriculum. Selection result is identical (first canonical by week,day). The `.find().sort()…populate().exec()` shape is preserved (adds `.limit(1)` + filters), so the change is minimal. `isCanonicalLesson` is still applied to the single result as a belt-and-suspenders check.

## rank 9 — Redis reconnect

Replace `retryStrategy: () => null` (which tells ioredis to STOP reconnecting) with a bounded backoff `Math.min(times * 200, 2000)`, and add `maxRetriesPerRequest: 2` so a command fails fast (→ `RedisService` catch → null → DB fallback) instead of hanging while disconnected. The client now self-heals after an outage. Cache remains fail-open.

## rank 10 — runWeeklyReports

- Add `index: true` to `weeklyReportEnabled` on the Child schema.
- Extract `weeklyReportFromProgress(progress)` pure helper used by both `getWeeklyReport` and the batch.
- Batch: `find({ weeklyReportEnabled: true }).select('childId householdId name progress').lean().cursor()` and compute the report inline from each streamed child — no per-child re-`findOne` (removes the N+1), and no full-collection hydration in memory.

## rank 11 — getPractice

Add `.lean()` to the populated query so lessons/activities are plain objects (no Mongoose document hydration). Drop the now-unnecessary `toObject()`. Same 12-item random shuffle result. (Full `$sample`-in-DB is deferred — needs an `activityModel` injection.)

## rank 12 — report cache bounds

`ParentService.reportCache` becomes a bounded LRU: on hit, move the key to most-recent; on set, evict the oldest when above `MAX_REPORT_CACHE_ENTRIES`. Also range-check `week` (1..48) in `getReport` before it becomes part of the cache key, so a caller cannot mint unbounded distinct keys with large week values. Fingerprint-based invalidation is unchanged.

## Risks

- `$expr`/`$size` in findToday can't use an index, but it runs over the small, already week/status-filtered lesson set and returns 1 doc — far cheaper than populating all. Selection semantics unchanged.
- Redis `maxRetriesPerRequest: 2` means a command during an outage errors after 2 tries; `RedisService` already treats errors as cache-miss (fail-open), so correctness is unaffected.
- Weekly-report cursor uses `.lean()`; the inline computation must read the same fields the old `getWeeklyReport` did (completedLessons, streakCount, xp, lastLessonDate) — covered by the shared helper.
