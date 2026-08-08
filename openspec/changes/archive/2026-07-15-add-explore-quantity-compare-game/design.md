## Context

Canonical lesson đã có `compare_tap` với one shared object sprite và two counts. Explore có thể reuse visual math nhưng cần generator, fairness checks và session semantics riêng.

## Goals / Non-Goals

**Goals:** sinh more/less/equal đúng level, hai bên chỉ khác số lượng và replay/fairness được kiểm thử.

**Non-Goals:** so sánh kích thước/chiều dài/khối lượng, nhiều loại object giữa hai bên hoặc thay đổi lesson `compare_tap` contract.

## Decisions

### D1 — Shared sprite, symmetric presentation

Exercise lưu một `objectAssetId`, `leftCount`, `rightCount`, `mode`, `correctSide` và independent layout seeds. Hai panel dùng cùng size/surface/padding/density rules. Equal dùng `correctSide=equal` và CTA riêng; không giả lập bằng chọn cả hai bên.

### D2 — Level constraints trực tiếp từ BRD

L1 max 5 và gap >=2; L2 max 10 cho gap 1; L3 max 20; L4 thêm equal; L5 cho layout groups khác nhau nhưng cùng countability. Validator tái tính answer từ counts/mode, check range/gap/equal availability và fairness metrics.

### D3 — Reuse renderer adapter, không reuse lesson lifecycle

Tách `QuantityComparisonBoard` presentational component để `CompareTapActivity` và Explore renderer cùng dùng. Adapter Explore map outcome vào play shell trong memory rồi discard khi thoát; adapter lesson giữ callback hiện tại.

## Risks / Trade-offs

- [Density/arrangement thành clue] → symmetric bounds, randomized side, visual snapshots và fairness validator.
- [Equal khó hiểu] → chỉ mở L4+, audio/icon explicit và test trẻ em trước rollout rộng.
- [Shared component regression lesson] → contract tests cho cả hai adapters.

## Migration Plan

1. Extract presentational board không đổi lesson behavior.
2. Thêm generator/validator và 200-case tests.
3. Canary L1–L3, sau đó L4 equal và L5 alternate grouping.
4. Rollback bằng game flag; lesson compare vẫn hoạt động.

## Open Questions

- Threshold fairness cho occupied-area difference sẽ được calibration bằng screenshot suite, lưu trong validator version.
