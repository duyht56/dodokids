## ADDED Requirements

### Requirement: Free Explore catalog
The child SHALL be able to open the Explore catalog and start every enabled game without a subscription check. Each card SHALL show its name, illustration and current availability.

#### Scenario: Child opens Explore
- **WHEN** the child selects Explore
- **THEN** all enabled games are listed without a paywall

### Requirement: Explicit offline capability
Each game SHALL declare `runtimeMode` and `offlineCapable`. A game SHALL be marked offline-capable only when its generator, validator, config, required assets/vector paths and required audio are available locally.

#### Scenario: Device is offline
- **WHEN** the catalog is opened without connectivity
- **THEN** offline-capable games can start and server-dependent games show a neutral unavailable state

### Requirement: No resume affordance
The catalog SHALL NOT show “Continue”, recent game, last level, completion, progress or play-history state. Every game entry SHALL start a new transient play run.

#### Scenario: Child returns after exiting a game
- **WHEN** the catalog is shown again
- **THEN** the game card offers a fresh start and exposes no state from the previous run

### Requirement: Server-operated availability
The catalog SHALL apply public game/config flags that enable or disable games, levels and asset pools without storing child-specific state. An emergency `forceStop` SHALL prevent issuance of a new server exercise when enabled.

#### Scenario: A game is disabled
- **WHEN** the catalog refreshes public configuration
- **THEN** the game cannot start and no child history is consulted or changed
