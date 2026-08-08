## Why

Kido đã phát được các file `audioFiles.*` bằng `expo-audio`, nhưng lifecycle feedback trên mobile vẫn chưa đúng với ý nghĩa của contract:

- `correct` đang phát cho mọi lần trả lời đúng, dù canonical schema định nghĩa đây là lời khen khi đúng lần đầu.
- `explain` chỉ phát sau lần sai thứ ba, nên trường hợp bé sai rồi tự sửa đúng không được nghe giải thích.
- `LessonPlayerScreen` và `PracticeBankScreen` chuyển activity bằng timer cố định 1,2 giây. Clip `correct` hoặc `explain` dài hơn sẽ bị activity kế tiếp cắt ngang.
- Chưa có hành vi rõ ràng khi bé bấm **Tiếp tục** trong lúc feedback đang phát.

Vì audio là kênh hướng dẫn chính cho trẻ 4–6 tuổi, feedback phải được phát độc quyền, có trạng thái hoàn tất/hủy rõ ràng và không được chồng với câu hỏi của activity kế tiếp.

## What Changes

- **Speech service**: `speak(url)` tiếp tục dùng `expo-audio`, nhưng trả về kết quả hoàn tất (`finished`, `cancelled`, `skipped`, `failed`). Mọi lần phát mới hoặc `stop()` đều hủy và giải phóng session cũ trước, đồng thời settle Promise cũ để không treo UI.
- **Success semantics**:
  - Đúng lần đầu → phát `correct`.
  - Đúng sau ít nhất một lần sai → phát `explain`.
  - Nếu `explain` đã phát ở lần sai thứ ba → khi bé chọn đúng chỉ phát `correct`, không lặp lại `explain`.
- **Wrong semantics**: sai lần 1 → `hint1`; sai lần 2 → `hint2`; sai lần 3 trở đi → `explain`.
- **Feedback state machine**: `ActivityContainer` sở hữu trạng thái `answering → feedbackPlaying → advancing`. Trong lúc feedback phát, đáp án và replay bị khóa để không tạo race.
- **Continue/skip**: khi success feedback đang phát, nút **Tiếp tục** cho phép bé bỏ qua. Flow bắt buộc là `stop feedback → advance → mount activity mới → phát question mới`.
- **Advance timing**: bỏ timer 1,2 giây ở Lesson và Practice. Parent chỉ advance khi callback success được container gọi sau khi audio kết thúc, lỗi/thiếu URL, hoặc bé bấm Tiếp tục.
- **Bubble**: hiển thị đúng text `hint1`, `hint2`, `explain`, hoặc `correct` tương ứng với clip đang phát; dùng câu khích lệ dự phòng khi text thiếu.

## Capabilities

### New Capabilities

- `remote-audio-playback`: phát file URL qua `expo-audio`, chỉ một session tại một thời điểm, có completion/cancellation contract.
- `activity-audio-file-urls`: giữ mapping `audioFiles.*` từ server vào `Activity.audio.files`, gồm fallback cho published payload cũ.

### Modified Capabilities

- `activity-audio-playback`: feedback phụ thuộc attempt, đợi playback hoàn tất, hỗ trợ Continue/skip và bảo đảm không chồng audio giữa hai activity.

## Impact

- `mobile/src/services/speech.ts`
- `mobile/src/components/activities/ActivityContainer.tsx`
- `mobile/src/screens/child/LessonPlayerScreen.tsx`
- `mobile/src/screens/child/PracticeBankScreen.tsx`
- Mobile tests cho playback result, attempt semantics và double-action guard.

Không đổi backend schema, database hoặc pipeline audio generation. `audioScript` text vẫn tách khỏi `audioFiles` URL.
