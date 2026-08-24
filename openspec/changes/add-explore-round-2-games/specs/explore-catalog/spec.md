## MODIFIED Requirements

### Requirement: Free Explore catalog
The child SHALL be able to open the Explore catalog and start every enabled game without a subscription check. Each card SHALL show its name and illustration (at least 100pt on a phone; a vector icon stands in until a game's art is delivered) and SHALL show an availability badge only when the game cannot be played right now ("Sắp ra mắt", "Cần kết nối mạng"); playable games carry no badge. Games SHALL be listed in the bundled pedagogical order under child-facing group headings (counting & numbers, patterns & classification, adding/subtracting & number bonds, arranging & way-finding); server configuration may hide or disable a game but SHALL NOT reorder the catalog. Catalog copy SHALL be written for the child. When a card is tapped and the game's name clip is bundled, the catalog SHALL say the name before opening the game; otherwise it opens immediately.

#### Scenario: Child opens Explore
- **WHEN** the child selects Explore
- **THEN** all enabled games are listed without a paywall, grouped and ordered as above, with no badge on playable games

#### Scenario: A game cannot be played right now
- **WHEN** a game is disabled, force-stopped, or requires connectivity while the device is offline
- **THEN** its card is dimmed, not pressable, and shows the reason badge

#### Scenario: Child taps a card
- **WHEN** the game-name clip is bundled
- **THEN** Đô Đô says the name and the game opens right after; when it is not bundled the game opens at once
