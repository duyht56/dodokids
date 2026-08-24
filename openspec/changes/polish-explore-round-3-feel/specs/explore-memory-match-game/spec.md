## ADDED Requirements

### Requirement: Cards turn with a real flip

The `memory_match` renderer (`MemoryMatchRenderer`) SHALL turn a card with a
visible flip instead of swapping its face instantly. The flip SHALL be driven
per card only from the reducer-derived `faceUp`/`matched` state (never from any
local game logic), and SHALL be presentation only: no change to the
`memoryGame.ts` generator/validator/params or the `memoryState` reducer, so
replay by seed stays byte-identical.

The flip SHALL compress the card to its vertical axis and swap the painted face
while the card is edge-on, then open back out — implemented as a `scaleX` 1→0→1
turn with the face content swapped at the mid-point (`scaleX = 0`), because RN
backface visibility is unreliable across platforms; a rotateY 0↔180 flip with a
hidden back face is an acceptable equivalent. Both halves of the turn SHALL run
on the native driver. The existing prompt bubble, progress dots, Đô Đô
(`ExploreMascot`) and matched-pair check badge SHALL be preserved.

#### Scenario: A card turns face up

- **WHEN** the child taps a face-down card
- **THEN** the card flips (compresses to its vertical axis, swaps to its picture
  face at the mid-point, opens back out) rather than the face appearing
  instantly, and the reducer state is unchanged by the animation

#### Scenario: A mismatched pair turns back down

- **WHEN** two revealed cards do not match and the board returns them to
  face-down
- **THEN** each mismatched card flips back down (face swapped to the cover at the
  mid-point of the turn), and no wrong/lose state is shown

#### Scenario: A matched pair settles without an extra flip

- **WHEN** two revealed cards match and stay face up
- **THEN** the two cards keep their picture face and show the check badge without
  a stray extra flip, because a matched card never changes its `faceUp` state

#### Scenario: Reduced motion

- **WHEN** the system reports reduced motion
- **THEN** the renderer skips the flip and swaps the card face instantly, resting
  in a static end state identical to today's, with play timing unchanged
