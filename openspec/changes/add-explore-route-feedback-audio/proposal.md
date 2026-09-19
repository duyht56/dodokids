## Why

Route Planner ("Dẫn đường cho Đô Đô") already explains every failed run in
Vietnamese: `RoutePlannerRenderer`'s `guidanceFor` produces nine distinct
sentences (`Chỗ này là mép bảng rồi…`, `Cửa đang khóa…`, `Đô Đô đi qua nhà mất
rồi…`, `Nhớ ghé lấy ngôi sao…`, and so on), plus an escalated `Xem lại mũi tên
thứ N nhé.` after repeated attempts on the same board.

None of it is spoken. A failed run plays the `try_again` chime and then writes
the explanation on screen — to a child aged 4–6 who cannot read. The chime says
"that did not work" but never says *why*, so the most instructive moment in the
game (Đô Đô walking into the edge of the board) delivers no teaching at all. The
child has to guess, or an adult has to read the line for them.

`add-explore-prompt-audio` deliberately scoped itself to the instruction/question
("Instruction-only scope") and `add-explore-sound-effects` deliberately scoped
itself to non-verbal cues, so failure guidance fell between the two changes and
was never voiced by either.

## What Changes

- Voice the nine Route Planner failure-guidance sentences, plus the escalated
  "look at arrow N" support line, reusing the existing prompt-audio inventory,
  key scheme, bundled pack and stitching player. Ten new fixed-phrase clips; the
  arrow number reuses the shared number-name slot clips.
- Widen the prompt-audio scope from instruction-only to instruction **and
  guidance**, with the answer-protection rule kept intact: guidance MAY name what
  went wrong and MUST NOT name the answer or the remaining route.
- Add one renderer-facing channel (`onSpeakFeedback`) so a game can read its own
  on-screen guidance aloud, routed through the existing stitcher so spoken
  feedback supersedes any prompt still playing.
- Derive the guidance text and its audio keys from a single place in the
  renderer, so a copy edit cannot leave the voice contradicting the screen, and
  enforce that with a static contract check.
- Hold the spoken line back one beat after the `try_again` chime so the two cues
  are heard in sequence rather than on top of each other.
- Nothing else in the game changes: the same sentences, the same escalation
  threshold, the same run flow. With the clips unexported the game behaves
  exactly as it does today.

## Capabilities

### Modified Capabilities
- `explore-prompt-audio`: extend the scope requirement from instruction-only to
  instruction plus failure guidance (answer protection unchanged), and add a
  requirement that a spoken guidance line and its on-screen text come from one
  source and stay verbatim-identical.

## Impact

- Mobile Explore only: ten new phrase entries in
  `mobile/src/explore/promptAudio.ts` (mirrored in
  `kido-pipeline/src/explore/exploreAudioInventory.ts`), a `routeFeedbackKeys`
  builder, an `onSpeakFeedback` prop on `ExploreRendererProps`, its handler in
  `ExplorePlayScreen`, and the guidance refactor in `RoutePlannerRenderer`.
- Pipeline: ten more clips to generate, review and approve before export. The
  Human Gate is unchanged — nothing auto-approves.
- App bundle grows by ten short clips; no server, schema, curriculum or progress
  change; no Explore history, analytics or reward side effects
  (`docs/EXPLORE_ZERO_HISTORY.md`, `explore-stateless-privacy`).
- Rollout is gated by the exported pack: until the clips are approved and
  exported, every new key resolves to silence and the on-screen guidance remains
  the authoritative feedback, exactly as today.
