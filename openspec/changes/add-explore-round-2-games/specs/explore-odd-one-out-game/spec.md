## Purpose

Defines "Ai lạc đàn?" (`odd_one_out`), the offline classification game in which a child taps the one token in a 2×2 to 2×4 grid that differs from all the others on exactly one dimension, with a generator and independent validator that guarantee a single, unambiguous odd token and hints that never reveal it.

## ADDED Requirements

### Requirement: Deterministic local odd-one-out puzzle
The game SHALL generate every puzzle locally from a versioned generator and a random seed, with no network request and only bundled dependencies (shape primitives and the memory-match card pool). A puzzle SHALL declare its level, target dimension (`color`, `shape`, `size`, `count` or `theme`) and its grid of tokens, each token carrying everything the renderer needs (kind, shape, colour code and hex, scale, dot count, glyph, theme, asset id and a Vietnamese label). Replaying the same level and seed SHALL produce a byte-identical envelope once `variantKey`/`bucketKey` are stripped, and the validator SHALL reject any envelope that does not replay.

#### Scenario: Puzzle starts in airplane mode
- **WHEN** the child opens `odd_one_out` with no connectivity
- **THEN** a fresh puzzle is generated, validated and shown without an API request

#### Scenario: Same seed is replayed
- **WHEN** the generator receives the same level and seed twice
- **THEN** both envelopes are byte-identical after `variantKey` and `bucketKey` are removed

### Requirement: Single-odd rule on the target dimension only
Every puzzle SHALL contain exactly one token whose value on the target dimension appears on no other cell while every other cell shares one value there, and that token SHALL be the recorded answer. No token, the answer included, SHALL be unique on any other dimension; only the level's declared noise attribute may vary at all, and every other attribute SHALL be identical across the grid. All tokens in a grid SHALL be of one kind (shapes, dot groups or objects) matching the target dimension. The validator SHALL prove these rules independently of the generator and SHALL reject a moved answer, a second token odd on the target dimension, a token unique on a non-target dimension, or a mixed-kind grid.

#### Scenario: Generated puzzle is validated
- **WHEN** any generated puzzle is checked
- **THEN** `oddTokensOn(cells, target)` returns only the answer id and `oddTokensOn(cells, other)` is empty for every other dimension

#### Scenario: A second token is made odd
- **WHEN** a common cell is edited to carry the odd token's value on the target dimension
- **THEN** the validator rejects the puzzle

#### Scenario: A stray unique attribute is introduced
- **WHEN** a common cell is edited so it alone differs on a non-target attribute (for example one small token in a colour puzzle)
- **THEN** the validator rejects the puzzle

### Requirement: Five-level progression with bounded noise
The game SHALL define five levels: L1 a 2×2 grid on `color`; L2 a 2×2 grid on `shape` or `theme`; L3 a 2×3 grid on `shape` or `color` with noise; L4 a 2×3 grid on `size` or `count`; L5 a 2×4 grid on `shape`, `color` or `theme` with noise. On clean levels every non-target attribute SHALL be identical. On noise levels the non-target attribute (colour for a shape target, shape for a colour target, object identity for a theme target) SHALL take two or three values and every value SHALL appear on at least two cells so the noise can never create a second odd token. A run SHALL play one board per level from L1 to L5 without streaks, countdowns or a lose state.

#### Scenario: L3 shape puzzle with colour noise
- **WHEN** an L3 puzzle targets `shape`
- **THEN** the cells show at least two colours, each colour sits on at least two cells, and one cell alone carries a different shape

#### Scenario: L1 colour puzzle stays clean
- **WHEN** an L1 puzzle is generated
- **THEN** every cell has the same shape and full scale and exactly one cell has a different colour

### Requirement: Readable token rules
Colours SHALL be limited to the colour-blind-safe trio orange, blue and green with fixed hex values. Shapes SHALL be circle, square, triangle and diamond, and square and diamond SHALL never appear in the same grid. A `size` puzzle SHALL use exactly two scales whose ratio is at least 1.5 (one small token among large ones or one large among small ones); every other puzzle SHALL render all tokens at full scale. A `count` puzzle SHALL use dot groups of at most four dots with the odd group exactly one dot more or fewer than the others. A `theme` puzzle SHALL draw objects only from the bundled memory-match assets of the far categories fruit, animal and transport; the odd object SHALL be the only picture appearing once, common objects MAY repeat, and every common object SHALL appear on at least two cells.

#### Scenario: Foreign colour is injected
- **WHEN** a cell is edited to a colour outside orange/blue/green
- **THEN** the validator rejects the puzzle

#### Scenario: Five-dot group is injected
- **WHEN** a `count` puzzle is edited so a cell holds five dots
- **THEN** the validator rejects the puzzle

