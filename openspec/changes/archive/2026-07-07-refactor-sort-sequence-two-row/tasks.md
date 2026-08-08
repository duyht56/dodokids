## 1. State model & scaffolding

- [x] 1.1 Thay `order` state bằng `slots: (string | null)[]` (length N, init all null) và `source: string[]` (init = scrambled ids)
- [x] 1.2 Cập nhật `scrambledOrder` để trả về source list scrambled; bỏ logic `direction === 'vertical'` khỏi render
- [x] 1.3 Thêm `slotRowLayout` state (x, y, width, height) đo qua `onLayout` trên container slot row; thêm `rootLayout` origin qua `onLayout` trên root View
- [x] 1.4 Thêm `isDragging` shared/state để disable "Xáo lại" khi đang kéo

## 2. Source row (Row 1)

- [x] 2.1 Render source cards với badge `?`, ảnh visual (ActivityVisual), label — style theo Screen-14 (card trắng, radius 14, shadow)
- [x] 2.2 Card đang kéo giảm opacity xuống ~0.3 (giữ chỗ trong flow)

## 3. Target row (Row 2)

- [x] 3.1 Render N slot cố định; slot trống hiển thị số thứ tự + viền dashed `#C4C4C4` (bg transparent)
- [x] 3.2 Slot đã có card hiển thị card + badge số ở góc trái trên
- [x] 3.3 Slot state màu: correct (border `#4CAF50`, bg `#EAF7EA`, badge `N ✓`), wrong (border `#FFC107`, bg `#FFFBEA`, badge `N ⚠`)

## 4. Drag & drop gesture

- [x] 4.1 Gesture.Pan trên mỗi card với minDistance 8pt, lifted state (scale 1.05, shadow++, coral accent)
- [x] 4.2 Floating clone: Animated.View absolute trên overlay theo ngón tay (dùng absoluteX/absoluteY)
- [x] 4.3 `onEnd`: tính slot target từ `slotRowLayout` (slotWidth = width/N); drop vào slot nếu tọa độ nằm trong bounds slot row
- [x] 4.4 Drop từ source vào slot đã có card → card cũ trả về source (swap)
- [x] 4.5 Kéo card đã đặt, thả ngoài slot bounds → trả về source, slot thành null
- [x] 4.6 Spring-back animation khi thả không hợp lệ

## 5. Validation & feedback

- [x] 5.1 Nút "Kiểm tra thứ tự ✓" disabled khi còn slot null (`slots.some(s => s === null)`)
- [x] 5.2 `check()`: so `correctById[slots[i]] === i + 1` cho từng slot; set slotStates; gọi `onResult`
- [x] 5.3 Shake animation cho slot wrong (giữ logic withSequence hiện có)
- [x] 5.4 "Xáo lại": reset slots về null, source về scrambled, clear slotStates; disabled khi `isDragging` hoặc `locked`

## 6. Verify

- [x] 6.1 Chạy typecheck/lint mobile, sửa lỗi
- [x] 6.2 Kiểm tra render trên app: kéo card vào slot, kiểm tra đúng (xanh) và sai (cam + shake), reshuffle
