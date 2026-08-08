## 1. RN Project Init (STORY-001-01)

- [x] 1.1 Khởi tạo Expo project với TypeScript template trong thư mục `/mobile`: `npx create-expo-app mobile --template expo-template-blank-typescript`
- [x] 1.2 Tạo folder structure: `src/screens`, `src/components`, `src/navigation`, `src/hooks`, `src/store`, `src/services`, `src/types`, `src/assets`, `src/constants`
- [x] 1.3 Cấu hình absolute imports: thêm `baseUrl` và `paths` vào `tsconfig.json`, cấu hình `babel-plugin-module-resolver` trong `babel.config.js`
- [x] 1.4 Cài và cấu hình ESLint (`eslint-config-expo`) + Prettier, thêm scripts `lint` và `format` vào `package.json`
- [ ] 1.5 Verify iOS build: `npx expo run:ios` — app hiển thị trên simulator không lỗi
- [ ] 1.6 Verify Android build: `npx expo run:android` — app hiển thị trên emulator không lỗi

## 2. Navigation Setup (STORY-001-02)

- [x] 2.1 Cài dependencies: `@react-navigation/native`, `@react-navigation/stack`, `@react-navigation/bottom-tabs`, `react-native-screens`, `react-native-safe-area-context`
- [x] 2.2 Tạo `src/navigation/types.ts` với `RootStackParamList`, `AuthStackParamList`, `ChildStackParamList`, `ParentStackParamList`, `ParentTabParamList`
- [x] 2.3 Tạo `src/navigation/AuthStack.tsx` (Splash, Onboarding, Setup screens — placeholder)
- [x] 2.4 Tạo `src/navigation/ChildStack.tsx` (Home, LessonPlayer, PracticeBank, StickerCollection — placeholder)
- [x] 2.5 Tạo `src/navigation/ParentStack.tsx` với Bottom Tab (Dashboard, Report, Tasks, Settings — placeholder)
- [x] 2.6 Tạo `src/navigation/RootNavigator.tsx` — điều hướng theo `authStore.isOnboarded`
- [x] 2.7 Bọc app bằng `NavigationContainer` trong `App.tsx`
- [x] 2.8 Cấu hình deep linking: `kido://paywall` → PaywallScreen

## 3. State Management (STORY-001-03)

- [x] 3.1 Cài dependencies: `zustand`, `@react-native-async-storage/async-storage`
- [x] 3.2 Tạo `src/store/authStore.ts`: state `{ child, isOnboarded, parentUnlocked }` + actions, persist `child` và `isOnboarded` vào AsyncStorage (KHÔNG persist `parentUnlocked`)
- [x] 3.3 Tạo `src/store/lessonStore.ts`: state `{ currentLesson, currentActivity, progress }` — KHÔNG persist (session only)
- [x] 3.4 Tạo `src/store/subscriptionStore.ts`: state `{ plan, status, trialWeeks, paidWeeks }` + persist
- [x] 3.5 Tạo `src/store/settingsStore.ts`: state `{ audioEnabled, volume }` + persist
- [x] 3.6 Tạo `src/types/store.ts` với TypeScript interfaces cho tất cả stores
- [ ] 3.7 Verify: set child name → restart app → child name vẫn còn; parentUnlocked luôn `false` sau restart

## 4. API Client Setup (STORY-001-04)

- [x] 4.1 Cài dependencies: `axios`, `@tanstack/react-query`, `expo-constants` cho env vars
- [x] 4.2 Tạo `src/services/api.ts`: Axios singleton với `baseURL` từ env config
- [x] 4.3 Thêm request interceptor: attach `Authorization: Bearer <token>` từ `authStore`
- [x] 4.4 Thêm response interceptor: bắt 401 → clear `authStore` → navigate AuthStack
- [x] 4.5 Tạo `src/types/api.ts` với `ApiError` interface
- [x] 4.6 Cấu hình `QueryClient` với `staleTime: 5 * 60 * 1000`, `retry: 2`
- [x] 4.7 Bọc app bằng `QueryClientProvider` trong `App.tsx`
- [x] 4.8 Tạo `.env.example` với `API_URL_DEV`, `API_URL_STAGING`, `API_URL_PROD`

## 5. Design System & Theme (STORY-001-05)

- [x] 5.1 Cài fonts: `expo install expo-font @expo-google-fonts/nunito @expo-google-fonts/inter`
- [x] 5.2 Tạo `src/constants/tokens.ts` — export `colors` với 11 tokens đúng theo Design Handoff: `coral:'#FF6B35'`, `sky:'#4ECDC4'`, `sun:'#FFE66D'`, `navy:'#1A1A2E'`, `slate:'#6B7280'`, `cream:'#FFFBF5'`, `lavender:'#F0EBFF'`, `green:'#4CAF50'`, `amber:'#FFC107'`, `red:'#FF5252'`, `diamond:'#9C27B0'`
- [x] 5.3 Thêm `typography` vào tokens: `display`(Nunito/900/36), `h1`(Nunito/900/28), `h2`(Nunito/800/22), `h3`(Nunito/800/18), `body`(Nunito/600/15), `caption`(Nunito/700/13), `label`(Inter/600/12), `mono`(JetBrains/400/13)
- [x] 5.4 Thêm `spacing` vào tokens: `{ xs:4, sm:8, md:16, lg:24, xl:32, xxl:48 }`
- [x] 5.5 Thêm `radius` vào tokens: `{ xs:8, sm:12, md:18, lg:24, xl:32, pill:9999, screenMobile:54, screenTablet:48 }`
- [x] 5.6 Thêm `shadows` vào tokens theo đúng RN format từ handoff
- [x] 5.7 Thêm `MIN_HIT_AREA = 88` vào tokens
- [x] 5.8 Load Nunito + Inter fonts trong `App.tsx` bằng `useFonts` hook, show splash screen trong khi fonts loading

## 6. Animation Setup (STORY-001-06)

- [x] 6.1 Cài dependencies: `react-native-reanimated`, `react-native-gesture-handler`, `lottie-react-native`
- [x] 6.2 Thêm `react-native-reanimated/plugin` vào `babel.config.js` (phải là plugin cuối cùng)
- [x] 6.3 Bọc app bằng `GestureHandlerRootView` trong `App.tsx` (outermost wrapper)
- [x] 6.4 Thêm `ANIMATION` constants vào `src/constants/tokens.ts` đúng theo Design Handoff
- [ ] 6.5 Tạo smoke-test component `src/components/AnimationTest.tsx` dùng `useSharedValue` + `useAnimatedStyle` + `LottieView` để verify cả 3 thư viện hoạt động
- [ ] 6.6 Verify: animation test component chạy mượt 60fps trên cả iOS và Android
- [ ] 6.7 Xóa `AnimationTest.tsx` sau khi verify xong
