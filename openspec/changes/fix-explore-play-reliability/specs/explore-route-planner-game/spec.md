## ADDED Requirements

### Requirement: Checkpoint ticks follow the order the engine scores
The board SHALL mark a checkpoint done (✓) only when it has been reached in order along the walk so far, exactly as `executeRoute` counts `checkpointProgress`; a checkpoint stepped on before the one it follows SHALL keep showing its number. When repeated runs miss a checkpoint, the support pulse SHALL point at the next checkpoint still owed, not always the first.

#### Scenario: Checkpoint 2 before checkpoint 1
- **WHEN** Đô Đô walks over checkpoint 2, then checkpoint 1, then home
- **THEN** only checkpoint 1 shows ✓, the run asks for the right order, and after support escalates the pulsing cell is checkpoint 2
