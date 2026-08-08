## 1. Production Setup And Contracts

- [x] 1.1 Create the 48-row subject/prompt manifest from the canonical sticker catalog without changing IDs, names, worlds, or paths.
- [x] 1.2 Create the staging, source, final, and review directory structure under the change-owned local asset area.
- [x] 1.3 Add reusable prompt scaffolds for the soft-3D Kido sticker style, per-world palettes, chroma-key selection, and negative constraints.
- [x] 1.4 Add an asset validator for exact count/mapping, 512x512 RGBA, transparent corners, subject coverage, file-size budget, hashes, and duplicate bitmap detection.
- [x] 1.5 Add deterministic contact-sheet generation for each world and the full 48-sticker pack.

## 2. Anchor Style Lock

- [x] 2.1 Generate and stage week 01 `Mầm xanh` as the World 1 anchor.
- [x] 2.2 Generate and stage week 13 `Vỏ sò` as the World 2 anchor.
- [x] 2.3 Generate and stage week 25 `Tên lửa` as the World 3 anchor.
- [x] 2.4 Generate and stage week 37 `La bàn` as the World 4 anchor.
- [x] 2.5 Remove chroma-key backgrounds, normalize all four anchors to 512x512 RGBA, and inspect alpha/fringe/safe area.
- [x] 2.6 Record the locked shape language, rim, lighting, palette, and prompt invariants in the manifest before batch generation.

## 3. World 1 — Khu Vườn Diệu Kỳ

- [x] 3.1 Generate/finalize week 02 `Lá non`.
- [x] 3.2 Generate/finalize week 03 `Hoa mặt trời`.
- [x] 3.3 Generate/finalize week 04 `Ong chăm chỉ`.
- [x] 3.4 Generate/finalize week 05 `Bướm sắc màu`.
- [x] 3.5 Generate/finalize week 06 `Táo đỏ`.
- [x] 3.6 Generate/finalize week 07 `Cầu vồng`.
- [x] 3.7 Generate/finalize week 08 `Mây vui`.
- [x] 3.8 Generate/finalize week 09 `Mặt trời`.
- [x] 3.9 Generate/finalize week 10 `Giọt mưa`.
- [x] 3.10 Generate/finalize week 11 `Cây nhỏ`.
- [x] 3.11 Generate/finalize week 12 `Khu vườn diệu kỳ` world crest.

## 4. World 2 — Đại Dương Xanh

- [x] 4.1 Generate/finalize week 14 `Cá heo`.
- [x] 4.2 Generate/finalize week 15 `Sao biển`.
- [x] 4.3 Generate/finalize week 16 `Rùa biển`.
- [x] 4.4 Generate/finalize week 17 `Cá ngựa`.
- [x] 4.5 Generate/finalize week 18 `San hô`.
- [x] 4.6 Generate/finalize week 19 `Bạch tuộc`.
- [x] 4.7 Generate/finalize week 20 `Cá voi`.
- [x] 4.8 Generate/finalize week 21 `Ngọc trai`.
- [x] 4.9 Generate/finalize week 22 `Thuyền buồm`.
- [x] 4.10 Generate/finalize week 23 `Hải đăng`.
- [x] 4.11 Generate/finalize week 24 `Đại dương xanh` world crest.

## 5. World 3 — Vũ Trụ Kỳ Thú

- [x] 5.1 Generate/finalize week 26 `Mặt trăng`.
- [x] 5.2 Generate/finalize week 27 `Sao băng`.
- [x] 5.3 Generate/finalize week 28 `Hành tinh xanh`.
- [x] 5.4 Generate/finalize week 29 `Phi hành gia`.
- [x] 5.5 Generate/finalize week 30 `Vệ tinh`.
- [x] 5.6 Generate/finalize week 31 `Sao Thổ`.
- [x] 5.7 Generate/finalize week 32 `Chòm sao`.
- [x] 5.8 Generate/finalize week 33 `Tàu không gian`.
- [x] 5.9 Generate/finalize week 34 `Người bạn ngoài hành tinh`.
- [x] 5.10 Generate/finalize week 35 `Dải ngân hà`.
- [x] 5.11 Generate/finalize week 36 `Vũ trụ kỳ thú` world crest.

## 6. World 4 — Hành Trình Rực Rỡ

- [x] 6.1 Generate/finalize week 38 `Ba lô`.
- [x] 6.2 Generate/finalize week 39 `Lều nhỏ`.
- [x] 6.3 Generate/finalize week 40 `Ngọn núi`.
- [x] 6.4 Generate/finalize week 41 `Thác nước`.
- [x] 6.5 Generate/finalize week 42 `Cây cầu`.
- [x] 6.6 Generate/finalize week 43 `Lâu đài`.
- [x] 6.7 Generate/finalize week 44 `Kho báu`.
- [x] 6.8 Generate/finalize week 45 `Vương miện`.
- [x] 6.9 Generate/finalize week 46 `Ngọn cờ`.
- [x] 6.10 Generate/finalize week 47 `Huy chương`.
- [x] 6.11 Generate/finalize week 48 `Hành trình rực rỡ` world crest.

## 7. Pack QA And Promotion

- [x] 7.1 Run alpha/dimension/coverage/size/hash/duplicate validation across all 48 staged finals and fix every failure.
- [x] 7.2 Generate four world contact sheets plus the full 48-sticker contact sheet with exact week/name captions outside the assets.
- [x] 7.3 Review close-subject pairs and all four world crests for small-cell recognizability and regenerate only failed stickers.
- [x] 7.4 Complete the provenance manifest with final prompts, key colors, paths, dimensions, hashes, validation results, and generation route.
- [x] 7.5 Promote the complete validated pack to the fixed mobile asset paths in one controlled step.
- [x] 7.6 Run mobile reward/catalog contract verification and targeted lint/type-check after promotion.
- [x] 7.7 Update the sticker asset README and reward runbook with the final art version, manifest, review artifacts, and rollback instructions.

## 8. Acceptance And Handover

- [x] 8.1 Run strict OpenSpec validation for `design-48-reward-sticker-assets`.
- [x] 8.2 Visually inspect every final sticker and all contact sheets for recognizability, style drift, clipping, fringe, unintended text, and subject/name mismatch.
- [x] 8.3 Capture phone 4-column, tablet 6-column, earned, locked, and reward-reveal screenshots or record the exact device blocker.
- [ ] 8.4 Obtain user/product approval of the final contact sheet before marking artwork final.
- [ ] 8.5 After approval, close the matching final-art task in `revise-child-reward-system` while leaving its on-device concurrency tasks independent.
