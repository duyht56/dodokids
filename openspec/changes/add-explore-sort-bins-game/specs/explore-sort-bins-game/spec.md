## Purpose

Defines "Dọn đồ" (`sort_bins`), the offline classification game in which a child is
shown one item at a time and taps the labelled bin (category) it belongs to — 2–3
categories on one reused `odd_one_out` dimension (`theme`, `color` or `shape`) —
with a generator and an independent validator that guarantee the bins are exactly
the categories present among the items and that the recorded solution sorts every
item into a bin whose category equals its true category, plus support that never
points at a bin at the first level and a tap-a-bin interaction with no drag gesture.

## ADDED Requirements

### Requirement: Deterministic local sort-bins puzzle
The game SHALL generate every puzzle locally from a versioned generator and a random seed, with no network request and only bundled dependencies (the shape primitives and the memory-match object pool). A puzzle SHALL declare its level, its sort dimension (`theme`, `color` or `shape`), its 2–3 category bins (each with an id, a category value and a Vietnamese label) and its ordered queue of items (each item carrying everything the renderer needs: kind, shape, colour code and hex, glyph, theme, asset id, a Vietnamese label and a fixed scale). The category framework SHALL reuse `odd_one_out` — the same `theme`/`color`/`shape` dimensions and its `oddOneOutValueOn` value helper, the colour-blind-safe colour trio, the four shapes with the square/diamond rule, and the bundled memory-match asset pool. Replaying the same level and seed SHALL produce a byte-identical envelope once `variantKey`/`bucketKey` are stripped, and the validator SHALL reject any envelope that does not replay.

#### Scenario: Puzzle starts in airplane mode
- **WHEN** the child opens `sort_bins` with no connectivity
- **THEN** a fresh puzzle is generated, validated and shown without an API request

#### Scenario: Same seed is replayed
- **WHEN** the generator receives the same level and seed twice
- **THEN** both envelopes are byte-identical after `variantKey` and `bucketKey` are removed

### Requirement: Bins are exactly the present categories and the solution is correct
Each item SHALL have a true category, re-derived from the item alone through the reused `oddOneOutValueOn` helper on the sort dimension. Every category present among the items SHALL have at least one item, and the bins SHALL be EXACTLY the set of present categories (same categories, no empty bin, no item without a bin), with distinct bin categories and each bin's Vietnamese label matching its category. The recorded answer SHALL be a "sorted" solution that assigns every item exactly once to a bin whose category equals the item's true category — a bijection over the item ids. The validator SHALL prove all of this independently of the generator and SHALL reject a re-pointed assignment (an item mapped to the wrong bin), a dropped or duplicated assignment, an item whose category is changed without moving its bin, a foreign bin category, a rewritten bin label, or an added or removed bin.

#### Scenario: Generated puzzle is validated
- **WHEN** any generated puzzle is checked
- **THEN** the independently re-derived categories equal the bin categories, every bin holds at least one item, and every assignment maps its item to a bin whose category equals the item's true category

#### Scenario: An item is sorted into the wrong bin
- **WHEN** one assignment is re-pointed to a different bin
- **THEN** the validator rejects the puzzle

#### Scenario: A bin no item belongs to
- **WHEN** a bin's category is changed to a category no item has
- **THEN** the validator rejects the puzzle

### Requirement: One attribute distinguishes the bins so no item is ambiguous
A `color` sort SHALL keep ONE shape across every item (colour is the only cue) and a `shape` sort SHALL keep ONE colour across every item (shape is the only cue); a `theme` sort SHALL use object items whose theme is the category. All items on a board SHALL be of one kind — shapes for a `color` or `shape` sort, objects for a `theme` sort. Colours SHALL be limited to the colour-blind-safe trio orange, blue and green with fixed hex values; shapes SHALL be circle, square, triangle and diamond, and square and diamond SHALL never both be bins or item shapes on the same board; object items SHALL be drawn only from the bundled memory-match assets with matching glyph, theme and label, and their theme SHALL be one of the odd_one_out themes. The validator SHALL reject a foreign colour, a square/diamond mix, a mixed-kind board, a swapped glyph, a foreign object id, or a second attribute varying in a colour or shape sort.

#### Scenario: Colour sort keeps one shape
- **WHEN** a `color` puzzle is generated
- **THEN** every item has the same shape and the bins are exactly the colours present among the items

#### Scenario: Foreign colour is injected
- **WHEN** an item is edited to a colour outside orange/blue/green
- **THEN** the validator rejects the puzzle

#### Scenario: Square and diamond are mixed
- **WHEN** a board is edited to hold both a square and a diamond
- **THEN** the validator rejects the puzzle

### Requirement: Five-level progression scaling items, bins and category subtlety
The game SHALL define five levels whose item count grows 4→8 and whose bin count grows 2→3, with category subtlety broadening: L1 sorts by `color` into two bins; L2 sorts by `theme` into two bins; L3 sorts by `theme` or `color` into three bins; L4 sorts by `shape` or `color` into three bins; L5 sorts by `theme`, `color` or `shape` into three bins. On every level the item count SHALL exceed the bin count so every bin can hold at least one item. A run SHALL play one board per level from L1 to L5 as a progressive run without streaks, countdowns or a lose state.

