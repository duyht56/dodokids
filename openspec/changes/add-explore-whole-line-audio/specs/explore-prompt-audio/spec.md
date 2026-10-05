## MODIFIED Requirements

### Requirement: Offline stitched playback
Explore SHALL read a prompt aloud by resolving its key list against a bundled
static registry and playing it in order without network access. Before playing,
the key list SHALL be resolved into segments left to right: wherever a contiguous
run of keys equals the refs of a whole-line clip that is present in the bundle,
the longest such run SHALL play as that one clip; every other key SHALL play as
its own clip exactly as before. A whole line that is absent MUST fall back to the
stitched clips of its refs, and a key that is absent or fails to play MUST fall
back to the on-screen `promptVi`; neither MUST block or alter the game. After a
segment that ends a sentence, playback SHALL pause for a short sentence gap
before the next segment, and that gap MUST be cancelled by anything that stops or
supersedes the prompt.

#### Scenario: Prompt is played in airplane mode
- **WHEN** an exercise with a mapped prompt is shown without connectivity
- **THEN** its segment clips play in order from the app bundle and no network
  request occurs

#### Scenario: A segment clip is missing
- **WHEN** one key in a prompt's list does not resolve to a bundled clip
- **THEN** the on-screen prompt remains visible and gameplay continues unchanged

#### Scenario: A composed sentence has a bundled whole line
- **WHEN** a prompt's keys contain the refs of a bundled whole-line clip, e.g.
  "Có tất cả" + "sáu" + "bạn nhé."
- **THEN** that sentence plays as one clip ("Có tất cả sáu bạn nhé.") and the
  remaining keys play as before

#### Scenario: The whole line is not bundled
- **WHEN** a build carries no clip for a composed sentence's line
- **THEN** the sentence plays from its stitched clips exactly as before this
  change, with no error

#### Scenario: Prompt is stopped during a sentence gap
- **WHEN** the prompt is stopped, replaced by a new prompt, or superseded by
  spoken feedback while waiting between two sentences
- **THEN** no further segment of the old prompt plays

### Requirement: Spoken failure guidance for Route Planner
Route Planner SHALL read its on-screen failure guidance aloud after an
unsuccessful run, covering every outcome it can display: a run blocked by the
board edge, an obstacle or a locked door; a run that stops short of, or travels
past, the house; and a run that misses a required star, key or ordered point. The
escalated "re-check step N" support line SHALL be spoken when it is shown. When
the step's whole-line clip is bundled, it SHALL play as that one clip, which reads
the step as a Vietnamese ordinal ("thứ nhất", "thứ hai", "thứ ba", "thứ tư", …);
when that line is not bundled, the stitched shared number-name slot clips SHALL
play as before this change.

Spoken guidance SHALL follow, not overlap, the retry sound cue, and SHALL be
best-effort in the established sense: a missing or failed clip leaves the
on-screen guidance as the authoritative feedback and MUST NOT alter the attempt
count, escalation threshold, board or run flow.

#### Scenario: Đô Đô walks into the edge of the board
- **WHEN** a run fails because the next step leaves the board
- **THEN** the retry cue plays, and the same "mép bảng" sentence shown on screen
  is then read aloud

#### Scenario: Escalated support is spoken
- **WHEN** repeated failures on one board escalate the guidance to name step 1
  or step 4, and that step's whole line is bundled
- **THEN** the spoken line says "Xem lại mũi tên thứ nhất nhé." or "Xem lại mũi
  tên thứ tư nhé.", never "thứ một" or "thứ bốn"

#### Scenario: Escalated line is not bundled
- **WHEN** the whole-line clip for the escalated step is absent
- **THEN** the line is assembled from the shared number-name clips as before,
  including their cardinal reading of the step

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
convention. A whole-line clip that voices a guidance sentence is defined by its
line template, not by the renderer: its refs SHALL be byte-identical to the keys
the renderer emits, and its transcript SHALL equal the displayed sentence except
that digits are read as number words — as Vietnamese ordinals for the Route
Planner step, so the screen's "thứ 4" is spoken "thứ tư" — with case and
punctuation ignored. The mobile check `npm run test:explore-prompt-lines`
(`scripts/verify-explore-prompt-lines-contracts.cjs`) SHALL enforce this. The
mobile inventory and its kido-pipeline mirror SHALL likewise be checked for drift
instead of relying on a comment.

#### Scenario: Someone edits the wording on one side only
- **WHEN** a guidance sentence is reworded in the renderer but not in the
  prompt-audio inventory (or vice versa)
- **THEN** the contract check fails and names the offending key

#### Scenario: The pipeline mirror drifts
- **WHEN** a phrase exists in the mobile inventory but not in the kido-pipeline
  mirror, or the two transcripts differ
- **THEN** the contract check fails before anyone runs an export

#### Scenario: A whole guidance line says the step as an ordinal
- **WHEN** the screen shows "Xem lại mũi tên thứ 4 nhé." and its line transcript
  is "Xem lại mũi tên thứ tư nhé."
- **THEN** the line check passes, and it fails if the transcript says "thứ bốn"
  or differs from the screen in any other word

## ADDED Requirements

