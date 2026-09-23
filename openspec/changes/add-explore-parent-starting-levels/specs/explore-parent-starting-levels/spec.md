# Spec: explore-parent-starting-levels

## Purpose

Cho phụ huynh đặt level khởi đầu RIÊNG cho từng game Khám phá, persist như
preference của phụ huynh, mà không đụng nguyên tắc zero-history của play
state trẻ em. Đây là cơ chế "lên bậc qua nhiều phiên" hợp lệ duy nhất của
Khám phá.

## ADDED Requirements

### Requirement: startingLevel per-game trong ExploreParentConfig

`ExploreParentConfig` SHALL có `startingLevelByGame?: Partial<Record<
ExploreGameCode, number>>` bên cạnh `startingLevel` global (fallback tương
thích). Giá trị per-game SHALL thắng giá trị global khi cả hai cùng có.
`sanitizeExploreParentConfig` SHALL bỏ key không phải gameCode hợp lệ và giá
trị không phải số nguyên dương; `EXPLORE_PARENT_CONFIG_FIELDS` và privacy
check SHALL được cập nhật cùng lúc. Giá trị SHALL là static, evidence-free —
không trường nào được suy từ lịch sử chơi của bé.

#### Scenario: Per-game thắng global

- **WHEN** config có `startingLevel = 2` và
  `startingLevelByGame.number_bus = 4`
- **THEN** run của `number_bus` khởi đầu ở level hiệu dụng 4, các game khác ở 2

#### Scenario: Key rác bị loại

- **WHEN** một payload chứa `startingLevelByGame` với key không phải gameCode
  hoặc giá trị âm/không nguyên
- **THEN** sanitize loại bỏ entry đó, các entry hợp lệ giữ nguyên

### Requirement: Persistence là preference của phụ huynh, không phải lịch sử chơi

Cài đặt SHALL được persist qua store cha ngoài Explore play store và khôi
phục khi mở lại app. Play state của bé SHALL vẫn memory-only tuyệt đối; không
trường persist nào ghi lại kết quả, số lần chơi, hay bất kỳ dữ liệu phiên nào
của bé (`explore-stateless-privacy` giữ nguyên).

#### Scenario: Mở lại app

- **WHEN** phụ huynh đặt level cho một game rồi kill app và mở lại
- **THEN** giá trị per-game vẫn còn; không dữ liệu chơi nào của bé được lưu

### Requirement: resolveStartingLevel clamp thay vì rơi về đáy

`resolveStartingLevel` SHALL trả về level LỚN NHẤT trong `game.levels` mà ≤
giá trị phụ huynh chọn; chỉ khi giá trị chọn nhỏ hơn mọi level, nó SHALL trả
`levels[0]`. Với game có levels liền 1..n hành vi SHALL không đổi so với hiện
tại (ghi chú tường minh: sửa này ảnh hưởng mọi game).

#### Scenario: Game chưa mở đủ level

- **WHEN** phụ huynh chọn 5 cho một game chỉ có levels [1, 2, 3, 4]
- **THEN** level hiệu dụng là 4, không tụt về 1

### Requirement: Màn phụ huynh tối thiểu

Khu phụ huynh SHALL có UI đặt level khởi đầu per-game (sau parental gate hiện
có) và SHALL hiển thị tiêu chí "đã vững" từng bậc khi game khai text tiêu chí
(vd `number_bus`); game không khai SHALL chỉ hiện picker level. UI này SHALL
là cách duy nhất ghi `startingLevelByGame` — không luồng tự động nào của trẻ
được ghi nó.

#### Scenario: Phụ huynh nâng bậc theo tiêu chí

- **WHEN** phụ huynh mở màn cài đặt Khám phá, đọc tiêu chí bậc của
  `number_bus` và chọn level cao hơn
- **THEN** giá trị per-game được lưu và run kế tiếp của game đó khởi đầu ở
  level mới
