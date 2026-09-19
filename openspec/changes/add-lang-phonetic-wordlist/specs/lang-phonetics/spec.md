## ADDED Requirements

### Requirement: Northern-dialect syllable analysis

The system SHALL analyse a Vietnamese syllable into an onset letter, an onset **sound**, a rhyme, and a tone, where the onset sound reflects the Northern (Hanoi) pronunciation rather than the spelling. The onset letters `d`, `gi` and `r` SHALL map to one sound; `ch` and `tr` SHALL map to one sound; `s` and `x` SHALL map to one sound. Tone extraction SHALL recognise only the five tone marks and MUST NOT treat the `ă`, `â`, `ê`, `ô`, `ơ`, `ư` or `đ` diacritics as tones.

#### Scenario: Spelling-distinct onsets that are heard as one sound

- **WHEN** analysing `dao`, `giày` and `rắn`
- **THEN** all three report the same onset sound
- **AND** each reports its own distinct onset letter (`d`, `gi`, `r`)

#### Scenario: Diacritic is not a tone

- **WHEN** analysing `cây`, `ngô`, `bơ`, `mưa` and `ăn`
- **THEN** each reports the `ngang` (unmarked) tone

#### Scenario: Zero onset

- **WHEN** analysing `ăn`, `áo` or `ong`
- **THEN** the onset letter is empty and the whole syllable body is the rhyme

### Requirement: Curated phonetic inventory

The system SHALL provide a word inventory for the `pho` domain in which every monosyllabic entry carries a concrete meaning known to a 5–6 year old, expressed as a gloss. Entries MUST be bare nouns/verbs/adjectives satisfying the existing `viLabel` rules, MUST use Northern regional variants, and MUST NOT be function words. Rhyme families and onset families exposed for authoring SHALL contain at least three words each. Multi-syllable entries SHALL record whether the word is reduplicative (`từ láy`).

#### Scenario: Family lookup only surfaces usable families

- **WHEN** requesting rhyme families or onset families for authoring
- **THEN** every returned family contains at least three words

#### Scenario: Reduplicative words are separable

- **WHEN** requesting two-syllable words without opting into reduplicative entries
- **THEN** words such as `bươm bướm` are excluded
- **AND** they are included only when reduplicative entries are explicitly requested

#### Scenario: Inventory self-audit

- **WHEN** auditing the inventory
- **THEN** duplicates, multi-syllable entries in the monosyllabic list, labels violating the `viLabel` rules, and tone sets whose members do not share onset and rhyme are all reported as errors

### Requirement: Tone coverage spans all six tones

The curated tone sets SHALL include at least one set exercising the `ngã` tone, so that the rule reserving the `hỏi`/`ngã` pair for the harder level is reachable rather than dead.

#### Scenario: The hard tone pair is exercisable

- **WHEN** enumerating the tones present across all tone sets
- **THEN** all six Vietnamese tones are represented

### Requirement: Tone sets are hand-surveyed, not derived

Tone sets SHALL be an explicitly curated list rather than being generated from the word inventory, because whether an unlisted tone variant of a syllable is a real child-known word or a grammatical particle cannot be determined mechanically. Every member of a tone set SHALL share the same onset sound and rhyme and differ only in tone, and every member SHALL have a surveyed gloss.

#### Scenario: A set whose members differ in rhyme is rejected

- **WHEN** a proposed tone set pairs `mắt` with `mất`
- **THEN** the audit reports that the two differ in rhyme (`ăt` vs `ât`) and the set is not a tone set

### Requirement: Per-skill exercise validation

The system SHALL provide a validator per `pho` skill that returns the list of defects in a proposed exercise, encoding that skill's anti-patterns, and SHALL support an `easy` level that additionally blocks near-rhyme pairs, the `l`/`n` onset pair, the `hỏi`/`ngã` tone pair, and reduplicative words. Validators SHALL reject words absent from the curated inventory unless the caller explicitly opts in.

#### Scenario: Rhyme exercise must have exactly one answer

- **WHEN** validating a rhyme exercise whose sample is `lá` and whose options are `cá` and `gà`
- **THEN** the validator reports that more than one option shares the sample's rhyme

#### Scenario: Rhyme exercise must not leak the onset skill

- **WHEN** validating a rhyme exercise whose sample is `lá` and one option is `lửa`
- **THEN** the validator reports that the option shares the sample's onset

#### Scenario: Onset exercise respects Northern neutralization

- **WHEN** validating an onset exercise whose sample is `dao` and whose options are `giày` and `rắn`
- **THEN** the validator reports more than one correct answer, because all three share the Northern onset sound

#### Scenario: Level gates the extra rules

- **WHEN** validating a rhyme exercise pairing the rhymes `an` and `ang`
- **THEN** it is reported as a near-rhyme defect at the `easy` level
- **AND** it passes at the `hard` level

#### Scenario: Near-rhyme covers differing nuclei, not only differing codas

- **WHEN** validating an `easy` rhyme exercise whose sample is `khăn` (rhyme `ăn`) and whose options include `cân` (rhyme `ân`)
- **THEN** it is reported as a near-rhyme defect, because the two rhymes share a coda and their nuclei are a confusable pair
- **AND** the same holds for `ăt`/`ât`, `ôi`/`uôi` and `o`/`ơ`

### Requirement: Validation defects are separate from advisory notes

A validator's return value SHALL contain defects only, so that an empty result always means the exercise is valid. Advisory information that does not make an exercise invalid — notably an onset answer whose spelling differs from the sample's while its Northern sound matches — SHALL be returned through a separate call.

#### Scenario: A spelling-divergent onset answer is valid, and is explained separately

- **WHEN** validating an onset exercise whose sample is `chó` and whose options are `trăng` and `mèo`
- **THEN** the validator returns no defects
- **AND** the separate notes call reports that `trăng` and `chó` differ in spelling but share the Northern onset sound, so `trăng` is the intended answer rather than a distractor

### Requirement: Phonetic data does not depend on the audio library

Authoring a `pho` seed SHALL depend only on this dataset. The presence of clips in `audio_library` MUST NOT be a precondition for seeding, since a seed carries text only and clips are created lazily during generation.

#### Scenario: Seeding a Q2 phonological week with an empty audio library

- **WHEN** the seed routine reaches a week whose session includes `pho` skills and `audio_library` holds no clips for those words
- **THEN** the week is seeded normally from the curated inventory
- **AND** clip creation is deferred to the generate step
