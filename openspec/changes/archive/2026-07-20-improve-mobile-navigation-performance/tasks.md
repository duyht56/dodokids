## 1. Baseline và guard cho semantics hiện tại

- [x] 1.1 Ghi baseline release/dev-release cho Home ↔ Explore, Home ↔ Parent, mở Lesson và memory/route state sau 20 lần chuyển trên thiết bị mục tiêu
- [x] 1.2 Tạo pure helper derivation progress theo week và tests cho completed days, mock lesson filtering, current state và max-stars hiện tại
- [x] 1.3 Thêm test khóa công thức/hiển thị sao hiện tại để change performance không làm đổi `lessonStars` semantics

## 2. Ổn định child navigation topology

- [x] 2.1 Tách typed param lists cho ChildTabs, LessonStack, ExploreStack, DodoStack và AchievementStack
- [x] 2.2 Tạo ChildTabs với bốn stable child destinations và dùng `ChildBottomNav` làm custom tab bar
- [x] 2.3 Giữ `Phụ huynh` là Parent Gate action từ custom tab bar; không tạo child route instance khi chỉ mở gate
- [x] 2.4 Chuyển Home/LessonPlayer/LessonComplete vào DodoStack, Catalog/Play/Tracing vào ExploreStack, PracticeBank vào LessonStack và StickerCollection vào AchievementStack
- [x] 2.5 Giữ subscription redirect của `Bài học`, Preparing Lesson bootstrap, Paywall, back behavior và route params hiện tại
- [x] 2.6 Chuyển Root/Auth/Parent stack boundary phù hợp sang native-stack và cập nhật `kido://paywall` linking config
- [x] 2.7 Thêm navigation-state check: Home ↔ Explore 20 lần không tạo duplicate tab roots hoặc tăng stack tuyến tính

## 3. Tối ưu Home render và progress derivation

- [x] 3.1 Thay các whole-store subscription trong Home bằng selector nhỏ cho đúng field cần dùng
- [x] 3.2 Dùng memoized `completedDaysByWeek` và `bestStarsByWeek` thay cho filter/reduce theo từng `WeekNode`
- [x] 3.3 Bọc `WeekNode` bằng `React.memo` và truyền stable props/handler để parent-gate state không rerender toàn bộ node đang thấy
- [x] 3.4 Chuyển Adventure Map từ `ScrollView` absolute 48 node sang virtualized `FlatList` row với `getItemLayout` và `initialScrollIndex`
- [x] 3.5 Render connector/island marker theo row và giữ parity trái/phải, TODAY badge, day dots, stars, phone/tablet visual parity
- [x] 3.6 Tune `windowSize`, `initialNumToRender`, `maxToRenderPerBatch` và kiểm tra shadow/clipping trên Android/iOS

## 4. Điều phối cache ngoài transition

- [x] 4.1 Thêm cache coordinator với `InteractionManager.runAfterInteractions`, cancellable scheduled task và in-flight map keyed theo child/scope
- [x] 4.2 Mở rộng mobile manifest types để dùng `lessons[]` hiện có và phân loại current, next, farther lesson assets
- [x] 4.3 Thêm priority scheduling: current critical → next warm → farther background, giữ concurrency cap
- [x] 4.4 Throttle `pruneExpiredCache` theo app session/maintenance interval và chuyển khỏi Home progress effect trực tiếp
- [x] 4.5 Tránh metadata write/file stat lặp lại cho cached-only batch bằng session validation và batched/debounced metadata save
- [x] 4.6 Chuyển Home, Preparing Lesson, Lesson Player và Lesson Complete sang coordinator; loại bỏ manifest/prune call trùng
- [x] 4.7 Thêm tests cho single-flight success/error cleanup, deferred start, priority ordering và prune throttle

## 5. Critical-first Lesson Player

- [x] 5.1 Export helper thu thập asset theo một activity và thêm `prefetchActivityAssets`/critical URI resolution
- [x] 5.2 Sửa Lesson Player để chỉ await asset activity đầu trước khi bỏ loading state
- [x] 5.3 Preload các activity còn lại qua coordinator mà không block first interaction
- [x] 5.4 Giữ remote fallback khi critical/background download fail và giữ audio question auto-play hiện tại
- [x] 5.5 Thêm test rằng activity đầu render khi preload activity sau vẫn pending

## 6. Verification và performance regression

- [x] 6.1 Chạy mobile lint và TypeScript check; sửa toàn bộ navigation param/type regression trong scope
- [x] 6.2 Smoke test cold start, Preparing → Home, năm bottom-menu actions, Explore detail back, Lesson completion, Paywall deep link và Parent Gate
- [x] 6.3 Xác nhận completed lesson, XP, streak và số sao trước/sau change giống nhau với cùng activity results
- [x] 6.4 Profile release/dev-release lại cùng thiết bị và flow baseline; ghi route count, mounted Home rows, transition responsiveness và memory sau 20 lần chuyển
- [x] 6.5 Ghi residual risk/thiết bị chưa kiểm tra và cập nhật docs/runbook nếu command hoặc profiling flow mới được thêm
