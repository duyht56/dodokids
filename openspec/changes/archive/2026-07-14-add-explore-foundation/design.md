# Design: Stateless hybrid Explore runtime

## Context

Khám phá là khu vực chơi tự do. Quyết định sản phẩm mới yêu cầu không lưu lịch sử chơi dưới bất kỳ hình thức nào và mỗi lần quay lại game phải bắt đầu lại. Một số game có thể sinh dữ liệu 100% trên thiết bị; những game chưa có đủ rule hoặc bundle vẫn có thể dùng server để cấp exercise tức thời.

## Goals / Non-Goals

**Goals:** runtime hybrid local/server, offline đúng năng lực từng game, một play shell dùng chung, không persistence theo trẻ, không resume, và không tác động lesson.

**Non-Goals:** attempt tracking, progress, report, adaptation qua nhiều lượt chơi, telemetry hành vi, replay một lượt chơi của trẻ hoặc đồng bộ trạng thái giữa thiết bị.

## Decisions

### D1 — Runtime mode là thuộc tính versioned của game

Mỗi `ExploreGameDefinition` khai báo `runtimeMode: local | server`, generator/validator version và dependency manifest. `offlineCapable` chỉ đúng khi generator, validator, config, asset/vector pack và audio cần thiết đều có sẵn trên thiết bị. Không suy luận offline chỉ từ việc công thức có thể random.

### D2 — Local game chạy hoàn toàn trên thiết bị

Game local dùng seeded PRNG và validator đã đóng gói trong app. Seed được tạo mới cho mỗi lượt vào game và chỉ nằm trong memory. Không gọi API khi sinh/chấm bài và không ghi seed, câu trả lời hay outcome xuống disk.

### D3 — Server game dùng API stateless

Game server gọi API lấy một batch exercise đã validate. Request chỉ mang game/config/capability cần thiết, không mang child ID, kết quả cũ hay lịch sử. Response không tạo session ID. Mobile chấm tương tác cục bộ theo answer rule đã nhận và không submit outcome.

### D4 — Lượt chơi chỉ là transient UI state

Play shell giữ exercise index, current exercise, tries và hints trong memory để điều khiển lượt hiện tại. Back/exit, unmount hoặc process restart hủy state. Catalog luôn hiển thị “Chơi” và không có “Chơi tiếp”.

### D5 — Server chỉ lưu dữ liệu vận hành không định danh trẻ

Server có thể lưu versioned config, game flags, approved asset manifests và nội dung dùng chung. Không có `ExploreSession`, `ExploreAttempt`, child-scoped key, event log hay report aggregate. Log hạ tầng phải loại request payload có thể mô tả hành vi chơi và dùng retention kỹ thuật thông thường.

### D6 — Khó khăn chỉ thích ứng trong lượt hiện tại

Hint hoặc giảm hỗ trợ có thể phản ứng với thao tác trong exercise/lượt hiện tại, nhưng state đó bị hủy khi thoát. Level khởi đầu đến từ default hoặc cấu hình phụ huynh tĩnh, không từ lịch sử.

### D7 — Navigation theo thiết kế Bottom Menu Redesign

Bottom menu gồm `Bài học · Khám phá · Đô Đô · Thành tích · Phụ huynh`; Đô Đô ở giữa mở Adventure Map. Explore giữ vùng chạm tối thiểu 64pt và reduced-motion behavior theo Hi-Fi.

## Risks / Trade-offs

- Không thể điều tra một lượt chơi cụ thể sau khi trẻ thoát; bù bằng deterministic unit/property tests và canary không gắn người dùng.
- Server game không chơi được khi offline; catalog phải diễn đạt rõ trạng thái thay vì giả vờ hỗ trợ.
- Không có adaptive/reporting xuyên phiên; chỉ dùng default/config tĩnh và hỗ trợ trong lượt hiện tại.
- Stateless API có thể bị gọi nhiều; dùng batch nhỏ, cache public config/assets và rate limit không dựa trên lịch sử học tập.

## Rollout

1. Thêm contract runtime mode và privacy tests.
2. Thêm navigation/catalog/play shell không resume.
3. Đăng ký local canary và server canary stateless.
4. Bật từng game sau khi chứng minh dependency manifest và offline behavior.
5. Rollback bằng feature flag/game config; không có dữ liệu chơi cần migrate hoặc giữ lại.

