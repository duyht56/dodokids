# Tasks: add-object-sprite-library

## 1. Canonical identity and model

- [x] 1.1 Define generated object identity catalogs (`themeCode`, `objectCode`,
  `colorCode`, `variantCode`, `viewCode`, `styleVersion`) and normalization rules.
- [x] 1.2 Extend the library-asset model/indexes with canonical identity, alpha/
  crop metadata, transform eligibility, generation revision, and audit fields.
- [x] 1.3 Enforce (or transactionally guarantee) uniqueness for the normalized
  logical identity + style version.

## 2. Resolution and generation

- [x] 2.1 Resolve library assets by structured identity before creating a
  generation job; coalesce concurrent missing-identity requests onto one asset.
- [x] 2.2 Build role-aware isolated-object prompts from identity plus `imageDesc`,
  with stable style versioning.
- [x] 2.3 Generate a missing sprite once and set it to `pending_review`; reuse
  only after approval.
- [x] 2.4 Add regeneration/rejection revision handling that preserves identity and
  reason without creating duplicate logical objects.
- [x] 2.5 Add approved-asset reuse across subjects and activities with usage
  tracking.

## 3. Background removal and alpha QA

- [x] 3.1 Introduce a replaceable `removeBackground` interface and implement an
  edge-connected solid-background spike at full resolution.
- [x] 3.2 Feather alpha, trim to the alpha bounding box, pad to a standard canvas,
  then downscale and encode alpha-capable WebP/PNG.
- [x] 3.3 Add deterministic alpha/border/occupancy/connected-region quality checks
  with structured error codes.
- [x] 3.4 Route failed removal to review/error rather than marking the asset
  transparent/approved.
- [x] 3.5 Add Human Gate sprite preview on multiple pastel surfaces and at real
  mobile sizes.
- [x] 3.6 Evaluate the spike on thin-detail, white, reflective, and shadowed
  objects; choose edge removal or a segmentation service from recorded results.

## 4. Publish and compatibility

- [x] 4.1 Prevent unapproved generated sprites from being silently reused or
  published.
- [x] 4.2 Preserve alpha and identity metadata through local staging, publish
  payload construction, upload, and server ingest; keep upload idempotent.
- [x] 4.3 On mobile, render verified alpha sprites without the sticker chip;
  retain the chip only for legacy/non-alpha assets.
- [x] 4.4 Backfill structured identity for existing assets where mapping is
  unambiguous; report conflicts without overwriting approved images.

## 5. Tests

- [x] 5.1 Add tests for identity resolution, concurrency coalescing, alpha QA
  pass/fail, review gating, and publish metadata preservation.
