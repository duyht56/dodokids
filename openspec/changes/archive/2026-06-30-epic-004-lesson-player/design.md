## Context

EPIC 004 thêm core learning loop vào Kido: user chọn tuần trên bản đồ → chơi bài học (LessonPlayer) → thấy kết quả (LessonComplete) hoặc bị chặn bởi Paywall. BE (NestJS + MongoDB) cung cấp lesson data và lưu kết quả. Mobile dùng Reanimated 3 cho animations.

Stack hiện tại: React Native (Expo), Reanimated 3, Zustand, expo-linear-gradient, react-native-svg. BE: NestJS, MongoDB (Mongoose), đã có `lessons` và `progress` module scaffold.

## Goals / Non-Goals

**Goals:**
- Implement `single_select` activity type đầy đủ (mobile + tablet)
- LessonComplete screen với 3-star celebration, streak/XP card
- Paywall screen với 2 gói, trial CTA
- BE endpoints: GET /lessons/:week, POST /progress/complete-lesson
- Zustand: thêm xp, streak, startTrial()

**Non-Goals:**
- Các activity type khác (drag-drop, fill-in-blank) — EPIC sau
- IAP integration thực tế (App Store / Play Store) — chỉ mock startTrial()
- Audio/sound effects
- Offline caching của lesson data

## Decisions

### 1. ActivityEngine pattern (extensible activity renderer)
**Decision**: Tạo `ActivityEngine` component nhận `activity: Activity` và render đúng UI theo `activity.type`. Bắt đầu với `single_select`.
**Rationale**: Tách biệt rendering logic khỏi LessonPlayerScreen. Thêm type mới chỉ cần thêm case trong ActivityEngine, không sửa screen.
**Alternative**: Inline tất cả trong LessonPlayerScreen — bị loại vì coupling cao.

### 2. Lesson data: fetch từ BE vs hardcode
**Decision**: Fetch từ BE (`GET /lessons/:week`) với fallback mock data nếu request fail.
**Rationale**: BE đã có scaffold, lesson data cần thay đổi mà không cần release app. Fallback mock giúp dev offline.
**Alternative**: Hardcode JSON trong app — bị loại vì không flexible.

### 3. Correct-answer state: local component state
**Decision**: `selectedOptionId` và `answerState: 'idle' | 'correct' | 'wrong'` là local state trong LessonPlayerScreen, không đưa vào Zustand.
**Rationale**: Chỉ cần trong phạm vi 1 session chơi bài. Zustand chỉ lưu kết quả cuối (xp, streak, completedLessons).

### 4. Tablet layout: conditional render trong cùng 1 screen file
**Decision**: Dùng `useIsTablet()` hook để switch giữa mobile và tablet layout trong cùng file, không tách 2 component riêng.
**Rationale**: Nhất quán với pattern đã dùng ở HomeScreen và OnboardingScreen. State (selectedOption, currentQuestion) được share.

### 5. BE: seed data cho lessons
**Decision**: Tạo seed script tạo 4 lesson documents (tuần 1-4) với 8 activities mỗi tuần, type `single_select`, đủ để demo.
**Rationale**: Cần data thực để test, không chỉ mock. Seed script có thể chạy lại.

### 6. XP calculation: flat 100 XP per lesson
**Decision**: Mỗi bài học hoàn thành = 100 XP flat, không phụ thuộc score.
**Rationale**: Đơn giản cho V1. Có thể thêm multiplier (score/total * 100) sau.

## Risks / Trade-offs

- **[Risk] Network latency khi fetch lesson data** → Mitigation: show skeleton loading (kido-shimmer animation) trong khi fetch; fallback to mock data nếu timeout > 5s
- **[Risk] Lesson image assets chưa có (clay-leaf.png)** → Mitigation: dùng emoji fallback (🍃) trong OptionCard nếu image không load
- **[Risk] Auto-advance 1200ms bị cancel nếu user navigate ra** → Mitigation: cleanup timeout trong useEffect return

## Migration Plan

1. Thêm `xp`, `streak` vào `authStore` (backward compatible — default 0)
2. Thêm `startTrial()`, `trialStartDate` vào `subscriptionStore`
3. Thêm navigation params cho `LessonPlayer`, `LessonComplete`, `Paywall` vào `ChildStackParamList`
4. Implement BE endpoints và seed data
5. Implement mobile screens và components
6. Wire navigation từ HomeScreen WeekNode (TODAY/CURRENT) → LessonPlayer

## Open Questions

- Lesson images: dùng local assets hay URL từ BE? → V1 dùng local assets (require), BE trả về `imageAsset` key để map
- Paywall: khi user bấm trial, redirect sang App Store hay mock? → V1 mock (gọi startTrial(), không IAP thật)
