# EPIC-007 Gamification — Design

## 1. Star Rating — nguồn sự thật & best-score

**Vấn đề hiện tại:** `LessonPlayerScreen` gửi `stars: 3` cứng; `completeLesson` nhận `dto.stars` nhưng không lưu. `WeekNode` đã render `stars` prop nhưng `HomeScreen` chưa feed dữ liệu thật.

**Cách tính (theo backlog 007-01 + Screen-04):**
```
correctFirstTry = số activity có attemptCount === 1 && outcome === 'correct'
stars = correctFirstTry >= 5 ? 3 : correctFirstTry >= 3 ? 2 : 1   // luôn ≥ 1
```
`activityResults[]` đã có sẵn trong `CompleteLessonDto` (mỗi item có `attemptCount`, `outcome`) → tính client-side trong LessonPlayer, gửi lên; BE có thể **tự verify lại** từ `activityResults` để chống client gửi sai (defense-in-depth) — nếu lệch, lấy giá trị BE tính.

**Lưu trữ — best-score:**
```
progress.lessonStars: Map<lessonId, 1|2|3>
completeLesson: stars_new = max(stars_incoming, lessonStars[lessonId] ?? 0)
```
Replay không bao giờ hạ sao. Vì `completeLesson` hiện idempotent (bỏ qua nếu đã hoàn thành), cần **tách logic sao ra khỏi nhánh idempotent**: ngay cả khi lesson đã completed, vẫn cập nhật `lessonStars` nếu sao mới cao hơn (cho phép replay nâng sao mà không cộng XP/streak lần nữa).

```
┌──────────────┐  activityResults  ┌───────────────┐  PATCH        ┌──────────────┐
│ LessonPlayer │ ────────────────► │ completeLesson│ ────────────► │ lessonStars  │
│ tính stars   │   stars (real)    │ max(old,new)  │  best-score   │ Map persist  │
└──────────────┘                   └───────┬───────┘               └──────────────┘
                                           │ stars (response)
                                           ▼
                                   ┌───────────────┐
                                   │ LessonComplete│  earn anim 400ms spring × stars
                                   │ HomeScreen    │  WeekNode stars feed
                                   └───────────────┘
```

**Star-earn animation (LessonComplete):** thay 3 `BobStar` tĩnh bằng N sao (N = stars thật). Mỗi sao: `scale 0→1` spring (damping ~8), delay `300ms × index`. Sao chưa đạt: hiển thị mờ (silhouette ⭐ opacity .25) để trẻ thấy "mục tiêu". Giữ `BobStar` bob loop sau khi đã xuất hiện.

## 2. Badges — derived, không lưu thêm field

Screen-06 có 6 badge. Suy ra hoàn toàn từ `progress` hiện có → **không thêm field DB**, tránh state lệch:

| id | emoji | label | Điều kiện earned |
|---|---|---|---|
| `first_week` | 🥇 | Tuần đầu | `stickersEarned.length >= 1` (đã xong D5 tuần 1) |
| `super_star` | 🌟 | Siêu sao | có ≥ 3 lesson đạt 3 sao (`count(lessonStars==3) >= 3`) |
| `diligent` | 🔥 | Chăm chỉ | `streakCount >= 7` |
| `graduate` | 🎓 | Tốt nghiệp | `stickersEarned.length >= 4` (xong 4 tuần) |
| `champion` | 🏆 | Quán quân | `stickersEarned.length >= 12` (xong 1 quần đảo) |
| `diamond` | 💎 | Kim cương | `streakCount >= 30` |

Endpoint trả mảng theo thứ tự cố định với cờ `earned` → client render đủ màu (earned) hoặc grayscale+🔒 (locked). Thêm badge mới sau này = thêm 1 entry, không migration.

## 3. Achievements API shape

