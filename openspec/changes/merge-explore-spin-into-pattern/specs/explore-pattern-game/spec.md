## MODIFIED Requirements

### Requirement: Supported pattern grammars
The game SHALL support distinct, coherent grammar FAMILIES — `shape_cycle` (a repeating cycle over shapes with a single fixed colour), `color_cycle` (a repeating cycle over colours with a single fixed shape), `object_cycle` (a repeating cycle over distinct emoji objects), `quantity` (increasing/decreasing dot groups), `numeric` (numeric sequences with step 1 or 2) and `rotation` (one arrow of one colour that turns a quarter turn, clockwise or counter-clockwise, at every step) — with the AB, AAB, ABB and ABC cycle templates for the cycle families. Every exercise SHALL identify a versioned grammar, its family, and a materialized sequence, and SHALL declare a `mode` discriminator that is either `complete` (a hidden slot to fill) or `fix_error` (one rule-breaking element to spot). The versioned generator and validator SHALL be `pattern-finder-v6` and `pattern-finder-validator-v5`, mirrored in the kido-server explore registry; Explore stores no play history, so byte-identical replay-by-seed need hold only within a version.

#### Scenario: AB pattern is materialized
- **WHEN** two tokens of a family and an AB grammar are selected
- **THEN** the visible sequence follows alternating A/B positions except for the single hidden slot (or the one rule-breaking slot in `fix_error`)

#### Scenario: Colour rule is materialized
- **WHEN** a `color_cycle` grammar with template AB is selected
- **THEN** every token is the same shape and the visible sequence alternates between two colours except for the single hidden slot (or the one rule-breaking slot in `fix_error`)

#### Scenario: Shape rule is materialized
- **WHEN** a `shape_cycle` grammar with template AB is selected
- **THEN** every token is the same colour and the visible sequence alternates between two shapes except for the single hidden slot (or the one rule-breaking slot in `fix_error`)

#### Scenario: Rotation rule is materialized
- **WHEN** a `rotation` grammar is selected with a start direction and a turn of +90° or −90°
- **THEN** every token is the same arrow in the same colour and each position points a quarter turn further than the one before it, except for the single hidden slot

#### Scenario: Version is bumped
- **WHEN** the bundled and server registry describe `pattern_finder`
- **THEN** both report `generatorVersion` `pattern-finder-v6` and `validatorVersion` `pattern-finder-validator-v5`, and the dependency manifest lists generator `6`, validator `5` and config `6`

### Requirement: Level-bounded attributes
Each exercise SHALL read exactly ONE attribute so the child forms one coherent rule: a `shape_cycle` varies shapes over a single colour, a `color_cycle` varies colours over a single shape, an `object_cycle` varies distinct sprites, progressions vary a number/quantity, and a `rotation` row varies only the direction of one arrow over a single colour. Distinct token identities within an exercise SHALL be visually distinct on that attribute, and the colour palette SHALL be colour-blind-friendly so a colour rule stays legible. Background, absolute position and incidental size MUST NOT act as answer clues; all tokens SHALL render at one uniform size.

#### Scenario: Colour rule keeps one shape
- **WHEN** a `color_cycle` exercise is generated
- **THEN** every token (sequence and options) shares one shape, the distinct identities use distinct colours from the colour-blind-safe palette, and no token carries a size or position clue

#### Scenario: Rotation keeps one arrow
- **WHEN** a `rotation` exercise is generated
- **THEN** every token (sequence and options) is the same arrow in one colour at one size, and the tokens differ only in the direction they point

#### Scenario: Unintended size difference
- **WHEN** equivalent grammar tokens render at different sizes without size being the tested attribute
- **THEN** the exercise fails presentation validation

