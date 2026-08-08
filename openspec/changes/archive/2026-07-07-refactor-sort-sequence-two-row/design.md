## Context

`SortSequenceActivity` hiện render tất cả card trên một hàng duy nhất, dùng gesture pan in-place để hoán đổi vị trí. Interaction này không trực quan với trẻ mầm non vì không thấy rõ "đặt vào đây". Design mới (Screen-14) dùng mô hình hai hàng: Row 1 (source) chứa các card chưa xếp, Row 2 (target) chứa các slot cố định đánh số — bé kéo card từ Row 1 xuống slot Row 2.

File cần sửa duy nhất: `mobile/src/components/activities/SortSequenceActivity.tsx`  
Payload type `SortSequencePayload` và `onResult` contract giữ nguyên.

## Goals / Non-Goals

**Goals:**
- Layout hai hàng: source row + numbered slot row
- Drag card từ source → thả vào slot (cross-row drop)
- Drag card đã ở trong slot → trả về source hoặc đổi slot
- Slot trống hiển thị số thứ tự + viền dashed
- Slot có card hiển thị card + số slot ở góc
- Nút "Kiểm tra" disabled cho đến khi tất cả slot đã có card
- Giữ feedback màu xanh/vàng và shake animation như hiện tại

**Non-Goals:**
- Bỏ `direction: 'vertical'` (không còn trong design mới)
- Không thay đổi `SortSequencePayload` type
- Không hỗ trợ tablet layout khác biệt (scale cardLen như cũ là đủ)

## Decisions

### D1: State model — `slots` array thay vì `order` array

**Quyết định:** Dùng `slots: (string | null)[]` (length = N, mỗi phần tử là id card đang ở slot đó hoặc null) + `source: string[]` (cards chưa được đặt).

**Lý do:** Model hai hàng cần phân biệt "card chưa đặt" và "card đã ở slot N". Array `order` cũ không encode thông tin này. `slots[i] = id` hoặc `null` tự nhiên hơn.

**Thay thế đã xem xét:** Giữ `order` và thêm `placedAt: Record<string, number | null>` — phức tạp hơn, dễ desync.

### D2: Gesture — pan với absolutePosition

**Quyết định:** Mỗi card (source và slot) dùng `Gesture.Pan`. Khi `onEnd`, tính toán drop target dựa trên tọa độ tuyệt đối của ngón tay so với layout của slot row.

**Lý do:** Cross-row drop cần biết tọa độ màn hình, không chỉ delta translation. Dùng `useSharedValue` lưu vị trí tuyệt đối của slot row (đo qua `onLayout`), sau đó trong `onEnd` so sánh `absoluteX/Y` với bounds của từng slot.

**Thay thế đã xem xét:** React Native Draggable FlatList — thêm dependency nặng, không cần thiết cho layout đơn giản này.

### D3: Drag visual — floating clone

**Quyết định:** Khi kéo, card gốc giảm opacity (0.3), một Animated clone "nổi" theo ngón tay dùng `position: 'absolute'` trên overlay View. Khi thả, clone animate về vị trí slot target hoặc trở về source.

**Lý do:** Trực quan hơn so với card gốc di chuyển trong flow — bé thấy rõ đang "cầm" thứ gì. Tránh layout reflow phức tạp.

**Thay thế đã xem xét:** Di chuyển card gốc ra khỏi flow (absolute) trong khi kéo — cần quản lý zIndex phức tạp hơn.

### D4: Drop detection — slot bounds array

**Quyết định:** Đo bounds của toàn bộ slot row qua `onLayout`, tính bounds từng slot = `slotRowX + i * slotWidth` với `slotWidth = slotRowWidth / N`. Drop vào slot `i` nếu `absoluteX` trong `[slotRowX + i*w, slotRowX + (i+1)*w]` VÀ `absoluteY` trong `[slotRowY, slotRowY + slotRowHeight]`.

**Lý do:** Không cần đo từng slot riêng lẻ — tất cả slot cùng chiều rộng, tính được từ container.

## Risks / Trade-offs

- **Layout measurement race** → Dùng `onLayout` callback, chỉ enable gesture sau khi `slotRowMeasured = true`
- **Floating clone coordinate system** → Clone phải là con trực tiếp của root View (không nested scroll) để tọa độ absolute chính xác; wrap toàn bộ component trong `<View onLayout>` để lấy origin
- **Reshuffle khi đang kéo** → Disable "Xáo lại" trong khi `isDragging === true`

## Migration Plan

Thay thế trực tiếp nội dung file `SortSequenceActivity.tsx`. Không có migration data. Nếu cần rollback, git revert commit.

## Open Questions

- Có cần animate card trở về source khi thả ra ngoài slot? (Assumed: yes, spring back)
- Khi slot đã có card và bé kéo card mới vào — swap hay reject? (Assumed: swap, card cũ trả về source)
