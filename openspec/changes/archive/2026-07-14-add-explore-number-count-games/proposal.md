## Why

Phase A cần hai game reuse cao để chứng minh nền tảng Khám phá có thể sinh nhiều bài hợp lệ mà không cần question bank: Khám phá số và Chạm và đếm. Hai game dùng chung number-card, phạm vi số, distractor và primitive/sprite counting nên phù hợp triển khai cùng một change.

## What Changes

- Thêm game Khám phá số với các mode nghe-chọn số, ghép số giống mẫu, trước/sau, số còn thiếu và sắp xếp 3–5 thẻ.
- Thêm game Chạm và đếm với seeded non-overlapping layout, tap từng vật rồi chọn thẻ số tương ứng.
- Cấu hình L1–L5 theo BRD, bao gồm phạm vi 1–50 cho number game và phạm vi 1–20/two-object distractor cho count game.
- Thêm generator, validator độc lập, audio templates và boundary/property tests chứng minh ít nhất 200 exercise hợp lệ mỗi game.
- Chỉ dùng number-card primitive và approved countable object sprite; layout hay distractor không được tạo clue ngoài ý muốn.

## Capabilities

### New Capabilities

- `explore-number-game`: Generator, validator, UI và progression cho game Khám phá số.
- `explore-count-game`: Generator, validator, seeded layout và UI cho game Chạm và đếm.

### Modified Capabilities


## Impact

- Depends on `add-explore-foundation`.
- `mobile`: two game renderers/controllers, number-card and count layout reuse.
- `mobile`: local generators/validators and bundled number-card/countable-asset dependencies. Until the approved Vietnamese number/count audio pack `0–50` is bundled, both games remain `offlineCapable=false` even though exercise generation is local.
- `kido-server`: optional public config/asset-manifest delivery only; no play-history endpoints.
- Reuses canonical primitive/object-sprite identities; no per-exercise image or lesson content is added.
