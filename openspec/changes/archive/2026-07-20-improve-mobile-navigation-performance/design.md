## Context

Mobile đang dùng React Navigation 7. `ChildStack` là native stack nhưng Home và Explore tự render `ChildBottomNav` rồi gọi `navigation.navigate()` tới các route ngang hàng. Với StackRouter hiện tại, điều hướng sang một route khác không có `pop` sẽ đưa một route mới lên đỉnh stack. Chuỗi Home → Explore → Home → Explore vì vậy có thể tạo nhiều instance, và mỗi Home mới lại mount bản đồ cùng cache effect.

Home hiện render 48 `WeekNode` trong một `ScrollView` cao cố định. Với mỗi tuần, code quét lại `completedLessons` để tìm completed days, quét thêm `lessonStars` để tìm max stars và tạo callback mới. `WeekNode` không được memo hóa. Cùng lúc, Home gọi `pruneExpiredCache()` và `prefetchManifest()` ngay trong mount/progress effect.

Manifest mặc định bao phủ từ tuần hiện tại tới `currentWeek + 4` (tối đa năm tuần tính cả tuần hiện tại, giới hạn bởi entitlement). Server populate activities để thu thập URL; mobile tải các image/audio/video theo batch bốn file. Home, Preparing Lesson, Lesson Player và Lesson Complete đều có thể khởi chạy các call tương tự mà chưa có single-flight.

Lesson Player hiện fetch lesson JSON, await preload toàn bộ asset, hydrate toàn bộ activity URI rồi mới bỏ loading state. Đây là thời gian chờ tới interaction, khác với animation transition nhưng cùng tạo cảm giác chuyển màn hình chậm.

## Goals / Non-Goals

**Goals:**

- Navigation state của các destination child có kích thước ổn định khi chuyển qua lại nhiều lần.
- Home không mount toàn bộ cây view của 48 tuần và không quét progress lặp lại theo từng node.
- Cache maintenance và look-ahead prefetch không cạnh tranh với navigation transition, không chạy trùng và có thứ tự ưu tiên.
- Activity đầu tiên interactive mà không phải chờ asset của toàn bộ lesson.
- Giữ nguyên giao diện menu đáy, Adventure Map, entitlement, deep link và parent gate.
- Giữ nguyên `completedLessons`, `lessonStars`, công thức sao và cách Home hiển thị max stars của tuần.

**Non-Goals:**

- Không thay đổi MongoDB schema hoặc bổ sung completion history.
- Không thay đổi công thức sao, XP, streak, sticker hoặc progression.
- Không thay đổi nội dung lesson/activity hay pipeline publish contract.
- Không triển khai offline synchronization/outbox trong change này.
- Không thêm thư viện list/cache/navigation mới nếu primitive hiện có đáp ứng được.

## Decisions

### 1. Dùng stable child tabs với nested native stacks

Tổ chức navigation dự kiến:

```text
RootNativeStack
├── AuthFlow
├── ChildFlow
│   ├── PreparingLesson
│   ├── ChildTabs
│   │   ├── LessonStack        → PracticeBank
│   │   ├── ExploreStack       → Catalog → Play / Tracing
│   │   ├── DodoStack          → Home → LessonPlayer → LessonComplete
│   │   └── AchievementStack   → StickerCollection
│   └── Paywall
└── ParentTabs
```

`ChildBottomNav` tiếp tục là visual custom tab bar. Bốn destination child là tab roots ổn định; `Phụ huynh` vẫn là action mở Parent Gate chứ không cần giữ một child tab screen giả. Subscription check của `Bài học` tiếp tục redirect tới Paywall khi cần. Preparing Lesson nằm ngoài tab roots và replace sang `ChildTabs` sau khi hoàn tất.

Root/Auth/Parent wrapper chuyển sang native stack ở nơi không cần JS card interpolation. Parent bottom tabs giữ nguyên. Route types được tách rõ giữa root, child tabs và từng nested stack; deep link paywall được map tới route mới.

**Lý do chọn:** tab router quản lý đúng semantics của destination ngang hàng, giữ mỗi root một instance và hỗ trợ nested detail history. Việc chỉ sửa từng callback thành `popTo()` là quick patch nhưng vẫn để kiến trúc menu-tab chạy trên stack, dễ tái phát khi thêm destination hoặc deep link.

### 2. Adventure Map dùng FlatList theo row tuần

Thay container absolute 48-node bằng `FlatList` có row height xác định. Data hiển thị từ tuần 48 xuống tuần 1 để giữ hướng bản đồ hiện tại; `initialScrollIndex` được suy ra từ `currentWeek`, và `getItemLayout` cho phép nhảy tới vị trí không cần đo toàn danh sách.

Mỗi row chịu trách nhiệm:

- Vị trí trái/phải của một `WeekNode` theo parity của week.
- Một đoạn connector tới row kế tiếp thay vì một SVG path toàn bản đồ.
- Island marker nếu row là mốc quý.

List cấu hình `initialNumToRender`, `maxToRenderPerBatch`, `windowSize` và `removeClippedSubviews` phù hợp, sau đó kiểm tra trên Android/iOS để tránh clipping badge/shadow. Nếu `removeClippedSubviews` làm mất shadow, giữ virtualization nhưng tắt riêng option đó.

**Lý do chọn:** `FlatList` là primitive có sẵn, không thêm dependency. Chỉ render một cửa sổ row nên giảm mount/layout cost thực sự; `React.memo` đơn thuần không giảm initial mount 48 tuần.

### 3. Precompute progress theo week một lần

