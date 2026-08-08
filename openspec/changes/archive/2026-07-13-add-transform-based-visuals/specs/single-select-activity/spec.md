# single-select-activity Specification (delta)

## ADDED Requirements

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
