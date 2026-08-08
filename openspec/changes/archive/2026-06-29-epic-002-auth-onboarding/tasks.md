## 1. Assets & Setup (STORY-002-00)

- [x] 1.1 Download mascot và clay illustration assets từ DesignSync project vào `mobile/src/assets/images/`: `dodo.png`, `clay-backpack.png`, `clay-cap.png`, `clay-leaf.png`
- [x] 1.2 Thêm `avatarId?: string` vào `Child` interface trong `src/types/store.ts` và `authStore`
- [x] 1.3 Tạo `src/services/childrenApi.ts` với hàm `createChild(name, age, avatarId)` — mock trả về `{ childId: 'local-xxx' }` nếu API chưa có

## 2. Splash Screen (STORY-002-01)

- [x] 2.1 Tạo `src/screens/auth/SplashScreen.tsx` — background navy `#1A1A2E`, logo "Kido" (64px Nunito 900 white), tagline "Học vui mỗi ngày" (22px rgba white 65%), mascot Đô Đô centered
- [x] 2.2 Thêm 3 animated dots loader bên dưới mascot: `Animated.sequence` với stagger 200ms, scale 0.6→1, opacity 0.4→1, loop
- [x] 2.3 `useEffect`: setTimeout 2000ms → navigate theo `isOnboarded` (Onboarding hoặc Home)
- [x] 2.4 Thêm ambient coral glow: 2 `View` với `borderRadius: 9999`, coral rgba, `position: absolute`, blur effect (hoặc soft gradient)
- [x] 2.5 Update `AuthStack.tsx`: replace placeholder Splash với `SplashScreen`

## 3. Onboarding Slides (STORY-002-02)

- [x] 3.1 Tạo `src/screens/auth/OnboardingScreen.tsx` — FlatList horizontal, `pagingEnabled`, `showsHorizontalScrollIndicator: false`
- [x] 3.2 Định nghĩa `SLIDES` array (3 items): `{ id, illustration, title, body }` cho từng slide
- [x] 3.3 Render mỗi slide: illustration image top (55% height), title h1 28px navy, body 17px slate, cả 2 trong content container padding 24px
- [x] 3.4 Dot indicator: sync với `scrollX` offset — active dot coral width 20px, inactive `#DED1FA` width 8px, animate width với `Animated.Value`
- [x] 3.5 Nút "Tiếp theo" / "Bắt đầu" (slide 3): coral background, border-radius 54px, 18px Nunito 800 white — `onPress` gọi `flatListRef.current?.scrollToIndex` hoặc navigate
- [x] 3.6 Nút "Bỏ qua": slate text top-right, absolute position — navigate thẳng Setup
- [x] 3.7 Update `AuthStack.tsx`: replace placeholder Onboarding với `OnboardingScreen`

## 4. Profile Setup — Step 1: Tên bé (STORY-002-03a)

- [x] 4.1 Tạo `src/screens/auth/SetupScreen.tsx` với local state `step: 1 | 2 | 3`, `name: string`, `age: 4|5|6|null`, `avatarId: string|null`
- [x] 4.2 Render step indicator (3 dots/labels): active = coral, done = sky `#4ECDC4`, pending = `#D1D5DB`
- [x] 4.3 Step 1 UI: header "Bé tên là gì?" (28px Nunito 900 navy), `TextInput` border-radius 18px, active border sky, placeholder "Minh Khôi"
- [x] 4.4 Validation inline: hiện "✓ Tên hợp lệ" (sky, 13px) khi `name.length >= 2`
- [x] 4.5 Mascot hint bubble: `#F0EBFF` bg, border-radius 16px, text "Đô Đô muốn biết tên bạn mới!"
- [x] 4.6 `KeyboardAvoidingView`: `behavior={Platform.OS === 'ios' ? 'padding' : 'height'}` bao toàn screen, CTA "Tiếp theo" luôn visible trên keyboard
- [x] 4.7 Update `AuthStack.tsx`: replace placeholder Setup với `SetupScreen`

## 5. Profile Setup — Step 2: Tuổi (STORY-002-03b)

- [x] 5.1 Step 2 UI: header "Bé bao nhiêu tuổi?", 3 age cards horizontal — "4 tuổi" "5 tuổi" "6 tuổi"
- [x] 5.2 Card selected state: coral border 2px + `rgba(255,107,53,0.12)` background, border-radius 18px
- [x] 5.3 CTA "Tiếp theo" disabled (opacity 0.5) khi chưa chọn age, enabled sau khi chọn
- [x] 5.4 Lưu `age` vào local state khi chọn, advance `step → 3` khi tap CTA

## 6. Profile Setup — Step 3: Avatar (STORY-002-03c)

- [x] 6.1 Step 3 UI: header "Chọn avatar cho bé!", 3×3 grid 9 emoji avatars (🐵 🐱 🐶 🦊 🐼 🐸 🦁 🐯 🐰)
- [x] 6.2 Avatar cell: min 88×88px, selected = coral border 3px + scale 1.1 (Animated spring)
- [x] 6.3 CTA "Bắt đầu với Đô Đô!": coral, disabled khi chưa chọn avatar
- [x] 6.4 Trên tap CTA: gọi `createChild(name, age, avatarId)`, update `authStore.setChild({ name, age, avatarId })`, gọi `authStore.setOnboarded(true)`, navigate reset về Child/Home
- [x] 6.5 Error handling: nếu API lỗi, vẫn set `isOnboarded: true` và navigate (offline-first)

## 7. Polish & Verify

- [ ] 7.1 Verify flow đầy đủ: Launch → Splash 2s → Onboarding 3 slides → Setup 3 steps → Home
- [ ] 7.2 Verify returning user: Launch → Splash 2s → Home (skip onboarding)
- [ ] 7.3 Test keyboard không che CTA trên iOS và Android
- [ ] 7.4 Verify authStore: sau setup, `child.name`, `child.age`, `child.avatarId`, `isOnboarded` đều đúng sau app restart
