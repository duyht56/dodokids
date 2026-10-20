## 0. Điều kiện trước

- [x] 0.1 Commit phần `update-explore-leveled-rounds`: mobile `ac1b996` và kido-server `9acc711` (trên `feat/app-update-flow`), kido-pipeline `efcef7a` (`main`), repo gốc `3ca9b5b`. Commit gồm cả audio pack v7 (Ú òa, Đúng vị trí), vì dùng chung file.
- [ ] 0.2 Archive trước change này, vì delta ở đây viết trên bản của chúng (design §8):
  - [ ] `enhance-explore-pattern-families-fixerror`
  - [ ] `fix-explore-catalog-round-1`
  - [ ] `replace-explore-tracing-with-route-planner`
  - [ ] `add-explore-round-2-games`
  - [ ] Hai change đầu cùng MODIFIED "Unique missing answer". Hợp nhất hai bản trước khi archive bản thứ hai.
- [x] 0.3 (2026-10-20: duyệt phương án A và 5 câu tiêu chí) Owner duyệt câu `pattern_intro_3` mới (đề xuất ở design §5) và 5 câu "Khi nào bé đã vững?" của Tìm quy luật (task 2.5).

## 1. Họ `rotation` trong `patternGame.ts`

- [x] 1.1 Thêm `PatternFamily` `rotation`, `PatternTokenKind` `arrow`, grammar `rotate_quarter`. Token id là `arrow:0/90/180/270`, một màu. Chiều xoay là param theo seed (+90 / +270).
- [x] 1.2 Thêm nhánh họ thứ ba (không phải cycle, không phải progression) vào: `materialize`, `minContextIndex` (complete = 4), `optionsFor` (đáp án + 2 hướng đã hiện), `uniqueCandidate`, `familyPresentationOk`, `familyTokenKind`, nhánh `validateComplete`.
- [x] 1.3 `PATTERN_LEVELS[3].grammars` thêm `rotate_quarter`. Bậc 4–5 không đổi.
- [x] 1.4 Bài `rotation` luôn ở mode `complete`. Validator từ chối `fix_error` cho `rotation`.
- [x] 1.5 Validator độc lập: dựng lại hàng, ô trống ở index 4–5, hai cách đọc cho cùng đáp án, đúng 3 lựa chọn đều có trên hàng, thứ tự tái tạo được (design §3).
- [x] 1.6 Tăng version: `pattern-finder-v6`, `pattern-finder-validator-v5`, config `v6`.
  - [x] `dependencyManifest`: version manifest mới, dependency generator `6` / validator `5` / config `6`, asset `pattern-primitive-tokens` tăng vì có thêm mũi tên. Mirror manifest ở kido-server.
  - [x] Sửa comment cũ "One fresh run climbs…" ở `PATTERN_FINDER_GAME`.

## 2. Renderer và audio

- [x] 2.1 Tách `Arrow` của `SpinPatternRenderer.tsx` thành primitive dùng chung. Thêm nhánh `arrow` vào `TokenGlyph` của `PatternFinderRenderer.tsx`.
- [x] 2.2 `ruleHint` của `rotation` = "Nhìn nhóm hình lặp lại từ đầu nhé.".
- [x] 2.3 `promptAudio.ts`:
  - [x] `PatternPromptFamily` thêm `rotation`. `patternPromptPhraseId('rotation', *)` → `spin_which`. Gợi ý → `pattern_hint_shape`.
  - [x] Xoá `spinPatternKeys`.
  - [x] Đổi chữ `pattern_intro_3` theo câu owner đã duyệt.
- [x] 2.4 (2026-10-20: gen clip `bay-gio-co-ba-hinh-thay-phien-nhau-va-mui-ten-xoay-be-xem-ky-nhe`, owner nghe duyệt, approve + export pack 486 clip; chỉ wav pattern-intro-3 và thời lượng 3730 ms đổi) kido-pipeline `exploreAudioInventory.ts`: mirror câu `pattern_intro_3` mới, sửa comment `spin_which`. Gen một clip, owner nghe duyệt, export pack (mobile `exploreAudioRegistry.generated.ts`).
- [x] 2.5 `masteryCriteria.ts`: thêm `pattern_finder` bậc 1–5 (owner duyệt câu chữ). Câu bậc 3 nhắc cả ba hình thay phiên lẫn mũi tên xoay, để phụ huynh biết muốn bé luyện xoay thì chọn bậc 3 (design §6). Mở rộng kiểm tiêu chí trong `verify-explore-parent-config-contracts.cjs`.

## 3. Variety và lượt

- [x] 3.1 `variety.ts`: bucket L3 của `pattern_finder` = `object_cycle`, `color_cycle`, `rotation`, `fix_error`. Kiểm capacity L3, và vòng 6 bài chia đều 2/2/1/1. Xoá cấu hình variety của spin.
- [x] 3.2 `registry.ts`: xoá import, dòng GAME_COPY, LOCAL_GAMES, BUNDLED_OVERRIDES và mục `isProgressiveExploreRunGame` của spin. `pattern_finder` vẫn trong `LEVELED_ROUNDS`.

## 4. Gỡ `spin_pattern`

- [x] 4.1 Bỏ mã ở ba nơi cùng lúc, giữ thứ tự: `docs/kido-explore-contract.ts`, `mobile/src/types/explore.ts`, `kido-server/src/modules/explore/explore.types.ts`.
- [x] 4.2 mobile:
  - [x] Xoá `games/spinPatternGame.ts`, `renderers/SpinPatternRenderer.tsx`, `scripts/verify-explore-spin-pattern-contracts.cjs`, script `test:explore-spin-pattern` trong `package.json`.
  - [x] Xoá `assets/images/explore/spin-pattern.png` và dòng của nó trong `assets/images/explore/README.md`.
  - [x] Bỏ mục spin trong `rendererRegistry.tsx` và `thumbnails.ts`.
