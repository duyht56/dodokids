## MODIFIED Requirements

### Requirement: Instruction-only scope
Explore spoken audio SHALL voice only the instruction/question and, after an
unsuccessful attempt, the guidance already shown on screen for that attempt. It
MUST NOT read answer options aloud, MUST NOT name the answer, and MUST NOT reveal
the remaining solution; guidance MAY name what went wrong (an edge, an obstacle, a
locked door, a missed objective) and MAY point at which step to re-examine. Gating
of `hear_select`-style modes remains governed by `enable-explore-offline-audio`.

#### Scenario: Answer is not revealed
- **WHEN** a prompt is read for any game
- **THEN** only the question is spoken and no answer option clip is played

#### Scenario: Failure guidance is spoken
- **WHEN** an attempt fails and the game shows a guidance sentence
- **THEN** that sentence MAY be read aloud, naming only what went wrong and never
  the answer or the remaining solution

## ADDED Requirements

### Requirement: Spoken failure guidance for Route Planner
Route Planner SHALL read its on-screen failure guidance aloud after an
unsuccessful run, covering every outcome it can display: a run blocked by the
board edge, an obstacle or a locked door; a run that stops short of, or travels
past, the house; and a run that misses a required star, key or ordered point. The
escalated "re-check step N" support line SHALL be spoken when it is shown, reusing
the shared number-name slot clips rather than recording a variant per step.

Spoken guidance SHALL follow, not overlap, the retry sound cue, and SHALL be
best-effort in the established sense: a missing or failed clip leaves the
on-screen guidance as the authoritative feedback and MUST NOT alter the attempt
count, escalation threshold, board or run flow.

#### Scenario: Đô Đô walks into the edge of the board
- **WHEN** a run fails because the next step leaves the board
- **THEN** the retry cue plays, and the same "mép bảng" sentence shown on screen
  is then read aloud

#### Scenario: Escalated support is spoken
- **WHEN** repeated failures on one board escalate the guidance to name a step
- **THEN** the spoken line includes that step number, assembled from the shared
  number-name clips

#### Scenario: Clips are not exported yet
- **WHEN** the guidance clips are absent from the bundled pack
- **THEN** the run fails exactly as before with its on-screen guidance and retry
  cue, and nothing waits on audio

#### Scenario: Child leaves mid-guidance
- **WHEN** the child exits the game while a guidance line is pending or playing
- **THEN** the pending line is cancelled and no audio outlives the screen

### Requirement: Guidance text and its spoken clip share one source
A guidance sentence and the ordered audio keys that voice it SHALL be produced
together from a single definition, so a wording change cannot ship a voice that
contradicts the screen. Each guidance clip's transcript in the prompt-audio
inventory SHALL be verbatim identical to the sentence the renderer displays, and
this correspondence SHALL be enforced by an automated check rather than by
convention. The mobile inventory and its kido-pipeline mirror SHALL likewise be
checked for drift instead of relying on a comment.

#### Scenario: Someone edits the wording on one side only
- **WHEN** a guidance sentence is reworded in the renderer but not in the
  prompt-audio inventory (or vice versa)
- **THEN** the contract check fails and names the offending key

#### Scenario: The pipeline mirror drifts
- **WHEN** a phrase exists in the mobile inventory but not in the kido-pipeline
  mirror, or the two transcripts differ
- **THEN** the contract check fails before anyone runs an export
