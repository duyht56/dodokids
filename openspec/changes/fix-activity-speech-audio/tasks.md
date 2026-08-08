## 1. Existing URL audio foundation

- [x] 1.1 Map server `audioFiles.*` into `Activity.audio.files`, including legacy `payload.audioFiles` fallback
- [x] 1.2 Keep `audioScript` text separate from bucket URLs for mascot bubble text
- [x] 1.3 Use Expo SDK 56 `expo-audio` (`createAudioPlayer`, `setAudioModeAsync`) instead of stale `expo-av`
- [x] 1.4 Keep one module-level player and release it on replacement/unmount

## 2. Speech completion and cancellation contract

- [x] 2.1 Add `PlaybackResult` and make `speak(url)` settle with finished/cancelled/skipped/failed
- [x] 2.2 Track pending/loading sessions so `stop()` and a new `speak()` cancel and settle the previous Promise
- [x] 2.3 Handle native status errors and add a safety timeout so playback never leaves UI pending
- [x] 2.4 Preserve `speakCount()` and `_lastSpoken()` behavior

## 3. Activity feedback state machine

- [x] 3.1 Add answering/feedbackPlaying/advancing phase guard in `ActivityContainer`
- [x] 3.2 Select correct on first try and explain after prior wrong; avoid repeating explain after third-wrong playback
- [x] 3.3 Lock answers/replay during feedback and synchronize bubble text with the selected field
- [x] 3.4 Add Continue button for success feedback; stop audio before advancing and guard double actions
- [x] 3.5 Return to answering after wrong feedback finishes/skips/fails

## 4. Parent screen integration

- [x] 4.1 Remove fixed 1,2-second advance timer from `LessonPlayerScreen`; record attempt and advance on callback
- [x] 4.2 Remove fixed timer and generic wrong-bubble timer from `PracticeBankScreen`
- [x] 4.3 Remove obsolete `bubbleOverride` wiring and keep attempt/stars behavior unchanged

## 5. Automated verification

- [x] 5.1 Add focused tests for exclusive speech playback completion/cancellation/error paths
- [x] 5.2 Add focused tests for feedback selection and Continue/double-action behavior
- [x] 5.3 Run mobile lint/typecheck and relevant tests

## 6. Manual runtime gate

- [ ] 6.1 Rebuild/run dev client with `expo-audio` and confirm app starts without native-module crash
- [ ] 6.2 Verify real bucket URLs: question, hint1, hint2, explain, correct
- [ ] 6.3 Verify Continue during correct/explain stops feedback before next question and never overlaps audio
