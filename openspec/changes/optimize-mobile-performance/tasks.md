## 1. Parallel audio hydration (rank 23)

- [x] 1.1 `assetCache.ts hydrateAudioFiles`: resolve 5 URI bằng `Promise.all`, destructure, giữ kết quả

## 2. Asset cache eviction (rank 26)

- [x] 2.1 `assetCache.ts`: thêm `lastAccessedAt?` vào `CacheEntry`; set khi `downloadOne`; touch in-memory khi `resolveCachedUri` hit
- [x] 2.2 `pruneExpiredCache`: sau TTL sweep, enforce `MAX_CACHE_ENTRIES` bằng LRU (evict theo `lastAccessedAt ?? cachedAt`, xoá file + metadata)

## 3. Reward persist coalescing (rank 27)

- [x] 3.1 `rewardSyncStore.ts`: `mutateAndPersist(updater, opts?)` — in-memory ngay; `opts.flush` ⇒ ghi đồng bộ; mặc định ⇒ debounced coalesced write
- [x] 3.2 `enqueue` dùng `{ flush: true }` (giữ durable trước navigation)
- [x] 3.3 Thêm store action `flush`; `drainRewardQueue` gọi `flush` trong `finally`
- [x] 3.4 Giữ nguyên mọi pattern contract (`AsyncStorage.setItem`, `activeDrains`, retry/terminal, enqueue-before-nav)

## 4. LessonPlayer render scope (rank 29)

- [x] 4.1 `LessonPlayerScreen.tsx`: dùng `useAuthStore(s => s.child)` / `useAuthStore(s => s.progress)` thay `useAuthStore()`
- [x] 4.2 `ActivityContainer.tsx`: `export default React.memo(ActivityContainer)`

## 5. Verify

- [x] 5.1 `npx tsc --noEmit` + `npm run lint` xanh
- [x] 5.2 `node scripts/verify-reward-contracts.cjs` (guard rewardSyncStore + LessonPlayer) + `node scripts/verify-performance-contracts.cjs`
