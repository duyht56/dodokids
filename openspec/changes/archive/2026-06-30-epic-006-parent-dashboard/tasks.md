## 1. State & Store

- [x] 1.1 Thêm `offlineTask: { taskId: string|null; status: 'pending'|'done'|'skipped'; completedAt: string|null } | null` vào `AuthState` interface trong `src/types/store.ts`; default `null`
- [x] 1.2 Thêm `offlineTask` vào `authStore` initial state; thêm `setOfflineTask()` action; include `offlineTask` trong `partialize` (persisted)
- [x] 1.3 Verify TypeScript: `npx tsc --noEmit` — zero errors sau khi sửa store

## 2. SkeletonLoader Component

- [x] 2.1 Tạo `mobile/src/components/SkeletonLoader.tsx` — props: `width: number|'100%'`, `height: number`, `radius?: number` (default 8), `circle?: boolean` (default false), `style?: ViewStyle`
- [x] 2.2 Implement shimmer bằng Reanimated: `useSharedValue(0)` → `withRepeat(withTiming(1,{duration:1500}), -1)`; dùng `interpolate` để sweep highlight band qua width; cancel animation on unmount
- [x] 2.3 Màu shimmer: `#E8E8E8 → #F5F5F5 → #E8E8E8`; khi `circle={true}` set `borderRadius: typeof width === 'number' ? width/2 : radius`

## 3. OfflineTaskCard Component

- [x] 3.1 Tạo `mobile/src/components/OfflineTaskCard.tsx` với props interface đầy đủ: `status`, `week`, `lesson`, `subject`, `task`, `doneAt?`, `onDone`, `onSkip`
- [x] 3.2 Implement `pending` state: card border 1pt `#F0ECE4`, task text, week+subject row, 2 buttons — "✅ Đã làm" (coral fill) và "⏭ Bỏ qua" (outline ghost)
- [x] 3.3 Implement `done` state: green left border 4pt, checkmark icon, task text, "Đã làm lúc {HH:mm}" label — format `doneAt` với `new Date(doneAt).toLocaleTimeString('vi-VN', {hour:'2-digit',minute:'2-digit'})`
- [x] 3.4 Implement `skipped` state: amber left border 4pt, skip icon, "Đã bỏ qua" label; no action buttons
- [x] 3.5 Implement `empty` state: centered text "Chưa có nhiệm vụ tuần này" với slate color

## 4. Backend — Parent Module

- [x] 4.1 Tạo `kido-server/src/modules/parent/` với `parent.module.ts`, `parent.controller.ts`, `parent.service.ts`
- [x] 4.2 Thêm `OFFLINE_TASKS` static array (weeks 1–12): mỗi entry có `lesson`, `subject`, `task` — dùng task text từ Screen 14 design làm template cho các tuần
- [x] 4.3 Implement `GET /parent/:childId/summary` — lấy progress từ `ChildProgress` doc, lookup `OFFLINE_TASKS[currentWeek - 1]`, merge `offlineTask` status từ `Child.offlineTask` field; reset về 'pending' nếu stored task thuộc tuần cũ; trả JSON theo shape spec
- [x] 4.4 Implement `PATCH /parent/:childId/offline-task` — validate `{ taskId: string, status: 'done'|'skipped' }` bằng DTO + `class-validator` (`@IsIn`); update `Child.offlineTask` trong MongoDB; set `completedAt` timestamp
- [x] 4.5 Thêm `offlineTask` field vào `ChildSchema` (Mongoose): `{ taskId: String, status: String, completedAt: Date }` — optional, default `null`
- [x] 4.6 Register `ParentModule` trong `AppModule`. NOTE: codebase chưa có JWT infra — endpoints dùng `:childId` path param khớp pattern của `ProgressController` (không có guard). Spec `parent-api` (JWT/ownership) deviate — xem ghi chú cuối.
- [x] 4.7 Server `npx tsc --noEmit` pass (exit 0); endpoint shape khớp spec `GET /parent/:childId/summary`

## 5. ParentDashboardScreen

- [x] 5.1 Rewrite `mobile/src/screens/child/ParentDashboardScreen.tsx` — layout: `ScrollView` chứa 4 sections (Progress Card, Weekly Report, Offline Task, Settings)
- [x] 5.2 Progress Card: LinearGradient coral, hiển thị streak badge, XP badge, lesson count badge; pre-populate từ `authStore.progress`, overwrite sau khi `GET /parent/:childId/summary` resolves
- [x] 5.3 Weekly Report: 5 rows D1–D5; mỗi row có day label, subject icon, completed/today/pending state từ `progress.currentDay`; lock overlay nếu `new Date().getDay() !== 0`
- [x] 5.4 Offline Task section: render `SkeletonLoader` (width '100%', height 140) khi đang fetch; sau khi data arrives render `OfflineTaskCard` với status resolved (local optimistic > server)
- [x] 5.5 Offline Task actions: `onDone` → call `setOfflineTask({...,'done', completedAt})` (optimistic) rồi `updateOfflineTask()` async; `onSkip` tương tự với `'skipped'`
- [x] 5.6 Settings section: 3 rows — Thông báo (Switch), Âm thanh (Switch); Quản lý đăng ký (chevron row) → `Linking.openURL` (platform subscription URL)
- [x] 5.7 Tablet layout (`useIsTablet()`): `flexDirection:'row'` container — left col 40% (Progress Card), right col 60% (Weekly Report + Offline Task + Settings trong ScrollView)
- [x] 5.8 Tất cả body text (fontSize ≥ 13) trong screen này dùng `fontFamily: 'Inter_600SemiBold'`

## 6. API Integration

- [x] 6.1 Tạo `mobile/src/services/parentApi.ts` — export `fetchParentSummary()` và `updateOfflineTask(childId, taskId, status)` dùng `api` (axios instance đã setup)
- [x] 6.2 Wire `fetchParentSummary()` trong `useEffect` khi `ParentDashboardScreen` mount; set `loading` state; on success update progress + serverTask; on error giữ local data

## 7. Polish & Verify

- [x] 7.1 TypeScript: `npx tsc --noEmit` — zero errors trên mobile (exit 0) VÀ server (exit 0). Lint: 4 file mới sạch; 1 lỗi pre-existing ở `ParentGateModal.tsx:60` (reset() trong effect, từ EPIC-003 — ngoài scope)
- [x] 7.2 Verify wiring: `HomeScreen` → `ParentGateModal.onSuccess` → `navigate('ParentDashboard')`; `ChildStack` đã register `ParentDashboardScreen` (structural — verified)
- [ ] 7.3 Test on-device: OfflineTaskCard tất cả 4 states render đúng; tap "Đã làm" chuyển sang done state (cần chạy app)
- [ ] 7.4 Test on-device: cắt mạng → reload → skeleton hiển thị; data local vẫn render progress card từ store (cần chạy app)
- [ ] 7.5 Test on-device: tablet layout (iPad simulator) — 2 column render đúng (cần chạy app)
