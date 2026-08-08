# Proposal: add-gpt-math-seed-generator

## Why

Math seed authoring currently lives outside the managed pipeline: an operator copies `docs/prompts/gen-math-seed.routine.md` into a GPT/Claude-style tool, receives JSON, saves `seeds/wNN.json`, imports it, then triggers seed review. That manual gap is easy to forget, hard to audit from the admin UI, and duplicates logic such as next-missing-week detection and `domainCode` backfill.

This change brings the seed authoring step into `kido-pipeline` while preserving the existing gates. GPT creates only the seed file artifact; the normal import, seed review, seed approval, activity generation, Human Gate, and publish controls still decide whether content moves forward.

## What Changes

- Add a pre-Step-0 seed generation stage for math: GPT generates exactly the next missing `seeds/wNN.json` file.
- Use OpenAI Responses API with Structured Outputs so the model response is constrained to the seed JSON shape.
- Add a shared seed import helper used by CLI import, UI import, and generated seed import.
- Add admin UI control on `/seeds`: generate the next missing math week, import it, and enqueue seed review.
- Add `POST /api/pipeline/generate-seeds` for the fixed v1 flow: `next_missing_week`, subject `toan`, file plus import, seed-review enqueue.
- Keep activity generation unchanged: only approved seeds with pending/error pipeline status can be generated.

## Capabilities

### New Capabilities

- `gpt-math-seed-generation`: creates the next missing math seed week file from GPT, validates it, imports it, and enqueues seed review.

### Modified Capabilities

- `pipeline-operations`: admin can generate seed files without leaving the UI.
- `content-pipeline-flow`: canonical flow gains Seed Generation before Seed Review.

## Impact

- **kido-pipeline**: OpenAI dependency/config, seed-generation service, shared import helper, generate-seeds API route, `/seeds` admin panel, focused tests.
- **Docs/OpenSpec**: content pipeline and operations specs describe the new managed seed-generation stage.
- **Not affected**: server publish contract, mobile runtime, activity payload schema, Human Gate approval rules.
