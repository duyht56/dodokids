## Why

The first implementation treated "within 5" and "within 10" as variable totals and asked the child to freely distribute objects into both rooms. That does not match the approved product intent and creates a cluttered interaction with room selection, two undo targets and a large check button.

The approved lesson is narrower and more scaffolded: five interactions decompose the whole 5, then five interactions decompose the whole 10. In every interaction the system places one positive part in the first room and the child completes only the second room.

## What Changes

- Keep exactly 10 interactions, but make totals 1–5 exactly `5` and totals 6–10 exactly `10`.
- Author a positive prefilled part for every slot; the complement is the only editable part.
- Remove room selection and all numeric complement hints. The child taps the `Bé thêm` room itself to count up from 0, then explicitly checks the choice.
- Reveal `N gồm A và B` only after a correct check, keep the explanation visible until an explicit recombine action, then keep the recombined review visible until `Tiếp tục`.
- Redesign the board as one locked `Có sẵn` room, one tappable `Bé thêm` room and one full-width `Kiểm tra` button.
- Version the generator/validator/config/manifest contract as v4 and update conformance tests and product specs.

## Impact

- Mobile number-bond run plan, generator, validator, interaction reducer, variety identity and renderer.
- Server catalog version parity and number-bond conformance tests.
- Explore BRD and number-bond OpenSpec capability.
- No persistence, rewards, lesson progress, database or pipeline changes.
