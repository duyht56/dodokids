## Why

Change `improve-mobile-navigation-performance` (đã archive 2026-07-20) sửa đúng topology navigation và số view mount, nhưng hai triệu chứng người dùng vẫn còn: chuyển tab chậm và vào bài học chậm. Nguyên nhân còn lại nằm ở network/JS-thread I/O chứ không phải route count: background prefetch quét toàn bộ current+4 tuần và giữ network/JS thread sau khi transition đã bắt đầu; single-flight key chứa week/day nên các màn hình không share được operation; Lesson Player vẫn chặn trên hai lượt chờ mạng nối tiếp (fetch lesson không cache + download asset activity đầu không có time budget); Adventure Map mount ~34/48 row với mỗi row một Svg surface riêng; và các tab đã mount không bao giờ được freeze nên vẫn render khi bị che.

## What Changes

- Giới hạn background prefetch sweep: bỏ await tầng background trong critical path, chỉ chạy khi app foreground + JS idle, có budget số file mỗi session, và debounce ghi metadata thay vì ghi sau mỗi batch 4 file.
- Chuẩn hoá single-flight key của lookahead prefetch về `childId` (bỏ week/day) và thêm session-scope memo để cùng scope không quét lại trong một app session; bỏ dependency `completedLessons.length` khỏi Home effect để mỗi lần hoàn thành bài không kích hoạt một sweep mới.
- Lesson Player: cache lesson fetch qua `@tanstack/react-query` (provider đã mount sẵn, chưa có caller nào); critical asset của activity đầu có time budget (~1500ms) rồi fallback render bằng remote URL thay vì chờ download tới 20s.
- Adventure Map: giảm `windowSize` xuống 3 và thay per-row `<Svg>` connector bằng primitive rẻ hơn (View xoay hoặc một overlay duy nhất) để số native view không phình theo số row mounted.
- Child tabs: bật `freezeOnBlur` (react-native-screens 4.25.2 hỗ trợ) để tab bị che không render; tab bar ẩn bằng style thay vì `return null` unmount cả cây khi vào detail flow.
- Dọn dead code còn sót từ change trước: `prefetchManifest` (hardcode week 1/day 1), `prefetchLessonAssets`, `hydrateLessonCachedUris` — không còn caller.
- Mở rộng `verify-performance-contracts.cjs` cho các invariant mới: background sweep không nằm trong awaited critical path, key coalescing giữa các màn hình, time-budget fallback.

## Capabilities

### New Capabilities

(không có)

### Modified Capabilities

- `asset-cache`: background-tier prefetch phải nằm ngoài awaited critical path, có foreground/idle gate và budget mỗi session; lookahead single-flight coalesce theo child (không theo week/day) và không lặp lại trong cùng app session; metadata write được debounce.
- `lesson-player`: lesson fetch dùng cached query layer; critical-asset preparation có time budget và fallback remote URL khi vượt budget.
- `mobile-home-performance`: giới hạn cửa sổ render chặt hơn và connector không tạo một Svg surface riêng cho mỗi row mounted.
- `navigation-setup`: tab bị che phải được freeze (không render lại khi state đổi); tab bar ẩn trong detail flow không unmount cây tab bar.

## Impact

- `mobile/src/services/assetCache.ts` — tách tầng background khỏi awaited path, debounce metadata save, xoá dead exports.
- `mobile/src/services/cacheCoordinator.ts`, `cacheScheduling.ts` — key mới, session memo, foreground/idle gate, budget.
- `mobile/src/screens/child/LessonPlayerScreen.tsx` + hook query mới — react-query cho `/lessons/today`, time-budget critical prep.
- `mobile/src/screens/child/HomeScreen.tsx` — windowSize, connector primitive, bỏ `completedLessons.length` dep.
- `mobile/src/navigation/ChildStack.tsx` — `freezeOnBlur`, tab bar hide-by-style.
- `mobile/scripts/verify-performance-contracts.cjs` — contract mới.
- Không đổi wire contract, không migration, không đổi semantics sao/XP/streak/completedLessons.
