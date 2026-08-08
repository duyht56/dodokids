## Why

The tracing engine and reviewed vector pack already exist, but the current generic Explore run hides almost all of the workshop behind a generated five-item batch. A child cannot browse the available strokes, deliberately choose a glyph, continue through the following glyphs, or see which items were completed during the current visit. The game is also still blocked by a remote-audio policy even though its generator, validator, evaluator and vector paths run locally.

Xưởng luyện nét is structurally different from question-style Explore games. It should behave as a browsable practice workshop: the child chooses any visible item, traces it, and then continues through the canonical sequence until the track ends or the child exits.

## What Changes

- Add a tracing-library screen that renders the complete reviewed path pack as preview cards grouped into basic strokes, routes, shapes, digits, Latin uppercase, Latin lowercase and Vietnamese-specific glyph tracks.
- Let the child select any item as the starting point instead of receiving a random first item.
- Replace the fixed five-item tracing round with a track-scoped sequence that automatically advances to the next canonical item after successful completion and ends naturally at the end of that track.
- Show current-visit completion marks in the library and active sequence while keeping all marks strictly route-local and memory-only.
- Separate content selection (`trackId`/`itemId`) from the assistance profile so the same glyph can be practised with different corridor, cue and magnetism levels.
- Enable all reviewed tracing categories and L1-L5 assistance profiles, including Latin and Vietnamese glyphs.
- Make local visual tracing available offline. Bundled instruction audio is preferred and replayable when available, but missing audio MUST NOT block the visual/fine-motor tracing construct.
- Synchronize mobile and server catalog metadata with the installed tracing pack and capability versions.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `explore-tracing-workshop`: Add the browsable path library, explicit item selection, ordered auto-next sequences, independent assistance selection, current-visit marks and offline availability.
- `explore-session-runtime`: Allow a game-declared finite track sequence instead of forcing every Explore experience into a 5-8 interaction round.
- `explore-stateless-privacy`: Clarify that route-local visual completion marks are permitted only while the workshop route remains mounted and are not play history.

## Impact

- `mobile`: new tracing library/track navigation, path preview cards, a tracing-specific sequence controller and current-visit state.
- `mobile`: tracing generation APIs will accept explicit item/track and assistance inputs rather than relying only on random level pools.
- `mobile`: Explore routing must allow `tracing_workshop` to use its dedicated workshop flow while reusing the existing renderer and evaluator.
- `kido-server`: catalog/manifests must advertise the same tracing levels, pack version and offline/audio capability contract as mobile.
- `openspec`: the generic 5-8 interaction run remains the default for question-style games, with an explicit exception for finite track-based practice.
- No lesson progress, reward, analytics, report, local persistence or server-side child history is added.