### Requirement: Pattern completion interaction
The renderer SHALL show the sequence and missing slot with approved shape/color/number/dot/object/arrow primitives, then accept a tap or configured drag of one answer token. The arrow primitive SHALL be drawn with views (no emoji and no image asset), so rotation boards run offline. Both interaction modes SHALL submit the same semantic token identity. The sequence SHALL always render on a single line: token size is fitted to the available width (`clamp(min(52, (innerWidth − gap×(n−1))/n − cellPad), 34, 52)`) and the sequence row never wraps, while the options row may wrap. The mascot beside the question SHALL be Đô Đô (`ExploreMascot`), never an emoji, and the renderer SHALL NOT carry its own replay control (the play screen's global replay control reads the question again). A wrong pick SHALL settle for its feedback beat before another pick is accepted, and the pending reset SHALL be cleared when a new answer lands or the renderer unmounts, so a correct answer is never wiped by an earlier wrong pick's reset.

#### Scenario: Correct token is dragged
- **WHEN** the child drags the uniquely correct token into the empty slot
- **THEN** the renderer confirms the pattern and records the same answer identity as tap mode

#### Scenario: Six-token sequence on a phone
- **WHEN** a six-token cycle is shown at a 375pt-wide window
- **THEN** all six cells and the slot fit on one row at a uniform token size of at least 34pt and no cell wraps to a second line

#### Scenario: Six arrows on a phone
- **WHEN** a six-token `rotation` row is shown at a 375pt-wide window
- **THEN** all six arrows fit on one row at the same fitted size, each drawn with views and pointing in a direction a child can tell apart

#### Scenario: Correct pick lands right after a wrong pick
- **WHEN** the child picks a wrong token and then the correct token
- **THEN** the slot keeps showing the correct token and the wrong pick's scheduled reset never clears it

### Requirement: Per-puzzle spoken question
Every pattern exercise SHALL carry the spoken form of its own question in `audioRefs`: one phrase clip chosen by grammar family (numeric, quantity, cycle, rotation) and slot position (last token vs. earlier blank) — `Số nào tiếp theo?` / `Số nào còn thiếu?`, `Nhóm tiếp theo có mấy chấm?` / `Ô trống có mấy chấm?`, `Tiếp theo là gì nhỉ?` / `Ô trống là hình gì?`, and for `rotation` at either position `Mũi tên ở ô trống quay về hướng nào nhỉ?` (the existing `spin_which` clip). The on-screen `promptVi` SHALL be the transcript of that clip verbatim, derived from the same phrase id, and the validator SHALL reject an exercise whose prompt or audio refs do not match its family and slot. The generic instruction clip (`pattern_find_generic`) remains in the bundled inventory but is no longer the per-puzzle prompt. Audio stays best-effort: a missing clip never blocks play.

#### Scenario: Numeric blank at the end
- **WHEN** a numeric progression hides its last token
- **THEN** `promptVi` is `Số nào tiếp theo?` and `audioRefs` is exactly the `pattern_next_number` phrase key

#### Scenario: Dot blank in the middle
- **WHEN** a quantity progression hides a token that is not the last
- **THEN** `promptVi` is `Ô trống có mấy chấm?` and `audioRefs` is exactly the `pattern_blank_dots` phrase key

#### Scenario: Rotation question
- **WHEN** a `rotation` exercise hides its fifth or sixth arrow
- **THEN** `promptVi` is `Mũi tên ở ô trống quay về hướng nào nhỉ?` and `audioRefs` is exactly the `spin_which` phrase key

#### Scenario: Approved clips are bundled
- **WHEN** the bundled audio registry is inspected
- **THEN** the five pattern question clips, the `spin_which` clip and the shared `number_which_missing` clip resolve to bundled files, and the mobile and pipeline phrase inventories list the same pattern phrases with identical transcripts

## ADDED Requirements

### Requirement: Rotation family at level 3
The `rotation` family SHALL be served only at level 3, beside `object_cycle` and `color_cycle`, as its own round-variety bucket. A `rotation` exercise SHALL be a six-token row (indices 0–5) whose hidden slot sits at index 4 or 5, so that all four directions are visible and the answer repeats the direction at index 0 or 1 respectively. It SHALL offer exactly three options — the answer and two other directions — all of which appear in the visible row, in a seeded order that replays. It SHALL be generated in `complete` mode only: the generator SHALL NOT produce, and the validator SHALL reject, a `rotation` exercise in `fix_error` mode in this version. The independent validator SHALL rebuild the row from its start direction and turn, and SHALL prove that the quarter-turn rule and the repeating group of four both give the same single answer, which equals the recorded answer. The hint SHALL be the existing `pattern_hint_shape` line, and a missing clip SHALL never block play. Levels 4 and 5 SHALL contain no `rotation` exercise.

#### Scenario: Rotation board is served
- **WHEN** a level-3 round is planned
- **THEN** `rotation` is one of its buckets beside `object_cycle`, `color_cycle` and `fix_error`, and each `rotation` board is a six-arrow row with the blank at index 4 or 5 and three options that all appear in the row

#### Scenario: Hidden slot gives the answer away
- **WHEN** a `rotation` exercise hides index 2 or 3, where the answer is the one direction missing from the row
- **THEN** validation fails

#### Scenario: Hidden slot lacks leading context
- **WHEN** a `rotation` exercise hides index 0 or 1, before one full turn of four arrows has been shown
- **THEN** validation fails

#### Scenario: Rotation fix-error is attempted
- **WHEN** a `rotation` exercise declares `mode` `fix_error`
- **THEN** validation fails

#### Scenario: Option outside the row
- **WHEN** a `rotation` exercise offers a direction that does not appear in the visible row, or offers other than three options
- **THEN** validation fails

#### Scenario: Higher levels stay arrow-free
- **WHEN** level 4 or level 5 exercises are generated
- **THEN** none of them uses the `rotation` family

#### Scenario: Rotation conformance
- **WHEN** the pattern conformance suite runs at level 3
- **THEN** at least 200 level-3 exercises generate, validate and replay identically, the `rotation` bucket is reached, every reachable `rotation` variant (4 start directions × 2 turns × 2 hidden slots) is covered, and each `rotation` exercise is proven to have one answer
