## Context

Number bond và arithmetic đều cần một visual math model nhất quán: total, parts, manipulatives và representation transitions. Hai game sinh dữ liệu hoàn toàn từ công thức/ràng buộc và primitive đã đóng gói, nên chạy local/offline; nếu mỗi game tự định nghĩa answer/animation và validator thì construct dễ drift.

## Goals / Non-Goals

**Goals:** exact arithmetic constraints, scaffolding theo level, animation giải thích và shared representations.

**Non-Goals:** symbolic drill không visual, kết quả âm, range >50, timed fluency hoặc adaptive advancement trong change này.

## Decisions

### D1 — Canonical visual equation model

Shared model gồm `operationKind`, operands, result/total, unknownSlot, representation (`objects|dots|ten_frame|number_line|tens_ones`) và animation steps. Validator derives all numeric fields from operands/constraints and rejects inconsistent animation steps.

### D2 — Number bond generator as partition algebra

Chọn total trong range, chọn part A, derive part B=`total-A`; multi-answer mode yêu cầu trẻ tìm distinct partitions và chấp nhận set hợp lệ đã derive, không hard-code một đáp án. `make_10` chỉ dùng total/target 10 theo mode.

### D3 — Arithmetic generator uses bounded constraint solving

Mode add/remove/count-on/make-10/two-or-three-operands có explicit constraints; generator sample bounded rồi validate every intermediate result. Three operands chỉ enabled ở L5 khi config/skill state cho phép; Advanced 50 bắt buộc tens-ones/number-line representation.

### D4 — Animation is deterministic explanation

Local generator tạo semantic steps (`addGroup`, `removeGroup`, `splitGroup`, `moveOnLine`) để mobile áp vào primitives. Không nhận arbitrary animation code từ server. Feedback reveal dùng cùng derived model để tránh đáp án/visual lệch.

### D5 — L4 one-valid partition per exercise

L4 generator derives the complete unordered partition set for validation, but the first renderer can complete one exercise after the child chooses any one valid pair (`completionMode=one_valid`). A future collect-all interaction may reuse the same allowed set without adding persistence or cross-session progress.

### D6 — Audio is capability-gated, not an offline blocker

The design's replay-audio control remains visible with an accessible disabled state until approved local clips resolve through `enable-explore-offline-audio`. Generator, validator, visual explanation and offline gameplay do not depend on server audio or uncontrolled runtime TTS.

## Risks / Trade-offs

- [Representation quá tải nhận thức] → một primary representation/exercise, level allowlist và preschool review.
- [Ba toán hạng mở quá sớm] → config gate tĩnh theo level/parent setting; mặc định tắt ngoài L5 và không dùng lịch sử chơi.
- [Range 50 thành drill trừu tượng] → validator bắt visual tens/ones hoặc line và có thể disable Advanced độc lập.

## Migration Plan

1. Land shared equation model/validators and primitive components.
2. Canary number-bond L1–L3, rồi L4–L5.
3. Canary arithmetic L1–L3; mở L4/L5 và Advanced theo config riêng.
4. Rollback per game/level; shipped generator versions remain testable but no child attempt is retained.

## Open Questions

- L4 multi-answer number-bond UX (collect-all vs one-of-many per exercise) cần prototype; contract hỗ trợ cả hai bằng `completionMode` allowlist.
