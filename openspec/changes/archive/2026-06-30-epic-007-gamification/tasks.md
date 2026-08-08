## 1. Schema & State

- [x] 1.1 Thêm `@Prop({ type: Map, of: Number, default: {} }) lessonStars: Map<string, number>` vào `ChildProgress` trong `kido-server/src/common/schemas/child.schema.ts`
- [x] 1.2 Thêm `lessonStars: Record<string, number>` vào `progress` shape trong `mobile/src/types/store.ts`; default `{}`; include trong `partialize` (progress được persist nguyên khối)
- [x] 1.3 Thêm action `setLessonStars(lessonId: string, stars: number)` vào `authStore` — chỉ ghi đè nếu `stars > current` (best-score local mirror)
- [x] 1.4 Verify TypeScript: server `npx tsc --noEmit` (exit 0) + mobile `npx tsc --noEmit` (exit 0). Cũng sửa 2 lỗi pre-existing từ EPIC-006 chưa commit: `SkeletonLoader` translateX cast + `ParentDashboard` `absoluteFillObject`→`absoluteFill`

## 2. Backend — Star Persistence (best-score)

- [x] 2.1 Trong `progress.service.completeLesson`: helper `resolveStars` tính `correctFirstTry` từ `dto.activityResults`; server authoritative (≥5→3, ≥3→2, else 1) — client chỉ là fallback khi không có results (spec yêu cầu client thổi phồng vẫn bị cap về giá trị server)
- [x] 2.2 Cập nhật `progress.lessonStars[lessonId] = max(existing ?? 0, stars)`; `markModified('progress')`
- [x] 2.3 Sửa nhánh idempotent ("already completed"): VẪN cập nhật `lessonStars` nếu sao mới cao hơn, nhưng KHÔNG cộng XP / không đổi streak / không advance day; trả `{ ...progress, stickerEarned:false, xpEarned:0, stars }`
- [x] 2.4 Thêm `stars` vào response của nhánh hoàn thành mới; invalidate cache `progress:${childId}` (đã có)
- [ ] 2.5 Test: hoàn thành lần đầu 3 sao → lưu 3; replay với 1 sao → vẫn 3 (best-score), XP không tăng lần 2

## 3. Backend — Achievements API

- [x] 3.1 Thêm `WEEK_STICKERS` static table (12 tuần): `{ emoji, bg }` dùng màu pastel từ Screen-06
- [x] 3.2 Thêm `BADGES` definition (6 badge, predicate `earned`) theo bảng trong design.md
- [x] 3.3 Implement `getAchievements(childId)` trong `progress.service.ts`: trả `{ streakCount, weekDots[], badges[], stickers[] }`; weekDots tính từ `lastLessonDate` + thứ trong tuần; stickers map từ `stickersEarned` + vài ô locked kế tiếp
- [x] 3.4 Thêm route `GET :childId/achievements` vào `progress.controller.ts` (đặt sau `weekly-report`, trước `:childId`)
- [ ] 3.5 Test: child mới (streak 0, chưa sticker) → tất cả badge `earned:false`, weekDots đúng thứ hôm nay; child streak≥7 → badge `diligent earned:true`

## 4. Backend — Practice Bank API

- [x] 4.1 Implement `getPractice(childId)` trong `lessons.service.ts`: lấy `completedLessons[]`; query activities thuộc các lesson đó; Fisher–Yates shuffle; trả tối đa 12 `Activity`
- [x] 4.2 Thêm route `GET practice/:childId` vào `lessons.controller.ts` (đặt trước `:lessonId` để không bị shadow)
- [x] 4.3 `completedLessons` rỗng → trả `[]` (không lỗi)
- [x] 4.4 Server `npx tsc --noEmit` pass (exit 0)

## 5. Star Rating — Mobile

- [x] 5.1 `LessonPlayerScreen`: `attemptsRef` ghi attempt thật khi đúng; build `activityResults[]` từ attempt thật
- [x] 5.2 Tính `stars` từ `correctFirstTry` ngay trước PATCH; gửi `stars` thật (bỏ hardcode `stars: 3`) + `activityResults`
- [x] 5.3 Sau khi BE trả `stars`, gọi `setLessonStars(lessonId, stars)`; truyền `stars` thật vào route params `LessonComplete`
- [x] 5.4 `LessonCompleteScreen`: `EarnStar` (spring scale 0→1, delay 300ms×i, rồi bob) + `EmptyStar` silhouette mờ cho slot chưa đạt
- [x] 5.5 `HomeScreen`: `getStars` đọc max sao theo `weekKey` từ `progress.lessonStars` (tối thiểu 1 cho week đã hoàn thành)

