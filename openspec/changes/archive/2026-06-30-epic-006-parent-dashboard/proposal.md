## Why

EPIC-003 thêm `ParentDashboardScreen` dưới dạng stub placeholder (1 dòng text). Sau khi EPIC-004/005 hoàn thiện vòng học của trẻ (bản đồ → bài học → kết quả), phụ huynh cần một màn hình thực sự để theo dõi tiến độ con, xem báo cáo tuần, quản lý nhiệm vụ offline, và điều chỉnh cài đặt ứng dụng.

## What Changes

- **Thay thế** `ParentDashboardScreen` stub bằng màn hình đầy đủ 4 section: progress card, weekly report, offline task, settings
- **Mới**: `OfflineTaskCard` component (Screen 14) với 4 trạng thái: `pending` | `done` | `skipped` | `empty`
- **Mới**: `SkeletonLoader` component (Screen 11) shimmer animation dùng chung toàn app
- **Mới**: BE endpoint `GET /parent/summary` — trả về tiến độ tuần hiện tại, streak, XP, báo cáo D1–D5
- **Mới**: BE endpoint `PATCH /parent/offline-task` — cập nhật trạng thái nhiệm vụ offline (done/skipped)
- **Sửa**: `state-management` — thêm `offlineTask` shape vào `authStore` (taskId, status, completedAt)
- Tablet: 2-column layout (summary panel trái, detail sections phải)

## Capabilities

### New Capabilities

- `parent-dashboard`: Màn hình phụ huynh đầy đủ — progress card (streak, XP, bài hoàn thành tuần), weekly-report accordion (D1–D5, khoá đến Chủ nhật), offline task section, settings section (thông báo, âm thanh, quản lý đăng ký)
- `offline-task-card`: Component OfflineTaskCard 4 trạng thái (pending/done/skipped/empty) với actions "✅ Đã làm" / "⏭ Bỏ qua"; dùng ở Parent Dashboard và có thể tái sử dụng
- `skeleton-loader`: Component SkeletonLoader shimmer dùng chung — width/height/radius/circle props; shimmer LinearGradient `#E8E8E8→#F5F5F5→#E8E8E8` 1500ms loop
- `parent-api`: BE endpoints `/parent/summary` (GET) và `/parent/offline-task` (PATCH) trả về dữ liệu phụ huynh

### Modified Capabilities

- `state-management`: Thêm `offlineTask: { taskId: string; status: 'pending'|'done'|'skipped'; completedAt: string|null }` vào `authStore`; thêm `setOfflineTask()` action

## Impact

- **Mobile screens**: `mobile/src/screens/child/ParentDashboardScreen.tsx` (rewrite từ stub)
- **Mobile components**: `mobile/src/components/OfflineTaskCard.tsx` (mới), `mobile/src/components/SkeletonLoader.tsx` (mới)
- **Store**: `mobile/src/store/authStore.ts` — thêm `offlineTask` state và action
- **BE**: `kido-server/src/modules/parent/` (mới — controller, service, DTO)
- **Navigation**: không thay đổi routing; `ParentDashboard` route đã tồn tại trong `ChildStackParamList`
- **Fonts**: Parent Dashboard dùng **Inter** cho body text (không phải Nunito) — cần verify Inter đã load trong `@/constants/tokens`
