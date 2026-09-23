## MODIFIED Requirements

### Requirement: Neutral feedback and current-run support
The shell SHALL provide audio-first instruction, correctness feedback and escalating hints without a lose state or reward economy. The shell SHALL NOT display a streak, a counter that resets on a miss, or a flame/reward glyph; continuous runs show only the current range and forward-only progress toward the run's end. Range promotion SHALL use a window of recent answers (5 correct within the last 7) rather than an unbroken streak. The shell SHALL offer a replay control for any exercise that carries prompt audio, and spoken prompt/feedback audio SHALL obey the parent's audio settings (`audioEnabled`, `volume`). The mascot shown on every Explore surface SHALL be Đô Đô (the product mascot image), never an emoji placeholder. The shell SHALL speak its feedback in Đô Đô's voice, best-effort from bundled clips: rotating praise after a correct answer, a gentle retry line after a miss, the escalating hint when support rises, the range-promotion line, the run-complete line and the break reminder; the on-screen text stays authoritative when a clip is not bundled. The shell SHALL pass a `supportLevel` (0 before any miss, 1 after the first miss on an exercise, 2 after the second miss — or after the first miss when a miss already carried over from the previous exercise) to the renderer so support is visible in the board, and after three misses in a row a range run SHALL step down one level in memory and present a fresh, easier exercise ("Mình thử bài dễ hơn nhé"). Any tries, hints, support level or temporary difficulty adjustment SHALL exist only in the active run.

#### Scenario: Child needs repeated help
- **WHEN** multiple unsuccessful interactions occur in the active exercise
- **THEN** support increases locally and all evidence is discarded when the run ends

#### Scenario: Child misses once during a continuous run
- **WHEN** the child answers incorrectly after several correct answers
- **THEN** no visible counter resets to zero, the progress dots keep their filled count, and promotion still happens once 5 of the last 7 answers are correct

#### Scenario: Parent has turned audio off
- **WHEN** `audioEnabled` is false or `volume` is 0 in the parent settings
- **THEN** no prompt or feedback clip is played, while the on-screen prompt and the game remain fully playable

#### Scenario: Support becomes visible
- **WHEN** the child misses once on an exercise
- **THEN** the renderer receives `supportLevel` 1 and shows an anchor (quantity dots, counts or the next slot) without marking the answer; after a second miss (or a first miss that follows a miss on the previous exercise) it receives 2 and reduces the choices or plays an explanation, still never marking the answer

#### Scenario: Three misses in a row on a range game
- **WHEN** a range run records three consecutive misses above its first level
- **THEN** the run steps down one level, says "Mình thử bài dễ hơn nhé", presents a new exercise at that level, and nothing is persisted

#### Scenario: Feedback clip is not bundled
- **WHEN** a feedback sentence has no clip in the bundled pack
- **THEN** the SFX and on-screen text still play and the run is unaffected

## ADDED Requirements

### Requirement: One-batch audio pack
All Explore sentences — prompts, feedback, game names and guidance — SHALL live in one inventory mirrored between mobile (`promptAudio.ts`) and the pipeline (`exploreAudioInventory.ts`), and a new pack version SHALL be produced by a single generate → review → approve → export run. The app SHALL accept the previous pack version until the new one is bundled.

#### Scenario: New sentences are added for a round
- **WHEN** a round adds prompts or feedback lines
- **THEN** they are added to both inventories, the contract script proves the mirrors match, and one pipeline run synthesizes only the missing transcripts while reusing existing clips

#### Scenario: App runs with the previous pack
- **WHEN** the bundled pack is `explore-audio-vi-v1` and the inventory already names v2 keys
- **THEN** audio capability stays `available` for bundled keys and the new sentences degrade to silence
