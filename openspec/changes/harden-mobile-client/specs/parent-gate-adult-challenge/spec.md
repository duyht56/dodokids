## ADDED Requirements

### Requirement: First-run parent setup is gated by an adult challenge
On first-run parent-area entry (no PIN configured yet), the parent gate SHALL present an adult-verification challenge before allowing PIN creation. The challenge SHALL be a task a young child is unlikely to complete (arithmetic with the operands spelled out in words).

#### Scenario: Challenge precedes PIN creation on first run
- **WHEN** the parent gate opens and no PIN has been configured
- **THEN** an adult-verification challenge is shown first; the PIN-creation UI is not shown until the challenge is answered correctly

#### Scenario: Wrong answer regenerates the challenge
- **WHEN** the challenge answer is incorrect
- **THEN** an error is shown and a new challenge is generated; PIN creation remains hidden

#### Scenario: Verify path is unchanged
- **WHEN** a PIN already exists
- **THEN** the gate shows PIN entry directly (no challenge); server-side lockout/rate-limiting continues to protect verification
