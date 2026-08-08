# Visual Asset System — Architecture

> **Status:** architecture umbrella (reference). Not an OpenSpec change itself.
> It is delivered by four sequential OpenSpec changes. This document holds the
> shared context, decisions, and risks; each change owns its own delta specs.

## Change map

| Change | Scope | Depends on |
|---|---|---|
| `materialize-primitive-assets` | Primitive capability registry, on-demand SVG materialization, Imagen-free routing, prewarm | — |
| `harden-generation-mechanics` | Deterministic-first mechanics repair, bounded low-temp semantic repair, auditable traces | — |
| `add-object-sprite-library` | Canonical object-sprite identity, generate-once-review, real background removal + alpha QA, schema/uniqueness/audit | — |
| `add-transform-based-visuals` | `math_compare_size`, `isSidedVisualCompare` allowlist, semantic `displayVariant`, pastel surfaces, count-tap scene/pastel + web parity; defers weight/capacity | `add-object-sprite-library` |

Suggested apply order: `materialize-primitive-assets` → `harden-generation-mechanics`
→ `add-object-sprite-library` → `add-transform-based-visuals` (one commit per
change: `feat(<change-name>): …`).

## Context

The pipeline distinguishes abstract primitives from generated real-world assets,
and `count_tap`/`compare_tap` already clone one object asset in mobile so counts
stay exact. Gaps this umbrella closes:

- `isKnownPrimitive` is backed by a finite in-memory set; a supported idea such
  as four green dots fails when only the coral variant was enumerated.
- `resolveLibraryAsset` creates an Imagen-backed record for a missing
  non-primitive `LIB-*` asset using slug parsing and `imageDesc` fallback.
- `buildIsolatedSpritePrompt` requests a white isolated background, but
  `image-processing.ts` only resizes and converts to WebP; it does not create
  alpha. Mobile masks generated backgrounds with a white sticker chip.
- `math_compare_length`/`math_compare_height` use two independently generated
  images even when the desired difference is one visual dimension.
- Generate-step mechanics repair re-invokes the same high-temperature generator
  and can still fail a deterministic word-count rule (`audioScript.correct ≤ 8`).

Two related but distinct asset systems result:

```text
Deterministic Primitive Registry         Generated Object Sprite Library
shape / number / dots / dice             fruit / animal / object / vehicle
parse + validate + render SVG            Imagen once + remove background
exact count and geometry                 recognizable reusable vocabulary
auto-approved renderer output            pending_review until human approval
```

## Goals / Non-Goals

### Goals

- Materialize any supported primitive variant on demand without Imagen.
- Reuse one canonical transparent object sprite across English and math.
- Make asset identity structured, stable, and independent from a single prompt.
- Ensure count and comparison constructs differ only in the intended variable.
- Provide stable, contrast-safe pastel surfaces without baking backgrounds in.
- Repair deterministic mechanics deterministically and keep diagnostics.
- Keep legacy content and the Human Gate/publish lifecycle compatible.

### Non-Goals

- No arbitrary free-form mobile transforms supplied by an LLM.
- No scale-based representation for weight, capacity, filled/empty, state change,
  spatial scenes, or causal situations.
- No automatic approval of Imagen-generated vocabulary sprites.
- No removal of scene-backed `count_tap`; scene and pastel modes coexist.
- No runtime image generation on the mobile device.
- No immediate rewrite of all legacy seed files; migration is phased.

## Decisions

### D1 — Separate primitive capability from physical asset existence

Primitive validity is determined by a registry/parser, not by whether a DB/GCS
record exists. The registry owns allowed kinds, ranges, colors, sizes, and
canonical IDs. A supported-but-missing spec renders SVG, stages locally, upserts
an approved record, and lets publish upload it. A malformed/unsupported spec
never falls back to Imagen. *(→ `materialize-primitive-assets`)*

### D2 — Canonical identity for generated object sprites

```ts
interface ObjectSpriteIdentity {
  themeCode: string       // fruit, farm_animals, transport, classroom...
  objectCode: string      // guava, apple, cat, bus...
  colorCode: string | null
  variantCode: string     // whole, sliced, leaf_attached...
  viewCode: string        // front, front_3q, side...
  styleVersion: string    // clay-v1, future versioned styles
}
```

The canonical ID derives from normalized identity, but DB lookups use structured
fields and a unique compound identity key. Labels are metadata, not identity.
Identity is first-write-wins within a `styleVersion`; a materially different
view/variant needs a different identity. *(→ `add-object-sprite-library`)*

