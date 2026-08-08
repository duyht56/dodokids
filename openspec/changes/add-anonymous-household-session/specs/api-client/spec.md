## MODIFIED Requirements

### Requirement: Auth token được attach vào mọi request

The API client SHALL read the anonymous device bearer from secure platform storage through the session store and add `Authorization: Bearer <credential>` to every protected request. It SHALL NOT persist the device secret in AsyncStorage, application logs, analytics, crash attributes, or request error messages.

#### Scenario: Protected request khi session đã bootstrap

- **WHEN** a protected API request is sent after anonymous session bootstrap
- **THEN** the interceptor adds the current device bearer to the `Authorization` header

#### Scenario: Public bootstrap request

- **WHEN** registration or recovery is called before an authenticated session exists
- **THEN** the request is allowed without an authorization header

### Requirement: 401 response kích hoạt anonymous session recovery

The API client SHALL intercept `401` responses, invalidate the current anonymous device session, lock parent access, and route to the anonymous recovery/bootstrap flow. It SHALL NOT route to conventional email/password login. A `403` response SHALL remain a resource authorization error and SHALL NOT clear the device credential.

#### Scenario: Device credential hết hiệu lực

- **WHEN** any protected request returns `401`
- **THEN** the client clears the invalid bearer from active memory and secure storage
- **AND** presents household recovery or new-household creation

#### Scenario: Household không sở hữu resource

- **WHEN** a request returns `403`
- **THEN** the client reports an authorization error
- **AND** preserves the current device credential

## ADDED Requirements

### Requirement: Anonymous session bootstraps before child APIs

The mobile app SHALL load an existing credential from secure storage or generate and register a new app-scoped device ID and secret before onboarding, child lookup, lesson, progress, parent, or IAP APIs run.

#### Scenario: First app launch

- **WHEN** secure storage contains no device credential
- **THEN** the app generates a cryptographically random credential and registers it
- **AND** child onboarding starts only after registration succeeds

#### Scenario: Returning app launch

- **WHEN** secure storage contains a credential
- **THEN** the app restores it into active memory before protected API requests run

