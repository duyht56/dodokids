## Context

Kido mobile app chưa tồn tại — thư mục `/mobile` hiện rỗng. Cần khởi tạo toàn bộ React Native project từ đầu với stack: React Native (Expo) + TypeScript + React Navigation 6 + Zustand + Axios/React Query + Reanimated 3. Backend (`kido-pipeline`) đã chạy độc lập trên Next.js/MongoDB.

Target: iOS 15+, Android API 26+ (Android 8.0+).

## Goals / Non-Goals

**Goals:**
- Khởi tạo Expo project với TypeScript template
- Cấu hình navigation đầy đủ với typed params
- Setup 4 Zustand stores với AsyncStorage persistence
- Cấu hình Axios + React Query với interceptors
- Định nghĩa tất cả design tokens vào một `theme.ts` duy nhất
- Cài đặt animation stack (Reanimated 3 + Gesture Handler + Lottie)

**Non-Goals:**
- Không implement screens hay logic nghiệp vụ (EPIC-002+)
- Không cấu hình CI/CD hay App Store (EPIC-015)
- Không setup push notifications

## Decisions

### 1. Expo over bare React Native
**Lý do**: Expo SDK 51+ hỗ trợ React Native 0.74+, Expo Go cho testing nhanh, `expo-font` cho Nunito. Nếu cần native modules phức tạp (IAP, Audio), dùng Expo Dev Build thay vì eject.
**Alternative xem xét**: Bare RN Community template — bị loại vì phải cài CocoaPods/Gradle thủ công, chậm hơn cho early development.

### 2. Zustand over Redux Toolkit
**Lý do**: API tối giản hơn, không cần boilerplate action/reducer, built-in persist middleware. Kido chỉ cần 4 stores đơn giản — Redux sẽ over-engineer.
**Alternative**: Jotai/Recoil — ít tài liệu React Native hơn.

### 3. TanStack React Query + Axios over SWR/fetch
**Lý do**: React Query cung cấp caching, background refetch, optimistic updates out-of-the-box. Axios dễ setup interceptors cho auth token + 401 handler hơn native fetch.

### 4. Single `theme.ts` file cho design tokens
**Lý do**: Tất cả màu, typography, spacing, shadows export từ một nơi → dễ thay đổi toàn app. Không dùng styled-components (perf overhead trên mobile).

### 5. Reanimated 3 (Worklet-based) over Animated API
**Lý do**: Chạy trên UI thread, không bị JS thread block → animations 60fps ngay cả khi JS bận. Bắt buộc cho trải nghiệm trẻ em.

## Risks / Trade-offs

- **[Risk] Expo SDK version lock** → Một số native modules (react-native-iap, react-native-sound) có thể cần Expo plugin hoặc dev build. Mitigation: dùng Expo Dev Build ngay từ đầu thay vì Expo Go.
- **[Risk] Reanimated 3 + Gesture Handler cần Babel plugin** → Phải thêm `react-native-reanimated/plugin` vào babel.config.js TRƯỚC khi chạy bất kỳ animation nào. Mitigation: setup và test ngay ở STORY-001-06.
- **[Trade-off] Expo vs performance**: Expo bundle lớn hơn bare RN ~2MB. Chấp nhận được cho giai đoạn development; có thể optimize khi gần release.