### D3 — Missing object sprites are generated once and reviewed

Create an idempotent `pending` record → isolated single-object prompt → generate
one centered object on a controlled solid background → remove background and
standardize the alpha canvas → deterministic quality checks → save alpha-capable
WebP/PNG at `pending_review`. Reuse only after approval; concurrent requests
coalesce. Rejected assets keep identity + reason so a deliberate regeneration
increments a revision instead of duplicating. *(→ `add-object-sprite-library`)*

### D4 — Background removal is a real pipeline stage

Expose a replaceable `removeBackground` interface. v1 evaluates edge-connected
solid-background removal at full resolution (border-derived background color,
flood only border-connected pixels within a color-distance threshold, feather,
trim to alpha bbox, standardized padding). Deterministic checks: transparent
border ratio, exactly one significant foreground region, occupancy bounds, alpha
bbox not touching the edge, valid non-empty alpha. Failure → error/reviewable,
never a false "transparent". If the spike is not robust enough, the interface
permits a segmentation model without changing downstream contracts.
**Resolved:** ship edge-connected v1 behind the interface, budget a segmentation
fallback for the hard cases (white/reflective/thin detail).
*(→ `add-object-sprite-library`)*

### D5 — Pastel surfaces are deterministic and contrast-aware

Mobile does not call `Math.random()` at render. It derives a background token
from stable identity (`activityId + surfaceGroup`), then excludes palette colors
with insufficient contrast against the sprite's color metadata. All options in
one comparison/select group share the same surface token unless the activity
explicitly tests color. **Resolved:** persist the resolved token in the published
payload for exact audit/replay; the versioned algorithm is only used to generate
the token. *(→ `add-transform-based-visuals`)*

### D6 — Semantic display presets, not arbitrary transforms

```ts
type DisplayVariant = 'normal' | 'small' | 'large' | 'short' | 'long' | 'low' | 'tall'
```

Mobile owns fixed, versioned ratios:

- `small` / `large`: uniform scale around a shared center/baseline.
- `short` / `long`: horizontal-only transform.
- `low` / `tall`: vertical-only transform anchored to a shared baseline.

Assets declare `transformPolicy`; the pipeline rejects a variant an asset does
not allow. Long/short and low/tall require stretch-safe objects (pencils,
ribbons, ropes, sticks, bottles, trees, towers, columns). Weight/light, capacity,
filled/empty, and state-dependent comparisons cannot be represented by these
presets. *(→ `add-transform-based-visuals`)*

### D7 — Count-tap supports scene and pastel modes additively

```ts
surface?:
  | { mode: 'scene' }
  | { mode: 'pastel'; token?: PastelToken; algorithmVersion: string }
```

Legacy/no-surface content keeps current behavior and requires `backgroundAsset`.
`scene` requires an object-free `backgroundAsset`. `pastel` permits an absent
`backgroundAsset` and renders a deterministic pastel surface. Both modes clone
one transparent `targetAsset` exactly `targetCount` times with seeded
non-overlapping layout. Once alpha sprites are verified, the sticker chip is a
legacy fallback, not the default. *(→ `add-transform-based-visuals`)*

### D8 — Comparison stays additive to single-select (with an explicit R12 gate)

Big/small, long/short, and tall/short remain `single_select`; two options may
reference the same `assetId` with different semantic `displayVariant`.
Correctness stays in `isCorrect`/`correctAnswer`.

**Resolved taxonomy + validation integration:**

- Add the canonical skill `math_compare_size` (domain `cmp`, `single_select`,
  `small`/`large`, uniform scale) so big/small has an explicit home.
  `math_seriation_size` stays a 4-item `sort_sequence` and is out of the
  transform phase.
- Phase-one transform roster (locked):

  | Skill | Action type | Transform |
  |---|---|---|
  | `math_compare_size` | `single_select` | `small`/`large`, uniform |
  | `math_compare_length` | `single_select` | `short`/`long`, horizontal |
  | `math_compare_height` | `single_select` | `low`/`tall`, vertical |
  | `math_seriation_size` | `sort_sequence` | not in the transform phase |
  | `math_compare_quantity` | `compare_tap` | no `displayVariant` |

