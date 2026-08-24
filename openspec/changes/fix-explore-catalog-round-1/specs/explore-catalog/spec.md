## MODIFIED Requirements

### Requirement: Free Explore catalog
The child SHALL be able to open the Explore catalog and start every enabled game without a subscription check. Each card SHALL show its name and illustration (at least 100pt on a phone) and SHALL show an availability badge only when the game cannot be played right now ("Sắp ra mắt", "Cần kết nối mạng"); playable games carry no badge. Games SHALL be listed in the bundled pedagogical order (counting → comparing → numerals → pattern → memory → number bonds → arithmetic → route planning) under child-facing group headings; server configuration may hide or disable a game but SHALL NOT reorder the catalog. Catalog copy SHALL be written for the child (no operator or parent-facing wording such as "không lưu tiến trình" or "chơi offline").

#### Scenario: Child opens Explore
- **WHEN** the child selects Explore
- **THEN** all enabled games are listed without a paywall, grouped and ordered as above, with no badge on playable games

#### Scenario: A game cannot be played right now
- **WHEN** a game is disabled, force-stopped, or requires connectivity while the device is offline
- **THEN** its card is dimmed, not pressable, and shows the reason badge
