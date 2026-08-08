## ADDED Requirements

### Requirement: Binary Completion Rendering
`OfflineTaskCard` SHALL render one of three visual states: `pending`, `completed`, or `empty`. It SHALL render reviewed task title/body/safety content for non-empty states and SHALL NOT support a skipped state.

#### Scenario: Pending state
- **WHEN** `status === 'pending'`
- **THEN** the card renders task content and one completion action without a skip action

#### Scenario: Completed state
- **WHEN** `status === 'completed'`
- **THEN** the card renders its completed treatment and formatted `completedAt` when available

#### Scenario: Empty state
- **WHEN** `status === 'empty'`
- **THEN** the card renders the supplied unlock-specific empty message without a completion action

## MODIFIED Requirements

### Requirement: Action Callbacks
The component SHALL expose one completion callback that receives the requested boolean state and an optional “Xem tất cả” callback for Dashboard use. The completion control SHALL be disabled while `busy` is true. The component SHALL expose no `onSkip` callback.

#### Scenario: Mark completed
- **WHEN** a pending card's completion control is activated while not busy
- **THEN** the callback is invoked exactly once with `true`

#### Scenario: Unmark completed
- **WHEN** a completed card's checkbox is activated while not busy
- **THEN** the callback is invoked exactly once with `false`

#### Scenario: Busy card blocks duplicate action
- **WHEN** `busy` is true
- **THEN** activating the completion control does not invoke another callback

### Requirement: Props Interface
The component SHALL accept a fully typed contract containing task identity/content, `status: 'pending' | 'completed' | 'empty'`, optional `completedAt`, optional `busy`, one boolean completion callback, and an optional open-all callback. The interface SHALL NOT contain `skipped` or `onSkip`.

#### Scenario: Props type safety
- **WHEN** a caller supplies `status: 'skipped'` or an `onSkip` prop
- **THEN** TypeScript reports a type error

## REMOVED Requirements

### Requirement: Four-State Rendering
**Reason**: The canonical per-lesson task model is binary and the product no longer records “skipped.”

**Migration**: Map existing `done` UI state to `completed`; pending and empty remain. Remove skipped visuals and actions.
