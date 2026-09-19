## ADDED Requirements

### Requirement: Skill diversity and concentration per quarter

The system SHALL check, for each subject and each quarter, that the seeds cover at least a minimum number of distinct skills and that no single skill exceeds a maximum share of that quarter's activities. Thresholds SHALL be per subject. A subject whose skill choice is constrained by a declared feasibility matrix MAY be exempt from the share cap while still subject to the diversity floor.

#### Scenario: Late quarter collapses to a handful of skills

- **WHEN** a quarter of math seeds draws on only seven distinct skills
- **THEN** a critical diversity issue is reported naming the count and the required minimum

#### Scenario: One skill dominates a quarter

- **WHEN** a single skill accounts for a quarter of a quarter's activities
- **THEN** a share warning is reported naming the skill, the count, and the cap

#### Scenario: English concentration is not penalised

- **WHEN** English seeds concentrate heavily on one skill
- **THEN** no share issue is reported, because the theme-skill matrix admits only a few skills per theme

### Requirement: Template and prompt reuse limits

The system SHALL detect items that reuse one structure with only surface substitutions. An item's template SHALL be derived from its `answerSpec` with parenthetical notes, digits, and colour, shape and size vocabulary removed, combined with its spoken prompt. A template recurring more than a fixed number of times across the corpus SHALL be a critical issue. Separately, a single spoken prompt used more than a fixed number of times SHALL be a warning, except for subjects whose prompts are mandated by a fixed instruction-frame set.

#### Scenario: A template cloned by swapping colours

- **WHEN** many items share one filter structure and one spoken sentence, differing only in the colour named
- **THEN** a critical template-clone issue is reported with the count and example seed ids

#### Scenario: A fixed option set with a varying prompt is not a clone

- **WHEN** every syllable-counting item offers the same four number cards but names a different word in its prompt
- **THEN** no template-clone issue is reported, because the varying part carries the content

#### Scenario: Mandated English prompts are exempt from the reuse cap

- **WHEN** many English items repeat one instruction frame verbatim
- **THEN** no prompt-reuse issue is reported

### Requirement: Per-item integrity checks

The system SHALL report two per-item defects that require no cross-seed context but were previously unchecked: two identical options inside a single-answer item, and a rotation whose angle is a multiple of the rotated shape's own rotational symmetry period.

#### Scenario: Duplicate options in a single-answer item

- **WHEN** a `single_select` item lists the same option text twice
- **THEN** a critical duplicate-option issue is reported

#### Scenario: Repeated instances in a multi-answer item are legitimate

- **WHEN** a `multi_select` item lists the same object text three times because three such objects are on screen for the child to select
- **THEN** no duplicate-option issue is reported

#### Scenario: A rotation that leaves the shape unchanged

- **WHEN** an item specifies a regular pentagon rotated by 72°, or a regular hexagon rotated by 60°
- **THEN** a critical rotation issue is reported, because the shape maps onto itself and no rotation is visible
- **AND** the same shapes rotated by 36° and 30° are accepted

### Requirement: Corpus checks require a corpus

Corpus-scope checks SHALL run only when a sufficiently large share of the programme is being linted, and the tool SHALL say when it has skipped them. Linting a single week MUST NOT report a diversity failure.

#### Scenario: Linting one week

- **WHEN** the linter is pointed at a single seed file
- **THEN** the corpus section is skipped with a message explaining why

## MODIFIED Requirements

### Requirement: Per-skill exercise validation

The system SHALL provide a validator per `pho` skill that returns the list of defects in a proposed exercise, encoding that skill's anti-patterns, and SHALL support an `easy` level that additionally blocks near-rhyme pairs, the `l`/`n` onset pair, the `hỏi`/`ngã` tone pair, and reduplicative words. Validators SHALL reject words absent from the curated inventory unless the caller explicitly opts in. The onset validator SHALL additionally reject a sample word that has no initial consonant, because two zero-onset words share an onset only in the sense of both lacking one, which is not the skill's construct.

#### Scenario: Rhyme exercise must have exactly one answer

- **WHEN** validating a rhyme exercise whose sample is `lá` and whose options are `cá` and `gà`
- **THEN** the validator reports that more than one option shares the sample's rhyme

#### Scenario: Onset exercise respects Northern neutralization

- **WHEN** validating an onset exercise whose sample is `dao` and whose options are `giày` and `rắn`
- **THEN** the validator reports more than one correct answer, because all three share the Northern onset sound

#### Scenario: A zero-onset sample is refused

- **WHEN** validating an onset exercise whose sample is `áo` and whose options include `ong`
- **THEN** the validator reports that the sample has no initial consonant, rather than treating the two as a match

#### Scenario: Level gates the extra rules

- **WHEN** validating a rhyme exercise pairing the rhymes `an` and `ang`
- **THEN** it is reported as a near-rhyme defect at the `easy` level
- **AND** it passes at the `hard` level
