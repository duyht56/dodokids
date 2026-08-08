## Context

Change `improve-mobile-navigation-performance` (archive 2026-07-20) đã đưa child navigation về tab topology đúng, Home sang FlatList + derived progress, và thêm cache coordinator single-flight. Các contract test (`verify-performance-contracts.cjs`) pass. Tuy nhiên phần chậm còn lại nằm ở I/O:

- `prefetchManifestPrioritized` (`assetCache.ts`) kết thúc bằng `await prefetchUrls(backgroundAssets)` — toàn bộ asset còn lại của current+4 tuần (hàng trăm file) tải 4-concurrent trong cùng promise chain với critical/warm, và sau mỗi batch 4 file lại `JSON.stringify` toàn bộ metadata + ghi file. `InteractionManager.runAfterInteractions` chỉ hoãn thời điểm bắt đầu; khi vòng lặp đã chạy, mọi transition sau đó phải cạnh tranh network + JS thread với nó.
- Single-flight key là `lookahead:${childId}:${currentWeek}:${currentDay}:${lookaheadWeeks}`. Home dùng `progress.currentWeek/Day`, LessonPlayer dùng `paramWeek/paramDay` → khác key, không coalesce. Key bị xoá khi promise xong nên cùng scope vẫn quét lại. Home effect có dep `completedLessons.length` → mỗi lần hoàn thành bài kích một sweep mới.
- LessonPlayer chặn nối tiếp: `api.get('/lessons/today')` không cache (react-query đã cài, provider đã mount ở `App.tsx`, nhưng không có `useQuery` nào trong `src/`), rồi `prepareCriticalActivity` await download thật với timeout 20s, không có time budget.
- Adventure Map: `windowSize={7}` với row 112px mount ~34/48 row, mỗi row một `<Svg>` connector riêng — nhiều native view hơn cả một Svg overlay duy nhất thời ScrollView.
- Tabs: `lazy: true` nhưng không `freezeOnBlur` — tab đã mount render mãi (gồm reanimated `withRepeat` vô hạn của WeekNode CURRENT/TODAY khi tab bị che). `ChildTabBar` `return null` khi vào detail → unmount/remount cả cây tab bar + ParentGateModal.

Ràng buộc: không đổi wire contract (`docs/kido-activity-schema.ts`), không đổi semantics `completedLessons`/`lessonStars`/sao/XP/streak, không thêm dependency mới (react-query đã có sẵn), mobile chỉ có node-script contract tests (không jest).

## Goals / Non-Goals

**Goals:**

- Transition sau khi background prefetch đã bắt đầu không còn bị nó chiếm network/JS thread: background tier chạy ngoài awaited path, có gate foreground+idle và budget mỗi session.
- Một app session, một child: tối đa một lượt lookahead sweep hoàn chỉnh; các màn hình share cùng operation bất kể week/day param.
- Mở bài học: thời gian tới interactive bị chặn tối đa bởi (lesson fetch có cache) + min(critical download, ~1500ms); không bao giờ chờ 20s timeout.
- Số native view của Adventure Map giảm về mức cửa sổ nhỏ (~3 hàng buffer) và connector không nhân Svg surface theo row.
- Tab bị che không render; vào/ra detail flow không remount tab bar.
- Giữ nguyên toàn bộ hành vi sản phẩm: thứ tự ưu tiên critical→warm→background, TTL 30 ngày, entitlement range current+4, remote fallback, audio auto-play.

**Non-Goals:**

- Không đổi API server hoặc manifest shape.
- Không thêm thư viện mới (kể cả state/query lib — dùng react-query đã có).
- Không offline outbox/synchronization.
- Không đo lại FPS baseline trên thiết bị vật lý trong change này (ghi nhận là follow-up riêng; xem Risks).

## Decisions

### 1. Tách background tier khỏi awaited chain, thêm gate + budget

`prefetchManifestPrioritized` chỉ còn await critical + warm. Background tier chuyển thành work item riêng do coordinator sở hữu:

