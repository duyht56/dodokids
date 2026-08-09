## ADDED Requirements

### Requirement: Parent-PIN and recovery failure counting is atomic
Failure accounting for the parent PIN and recovery code SHALL use atomic database increments so that concurrent failed attempts cannot collapse into a single increment. The lockout threshold MUST be enforced reliably under concurrency.

#### Scenario: Concurrent wrong PINs each count
- **WHEN** N concurrent `POST /anonymous-sessions/parent-pin/verify` requests with wrong PINs are processed for one household
- **THEN** `failedPinAttempts` reflects N increments (no lost updates), and once it reaches `MAX_SECURITY_FAILURES` the household is locked (`pinLockedUntil` set)

#### Scenario: Successful verify resets counters atomically
- **WHEN** a correct PIN is verified while a nonzero `failedPinAttempts` or a stale `pinLockedUntil` exists
- **THEN** `failedPinAttempts` is reset to 0 and `pinLockedUntil` is cleared via an atomic update, without overwriting concurrent writes with stale in-memory values

#### Scenario: Recovery failures use the same atomic pattern
- **WHEN** a recovery attempt fails (`POST /anonymous-sessions/recover`)
- **THEN** `failedRecoveryAttempts` is incremented atomically and `recoveryLockedUntil` is set once the threshold is exceeded

#### Scenario: Locked household is refused before scrypt
- **WHEN** a request arrives while `pinLockedUntil`/`recoveryLockedUntil` is in the future
- **THEN** the server responds 429 (`parent_proof_locked`) without running the slow hash
