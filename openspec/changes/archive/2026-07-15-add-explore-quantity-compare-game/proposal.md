## Why

“Bên nào nhiều hơn?” là game Phase A có construct so sánh số lượng rõ ràng và có thể reuse `compare_tap`, nhưng cần generator/validator riêng để bảo đảm hai bên chỉ khác số lượng và layout không vô tình gợi đáp án.

## What Changes

- Thêm các mode nhiều hơn, ít hơn và bằng nhau với cùng một approved object sprite ở hai bên.
- Thêm progression L1–L5 về phạm vi, độ chênh và equal cases theo BRD.
- Sinh hai count và hai seeded layouts có độ dễ nhìn tương đương; không dùng density, size, background hoặc position làm clue.
- Reuse shared comparison renderer khi phù hợp nhưng chỉ giữ trạng thái Explore trong memory, không ghi lesson progress hay lịch sử chơi.
- Thêm validator, audio templates và tests sinh tối thiểu 200 exercise hợp lệ.

## Capabilities

### New Capabilities

- `explore-quantity-compare-game`: Deterministic quantity comparison game, fairness validation, UI and level progression.

### Modified Capabilities


## Impact

- Depends on `add-explore-foundation` and approved/countable sprite metadata.
- `mobile`: Explore compare controller and shared `compare_tap` visual reuse where contract-compatible.
- `mobile`: local comparison generator/config/validator, approved sprite dependencies and deterministic tests để chơi offline.
- `kido-server`: optional public config/asset manifest only; no child play persistence.
