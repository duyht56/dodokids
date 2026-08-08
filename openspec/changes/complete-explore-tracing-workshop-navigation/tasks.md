## 1. Tracing Content and Sequence Contract

- [x] 1.1 Add stable `TracingTrackId` metadata and explicit canonical order for every installed path-pack item
- [x] 1.2 Separate explicit `itemId`/`trackId` selection from L1-L5 assistance profiles in tracing exercise parameters
- [x] 1.3 Add deterministic explicit-item generation and validation while retaining compatibility with existing random-generation tests
- [x] 1.4 Add pack tests proving every item belongs to exactly one visible track and every canonical sequence has no gaps or duplicates

## 2. Workshop Library

- [x] 2.1 Add a tracing-specific workshop route entered from the Explore catalog
- [x] 2.2 Render all installed path items as local SVG preview cards grouped by track
- [x] 2.3 Add section/filter navigation and accessibility labels without hiding or locking content
- [x] 2.4 Allow any card to start practice at that exact item and assistance profile

## 3. Ordered Practice Flow

- [x] 3.1 Add a route-local tracing sequence controller starting at the selected canonical index
- [x] 3.2 Reuse `TracingWorkshopRenderer` and evaluator for the selected explicit exercise
- [x] 3.3 Auto-advance after successful completion to the next item in the same track with no fixed five-item cap
- [x] 3.4 Add neutral end-of-track actions for replaying the track or returning to the library
- [x] 3.5 Keep exit/back-to-library available throughout practice and release gesture/audio state on transition

## 4. Current-Visit Marks and Privacy

- [x] 4.1 Track completed item IDs in a memory-only set owned by the mounted workshop route
- [x] 4.2 Display neutral completed/current indicators on preview cards during the current visit
- [x] 4.3 Add tests proving marks, selected item and sequence position are cleared on route unmount/process restart
- [x] 4.4 Confirm no tracing selection, completion, sequence, hint or coordinate data reaches storage, analytics, reports or server APIs

## 5. Full Content and Offline Capability

- [x] 5.1 Enable every reviewed basic, route, shape, digit, Latin and Vietnamese track
- [x] 5.2 Expose all L1-L5 assistance profiles independently from content tracks
- [x] 5.3 Mark visual tracing offline-capable and remove the catalog-reachability block for the installed local definition
- [x] 5.4 Synchronize mobile/server generator, validator, path-pack, track, level and manifest versions
- [x] 5.5 Add catalog parity and airplane-mode tests covering library entry, preview rendering, explicit selection and auto-next
- [x] 5.6 Replace provisional lowercase/Vietnamese geometry with a coherent school-handwriting monoline pack, bump the pack version and visually review a complete contact sheet

## 6. Bundled Instruction Audio

- [ ] 6.1 Define the finite approved tracing instruction key inventory and map it to the shared static Explore audio registry
- [ ] 6.2 Auto-play local instruction audio on item entry and connect the replay control
- [ ] 6.3 Keep visual tracing playable when optional instruction audio is missing or playback fails
- [ ] 6.4 Stop/release audio on item transition and route unmount; verify airplane-mode replay on Android and iOS

## 7. Verification and Documentation

- [x] 7.1 Test direct selection and canonical auto-next from the first, middle and final item of every track
- [x] 7.2 Test all path previews and every installed item through the existing geometric validator/evaluator suite
- [x] 7.3 Run focused mobile lint/typecheck and relevant server Explore tests
- [ ] 7.4 Run representative phone/tablet manual checks for dense library layout, tracing gestures, transitions and accessibility
- [x] 7.5 Update Explore BRD/AI context where the generic 5-8 interaction rule needs the tracing track exception documented
