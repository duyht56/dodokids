## Why

EPIC-004/005/006 đã hoàn thiện vòng học (bản đồ → bài học → kết quả → phụ huynh), nhưng phần **gamification** — thứ giữ trẻ quay lại mỗi ngày — vẫn còn dở dang:

- Sao (stars) đang **hardcode `stars: 3`** ở `LessonPlayerScreen` (dòng 81, 97) và BE `completeLesson` **bỏ qua hoàn toàn** giá trị `stars` nhận được — không lưu, không tính từ kết quả thật.
- `StickerCollectionScreen` và `PracticeBankScreen` mới là **stub 1 dòng text**.
- Màn hình **Thành tích** (Screen-06: streak card + huy hiệu + sticker) — tab thứ 3 trong bottom nav — chưa tồn tại.
- BE có sẵn `streakCount`, `stickersEarned[]`, `xp` nhưng chưa có endpoint phục vụ màn Thành tích, chưa có khái niệm huy hiệu (badge), chưa có Practice Bank.

EPIC-007 (Child Module — Gamification) hiện thực hóa 4 story P0/P1 trong backlog: STORY-007-01 (Star Rating), 007-02 (Sticker System), 007-03 (Daily Streak), 007-04 (Practice Bank) — bám sát Screen-04 và Screen-06 trong design hand-off, kèm BE và layout tablet.

## What Changes

**Star Rating (007-01)**
- **Sửa** `LessonPlayerScreen` — tính sao thật từ `correctFirstTry` (≥5→3 sao, ≥3→2 sao, <3→1 sao) thay vì hardcode 3
- **Sửa** BE `completeLesson` — **lưu sao** vào `progress.lessonStars` theo quy tắc **best-score** (chơi lại không hạ sao); trả `stars` trong response
- **Sửa** `LessonCompleteScreen` — animation từng sao bay vào (spring 400ms, delay 300ms mỗi sao), số sao hiển thị đúng giá trị thật
- **Sửa** `HomeScreen` — truyền sao thật vào `WeekNode` (component đã hỗ trợ `stars` prop)

**Sticker + Streak + Badge — màn Thành tích (007-02, 007-03)**
- **Thay thế** `StickerCollectionScreen` stub bằng **AchievementsScreen** đầy đủ (Screen-06): streak card gradient coral + 7 chấm tuần, lưới huy hiệu, lưới sticker (earned đủ màu / locked silhouette)
- **Mới** `StreakMilestoneModal` — modal chúc mừng mốc 7/14/30 ngày (Đô Đô + confetti), bật khi `newStreak` chạm mốc
- **Mới** BE endpoint `GET /progress/:childId/achievements` — trả `streakCount`, 7 chấm tuần, danh sách badge (suy ra từ progress), danh sách sticker đã nhận

**Practice Bank (007-04)**
- **Thay thế** `PracticeBankScreen` stub bằng màn ôn luyện thật — kéo activity từ các bài đã hoàn thành (spaced repetition), không tính vào giới hạn ngày, không mở khoá nội dung mới
- **Mới** BE endpoint `GET /lessons/practice/:childId` — trả `Activity[]` chọn từ `completedLessons`

**Schema + Tablet**
- **Sửa** `ChildProgress` schema — thêm `lessonStars: Map<string, number>` (lessonId → 1|2|3)
- Tất cả màn mới có layout tablet (768pt): badges 3→4 cột, sticker 4→6 cột, streak card horizontal, Practice grid rộng hơn

## Capabilities

### New Capabilities

- `star-rating`: Tính sao từ `correctFirstTry`, lưu best-score ở BE, animation earn từng sao ở Lesson Complete, hiển thị trên week node bản đồ
- `achievements-screen`: Màn Thành tích (Screen-06) — streak card + 7 chấm tuần + lưới huy hiệu (earned/locked) + lưới sticker; tab "🏆 Thành tích" trong bottom nav
- `achievements-api`: BE `GET /progress/:childId/achievements` — streak, week-dots, badges (derived), stickers
- `streak-milestone`: `StreakMilestoneModal` chúc mừng mốc 7/14/30 ngày liên tiếp
- `practice-bank`: Màn ôn luyện + BE `GET /lessons/practice/:childId` (spaced repetition từ bài đã hoàn thành)

### Modified Capabilities

- `mongoose-schemas`: Thêm `lessonStars: Map<string,number>` vào `ChildProgress`
- `progress-api`: `completeLesson` lưu sao best-score và trả `stars`; thêm achievements endpoint
- `lessons-api`: Thêm `GET /lessons/practice/:childId`
- `lesson-complete`: Star-earn animation gắn với số sao thật (thay 3 sao tĩnh)
- `lesson-player`: Tính + gửi sao thật thay cho hardcode `stars: 3`
- `state-management`: Thêm `lessonStars` vào `authStore.progress` + action `setLessonStars()`

## Impact

- **Mobile screens**: `StickerCollectionScreen.tsx` → rewrite thành AchievementsScreen, `PracticeBankScreen.tsx` (rewrite), `LessonCompleteScreen.tsx` (star anim), `LessonPlayerScreen.tsx` (real stars), `HomeScreen.tsx` (feed stars)
- **Mobile components**: `StreakMilestoneModal.tsx` (mới), `AchievementBadge.tsx` (mới), `StickerGrid.tsx` (mới)
- **Store**: `mobile/src/store/authStore.ts` + `src/types/store.ts` — thêm `lessonStars`
- **Services**: `mobile/src/services/` — thêm `fetchAchievements()`, `fetchPractice()`
- **BE**: `kido-server/src/modules/progress/` (achievements + lưu sao), `kido-server/src/modules/lessons/` (practice endpoint), `child.schema.ts` (lessonStars)
- **Navigation**: route `StickerCollection` đã có trong `ChildStackParamList` — đổi tên hiển thị "Thành tích" (route key giữ nguyên để không vỡ nav); `PracticeBank` route đã tồn tại
- **No JWT**: tiếp tục dùng `:childId` path param như convention `ProgressController` hiện tại
