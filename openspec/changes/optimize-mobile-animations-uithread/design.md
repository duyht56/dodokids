# Design — optimize-mobile-animations-uithread

> Apply on a dedicated branch and verify on a device. tsc/lint pass ≠ correct behavior for gestures/rendering.

## rank 25 — PatternFinder drag chip (READY: compiled + linted)

Replace the `PanResponder` + `Animated.event(useNativeDriver:false)` chip in `PatternFinderRenderer.tsx` with a gesture-handler + reanimated worklet so the drag runs on the UI thread. Verified `tsc --noEmit` + `eslint` clean.

**Imports** — change the react + react-native imports and add the two libs:

```tsx
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Reanimated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
```
(Remove `Animated` and `PanResponder` from the `react-native` import — they become unused.)

**Replace the body of `DraggableOption`** (keep its props signature) with:

```tsx
  // Drive the drag on the UI thread (reanimated worklet) instead of committing
  // the transform from JS each move frame (Animated.event + useNativeDriver:false).
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);

  const handleRelease = useCallback(
    (moveX: number, moveY: number) => {
      const rect = slotRect.current;
      const overSlot =
        !!rect &&
        moveX >= rect.x &&
        moveX <= rect.x + rect.w &&
        moveY >= rect.y &&
        moveY <= rect.y + rect.h;
      if (overSlot) onDrop();
    },
    [onDrop, slotRect],
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .enabled(!disabled)
        .onUpdate((event) => {
          tx.value = event.translationX;
          ty.value = event.translationY;
        })
        .onEnd((event) => {
          runOnJS(handleRelease)(event.absoluteX, event.absoluteY);
          tx.value = withSpring(0);
          ty.value = withSpring(0);
        }),
    // tx/ty are stable useSharedValue refs and are intentionally omitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [disabled, handleRelease],
  );

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Reanimated.View
        accessibilityRole="button"
        accessibilityLabel={token.labelVi}
        style={[styles.optionCard, animStyle]}
      >
        <TokenGlyph token={token} size={size} />
      </Reanimated.View>
    </GestureDetector>
  );
```

Notes: the release still uses `slotRect` (measureInWindow) + `runOnJS` once at drop (not per-move). `eslint react-hooks/immutability` fires if `tx/ty` are in the `useMemo` dep array — keep them out (they are stable). Device-test: chip must follow the finger and dropping over the slot must commit the token (same identity a tap submits).

## rank 24 — SortSequence drag clone (approach — device-iterate)

Today `DraggableCard.pan.onUpdate` does `runOnJS(onDragMove)` → `updateDrag` → `cloneRef.current?.move()` which sets `cloneX/cloneY` shared values from the JS thread each frame.

**Approach:** lift the clone position to shared values owned by `SortSequenceActivity`, and write them inside the pan worklet:
1. In `SortSequenceActivity`, create `const cloneX = useSharedValue(0); const cloneY = useSharedValue(0);` and `const rootX = useSharedValue(0); const rootY = useSharedValue(0);` (fill rootX/rootY in `measureRoot`).
2. Pass `cloneX/cloneY` to `FloatingDragClone` and have its `useAnimatedStyle` read them directly (drop the imperative `move()` per-frame path; keep `show/hide/springBack` for transitions).
3. Pass `cloneX/cloneY/rootX/rootY` (and card dims) into `DraggableCard`; in `pan.onUpdate((e) => { 'worklet'; cloneX.value = e.absoluteX - rootX.value - cardW/2; cloneY.value = e.absoluteY - rootY.value - cardLen/2; })` — no `runOnJS`.
4. Keep `runOnJS` only in `onStart` (begin drag / show clone) and `onEnd` (drop resolution). 

**Risk:** shared values are now cross-component; getting the root-origin capture wrong makes the clone lag/offset. Same `react-hooks/immutability` caveat (don't put shared values in `useMemo` deps). LOW impact (the review notes the JS thread is usually idle mid-drag), so this is polish — verify the clone tracks the finger 1:1 before/after.

## rank 4 — tracing full UI-thread (approach — device-iterate)

The safe distance-throttle already shipped (`optimize-tracing-render`). The full fix removes the per-sample full-`<Svg>` reconcile:

**Approach A (memoization, stays in react-native-svg):** split `render()` into two memoized children inside the `<Svg>`:
- `<StaticGlyph>` — the per-stroke corridor/guide/ink Paths + start/direction markers. Props: `item`, `completedStrokeIds`, `currentStrokeIndex`, `currentProgress`, and **primitive** stroke weights (`corridorW`, `guideW`, `inkW`) — NOT the `weights`/`assistance` objects (new identity each render breaks `React.memo`). Wrap in `React.memo`.
- `<LiveTrail>` — only `<Polyline points={pointList(gesturePoints)} />`. Props: `gesturePoints`, `inkW`. Wrap in `React.memo`.

During a drag only `gesturePoints` changes → only `LiveTrail` reconciles. **Risk:** prop-identity is load-bearing — pass primitives/stable refs (memoize `direction`, keep `completedStrokeIds` a stable ref from the reducer), or memo either never helps (no gain) or skips when it shouldn't (stale glyph). Must verify on device that strokes still render/update and the live ink follows the finger.

**Approach B (Skia):** move the live stroke to `@shopify/react-native-skia` (already a dep) with a reanimated-backed path drawn on the UI thread; keep react-native-svg for the static glyph. Larger change; only if Approach A is insufficient.

## On-device test checklist

- Pattern (drag variant): chip follows finger smoothly under load; drop-on-slot commits; wrong→reset works.
- Sort-sequence: floating clone tracks finger 1:1; drop into slot / spring-back correct.
- Tracing: ink trail follows finger without lag; stroke accept/reject unchanged; multi-stroke glyph advances correctly.
