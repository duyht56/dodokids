## ADDED Requirements

### Requirement: CORS is restricted to an allowlist, not wildcard
The server SHALL NOT reflect an arbitrary origin. Allowed browser origins come from an env allowlist; when unset, cross-origin browser access is disabled.

#### Scenario: Default disables cross-origin browser access
- **WHEN** `CORS_ALLOWED_ORIGINS` is unset
- **THEN** CORS is configured with `origin: false` (no wildcard, no reflected origin)

#### Scenario: Explicit allowlist is honored
- **WHEN** `CORS_ALLOWED_ORIGINS` lists one or more origins
- **THEN** only those origins are allowed

#### Scenario: Native app and publish unaffected
- **WHEN** the native app or the server-to-server publish client calls the API
- **THEN** requests succeed (they do not depend on CORS)
