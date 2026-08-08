# Proposal: add-lesson-asset-prefetch

## Summary

Add lesson asset preloading so child lessons render smoothly without waiting for
images/SVG/audio to fetch at each activity mount.

## Motivation

The current lesson flow fetches lesson JSON first, then each activity fetches its
own SVG/raster/audio only when mounted. This causes spinners and audio delay
during activity transitions.

## Scope

- Add an entitlement-aware server manifest endpoint listing image/audio/video
  URLs for current week plus the next 4 weeks.
- Add a mobile disk cache for remote activity assets.
- Preload the current lesson before showing the first activity.
- Opportunistically prefetch look-ahead content while the app is open.

## Non-goals

- OS background fetch.
- Offline lesson JSON storage.
- Server-side asset download, zip, proxy, or byte storage.
- Fixed cache-size quota.
