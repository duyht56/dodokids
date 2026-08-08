## MODIFIED Requirements

### Requirement: Count level progression
The game SHALL configure L1 as 1–5 objects in rows, L2 as 1–10 lightly scattered, L3 as 6–15 scattered, L4 as 10–20 grouped, and L5 as two object types while counting only the named target type. L5 SHALL identify the target unambiguously through its canonical icon and child-facing visual label, with approved local audio replay when available.

#### Scenario: L5 target is generated
- **WHEN** an L5 exercise includes target and distractor object types
- **THEN** the answer equals only the target identity count and the visual target cue remains unambiguous offline

### Requirement: Audio-gated offline declaration
The game SHALL declare offline capability when its generator, validator, config, target assets and visual target cues are bundled. Missing optional count-word or instruction audio MUST disable only replay controls whose keys are unavailable and MUST NOT disable visual tap-and-count gameplay. After the approved audio pack passes offline verification, available prompts SHALL replay locally.

#### Scenario: Count audio is missing locally
- **WHEN** object generation and layout are local but count-word audio is not bundled
- **THEN** tap-and-count remains playable offline with its canonical icon/visual target cue and unavailable replay controls are disabled

#### Scenario: Count audio is bundled
- **WHEN** the exercise prompt key resolves through the approved local registry
- **THEN** the child can replay the prompt in airplane mode without changing counting state