### Requirement: Sentence-level whole-line keys
Mobile SHALL define, in a pure module with no native imports, a whole-line
template for every composed sentence Explore can speak — a sentence whose audio
today is a number or word clip stitched into a phrase fragment. Each line SHALL
be keyed `explore-audio:vi:line:<templateId>:<params joined by '-'>:v1` with
`templateId` matching `^[a-z0-9_]+$`; its refs SHALL be built only through the
existing prompt-audio key builders, and its domain SHALL list every reachable
params tuple. A sentence that is already one fixed phrase clip MUST NOT become a
line, with one deliberate exception: the Number Bus answer echo followed by the
total ("Năm! Có tất cả năm bạn nhé.") SHALL be one line (`nb_count_finish`),
read in one breath as in the pilot. A line that opens on a number MUST NOT take
a number that ends a stitched fragment before it, and a lone number clip
directly before a line SHALL end its sentence. Line transcripts MUST contain no
digits, MUST end with ".", "!" or "?",
MUST use the Đô Đô / "bé" persona (never "con"), and MUST match the on-screen
text of the same sentence where one exists, checked by
`npm run test:explore-prompt-lines`: digits are read as words (Route Planner
steps as ordinals), case and punctuation are ignored, and for the Pattern Finder
rule hint ("Mỗi số thêm 2: ＋2 ＋2 …") only the rule clause before the ":" is
spoken and compared — the "＋2 ＋2 …" tail is visual only. Keys and transcripts
SHALL be unique. The owner-approved pilot sentences fix the wording style of
their templates; a pilot sentence SHALL be in the line set only when its params
are reachable. `exercise.audioRefs`, every generator, validator and key builder
MUST remain unchanged.

#### Scenario: Every reachable composed sentence has a line
- **WHEN** any Explore exercise or feedback path can produce a composed sentence
- **THEN** its refs equal the refs of exactly one line in the line set

#### Scenario: The answer echo is read in one breath
- **WHEN** a Number Bus correct answer speaks the number and then the total
- **THEN** one `nb_count_finish` line plays ("Năm! Có tất cả năm bạn nhé.")
  instead of a number clip followed by the total

#### Scenario: Exercise envelopes are unchanged
- **WHEN** a generator is replayed with the same level and seed after this change
- **THEN** the exercise, including `audioRefs`, is byte-identical to before

#### Scenario: Owner-approved wording is kept
- **WHEN** the line set is built
- **THEN** each template renders the pilot wording for the pilot's params (for
  example `nb_gop` with whole 5, parts 2 and 3 reads "Gộp hai và ba được
  năm!"), and the line set includes every pilot sentence whose params are
  reachable: "Sáu gồm bốn và hai!", "Số nào đứng sau số bảy?", "Có tất cả sáu
  bạn nhé.", "Trong xe có năm bạn rồi nha.", "Hôm nay mình chơi với số bốn!"
  and "Số ba ở trong xe rồi, mình đếm thêm nha!"

#### Scenario: An unreachable pilot sentence is not a line
- **WHEN** a pilot sentence's params cannot occur in any game, as with "Gộp hai
  và ba được năm!" (Number Bus boarding totals are only 3–4)
- **THEN** it is not in the line set and no clip is generated for it

#### Scenario: Screen and voice drift apart
- **WHEN** the on-screen text of a composed sentence is reworded but its line
  transcript is not
- **THEN** the mobile contract check fails and names the line

### Requirement: Line manifest for the pipeline
Mobile SHALL publish its line set as the committed file
`mobile/src/explore/explorePromptLines.generated.json` with the shape
`{ "version": 1, "lines": [{ "key", "templateId", "params", "refs",
"transcript" }] }`, lines sorted by key, 2-space indentation and a trailing
newline. The file SHALL be produced by a mobile script
(`npm run explore-lines:dump`) and MUST NOT be edited by hand.

#### Scenario: Dump is reproducible
- **WHEN** the dump script runs twice on the same source
- **THEN** both runs write byte-identical files

### Requirement: Real clip durations drive Explore speech timing
The generated audio registry SHALL expose `EXPLORE_AUDIO_DURATIONS_MS` (integer
milliseconds for every exported whole line and every other exported clip whose
PCM can be measured), and mobile MUST tolerate keys with no entry.
Speech-length estimates used to schedule visuals SHALL use the real duration of
each resolved segment plus the sentence gap, falling back to the existing
heuristic per segment without a duration. When the Number Bus mantra resolves to
one bundled line with a known duration `d`, its caption and highlight steps SHALL
be placed at the syllable onsets of its segments inside `d` ("N | gồm | A | và |
B", "Gộp | A | và | B | được | N"), with the whole-bus highlight at `d + 150` ms
and completion at `d + 450` ms; otherwise the existing fixed mantra steps SHALL
be used unchanged. Reduced-motion behaviour MUST NOT change.

#### Scenario: Mantra with a bundled line
- **WHEN** "Sáu gồm bốn và hai!" is bundled as a line with a known duration
- **THEN** the sign, lower deck and upper deck light as "Sáu", "bốn" and "hai"
  are heard, and the step completes 450 ms after the clip ends

#### Scenario: Mantra without a duration
- **WHEN** the mantra's line or its duration is missing
- **THEN** the mantra runs on today's fixed steps and timings

### Requirement: Pack v5 is accepted alongside earlier packs
Mobile SHALL accept the Explore audio pack version `explore-audio-vi-v5` in
addition to v1–v4, so a build bundling v5 reports its audio as available and a
build still bundling an earlier pack keeps today's stitched playback.

#### Scenario: Build bundles pack v5
- **WHEN** the bundled registry reports `explore-audio-vi-v5`
- **THEN** Explore audio capability is `available` and whole lines are played
