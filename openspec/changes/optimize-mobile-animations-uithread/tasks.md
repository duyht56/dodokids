> Áp dụng thủ công trên một branch riêng, verify trên thiết bị. KHÔNG apply vào working tree đã-verify.

## 1. rank 25 — pattern chip (code sẵn, đã compile+lint)

- [ ] 1.1 `PatternFinderRenderer.tsx`: đổi imports (bỏ `Animated`/`PanResponder`, thêm gesture-handler + reanimated) theo design.md
- [ ] 1.2 Thay body `DraggableOption` bằng bản worklet (giữ props signature)
- [ ] 1.3 Device-test: chip bám ngón, drop vào slot commit đúng token

## 2. rank 24 — sort drag clone (approach)

- [ ] 2.1 Lift `cloneX/cloneY` + root origin thành shared value ở `SortSequenceActivity`
- [ ] 2.2 `DraggableCard.pan.onUpdate` viết clone offset trong worklet (bỏ `runOnJS(onDragMove)`)
- [ ] 2.3 `FloatingDragClone.useAnimatedStyle` đọc shared value; giữ `runOnJS` cho start/drop
- [ ] 2.4 Device-test: clone bám ngón 1:1, spring-back đúng

## 3. rank 4 — tracing full UI-thread (approach)

- [ ] 3.1 Tách `<StaticGlyph>` (memo, props primitive) + `<LiveTrail>` (memo, chỉ gesturePoints)
- [ ] 3.2 Đảm bảo prop-identity ổn định (primitive weights, memo direction, stable completedStrokeIds)
- [ ] 3.3 (Tuỳ chọn) chuyển live-stroke sang Skia nếu memo chưa đủ
- [ ] 3.4 Device-test: vệt mực bám ngón, chấm điểm không đổi, multi-stroke advance đúng

## 4. Verify

- [ ] 4.1 Compile: `npx tsc --noEmit` + `npm run lint` + contract scripts
- [ ] 4.2 Behavior trên thiết bị theo checklist design.md