## 6. Achievements Screen (Screen-06)

- [x] 6.1 Tạo `AchievementBadge.tsx` — earned: card trắng r18 shadow; locked: bg `#F4F2EC`, emoji grayscale opacity .4, label "🔒 Khóa"
- [x] 6.2 Tạo `StickerGrid.tsx` — wrapper width % + padding nội bộ; ô `aspectRatio:1`, bg pastel; locked → 🔒 mờ
- [x] 6.3 Rewrite `StickerCollectionScreen.tsx` → AchievementsScreen: header "Thành tích" + back; streak card gradient coral với số ngày 48pt + 7 chấm tuần (done ✓ / today ★ twinkle / future mờ)
- [x] 6.4 Section "🏅 Huy hiệu": badge grid (3 cột mobile / 4 cột tablet)
- [x] 6.5 Section "✨ Sticker đã nhận": `StickerGrid` (4 cột mobile / 6 cột tablet)
- [x] 6.6 Wire `fetchAchievements(childId)` trong `useEffect`; loading → `SkeletonLoader`; error → fallback streak từ store
- [x] 6.7 Wire tab "Thành tích" (`onAchievementsPress` → `navigate('StickerCollection')`); route key giữ nguyên
- [x] 6.8 Tablet (`useIsTablet`): streak card horizontal; badge 4 cột; sticker 6 cột

## 7. Streak Milestone Modal

- [x] 7.1 Tạo `StreakMilestoneModal.tsx` — bottom sheet `sheet-up` anim; Đô Đô float + "🔥 {n} ngày liên tiếp!" + CTA "Tuyệt vời!"; export `STREAK_MILESTONES`
- [x] 7.2 `LessonCompleteScreen`: state `showMilestone` khởi tạo `STREAK_MILESTONES.includes(newStreak)`; render modal
- [x] 7.3 Modal chỉ hiện theo `newStreak` của lần complete này (state cục bộ, dismiss = đóng hẳn)

## 8. Practice Bank Screen

- [x] 8.1 `fetchPractice(childId)` trong `progressApi.ts` → `GET /lessons/practice/:childId`
- [x] 8.2 Rewrite `PracticeBankScreen.tsx`: header "Ôn luyện cùng Đô Đô 🎓"; fetch + `mapServerLesson` để normalize; render qua `ActivityContainer` (1 activity/lần, loop on result); KHÔNG gọi completeLesson
- [x] 8.3 Empty state khi `[]`: 📚 + "Hoàn thành bài học để mở khoá ôn luyện"; nút "Về nhà" luôn hiện
- [x] 8.4 Tablet: truyền `tablet` prop vào `ActivityContainer`

## 9. Services & Integration

- [x] 9.1 Tạo `progressApi.ts`: `fetchAchievements(childId)` + `fetchPractice(childId)` + types (`Achievements`, `WeekDot`, `Badge`)
- [x] 9.2 `setLessonStars` gọi sau complete; `HomeScreen.getStars` đọc từ store nên re-render khi quay lại map

## 10. Polish & Verify

- [x] 10.1 TypeScript zero errors: mobile + server (`npx tsc --noEmit` exit 0 cả hai)
- [x] 10.2 Lint sạch trên các file mới (0 lỗi 0 warning); HomeScreen còn 2 warning pre-existing (`typography`, `insets`) ngoài scope
- [ ] 10.3 On-device: hoàn thành lesson với mix đúng/sai → sao đúng số; sao bay vào có anim; week node trên map hiện đúng sao
- [ ] 10.4 On-device: màn Thành tích — streak card, badges (earned vs locked), sticker grid render đúng; tablet 4/6 cột
- [ ] 10.5 On-device: streak chạm 7 ngày → milestone modal bật; Practice Bank chạy activity không cộng XP
- [ ] 10.6 Git: tạo 1 commit `feat(epic-007): gamification` (theo quy ước mỗi epic 1 commit)
