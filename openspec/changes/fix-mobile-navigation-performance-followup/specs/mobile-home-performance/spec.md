## MODIFIED Requirements

### Requirement: Adventure Map scrolls without waiting on the JS thread
The 48-week Adventure Map SHALL remain visible and complete during scrolling at any velocity: the child MUST NOT see empty space where week nodes belong, and no week node may appear only after a delay once scrolled into view. Because the map is a fixed set of 48 fixed-height nodes, it SHALL be laid out in full rather than virtualized, so scrolling is handled natively and never depends on JS-thread render batches.

Per-node cost SHALL be kept low enough for a single full layout: connectors SHALL be drawn by one shared surface for the whole map rather than per node, and node-level animation resources SHALL be allocated only by the states that actually animate. The child SHALL still be able to reach every week, and the current week SHALL remain the initial visible target.

#### Scenario: Home opens near the current week
- **WHEN** Home mounts for a child at week 24
- **THEN** the map is positioned near week 24 without an animated scroll from the top

#### Scenario: Child flings the map quickly
- **WHEN** the child swipes up or down at high velocity
- **THEN** every week node under the viewport is already drawn — no blank region appears and nothing fills in late

#### Scenario: JS thread is busy during scrolling
- **WHEN** background work occupies the JS thread while the child scrolls
- **THEN** the map still scrolls smoothly and shows all nodes, because no render pass is required to keep it populated

#### Scenario: Non-animating nodes are cheap
- **WHEN** the map lays out weeks in `LOCKED`, `PAYWALL`, or `COMPLETED` state
- **THEN** those nodes allocate no pulse-animation resources; only `CURRENT` and `TODAY` nodes do

## ADDED Requirements

### Requirement: Home cache effects do not re-trigger per completion
Home's cache maintenance and look-ahead scheduling effect SHALL key on the child identity, not on completion-count changes. Completing a lesson MUST NOT cause Home to schedule a new look-ahead sweep on its own; post-completion prefetch is owned by the lesson-completion flow and the session-scoped coalescing in the cache service.

#### Scenario: Lesson completion updates progress
- **WHEN** `completedLessons` grows after the child finishes a lesson and Home re-renders
- **THEN** Home does not schedule an additional look-ahead prefetch because of that change
