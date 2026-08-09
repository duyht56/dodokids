## ADDED Requirements

### Requirement: Global per-IP rate limiting
The server SHALL apply a global rate limit to every route, keyed by client IP, backed by Redis. It MUST fail open (allow the request) when Redis is unavailable. The real client IP MUST be resolved from the trusted proxy (`X-Forwarded-For` behind Caddy).

#### Scenario: Requests over the default limit are throttled
- **WHEN** a single IP exceeds the default limit within the window on any route without a stricter override
- **THEN** the server responds 429 (`Too Many Requests`)

#### Scenario: Redis outage fails open
- **WHEN** Redis is unreachable and the rate-limit counter cannot be read/incremented
- **THEN** the request is allowed (no 429 solely due to Redis failure)

#### Scenario: Client IP is taken from the proxy
- **WHEN** requests arrive through Caddy which sets `X-Forwarded-For`
- **THEN** rate-limit keys use the forwarded client IP, not the proxy's address (`trust proxy` enabled)

### Requirement: Stricter per-route limits on sensitive endpoints
Auth, recovery, IAP, activation-code, and publish endpoints SHALL declare tighter per-route limits via a `@RateLimit` decorator, overriding the default.

#### Scenario: Unauthenticated registration is bounded
- **WHEN** an IP repeatedly calls `POST /anonymous-sessions/register`
- **THEN** it is limited (e.g. ≤10/min) to prevent unbounded household/device creation

#### Scenario: PIN verification is rate limited
- **WHEN** an IP repeatedly calls `POST /anonymous-sessions/parent-pin/verify`
- **THEN** it is limited (e.g. ≤5/min), backstopping the atomic lockout against concurrent brute force

#### Scenario: Recovery and activation-code guessing are bounded
- **WHEN** an IP repeatedly calls `POST /anonymous-sessions/recover` or `POST /iap/activation-code/redeem`
- **THEN** each is limited (e.g. ≤5/min and ≤10/min respectively)

#### Scenario: IAP and publish endpoints are bounded
- **WHEN** an IP repeatedly calls `POST /iap/*` or `POST /admin/publish`
- **THEN** each is limited (e.g. IAP ≤20/min, publish ≤10/min), reducing outbound-call amplification and SSRF probing