#### Scenario: Level ranges hold across a corpus
- **WHEN** a deterministic corpus of at least 200 seeds per level is generated
- **THEN** every board has the level's bin count and item count, every bin holds at least one item, and every declared dimension is generated

#### Scenario: A puzzle is moved to another level
- **WHEN** a puzzle's level is changed to one whose bin or item count it no longer fits
- **THEN** the validator rejects the puzzle

### Requirement: Tap-a-bin feedback that never ends the run
The renderer SHALL show ONE item at a time and let the child tap the bin it belongs to, with no drag gesture. A tap on the correct bin SHALL drop the item into that bin and advance to the next item; finishing the last item SHALL make Đô Đô (`ExploreMascot`) cheer and report `onAnswer(true)`. A tap on a wrong bin SHALL play a gentle "try again" beat (Đô Đô thinks, the item shakes and stays, `onTryAgainSound`) and report `onAnswer(false)` WITHOUT ending the run, advancing, or revealing which bin is correct — the same item is presented again. All motion SHALL use the native animation driver and SHALL be skipped when the system requests reduced motion. Object glyphs SHALL render as puzzle content only and no emoji SHALL be used as a UI icon or as the mascot. The renderer SHALL NOT carry its own prompt-replay control and SHALL NOT persist or report anything beyond `onAnswer`.

#### Scenario: An item is sorted correctly
- **WHEN** the child taps the bin whose category matches the current item
- **THEN** the item drops into that bin and the next item appears, and after the last item Đô Đô cheers and `onAnswer(true)` is called once

#### Scenario: A wrong bin is tapped
- **WHEN** the child taps a bin whose category does not match the current item
- **THEN** a gentle retry beat plays, `onAnswer(false)` is called, the item stays and no bin is marked correct or wrong

#### Scenario: Reduced motion is enabled
- **WHEN** the system reports reduced motion
- **THEN** taps update state, sound and `onAnswer` as usual without the drop or shake animation

### Requirement: Support that names the category without pointing at a bin
The renderer SHALL derive its hint from the pure helper `sortBinsSupportCue(bins, correctBinId, supportLevel)`. At support level 0 it SHALL return no cue. At support level 1 it SHALL only NAME the current item's category (a naming scaffold) and SHALL NOT point at any bin. At support level 2 it SHALL both name the category and identify the correct bin so a stuck child can finish. The helper SHALL never point at a bin at support level 1.

#### Scenario: Support level 1 names the category only
- **WHEN** the play screen passes `supportLevel` 1
- **THEN** the cue carries the current item's category label and no bin id

#### Scenario: Support level 2 identifies the bin
- **WHEN** the play screen passes `supportLevel` 2
- **THEN** the cue carries the category label and the correct bin id

### Requirement: Dimension variety and best-effort audio
The round-variety bucket of a puzzle SHALL be its sort dimension and its variant identity SHALL be the position-agnostic multiset of its items and bins keyed by dimension, so two boards differing only in item or bin order are the same variant. The declared buckets per level SHALL equal the level's dimensions and every declared dimension SHALL reach the child in at least 20% of chained one-exercise rounds. The on-screen prompt SHALL name the specific sort ("Dọn mỗi món vào đúng nhóm nhé.", "…đúng màu nhé.", "…đúng hình nhé.") and SHALL be authoritative; the audio SHALL reference the single best-effort `sort_bins_sort` clip and a missing clip SHALL never block play.

#### Scenario: One-exercise rounds at L5
- **WHEN** chained one-exercise rounds are requested at L5 with the play screen's exclusion window, last bucket and rotation
- **THEN** `theme`, `color` and `shape` each make up at least 20% of the served puzzles

#### Scenario: Prompt clip is not bundled
- **WHEN** the `sort_bins_sort` clip is absent from the bundled pack
- **THEN** the prompt is still shown on screen naming the sort and the puzzle is fully playable in silence

### Requirement: Conformance checks
The contract SHALL be enforced by `mobile/scripts/verify-explore-sort-bins-contracts.cjs` (`npm run test:explore-sort-bins`: at least 200 seeds per level, replay equality, the "bins = present categories" and "solution sorts each item into its true category" rules with independent re-derivation, level/palette/shape/one-attribute rules, tamper rejection, support never pointing at a bin at level 1, chained one-exercise rounds and renderer presentation rules) and by `kido-server/src/modules/explore/explore.sort-bins.spec.ts` (corpus conformance, tamper rejection, the support helper, the server catalog mirror and renderer source rules). The game SHALL also be covered by the shared `npm run test:explore-variety-buckets` contract.

#### Scenario: Contract script runs
- **WHEN** `npm run test:explore-sort-bins` runs in `mobile/`
- **THEN** it exits successfully only if every rule above holds for the current generator, validator and renderer

#### Scenario: Server spec runs
- **WHEN** `npx jest src/modules/explore/explore.sort-bins.spec.ts` runs in `kido-server/`
- **THEN** the mobile modules pass the same rules and the server catalog entry mirrors the bundled game configuration
