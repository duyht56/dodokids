# Change: Enforce stateless Explore play

## Why

Quyết định sản phẩm yêu cầu Khám phá không lưu bất kỳ lịch sử chơi nào và mỗi lần vào game đều bắt đầu lại. Vì vậy adaptation xuyên phiên, báo cáo phụ huynh từ Explore, giới hạn dựa trên thời lượng tích lũy và operational metrics hành vi đều không còn hợp lệ. Change này biến ranh giới đó thành contract có thể kiểm thử, đồng thời giữ các cấu hình phụ huynh tĩnh không phụ thuộc lịch sử nếu cần.

## What Changes

- Cấm lưu hoặc phát sự kiện về game đã chơi, câu trả lời, tries, hints, level, duration, completion, exit, seed và tracing data.
- Cấm resume, recent game, adaptive evidence, Explore section trong weekly report và product/learning analytics của Explore.
- Cho phép cấu hình tĩnh như preferred starting level, reduced support hoặc break-reminder interval; cấu hình không được cập nhật tự động từ hành vi trẻ.
- Break reminder chỉ dùng timer của lượt hiện tại và reset khi thoát; không hỗ trợ daily accumulated limit hoặc history-based time window.
- Thêm storage/network/schema/report contract tests để ngăn regression.

## Capabilities

### New Capabilities

- `explore-stateless-privacy`: No-history boundary, fresh restart and static-control rules.

### Modified Capabilities

- None.

## Impact

- Depends on `add-explore-foundation`.
- `mobile`: memory-only state, fresh restart, optional static parent defaults and current-run break reminder.
- `kido-server`: may persist parent-authored static config but no child play evidence or Explore report aggregates.
- No XP, reward, lesson progress, adaptation or Explore usage reporting.

