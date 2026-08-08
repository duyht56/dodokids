## ADDED Requirements

### Requirement: Authenticated publish ingest

The publish ingest endpoint (`POST /admin/publish`) SHALL require a valid shared publish token. A request that omits the token or presents an invalid one MUST be rejected with HTTP `401` and MUST NOT write, upsert, or mutate any server document. The token is read from the server's `PUBLISH_TOKEN` configuration; when `PUBLISH_TOKEN` is unset the endpoint MUST reject all ingest requests (fail closed) rather than accepting them unauthenticated.

#### Scenario: Valid token is accepted

- **WHEN** a publish request presents the token matching the server's `PUBLISH_TOKEN`
- **THEN** the request proceeds to the deterministic guard and idempotent upsert as specified

#### Scenario: Missing or invalid token is rejected

- **WHEN** a publish request omits the token or presents a value that does not match `PUBLISH_TOKEN`
- **THEN** the server responds `401` and writes nothing to the database

#### Scenario: Unset server token fails closed

- **WHEN** the server has no `PUBLISH_TOKEN` configured and receives a publish request
- **THEN** the server rejects the request rather than ingesting it unauthenticated
