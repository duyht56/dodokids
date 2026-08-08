## Context

The normal `number_bond` run has ten authored slots. Product clarification narrows the construct to repeated composition/decomposition of two benchmark wholes: 5 and 10. The child should not invent both parts. One part is an anchor authored by the system, and the child physically completes its complement.

## Goals

- Slots 1–5 always use whole 5; slots 6–10 always use whole 10.
- Every exercise starts with one positive prefilled part and one empty editable room.
- The child adds by tapping the editable room itself; its default count is 0.
- Completion still requires the concrete relationship reveal and recombination.
- The board remains readable on a phone without overlapping controls.

## Decisions

### D1 — Two fixed benchmark wholes

The ten-slot policy is fixed:

```text
slots 1–5   total=5
slots 6–10  total=10
```

Each slot also declares a positive `prefilledPart` strictly smaller than its total. At least four distinct anchors appear in each five-slot block. Slot selection is content-authored and independent of child performance or history.

### D2 — One locked part and one editable complement

The generator emits a `split_group` exercise with:

```text
prefilledPart >= 1
targetPart = total - prefilledPart >= 1
model.operands = [prefilledPart, targetPart]
```

The first room is rendered as `Có sẵn` and cannot receive or lose objects. The second room is rendered as `Bé thêm`, starts at 0 and is itself the increment control. Each tap adds one object up to `total`. There is no separate add, subtract or reset button. If an overfilled answer is checked, the editable room resets to 0 so the child can count again. The UI never displays the complement or a remaining count.

### D3 — Child-authored answer and explicit check

The child decides when the tappable room is ready and presses the single `Kiểm tra` button. A low answer receives `chưa đủ` and can continue counting. A high answer receives neutral coaching and resets the editable room to 0; neither message reveals the complement. Only the exact complement reveals `N gồm A và B`.

The relationship reveal has no timer and remains until `Gộp lại`. Recombination opens a second untimed review showing the whole and the statement `A và B gộp lại thành N`. Only an explicit `Tiếp tục` emits the correct callback and lets the shell advance.

### D4 — Compact phone layout

The board uses a short total header, two equal visual rooms and one full-width check button in normal document flow. The locked room uses warm orange styling; the tappable editable room uses green styling and an empty-state `Chạm để thêm lá` cue. Labels describe ownership (`Có sẵn`, `Bé thêm`) rather than asking the child to select a room.

### D5 — Version and validation

The v4 validator rejects normal-run envelopes unless the slot total is exactly 5 or 10, the prefilled part matches the first model operand, the complement is positive and deterministic replay reproduces the envelope. v3 envelopes are not interpreted as v4.

## Risks / Trade-offs

- Repeated tapping is the manipulation, but the child must decide when to stop; no target or remaining count is shown.
- Five rounds of whole 5 necessarily repeat one anchor; the plan exhausts all four positive anchor positions before repeating.
- Phone layout still needs device review with whole 10 because object tiles can wrap to multiple rows.

## Rollback

Restore the coordinated v3 generator/validator/config/manifest registration and renderer. No data migration or persisted cleanup is required.
