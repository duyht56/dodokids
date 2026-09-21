## 1. Renderer (`NumberBondRenderer.tsx`, presentation only)
- [x] 1.1 `HouseRoof` (react-native-svg gable sized to the rooms row, whole number centred) replaces the `Số cần tách` label row
- [x] 1.2 One dashed empty `+` slot after the leaves is the only add control (`onPress={assign}`); the `Bé thêm` room is a plain view; leaves stay tap-to-remove; slot hidden when the room holds the whole or the board is locked
- [x] 1.3 `Kiểm tra`, `Gộp lại`, `Tiếp tục` ≥ 64pt tall
- [x] 1.4 No change to `numberBondGame.ts`, the run policy or `numberBondInteractionReducer` (replay byte-identical); existing motion, reduced-motion gate and spoken feedback preserved

## 2. Spec, docs, tests
- [x] 2.1 Spec delta `specs/explore-number-bond-game/spec.md` (house, add slot, overfill sync, CTA size)
- [x] 2.2 `docs/KIDO_EXPLORE_BRD.md` §7.5 wording
- [x] 2.3 `explore.number-bond-arithmetic.spec.ts`: renderer assertions for the roof, the add slot and CTA size

## 3. Verification
- [x] 3.1 `cd mobile && npx tsc --noEmit` and `npm run lint` (no new problems)
- [x] 3.2 `npm run test:explore-prompt-audio`, `test:explore-sound`, `test:explore-variety-buckets` green
- [x] 3.3 `cd kido-server && npx jest src/modules/explore/explore.number-bond-arithmetic.spec.ts` green
- [x] 3.4 `openspec validate polish-number-bond-house --strict`
- [ ] 3.5 Device check (iPhone SE width): whole 10 with the room nearly full — roof, rooms, slot and button do not overlap
