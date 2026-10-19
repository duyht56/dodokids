## MODIFIED Requirements

### Requirement: Free Explore catalog
The child SHALL be able to open the Explore catalog and start every game whose effective configuration is both enabled and catalog-visible without a subscription check. A game with `catalogVisible: false` SHALL be omitted rather than shown as disabled or coming soon. Each visible card SHALL show its name and illustration (at least 100pt on a phone; a vector icon stands in until a game's art is delivered) and SHALL show an availability badge only when the game cannot be played right now ("Sắp ra mắt", "Cần kết nối mạng"); playable games carry no badge. Games SHALL be listed in the bundled pedagogical order under child-facing group headings named for the construct they practise: "Quy luật" (Tìm quy luật, Ô thiếu), "Trí nhớ" (Ú òa, Lật thẻ tìm cặp) and "Sắp xếp và dẫn đường" (every other bundled game); grouping is presentation only and SHALL NOT change any game contract, availability flag or run. Server configuration may hide or disable a game but SHALL NOT reorder the catalog. Rotation boards are part of Tìm quy luật, so the catalog SHALL NOT list a separate rotation game, and `spin_pattern` SHALL be absent from `EXPLORE_GAME_CODES` in the docs contract, the mobile app and kido-server alike. Catalog copy SHALL be written for the child. When a card is tapped and the game's name clip is bundled, the catalog SHALL say the name before opening the game; otherwise it opens immediately.

#### Scenario: Child opens Explore
- **WHEN** the child selects Explore
- **THEN** all enabled and catalog-visible games are listed without a paywall, grouped and ordered as above, with no badge on playable games

#### Scenario: Groups follow the construct
- **WHEN** the catalog is shown with every bundled game visible
- **THEN** Tìm quy luật and Ô thiếu appear under "Quy luật", Ú òa and Lật thẻ tìm cặp under "Trí nhớ", no group is titled "Quy luật và phân loại", and there is no "Xoay hình" card

#### Scenario: Retained game is hidden
- **WHEN** a game has effective `catalogVisible: false`
- **THEN** its card is absent while its implementation and registered capability remain installed

#### Scenario: A game cannot be played right now
- **WHEN** a game is disabled, force-stopped, or requires connectivity while the device is offline
- **THEN** its card is dimmed, not pressable, and shows the reason badge

#### Scenario: Child taps a card
- **WHEN** the game-name clip is bundled
- **THEN** Đô Đô says the name and the game opens right after; when it is not bundled the game opens at once