- [x] 4.3 kido-server:
  - [x] `explore.registry.ts`: xoá PUBLIC_GAMES, union, BUNDLED_LOCAL_GAMES; mirror version pattern v6/v5.
  - [x] `explore.service.spec.ts`: 13 → 12.
  - [x] `explore.pattern.spec.ts`: version, corpus `rotation`, helper độc lập.
- [x] 4.4 Cấu hình phụ huynh: xác nhận khoá cũ `startingLevelByGame.spin_pattern` bị bỏ qua, không lỗi. Có thể dọn fixture trong `verify-explore-parent-config-contracts.cjs`.

## 5. Catalog

- [x] 5.1 `ExploreCatalogScreen.tsx` `CATALOG_GROUPS`: "Quy luật" = `pattern_finder`, `missing_cell`; "Trí nhớ" = `memory_match`, `peekaboo_recall`; "Sắp xếp và dẫn đường" giữ nguyên. Kiểm assert thứ tự catalog (`verify-explore-number-bus-contracts.cjs`).

## 6. Contract và kiểm

- [x] 6.1 `verify-explore-pattern-contracts.cjs`:
  - [x] Bảng bucket theo bậc, version pin, ≥ 200 bài L3 có `rotation`, phủ đủ 16 biến thể xoay.
  - [x] Port từ contract spin: lựa chọn có đáp án, replay theo seed.
  - [x] Mở rộng kiểm "hàng một dòng ở 375pt" sẵn có của contract pattern sang hàng mũi tên. Contract spin không có kiểm này.
  - [x] `rotation` không bị kiểm "đủ hai chu kỳ".
  - [x] Từ chối ô trống ở index 0–3, `fix_error` cho `rotation`, lựa chọn ngoài hàng.
- [x] 6.2 Sửa `verify-explore-variety-buckets.cjs` (bỏ generator spin), `verify-explore-prompt-lines-contracts.cjs` (GENERATORS), `verify-explore-number-bus-contracts.cjs` (assert "number_bus đứng sau spin_pattern"), `verify-explore-leveled-rounds-contracts.cjs` nếu có nhắc spin.
- [x] 6.3 Chạy: mọi `npm run test:explore-*`, `npx tsc --noEmit` và `npm run lint` (mobile); `npm test` (kido-server); test pipeline; `openspec validate merge-explore-spin-into-pattern --strict`.
- [ ] 6.4 (2026-10-20: đã kiểm trên iPhone 17 Pro 402pt: catalog đúng nhóm, bậc 3 có bài mũi tên một hàng, 3 lựa chọn, chọn đúng lấp ô; còn 375/390pt và câu intro mới) Sim iOS ở 375pt và 390pt: L3 có mũi tên trên một dòng, ba lựa chọn, câu đề `spin_which` phát, lên bậc 3 nghe câu intro mới. Catalog không còn Xoay hình, nhóm hiện đúng.

## 7. Docs

- [x] 7.1 BRD:
  - [x] §7.7 thêm họ `rotation` và ghi tăng version (sửa luôn chữ v4/v3 đã cũ).
  - [x] §10 bỏ Xoay hình khỏi danh sách giữ cách chạy cũ.
- [x] 7.2 `AI_CONTEXT.md`: 12 mã, pattern v6/validator-v5, xoay là họ của `pattern_finder`.
- [x] 7.3 `KIDO_EXPLORE_REVIEW.md:208`: ghi đã đảo quyết định standalone (2026-10-19).
- [x] 7.4 `KIDO_EXPLORE_THUMBNAIL_PROMPTS.md`: đánh dấu thumbnail Xoay hình đã nghỉ.
- [ ] 7.5 Marketing:
  - [ ] (2026-10-20: dòng C-50 còn nằm trong phần marketing CHƯA commit của việc khác; đã ghi chú cách sửa vào chính dòng đó, sửa thật khi bản gộp lên store) `KIDO_MARKETING_CLAIMS.md` C-50: bỏ "Xoay hình" khỏi danh sách tên trò. "Quy luật xoay hướng" là một phần của Tìm quy luật. Đếm lại số trò theo đúng bản phát hành: nếu Cân thăng bằng lên cùng bản thì vẫn 12.
  - [x] Landing `/khu-kham-pha` giữ nguyên.
  - [ ] Ads: card `rotate.mp4` (`marketing/ads-video/src/overview.tsx`) quay game Xoay hình cũ. Nếu quảng cáo còn chạy sau bản phát hành thì quay lại cảnh bậc 3 của Tìm quy luật. Chỉ đổi tên Sequence thì không đủ, vì tên đó không hiện trên video.
- [x] 7.6 `openspec/changes/update-explore-leveled-rounds` (proposal + tasks 4.1): bỏ `spin_pattern` khỏi danh sách chờ owner.
- [x] 7.7 `add-explore-number-bus-game` (chưa archive): requirement đồng bộ mã (spec.md ~dòng 296–304) ghi "thêm `spin_pattern` còn thiếu". Đó là lịch sử của lần đồng bộ 12 mã. Ghi chú rằng change này đã gỡ mã đó, hoặc archive number-bus trước, để main spec không còn câu SHALL mâu thuẫn.

## 8. Phát hành

- [ ] 8.1 Phát hành bằng skill release-mobile (chọn store hay OTA). Ghi `MOBILE_RELEASE_LOG.md`.
- [ ] 8.2 Playtest bậc 3 có mũi tên với bé trước khi lên production.
