## MODIFIED Requirements

### Requirement: Free Explore catalog
The child SHALL be able to open the Explore catalog and start every game whose effective configuration is both enabled and catalog-visible without a subscription check. Each visible card SHALL show its name, illustration and current availability. A game with `catalogVisible: false` SHALL be omitted rather than shown as disabled or coming soon.

#### Scenario: Child opens Explore
- **WHEN** the child selects Explore
- **THEN** all enabled and catalog-visible games are listed without a paywall

#### Scenario: Retained game is hidden
- **WHEN** `tracing_workshop` has effective `catalogVisible: false`
- **THEN** its card is absent while its implementation and registered capability remain installed

### Requirement: Server-operated availability
The catalog SHALL apply public game/config flags that enable, disable or hide games, levels and asset pools without storing child-specific state. Effective catalog visibility SHALL fail closed: a game is visible only when both the compatible bundled definition and any applied server definition permit visibility. An emergency `forceStop` SHALL prevent a new run from starting.

#### Scenario: A game is disabled
- **WHEN** the catalog refreshes public configuration and an otherwise visible game is disabled
- **THEN** the game cannot start and no child history is consulted or changed

#### Scenario: Server metadata is stale
- **WHEN** the server marks a game catalog-visible but the installed bundled definition keeps it hidden
- **THEN** the game remains absent from the child catalog

#### Scenario: Hidden game is opened through a stale direct route
- **WHEN** ordinary navigation requests a game whose effective configuration is not catalog-visible
- **THEN** entry fails closed with a neutral unavailable state and no play data is created

## ADDED Requirements

### Requirement: Visible route-planner replacement
The public catalog SHALL expose `route_planner` as **Dẫn đường cho Đô Đô** when its bundled and server catalog definitions are compatible, enabled and catalog-visible. Hiding Tracing SHALL NOT reuse the `tracing_workshop` game code, thumbnail key or route for the replacement game.

#### Scenario: Replacement catalog is available offline
- **WHEN** the device is offline with the route-planner dependencies installed
- **THEN** the catalog shows Dẫn đường cho Đô Đô as playable offline and omits Tracing

