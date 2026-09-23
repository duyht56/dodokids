# Đề xuất: startingLevel per-game cho Khám phá (GĐ0 của number_bus)

## Why

Khuôn zero-history của Khám phá (`docs/EXPLORE_ZERO_HISTORY.md`) cấm lưu lịch
sử chơi — nên cách hợp lệ duy nhất để một bé "lên bậc qua nhiều phiên" là phụ
huynh đặt level khởi đầu. Nhưng hạ tầng hiện tại không dùng được cho việc đó
(đã xác minh trên code):

- `ExploreParentConfig.startingLevel` là MỘT số **global cho cả catalog** —
  nâng bậc cho một game sẽ đẩy mọi game khác lên theo.
- Config này **memory-only**: mất sau mỗi lần mở lại app.
- **Chưa màn hình nào gọi `setExploreParentConfig`** — không có UI nào đặt nó.
- `resolveStartingLevel` chỉ nhận giá trị khi `levels.includes(startingLevel)`,
  ngược lại rơi thẳng về `levels[0]` — game chưa mở đủ level (vd `number_bus`
  GĐ1 chỉ L1–L4) sẽ tụt về L1 khi phụ huynh chọn 5.

Game `number_bus` (change `add-explore-number-bus-game`) thiết kế tiến trình
mastery có tiêu chí "đã vững" từng bậc cho phụ huynh đối chiếu — cần hạ tầng
này trước (GĐ0). Lợi ích áp dụng cho MỌI game Khám phá, không riêng game mới.

## What Changes

- `ExploreParentConfig` thêm `startingLevelByGame?: Partial<Record<
  ExploreGameCode, number>>` (per-game, static, evidence-free — không suy từ
  lịch sử chơi); `startingLevel` global giữ làm fallback tương thích.
- Cập nhật `sanitizeExploreParentConfig` + `EXPLORE_PARENT_CONFIG_FIELDS` +
  privacy check tương ứng.
- **Persistence qua store cha ngoài Explore play store** (cài đặt của phụ
  huynh là preference, không phải lịch sử chơi — đúng
  `EXPLORE_ZERO_HISTORY`); play state của bé vẫn memory-only tuyệt đối.
- Màn phụ huynh tối thiểu: đặt level khởi đầu per-game + hiển thị tiêu chí
  "đã vững" từng bậc của game (game khai text tiêu chí; game chưa khai thì chỉ
  có picker level).
- `resolveStartingLevel` sửa thành **clamp về level lớn nhất ≤ giá trị chọn**
  (thay vì rơi về `levels[0]`). Với mọi game hiện có levels liền 1..n, hành vi
  không đổi; khác biệt chỉ xuất hiện khi một game mở tập level thưa/ngắn hơn
  giá trị phụ huynh chọn.

## Capabilities

### New Capabilities

- `explore-parent-starting-levels`: level khởi đầu per-game do phụ huynh đặt,
  persist như preference của phụ huynh, sanitize + clamp an toàn, không đụng
  zero-history của play state.

## Impact

- Mobile: `mobile/src/explore/parentConfig.ts` (field mới + sanitize +
  fields + clamp), store cha persist preference, một màn hình phụ huynh mới
  (hoặc section trong màn phụ huynh hiện có); `number_bus` GĐ1 và mọi game
  authored-run sau này đọc qua `resolveStartingLevel` như cũ.
- Không đổi contract `docs/kido-explore-contract.ts`, không đổi server, không
  đổi pipeline. Không lưu bất kỳ dữ liệu chơi nào của bé.