Tạo pure helper nhận `completedLessons` và `lessonStars`, trả về:

```ts
Map<number, Set<number>> completedDaysByWeek
Map<number, number> bestStarsByWeek
```

Home gọi helper bằng `useMemo`; trạng thái node/day/stars chỉ lookup theo week. `WeekNode` được `React.memo`, nhận primitive/array ổn định và một handler chung thay vì callback closure mới cho từng row. Zustand sử dụng selector nhỏ cho `child`, các progress field cần thiết và subscription field cần thiết, tránh rerender khi phần store không liên quan đổi.

Helper phải có test khóa semantics hiện tại, đặc biệt max stars theo tuần và loại bỏ lesson mock.

### 4. Cache coordinator sở hữu deferred work và single-flight

Thêm một coordinator trong lớp service, không đặt orchestration rải rác ở screens. API dự kiến:

```ts
scheduleLookaheadPrefetch({ childId, currentWeek, currentDay, lookaheadWeeks })
scheduleCacheMaintenance()
prefetchActivityAssets(activity)
```

Coordinator dùng `InteractionManager.runAfterInteractions()` để bắt đầu manifest/background downloads sau transition. In-flight map keyed theo child + scope giúp Home/LessonComplete/LessonPlayer dùng chung promise. Maintenance chỉ chạy một lần trong app session hoặc sau interval đã cấu hình; TTL file vẫn là 30 ngày.

Mobile mở rộng type manifest để đọc `lessons[]` mà server đã trả về. URL được phân nhóm:

1. Activity/lesson hiện tại — critical.
2. Lesson kế tiếp theo thứ tự week/day — warm.
3. Các lesson còn lại — background.

Download concurrency vẫn giới hạn, metadata chỉ ghi khi thay đổi và được batch/debounce để tránh write sau từng batch cached-only. Cache entry đã được validate trong session không cần `getInfoAsync` lặp lại ở mọi caller.

Task đã schedule phải hỗ trợ cancellation của `InteractionManager` trước khi bắt đầu; download đã bắt đầu được để hoàn tất trong coordinator và không phụ thuộc lifecycle một screen cụ thể.

### 5. Lesson Player dùng critical-first loading

Sau khi fetch/map lesson:

1. Thu thập và resolve asset của activity đầu tiên.
2. Set lesson/loading false khi activity đầu có cached hoặc fallback URI.
3. Giao phần activity còn lại cho coordinator preload nền.
4. Khi activity sau mount, `ActivityVisual`/audio resolver dùng local URI nếu background preload đã xong, nếu chưa thì dùng remote URL như hiện tại.

Không await `prefetchLessonAssets(wholeLesson)` hoặc `hydrateLessonCachedUris(wholeLesson)` trước first render. Preparing Lesson có thể tiếp tục tải critical content ban đầu nhưng dùng chung coordinator, không tạo manifest operation thứ hai.

### 6. Verification dựa trên invariant trước, FPS sau

Các invariant có thể kiểm tra ổn định trong code/test:

- Sau 20 lần Home ↔ Explore chỉ còn một root cho mỗi tab.
- Derived progress helper trả đúng completed days và max-stars semantics.
- Hai request prefetch cùng key dùng chung promise/API call.
- Lesson Player render activity đầu trong khi promise preload activity sau vẫn pending.
- Home list chỉ render cửa sổ row, không dùng `ScrollView` chứa 48 node.

Sau đó profile release/dev-release trên thiết bị Android mục tiêu, ghi lại trước/sau cho Home ↔ Explore, Home ↔ Parent, mở Lesson và memory sau 20 lần chuyển. Debug Metro không được dùng làm kết luận performance cuối.

## Risks / Trade-offs

- **Navigation refactor ảnh hưởng route params/deep link:** giảm rủi ro bằng typed nested param lists và smoke test mọi entry/return path.
- **FlatList có thể làm connector hoặc shadow bị clipping:** connector được chia theo row; kiểm tra mốc quý, badge TODAY và hai kích thước phone/tablet.
- **Deferred prefetch có thể tăng cache miss nếu trẻ mở lesson ngay:** current activity luôn là critical path; phần defer chỉ áp dụng look-ahead/far assets.
- **Background download vẫn tiêu tốn mạng/battery:** giữ entitlement range và concurrency cap; scope thay đổi không mở rộng quá current + 4.
- **Single-flight giữ promise lỗi:** entry phải được xóa trong `finally` để lần sau retry được.
- **Native-stack transition khác JS-stack một chút:** giữ header hidden/presentation tương đương và kiểm tra gesture/back trên Android/iOS.

## Migration Plan

1. Bổ sung pure progress derivation helper và tests, chưa thay UI.
2. Tạo cache coordinator/single-flight và chuyển caller sang API mới.
3. Chuyển Lesson Player sang critical-first loading.
4. Tạo child tabs/nested stacks và map lại deep link/parent gate.
5. Chuyển Adventure Map sang virtualized rows, giữ visual parity.
6. Chuyển root/parent wrapper phù hợp sang native stack.
7. Chạy lint/typecheck/tests, smoke test navigation và profile release build.

Không có data migration. Rollback theo từng phase; schema MongoDB và AsyncStorage progress không đổi.

## Open Questions

- Thiết bị Android cấu hình thấp nào sẽ được chọn làm baseline chính thức cho số liệu trước/sau?
- Sau khi critical current/next lesson hoàn tất, background prefetch có cần giới hạn chỉ khi app foreground hay được phép tiếp tục trong thời gian app đang active nhưng screen khác được mở?

