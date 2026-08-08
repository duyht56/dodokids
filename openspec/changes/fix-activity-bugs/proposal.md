## Why

Các màn hình activity của trẻ em có 4 lỗi nghiêm trọng ảnh hưởng trực tiếp đến trải nghiệm học tập: audio không phát, không thể tap vào đối tượng đếm, UI pattern_matrix xấu, và sort_sequence khó sử dụng với trẻ nhỏ. Những lỗi này cần fix ngay để app hoạt động đúng theo thiết kế giáo dục.

## What Changes

- **Audio system**: Gắn kết `ActivityContainer` với `speak()` cho question (auto-play on mount), hint1/hint2/explain (khi sai), correct (khi đúng)
- **CountTap & CompareTap sprites**: Fix hit area để trẻ có thể tap vào từng sprite; tích hợp `speakCount()` thực sự phát audio số đếm tiếng Việt thay vì chỉ log
- **PatternMatrix UI**: Thu nhỏ question image, giảm kích thước answer options, loại bỏ các lớp background thừa
- **SortSequence UX**: Thêm hàng drop zone đánh số 1–N bên dưới; thay cơ chế drag-within-row bằng drag-from-bank-to-slot (kéo từ hàng trên xuống slot đánh số)

## Capabilities

### New Capabilities
- `activity-audio-playback`: Auto-play question audio on mount, hint progression on wrong attempts, correct audio on success
- `count-speak-audio`: `speakCount(n)` phát file audio số đếm tiếng Việt từ bucket thay vì chỉ log
- `sort-sequence-slot-drop`: Giao diện kéo-thả với slot đánh số 1–N, trẻ kéo item từ bank xuống đúng slot

### Modified Capabilities
- `pattern-matrix-layout`: Thu nhỏ question image container, normalize kích thước answer cards, giảm nested background layers

## Impact

- `mobile/src/components/activities/ActivityContainer.tsx` — thêm useEffect audio + callback wiring
- `mobile/src/services/speech.ts` — `speakCount()` phát audio thật từ bucket URL
- `mobile/src/components/activities/CountTapActivity.tsx` — fix sprite hit area
- `mobile/src/components/activities/CompareTapActivity.tsx` — fix sprite hit area
- `mobile/src/components/activities/PatternMatrixActivity.tsx` — tạo mới (chưa tồn tại)
- `mobile/src/components/activities/SortSequenceActivity.tsx` — redesign UX với slot drop zone
- `mobile/src/types/lesson.ts` — PatternMatrixPayload type (có thể đã có)
