## Why

Xưởng luyện nét cần renderer và cách đánh giá đường đi hoàn toàn mới nên được BRD xếp Phase C. Tách riêng giúp khóa chặt ranh giới sư phạm: tracing chữ chỉ luyện vận động tinh/làm quen hình dạng, không biến thành dạy đọc hay đánh giá literacy.

## What Changes

- Thêm vector-path pack versioned cho nét, đường đi, hình, số 0–9, Latin A–Z/a–z và glyph tiếng Việt đặc thù.
- Thêm tracing renderer với ordered strokes, start/direction cues, tolerance corridor, snap/help và partial recovery không reset toàn bộ.
- Thêm progression L1–L5 bằng độ phức tạp path, cue density và tolerance; chữ có dấu hoàn thành thân chữ trước dấu.
- Chỉ giữ stroke points, hint và evaluator state trong memory của lượt hiện tại; thoát game sẽ hủy toàn bộ và không gửi dữ liệu chẩn đoán.
- Thêm path validator, geometric tests, representative device tests và wording guardrails không suy diễn năng lực đọc.

## Capabilities

### New Capabilities

- `explore-tracing-workshop`: Versioned glyph/path pack, tracing renderer, evaluator, progression and pedagogical boundaries.

### Modified Capabilities


## Impact

- Depends on `add-explore-foundation` but can ship after Phase A/B.
- `mobile`: new SVG/path tracing engine and gesture handling.
- `mobile`: bundled/installed path pack, local evaluator and transient renderer state; offline chỉ bật khi toàn bộ path/audio dependency có sẵn.
- `kido-server`: optional public path/config manifest delivery; no attempt diagnostics or child play persistence.
- Requires one-time reviewed vector content pack; no periodic lesson production.
