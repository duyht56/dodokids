## Why

rank 4 (tracing re-render, HIGH) đầy đủ cần rewrite live-stroke sang UI-thread (Skia/reanimated worklet) + memoize cây SVG tĩnh — đó là thay đổi lớn tới tương tác LÕI của trẻ, và một lỗi ở đó là **bug runtime khi render** mà tsc/lint/contract KHÔNG bắt được; cần verify trên thiết bị thật. Change này chỉ làm **phần an toàn, giữ nguyên hành vi**, verify được tĩnh:

- `TracingWorkshopRenderer` dispatch `append` (kéo theo full re-render `<Svg>`) trên MỌI mẫu pointer-move (~60–120/giây). Ta throttle theo khoảng cách phần **dispatch re-render**, trong khi vẫn push đủ điểm vào `this.gesturePoints` để chấm điểm không đổi ⇒ giảm mạnh số lần re-render mà không đổi kết quả đánh giá.

## What Changes

- **tracing-render-throttle**: trong `onPanResponderMove`, chỉ `dispatch({type:'append'})` khi ngón tay di chuyển ≥ `MIN_APPEND_DISTANCE` (~1% canvas) so với điểm đã dispatch gần nhất. `this.gesturePoints` (dùng cho `evaluateTracingGesture` lúc thả) vẫn nhận đủ điểm ⇒ độ chính xác chấm điểm không đổi; chỉ vệt mực sống thưa hơn không đáng kể.

## Capabilities

### New Capabilities
- `tracing-render-throttle`: giảm tần suất re-render live trail theo khoảng cách, giữ nguyên fidelity đánh giá.

## Impact

- `mobile/src/explore/renderers/TracingWorkshopRenderer.tsx` — throttle dispatch trong pan move.

## Out of Scope (deferred — CẦN verify trên thiết bị)

- rank 4 đầy đủ: đưa live-stroke lên UI thread (Skia/reanimated worklet), tách polyline động thành child memoized, `React.memo` các Path tĩnh.
- rank 24 (sort-sequence drag clone: viết offset trong worklet thay vì `runOnJS` mỗi frame) — LOW, refactor shared-value across component.
- rank 25 (pattern-finder chip: migrate PanResponder+Animated `useNativeDriver:false` sang gesture-handler + reanimated) — LOW, rewrite gesture.