`GET /progress/:childId/achievements`:
```json
{
  "streakCount": 7,
  "weekDots": [
    { "day": "T2", "state": "done" },
    { "day": "T3", "state": "done" },
    { "day": "T4", "state": "done" },
    { "day": "T5", "state": "done" },
    { "day": "T6", "state": "today" },
    { "day": "T7", "state": "future" },
    { "day": "CN", "state": "future" }
  ],
  "badges": [
    { "id": "first_week", "emoji": "🥇", "label": "Tuần đầu", "earned": true },
    { "id": "super_star", "emoji": "🌟", "label": "Siêu sao", "earned": true },
    { "id": "diligent",   "emoji": "🔥", "label": "Chăm chỉ", "earned": true },
    { "id": "graduate",   "emoji": "🎓", "label": "Tốt nghiệp", "earned": false },
    { "id": "champion",   "emoji": "🏆", "label": "Quán quân", "earned": false },
    { "id": "diamond",    "emoji": "💎", "label": "Kim cương", "earned": false }
  ],
  "stickers": [
    { "week": 1, "emoji": "🐵", "bg": "#F0EBFF", "earned": true },
    { "week": 2, "emoji": "🍃", "bg": "#E7F7F5", "earned": true }
  ]
}
```

**weekDots `state`:** dựa trên `lastLessonDate` + thứ trong tuần hiện tại (Mon–Sun). Ngày đã có activity = `done`; hôm nay = `today`; tương lai = `future`. Tính server-side dùng helper `startOfWeek` đã có trong `progress.service.ts`.

**stickers:** map `stickersEarned: number[]` (số tuần) → metadata sticker. Bảng `WEEK_STICKERS` tĩnh (emoji + bg pastel) trong progress module, tối thiểu 12 tuần đầu; tuần chưa có metadata fallback `⭐ / #FFF3D6`. Trả cả earned lẫn vài ô locked kế tiếp (silhouette) để lưới đẹp như design.

## 4. Streak Milestone Modal

`LessonCompleteScreen` đã nhận `newStreak` qua route params. Khi `newStreak ∈ {7,14,30}` → sau confetti, present `StreakMilestoneModal` (bottom sheet `sheet-up` anim như ParentGate): Đô Đô celebrate + "🔥 {n} ngày liên tiếp!" + CTA "Tuyệt vời!". Chỉ hiện **một lần** tại thời điểm đạt mốc (không lưu DB — vì chỉ trigger đúng lần `completeLesson` nâng streak lên mốc, `newStreak` là giá trị tức thời).

## 5. Practice Bank — spaced repetition tối giản

`GET /lessons/practice/:childId`:
1. Lấy `completedLessons[]` từ child.
2. Lấy activities của các lesson đó (đã import trong DB).
3. Trộn ngẫu nhiên, trả tối đa ~12 activity. (V1: random shuffle; "độ khó tự điều chỉnh" theo lịch sử để lại cho EPIC sau — ghi chú trong spec.)
4. Nếu `completedLessons` rỗng → trả `[]`; màn hiển thị empty state "Hoàn thành bài học để mở khoá ôn luyện".

`PracticeBankScreen` tái dùng `ActivityContainer` (đã có) để render từng activity; không gọi `completeLesson` (không cộng XP/streak/sao), chỉ feedback đúng/sai cục bộ; nút "Về nhà" luôn hiện.

## 6. Tablet breakpoints (useIsTablet đã có)

| Thành phần | Mobile 375pt | Tablet 768pt |
|---|---|---|
| Badge grid | 3 cột | 4 cột |
| Sticker grid | 4 cột | 6 cột |
| Streak card | dọc (số trên, dots dưới) | ngang (số trái, dots phải) |
| Practice grid | 2 cột option | rộng hơn, target lớn |
| Lesson Complete stars | 76/52pt | 96/64pt (đã có) |

## 7. Rủi ro & quyết định

- **Idempotency vs replay-nâng-sao:** phải sửa cẩn thận nhánh "already completed" trong `completeLesson` để vẫn cập nhật `lessonStars` mà KHÔNG cộng lại XP/streak. Có test scenario riêng.
- **Map<string,number> trong Mongoose:** dùng `@Prop({ type: Map, of: Number, default: {} })`; nhớ `child.markModified('progress')` (đã là pattern hiện có) khi mutate.
- **Route key `StickerCollection`:** giữ nguyên key để không vỡ navigation type; chỉ đổi tiêu đề hiển thị + nội dung. (Cân nhắc rename thành `Achievements` trong một change nhỏ riêng để tránh nhầm lẫn về sau — không làm trong epic này.)
- **Cache Redis:** achievements suy từ progress; có thể tái dùng/đính kèm cache `progress:${childId}` hoặc bỏ cache cho achievements (tải nhẹ). V1: không cache achievements để tránh stale sau completeLesson.
