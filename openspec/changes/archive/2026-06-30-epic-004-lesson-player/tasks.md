> **Adapted plan (BE):** Giữ nguyên model `(currentWeek, currentDay)` + schema lesson/activity hiện có. Chỉ THÊM xp + weekly-report. Mobile gọi endpoint sẵn có (`GET /lessons/today`, `PATCH /progress/:childId/complete-lesson`) với fallback mock.

## 1. Store & Types

- [x] 1.1 Giữ `currentWeek` + `currentDay` (day-in-week 1–5) trong `ChildProgress`; thêm `xp: number` (default 0) và `lastCompletedDate?: string` vào `mobile/src/types/store.ts`
- [x] 1.2 Thêm `addXp(amount)`, `setStreak(days)`, `completeDay()` actions vào `useAuthStore` (completeDay: advance currentDay 1→5 rồi week++; push lessonId vào completedLessons)
- [x] 1.3 Thêm `startTrial()` action và `trialStartDate: string | null` vào `useSubscriptionStore`; `startTrial()` set `status: 'trial'`, `trialWeeks: 4`, `plan: 'free'`, `trialStartDate: new Date().toISOString()`
- [x] 1.4 Tạo `mobile/src/types/lesson.ts` export `LessonActivity`, `ActivityOption`, `PlayableLesson`, `AnswerState`; thêm mapper `mapServerLesson()` để chuyển lesson từ BE → PlayableLesson (best-effort từ activity.payload)
- [x] 1.5 Cập nhật navigation params: `LessonPlayer: { week: number; day?: number }`, `LessonComplete: { week: number; stars: number; xp: number; newStreak: number }`, `Paywall: { trigger?: 'map' | 'nav' | 'report' }` vào `ChildStackParamList`

## 2. Backend — XP & Weekly Report (adapt, không đập schema)

- [x] 2.1 Thêm `@Prop({ default: 0 }) xp: number` vào `ChildProgress` và `@Prop({ default: true }) weeklyReportEnabled: boolean` vào `Child` (child.schema.ts)
- [x] 2.2 Cập nhật `progress.service.ts completeLesson`: khi lesson mới hoàn thành cộng `xp += 100`; trả về thêm `xpEarned` và `xpTotal` (idempotent: repeat → xpEarned=0)
- [x] 2.3 Thêm `GET /progress/:childId/weekly-report` trong controller + service: tính `lessonsThisWeek`, `streak`, `xpThisWeek`, `hasActivity`
- [x] 2.4 Thêm `runWeeklyReports()` service method (dispatch logic: skip nếu `weeklyReportEnabled===false`, reminder tone nếu `hasActivity===false`, log ra console cho V1) + dev endpoint `POST /progress/run-weekly-reports` để trigger thủ công (thay cho cron — `@nestjs/schedule` chưa cài)
- [x] 2.5 Tạo seed script `src/scripts/seed-lessons.ts`: seed 4 weeks × 5 days = 20 Lesson docs (subject toan) + Activity docs (8 single_select / lesson, đếm đối tượng đáp án 2–6), status `imported`; thêm npm script `seed:lessons`

## 3. Mobile — Components

- [x] 3.1 Tạo `mobile/src/components/OptionCard.tsx`: prop `{ option, state: 'idle'|'selected'|'correct'|'wrong', onPress, size? }`; idle=white #F0ECE4 border; selected=coral border 3pt + text + shadow; correct=green bg #EAF7EA + ✓ badge top-right + pop animation; wrong=Reanimated shake translateX (7 steps × 50ms)
- [x] 3.2 Tạo `mobile/src/components/ActivityEngine.tsx`: render single_select body (image zone + 2×2 grid); state-driven props từ LessonPlayerScreen (selectedId, answerState, onSelect, tablet)
- [x] 3.3 Tạo `mobile/src/components/ConfettiOverlay.tsx`: absolute positioned emoji (🎉 ✨) + colored shapes (sun square, sky circle, coral rect) với fade-in on mount; nhận prop `active: boolean`

## 4. Mobile — LessonPlayerScreen

