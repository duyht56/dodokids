## ADDED Requirements

### Requirement: Cleartext HTTP is dev-only; release enforces HTTPS
Android cleartext traffic SHALL be permitted only in development builds, and the API client SHALL NOT silently fall back to an http origin in non-dev builds.

#### Scenario: Cleartext disabled for an https release
- **WHEN** the app is built with `KIDO_API_URL` set to an https origin (or unset for release)
- **THEN** `android.usesCleartextTraffic` resolves to false

#### Scenario: Cleartext enabled for dev
- **WHEN** the app runs in development (no `KIDO_API_URL`, or an http one)
- **THEN** `android.usesCleartextTraffic` resolves to true so LAN Metro hosts are reachable

#### Scenario: No silent http fallback in non-dev
- **WHEN** `KIDO_API_URL` is unset in a non-dev build
- **THEN** the API base URL falls back to `https://api.dodokids.vn`, never `http://localhost`; a non-dev http base URL logs a warning

#### Scenario: Auth behavior unchanged
- **WHEN** requests are made
- **THEN** the anonymous bearer attachment and the `anonymous_session_invalid` 401 handling are unchanged
