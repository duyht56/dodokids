## 1. OpenAI seed generation

- [x] 1.1 Add `openai` dependency and config (`OPENAI_API_KEY`, `OPENAI_BASE_URL`, `OPENAI_MODEL`, `OPENAI_SEED_TEMPERATURE`)
- [x] 1.2 Add GPT seed service using Responses API Structured Outputs
- [x] 1.3 Add next-missing-week detection and generated seed JSON validation
- [x] 1.4 Build prompt context from routine docs, seed examples, seed type contract, skill catalog, and seed-review rules

## 2. Import integration

- [x] 2.1 Add shared seed import helper
- [x] 2.2 Update CLI import to use the shared helper
- [x] 2.3 Update UI import API to use the shared helper and backfill `domainCode`
- [x] 2.4 Generate seed file first, then import and enqueue seed review

## 3. Admin API/UI

- [x] 3.1 Add `GET/POST /api/pipeline/generate-seeds`
- [x] 3.2 Add `/seeds` panel showing next missing week and generation result
- [x] 3.3 Keep Generate Activity controls unchanged

## 4. Specs/docs/tests

- [x] 4.1 Add OpenSpec proposal/design/tasks
- [x] 4.2 Add deltas for `pipeline-operations` and `content-pipeline-flow`
- [x] 4.3 Add unit tests for week detection, seed JSON validation, import defaults, and fake-generator file write
- [x] 4.4 Run `cd kido-pipeline && npm test`
- [x] 4.5 Run `cd kido-pipeline && npm run build`
