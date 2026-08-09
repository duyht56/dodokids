## ADDED Requirements

### Requirement: Paid entitlement is not persisted as authoritative on device
The mobile subscription store SHALL NOT persist the authoritative entitlement fields (`plan`, `status`, `paidWeeks`, `expiresAt`). It reconciles from the server on launch; the client store is a UI cache only.

#### Scenario: Only non-authoritative fields persist
- **WHEN** the subscription store persists to AsyncStorage
- **THEN** only non-authoritative fields (e.g. `trialStartDate`) are written; `plan`/`status`/`paidWeeks`/`expiresAt` are not

#### Scenario: Launch reconciles from the server
- **WHEN** the app launches with a ready session and a child
- **THEN** `useIapBootstrap` fetches the server entitlement and sets the store from it

#### Scenario: Tampered persisted value cannot grant paid UI
- **WHEN** a device's persisted storage is edited to `status:'active'`
- **THEN** on next launch the store starts at its default (`trial`) and only a successful server fetch can set `active`; a tampered persisted value is not trusted
