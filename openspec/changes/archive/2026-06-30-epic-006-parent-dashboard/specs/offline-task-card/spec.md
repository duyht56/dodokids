## ADDED Requirements

### Requirement: Four-State Rendering
`OfflineTaskCard` SHALL render one of four visual states based on the `status` prop: `pending`, `done`, `skipped`, or `empty`.

#### Scenario: Pending state
- **WHEN** `status === 'pending'`
- **THEN** the card renders task text, week/subject labels, and two action buttons: "✅ Đã làm" (coral) and "⏭ Bỏ qua" (ghost/outline)

#### Scenario: Done state
- **WHEN** `status === 'done'`
- **THEN** the card renders with green left border, a checkmark icon, task text, and `completedAt` formatted as "Đã làm lúc {HH:mm}"; action buttons are hidden

#### Scenario: Skipped state
- **WHEN** `status === 'skipped'`
- **THEN** the card renders with amber left border, a skip icon, task text, and label "Đã bỏ qua"; action buttons are hidden

#### Scenario: Empty state
- **WHEN** `status === 'empty'`
- **THEN** the card renders a placeholder message "Chưa có nhiệm vụ tuần này" without action buttons

### Requirement: Action Callbacks
The component SHALL expose `onDone: () => void` and `onSkip: () => void` callback props. Both callbacks SHALL only be callable when `status === 'pending'`; in other states they are ignored.

#### Scenario: Tap Đã làm
- **WHEN** `status === 'pending'` and user taps "✅ Đã làm"
- **THEN** `onDone()` is called exactly once; the parent component is responsible for state update

#### Scenario: Tap Bỏ qua
- **WHEN** `status === 'pending'` and user taps "⏭ Bỏ qua"
- **THEN** `onSkip()` is called exactly once

### Requirement: Props Interface
The component SHALL accept these props matching the `OfflineTaskCard` component API in the design system:
- `status: 'pending' | 'done' | 'skipped' | 'empty'`
- `week: string` — e.g., "Tuần 3"
- `lesson: string` — lesson name
- `subject: string` — subject label
- `task: string` — task description text
- `doneAt?: string` — ISO timestamp shown in done/skipped state
- `onDone: () => void`
- `onSkip: () => void`

#### Scenario: Props type safety
- **WHEN** the component is rendered with an invalid `status` value at compile time
- **THEN** TypeScript reports a type error
