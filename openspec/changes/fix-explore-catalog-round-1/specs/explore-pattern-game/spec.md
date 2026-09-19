## MODIFIED Requirements

### Requirement: Unique missing answer
The generator SHALL hide only a position with sufficient context, and the independent validator SHALL enumerate permitted candidates and prove exactly one valid answer. Ambiguous or zero-answer sequences MUST NOT be delivered. Answer options SHALL come only from the puzzle's own vocabulary: for a cycle grammar the options are exactly the token identities the sequence is built from (two for AB/AAB/ABB, three for ABC) and never a shape, colour or object absent from the sequence; for a quantity or numeric progression the options are the answer plus near values from the grammar's range that are not already visible in the sequence. Option order SHALL be a seeded shuffle so the answer has no fixed position, and the validator SHALL reject options outside the vocabulary, options repeating a visible progression value, a cycle that does not offer its whole vocabulary, and an option order that differs from the seeded replay.

#### Scenario: Sequence is ambiguous
- **WHEN** more than one allowed token can complete the hidden position under the declared grammar
- **THEN** validation fails

#### Scenario: Option is a token absent from the sequence
- **WHEN** a cycle exercise offers a shape, colour or object that does not appear in its sequence
- **THEN** validation fails, because the child could eliminate it without reading the rule

#### Scenario: Progression option repeats a visible value
- **WHEN** a numeric or dot exercise offers a value that is already visible in the sequence
- **THEN** validation fails

#### Scenario: Options are replayed by seed
- **WHEN** the same seed is generated twice, or the validator replays the seeded option order
- **THEN** the options appear in the same order both times, and across a corpus the answer occupies every option position

### Requirement: Pattern completion interaction
The renderer SHALL show the sequence and missing slot with approved shape/color/number/dot primitives, then accept a tap or configured drag of one answer token. Both interaction modes SHALL submit the same semantic token identity. The sequence SHALL always render on a single line: token size is fitted to the available width (`clamp(min(52, (innerWidth − gap×(n−1))/n − cellPad), 34, 52)`) and the sequence row never wraps, while the options row may wrap. The mascot beside the question SHALL be Đô Đô (`ExploreMascot`), never an emoji, and the renderer SHALL NOT carry its own replay control (the play screen's global replay control reads the question again). A wrong pick SHALL settle for its feedback beat before another pick is accepted, and the pending reset SHALL be cleared when a new answer lands or the renderer unmounts, so a correct answer is never wiped by an earlier wrong pick's reset.

#### Scenario: Correct token is dragged
- **WHEN** the child drags the uniquely correct token into the empty slot
- **THEN** the renderer confirms the pattern and records the same answer identity as tap mode

#### Scenario: Six-token sequence on a phone
- **WHEN** a six-token cycle is shown at a 375pt-wide window
- **THEN** all six cells and the slot fit on one row at a uniform token size of at least 34pt and no cell wraps to a second line

#### Scenario: Correct pick lands right after a wrong pick
- **WHEN** the child picks a wrong token and then the correct token
- **THEN** the slot keeps showing the correct token and the wrong pick's scheduled reset never clears it

## ADDED Requirements

### Requirement: Per-puzzle spoken question
Every pattern exercise SHALL carry the spoken form of its own question in `audioRefs`: one phrase clip chosen by grammar family (numeric, quantity, cycle) and slot position (last token vs. earlier blank) — `Số nào tiếp theo?` / `Số nào còn thiếu?`, `Nhóm tiếp theo có mấy chấm?` / `Ô trống có mấy chấm?`, `Tiếp theo là gì nhỉ?` / `Ô trống là hình gì?`. The on-screen `promptVi` SHALL be the transcript of that clip verbatim, derived from the same phrase id, and the validator SHALL reject an exercise whose prompt or audio refs do not match its family and slot. The generic instruction clip (`pattern_find_generic`) remains in the bundled inventory but is no longer the per-puzzle prompt. Audio stays best-effort: a missing clip never blocks play.

#### Scenario: Numeric blank at the end
- **WHEN** a numeric progression hides its last token
- **THEN** `promptVi` is `Số nào tiếp theo?` and `audioRefs` is exactly the `pattern_next_number` phrase key

#### Scenario: Dot blank in the middle
- **WHEN** a quantity progression hides a token that is not the last
- **THEN** `promptVi` is `Ô trống có mấy chấm?` and `audioRefs` is exactly the `pattern_blank_dots` phrase key

#### Scenario: Approved clips are bundled
- **WHEN** the bundled audio registry is inspected
- **THEN** the five pattern question clips and the shared `number_which_missing` clip resolve to bundled files, and the mobile and pipeline phrase inventories list the same pattern phrases with identical transcripts
