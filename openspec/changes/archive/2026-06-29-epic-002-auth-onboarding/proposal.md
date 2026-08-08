## Why

Sau khi EPIC-001 hoàn thành nền tảng kỹ thuật, EPIC-002 xây dựng toàn bộ luồng đầu tiên mà người dùng thấy khi mở app: Splash Screen → Onboarding (3 slides) → Profile Setup (3 bước: tên, tuổi, avatar). Đây là điểm chuyển đổi quan trọng nhất — nếu onboarding không mượt và thú vị, user sẽ drop ngay lập tức.

## What Changes

- Tạo **SplashScreen**: background navy `#1A1A2E`, logo "Kido" + tagline "Học vui mỗi ngày", mascot Đô Đô, dots loader — tự navigate sau 2s
- Tạo **OnboardingSlides**: 3 slides full-bleed với clay illustration, text, dot indicators, nút "Tiếp theo" / "Bỏ qua"
- Tạo **ProfileSetup**: wizard 3 bước (Tên bé → Tuổi & Lớp → Avatar) với step indicator, mascot Đô Đô hint bubble
- Kết nối `authStore`: lưu `child.name`, `child.age`, `child.avatarId`, set `isOnboarded: true`
- Gọi `POST /api/children` sau khi hoàn thành setup

## Capabilities

### New Capabilities

- `splash-screen`: Animated splash với mascot Đô Đô, logo, dots loader — auto-navigate theo `isOnboarded`
- `onboarding-slides`: 3 slides swipeable với clay illustrations, dot indicators, skip/next CTA
- `profile-setup-name`: Step 1 — text input tên bé, validation, mascot hint bubble, KeyboardAvoidingView
- `profile-setup-age`: Step 2 — 3 age cards tapping (4/5/6 tuổi), class section
- `profile-setup-avatar`: Step 3 — 3×3 avatar grid, selected state, CTA celebration

### Modified Capabilities

- `navigation-setup`: AuthStack screens (Splash, Onboarding, Setup) không còn là placeholder — được implement thật

## Impact

- **Files thay đổi**: `src/screens/auth/` (tạo mới), `src/navigation/AuthStack.tsx` (thay placeholder), `src/store/authStore.ts` (thêm avatarId)
- **New dependencies**: `react-native-pager-view` (swipe slides) hoặc dùng FlatList
- **API**: `POST /api/children` — cần backend EPIC-011 (mock được nếu chưa có)
- **Assets**: mascot Đô Đô PNG từ `assets/dodo.png` trong design project, clay illustrations
