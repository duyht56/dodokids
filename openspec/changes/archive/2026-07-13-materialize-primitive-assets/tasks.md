# Tasks: materialize-primitive-assets

## 1. Registry and grammar

- [x] 1.1 Define the primitive capability/spec parser, canonical ID grammar, and
  supported colors/ranges/sizes, preserving all currently exported IDs as
  compatibility aliases. → `parsePrimitiveId` / `isPrimitiveDomain`;
  `PRIMITIVE_ASSET_IDS` kept as the pre-warm alias set.
- [x] 1.2 Refactor `primitive-pack.ts` into `parse` / `validate` / `canonicalize`
  / `render` APIs backed by the registry. → `parsePrimitiveId` returns the
  canonical spec; `isKnownPrimitive`/`getPrimitiveSpec` now parser-backed;
  `renderSvg` unchanged.
- [x] 1.3 Expand controlled dot/dice/ten-frame color capabilities without
  allowing arbitrary free-form variants. → `COUNT_COLORS` closed palette.

## 2. On-demand materialization

- [x] 2.1 Add idempotent on-demand materialization: render SVG, stage locally,
  upsert an `assets_library` record with `approved` status. →
  `pipeline/primitive-materialize.ts` (`materializePrimitiveAsset`).
- [x] 2.2 Ensure valid missing primitives never enter the Imagen/image queues and
  invalid primitive IDs never fall back to generated images (structured error).
  → `resolveLibraryAsset` primitive-domain branch in `steps/3-assets.ts`.
- [x] 2.3 Keep `seed:primitives` as an optional bulk pre-warm command backed by
  the same registry. → `seed-primitive-library.ts` unchanged (uses
  `listPrimitives` + `renderSvg`).

## 3. Docs and tests

- [x] 3.1 Fix the `primitive-pack` header/loop size comment mismatch
  (`3 size` → `4 size`) and any stale count.
- [x] 3.2 Add a test asserting `primitiveVocabularyPrompt` and the renderer read
  sizes/colors/ranges from one shared source.
- [x] 3.3 Add unit tests for parsing, ranges, canonical IDs, SVG correctness, and
  no-Imagen routing (via `isPrimitiveDomain`/`parsePrimitiveId` decision). NOTE:
  DB-level concurrency coalescing relies on the idempotent `updateOne` upsert; an
  isolated integration test needs Mongo and is deferred to the change-3 harness.
