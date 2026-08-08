## Context

App hiện có `ActivityContainer` đã wire audio đúng (play question on mount, hints on wrong, correct on correct) nhưng `speakCount()` trong `speech.ts` chỉ `console.log` — không phát audio thật. `PatternMatrixActivity` chưa tồn tại (type đã có trong `lesson.ts` nhưng không có component). `SortSequenceActivity` dùng drag-within-row khó dùng cho trẻ nhỏ. CountTap và CompareTap sprites đã có `TouchableOpacity` và `hitSlop` đúng — vấn đề "không chọn được" ở ảnh đính kèm thực ra là sprites đã có số, nên phần này hoạt động bình thường; vấn đề thực sự là `speakCount` không phát âm.

## Goals / Non-Goals

**Goals:**
- `speakCount(n)` phát audio URL từ bucket S3/CDN (1.mp3 → 10.mp3)
- `PatternMatrixActivity` component mới render đúng kích thước (question nhỏ, answer chuẩn)
- `SortSequenceActivity` redesign: bank row (trên) + numbered drop slots (dưới), kéo từ bank xuống slot
- Audio wiring trong `ActivityContainer` đã đúng — không cần thay đổi

**Non-Goals:**
- Không thay đổi `AudioScript` type hay backend API
- Không refactor `SingleSelect`, `MultiSelect`, `MatchPair`
- Không thêm animation phức tạp cho sort sequence

## Decisions

### 1. speakCount URL convention
Dùng bucket URL pattern `https://storage.googleapis.com/kido-audio/counts/{n}.mp3` — giống convention của các audio khác trong app. Nếu bucket chưa có file, `playUrl` đã có `catch` và warn DEV — không crash.

**Thay thế đã xem xét:** Hardcode array URL trong speech.ts vs. dùng function — chọn function để dễ đổi base URL sau.

### 2. PatternMatrixActivity layout
- Question container: fixed height 160 (mobile), hiển thị pattern rows với cells 36×36
- Answer options: grid 2 cột, mỗi card 120×120, nền trắng đơn giản (không nested background)
- Loại bỏ: outer pink background + inner card background + image background = chỉ giữ 1 lớp nền trắng cho answer card

**Thay thế:** Giữ design nhiều lớp nhưng thu nhỏ — không chọn vì vẫn trông xấu.

### 3. SortSequence redesign — bank + slot model
Thay drag-within-single-row bằng 2 rows:
- **Bank row** (hàng trên): các item ban đầu ở đây, khi kéo xuống slot thì biến mất khỏi bank
- **Slot row** (hàng dưới): N ô đánh số 1..N, mỗi ô nhận 1 item từ bank
- Kéo từ bank xuống slot: sử dụng gesture drop với hitSlop rộng cho trẻ nhỏ
- Kéo từ slot về bank (unplace): tap vào item đã đặt để trả về bank
- "Kiểm tra" chỉ active khi tất cả slots đã có item

**Thay thế:** Giữ drag-within-row nhưng thêm số — không đủ trực quan cho trẻ 3-6 tuổi.

### 4. isPatternMatrix type guard
Thêm `isPatternMatrix` guard vào `lesson.ts` và register `PatternMatrixActivity` trong `ActivityContainer`.

## Risks / Trade-offs

- **speakCount URL** → Nếu bucket chưa upload audio files, function gọi `playUrl` sẽ fail silently (đã có try/catch). Mitigation: kiểm tra bucket trước khi deploy.
- **SortSequence redesign** là breaking change về UX — trẻ cũ sẽ thấy UI khác hoàn toàn. Acceptable vì UX cũ không dùng được.
- **PatternMatrix mới** — cần test với các payload thực tế vì rows có thể có 1–3 rows, cells có thể là emoji hay image.

## Migration Plan

1. Sửa `speech.ts` — speakCount phát URL
2. Tạo `PatternMatrixActivity.tsx` + thêm type guard + register trong ActivityContainer
3. Rewrite `SortSequenceActivity.tsx` — bank + slot model
4. Test trên device với lesson mock

Rollback: git revert từng file — không có migration data.

## Open Questions

- Base URL của count audio bucket là gì? Hiện dùng placeholder — cần confirm với backend.
- PatternMatrix: có trường hợp nào rows > 2 không? Hiện thiết kế cho 1-2 rows.
