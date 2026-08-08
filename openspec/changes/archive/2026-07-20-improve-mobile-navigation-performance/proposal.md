## Why

Mobile hiện chuyển qua lại giữa các màn hình chưa mượt và có xu hướng chậm dần. Nguyên nhân chính đã được truy ra trong code hiện tại: menu đáy của khu vực trẻ em đang dùng các route của native stack như tab nên mỗi lần `navigate()` có thể thêm một instance màn hình mới; Home render đồng thời toàn bộ bản đồ 48 tuần và lặp lại nhiều phép suy diễn progress; đồng thời Home khởi chạy prune/prefetch asset ngay trong thời gian transition. Khi mở lesson, player còn chờ preload toàn bộ asset trước khi hiển thị activity đầu tiên.

Change này tối ưu các đường chuyển màn hình và thời gian tới nội dung tương tác đầu tiên, giữ nguyên hành vi sản phẩm hiện tại về bài đã hoàn thành, số sao, XP, streak và entitlement.

## What Changes

- Tổ chức lại child navigation để năm destination của menu đáy dùng tab state ổn định và các flow con dùng nested stack; chuyển qua lại không được tích lũy thêm các instance Home/Explore.
- Dùng native stack cho các boundary phù hợp ở root/parent để giảm chi phí transition của JS stack, đồng thời giữ nguyên deep link và parent gate.
- Tối ưu Home bằng cách suy diễn trạng thái tuần/ngày/sao một lần từ progress, giữ nguyên semantics sao hiện tại, memo hóa node và virtualize bản đồ 48 tuần.
- Tách cache maintenance/prefetch khỏi critical transition: trì hoãn tới sau interaction, chống request/download trùng bằng single-flight, throttle prune và ưu tiên lesson hiện tại/tiếp theo trước các tuần xa.
- Cho Lesson Player hiển thị khi asset critical của activity đầu tiên sẵn sàng; các asset còn lại tiếp tục preload nền và vẫn fallback về remote URL khi cache miss.
- Bổ sung kiểm tra performance trên release build: route count không tăng sau chuyển tab lặp lại, Home chỉ mount một cửa sổ node hữu hạn và lesson không chờ asset của toàn bộ các activity trước khi interactive.

## Capabilities

### New Capabilities

- `mobile-home-performance`: Quy định render có giới hạn cho bản đồ 48 tuần, suy diễn progress một lần và tiêu chí kiểm tra ổn định khi chuyển màn hình lặp lại.

### Modified Capabilities

- `navigation-setup`: Child bottom menu trở thành tab topology đúng nghĩa, stack không phình khi đổi destination và root/parent dùng native navigation boundary phù hợp.
- `asset-cache`: Prefetch có priority, single-flight, chạy sau interaction; prune không chạy lại theo từng mount/completion.
- `lesson-player`: Chuyển từ chờ preload toàn bộ lesson sang critical-first loading rồi preload phần còn lại ở background.

## Impact

- `mobile/src/navigation/RootNavigator.tsx`, `ChildStack.tsx`, `ParentStack.tsx`, `types.ts` — topology và type của navigator.
- `mobile/src/components/ChildBottomNav.tsx` — tái sử dụng làm custom tab bar, không thay đổi visual contract năm destination.
- `mobile/src/screens/child/HomeScreen.tsx`, `mobile/src/components/WeekNode.tsx` — derived progress map, memoization và virtualization.
- `mobile/src/services/assetCache.ts` cùng điểm bootstrap/scheduler mới — single-flight, priority, prune cadence và deferred execution.
- `mobile/src/screens/child/LessonPlayerScreen.tsx`, `PreparingLessonScreen.tsx`, `LessonCompleteScreen.tsx` — critical-first preload và loại bỏ các manifest call trùng.
- Navigation tests, cache tests và verification instrumentation cho release build.
- Không migration database; không thay đổi `completedLessons`, `lessonStars` hoặc công thức tính sao.
