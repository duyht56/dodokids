## ADDED Requirements

### Requirement: Support level visuals
The number renderer SHALL accept the play screen's support level (0, 1 or 2) and change only what is shown, never the exercise: the generator, validator, params, answer and replay-by-seed output MUST stay byte-identical at every support level. At level 1, selection modes (hear-and-select, match-sample, before-or-after, missing-number) SHALL draw a card-scale quantity anchor under every numeral on the option cards and on the sample or reference card — a mini ten-frame for values up to 10, ten-rods plus a ones frame above 10 — so the numeral is tied to an amount; the order mode SHALL highlight the next empty slot and say so in its on-screen hint. At level 2, in addition to the level-1 visuals, the renderer SHALL narrow the tappable set to the answer plus exactly one distractor: every other card is dimmed and locked, the kept distractor is chosen deterministically from `randomSeed` (in the order mode re-drawn per step from the seed and the step index, among cards not yet placed), and the answer itself MUST NOT receive any mark of its own. The hear-and-select listen button SHALL remain at every level, support visuals SHALL work without any audio clip, and nothing about the support level SHALL be persisted.

#### Scenario: Level 1 in a selection mode
- **WHEN** the play screen passes support level 1 for a match-sample exercise with sample 7 and options 6, 7, 8, 9
- **THEN** the sample card and each of the four option cards show a quantity anchor with 7, 6, 7, 8 and 9 filled cells respectively, all four options stay tappable, and no card is marked as the answer

#### Scenario: Level 1 anchor above ten
- **WHEN** support level 1 is shown for an option card with the value 23
- **THEN** its anchor shows two ten-rods and a ones frame with three filled cells

#### Scenario: Level 1 in the order mode
- **WHEN** the play screen passes support level 1 for an order exercise and the child has placed two cards
- **THEN** the third slot is highlighted, the on-screen hint names the highlighted slot as the place for the next number, and every unplaced card stays tappable

#### Scenario: Level 2 in a selection mode
- **WHEN** the play screen passes support level 2 for a selection exercise with four options
- **THEN** only the answer and one distractor accept taps, the other two cards are dimmed and locked, the answer card looks the same as the kept distractor, and tapping the kept distractor is reported as incorrect as usual

#### Scenario: Level 2 kept distractor is stable
- **WHEN** the same exercise (same `randomSeed`) is rendered at support level 2 twice, or re-rendered after a tap
- **THEN** the same distractor is kept both times

#### Scenario: Level 2 in the order mode
- **WHEN** the play screen passes support level 2 for a five-card order exercise and the child has placed one card
- **THEN** among the four unplaced cards only the next number and one seed-chosen other accept taps, the rest are dimmed and locked, and the set is re-drawn when the next card is placed

#### Scenario: Support visuals without audio
- **WHEN** support level 1 or 2 is shown and the hint or number-name clips are not bundled
- **THEN** the anchors, slot highlight and narrowed set still appear and play continues silently

#### Scenario: Support level does not touch the exercise
- **WHEN** an exercise is replayed from its seed while any support level is active
- **THEN** the generated envelope is byte-identical to the one generated at support level 0
