## Why

Sau khi trẻ vào bản đồ và chọn tuần học, cần một màn hình **Lesson Player** hiển thị câu hỏi tương tác (single-select, đếm đối tượng) và màn hình **Lesson Complete** ăn mừng kết quả. Ngoài ra cần màn hình **Paywall** để chuyển đổi người dùng free sang trả phí khi họ chạm giới hạn tuần. Đây là core loop học tập của Kido.

## What Changes

- **Mới**: `LessonPlayerScreen` — màn hình chơi bài học với activity engine hỗ trợ loại câu hỏi `single_select`; mobile (full-screen) và tablet (split Đô Đô panel)
- **Mới**: `LessonCompleteScreen` — màn hình ăn mừng 3 sao sau khi hoàn thành bài học; hiển thị streak + XP earned; CTA "Bài tiếp theo" hoặc "Về bản đồ"
- **Mới**: `PaywallScreen` — màn hình upsell với 2 gói (annual/monthly), 7-day trial CTA; kích hoạt khi user chạm tuần bị khoá hoặc từ bottom nav
- **Mới**: BE endpoint `POST /progress/complete-lesson` để lưu kết quả bài học, cộng XP, cập nhật streak
- **Mới**: BE endpoint `GET /lessons/:week` để fetch activity data (câu hỏi, đáp án, image) cho tuần đó
- **Mới**: `ActivityEngine` — component render câu hỏi theo `type`; bắt đầu với `single_select`, mở rộng dễ dàng
- **Sửa**: `useAuthStore` — thêm `xp`, `streak` vào progress state
- **Sửa**: `useSubscriptionStore` — thêm `startTrial()` action

## Capabilities

### New Capabilities

- `lesson-player`: Màn hình chơi bài học với activity engine, progress bar, mascot speech bubble, câu hỏi single_select, trạng thái correct/wrong với animation
- `lesson-complete`: Màn hình kết quả 3 sao, streak card, XP reward, confetti animation, CTA tiếp theo
- `paywall`: Màn hình upsell gói Premium (annual/monthly), feature list, 7-day trial, đóng/navigate về bản đồ
- `activity-api`: BE endpoints để fetch lesson data và submit kết quả (complete-lesson, get-lesson)

### Modified Capabilities

- `state-management`: Thêm `xp` và `streak` vào `progress`; thêm `startTrial()` vào subscription store

## Impact

- **Mobile**: `mobile/src/screens/child/LessonPlayerScreen.tsx`, `LessonCompleteScreen.tsx`, `PaywallScreen.tsx`
- **Mobile components**: `mobile/src/components/ActivityEngine.tsx`, `mobile/src/components/OptionCard.tsx`, `mobile/src/components/ConfettiOverlay.tsx`
- **Navigation**: `ChildStackParamList` — thêm `LessonPlayer: { week: number }`, `LessonComplete: { week: number; stars: number; xp: number }`, `Paywall: { trigger: 'map' | 'nav' }`
- **Store**: `mobile/src/store/authStore.ts`, `mobile/src/store/subscriptionStore.ts`
- **BE**: `kido-server/src/modules/lessons/`, `kido-server/src/modules/progress/`
- **Assets**: cần ảnh `dodo.png` (đã có), `clay-leaf.png` (placeholder), mascot celebrating image
