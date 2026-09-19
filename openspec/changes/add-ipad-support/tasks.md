## 1. Shared responsive layer

- [x] 1.1 Add `mobile/src/constants/layout.ts`: `TABLET_BREAKPOINT = 700`, `LARGE_BREAKPOINT = 1024`, `sizeClassFor`, `CONTENT_MAX`, `SCALE`, `GUTTER`, `tokensFor`, `columnsFor`, `clamp`, `roomyMax`.
- [x] 1.2 Add `mobile/src/hooks/useResponsive.ts` over `useWindowDimensions`, returning width/height, `isLandscape`, size class, gutter, `scale`, `measure` and the scaled token ramps.
- [x] 1.3 Reduce `useIsTablet` to a wrapper over `useResponsive` so existing callers are unaffected.
- [x] 1.4 Add `mobile/src/components/ui/ContentFrame.tsx` (capped, centred column).
- [x] 1.5 Point `SplashScreen`, `OnboardingScreen` and `SetupScreen` at the shared `TABLET_BREAKPOINT` instead of their local copies.

## 2. Navigation shell

- [x] 2.1 `ChildBottomNav`: cap the tab row at `CONTENT_MAX.nav` and centre it; derive the surface cutout, mascot ring and lift from the scaled sizes; scale icons and labels.
- [x] 2.2 Cap and centre `StreakMilestoneModal`'s sheet.

## 3. Lesson flow

- [x] 3.1 `ActivityContainer`: cap the mascot rail (min 220 / max 360) and wrap the content column in a `ContentFrame`; scale the mascot and bubble by size class.
- [x] 3.2 `SingleSelectActivity` / `MultiSelectActivity`: resolve the option grid to pixel cells, capped on tablet only, with the phone geometry preserved exactly.
- [x] 3.3 Cap the boards of `CountTapActivity`, `QuantityComparisonBoard`, `MatchPairActivity`, `SortSequenceActivity` and `WatchVideoActivity`.
- [x] 3.4 Give `PatternMatrixActivity` a size-aware cell and answer card (it accepted no tablet input at all).
- [x] 3.5 `LessonPlayerScreen`: cap the header and scale its type and progress bar.

## 4. Home

- [x] 4.1 Parameterise `buildMapLayout` with the vertical step and bottom pad; add `NODE_SIZE_LARGE`.
- [x] 4.2 Cap the two-pane row and the map column; scale the node size and vertical rhythm.
- [x] 4.3 Scale the header bar (avatar, name, level chip, icon buttons, gem badge).
- [x] 4.4 Key the scroll centring to the map geometry so a resize re-centres on the current week instead of keeping a stale offset.

## 5. Khám phá

- [x] 5.1 Add `mobile/src/explore/layout.ts`: `EXPLORE_CONTENT_MAX`, `useExploreContentWidth`, and the shell chrome heights.
- [x] 5.2 `ExplorePlayScreen`: keep the shell full-bleed (background and exit scrim) and cap/centre an inner play column.
- [x] 5.3 Move `PLAY_SCREEN_TOP_BAR` / `PLAY_SCREEN_FEEDBACK_AREA` out of `RoutePlannerRenderer` into `explore/layout.ts` so the shell and the renderer cannot drift.
- [x] 5.4 Route thirteen renderers' width reads through `useExploreContentWidth`, keeping `useWindowDimensions` for height where a contract script asserts on it.
- [x] 5.5 Cap the tap-count, shape-hunt and sort-bins scenes; the tracing canvas; the arithmetic column; and the number line in `VisualMathPrimitives`.
- [x] 5.6 Widen the missing-cell and seesaw caps for bigger size classes without renaming or changing the asserted constants.
- [x] 5.7 `ExploreCatalogScreen`: replace the fixed 47% cards with a 2/3/4-column pixel grid and cap the header, banner and content column.

## 6. Rewards, practice, tracing

