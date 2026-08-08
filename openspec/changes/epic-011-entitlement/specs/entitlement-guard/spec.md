## ADDED Requirements

### Requirement: Server-side week-access policy

The server SHALL decide whether a child may access a given lesson week based on the child's `entitlement.plan` and `entitlement.status`, never trusting the client. The policy MUST be:

- `trial` → weeks 1–2 only
- `monthly` → the child's current week plus 4 weeks ahead
- `annual` → all 48 weeks
- `expired` → weeks 1–2 only (trial content)

#### Scenario: Trial child accesses a trial week

- **WHEN** a child with `status: 'trial'` requests a lesson in week 1 or 2
- **THEN** access is allowed

#### Scenario: Trial child accesses a paid week

- **WHEN** a child with `status: 'trial'` requests a lesson in week 3 or later
- **THEN** access is denied

#### Scenario: Annual subscriber accesses any week

- **WHEN** a child with `plan: 'annual'` and `status: 'active'` requests a lesson in any week 1–48
- **THEN** access is allowed

#### Scenario: Monthly subscriber accesses within window

- **WHEN** a child with `plan: 'monthly'` at current week N requests a lesson in week ≤ N+4
- **THEN** access is allowed
- **AND** a request for a week > N+4 is denied

#### Scenario: Expired subscriber falls back to trial content

- **WHEN** a child with `status: 'expired'` requests a lesson in week 3 or later
- **THEN** access is denied
- **AND** a request for week 1 or 2 is allowed

### Requirement: Entitlement guard blocks lesson endpoints

A NestJS guard SHALL apply the week-access policy to the lesson read endpoints (`GET /lessons/today`, `GET /lessons/:lessonId`). The guard MUST resolve the target week (today's week from the child for `/today`; the week parsed from the `w{week}-d{day}-{subject}` lessonId for `/:lessonId`) and the child's entitlement before the handler runs. When access is denied it MUST respond `403` with `{ requiresUpgrade: true }`.

#### Scenario: Blocked access returns 403 requiresUpgrade

- **WHEN** the guard denies access to a requested lesson week
- **THEN** the response is `403 Forbidden` with body `{ "requiresUpgrade": true }`
- **AND** the lesson handler does not run (no content is returned)

#### Scenario: Allowed access proceeds to the handler

- **WHEN** the guard allows access to the requested week
- **THEN** the lesson handler runs and returns the lesson normally

#### Scenario: Missing or unknown child

- **WHEN** the guard cannot resolve a child for the request
- **THEN** the existing not-found / bad-request behavior of the handler is preserved (the guard does not mask it)
