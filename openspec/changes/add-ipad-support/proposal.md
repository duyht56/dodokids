## Why

`mobile/app.json` shipped `ios.supportsTablet: false`. The reason is recorded in
`docs/APPLE_SUBMIT_RUNBOOK.md` §0.2 and was verified again against the plugin
source: `@expo/config-plugins/build/ios/RequiresFullScreen.js:55-70` writes
`UISupportedInterfaceOrientations~ipad` with **all four orientations** and
`UIRequiresFullScreen = false` whenever `supportsTablet` is true and
`requireFullScreen` is unset. The app's `orientation: "portrait"` only ever
constrained iPhone.

So enabling iPad means accepting rotation **and** a resizable window (Split View
plus iPadOS 26 windowing). There is no supported way to opt out: TN3192
deprecates `UIRequiresFullScreen` in iPadOS 26 and drops it in iPadOS 27. The
only real precondition is that the app is genuinely adaptive to the window width.

It was not. Measured on an iPad Pro 13-inch (M5) at 1032×1376:

- **Paywall was unusable** — the plans, the purchase CTA and the App Store
  disclosure were pushed off the right edge. A pre-existing release blocker,
  already recorded on the throwaway branch `test/ipad-layout` (`a9d040c`).
- Percentage cells combined with `aspectRatio: 1` in four grids made row height
  track window width, pushing content off the bottom of the screen.
- The Explore catalog was permanently two columns of 626pt-wide cards holding a
  108pt thumbnail; `ExplorePlayScreen` handed the raw window width to ~17 game
  renderers; parent screens ran prose the full width of the display.
- The tablet breakpoint had drifted into two values (768 and 700), so a ~720pt
  window rendered some components in tablet mode and others in phone mode.
- Type, icons and touch targets stayed at phone sizes on a 13" display.

## What Changes

- Add a shared responsive layer: `mobile/src/constants/layout.ts` (size classes,
  content measures, scale ramps, a pixel grid solver) and `useResponsive`.
  `useIsTablet` becomes a thin wrapper so existing callers keep working.
- Unify the tablet breakpoint at **700** (was 768 in nine places, 700 in five).
  700 brings iPad mini portrait (744pt) into the tablet layout; no iPhone reaches
  700pt in portrait, so phone rendering is unchanged.
- Cap and centre every content column (new `ContentFrame`, plus per-screen
  `maxWidth`), including the single highest-leverage one: the Khám phá play shell,
  which bounds every game renderer at once.
- Replace `width: '${100 / cols}%'` + `aspectRatio: 1` with resolved pixel grids
  in `SingleSelectActivity`, `MultiSelectActivity` and `StickerGrid`, and give the
  Explore catalog a real 2/3/4-column grid.
- Scale type, icons, touch targets, mascots and boards by size class.
- Fix four resize-driven defects: the Paywall overflow; the Home map keeping a
  stale scroll offset across a resize; the parent Dashboard's tablet column being
  unscrollable; the onboarding carousel landing between slides after a resize.
- Set `ios.supportsTablet: true`. Do **not** set `ios.requireFullScreen`.

## Capabilities

### New Capabilities

- `responsive-layout`: the app's window-size contract — size classes, content
  measures, the scale ramp, and the rule that layout is driven by window size
  rather than device identity.

### Modified Capabilities

- `paywall`: on a wide window the paywall places the hero beside a capped,
  centred plans column; between 700 and 1023pt it stacks with a capped column.
  The plans, CTA and disclosure are reachable at every supported width.

## Impact

- **New:** `mobile/src/constants/layout.ts`, `mobile/src/hooks/useResponsive.ts`,
  `mobile/src/components/ui/ContentFrame.tsx`, `mobile/src/explore/layout.ts`.
- **Config:** `mobile/app.json` — `ios.supportsTablet: true`.
- **Screens:** Home, Lesson player, Lesson complete, Practice bank, Sticker
  collection, Tracing workshop, Paywall, Explore catalog, Explore play, all four
  parent screens, and the auth screens (breakpoint unification + carousel fix).
- **Components:** `ChildBottomNav` (capped, centred bar), `StickerGrid`,
  `StreakMilestoneModal`, and the activity components
  (`ActivityContainer`, single/multi select, count/compare tap, match pair,
  sort sequence, watch video, pattern matrix, quantity comparison board).
- **Explore renderers:** thirteen renderers now size against the capped play
  column instead of the window; the play shell's chrome heights move into
  `explore/layout.ts` so `RoutePlannerRenderer` stops duplicating them.
- **Docs:** `docs/APPLE_SUBMIT_RUNBOOK.md` §0.2 (decision reversed, with the
  verified width matrix) and `docs/APPLE_APP_STORE_GOLIVE_CHECKLIST.md`.
- **Not touched:** no Explore `generatorVersion`/`validatorVersion` bump (this is
  presentation only, replay stays byte-identical), no schema or wire-contract
  change, no pipeline or server change, and `mobile/ios/` (a prebuild artifact).