- **Idle gate**: mỗi chunk (một batch download) chỉ chạy sau `InteractionManager.runAfterInteractions` *tại thời điểm chunk đó* — không phải chỉ một lần lúc đầu. Giữa các chunk nhường JS thread (`await` một tick + interaction gate), nên transition bắt đầu giữa chừng sẽ chen được vào.
- **Foreground gate**: đọc `AppState.currentState`; nếu app không `active` thì dừng vòng lặp (resume ở lần schedule sau).
- **Session budget**: hằng `BACKGROUND_PREFETCH_MAX_FILES_PER_SESSION` (khởi điểm 120 file). Vượt budget → dừng, log debug state. Budget reset khi app process mới.
- **Metadata debounce**: `saveMetadata` được debounce (~2s sau lần ghi dirty cuối) thay vì ghi sau mỗi batch; flush ngay khi prune hoặc khi vòng lặp kết thúc. Cached-only batch không ghi gì (đã có `metadataDirty` check, giữ nguyên).

Alternative đã cân nhắc: chuyển sang `expo-background-task`/headless — quá nặng so với nhu cầu, và scope MVP chỉ cần "đừng cạnh tranh với UI".

### 2. Single-flight theo child + session memo

- Key lookahead đổi thành `lookahead:${childId}:${lookaheadWeeks}`. Week/day hiện tại vẫn được truyền vào để xếp ưu tiên critical/warm, nhưng không tham gia key — mọi caller (Home, PreparingLesson, LessonPlayer, LessonComplete) cùng child sẽ join chung operation.
- Thêm `completedScopes: Map<string, number>` trong coordinator: khi một sweep hoàn tất trọn vẹn (kể cả background tier chạy hết hoặc hết budget), ghi timestamp. `scheduleLookaheadPrefetch` với scope đã hoàn tất trong `LOOKAHEAD_REFRESH_INTERVAL_MS` (khởi điểm: 6h, cùng cadence maintenance) trả về `resolvedWork()` ngay. Lesson mới hoàn thành không cần re-sweep: asset tuần hiện tại đã tải rồi; ngày kế tiếp thuộc warm tier của sweep trước.
- Home/LessonComplete effect: bỏ `completedLessons.length` khỏi dependency (giữ `child?.id`). Việc "bài vừa xong → cần warm bài kế" đã được LessonComplete cover bằng chính lượt gọi của nó, và bị session memo chặn nếu không cần.

Trade-off: nếu server publish lesson mới giữa session, phải chờ tới refresh interval hoặc app restart. Chấp nhận được — manifest hiện tại cũng chỉ nhìn current+4 tuần.

### 3. Lesson fetch qua react-query, critical prep có time budget

- Hook mới `useTodayLesson(childId)` dùng `useQuery({ queryKey: ['lesson-today', childId], queryFn, staleTime: 5*60*1000 })` — mapServerLesson chạy trong `select`/queryFn. LessonPlayer và PreparingLesson dùng chung hook/queryKey, nên Preparing→Home→bấm node không refetch trong 5 phút. Mock fallback giữ nguyên: queryFn catch → `buildMockLesson`.
- `prepareCriticalActivity` nhận `budgetMs` (mặc định 1500): `Promise.race([prefetchActivityAssets(activity), sleep(budgetMs)])`, sau đó `hydrateActivityCachedUris` — asset nào đã kịp cache thì dùng local URI, phần còn lại giữ remote URL (Image/audio stream trực tiếp). Download đang chạy dở không bị hủy — nó tiếp tục trong nền và activity sau hưởng lợi qua hydrate-on-advance đã có sẵn ở LessonPlayer.
- Spec `lesson-player` scenario "First activity asset is missing" được siết lại: "attempts that critical download **within a bounded time budget**".

Alternative: hủy hẳn download khi quá budget — phức tạp (expo-file-system legacy không có abort sạch) và lãng phí phần đã tải.

### 4b. Bỏ virtualization: Adventure Map quay lại ScrollView (sửa sau khi test thiết bị)