- Replace the domain-wide `isSidedCompare(skillCode) === 'cmp'` R12 exemption
  with an explicit `isSidedVisualCompare(skillCode, actionType)` allowlist:
  true only for `single_select` × {`math_compare_size`, `math_compare_length`,
  `math_compare_height`}. Validation flow:

  ```text
  single_select
    ├─ sided visual compare (allowlist)
    │    ├─ forbid questionImage
    │    ├─ same canonical sprite identity
    │    ├─ differ by exactly one display dimension
    │    └─ transformPolicy allows it
    └─ ordinary activity
         └─ require questionImage (R12)
  compare_tap
    └─ validateCompareTap only (never the branch above)
  ```

The generator/reviewer enforce: same identity across compared options, exactly
one intended dimension differs, a preschool-perceivable minimum ratio, and shared
surface/alignment to prevent irrelevant clues. *(→ `add-transform-based-visuals`)*

### D8a — Weight/capacity deferred to post-MVP

`math_compare_weight` and `math_compare_capacity` stay in the catalog for
taxonomy completeness but are marked `⏸`. Scale/stretch cannot express those
constructs, and two-independent-images lacks valid evidence, so a lint/generator
guard rejects these seeds (stable error code) until a purpose-built visual exists
(balance scale for weight; container/fill-level composite for capacity), proposed
in a separate future change. *(→ `add-transform-based-visuals`)*

### D9 — Deterministic mechanics repair precedes semantic repair

`generateStep` runs deterministic repair for rules with an unambiguous safe
correction, then re-validates. Examples: replace an over-budget
`audioScript.correct` with an approved short praise template; derive
`correctAnswer` from the single `isCorrect` option; derive `correctSide` from
mode/counts; remove only surplus incorrect distractors; controlled replacement of
forbidden academic terms when meaning is preserved. Remaining semantic violations
use a dedicated structured repair at temperature `0..0.1`, at most two attempts,
each recording error codes and before/after fields. A failed repair stays an
error and never weakens the validator. *(→ `harden-generation-mechanics`)*

### D10 — Backward compatibility and lifecycle

- Existing library asset IDs remain aliases to backfilled identity where mapping
  is unambiguous.
- Existing scene-backed count-tap payloads remain valid.
- Existing single-select options without `displayVariant` render as `normal`.
- Existing non-alpha assets keep the sticker-chip fallback until regenerated.
- Primitive renderer output may be auto-approved; Imagen output requires review.
- Activity status still follows `draft → pending_review → approved → imported`.

## Resolved open questions

- **Background removal v1:** edge-connected solid-background behind a replaceable
  interface; prepare a segmentation fallback for hard cases. *(D4)*
- **Pastel token:** persist the resolved token in the published payload;
  `algorithmVersion` only generates it. *(D5)*
- **`primitivePlan` on seeds:** deferred — on-demand materialization plus
  `assertPrimitiveAssets` already prevents LLM-minted primitive IDs.
- **`displayVariant` placement:** directly on the option (not a separate
  comparison block). *(D8)*
- **Object taxonomy:** one shared object identity catalog; subject/theme mappings
  reference it. *(D2)*

## Risks / Trade-offs

- **R1 — Taxonomy explosion:** controlled catalogs, normalized codes, uniqueness,
  explicit variant creation.
- **R2 — Background-removal artifacts:** edge-connected masking, alpha metrics,
  human review, replaceable segmentation implementation.
- **R3 — Transform distortion:** `transformPolicy` allowlist, semantic presets,
  fixed ratios, Human Gate preview at mobile dimensions.
- **R4 — Background as answer clue:** stable shared surface group and
  contrast-aware selection.
- **R5 — First-write identity mismatch:** pending review before reuse, style
  versioning, generation revision, explicit replacement workflow.
- **R6 — Cross-repo contract drift:** mirror schema in docs/pipeline/server/
  mobile and add end-to-end payload tests.
- **R7 — Change size:** split into four sequenced changes; canary W02 before
  corpus migration.

## Migration Plan

1. Land primitive materialization and tests; prewarm remains available.
2. Land object identity + alpha-processing behind a flag; generate a small review
   set (fruit first).
3. Land deterministic + semantic mechanics repair.
4. Land mobile sprite `contain`, pastel surface, semantic transforms,
   `math_compare_size`, and the R12 allowlist while retaining legacy fallbacks.
5. Backfill existing library identities and alpha capability where unambiguous;
   never overwrite approved images automatically.
6. Canary `SEED-toan-w02-D4-01`, affected W02 activities, and a small English
   fruit vocabulary set through Human Gate and publish.
7. Audit the affected seed corpus, regenerate only content that benefits, and
   expand theme catalogs gradually.

Rollback disables new generation/materialization and display modes while
compatibility readers keep rendering legacy assets and payloads.
