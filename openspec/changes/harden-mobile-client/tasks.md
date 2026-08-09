## 1. Entitlement cache integrity (rank 13)

- [x] 1.1 `subscriptionStore.ts`: thêm `partialize: (state) => ({ trialStartDate: state.trialStartDate })` vào persist options
- [x] 1.2 Xác nhận `useIapBootstrap` vẫn reconcile từ server on launch (không đổi)

## 2. Parent-gate adult challenge (rank 14)

- [x] 2.1 `ParentGateModal.tsx`: thêm state `adultVerified` + challenge (2 số ghi bằng chữ tiếng Việt, đáp án là tổng)
- [x] 2.2 Khi `isSetup && !adultVerified`: render bước challenge trước UI tạo PIN; sai ⇒ tạo challenge mới
- [x] 2.3 Đường verify (đã có PIN) không đổi

## 3. Transport security (rank 17)

- [x] 3.1 `app.json`: bỏ `android.usesCleartextTraffic: true`
- [x] 3.2 `app.config.js`: đặt `android.usesCleartextTraffic = !KIDO_API_URL || KIDO_API_URL.startsWith('http://')` (giữ các field android khác qua spread)
- [x] 3.3 `api.ts`: http fallback chỉ khi `__DEV__`; non-dev fallback `https://api.dodokids.vn`; warn nếu non-dev baseURL là http; giữ interceptor/401 nguyên vẹn

## 4. Verify

- [x] 4.1 `npx tsc --noEmit` + `npm run lint` xanh
- [x] 4.2 Chạy `node scripts/verify-anonymous-session-contracts.cjs` (guard api.ts + useIapBootstrap)
