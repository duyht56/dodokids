## ADDED Requirements

### Requirement: No per-request debug logging in production
The server SHALL NOT log every incoming request's method/url/ip unconditionally.

#### Scenario: Debug request logger removed
- **WHEN** the app bootstraps
- **THEN** there is no unconditional middleware that logs `[REQ] <method> <url> from <ip>` for every request
