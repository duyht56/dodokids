# Proposal: materialize-primitive-assets

> Part of the visual-asset-system architecture umbrella
> (`docs/KIDO_VISUAL_ASSET_SYSTEM.md`). Independent; may land first.

## Why

Primitive validity is currently backed by a finite in-memory set
(`PRIMITIVE_ASSET_IDS` in `primitive-pack.ts`). A semantically valid idea such
as four green dots fails when only the enumerated coral variant exists, and a
missing `LIB-*` reference can fall through to Imagen instead of being rendered
deterministically. Abstract math content must be exact and reproducible, so
primitive assets should be a computed capability, not a pre-seeded file list.

## What Changes

- Replace the finite primitive lookup with a controlled capability
  registry/parser that defines supported kinds, values, colors, sizes, and
  canonical IDs, and that can parse, validate, canonicalize, and render.
- Materialize a valid-but-missing primitive as SVG on demand, stage it locally,
  and upsert an approved `assets_library` record — with no Imagen job.
- Guarantee a malformed or unsupported primitive reference returns a structured
  validation error and never falls back to free-form image generation.
- Keep `seed:primitives` as an optional bulk pre-warm command backed by the same
  registry.

## Capabilities

### New Capabilities

- `visual-asset-library`: primitive capability registry, on-demand
  materialization, and publish-safe approved primitive records. (First change to
  introduce this capability; the sprite-library and transform changes extend it.)

### Modified Capabilities

- `content-pipeline-flow`: primitive references route through deterministic
  materialization and never enqueue an Imagen job.

## Impact

- **kido-pipeline**: `primitive-pack.ts` refactor into parse/validate/render
  APIs, asset resolver primitive branch, `primitive-guard`, `seed:primitives`
  prewarm, and focused unit/concurrency tests.
- **docs**: fix the `primitive-pack` size comment (`3 size` → `4 size`) and add a
  test asserting the vocabulary prompt and renderer read sizes from one source.
- **data**: additive; existing primitive `LIB-*` IDs remain valid.
