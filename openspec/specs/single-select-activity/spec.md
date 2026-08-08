# single-select-activity Specification

## Purpose
TBD - created by archiving change epic-005-activity-types. Update Purpose after archive.
## Requirements
### Requirement: Question image and option grid
The system SHALL display the question image from `payload.questionImage` in the upper part of the content zone, with the options rendered in the grid defined by `payload.layout`: `grid_2x2` (2×2, four options), `grid_2x1` (two larger cards), or `row_3` (three options in a horizontal row).

#### Scenario: 2×2 layout
- **WHEN** `layout` is `grid_2x2` and there are four options
- **THEN** options render in a 2×2 grid with 16pt gaps and 16pt corner radius

#### Scenario: Row layout
- **WHEN** `layout` is `row_3` and there are three options
- **THEN** options render in a single horizontal row

### Requirement: Option card presentation
Each option card SHALL render the image from its `assetRef.imageUrl` at a minimum of 120×120pt with a soft shadow, showing a loading indicator while the image loads and a gray placeholder if it fails.

#### Scenario: Image loading state
- **WHEN** an option image has not finished loading
- **THEN** an activity indicator is shown in place of the image

#### Scenario: Image failure fallback
- **WHEN** an option image fails to load
- **THEN** a gray placeholder is shown instead of a broken image

### Requirement: Single-select tap behavior
On tapping an option the system SHALL apply visual feedback within 100ms (scale to ~0.95), immediately disable all other options, and report the outcome to the container by comparing the tapped option to `payload.correctAnswer`.

#### Scenario: Correct option tapped
- **WHEN** the tapped option id equals `correctAnswer`
- **THEN** other options are disabled and the container is notified of a correct outcome

#### Scenario: Wrong option tapped
- **WHEN** the tapped option id does not equal `correctAnswer`
- **THEN** the container is notified of a wrong outcome with the current attempt number

### Requirement: Option cards support semantic display variants

A single-select option MAY include a semantic `displayVariant` of `normal`, `small`, `large`, `short`, `long`, `low`, or `tall`. Mobile and web SHALL map these values to fixed versioned display presets and SHALL NOT accept arbitrary LLM-provided scale values.

#### Scenario: Big and small reuse one sprite

- **WHEN** two options reference the same approved sprite with variants `small` and `large`
- **THEN** both render the same object identity with a controlled uniform-size difference

#### Scenario: Missing display variant preserves legacy rendering

- **WHEN** an option has no `displayVariant`
- **THEN** it renders as `normal` using existing option-card behavior

### Requirement: Sided visual comparison uses an explicit skill/action allowlist

The R12 `questionImage` requirement SHALL be waived only for sided visual comparison, defined by an explicit allowlist: `single_select` combined with a skill in {`math_compare_size`, `math_compare_length`, `math_compare_height`}. For those activities the two options ARE the comparison and `questionImage` SHALL be absent. All other `single_select` activities SHALL still require `questionImage`. `compare_tap` SHALL continue to validate through its own `validateCompareTap` path and SHALL NOT pass through the display-variant comparison branch.

#### Scenario: Compare-size activity omits questionImage

- **WHEN** a `math_compare_size` `single_select` activity presents two options as the compared objects
- **THEN** validation accepts the absent `questionImage` and does not require one

#### Scenario: Ordinary single-select still requires questionImage

- **WHEN** a `single_select` activity whose skill is not in the sided-visual-compare allowlist omits `questionImage`
- **THEN** validation rejects it under R12

#### Scenario: Compare-tap does not enter the comparison branch

- **WHEN** a `math_compare_quantity` activity uses `compare_tap`
- **THEN** it validates through `validateCompareTap` and is unaffected by the display-variant comparison rules

### Requirement: Transform-based comparisons isolate one intended dimension

For big/small, long/short, or tall/short comparison activities, compared options SHALL reference the same canonical sprite identity, share the same surface/alignment, and differ only in an asset-approved display dimension. The visual difference SHALL meet a configured preschool perception threshold.

#### Scenario: Long and short pencil comparison

- **WHEN** a horizontal-stretch-safe pencil is rendered as `short` and `long`
- **THEN** both options keep the same identity, color, view, and background while differing by the controlled horizontal preset

#### Scenario: Independent generated options are rejected

- **WHEN** a transform-based comparison uses two different generated asset identities for what should be the same object
- **THEN** deterministic validation rejects or flags the activity before approval

### Requirement: Transform presets cannot represent invalid constructs

The system SHALL NOT use display scale/stretch as evidence for weight, capacity, filled/empty, or other state-dependent constructs. Those skills require purpose-built visual evidence.

#### Scenario: Weight comparison cannot use large and small

- **WHEN** `math_compare_weight` attempts to represent heavy/light only with `large` and `small` variants
- **THEN** deterministic validation rejects the activity

#### Scenario: Deferred weight/capacity skills are guarded at authoring

- **WHEN** a seed targets `math_compare_weight` or `math_compare_capacity`
- **THEN** the generator/lint rejects it with a stable error code until a valid visual mechanic exists

