## ADDED Requirements

### Requirement: Expanded memory asset pool
The memory game SHALL draw its cards from a bundled pool of at least 32 eligible
assets, each a single, background-free, instantly-recognisable object with a
unique canonical identity (`objectCode`), a unique glyph and a `similarityGroup`.
At levels 1–2 the board SHALL NOT place two assets that share a `similarityGroup`
(the "no look-alike pair" rule), and no asset SHALL repeat within a board. A
larger pool changes which assets a seed draws, so the `generatorVersion` SHALL be
bumped and the kido-server registry mirror SHALL match it; replay by seed SHALL
stay byte-identical within the new version.

#### Scenario: The bundled pool is large and clean
- **WHEN** the bundled `MEMORY_ASSETS` pool is audited
- **THEN** it holds at least 32 assets, every asset is flagged eligible / single-object / recognizable / background-free, and no two assets share a canonical identity or glyph

#### Scenario: Boards stay fresh and reach the whole pool
- **WHEN** many seeds are generated across all five levels
- **THEN** every pool asset is reachable and boards vary from run to run, while each board still holds exactly its level's pair count with one copy of each side

#### Scenario: Easy boards avoid look-alikes
- **WHEN** a level 1 or level 2 board is generated
- **THEN** no two of its assets share a `similarityGroup`, so a beginner never has to tell two look-alike cards apart

#### Scenario: The pool bump is versioned
- **WHEN** the pool grows and changes the seeded draw
- **THEN** the `generatorVersion` advances to `memory-match-v4`, the server registry mirrors it, and an exercise stamped with the previous version is rejected

### Requirement: In-board support hint
After several unsuccessful matches in a row on the current board, the renderer
SHALL offer a gentle peek hint: Đô Đô briefly reveals ONE still-hidden matching
pair, then closes it. The hint SHALL be presentation only — it SHALL NOT change
the board's matched set, end the board, mark a failure, or persist anything, and
the consecutive-mismatch streak SHALL reset when a pair is matched or a hint is
shown. Under reduced motion the peek SHALL rest in its static revealed state
without animation. The board and its deterministic replay SHALL be unaffected.

#### Scenario: A struggling child is nudged
- **WHEN** the child records several mismatches in a row on the current board
- **THEN** one still-hidden matching pair is peeked for a moment with a warm helper style, input is held during the peek, and the pair closes again on its own

#### Scenario: The hint does not change the game
- **WHEN** a hint is shown and then closes
- **THEN** the reducer's matched set, the board checksum and the seed's replay are identical to a run where no hint was shown, and no counter, streak or reward changes

#### Scenario: A match clears the struggle streak
- **WHEN** the child finds a matching pair
- **THEN** the consecutive-mismatch streak resets so the next hint only appears after several fresh misses

#### Scenario: Reduced motion is enabled
- **WHEN** the system requests reduced motion and a hint is due
- **THEN** the peeked pair appears and disappears without the flip animation, and play timing is otherwise identical
