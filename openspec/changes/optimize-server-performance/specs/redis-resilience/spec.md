## ADDED Requirements

### Requirement: Redis client recovers after a transient outage
The shared Redis client SHALL keep attempting to reconnect after a connection drop (bounded backoff), and individual commands MUST NOT hang indefinitely while disconnected. Cache access remains fail-open.

#### Scenario: Reconnect after a blip
- **WHEN** Redis becomes briefly unavailable and then returns
- **THEN** the client reconnects on its own (retryStrategy returns a bounded delay, not null) without a process restart

#### Scenario: Commands fail fast during an outage
- **WHEN** Redis is unreachable
- **THEN** a cache command fails after a bounded number of retries and `RedisService` treats it as a miss (returns null), so the request falls through to the database rather than hanging
