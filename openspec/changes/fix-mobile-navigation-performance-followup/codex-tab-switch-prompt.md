# Codex investigation prompt — child tab switch has a ~500ms fixed latency floor

## What I want from you

In this Expo/React Native app, **every** switch between the child bottom-tab
destinations takes ~500–600ms from tap to the destination screen becoming
focused, on a Metro dev build. I have already ruled out destination-screen
render cost (see "Ruled out" below), so the time is spent in the
navigation/navigator layer between dispatching the navigation action and the
destination's focus effect firing.

Please read the relevant code (paths at the bottom), figure out **what in the
navigation layer accounts for this fixed ~500ms**, and propose concrete fixes.
I specifically need you to judge whether the current navigator configuration
(`detachInactiveScreens={false}` on the bottom-tab navigator, `lazy: true`, a
custom `tabBar`, and each tab being its own nested native-stack) is causing it,
and whether my measurement method is even trustworthy. Do not guess and patch —
explain the mechanism first, then give minimal changes.

## Stack / versions (mobile/package.json)

- expo `~56.0.12`, react-native `0.85.3`, react `19.2.3`
- @react-navigation/native `^7.3.4`, bottom-tabs `^7.18.3`, native-stack `^7.17.6`, stack `^7.10.6`
- react-native-screens `4.25.2`
- react-native-reanimated `4.3.1`
- react-native-svg `15.15.4`
- New Architecture: assume enabled (Expo SDK 56 default) — please confirm from config and factor it in.

Note: React Compiler / the react-hooks lint plugin is active (it rejects
post-render variable reassignment), so any fix must be compiler-friendly.

## Navigation topology

```
RootNativeStack (createNativeStackNavigator)
├── Auth (native-stack)
├── Child (native-stack)           // ChildStack.tsx
│   ├── PreparingLesson
│   ├── ChildTabs                   // createBottomTabNavigator
│   │   │  screenOptions: { headerShown:false, lazy:true }
│   │   │  detachInactiveScreens={false}
│   │   │  custom tabBar={(props) => <ChildTabBar {...props} />}
│   │   ├── Lesson       → LessonStack (native-stack)      → PracticeBank
│   │   ├── Explore      → ExploreStack (native-stack)     → ExploreCatalog → ExplorePlay / TracingWorkshop
│   │   ├── Dodo         → DodoStack (native-stack)        → Home → LessonPlayer → LessonComplete
│   │   └── Achievements → AchievementStack (native-stack) → StickerCollection
│   └── Paywall
└── Parent (native-stack) → ParentTabs (bottom-tabs)
```

- The custom `ChildTabBar` reads `useSubscriptionStore`, holds parent-gate modal
  state, and (when a nested detail screen is focused) hides itself via
  `style={{ display: 'none' }}` rather than unmounting.
- `detachInactiveScreens={false}` and the removal of `freezeOnBlur` were
  deliberate: we keep all four tab screens mounted and attached so their image
  views' decoded bitmaps stay warm (re-entering Explore/Achievements must not
  re-decode thumbnails/stickers). `freezeOnBlur` was tried and reverted because
  unfreezing re-rendered the destination synchronously on focus, adding ~2s on
  the heavy Home tab.

## Symptom — measured data (dev build, physical Android device, over Metro)

`focus` = ms from tab press to the destination screen's `useFocusEffect`
callback running. `first frame` = ms from press to the next
`requestAnimationFrame` after that. Steady state (ignoring each tab's first-ever
lazy mount, which is a one-time 1–2s+):

```
Explore:      focus 496–556ms, first frame 507–608ms
Dodo (Home):  focus 464–528ms, first frame 543–556ms
Achievements: focus 511–586ms, first frame 528–601ms
```

Key observations:
1. The **focus phase dominates**; the focus→first-frame gap is only ~17–80ms,
   so the destination's own render is cheap.
2. Every tab costs roughly the same ~500ms regardless of how heavy its content
   is (Home has a 48-node adventure map; Achievements a sticker grid) — pointing
   at a **fixed per-navigation cost**, not content.

