## Context

Design source: Kido App Screens — Band A (Onboarding), Band H (Splash), Band I (Profile Setup).
Stack: Expo 56 / React Native 0.85 / TypeScript. Fonts: Nunito + Inter (đã load từ EPIC-001).

## Goals / Non-Goals

**Goals:**
- Implement đúng pixel spec từ design (màu sắc, typography, spacing từ `tokens.ts`)
- Splash tự navigate sau 2000ms
- Onboarding swipeable, hỗ trợ gesture + dot indicator sync
- Profile setup 3 bước với step indicator, mascot hint, KeyboardAvoidingView

**Non-Goals:**
- Không implement tablet layout (tablet = phase 2)
- Không cần real API — mock POST /api/children trả về fake childId

## Decisions

### 1. Splash navigation timing
Auto-navigate sau 2000ms dùng `setTimeout` trong `useEffect`. Check `isOnboarded` → navigate `Child` hoặc `Onboarding`.
**Không dùng** native splash screen lib — JS splash đủ cho phase 1.

### 2. Onboarding slides: FlatList thay vì PagerView
Dùng `FlatList` horizontal + `pagingEnabled` thay vì `react-native-pager-view` để tránh thêm native dependency. Dot indicator sync qua `onScroll` + `scrollEventThrottle`.

### 3. Profile Setup: single screen với step state
3 bước trong 1 Screen, dùng local state `step: 1|2|3` thay vì 3 Screen riêng — giúp step indicator và mascot animation mượt hơn khi transition.

### 4. Avatar: dùng emoji thay vì image assets
Phase 1 dùng 9 emoji avatars (🐵 🐱 🐶 🦊 🐼 🐸 🦁 🐯 🐰) — không cần tải assets. Thay bằng PNG khi có assets.

### 5. Clay illustrations trong Onboarding
Phase 1: dùng PNG từ `assets/` folder trong design project (`assets/dodo.png`, `assets/clay-backpack.png`). Download từ DesignSync về `mobile/src/assets/images/`.

## Screen Specs (từ Design Handoff)

### Splash Screen (Band H)
- Background: `navy` `#1A1A2E`
- Logo text "Kido": font-size 64px, Nunito 900, white
- Tagline "Học vui mỗi ngày": font-size 22px, Nunito 600, `rgba(255,255,255,0.65)`
- Mascot: chiếm ~65% chiều cao, centered
- Dots loader: 3 dots, animate với `kido-dot` keyframe (scale 0.6→1, opacity 0.4→1)
- Ambient glows: coral radial gradients phía sau mascot

### Onboarding Slides (Band A)
- Background: `cream` `#FFFBF5`
- Slide 1: "Chào bé! Mình là Đô Đô 🐵" — h1 28px Nunito 900 navy
- Slide 1 body: "Cùng mình bắt đầu hành trình học tập thật vui và nhiều phần thưởng nhé!" — 17px Nunito 600 slate
- Slide 2: "Học Toán, Tiếng Việt & Tiếng Anh" — 3 subject icons
- Slide 3: Rewards / achievements preview
- Dot indicators: coral `#FF6B35` filled, `#DED1FA` empty — border-radius 9999px
- CTA "Tiếp theo": background coral, border-radius 54px, font-size 18px Nunito 800 white
- "Bỏ qua": slate text, font-size 15px — top right

### Profile Setup (Band I)
- Step indicator: 3 steps — "Tên bé", "Tuổi & Lớp", "Avatar" — active = coral, done = sky, pending = `#D1D5DB`
- Step 1 header: "Bé tên là gì?" — 28px Nunito 900 navy
- Input: border-radius 18px, border `sky` khi active, hint "Minh Khôi" placeholder
- Validation text: "✓ Tên hợp lệ" — sky `#4ECDC4` — font-size 13px
- Mascot bubble: "Đô Đô muốn biết tên bạn mới!" — `lavender` bg `#F0EBFF`, border-radius 16px
- Step 2 age cards: 3 cards "4 tuổi" "5 tuổi" "6 tuổi" — selected: coral border + `rgba(255,107,53,0.12)` bg
- Step 3: 3×3 avatar grid, selected border coral + scale 1.1
- CTA: "Bắt đầu với Đô Đô!" — coral, disabled when incomplete

## Risks / Trade-offs

- **[Risk] FlatList paging không smooth như PagerView** → Mitigation: set `decelerationRate="fast"` + `snapToInterval`
- **[Trade-off] Phase 1 dùng emoji avatar**: UX đơn giản hơn, nhưng cần swap ra PNG khi có assets từ design team
- **[Risk] KeyboardAvoidingView behavior khác nhau iOS vs Android** → Mitigation: `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` + test cả 2
