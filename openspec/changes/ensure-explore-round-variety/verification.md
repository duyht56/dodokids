# Verification

## Automated two-round simulation

The shared conformance matrix generated two consecutive five-exercise rounds at every enabled level for all eight public games. It verified valid metadata, semantic-key equivalence/difference, within-round uniqueness, bucket coverage, static level, and previous-round exclusion.

Representative level-1 exhaustion expectations for device review:

| Game | Declared level-1 capacity | Expected second round |
| --- | ---: | --- |
| Xưởng luyện nét | 8 | 3 unseen paths first, then up to 2 valid repeats after exhaustion |
| Khám phá số | 10 | 5 unseen variants |
| Chạm và đếm | 5 | The five-item pool is exhausted, so valid repeats are expected |
| Bên nào nhiều hơn? | 12 | 5 unseen variants |
| Ngôi nhà tách gộp | 10 | 5 unseen variants |
| Máy cộng trừ | 20 | 5 unseen variants |
| Tìm quy luật | 30 | 5 unseen variants |
| Lật thẻ tìm cặp | 20 | 5 unseen asset-set variants |

## Commands completed

- Explore/server Jest: 12 suites, 114 tests passed.
- Full server Jest: 20 suites, 172 tests passed.
- Server Nest build: passed.
- Mobile TypeScript `tsc --noEmit`: passed.
- ESLint on every affected mobile source file: passed.

## Pending device review

Task 5.3 remains open for the product-owner review requested after apply. On a still-mounted play route, finish a round and press **Chơi lượt mới**; compare learning content, not shuffled option/card positions. Exit the route and enter again to confirm the exclusion window has been discarded.
