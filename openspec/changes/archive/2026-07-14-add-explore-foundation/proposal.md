# Change: Add Explore foundation

## Why

Kido cần khu vực Khám phá gồm các trò chơi tự chọn, không ảnh hưởng lesson và không lưu bất kỳ lịch sử chơi nào. Nền tảng phải hỗ trợ hai cách cấp bài: game có đủ generator/validator/asset/audio trên thiết bị có thể chơi hoàn toàn offline; game còn lại nhận bài tức thời từ server. Cả hai cách đều dùng chung UI nhưng tuyệt đối không tạo tiến trình, attempt hoặc phiên có thể tiếp tục.

## What Changes

- Thêm danh mục 8 trò chơi và bottom menu năm mục theo thiết kế Hi-Fi.
- Thêm contract `GameConfig -> generator -> validator -> exercise` với `runtimeMode` là `local` hoặc `server` và cờ `offlineCapable` được xác định từ toàn bộ dependency của game.
- Game local sinh và validate exercise trên thiết bị; game server lấy exercise đã validate từ API nhưng không gửi kết quả chơi về server.
- Thêm lượt chơi tạm thời gồm 5–8 tương tác, chỉ tồn tại trong bộ nhớ; thoát hoặc đóng app sẽ hủy toàn bộ trạng thái và lần vào sau bắt đầu lại từ đầu.
- Không tạo `ExploreSession`, `ExploreAttempt`, resume, “Chơi tiếp”, analytics, report, adaptation hay bất kỳ lịch sử chơi nào.
- Giữ config/version, feature flag và asset manifest không gắn với trẻ để vận hành game an toàn.

## Capabilities

### New Capabilities

- `explore-catalog`: Danh mục game, availability và trạng thái offline.
- `explore-session-runtime`: Lượt chơi tạm thời, generator/validator contract và renderer registry.
- `explore-runtime-api`: API stateless cho catalog/config và exercise của game cần server.
- `navigation-setup`: Bottom menu năm mục và typed Explore routes.

### Modified Capabilities

- None.

## Impact

- `mobile`: navigation, catalog, transient play shell, local generators và offline bundles.
- `kido-server`: stateless catalog/config/exercise endpoints cho game cần server; không có persistence theo child.
- Không dùng lesson progress endpoints và không thay đổi XP, sao, streak, unlock hoặc entitlement.

