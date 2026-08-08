# Kido Reward System V1

## Ownership and invariants

- `kido-server` is the canonical reward ledger. Mobile keeps the last acknowledged
  snapshot plus explicitly pending projections; it never merges canonical totals by
  unrestricted increment or union.
- Only imported lessons with exactly 8 activities, `contentVersion`, and a frozen
  child week plan create durable rewards. Stub, mock, demo, Explore, Practice Bank,
  and offline tasks do not.
- Stars use first-try correctness: 6-8 = 3, 3-5 = 2, 0-2 = 1. Replay may raise the
  stored best star but cannot repeat completion effects.
- A weekly sticker is awarded once when every lesson in the frozen required set is
  complete. `isStickerDay` is a UI/content hint, not an award condition.
- XP remains server-side compatibility data and is hidden from child-facing V1 UI.

## Rollout order

1. Deploy the additive server schema/API first. Keep accepting legacy completion
   payloads and returning legacy sticker week/emoji/background compatibility fields.
2. Dry-run and apply the reward migration.
3. Ship mobile catalog, queue, snapshot reconciliation, and two-phase result UI.
4. Monitor the new event path until the supported mobile population is stable.
5. Remove legacy payload/fields only in a later OpenSpec change.

## Migration

From `kido-server/`:

```bash
npm run migrate:rewards
npm run migrate:rewards -- --apply
```

Dry-run/apply report scanned and affected lesson/child counts. The command is
idempotent, backfills deterministic lesson versions, unions legacy week stickers into
stable IDs, initializes additive reward fields, and never deletes legacy reward data.

## Monitoring

Track oldest and p95 queue age, duplicate response rate, content/week-plan conflict
codes, CAS retries/exhaustion, pending terminal events by app version, and
first-completion/replay/sticker-award counts. Alert on rising queue age, a version
conflict spike after publish, or repeated CAS exhaustion. Never log full child results.

## Rollback

- Roll mobile back without clearing its reward queue; pending events keep their IDs.
- Server may temporarily disable canonical events while retaining additive schema
  fields and legacy reads/writes.
- Do not unset `contentVersion`, stable stickers, receipts, plans, or legacy weeks.
- Re-enable the path before retrying; receipts and monotonic guards prevent duplicates.

## Art identity and approval

Stable identity is independent from art: `sticker-w01` ... `sticker-w48` and
`world-NN/week-WW.png` never change. Current PNGs are technical placeholders.
Product/art must separately approve four world names, all 48 Vietnamese names,
recognizability, style consistency, and final phone/tablet rendering before replacing
files in place and closing the final-art task.

## Beta review for 6/3 thresholds

Keep thresholds fixed during this change. After beta, review aggregate first-attempt
distribution, 1/2/3-star distribution by age band and subject, replay uplift,
abandonment after 1-star results, child pressure/comprehension observation, and parent
feedback. Any threshold change requires a separate product decision and OpenSpec.

## Acceptance checklist

- Online: first completion, lower/higher replay, full-week and catch-up sticker,
  collection refresh, all badge boundaries, and no XP copy.
- Offline/reconnect: cached canonical lesson, restart with pending event, response-loss
  retry, duplicate delivery, mock fallback, and snapshot reconciliation.
- Concurrency: two clients complete the same lesson and produce one first-completion
  award with a deterministic final snapshot.
- Visual: every final sticker/name/world mapping is checked on phone and tablet.
