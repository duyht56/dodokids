## ADDED Requirements

### Requirement: One audio plan shared by every execution path

The system SHALL derive from a single module which audio clips an activity needs, the language each is spoken in, and the key scheme used to store it. Both the CLI pipeline and the queue workers SHALL consume that module rather than restating the rules.

#### Scenario: English narration is not spoken in Vietnamese

- **WHEN** an activity of the English subject is processed by the queue path
- **THEN** its question, praise and first hint are synthesised in English
- **AND** its second hint and explanation are synthesised in Vietnamese

#### Scenario: Listening activities get their answer clips

- **WHEN** an `audio_select` activity is processed by the queue path
- **THEN** a clip job is created for every option carrying an audio reference
- **AND** each finished clip is written into that option's audio reference rather than into the activity's narration files

### Requirement: Clip keys preserve Vietnamese diacritics

Lesson library clips SHALL be keyed by a scheme that distinguishes words differing only in diacritics, because tone is phonemic in Vietnamese. The existing ASCII scheme SHALL remain available and unchanged for the already-approved Explore clip pack.

#### Scenario: Words differing only in tone are separate clips

- **WHEN** clips are requested for `bàn`, `bán` and `bạn`
- **THEN** each receives a distinct key and its own audio file

#### Scenario: Words without diacritics keep their existing key

- **WHEN** a clip is requested for an English word
- **THEN** its key is identical under both schemes

### Requirement: Publish refuses a week with incomplete media

Building a publish payload SHALL refuse a week in which any activity has an asset reference without a usable image URL, an empty narration slot, or an answer option without audio. The refusal SHALL name the affected activities. It SHALL apply to dry runs as well.

#### Scenario: A failed image does not reach production

- **WHEN** an activity carries an asset id whose image URL is null or empty
- **THEN** the publish is refused, naming that activity and asset

#### Scenario: A silent activity does not reach production

- **WHEN** an activity has an empty narration slot
- **THEN** the publish is refused, naming the slot

#### Scenario: Answer options must be audible

- **WHEN** a listening activity has an option with no audio URL
- **THEN** the publish is refused

### Requirement: A week is complete only when all five days are

Week completeness SHALL require every one of the five lesson days. It MUST NOT assume that only some days carry lessons.

#### Scenario: A week missing the language days is incomplete

- **WHEN** a week has approved activities for the two math days but not the others
- **THEN** the week is not complete and cannot publish

### Requirement: Activities without a question image are still normalised

Payload normalisation SHALL fully process select activities that carry no question image, since audio-prompt subjects deliberately omit one. Options, correct answers and layout SHALL be normalised, and the question image key SHALL be omitted rather than emitted empty.

#### Scenario: An audio-prompt select activity is normalised

- **WHEN** normalising a single-select activity that has options but no question image
- **THEN** the options receive identifiers, the correct answer is derived, and the layout is sanitised
- **AND** no question image key is present in the result
