## ADDED Requirements

### Requirement: Leaves compose and decompose with motion

The `number_bond` renderer (`NumberBondRenderer`) SHALL move leaves between the
pool and the `Bé thêm` room with a visible slide instead of swapping the count
instantly. The motion SHALL be driven only from the reducer-derived room counts
(`numberBondInteractionReducer`), never from any local game logic, and SHALL be
presentation only: no change to the `numberBondGame.ts` generator, validator,
params or run policy, so replay by seed stays byte-identical.

When the child adds a leaf, the newly added (last) leaf SHALL slide/settle into
the `Bé thêm` room; when a leaf is tapped to remove it (the existing reducer
`unassign` action), a leaf SHALL slide out of the room. When the child gathers
the two parts back into the whole with `Gộp lại`, the recombined whole SHALL
settle in rather than appear instantly. Every animation SHALL run on the native
driver and SHALL NOT introduce any new seeded field. The locked `Có sẵn` room,
the `Bé thêm` room as the only add action, the single `Kiểm tra` button, Đô Đô
(`ExploreMascot`) and the existing labels/counts SHALL be preserved, and no
duplicate on-screen instruction text SHALL be introduced.

#### Scenario: A leaf is added

- **WHEN** the child taps the `Bé thêm` room to add a leaf
- **THEN** the newly added leaf slides/settles into the room rather than
  appearing instantly, and the reducer room counts are unchanged by the animation

#### Scenario: A leaf is removed

- **WHEN** the child taps a leaf in the `Bé thêm` room to take it back out
- **THEN** a leaf slides out of the room, the count decreases by exactly one, and
  no wrong/lose state is shown

#### Scenario: The parts are gathered back together

- **WHEN** the child taps `Gộp lại` to recombine the two parts
- **THEN** the recombined whole settles in (a gentle scale/opacity settle) rather
  than appearing instantly, and `Tiếp tục` still requires an explicit tap

#### Scenario: Reduced motion

- **WHEN** the system reports reduced motion
- **THEN** the renderer skips every slide and settle and renders each leaf and the
  recombined whole in the static end state identical to today's, with the
  interaction timing unchanged

### Requirement: Spoken part-whole feedback is best-effort

The `number_bond` renderer SHALL speak its already-shown board feedback aloud on
a best-effort basis through `onSpeakFeedback`, reusing the bundled prompt-audio
clips built by `numberKey` and `numberBondFeedbackKeys` (openspec:
add-explore-round-2-games audio batch). Voice SHALL be presentation only and
SHALL NOT gate play: a clip that is not bundled is silently skipped and the
on-screen sentence remains authoritative. No new on-screen instruction text SHALL
be added for the voice, and the spoken words SHALL match what is already on the
board (never the complement before the child has checked).

On add and on remove the renderer SHALL speak the resulting running count as a
number clip; on `Kiểm tra` and on `Gộp lại` it SHALL speak the corresponding
`numberBondFeedbackKeys` line (not-enough, too-many, the revealed relationship,
or the recombined whole) that is already displayed.

#### Scenario: Counting on add and remove

- **WHEN** the child adds or removes a leaf
- **THEN** the renderer best-effort speaks the resulting count as a number clip,
  and never speaks the missing complement

#### Scenario: Reading the checked relationship aloud

- **WHEN** the child taps `Kiểm tra` or `Gộp lại`
- **THEN** the renderer best-effort speaks the `numberBondFeedbackKeys` line that
  matches the sentence already shown on the board

#### Scenario: A clip is not bundled

- **WHEN** a required audio clip is unavailable locally
- **THEN** playback is silently skipped, the on-screen prompt/feedback stays
  authoritative, and play is never blocked
