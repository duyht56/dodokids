## MODIFIED Requirements

### Requirement: Number primitive and audio use
The game SHALL render approved number-card primitives and SHALL resolve fixed local audio templates for number names 0–50 when the bundled audio capability is available. It SHALL not require per-exercise images or manually authored questions, and it MUST NOT substitute a visible answer for missing audio in `hear_select`.

#### Scenario: Exercise assets resolve
- **WHEN** a valid visual number exercise is delivered
- **THEN** every number card is a deterministic primitive and the exercise remains playable without network access

#### Scenario: Hear-select audio resolves
- **WHEN** `hear_select` is enabled for the current capability profile
- **THEN** its instruction/number key resolves to an approved bundled clip before the exercise is emitted

### Requirement: Audio-gated offline declaration
The game SHALL declare visual offline capability when its local generator, validator, config and number-card primitives are bundled, even if optional audio is missing. Audio-dependent modes SHALL be selected only when their required Vietnamese audio keys are available locally; after the approved 0–50 pack passes offline verification, those modes SHALL also be enabled offline.

#### Scenario: Audio pack is not bundled
- **WHEN** the local generator and validator are installed but required number audio is unavailable locally
- **THEN** visual number modes remain playable offline and `hear_select` is not generated

#### Scenario: Audio pack is bundled
- **WHEN** the required audio-pack version and keys pass local capability verification
- **THEN** `hear_select` can be generated and replayed without network access

#### Scenario: Listen-select is the primary construct
- **WHEN** the approved audio pack is bundled for a level that leads with `hear_select` (levels 1–2)
- **THEN** the child hears the target number spoken, the on-screen prompt stays generic ("Con hãy nghe rồi chọn số đúng nhé."), and `match_sample` is emitted only as the offline fallback when audio is unavailable