#### Scenario: Nature object is injected into a theme puzzle
- **WHEN** the odd object is replaced by a bundled asset of a theme other than fruit, animal or transport
- **THEN** the validator rejects the puzzle

### Requirement: Tap feedback that stresses the shared rule
Tapping the odd token SHALL make it jump out of the grid while every other cell nods together, mark it solved, make Đô Đô (`ExploreMascot`) cheer and report `onAnswer(true)`. Tapping any other token SHALL shake that cell, dim and lock it for the rest of the exercise, and report `onAnswer(false)`; the remaining cells SHALL stay live with no count reset or lose state. All motion SHALL use the native animation driver and SHALL be skipped when the system requests reduced motion. Every cell SHALL be at least 72pt, shapes SHALL render as views, dot groups through the shared `DotGroup`, and object glyphs as puzzle content only — no emoji is used as a UI icon or as the mascot. The renderer SHALL NOT carry its own prompt-replay control and SHALL NOT persist or report anything beyond `onAnswer`.

#### Scenario: Odd token is tapped
- **WHEN** the child taps the answer cell
- **THEN** it jumps and scales up while the other cells dip together, the cell shows a check badge, Đô Đô cheers and `onAnswer(true)` is called once

#### Scenario: Common token is tapped
- **WHEN** the child taps a cell that is not the answer
- **THEN** the cell shakes, dims and locks, `onAnswer(false)` is called and the other cells remain tappable

#### Scenario: Reduced motion is enabled
- **WHEN** the system reports reduced motion
- **THEN** taps update state, sound and `onAnswer` as usual without the jump, nod or shake animation

### Requirement: Support levels that narrow without revealing
The renderer SHALL derive hint cells from the pure helper `oddOneOutSupportCells(cells, answerId, triedIds, supportLevel)`. At support level 1 the helper SHALL outline one pair of common cells with a thin teal border (preferring cells not yet tried). At support level 2 it SHALL additionally dim and lock up to two further cells that are certainly common, never already tried and never part of the outlined pair. The answer SHALL never be in either list at any support level, so the child always has to choose between the answer and at least one live common cell while any remain. Đô Đô SHALL show the `think` mood while support is active.

#### Scenario: Support level 1 after two misses
- **WHEN** the play screen passes `supportLevel` 1
- **THEN** exactly two common cells are outlined, nothing is dimmed and the answer cell is unchanged

#### Scenario: Support level 2 on a 2×4 grid
- **WHEN** the play screen passes `supportLevel` 2 with four cells already tried
- **THEN** at most two untried common cells are dimmed and locked and the answer cell is neither outlined nor dimmed

### Requirement: Dimension variety and best-effort audio
The round-variety bucket of a puzzle SHALL be its target dimension and its variant identity SHALL be the position-agnostic multiset of its tokens, so two grids differing only in cell order are the same variant. The declared buckets per level SHALL equal the level's dimensions and every declared dimension SHALL reach the child in at least 20% of 300 chained one-exercise rounds. The prompt SHALL be the on-screen text "Bạn nào khác với các bạn còn lại?" taken from the shared phrase table, its audio SHALL reference the matching phrase key, and a missing clip SHALL never block play.

#### Scenario: One-exercise rounds at L5
- **WHEN** 300 chained one-exercise rounds are requested at L5 with the play screen's exclusion window, last bucket and rotation
- **THEN** `shape`, `color` and `theme` each make up at least 20% of the served puzzles

#### Scenario: Prompt clip is not bundled
- **WHEN** the odd-one-out phrase clip is absent from the bundled pack
- **THEN** the prompt is still shown on screen and the puzzle is fully playable in silence

### Requirement: Conformance checks
The contract SHALL be enforced by `mobile/scripts/verify-explore-odd-one-out-contracts.cjs` (`npm run test:explore-odd-one-out`: at least 200 seeds per level, replay equality, the single-odd and noise rules, palette/shape/size/count/theme rules, tamper rejection, support never revealing, 300 one-exercise rounds per level and renderer presentation rules) and by `kido-server/src/modules/explore/explore.odd-one-out.spec.ts` (corpus conformance, noise levels, tamper rejection, support helper, server catalog mirror and renderer source rules).

#### Scenario: Contract script runs
- **WHEN** `npm run test:explore-odd-one-out` runs in `mobile/`
- **THEN** it exits successfully only if every rule above holds for the current generator, validator and renderer

#### Scenario: Server spec runs
- **WHEN** `npx jest src/modules/explore/explore.odd-one-out.spec.ts` runs in `kido-server/`
- **THEN** the mobile modules pass the same rules and the server catalog entry mirrors the bundled game configuration
