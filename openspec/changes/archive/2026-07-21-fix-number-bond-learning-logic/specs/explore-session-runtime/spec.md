## MODIFIED Requirements

### Requirement: Transient play run
Starting a game SHALL create a new in-memory run whose validated game-owned policy contains 5–10 interactions. Games without an explicit policy retain their current run size. `number_bond` SHALL declare exactly ten interactions: five for whole 5 followed by five for whole 10. Run state SHALL NOT be persisted or transmitted.

#### Scenario: Number-bond run starts
- **WHEN** the registered `number_bond` game is opened
- **THEN** the shell resolves its ten-slot plan and displays progress against 10

#### Scenario: Existing game starts
- **WHEN** a game without the number-bond policy is opened
- **THEN** its current run-size and level behavior remain unchanged

### Requirement: Validated game-owned run plan
A game-owned run plan SHALL declare ordered generation slots whose level and constraints are validated before rendering. The shell SHALL derive batch size and progress from the plan and MUST NOT mutate slot selection from child performance.

#### Scenario: Slot total or anchor is invalid
- **WHEN** a number-bond envelope does not match its authored whole or prefilled part
- **THEN** run creation fails closed instead of presenting a partial or inconsistent run
