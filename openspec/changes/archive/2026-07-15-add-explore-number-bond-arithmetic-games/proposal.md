## Why

Phase B bổ sung tư duy tách-gộp và cộng-trừ trực quan. Hai game chia sẻ representation tổng–phần, object/ten-frame/number-line scaffolding và arithmetic constraints nên nên đi chung để tránh tạo hai model toán không tương thích.

## What Changes

- Thêm Ngôi nhà tách gộp: chia nhóm, tìm phần thiếu, nhiều cách tách và tạo 10.
- Thêm Máy cộng trừ: thêm/bớt, đếm tăng, tạo 10 và phép tính hai/ba toán hạng trong phạm vi được duyệt.
- Thêm progression L1–L5 và nhánh Advanced 50 chỉ với chục–đơn vị hoặc number-line scaffolding.
- Generator không sinh số âm/vượt phạm vi; validator kiểm tra construct, đáp án và representation tương ứng.
- Thêm animation giải thích thêm/bớt/tách/gộp, audio templates capability-gated và tối thiểu 200 exercise hợp lệ cho mỗi game.

## Capabilities

### New Capabilities

- `explore-number-bond-game`: Number partition generator, visual model, validator and progression.
- `explore-arithmetic-game`: Constrained visual addition/subtraction generator, validator, scaffolding and progression.

### Modified Capabilities


## Impact

- Depends on `add-explore-foundation`; rollout dựa trên automated conformance và manual canary QA, không dùng child telemetry.
- `mobile`: shared number-bond/arithmetic visual primitives and animations.
- `mobile`: versioned local math generators/configs/validators, visual primitives and deterministic/property tests for offline play.
- `kido-server`: optional public config delivery only; no child play persistence.
