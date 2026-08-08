## ADDED Requirements

### Requirement: Authenticated admin management surface

The admin management and read surface — `GET /admin/published`, `GET /admin/published/:activityId`, `POST /admin/published/:activityId/unpublish`, `POST /admin/published/:activityId/republish`, and `GET /admin/transfers` — SHALL require the same shared publish token as the ingest endpoint. Requests without a valid token MUST be rejected with HTTP `401` and MUST NOT read or mutate content. This protects the destructive management actions (`unpublish`, `republish`) once the server is reachable from the public internet.

#### Scenario: Unauthenticated management call is rejected

- **WHEN** a request to any `/admin/published*` or `/admin/transfers` route omits or presents an invalid token
- **THEN** the server responds `401` and performs no read or mutation

#### Scenario: Authenticated unpublish proceeds

- **WHEN** a request to `POST /admin/published/:activityId/unpublish` presents the valid token
- **THEN** the unpublish is performed as specified

#### Scenario: Same token as ingest

- **WHEN** a client is configured with the publish token
- **THEN** that single token authorizes both ingest (`/admin/publish`) and the management/read routes