- [x] 4.1 Tạo `mobile/src/screens/child/LessonPlayerScreen.tsx`; fetch `GET /lessons/today?childId` on mount, map qua `mapServerLesson()`; fallback mock 8 activities nếu stub/fail; state: `activities[]`, `currentIdx`, `selectedId`, `answerState`
- [x] 4.2 Implement header: ← back (40pt lavender pill), title "Tuần {week} · Ngày {dayInWeek}", teal progress bar `currentIdx/total * 100%`, counter "{currentIdx+1}/{total}"
- [x] 4.3 Mobile: mascot row — dodo.png 66pt + teal speech bubble #4ECDC4 rounded 18pt, border-bottom-left-radius 4pt, left tail via absolute View; bubble text = activity.prompt
- [x] 4.4 Image zone: radial gradient #FFEAEF→#FBD3DE, 208pt height, flex-wrap row với `imageCount` tiles (emoji 🍃 fallback nếu asset not found), rounded 18pt với shadow
- [x] 4.5 2×2 OptionCard grid; onPress: set `selectedId`, check `correctOptionId`, set `answerState`; nếu correct: auto-advance sau 1200ms; nếu wrong: shake, update bubble prompt, reset selectedId sau 800ms
- [x] 4.6 Tablet layout (isTablet ≥ 768pt): left 38% — dodo 240pt kido-float + teal speech card (text larger 22pt); right 62% — image zone 230pt + options; không có mobile mascot row
- [x] 4.7 Khi last activity correct: gọi `PATCH /progress/:childId/complete-lesson` với `{ lessonId, stars, activityResults }`; trên success dùng response (`xpEarned`, `streakCount`) cập nhật store qua `completeDay()`, `addXp(xpEarned)`, `setStreak(streakCount)`; nếu fail vẫn cập nhật store local; navigate `LessonComplete { week, stars: 3, xp: xpEarned, newStreak }`

## 5. Mobile — LessonCompleteScreen

- [x] 5.1 Tạo `mobile/src/screens/child/LessonCompleteScreen.tsx`; background gradient #F0EBFF→#FFEAEF; nhận params `{ week, stars, xp, newStreak }`
- [x] 5.2 Implement 3 stars row: kido-bob animation, delays 100ms/0ms/200ms; center star 76pt, sides 52pt
- [x] 5.3 Dodo celebrating (dodo.png 208pt, kido-float); title "Bé làm tốt lắm!" 30pt 900; subtitle "Đã xong bài học hôm nay 🌟" 16pt slate
- [x] 5.4 XP + streak teal card: 🔥 "{newStreak} ngày" left; "+{xp} XP" right; teal shadow
- [x] 5.5 ConfettiOverlay active=true on mount
- [x] 5.6 "Bài tiếp theo →" coral 56pt → `navigation.replace('LessonPlayer', { week: nextWeek, day: nextDay })` (derive từ store sau completeDay); "Về bản đồ" ghost → `navigation.popToTop()` (Home)

## 6. Mobile — PaywallScreen

- [x] 6.1 Tạo `mobile/src/screens/child/PaywallScreen.tsx`
- [x] 6.2 Illustration zone 260pt: radial gradient #FFF1DA→#FFE3C2, dodo.png 210pt kido-float, ✨ kido-twinkle, 💎 ⭐ icons, gold glow circle 200pt
- [x] 6.3 ✕ dismiss (36pt, top-right, #F0ECE4) → `navigation.goBack()`
- [x] 6.4 Feature list: 4 items với coral ✓ badge (#FFEDE4 bg)
- [x] 6.5 Annual plan card: gradient border 2.5pt #A674FF→#FFD23F, "★ PHỔ BIẾN NHẤT" gradient badge, "199k/tháng", "Tiết kiệm 40%" green
- [x] 6.6 Monthly plan row: radio toggle (default unselected), "299k/tháng" gray; tapping selects (radio fills coral)
- [x] 6.7 "Bắt đầu dùng thử 7 ngày" coral 56pt + disclaimer text; on press: `subscriptionStore.startTrial()` → navigate Home
- [x] 6.8 Tablet: left 45% illustration, right 55% content (padding 64px, CTA width 280pt)

## 7. Navigation Wiring

- [x] 7.1 Thêm `LessonPlayerScreen`, `LessonCompleteScreen`, `PaywallScreen` vào `ChildNavigator` (NativeStack)
- [x] 7.2 `HomeScreen` WeekNode `onPress`: TODAY/CURRENT → `LessonPlayer { week, day: currentDay }`; PAYWALL → `Paywall { trigger: 'map' }`
- [x] 7.3 `BottomNavBar` lesson tab → `Paywall { trigger: 'nav' }` nếu `subStatus !== 'active' && subStatus !== 'trial'`
- [x] 7.4 (Không cần — HomeScreen `getNodeState()` đã dùng `(currentWeek, currentDay)` đúng model; chỉ verify navigation params khớp)

## 8. Integration & Polish

- [x] 8.1 Verify TypeScript: `npx tsc --noEmit` — zero errors (cả `mobile/` và `kido-server/`)
- [ ] 8.2 Test full flow: HomeScreen → TODAY node → LessonPlayer (8 câu) → LessonComplete → "Bài tiếp theo" → lesson ngày tiếp theo
- [ ] 8.3 Test incomplete day: thoát giữa chừng → re-enter → restart từ activity 0
- [ ] 8.4 Test Paywall: PAYWALL node → Paywall → startTrial → HomeScreen cluster 1-4 unlocked
- [ ] 8.5 Test wrong answer: shake animation → mascot thay prompt → reset → user thử lại
- [ ] 8.6 Test tablet: split panel, Paywall 2-col
- [ ] 8.7 Verify Sunday cron job log ra console đúng (test bằng cách trigger thủ công qua dev endpoint)
