## 1. Tracing render throttle (rank 4, phần an toàn)

- [x] 1.1 `TracingWorkshopRenderer.tsx`: thêm `MIN_APPEND_DISTANCE` + field `lastDispatchedPoint`
- [x] 1.2 `onPanResponderMove`: luôn push vào `this.gesturePoints` (fidelity đánh giá); chỉ `dispatch('append')` khi di chuyển ≥ ngưỡng
- [x] 1.3 Set `lastDispatchedPoint` khi grant; reset khi finish/unmount

## 2. Verify

- [x] 2.1 `npx tsc --noEmit` + `npm run lint` (file này) xanh
- [x] 2.2 Contract scripts vẫn pass
