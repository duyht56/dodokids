## Why

Màn hình Sort Sequence hiện tại dùng một hàng duy nhất để kéo thả in-place, khiến trẻ khó hiểu rằng cần đặt thẻ vào đúng vị trí số. Design mới tách thành hai hàng rõ ràng: hàng nguồn (scrambled) và hàng đích (numbered slots), giúp tương tác trực quan hơn cho trẻ mầm non.

## What Changes

- **Bỏ** cơ chế kéo thả in-place một hàng (swap giữa các card cùng dãy)
- **Thêm** hàng nguồn (Row 1) gồm các card chưa sắp xếp, mỗi card có badge `?`
- **Thêm** hàng đích (Row 2) gồm các slot cố định được đánh số 1–N; slot trống hiển thị số + viền dashed, slot đã có card hiển thị card với số slot
- **Đổi** gesture: kéo card từ Row 1 → thả vào slot Row 2; kéo card đã đặt trong slot → trả về Row 1 hoặc đổi sang slot khác
- **Giữ** trạng thái đúng (green border `#4CAF50`, bg `#EAF7EA`, badge `N ✓`) và sai (amber border `#FFC107`, bg `#FFFBEA`, badge `N ⚠`, shake animation)
- **Giữ** nút "Kiểm tra thứ tự ✓" (disabled khi chưa điền đủ tất cả slot)
- **Giữ** nút "🔀 Xáo lại"
- Bỏ hỗ trợ `direction: 'vertical'` (layout mới chỉ horizontal two-row)

## Capabilities

### New Capabilities

(không có — thay đổi nằm trong capability hiện có)

### Modified Capabilities

- `sort-sequence-activity`: Thay thế interaction model từ single-row swap (và biến thể vertical) sang layout hai hàng — source row + numbered slot row với drag-to-slot; payload type `SortSequencePayload` không đổi, chỉ thay UI/UX

## Impact

- `mobile/src/components/activities/SortSequenceActivity.tsx` — refactor toàn bộ component
- Bỏ prop `direction` khỏi render logic (vertical layout không còn dùng)
- Không thay đổi `SortSequencePayload` type hay `onResult` contract
