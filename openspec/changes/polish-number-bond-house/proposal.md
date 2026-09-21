## Why

A review of `Ngôi nhà tách gộp` against the design hand-off (`Kido UI design v2/Ban giao 4 game/Game 5 - Ngoi nha tach gop.html`) found three presentation problems in the only mode children actually play (`split_group`):

1. **The house is missing.** The design metaphor is *roof = whole, two rooms = the parts*, and the game is named after it, but the played board shows a `Số cần tách` label and badge above two plain boxes. The roof diagram only exists in a fallback branch a normal run never reaches, so the name, the thumbnail and the play surface disagree and the child loses the top-down "whole above, parts below" anchor.
2. **Add and remove targets overlap.** The whole `Bé thêm` room is the add target while every leaf inside it is a remove target. On whole 10 the room fills with leaves, so a child reaching to add a leaf lands on one and the count goes *down*. The team deliberately removed separate add/subtract/reset buttons (`fix-number-bond-learning-logic`), so the fix must keep manipulation on the objects themselves.
3. **Calls to action are under the design minimum** (`Kiểm tra` 56pt, `Gộp lại`/`Tiếp tục` 58pt; the design asks CTA ≥ 72pt, touch ≥ 64pt).

The canonical spec has also drifted from shipped behaviour: it still says an overfilled check resets the child room to 0, while the renderer (and the Explore BRD) keep the child's leaves and let the child take leaves back out. This change syncs the spec to the kinder shipped behaviour.

## What Changes

- Draw the whole as the **roof** of a house above the `Có sẵn` and `Bé thêm` rooms (react-native-svg gable, number centred in the roof); remove the separate `Số cần tách` label row.
- Replace "the whole room is the add target" with **one dashed empty `+` slot** that follows the leaves in the `Bé thêm` grid: tap the empty slot to put a leaf there, tap a leaf to take it back. The room background is no longer pressable, so an add can never land on a leaf. The slot disappears when the room holds the whole. Still no `Thêm 1` / `Lấy lại 1` / reset buttons.
- Raise `Kiểm tra`, `Gộp lại` and `Tiếp tục` to at least 64pt tall.
- Sync the overfilled-check scenario with shipped behaviour (leaves kept, child removes by tapping; never reset to 0).

Presentation only: no change to `numberBondGame.ts` (generator, validator, params, versions), the run policy or `numberBondInteractionReducer`; replay by seed stays byte-identical.

## Out of scope (known, tracked for a follow-up)

- The escalated nudge shown after two wrong checks (`Con thêm N lá nữa nhé`) states the remaining delta, which conflicts with the requirement that feedback never reveals the complement. Resolving it (non-numeric escalation or a spec allowance) belongs with the multi-level hint work.
- Re-enabling the unreachable `missing_part` / `make_10` / `multi_partition` modes ("nhiều cách tách").
- The global 🔊 replay button already lives in the play-screen top bar; renderers must not add their own.

## Impact

- `mobile/src/explore/renderers/NumberBondRenderer.tsx` (presentation).
- `kido-server/src/modules/explore/explore.number-bond-arithmetic.spec.ts` renderer source assertions.
- `docs/KIDO_EXPLORE_BRD.md` §7.5 wording.
- No persistence, rewards, lesson progress, server catalog versions, database or pipeline changes.
