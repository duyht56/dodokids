## Context

`ParentDashboardScreen` hiện là stub 1 dòng từ EPIC-003. Sau khi EPIC-004/005 hoàn thiện vòng học của trẻ, dữ liệu thực (XP, streak, completedLessons, offlineTask) đã tồn tại trong `authStore` và BE (`progress` module). EPIC-006 build lên trên nền đó để render màn hình phụ huynh thực sự.

Stack: React Native / Expo SDK 56, NestJS 10, Mongoose. `Inter_600SemiBold` đã loaded (dùng trong `typography.label`); Parent Dashboard dùng Inter cho body text (không phải Nunito) theo design handoff.

## Goals / Non-Goals

**Goals:**
- Render đầy đủ 4 section trên `ParentDashboardScreen`: Progress Card, Weekly Report, Offline Task, Settings
- `OfflineTaskCard` component tái sử dụng được (4 states: pending/done/skipped/empty)
- `SkeletonLoader` component dùng chung toàn app (shimmer)
- BE `GET /parent/summary` tổng hợp progress từ `child` + `progress` module
- BE `PATCH /parent/offline-task` cập nhật trạng thái task
- Tablet 2-column layout: summary panel trái (40%), detail sections phải (60%)

**Non-Goals:**
- Push notifications (settings chỉ render toggle UI, không wire actual notifications)
- In-app subscription management (tap "Quản lý đăng ký" → `Linking.openURL` đến App Store/Play Store)
- Multi-child support (scope: 1 child per account)
- Weekly Report real data trước khi có đủ API (hiển thị local `authStore.progress` data trước)

## Decisions

### D1: Data source — local store vs. API
`GET /parent/summary` gọi lên BE để lấy server-side progress (streak tính đúng qua timezone, completedLessons từ DB). Tuy nhiên để màn hình render ngay không bị blank, **pre-populate từ `authStore.progress`** trước, sau đó overwrite bằng server response. Pattern: `isLoading=true` → render skeleton → data arrives → replace.

**Lý do chọn hybrid vs. pure API**: Offline mode vẫn hiển thị được dữ liệu local; người dùng không thấy màn hình trắng khi mạng chậm.

### D2: Weekly Report locking
Design handoff: "Weekly report khoá đến Chủ nhật." Cách đơn giản nhất: check `new Date().getDay() === 0` (Sunday). Nếu không phải Chủ nhật → hiển thị accordion nhưng rows bị blur + lock icon. Data từ `authStore.progress.completedLessons` vẫn đủ để render D1–D5 completed/pending dots mà không cần server.

**Lý do**: không cần BE endpoint riêng cho weekly report; đủ data local.

### D3: Inter font cho Parent Dashboard
`typography.label` đã dùng `Inter_600SemiBold`. Parent Dashboard body text dùng `{ fontFamily: 'Inter_600SemiBold', fontSize: 15 }` inline (không thêm vào tokens để tránh nhầm lẫn với Nunito body dùng ở child UI). Section header dùng `{ fontFamily: 'Inter_600SemiBold', fontSize: 13 }` (= typography.label).

### D4: SkeletonLoader — Animated vs. Reanimated
Dùng `react-native-reanimated` (đã install) thay vì `Animated` API vì shimmer cần `withRepeat(withSequence(...))` — cùng pattern với existing animations. Dùng `interpolateColor` trên `useSharedValue(0→1)`.

### D5: OfflineTask state storage
`offlineTask` trong `authStore` (persisted): `{ taskId, status, completedAt }`. BE `PATCH /parent/offline-task` là best-effort (không block UI nếu fail). Optimistic update: set local state ngay, sync BE async.

## Risks / Trade-offs

- **[Risk]** Weekly report hiển thị local data (không server-verified) → user thấy sai nếu progress sync chưa xong. **Mitigation**: thêm `lastSyncedAt` và hiển thị badge "Cập nhật lần cuối: {time}" nếu >30 phút.
- **[Risk]** `GET /parent/summary` chưa có auth guard đúng child ownership. **Mitigation**: endpoint dùng JWT `childId` từ token, không accept `childId` từ request body.
- **[Risk]** Inter font chỉ có SemiBold (600) đã load. Nếu design cần Regular (400) hoặc Bold (700) → cần thêm vào `app.json` font loading. **Mitigation**: scope to Inter_600SemiBold only; nếu cần weight khác thì là task riêng.

## Open Questions

- `offlineTask` data (taskId, task text, subject) đến từ đâu? BE generate theo tuần hiện tại hay hardcode? → **Quyết định**: `GET /parent/summary` trả về `offlineTask` object với text, subject cho tuần hiện tại; BE hardcode 1 task per week dựa trên `currentWeek`.