**Quyết định 4 bên dưới đã sai và bị thay bằng quyết định này.** Sau khi land, anh Duy test trên thiết bị: vuốt nhanh vẫn trắng màn hình một lúc mới hiện. Thử nới `windowSize` 3→5 và `maxToRenderPerBatch` 6→12 vẫn không hết.

Nguyên nhân gốc: **virtualization là công cụ sai cho 48 row cao cố định.** Blank cell là hệ quả cấu trúc của FlatList — khi vuốt vượt cửa sổ render, JS thread phải kịp render batch mới thì mới có nội dung. Với `windowSize` 5 thì đã mount ~30/48 row, tức là gần như trả đủ chi phí mount của cả map *nhưng vẫn giữ nguyên rủi ro blank*. Nới tiếp tới mức không blank thì bằng đúng mount hết — chỉ khác là gánh thêm overhead của FlatList.

Thay bằng ScrollView + 48 node absolute + **một** `<Svg>` path cho toàn map (đúng cấu trúc trước change 2026-07-20). Hệ quả:

- Không còn render pass nào trong lúc scroll → scroll thuần native, **miễn nhiễm với việc JS thread đang bận** (đây là điểm quyết định: kể cả background prefetch có chiếm JS thread thì map vẫn cuộn mượt và đầy đủ).
- Số native view: 1 Svg + 48 node. So với phương án dot-View ở quyết định 4 cũ (11 View/row × 48 = 528 view) thì rẻ hơn nhiều.
- Chi phí: mount đầy đủ 48 node một lần khi vào Home. Chấp nhận được vì `freezeOnBlur` + tab giữ mounted nghĩa là Home chỉ mount **một lần mỗi app session**; đổi tab sau đó không mount lại.

Điều kiện để mount 48 node đủ rẻ là mỗi node phải rẻ — và đó chính là thứ change 2026-07-20 bỏ sót: `WeekNode` gọi `useSharedValue` + `useAnimatedStyle` + `withTiming` ở **mọi** state, trong khi chỉ `CURRENT`/`TODAY` dùng tới `animStyle`. Tức là 46/48 node cấp phát worklet reanimated rồi vứt. Tách phần pulse ra component `PulseCircle` riêng khiến map đầy đủ 48 node giờ rẻ hơn map virtualized 30 row trước đây.

Đây cũng là lý do change trước phải đổi sang FlatList mà vẫn không hết chậm: nó tối ưu *số lượng* node mount thay vì *chi phí* mỗi node.

### 4. ~~Adventure Map: windowSize 3 + connector không-Svg~~ (đã bị thay bởi 4b)

- `windowSize={3}`, giữ `initialNumToRender={7}` cho first paint đầy màn hình; `maxToRenderPerBatch` giữ nguyên.
- Connector per-row `<Svg><Path/></Svg>` thay bằng dãy `View` chấm tròn (dash "2 18" hiện tại thực chất là dotted line): mỗi row render ~6-8 `View` tròn 9px màu `#FFD9C7` đặt dọc theo đường cong bezier đã tính sẵn (toạ độ tính bằng công thức bezier tại t đều nhau — thuần JS lúc render, không native SVG surface). Visual parity: cùng màu, cùng khoảng cách chấm, kiểm tra phone/tablet.
- Alternative giữ Svg nhưng 1 overlay duy nhất toàn map: quay lại vấn đề cũ (Svg cao 5376px luôn mounted) — bỏ.

### 5b. Đảo quyết định 5: tabs warm + attached, KHÔNG freeze (sửa sau device test 2026-08-04)

**`freezeOnBlur` ở quyết định 5 đã bị revert.** Device test cho thấy: bấm `Đô Đô` mất ~2s (unfreeze = re-render đồng bộ cả cây tab trước khi hiện), và vào lại `Khám phá`/`Thành tích` thì thumbnail/sticker trắng một lúc (screen bị detach khỏi native hierarchy → ảnh decode lại, với ảnh quá khổ thì rất đắt).

Ba fix xếp chồng:

1. **Bỏ `freezeOnBlur`** — tab đã thăm giữ nguyên cây React; đổi tab chỉ là visibility change. Điều kiện "blurred tab phải rẻ" đạt bằng per-node cost thấp (PulseCircle chỉ ở CURRENT/TODAY) thay vì bằng freeze.
2. **`detachInactiveScreens={false}`** trên ChildTabs — native view của tab blurred không bị tháo, bitmap đã decode còn sống → vào lại tab hiện ảnh ngay.
3. **Downscale bundled asset về đúng footprint hiển thị**: explore thumbnail 1254²/~1.5MB → 512² (theo đúng README của thư mục asset, hiển thị 58pt); sticker 512² → 384² (grid 4-6 cột). Tổng 23.0MB → 7.3MB. Ảnh gốc backup tại scratchpad `asset-originals-backup/` (repo hiện KHÔNG có git — `.git/` rỗng — nên không có version control che lưng).

Trade-off chấp nhận: cả 4 tab giữ mounted + attached → memory cao hơn (~vài MB bitmap sau downscale, trước downscale thì không chấp nhận được — đây là lý do phải làm (3) cùng lúc với (2)). Skeleton loading: SkeletonLoader component đã có sẵn; chỉ đưa vào ExploreCatalog/Achievements nếu device test sau 3 fix trên vẫn thấy blank >300ms (tránh thêm UI phức tạp cho vấn đề đã hết).

### 5. ~~Tabs freeze~~ (phần freezeOnBlur bị thay bởi 5b; phần tab bar ẩn bằng style GIỮ NGUYÊN)

- `Tab.Navigator screenOptions` thêm `freezeOnBlur: true` (react-native-screens 4.25.2). WeekNode reanimated loop trên tab Dodo sẽ không chạy khi bé đang ở Explore.
- `ChildTabBar`: thay `if (!isTabRootVisible(props)) return null` bằng wrapper `<View style={{ display: hidden ? 'none' : 'flex' }}>` (giữ state `gateVisible`, không remount ParentGateModal). Đo lại back behavior: khi ở detail, tab bar ẩn nhưng vẫn mounted — hành vi navigation không đổi.
- Không bật `enableFreeze()` global — chỉ scope tab navigator để tránh side effect lên Parent stack.

### 6. Dead code + contract tests

- Xoá `prefetchManifest` (hardcode week 1/day 1 — nguy hiểm nếu ai gọi lại), `prefetchLessonAssets`, `hydrateLessonCachedUris`, `collectLessonAssetUrls` nếu không còn caller sau các sửa trên.
- `verify-performance-contracts.cjs` thêm:
  - Background tier không nằm trong promise mà critical caller await (test qua fake scheduler: critical resolve trong khi background chunk chưa chạy).
  - Hai caller khác week/day cùng child share một operation (key coalescing).
  - Session memo: schedule lần 2 sau khi complete → không gọi work mới trong refresh interval.
  - `prepareCriticalActivity` với download treo → resolve trong ~budget và trả activity với remote URL.
  - Budget: vòng lặp background dừng đúng số file.

## Risks / Trade-offs

- [Budget/interval chọn sai (120 file, 6h) → cache miss nhiều hơn cho tuần xa] → hằng số đặt một chỗ trong `cacheScheduling.ts`, debug state expose qua `getCacheCoordinatorDebugState()`; chỉnh bằng một dòng khi có số liệu thật.
- [Time budget 1500ms trên mạng chậm → activity đầu render bằng remote URL, ảnh hiện dần] → đây là hành vi mong muốn (interactive sớm hơn); remote fallback vốn là đường đi chuẩn của spec hiện hành. Download vẫn tiếp tục nền và hydrate-on-advance vá lại.
- [`freezeOnBlur` có thể lộ bug state-khi-unfreeze (screen giữ state cũ khi quay lại)] → các tab root đều đọc từ zustand selector, re-render khi unfreeze; smoke test 4 tab + quay lại từ detail.
- [Tab bar ẩn bằng style vẫn chiếm cây view] → chi phí không đáng kể (1 view ẩn) so với remount toàn bộ mỗi lần vào/ra detail.
- [Connector View-dots lệch visual so với Svg dash] → so màn hình cạnh nhau phone/tablet trước khi chốt; nếu không đạt parity, fallback: giữ Svg per-row nhưng chỉ render khi row trong viewport hẹp (windowSize 3 đã giảm 34→~10 surface).
- [Không có số liệu thiết bị thật trong change này] → các invariant code-level là proxy; ghi rõ residual risk trong tasks 5.x và để việc profile release build thành bước verification cuối có checklist cụ thể (thiết bị, flow, số lần), không khai khống như change trước.

