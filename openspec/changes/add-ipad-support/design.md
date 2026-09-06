## Context

The app had exactly one layout signal — `useIsTablet()`, a `width >= 768`
boolean — and eight components had inlined that comparison themselves at either
768 or 700. Everything else was authored for a ~390pt phone. That is survivable
while iPad is off; it is not survivable once Expo turns on all four iPad
orientations and a resizable window.

One piece of good news shaped the approach: **nothing in `mobile/src` reads
`Dimensions.get()` at module scope.** Every viewport read already goes through
`useWindowDimensions()`, so no layout was frozen at import time and the work was
about bounding and scaling, not about rebuilding how sizes are obtained.

## Goals

- One size signal, derived from the **window**, not the device.
- Bound every content column so nothing stretches with the window.
- Keep iPhone rendering pixel-identical.
- Do not touch the Explore replay contract.

## Decisions

- **Three size classes, not a boolean.** `compact` (<700), `regular` (700–1023),
  `large` (≥1024). Two classes cannot express "iPad mini portrait" and "13-inch
  landscape" as different layouts, which is exactly where the phone-app-stretched
  look came from.

- **Breakpoint 700, not 768.** iPad mini portrait is 744pt and was falling into
  the phone layout. No iPhone reaches 700pt in portrait, so the phone is
  unaffected, and it collapses the 700/768 split that made a ~720pt window render
  half the screen in tablet mode and half in phone mode.

- **Cap the shell, not each renderer.** `ExplorePlayScreen` is the parent of ~17
  game renderers, so a single capped, centred column there bounds all of them.
  `useExploreContentWidth()` (`min(windowWidth, 900)`) is what renderers size
  against; below 900pt it is identical to the window width, so phone layouts and
  the `verify-explore-*.cjs` fixtures (375, 430, 768) are untouched.

- **Pixel grids, not percentage + `aspectRatio`.** `width: '${100/cols}%'` with
  `aspectRatio: 1` is not merely ugly when wide — the row height tracks the
  window width, so on a 13-inch iPad in landscape a second row of options is
  pushed off the bottom of the screen. `columnsFor()` resolves a column count and
  an exact cell width from a measured container instead. On phones the resolved
  value is arithmetically what the percentage produced, so nothing moves.

- **Widen phone-tuned caps at the call site, never by editing the constant.**
  Several `scripts/verify-explore-*.cjs` scripts assert on renderer source text
  verbatim (`MIN_CELL = 72`, `MIN_TOKEN_SIZE = 34`, the exact
  `fitPatternTokenSize(...)` call string, `MEMORY_BOARD_CHROME_HEIGHT`,
  `useWindowDimensions`). Those names and values are left exactly as they are;
  `roomyMax(sizeClass, phoneMax)` applies the tablet headroom where the constant
  is used. Where a `useWindowDimensions` destructure was narrowed, the call is
  kept for the `height` so the asserted string still appears.

- **No version bumps in Explore.** Every change here is presentation. Generators,
  validators and seeded streams are untouched, so replay stays byte-identical and
  `generatorVersion`/`validatorVersion` must NOT move.

- **Scroll centring keyed to geometry, not a one-shot flag.** Home used a
  `didInitialScroll` boolean, which is correct on a phone and wrong on iPad: the
  map's height changes when the window does, and `detachInactiveScreens` means
  Home may not re-lay-out until its tab is focused again — long after the resize.
  The guard is now the map-geometry object identity, so the first layout pass
  after any geometry change re-centres on the current week.

- **Bottom bar: capped cluster, full-bleed surface.** The five tabs sit in a
  640pt centred row while the white surface still spans the window, so the bar
  stays anchored to the bottom edge and fills the home-indicator area. Chosen
  over a landscape side rail to keep a 4–6 year old's muscle memory and the
  mascot's position unchanged.

## Risks / Trade-offs

- **One-way door.** Turning `supportsTablet` off again would cut updates for iPad
  users who have installed the app. Recorded in the runbook.
- **Rotation not yet exercised on a real 1376×1032 viewport.** `simctl` has no
  rotate command and AppleScript is blocked by assistive access on this machine.
  Landscape *shape* was verified through iPadOS 26 window resizing (858×482 and
  ~1010×1230); a device rotation pass is still owed before submission and is
  recorded in the go-live checklist.
- **`EXPLORE_CONTENT_MAX = 900` is a judgement call.** Games whose own cap is
  well below it (Route Planner at 360pt, Missing Cell at 340pt before the
  `roomyMax` bump) now sit centred in whitespace on a 13-inch display. That reads
  as deliberate composition rather than breakage, and raising each game's cap is
  a per-game design decision, not a layout bug.