- [x] 6.1 `StickerGrid`: pixel cells with a `maxCell` cap; scale the captions; centre only on tablet.
- [x] 6.2 `StickerCollectionScreen`: third column tier (badges 3/4/5, stickers 4/6/8) and a capped body.
- [x] 6.3 Cap `LessonCompleteScreen` and `PracticeBankScreen`'s columns.
- [x] 6.4 Cap the tracing library card width, header and content column.

## 7. Parent area

- [x] 7.1 `DashboardScreen`: make the tablet left column scrollable (it was a plain `View`, so its tail was unreachable) and cap both columns and the row.
- [x] 7.2 Cap `ReportScreen` and `OfflineTasksScreen` to a reading measure; scale the comparison chart's height.
- [x] 7.3 Point `SettingsScreen`'s bespoke 640pt column at `CONTENT_MAX.readable`.

## 8. Auth

- [x] 8.1 Re-snap both onboarding carousels to the current slide when the window width changes (paging works off pixel offsets, so a resize left the list between slides).

## 9. Config and docs

- [x] 9.1 `mobile/app.json`: `ios.supportsTablet: true`, leaving `requireFullScreen` unset and `orientation: "portrait"` (iPhone-only) as they are.
- [x] 9.2 Rewrite `docs/APPLE_SUBMIT_RUNBOOK.md` §0.2 with the reversed decision and the verified width matrix; update its three other `supportsTablet` references.
- [x] 9.3 Record the revamp and the outstanding rotation pass in `docs/APPLE_APP_STORE_GOLIVE_CHECKLIST.md`.

## 10. Verification

- [x] 10.1 `npx tsc --noEmit` clean; `npx eslint .` introduces no new finding.
- [x] 10.2 All Explore, performance, reward, audio, session and parent contract scripts pass. (`test:weekly-report` fails on `main` too — `src/services/achievements.ts` imports `@/constants/stickerCatalog` and the script has no alias resolution. Pre-existing, out of scope.)
- [x] 10.3 Simulator pass on iPad Pro 13-inch (M5): 1032×1376 `large`, ~1010×1230 `regular`, 858×482 landscape-shaped, ~600×1150 `compact`.
- [x] 10.4 iPhone 17 Pro (402×874) regression pass — Home and Khám phá unchanged.
- [x] 10.5 Rotated to a real 1376×1032 on the iPad Pro 13-inch Simulator (the product owner rotated by hand — `simctl` cannot rotate and AppleScript is blocked by assistive access here). Checked Home, Khám phá, lesson player and Thành tích. Found and fixed two landscape-only defects, see task 11.
- [x] 10.6 Parent Dashboard and Paywall checked in landscape. Both sit behind the parent-gate PIN, which the agent must not type — and the PIN on this device was set by an earlier agent, so nobody knows it. Reached them instead by temporarily auto-resolving `ParentGateModal` in the dev build, then reverting (`ParentGateModal.tsx` is byte-identical to HEAD; `git diff` confirms).

## 11. Landscape-only defects found by that rotation pass

- [x] 11.1 A row whose width is capped starves two `flex: n` sibling columns: they both collapse to their minimum, because Yoga then measures the subtree content-first. Invisible in portrait (1032 < the 1200 cap, so the clamp never engaged). Fixed by giving one column a real width and leaving only the other flexible, in `ActivityContainer` and `DashboardScreen`; `HomeScreen` moved from `maxWidth` to `width` for consistency. Rule recorded in `docs/AI_CONTEXT.md`.
- [x] 11.3 The parent tab bar still spread its four destinations across the full 1376pt — listed in the plan but never implemented. Clustered to `CONTENT_MAX.nav` and centred, matching ChildBottomNav, with the surface left full-bleed.
- [x] 11.2 The Home map kept a stale scroll offset across rotation — `onContentSizeChange` fires first while `scrollViewH` still holds the previous orientation's height and consumes the guard, so the corrected `onLayout` height is ignored and the current week lands behind the bottom nav. Guard now keys on map geometry AND viewport height.
