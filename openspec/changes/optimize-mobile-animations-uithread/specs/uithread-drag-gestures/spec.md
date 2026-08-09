## ADDED Requirements

### Requirement: Drag/tracing interactions run on the UI thread or isolate re-renders
The pattern chip drag, the sort-sequence drag clone, and the tracing live stroke SHALL be driven on the UI thread (reanimated worklet / Skia) or isolate their per-frame update so the whole component tree is not reconciled per input sample. Interaction results MUST be unchanged.

#### Scenario: Pattern chip follows the finger on the UI thread
- **WHEN** a child drags a pattern option chip
- **THEN** the chip transform is updated in a worklet (gesture-handler + reanimated), not committed from JS per frame; dropping over the slot commits the same token a tap would

#### Scenario: Sort-sequence clone tracks the finger without JS-per-frame
- **WHEN** a child drags a sort-sequence card
- **THEN** the floating clone position is written in the pan worklet (runOnJS reserved for start/drop), and it tracks the finger 1:1

#### Scenario: Tracing live stroke does not reconcile the whole SVG per sample
- **WHEN** a child traces a glyph
- **THEN** only the live-trail element updates per sample (memoized static glyph / UI-thread stroke), and stroke accept/reject evaluation is unchanged
