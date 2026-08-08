## 1. Service layer: background tier, budget, debounce, coalescing

- [x] 1.1 Tách `prefetchManifestPrioritized` thành awaited critical+warm và background tier riêng; caller-awaited promise resolve khi critical+warm xong, background tier chạy độc lập
- [x] 1.2 Thêm background loop gates trong `cacheScheduling.ts`: interaction gate mỗi chunk, foreground gate qua `AppState`, và `BACKGROUND_PREFETCH_MAX_FILES_PER_SESSION` budget (120)
- [x] 1.3 Debounce `saveMetadata` (~2s sau lần dirty cuối), flush khi operation kết thúc và khi prune chạy; giữ nguyên hành vi cached-only không ghi
- [x] 1.4 Đổi lookahead single-flight key về `lookahead:${childId}:${lookaheadWeeks}` (week/day chỉ dùng cho priority) trong `cacheCoordinator.ts`
- [x] 1.5 Thêm session memo `completedScopes` + `LOOKAHEAD_REFRESH_INTERVAL_MS` (6h): scope đã hoàn tất trong interval trả về resolved no-op
- [x] 1.6 Cập nhật `getCacheCoordinatorDebugState()` expose budget đã dùng, completedScopes, background tier state

## 2. Lesson fetch cache + critical time budget

- [x] 2.1 Tạo hook `useTodayLesson(childId)` dùng `useQuery` key `['lesson-today', childId]`, staleTime 5 phút, mock fallback trong queryFn giữ nguyên hành vi hiện tại
- [x] 2.2 Chuyển `LessonPlayerScreen` sang `useTodayLesson`; giữ contentUnavailable, loading text, hydrate-on-advance như cũ
- [x] 2.3 Chuyển `PreparingLessonScreen` sang cùng query (prefetchQuery hoặc dùng chung hook) để Preparing → mở bài không refetch
- [x] 2.4 Thêm `budgetMs` (mặc định 1500) vào `prepareCriticalActivity`: race download với budget rồi hydrate; download dở tiếp tục nền
- [x] 2.5 Giữ audio question auto-play và remote fallback; kiểm tra không regression khi budget hết trên cache lạnh

## 3. Home render window + connector + effect deps

- [x] 3.1 ~~Giảm `windowSize` xuống 3~~ → Bỏ hẳn virtualization: Adventure Map quay lại `ScrollView` + 48 node absolute (xem design 4b; test thiết bị cho thấy mọi mức `windowSize` vẫn blank khi vuốt nhanh)
- [x] 3.2 ~~Connector View-dots~~ → Một `<Svg>` path duy nhất cho toàn map thay vì per-row surface
- [x] 3.2b Tách pulse animation khỏi `WeekNode` thành `PulseCircle`: chỉ `CURRENT`/`TODAY` cấp phát reanimated worklet (46/48 node trước đây cấp phát rồi vứt)
- [ ] 3.2c Xác nhận trên thiết bị: vuốt nhanh không còn trắng màn hình; snake path + island marker + TODAY badge đúng vị trí trên phone và tablet
- [x] 3.3 Bỏ `completedLessons.length` khỏi dependency của Home cache effect (key theo `child?.id`); làm tương tự cho LessonCompleteScreen effect
- [x] 3.4 Ghi chú follow-up về thử lại `removeClippedSubviews` trên Android sau khi connector không còn Svg

## 4. Tabs freeze + tab bar persistence

- [x] 4.1 ~~Bật `freezeOnBlur: true`~~ (đã revert ở 6.1 sau device test — xem design 5b)
- [x] 4.2 Đổi `ChildTabBar` từ `return null` sang ẩn bằng style, giữ ParentGateModal và gate state sống qua detail flow
- [ ] 4.3 Smoke test: 4 tab + Phụ huynh gate, vào/ra Explore game và tracing workshop, LessonPlayer/LessonComplete, back behavior Android

## 5. Dead code, contract tests, verification

- [x] 5.1 Xoá `prefetchManifest`, `prefetchLessonAssets`, `hydrateLessonCachedUris` (và `collectLessonAssetUrls` nếu hết caller) khỏi `assetCache.ts`
- [x] 5.2 Thêm contract tests vào `verify-performance-contracts.cjs`: background tách khỏi awaited path, key coalescing khác week/day, session memo no-op, time-budget fallback, budget dừng đúng số file
- [x] 5.3 Chạy `npm run lint`, `npx tsc --noEmit`, `npm run test:performance` trong `mobile/` và sửa mọi regression trong scope
- [ ] 5.4 Smoke test dev build: cold start, Preparing → Home, 5 bottom-menu action, Home↔Explore lặp 20 lần, mở lesson cache nóng/lạnh, complete lesson, `kido://paywall`, parent gate
- [x] 5.5 Ghi residual risk thực tế (thiết bị chưa đo, budget/interval chưa tune) vào design.md Open Questions hoặc docs runbook — không đánh dấu xong nếu chưa ghi

## 6. Tab switch warm + asset đúng khổ (device test 2026-08-04: tab vẫn chậm, ảnh trắng khi vào lại)

