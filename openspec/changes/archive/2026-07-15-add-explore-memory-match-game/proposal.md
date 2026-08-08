## Why

Lật thẻ tìm cặp là game Phase A duy nhất cần interaction state machine riêng thay vì activity lesson hiện có. Tách riêng giúp triển khai và kiểm thử accessibility, shuffle determinism và board sizing mà không khóa các game số đơn giản.

## What Changes

- Thêm game lật thẻ 2/3/4/6/8 cặp theo L1–L5, không countdown và không trạng thái thua.
- Chọn asset khác nhau từ approved memory-eligible pool, nhân đôi và shuffle bằng seeded PRNG.
- Thêm board responsive, luật lật tối đa hai thẻ, feedback match/mismatch nhẹ và hoàn thành tự nhiên.
- Validator từ chối duplicate identity ngoài cặp, asset quá giống ở level thấp, background hoặc asset không đủ rõ.
- Thêm tests replay shuffle, board boundaries và tối thiểu 200 exercise hợp lệ.

## Capabilities

### New Capabilities

- `explore-memory-match-game`: Seeded memory board generator, validator, interaction state machine and level progression.

### Modified Capabilities


## Impact

- Depends on `add-explore-foundation` and approved sprite eligibility tags.
- `mobile`: local memory generator/validator, approved asset bundle, renderer and transient run integration for offline play.
- `kido-server`: optional public config/asset-manifest delivery; no play-history endpoint and no new image generation at runtime.