## Migration Plan

1. Sửa tầng service (assetCache tách tier + debounce; cacheScheduling budget/gates; coordinator key + session memo) + contract tests — không đụng UI.
2. Hook `useTodayLesson` + time-budget critical prep; chuyển LessonPlayer/PreparingLesson.
3. HomeScreen: windowSize, connector, effect deps.
4. ChildStack: freezeOnBlur + tab bar style-hide.
5. Xoá dead exports, chạy `npm run lint` + `npm run test:performance` + `npx tsc --noEmit`.
6. Smoke test dev build: 5 bottom-menu action, Home↔Explore lặp, mở lesson (cache nóng/lạnh), complete lesson, paywall deep link, parent gate.

Rollback theo từng bước — mỗi bước là một nhóm file độc lập, không migration dữ liệu. Metadata cache format không đổi.

## Open Questions

- Ngưỡng budget 120 file/session và refresh interval 6h là khởi điểm — cần số liệu từ thiết bị Android tầm trung (đo lại sau khi land, cùng bài đo với residual-risk checklist).
- `removeClippedSubviews` hiện tắt (`false`) do lo shadow clipping từ change trước; sau khi connector bỏ Svg, có thể thử bật lại trên Android — để ngoài scope, đã ghi TODO tại chỗ trong `HomeScreen.tsx`.

## Residual Risk (ghi nhận khi implement, 2026-08-01)

Những gì ĐÃ verify trong session implement: `npm run lint` (0 error), `npx tsc --noEmit` (0 error), `npm run test:performance` pass 9 nhóm contract (gồm 4 contract mới: background tier tách khỏi awaited path, gated chunks budget/foreground, scope key + session memo, time-budget fallback).

Những gì CHƯA verify — cần một phiên chạy trên thiết bị/emulator trước khi coi change này là xong:

- **Chưa smoke test trên thiết bị/emulator nào** (task 4.3, 5.4 còn mở): freezeOnBlur trên cả 4 tab + quay lại từ detail, tab bar ẩn/hiện qua Explore game và tracing workshop, back behavior Android, `kido://paywall`, parent gate, cold start qua Preparing → Home.
- **Visual parity của connector View-dots chưa được so bằng mắt** trên phone lẫn tablet (dot đặt theo t đều của bezier, không theo arc-length — khoảng cách chấm có thể hơi lệch ở đoạn cong so với Svg dash cũ). Fallback đã ghi trong Risks nếu không đạt.
- **Chưa có số liệu performance trước/sau trên thiết bị thật** — các contract test là proxy code-level, không thay được profiling release build. Budget 120 file/session, refresh interval 6h, critical budget 1500ms đều là khởi điểm chưa tune.
- **Bài học rút ra (2026-08-03):** hai vòng tuning `windowSize`/`maxToRenderPerBatch` đều thất bại trước khi nhận ra virtualization là hướng sai (xem 4b). Với màn hình có số phần tử cố định và nhỏ (48), đo chi phí *mỗi* node trước khi đi tìm cách giảm *số* node. Đừng chốt kiểu render mà chưa test fling trên thiết bị thật.
- **Edge react-query khi offline**: kết quả mock được cache theo staleTime 5 phút; nếu mạng phục hồi trong 5 phút đó, lần mở bài kế tiếp vẫn dùng mock (trước đây mỗi lần mở là một lượt fetch mới). Chấp nhận cho MVP, đảo lại được bằng cách invalidate khi usedMock.
