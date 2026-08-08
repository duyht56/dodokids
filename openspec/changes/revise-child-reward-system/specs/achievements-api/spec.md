## MODIFIED Requirements

### Requirement: GET /progress/:childId/achievements
The server SHALL expose `GET /progress/:childId/achievements` returning streak count, week dots, a fixed ordered list of six cumulative badges, and 48 sticker entries keyed by stable catalog ID. The response SHALL be derived from canonical progress plus legacy-compatible sticker mapping and SHALL require household ownership. Unknown/non-owned child SHALL return `404`.

#### Scenario: Existing child
- **WHEN** an authorized request targets an existing household child
- **THEN** the endpoint returns `200` with streak, 7 week dots, 6 badges, and 48 stickers

#### Scenario: Unknown child
- **WHEN** the child does not exist in the authenticated household
- **THEN** the endpoint returns `404`

### Requirement: Derived Badges
The system SHALL derive exactly six non-revocable badges from monotonic progress: `first_lesson` (>=1 canonical completed lesson), `first_sticker` (>=1 stable sticker), `explorer_1` (>=12 stickers), `explorer_2` (>=24), `explorer_3` (>=36), and `journey_complete` (>=48). Current streak and star count MUST NOT determine permanent badge ownership.

#### Scenario: New child has no badges
- **WHEN** a child has no canonical completions or stickers
- **THEN** every badge has `earned: false`

#### Scenario: First lesson badge
- **WHEN** canonical completed lessons becomes 1
- **THEN** `first_lesson` is earned and remains earned thereafter

#### Scenario: Streak resets
- **WHEN** current streak drops after any cumulative badge was earned
- **THEN** no earned badge becomes locked

### Requirement: Sticker Metadata Mapping
The endpoint SHALL map canonical stable sticker ownership onto all 48 local-catalog identities and return each item’s `stickerId`, `week`, `world`, `nameVi`, and `earned`. Legacy week-number ownership SHALL map to the corresponding stable ID. Emoji/background compatibility fields MAY remain during migration but MUST NOT be the canonical identity.

#### Scenario: Earned and locked mix across worlds
- **WHEN** a child owns stickers for weeks 1 and 13
- **THEN** `sticker-w01` in world 1 and `sticker-w13` in world 2 are earned while all other catalog items retain locked state

### Requirement: Offline Local Derivation
When the backend is unreachable, mobile SHALL render achievements from the last acknowledged canonical snapshot plus deterministic projections of pending eligible events, using the bundled 48-entry catalog. It MUST NOT infer durable ownership from mock lesson IDs or from D5 alone.

#### Scenario: Achievements render offline with pending sticker
- **WHEN** a pending canonical event completes the local frozen week plan
- **THEN** the corresponding stable sticker appears earned/pending from the bundled catalog

#### Scenario: Mock D5 exists locally
- **WHEN** local session history contains a mock D5 completion
- **THEN** it does not create an earned sticker or badge
