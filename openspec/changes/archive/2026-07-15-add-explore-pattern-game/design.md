## Context

Pattern exercise phải có một đáp án suy ra duy nhất từ grammar và chỉ kiểm tra số thuộc tính phù hợp level. Existing sort/select UI có thể reuse primitive nhưng không có grammar/uniqueness contract.

## Goals / Non-Goals

**Goals:** versioned grammar, deterministic token generation, uniqueness proof và child-friendly completion UI.

**Non-Goals:** free-form visual sequences, multiple-correct creative continuation hoặc semantic world-knowledge patterns.

## Decisions

### D1 — Grammar AST thay vì lưu chuỗi mẫu thủ công

`PatternGrammar` mô tả cycle tokens hoặc numeric progression, repeat count, hidden index policy và allowed attributes. Grammar/token primitives được đóng gói để generator/validator chạy local/offline; validator enumerate allowed candidates tại hidden slot và yêu cầu đúng một candidate.

### D2 — Token identities tách semantic và presentation

Token là primitive identity (shape/color/number/dot count) cộng display metadata. Level config giới hạn số axes thay đổi; background, absolute position và size không thuộc grammar trừ khi một future approved grammar khai báo explicit.

### D3 — Missing slot không đặt ở vị trí vô nghĩa

Hidden index phải có đủ context trước/sau theo grammar và không luôn ở cuối. Distractors lấy từ same token vocabulary, unique và không tạo đáp án thứ hai.

### D4 — One renderer, two controlled interactions

Default tap option; drag-to-slot được enable khi motor complexity phù hợp. Cả hai commit cùng answer token ID và không thay đổi construct.

## Risks / Trade-offs

- [Pattern ambiguous] → candidate enumeration uniqueness validator và fail closed.
- [Visual attribute làm clue] → token schema allowlist và shared surfaces/sizing.
- [Grammar expansion gây regression] → version each grammar and conformance corpus.

## Migration Plan

1. Implement AST/materializer/validator with AB/AAB/ABB/ABC.
2. Add quantity and numeric step grammars after conformance tests.
3. Canary tap interaction, then optional drag config.
4. Disable problematic grammar independently without disabling game.

## Open Questions

- Exact mapping grammar-to-level will remain config-driven until representative child testing is complete.
