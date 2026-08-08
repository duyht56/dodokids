# Kido Entitlements: Activation Codes and Experience Campaign

This document is the operational contract for non-store course access in
`kido-server`. Store purchases remain under `/iap/verify-*`; activation codes
and the database-controlled experience campaign are additional access sources.

## Effective access order

The server computes effective entitlement on every entitlement or lesson
request:

1. A non-expired paid annual entitlement remains authoritative.
2. An eligible experience campaign grants annual/full-course access until the
   configured `endsAt`.
3. A non-expired IAP or activation-code entitlement applies.
4. The child falls back to the base trial (weeks 1-2).

`expiresAt` is checked using server time. An `active` stored entitlement whose
expiry is in the past is treated as `expired` even if its database status has
not yet been rewritten.

## Activation codes

Codes are one-time and child-specific after redemption. MongoDB stores only a
SHA-256 lookup hash plus the last four characters; plaintext codes are never
stored.

### Provision from landing page or marketing

Configure `ACTIVATION_CODE_ADMIN_KEY` on `kido-server`. The trusted backend
sends the same value in `x-admin-key`:

```http
POST /admin/activation-codes
x-admin-key: <ACTIVATION_CODE_ADMIN_KEY>
Content-Type: application/json

{
  "code": "KIDO-A7M4-Q2P9",
  "plan": "annual",
  "durationDays": 365,
  "source": "landing_page",
  "validUntil": "2027-12-31T16:59:59.999Z",
  "externalRef": "payment-order-123"
}
```

`source` is `landing_page`, `marketing`, or `manual`. The landing backend
should generate a high-entropy code and persist it with the payment/order. A
retry with the same code and `externalRef` is idempotent; conflicting reuse
returns `409 activation_code_conflict`.

### Redeem from mobile

The parent UI calls the household-authenticated endpoint:

```http
POST /iap/activation-code/redeem
Authorization: Bearer <anonymous household device token>

{ "childId": "child_x", "code": "KIDO-A7M4-Q2P9" }
```

The code is atomically marked `redeemed` before the child entitlement is saved.
A child-write failure performs a best-effort rollback so the code is not lost.
Repeating the same code for the same household and child is idempotent; another
household or child receives `409 activation_code_unavailable`.

## Experience campaign in MongoDB

Collection: `trial_campaign_configs`

The single date `endsAt` is both:

- the registration cutoff (`households.createdAt <= endsAt`), and
- the end of free full-course access (`serverNow < endsAt`).

Enable or change the campaign directly in MongoDB (dates are UTC):

```javascript
db.trial_campaign_configs.updateOne(
  { key: "early_registration_full_access" },
  {
    $set: {
      enabled: true,
      endsAt: ISODate("2026-08-31T16:59:59.999Z"),
      updatedAt: new Date()
    },
    $setOnInsert: { createdAt: new Date() }
  },
  { upsert: true }
)
```

Invalidate immediately without a deployment:

```javascript
db.trial_campaign_configs.updateOne(
  { key: "early_registration_full_access" },
  { $set: { enabled: false, updatedAt: new Date() } }
)
```

There is deliberately no application cache for this config. Disabling it,
moving `endsAt` earlier, or letting the date pass takes effect on the next
`GET /iap/entitlement` or lesson request. Lesson access remains
server-authoritative even if mobile still has an older local display value.

## Effective entitlement response

`GET /iap/entitlement?childId=` returns the existing fields plus
`accessSource`: `base_trial`, `iap`, `activation_code`, or `trial_campaign`.
Mobile refreshes this endpoint during IAP/bootstrap sync.

