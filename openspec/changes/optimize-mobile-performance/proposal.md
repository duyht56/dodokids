## Why

Review performance mobile phát hiện các mục resource-management/render an toàn để tối ưu (không đụng rewrite animation lõi):

1. **Audio hydrate tuần tự (rank 23)** — `hydrateAudioFiles` resolve 5 file audio bằng 5 `await` tuần tự trên critical prep path (mỗi lần đầu session là một `getInfoAsync` stat), trong khi các mảng option/visual cùng file đã `Promise.all`.
2. **Asset cache không cap (rank 26)** — chỉ prune theo TTL 30 ngày; không có trần byte/entry hay LRU ⇒ phình đĩa trên máy ít bộ nhớ.
3. **rewardSyncStore ghi cả blob mỗi mutation (rank 27)** — `mutateAndPersist` `AsyncStorage.setItem(JSON.stringify(...))` mỗi lần; khi drain N event là N lần ghi full-blob.
4. **LessonPlayer subscribe cả authStore (rank 29)** — `const { child, progress } = useAuthStore()` không selector ⇒ re-render mọi thay đổi store; `ActivityContainer` không `React.memo`.

Defer: rank 4 (tracing re-render → Skia/UI-thread), 24 (sort drag clone worklet), 25 (pattern chip reanimated) — rewrite animation lõi, cần verify trên thiết bị thật.

## What Changes

- **audio-hydration-parallel**: `hydrateAudioFiles` resolve 5 URI bằng `Promise.all` (như các mảng khác), giữ nguyên kết quả.
- **asset-cache-eviction**: thêm `lastAccessedAt` (touch khi resolve/download) + trần số entry với LRU eviction trong `pruneExpiredCache`, bên cạnh TTL.
- **reward-persist-coalescing**: giữ `enqueue` ghi ĐỒNG BỘ (durable trước navigation), nhưng coalesce (debounce) các ghi trong drain (`applyResponse`/`markRetry`/`markTerminal`/`consumeReveal`) + flush ở cuối drain. Server idempotent theo `eventId` nên coalesce an toàn.
- **lesson-player-render**: `LessonPlayer` dùng field selectors (`s => s.child`, `s => s.progress`); `ActivityContainer` bọc `React.memo`.

## Capabilities

### New Capabilities
- `audio-hydration-parallel`: critical prep resolve audio song song.
- `asset-cache-eviction`: cache đĩa có trần + LRU.
- `reward-persist-coalescing`: durable enqueue + ghi drain được coalesce.
- `lesson-player-render`: LessonPlayer selector-scoped + ActivityContainer memoized.

## Impact

- `mobile/src/services/assetCache.ts` — `hydrateAudioFiles` (rank 23), `pruneExpiredCache`/`resolveCachedUri` LRU (rank 26).
- `mobile/src/store/rewardSyncStore.ts` — persist coalescing (rank 27).
- `mobile/src/screens/child/LessonPlayerScreen.tsx` — selectors (rank 29).
- `mobile/src/components/activities/ActivityContainer.tsx` — `React.memo` (rank 29).

## Out of Scope (deferred — cần verify trên thiết bị)

- rank 4 (tracing full SVG re-render → Skia/reanimated worklet UI-thread).
- rank 24 (sort-sequence drag clone → worklet).
- rank 25 (pattern-finder chip → reanimated/gesture-handler).
