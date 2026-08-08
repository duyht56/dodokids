# api-client

## Purpose

Defines requirements for the API client setup in the Kido app, covering the Axios singleton, auth token injection, 401 handling, React Query configuration, and error type definitions.

## Requirements

### Requirement: Axios instance configured with baseURL
The system SHALL have a singleton Axios instance in `services/api.ts` with `baseURL` resolved from environment config (DEV/STAGING/PROD).

#### Scenario: Request uses correct baseURL per environment
- **WHEN** app is built with `ENV=production`
- **THEN** all API calls use the production `BASE_URL`

### Requirement: Auth token attached to every request
The Axios instance SHALL have a request interceptor that attaches `Authorization: Bearer <token>` from `authStore`.

#### Scenario: Token is added to outgoing request
- **WHEN** authenticated user makes any API call
- **THEN** request header contains `Authorization: Bearer <token>`

### Requirement: 401 response triggers logout
The Axios instance SHALL have a response interceptor that clears `authStore` and redirects to AuthStack on 401.

#### Scenario: 401 response logs out user
- **WHEN** server responds with 401
- **THEN** `authStore` is cleared and user is navigated to AuthStack

### Requirement: React Query configured as global provider
The system SHALL wrap the app in `QueryClientProvider` with sensible defaults (staleTime: 5min, retry: 2).

#### Scenario: Query result is cached
- **WHEN** same query is called twice within 5 minutes
- **THEN** second call returns cached data without a new network request

### Requirement: Error types defined
The system SHALL define a `ApiError` TypeScript type for consistent error handling across the app.

#### Scenario: API error is typed
- **WHEN** an API call fails
- **THEN** the caught error conforms to the `ApiError` interface
