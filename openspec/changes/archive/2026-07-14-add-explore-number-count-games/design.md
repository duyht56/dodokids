## Context

Hai game Phase A dùng số và asset có thể đếm. Number game chủ yếu thao tác number-card; count game cần clone một sprite và layout không overlap. Cả hai sinh và validate exercise 100% trên thiết bị với `runtimeMode=local`, không tạo lesson activity, question bank hay lịch sử chơi. Tuy nhiên catalog giữ `offlineCapable=false` cho đến khi approved Vietnamese audio pack cho số/đếm `0–50` được bundled; không dùng placeholder im lặng để quảng bá offline sai.

## Goals / Non-Goals

**Goals:** deterministic modes/levels đúng BRD, distractor có ý nghĩa, layout ổn định trên phone/tablet và 200-case conformance cho mỗi game.

**Non-Goals:** adaptive level, phạm vi trên 50, scene image sinh tự do hoặc thay đổi canonical lesson `count_tap` payload.

## Decisions

### D1 — Hai game definitions, chung number utilities

`number_explorer` và `tap_count` có config/generator/validator riêng nhưng share `Range`, seeded shuffle, number-card primitive, distractor builder và answer-option validator. Không reuse lesson seed generation vì lifecycle và payload khác.

### D2 — Mode/level là allowlist rõ ràng

Config map level sang mode, range, option count, sequence length, layout density và allowed asset tags. Generator chọn mode chỉ từ allowlist; validator tái tính đáp án từ params thay vì tin `correctAnswer` đã sinh.

### D3 — Distractor gần mục tiêu nhưng không ambiguous

Number distractor ưu tiên `target ± 1/2`, trong range, unique và loại target. Before/after/missing/sequence validator kiểm tra ordinal relation và duy nhất đáp án. Nếu pool không đủ, generator retry bounded rồi báo error code thay vì nới rule.

### D4 — Layout seed thuộc exercise params

Count game chọn một canonical sprite, count và layout seed. Layout engine dùng normalized coordinates, minimum separation/tap target và deterministic fallback grid. L5 thêm distractor sprite nhưng target identity/audio phải rõ; validator kiểm tra target count và non-overlap tại các viewport chuẩn.

### D5 — UI reuse ở mức primitive

Number mode dùng option cards/sort-row primitives; count mode reuse clone/layout visual từ count-tap nếu không kéo theo lesson callbacks. Explore renderer chỉ báo try/hint/result cho play shell trong memory và không tự advance lesson hoặc gửi outcome ra ngoài thiết bị.

### D6 — Offline capability bị gate bởi approved audio

Generator, validator, number-card primitive và countable sprite pool chạy local. Audio instruction dùng stable template keys ngay từ đầu, nhưng khi clip tương ứng chưa bundled thì dependency manifest đánh dấu audio `remote` và `offlineCapable=false`. Chỉ đổi sang `bundled`/`offlineCapable=true` sau khi có pack `0–50`, asset verification và offline playback tests; không dùng runtime TTS không kiểm soát.

## Risks / Trade-offs

- [Rải 20 vật khó đếm] → density caps, grouped layout ở L4 và viewport conformance snapshots.
- [Asset không countable] → bắt buộc approved `countable=true`, single-object/transparent/background-free tags.
- [Distractor quá dễ/khó] → level-specific distance policy và distribution tests.

## Migration Plan

1. Land shared utilities/tests, rồi đăng ký `number_explorer` internal-only.
2. Canary number modes L1–L3; mở L4–L5 sau representative QA.
3. Đăng ký `tap_count`, canary phone/tablet và từng density band.
4. Enable hai game Phase A online với local generation; bật offline flag riêng sau khi approved audio pack `0–50` vượt verification.

## Open Questions

- L5 count game dùng tối đa bao nhiêu distractor objects sẽ được chốt bằng usability test; validator giữ limit configurable.