- [x] 6.1 Revert `freezeOnBlur` (unfreeze burst = 2s khi bấm Đô Đô); giữ blurred tab rẻ bằng per-node cost thay vì freeze
- [x] 6.2 Thêm `detachInactiveScreens={false}` cho ChildTabs để native view + bitmap đã decode sống qua blur
- [x] 6.3 Downscale bundled assets: explore 1254²→512², sticker 512²→384² (23.0MB→7.3MB); backup gốc ở scratchpad `asset-originals-backup/`
- [x] 6.4 Cập nhật delta specs: navigation-setup (warm tab switching), explore-catalog + achievements-screen (asset footprint contract)
- [ ] 6.5 Device test lại: bấm Đô Đô tức thì, vào lại Khám phá/Thành tích không trắng ảnh; nếu vẫn blank >300ms thì bật skeleton (SkeletonLoader có sẵn) cho catalog card + sticker grid
- [x] 6.6 Thay `InteractionManager` (deprecated từ RN 0.85) bằng `requestIdleCallback` + timeout 1500ms, fallback `setTimeout` khi runtime không có idle callback; đổi `DeferredScheduler.runAfterInteractions` → `schedule`
- [x] 6.7 Thêm probe đo tab-switch latency (dev-only, `useTabSwitchLatency`): log `[tab-switch] <tab>: <ms>` từ lúc bấm tab-bar tới frame đầu của tab đích; gắn vào 4 tab root
- [x] 6.8 Dời `fetchAchievements` của Thành tích khỏi focus transition (scheduleIdle trong `useFocusEffect`), grid vẫn render local-first ngay
- [ ] 6.9 Thu số liệu `[tab-switch]` trên dev build VÀ release build (`npm run build:dev`); quyết định skeleton (6.5) dựa trên số release-build, phân biệt lần-đầu-vào-tab vs quay-lại-tab

## 7. Định vị chi phí chuyển tab bằng probe (focus vs first-frame)

- [x] 7.1 Nâng probe thành `useNavTiming` in ra `focus <ms>` (press→focus effect) và `first frame <ms>`; số của anh cho thấy focus chiếm ~95%, gap first-frame chỉ 17-80ms → chi phí ở tầng navigator, KHÔNG ở nội dung màn (skeleton vô ích)
- [x] 7.2 Gắn probe đường vào/ra game: `markNavPress` khi bấm card ở ExploreCatalog (ExplorePlay/TracingWorkshop) và khi back về Explore
- [x] 7.3 Memo hóa cụm 48 node + island của Home (`mapChildren` useMemo) để navigator render lại không dựng lại 48 element — giả thuyết chính cho việc mọi tab chậm ngang nhau
- [x] 7.4 Memo hóa SVG surface path của ChildBottomNav (tính lại mỗi lần đổi tab)
- [ ] 7.5 Đo lại sau 7.3/7.4: focus có giảm không; nếu vẫn ~500ms thì chi phí nằm trong react-navigation/detachInactiveScreens chứ không phải Home re-render

## 8. Xưởng luyện nét: 97 SVG surface freeze ~4s lúc mount

- [x] 8.1 Xác định: library render 97 `<PathPreview>` (97 Svg surface, 162 path) đồng loạt → focus ~3900ms mỗi lần vào TracingWorkshop
- [x] 8.2 Reveal preview theo lô (`useProgressiveReveal`, 10 item/frame): card + glyph hiện ngay, nét SVG mount rải qua ~10 frame; loại freeze cứng
- [x] 8.3 Loại giả thuyết "Home re-render 48 node" khỏi chi phí tab-switch: memo hóa mapChildren (7.3) KHÔNG làm focus giảm → chi phí ~500ms nằm ở tầng navigator/native-stack animation/dev-build, không phải nội dung màn
- [ ] 8.4 Đo lại TracingWorkshop focus sau 8.2 (kỳ vọng tụt từ ~3900ms xuống ~mức tab-switch); nếu preview pop-in quá lộ thì tăng batch hoặc chỉ reveal track đang cuộn tới
- [ ] 8.5 Đo 1 lần trên RELEASE build (`npm run build:dev`) để tách phần ~500ms floor là dev-overhead hay thật; quyết định có cần đụng native-stack animation/detachInactiveScreens không DỰA TRÊN số release

## 9. Codex review: probe sai mốc → đo lại đúng, bắt buộc release profile

- [x] 9.1 Codex xác nhận không có "fixed 500ms" trong bottom-tabs/native-stack (animation duration 0); ~500ms là thời gian tới passive `useFocusEffect` SAU commit → gộp render+commit+focus-propagation+dev overhead. Loại giả thuyết navigator-delay
- [x] 9.2 Sửa probe theo Codex: thêm mốc `dispatch` (navigate() return), `tab-commit` (useLayoutEffect ở ChildTabBar theo currentRoute = mốc tab đổi thật), giữ focus + double-rAF; log `[nav] X: dispatch a, tab-commit b, focus c, frame d`
- [x] 9.3 Thêm cờ `NAV_TIMING_FORCE` để probe chạy được trên release build (mặc định no-op khi !__DEV__)
- [ ] 9.4 Đo lại DEV: đọc tỉ lệ dispatch vs tab-commit vs focus. Nếu tab-commit << focus → tab đổi sớm, phần focus chủ yếu là passive-effect scheduling (artifact đo), không phải cái user chờ
- [ ] 9.5 BẮT BUỘC trước khi đụng navigator internals: profile release build (`npm run build:dev` = expo run:android --variant release; bật NAV_TIMING_FORCE hoặc dùng Perfetto). So dev vs release cùng thiết bị
- [~] 9.6 A/B `detachInactiveScreens` lật về `true` (default). Lý do làm sớm: probe mới cho tab-commit ~400ms ĐỀU nhau mọi tab = chi phí commit cả cây, khớp nghi phạm này. Chờ đo lại + kiểm tra ảnh Explore/Achievements có decode lại không (asset đã downscale nên nếu có cũng nhanh)
