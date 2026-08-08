## Why

Kido là app học tập cho trẻ 4-6 tuổi (React Native + Next.js + MongoDB + GCP). Trước khi build bất kỳ feature nào, cần thiết lập nền tảng kỹ thuật đồng nhất — project structure, navigation, state management, API client, design system, và animation library — để toàn bộ team có thể phát triển song song mà không xung đột.

## What Changes

- Khởi tạo React Native project với TypeScript (Expo hoặc RN Community template)
- Cấu hình folder structure chuẩn (`/src/screens`, `/components`, `/navigation`, `/hooks`, `/store`, `/services`, `/types`, `/assets`, `/constants`)
- Cài đặt và cấu hình React Navigation 6 với typed stacks (AuthStack, ChildStack, ParentStack)
- Cài đặt Zustand + AsyncStorage persist cho 4 stores: `authStore`, `lessonStore`, `subscriptionStore`, `settingsStore`
- Cấu hình Axios + TanStack React Query với interceptors (auth token, 401 logout)
- Định nghĩa design tokens: màu sắc (brandOrange, brandTeal...), typography (Nunito), spacing, border radius, shadow, touch target
- Cài đặt Reanimated 3, Gesture Handler, Lottie với timing constants

## Capabilities

### New Capabilities

- `rn-project-init`: React Native TypeScript project với folder structure và build config cho iOS 15+ / Android API 26+
- `navigation-setup`: Typed navigation stacks (RootStack → AuthStack/ChildStack/ParentStack) + deep linking
- `state-management`: Zustand stores (auth, lesson, subscription, settings) với AsyncStorage persistence
- `api-client`: Axios instance + React Query config với auth interceptors và env-based URLs
- `design-system`: Design tokens từ Kido Design Handoff v1.0 — 11 colors (coral/sky/sun/navy...), typography (Nunito+Inter+JetBrains), spacing, radius, shadows RN format, MIN_HIT_AREA=88
- `animation-setup`: Reanimated 3 + Gesture Handler + Lottie với animation timing constants

### Modified Capabilities

## Impact

- **Mobile app** (`/mobile`): Toàn bộ folder này được khởi tạo mới từ đầu
- **Dependencies mới**: expo/react-native, react-navigation, zustand, @react-native-async-storage, axios, @tanstack/react-query, react-native-reanimated, react-native-gesture-handler, lottie-react-native, expo-font
- **iOS**: CocoaPods install, project phải build được
- **Android**: Gradle build thành công
- **Không ảnh hưởng** đến kido-pipeline (backend đã có)
