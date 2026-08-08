## ADDED Requirements

### Requirement: Configurable production target

The pipeline publish client SHALL send content to the server URL given by the `KIDO_SERVER_URL` environment variable, defaulting to `http://localhost:3001` when unset. Publishing to production is performed by setting `KIDO_SERVER_URL` to the production API origin (`https://api.dodokids.vn`). The target MUST NOT be hard-coded in source.

#### Scenario: Publish targets production

- **WHEN** `KIDO_SERVER_URL` is set to `https://api.dodokids.vn` and the operator runs the publish
- **THEN** the client POSTs the publish payload to `https://api.dodokids.vn/admin/publish`

#### Scenario: Default target is local

- **WHEN** `KIDO_SERVER_URL` is unset
- **THEN** the client publishes to `http://localhost:3001`

### Requirement: Authenticated publish client

The pipeline publish client SHALL attach the shared publish token on every request to the server, sourced from the `KIDO_PUBLISH_TOKEN` environment variable. If `KIDO_PUBLISH_TOKEN` is unset when publishing to a non-local target, the client MUST fail fast with a clear error rather than sending an unauthenticated request.

#### Scenario: Token is attached

- **WHEN** the client sends a publish request and `KIDO_PUBLISH_TOKEN` is set
- **THEN** the request carries the token in the agreed auth header

#### Scenario: Missing token to production is refused

- **WHEN** `KIDO_SERVER_URL` points at production and `KIDO_PUBLISH_TOKEN` is unset
- **THEN** the client aborts with an error and sends nothing

### Requirement: Dry-run before real publish

The publish tooling SHALL support a `--dry-run` mode that rehearses the server-side guard (schema + asset-URL reachability) and reports results without uploading assets or writing to the server database. The documented operator flow for production MUST run a dry-run first and only proceed to a real publish when the dry-run reports no rejections.

#### Scenario: Dry-run writes nothing

- **WHEN** the operator runs the publish with `--dry-run` against production
- **THEN** the guard report is returned and no server document is written and no assets are uploaded

#### Scenario: Real publish follows a clean dry-run

- **WHEN** a dry-run for a week reports zero rejections
- **THEN** the operator runs the real publish for that week

### Requirement: Publish secrets are never committed

The publish token and production target SHALL be provided via environment variables only. They MUST NOT be committed to the repository. `.env.example` files SHALL document the variable names with empty or placeholder values.

#### Scenario: Token lives in env only

- **WHEN** the repository is inspected
- **THEN** no real `KIDO_PUBLISH_TOKEN` value is present in tracked files; only the variable name appears in `.env.example`
