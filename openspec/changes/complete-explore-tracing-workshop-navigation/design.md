## Context

`tracing_workshop` currently uses the generic `ExplorePlayScreen`, whose run size is fixed at five generated exercises. The local provider randomly selects items from level/category pools. The parent starting-level configuration has no active UI, letter generation is capability-gated, and the public catalog exposes only part of the implemented level range. The complete vector pack is nevertheless bundled and the existing renderer/evaluator can trace an explicitly selected item without remote assets. Visual inspection after the first workshop rollout also showed that geometric validity alone was insufficient: the provisional lowercase and Vietnamese paths were internally consistent but did not look like child-appropriate handwriting models.

The product direction is now:

1. Show every reviewed tracing item in a browsable workshop.
2. Let the child choose the starting item.
3. Automatically continue to the following items in that track.
4. Do not stop after an arbitrary five exercises.
5. Optionally show what was practised during the current visit without creating persistent Explore history.

## Goals / Non-Goals

**Goals:**

- Make every reviewed path discoverable and directly selectable.
- Preserve a predictable pedagogical order for auto-next.
- Reuse the current path pack, evaluator, renderer and privacy model.
- Keep tracing fully playable without network access.
- Keep current-visit progress understandable without storing history.
- Allow content choice and assistance difficulty to vary independently.

**Non-Goals:**

- Persisting completed glyphs across app sessions or showing long-term progress.
- Unlocking content based on performance or automatically adapting future visits.
- Teaching letter sounds, phonics, spelling or measuring reading ability.
- Replacing the reviewed vector pack with generated SVGs.
- Applying the tracing sequence model to all other Explore games.

## Decisions

### D1 - Use a dedicated tracing workshop flow

`tracing_workshop` will use a dedicated library and sequence controller instead of forcing its UX into the generic five-item `ExplorePlayScreen` round.

```text
Explore catalog
  -> Tracing workshop library
       -> select track/item
            -> Tracing practice
                 -> complete item
                 -> auto-next in same track
                 -> end of track or child exits
       <- return with current-visit marks
```

The tracing renderer and evaluator remain shared implementation components. Only navigation, item selection and sequence ownership become tracing-specific.

This is preferred over requesting a very large random batch from `LocalExploreProvider`, because a random batch cannot guarantee canonical order, direct selection, meaningful end-of-track behavior or a stable library state.

### D2 - Display the full pack as grouped, scrollable sections

The library will render preview cards directly from `TRACING_PATH_PACK`. All installed items are visible through a single scrollable screen with section headers or filter chips:

- Basic strokes
- Routes
- Shapes
- Digits 0-9
- Latin uppercase A-Z
- Latin lowercase a-z
- Vietnamese uppercase glyphs
- Vietnamese lowercase glyphs

“Show all” means no item is hidden behind random generation or an unlock rule. Sections/filter chips are presentation aids, not content gates. Each card uses the existing local SVG paths for its preview and exposes a child-friendly accessibility label.

### D3 - Define canonical track order and explicit starting position

Each item belongs to one stable `trackId`, and every track has a reviewed canonical item order derived from the versioned pack rather than locale-dependent object iteration.

Selecting an item creates a route-local sequence:

```text
track items in canonical order
  -> startIndex = selected item
  -> complete current item
  -> advance to startIndex + 1
  -> continue until final track item
```

Examples:

- Selecting digit `3` continues with `4`, `5`, ... `9`.
- Selecting Latin uppercase `M` continues with `N`, `O`, ... `Z`.
- Selecting a basic stroke continues with the next reviewed basic-stroke item.

At the final item, the workshop shows a neutral end-of-track state with “Luyện lại nhóm này” and “Chọn nét khác”. It does not silently wrap to the first item.

### D4 - No arbitrary run-size limit for tracing

Tracing runs are bounded by the remaining items in the selected finite track, not by the generic `RUN_SIZE = 5`. The child may exit at any time. There is no reward or penalty for stopping.

The generic Explore runtime keeps its normal 5-8 interaction default. A typed run policy will identify tracing as:

```ts
{ kind: 'ordered_track', autoAdvance: true, end: 'track_end' }
```

The tracing-specific controller may own this policy directly if adding it to the shared game config would unnecessarily affect other games.

### D5 - Completion marks are current-visit UI state only

Completed item IDs may be held in a `Set<string>` owned by the mounted tracing workshop route. Cards completed during the current visit display a neutral check mark. The active item may display a separate current indicator.

The set:

- is not written to AsyncStorage, SecureStore, Zustand persistence or a database;
- is not sent to the server, analytics or reports;
- is cleared when the workshop route unmounts or the app process ends;
- does not affect content availability, difficulty or future starting position.

