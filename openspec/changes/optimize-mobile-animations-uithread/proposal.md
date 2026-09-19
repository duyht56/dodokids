## Why

Ba mục animation/gesture còn deferred từ review perf mobile — đưa tương tác kéo/vẽ lên UI thread. Đây là các tương tác LÕI của trẻ; một lỗi ở đây là **bug runtime khi render/gesture** mà tsc/lint/contract KHÔNG bắt được, nên **cần verify trên thiết bị thật**. Change này giao **code review sẵn** (đã compile/lint-check nơi làm được) để anh apply trên branch và test trên máy — KHÔNG apply vào working tree đã-verify để tránh ship code chưa test.

> Lưu ý về patch: `mobile/` có rất nhiều thay đổi uncommitted (feature explore-sound/prompt-audio đang dở), nên KHÔNG dùng `git checkout`/patch tự động trên các file đó. Áp dụng thủ công theo design.md trên một branch riêng.

- **rank 25 (pattern chip)** — `PatternFinderRenderer.DraggableOption` dùng `PanResponder` + `Animated.event(..., { useNativeDriver: false })` ⇒ transform commit trên JS thread mỗi frame. Đã có sẵn bản rewrite sang `react-native-gesture-handler` + reanimated worklet (đã compile + lint sạch).
- **rank 24 (sort drag clone)** — `SortSequenceActivity` route mỗi frame qua `runOnJS(onDragMove)` → JS → set shared value. Hướng dẫn: lift `cloneX/cloneY` (+ root origin) thành shared value, viết trong pan worklet; `runOnJS` chỉ cho start/drop.
- **rank 4 (tracing, phần đầy đủ)** — trên `TracingWorkshopRenderer` (đã có throttle an toàn từ change `optimize-tracing-render`): tách polyline động thành child memoized + `React.memo` các Path tĩnh (hoặc chuyển live-stroke sang Skia). Hướng dẫn + rủi ro prop-identity.

## What Changes

- **uithread-drag-gestures**: đưa drag/vẽ lên UI thread (worklet) hoặc cô lập re-render, giữ nguyên hành vi/kết quả.

## Capabilities

### New Capabilities
- `uithread-drag-gestures`: các gesture kéo/vẽ chạy trên UI thread hoặc re-render được cô lập, không đổi kết quả tương tác.

## Impact (áp dụng thủ công trên branch để test)

- `mobile/src/explore/renderers/PatternFinderRenderer.tsx` (rank 25).
- `mobile/src/components/activities/SortSequenceActivity.tsx` (rank 24).
- `mobile/src/explore/renderers/TracingWorkshopRenderer.tsx` (rank 4, phần đầy đủ — trên throttle đã có).

## Verify (bắt buộc trên thiết bị)

- Compile: `npx tsc --noEmit`, `npm run lint`, contract scripts.
- Behavior (trên máy): kéo chip pattern mượt không giật; kéo-thả sort-sequence clone bám ngón tay; vẽ tracing vệt mực bám ngón, không lag, chấm điểm đúng như cũ.
