## ADDED Requirements

### Requirement: Tracing live-trail re-renders are distance-throttled without losing evaluation fidelity
The tracing renderer SHALL throttle the re-render dispatches during a drag by movement distance, while retaining every sampled point for gesture evaluation.

#### Scenario: Sub-threshold moves do not re-render
- **WHEN** a pointer-move sample is within `MIN_APPEND_DISTANCE` of the last dispatched point
- **THEN** no `append` is dispatched (no re-render), but the point is still recorded for evaluation

#### Scenario: Evaluation fidelity is unchanged
- **WHEN** a stroke gesture is released and evaluated
- **THEN** the evaluation uses the full set of sampled points (`gesturePoints`), identical to before the throttle

#### Scenario: Throttle state resets per stroke
- **WHEN** a gesture begins, finishes, or the component unmounts
- **THEN** the last-dispatched-point tracker is reset so the next stroke throttles from its own start
