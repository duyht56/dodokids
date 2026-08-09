# Design — optimize-mobile-performance

## rank 23 — parallel audio hydration

`hydrateAudioFiles` resolves five audio URIs with five sequential `await resolveCachedUri(...)`. Replace with a single `Promise.all` destructure (mirrors the option/visual arrays that already parallelize). Result identical; removes ~4 serialized stat latencies from the interaction-critical prep step.

## rank 26 — asset cache eviction

`CacheEntry` gains an optional `lastAccessedAt`. It is touched on `downloadOne` (set to now) and in `resolveCachedUri` on a cache hit (in-memory; opportunistically persisted by the debounced metadata saver). `pruneExpiredCache` keeps the 30-day TTL sweep, then enforces a max-entry cap (`MAX_CACHE_ENTRIES`) by evicting the least-recently-accessed entries (falling back to `cachedAt` when `lastAccessedAt` is absent), deleting both the file and the metadata row. Runs during maintenance (off the critical path). Session-active URIs have fresh `lastAccessedAt`, so they are not evicted.

## rank 27 — reward persist coalescing (durability-preserving)

The initial `enqueue` MUST stay durable (LessonPlayer awaits it before navigating; a crash after navigation must not lose the event). So:
- `mutateAndPersist(updater, opts?)` updates in-memory immediately; with `opts.flush` it awaits an immediate disk write, otherwise it schedules a debounced write that coalesces rapid mutations.
- `enqueue` uses `{ flush: true }` (durable-before-navigation, unchanged guarantee).
- Drain mutations (`applyResponse`, `markRetry`, `markTerminal`, `consumeReveal`) use the debounced path — N per-event writes collapse into ~1.
- A `flush` store action forces the pending write; `drainRewardQueue` flushes in its `finally` to bound the crash window.

Safe because the server is idempotent by `eventId`: a debounced write lost to a crash means a pending event re-sends and the server returns `duplicate`, which `applyResponse` reconciles — no data loss. All contract-guarded patterns (`AsyncStorage.setItem`, `activeDrains`, retry/terminal handling, the enqueue-before-navigation source order) are preserved.

## rank 29 — LessonPlayer render scope

`LessonPlayer` reads `const { child, progress } = useAuthStore()` (whole-store subscription → re-renders on any store change, e.g. the parent-unlock timer). Switch to field selectors `useAuthStore(s => s.child)` / `useAuthStore(s => s.progress)`. Wrap `ActivityContainer` in `React.memo` so it is not reconciled on unrelated parent re-renders (activity identity changes still re-render it; the `key={activity.id}` remount is preserved).

## Risks

- rank 26 eviction runs off the critical path; evicting a still-needed asset only triggers a re-download.
- rank 27: keep the enqueue durability; only drain writes are coalesced. Verify the reward contract still passes.
- rank 29: memoization relies on stable-ish props; `onCorrect` is a `useCallback` and `activity` changes drive re-render intentionally.