This preserves the existing no-history contract. Persistent “đã luyện” marks across later visits are explicitly out of scope and would require a separate product/spec decision.

### D6 - Separate content track from assistance level

The existing tracing `level` currently combines content categories and assistance thresholds. The new flow will model them separately:

```ts
trackId: TracingTrackId
itemId: string
assistanceLevel: 1 | 2 | 3 | 4 | 5
```

The selected item decides what is traced. `assistanceLevel` decides corridor width, guide density, magnetism, snap radius and evaluation tolerance.

The parent-authored starting-level preference may provide the default assistance level, but it is never updated from child behavior. The first release may expose a simple child-friendly support selector such as “Nhiều hướng dẫn / Vừa / Ít hướng dẫn” mapped to reviewed profiles.

### D7 - Generate explicit exercises deterministically

The existing exercise envelope and validator remain in use, but tracing generation gains an explicit-item path:

```text
selected itemId + assistanceLevel + seed + packVersion
  -> exercise envelope
  -> independent validation
  -> existing TracingWorkshopRenderer
```

The validator must confirm that the item belongs to the declared track, the assistance profile matches the declared level, and replay with the same explicit inputs produces the same envelope.

Random generation remains available for tests or a future “Luyện ngẫu nhiên” entry, but it is not the primary workshop UX.

### D8 - Visual tracing is offline; audio is capability-aware and non-blocking

Generator, validator, vector pack, config and evaluator are bundled dependencies. Therefore the visual tracing flow is offline-capable and does not fetch the Explore catalog before starting.

Tracing instruction audio uses approved bundled keys and the shared static Explore audio registry when available. Audio auto-plays on item entry and can be replayed. If a tracing instruction clip is missing, the visual prompt remains available and the tracing item remains playable because audio does not carry the answer or change the fine-motor construct.

The manifest must represent this accurately: bundled visual dependencies are required; instruction audio is an optional local enhancement, not a remote game-wide blocker.

### D9 - Keep mobile and server catalog metadata aligned

Mobile and server must publish the same:

- tracing generator/validator versions;
- installed path-pack ID/version;
- enabled track/category set;
- L1-L5 assistance availability;
- offline visual capability;
- optional bundled-audio capability.

Tests will compare the catalog contract against the installed mobile tracing definition to prevent the current pack/version and level drift.

### D10 - Treat glyph appearance as reviewed content, not generated geometry

Letter paths must use a coherent monoline handwriting system with shared x-height, baseline, ascender and descender proportions. Vietnamese base letters must reuse the reviewed Latin body, while the breve, circumflex, crossbar and horn remain small, separated and visually balanced.

The geometric validator remains necessary for bounds, order and evaluator safety, but it is not a visual-quality approval. Every path-pack revision must also render a full contact sheet for visual review against the standing, even-stroke school-letter reference in Decision 31/2002/QĐ-BGDĐT. A pack version must change whenever reviewed path geometry changes.

## Risks / Trade-offs

- [Ninety-plus cards create a dense screen] -> Use grouped sections, sticky/filter navigation and small vector previews while keeping every item reachable without unlocks.
- [Auto-next surprises a child who wanted one item] -> Show the upcoming item, provide an always-visible exit/back-to-library control and stop neutrally at track end.
- [Current-visit checks are mistaken for saved progress] -> Use wording such as “Trong lần chơi này” where needed and clear them on route unmount.
- [Separating track and assistance touches generator contracts] -> Keep the existing envelope shape compatible where possible and introduce explicit fields additively.
- [Audio work delays visual rollout] -> Make bundled instruction audio capability-aware and non-blocking for tracing.
- [Server catalog overrides correct bundled metadata] -> Add parity tests and prefer installed local capability truth for an offline local game.
- [A path passes geometry tests but teaches an ugly or misleading letterform] -> Use one coherent manuscript construction, render the complete contact sheet and require visual review before treating the pack as release-ready.

## Migration Plan

1. Add track metadata, canonical ordering and explicit-item generation without changing the public route.
2. Add the tracing workshop library and route-local completion set.
3. Add the ordered auto-next controller and end-of-track UI.
4. Enable all reviewed tracks and L1-L5 assistance profiles.
5. Remove the remote catalog/audio gate for visual tracing and synchronize server/mobile manifests.
6. Connect approved bundled instruction audio when the shared offline-audio registry is available.
7. Verify airplane-mode behavior, all path previews, every track sequence and route-unmount cleanup before rollout.

## Open Questions

- Final visual treatment for a completed card during the current visit: check badge, colored border or both.
- Whether the child-facing assistance selector ships in the first iteration or initially uses only the parent-authored static default.
- Whether Vietnamese-specific glyphs remain separate tracks or appear after their related Latin base-letter track.
