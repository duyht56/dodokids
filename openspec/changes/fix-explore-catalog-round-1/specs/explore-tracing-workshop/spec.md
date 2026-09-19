## MODIFIED Requirements

### Requirement: Progressive tracing evaluation
The mobile evaluator SHALL assess ordered-stroke progress using a level-scaled corridor and direction/progress constraints. It SHALL not accept jumping directly to the end and SHALL preserve previously completed strokes after a local deviation. Evaluation SHALL depend only on the geometry of the gesture, never on how long the child took to draw it: raw touch samples SHALL be decimated by distance travelled (a sample is kept once the finger has moved at least `MIN_RAW_TRACING_POINT_DISTANCE` from the last kept point), the lift-off point SHALL always be kept, and the only count bound on raw capture SHALL be a memory safety net (`MAX_RAW_TRACING_POINTS`) that a complete trace of any bundled stroke cannot reach. The resample limit applied before evaluation SHALL leave at least 1.5x the length of the longest bundled stroke, so hand wobble on a slow trace cannot truncate a complete stroke. Where a stroke retraces itself, the evaluator SHALL resolve spatially tied path segments by the finger's heading so progress never walks backwards along the segment just traced.

#### Scenario: Child leaves current corridor
- **WHEN** the gesture deviates beyond the allowed corridor on the current stroke
- **THEN** only the current local segment requests guidance and completed strokes remain complete

#### Scenario: Child traces slowly
- **WHEN** a child takes 6 s or 10 s (≥360 touch samples at 60 Hz) to trace a bundled stroke that a fast trace of the same geometry completes
- **THEN** the ink keeps following the finger for the whole stroke, every sample after the third second is still captured, and the evaluation accepts the stroke with the same outcome as the fast trace

#### Scenario: Finger rests on one spot
- **WHEN** the finger stays within `MIN_RAW_TRACING_POINT_DISTANCE` of the last kept point for any length of time
- **THEN** no additional raw points are kept and the captured trail is unchanged

#### Scenario: Finger lifts off
- **WHEN** the finger lifts (or the gesture is terminated) at a position closer than `MIN_RAW_TRACING_POINT_DISTANCE` to the last kept point
- **THEN** the lift-off position is still appended so the trace and its evaluation end exactly where the finger did

#### Scenario: Fast trace is unchanged
- **WHEN** a stroke is traced quickly enough that consecutive samples are already at least `MIN_RAW_TRACING_POINT_DISTANCE` apart
- **THEN** every sample is kept and resampling/evaluation produce the same result as before distance decimation

#### Scenario: Stroke retraces itself
- **WHEN** a stroke is drawn over a segment it already contains in the opposite direction (the right stem of `u`/`ư`) and the finger turns back along it
- **THEN** the projection follows the segment whose direction matches the finger's heading, progress keeps increasing through the turn, and an on-path trace of the stroke is accepted at every level

## ADDED Requirements

### Requirement: Tracing presents the shared mascot
The tracing renderer SHALL present Đô Đô through the shared Explore mascot component. It MUST NOT render an emoji as a stand-in for the mascot or as a UI icon; emoji remain permitted only as countable content.

#### Scenario: Tracing exercise is shown
- **WHEN** a tracing exercise mounts in the workshop or the generic Explore play screen
- **THEN** the instruction row shows the Đô Đô mascot component and contains no emoji placeholder