## How it was measured (so you can judge if the number is trustworthy)

`mobile/src/hooks/useTabSwitchLatency.ts`:
- `markNavPress(dest)` records `performance.now()` in the tab bar's press handler
  (before `navigation.navigate(route)`).
- Destination screens call `useNavTiming(name)`, which in a `useFocusEffect`
  records the focus delta, then schedules one `requestAnimationFrame` to record
  "first frame", then logs `[nav] <name>: focus <x>ms, first frame <y>ms`.

Please assess whether `useFocusEffect` + a single rAF is a valid proxy for
"visible transition latency" on bottom-tabs with nested native-stacks on this
react-navigation v7 / react-native-screens 4.x combo — e.g. does the focus event
fire late relative to the actual committed frame, or does rAF add a frame that
inflates the number?

## Ruled out / already tried (don't repeat these)

- **Destination content render is not it.** Memoizing Home's entire 48-node map
  subtree (`useMemo` so a navigator re-render reuses identical children and React
  skips reconciling all 48 nodes) produced **no change** in focus time.
- **freezeOnBlur** — reverted (2s unfreeze burst on Home).
- Home's per-node animation was already reduced (pulse animation split into a
  separate `PulseCircle` so only CURRENT/TODAY nodes allocate a reanimated
  worklet; the other 46 don't).
- The custom tab bar's SVG surface path is `useMemo`'d.
- A separate, confirmed problem in `TracingWorkshop` (97 live SVG surfaces
  mounting at once → ~4s) is being fixed independently and is **not** what this
  prompt is about.

## Open hypotheses I want you to confirm or kill

1. `detachInactiveScreens={false}` keeps all four nested native-stacks attached;
   on each tab navigate, does react-native-screens 4.x / react-navigation v7 do
   O(all-mounted-screens) work (reconciliation, native screen container updates,
   or a synchronous commit) that scales with keeping everything attached?
2. Does the custom `tabBar` (a render prop returning `<ChildTabBar {...props} />`)
   force extra re-renders, and does `ChildTabBar` reading `useSubscriptionStore`
   + holding modal state put anything expensive on the navigation critical path?
3. Is there a default transition/animation or scheduling delay (bottom-tabs
   `lazy`, native-stack presentation) that gates when `useFocusEffect` fires?
4. Is ~500ms simply **dev-build overhead** (dev-mode React 19 + Reanimated 4 +
   Metro bridge) that would largely vanish in release? I have NOT yet profiled a
   release build. If your assessment is "measure release first", say so plainly.

## Constraints on any fix

- Must not break: `kido://paywall` deep link, parent-gate flow, the five-item
  custom bottom menu contract, or the "warm tabs" behavior (re-entering a tab
  must still show previously-decoded images immediately).
- No new navigation/list/state libraries; primitives already in the project only.
- Verification available: `cd mobile && npm run lint`, `npx tsc --noEmit`,
  `npm run test:performance` (node-based contract tests; no jest in this package).

## Files to read first

- `mobile/src/navigation/ChildStack.tsx` — the bottom-tab navigator, custom tab
  bar, `detachInactiveScreens`, nested stacks.
- `mobile/src/components/ChildBottomNav.tsx` — the visual tab bar.
- `mobile/src/hooks/useTabSwitchLatency.ts` — the probe (judge its validity).
- `mobile/src/navigation/RootNavigator.tsx`, `types.ts` — root topology + param types.
- `mobile/src/screens/child/HomeScreen.tsx` — heaviest tab (already memoized).
- `mobile/App.tsx` — NavigationContainer + linking config.

## Deliverable

1. The mechanism: where the ~500ms actually goes, with reasoning tied to this
   version set.
2. Whether the probe is measuring the real user-perceived latency.
3. Minimal, compiler-friendly changes to try, ranked by expected impact, each
   with the tradeoff called out.
4. An explicit statement on whether a release-build profile is required before
   changing navigator internals.
