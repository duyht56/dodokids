# Tasks — add-explore-number-bus-game (GĐ1)

> Tiền đề: hoàn thành change `add-explore-parent-starting-levels` (GĐ0) trước
> — GĐ1 dựa vào `startingLevelByGame` + `resolveStartingLevel` clamp.
> Nguồn chi tiết cho mọi mục: `design.md` của change này.

## 1. Contract codes (đồng bộ ba nơi về 12 code)

- [x] 1.1 `docs/kido-explore-contract.ts`: thay danh sách thế hệ cũ bằng nguồn
      chuẩn mobile + `number_bus` (12 code: tracing_workshop, route_planner,
      pattern_finder, memory_match, stack_tower, missing_cell,
      peekaboo_recall, mirror_build, ordinal_position, number_chain,
      spin_pattern, number_bus)
- [x] 1.2 `mobile/src/types/explore.ts`: thêm `number_bus`
- [x] 1.3 `kido-server/src/modules/explore/explore.types.ts`: đồng bộ danh
      sách 12 code (gỡ `number_explorer`/`odd_one_out`/`sort_bins`, thêm
      `ordinal_position`/`number_chain`/`spin_pattern`/`number_bus`)

## 2. Game module (mobile)

- [x] 2.1 `mobile/src/explore/games/numberBusGame.ts`: exerciseType
      `number_bus`, generator/validator/config versions,
      `NUMBER_BUS_LEVELS` (bảng mode↔level L1–L4, phạm vi số theo design.md
      mục 3), `NUMBER_BUS_VARIETY`, `NUMBER_BUS_GAME`, type
      `NumberBusSlotConstraints` (generatorHint/levelOffset)
- [x] 2.2 Generator deterministic `generateNumberBusExercise(level, seed,
      runSlot?)`: 5 mode GĐ1, tra bảng vai-trò-slot × level (design.md mục 6),
      stamp `runSlotKey`, s1 prepend `nb_today` + [number:whole] vào
      audioRefs, `layoutBusScene` thuần (ghế/rèm/silhouette/bến xe
      không chồng nhau; sức chứa tầng theo level, độc lập với đáp án)
- [x] 2.3 Validator ĐỘC LẬP: bất biến số học per-mode (bảng design.md mục 5);
      anti-copy CHỈ distractor (đáp án đúng luôn có mặt — k=5, bond đôi,
      n=1 → {2,3,4}, cấm "0" khi level < L3); count_on options chứa a+b−1
      (allowlist b=1); reject `params.options` ở mode dựng; replay
      byte-identical
- [x] 2.4 `numberBusVariantKey` (mode + bộ số theo design.md mục 5;
      free_split = mode + whole + itemVariant) và `numberBusBucketKey`
      (= `params.mode`); helper support thuần (support 1 chỉ TRỎ, support 2
      hé phần che / mờ option không thể đúng)

## 3. Renderer (mobile)

- [x] 3.1 `mobile/src/explore/renderers/NumberBusRenderer.tsx`: xe hai tầng
      vector, biển tổng trên nóc, 5 mode GĐ1; board_all hai bến → hai tầng +
      mantra đồng bộ highlight; free_split lượt-chia-lại trong-bài;
      missing_part rèm bán trong suốt + silhouette chạm được + bến xe 88pt là
      đường thêm duy nhất (không glyph "+"); sức chứa mỗi tầng cố định theo
      level (L1 4 ghế rời, L2 1×5, L3+ 2×5), không bao giờ theo đáp án;
      count_on cửa đóng + đếm-theo-chạm [a+1]… + re-model off-by-one
      trong-bài (thẻ tạm ẩn → forced-tap → thẻ hiện lại, qua
      `onSpeakFeedback`); micro-cue ghost-hand lần-đầu-mỗi-mode (tôn trọng
      `reducedSupport`); reduce-motion đường tĩnh; CTA ≥ 64pt; emoji chỉ là
      nội dung
- [x] 3.2 Map exerciseType vào `rendererRegistry.tsx` + SỬA docstring stale
      "2/4 miss" cho đúng cơ chế leo thang 1/2 hiện hành

## 4. Engine (mở rộng duy nhất GĐ1)

- [x] 4.1 `registry.ts` nhánh authored của `createExploreRunBatch`: level hiệu
      dụng = clamp(startingLevel + (constraints.levelOffset ?? 0),
      game.levels) thay vì `runSlot.level` tĩnh; giữ nguyên shape
      `ExploreRunSlot`/`ExploreRunPolicy` (`explore-run-v1`)
- [x] 4.2 `validateExploreRegistration` chấp nhận constraints có
      generatorHint/levelOffset

## 5. Registration (mobile)

- [x] 5.1 `registry.ts`: GAME_COPY — reorder có chủ đích `…memory_match →
      stack_tower → number_bus → number_chain → mirror_build…` (comment đầu
      mảng: thứ tự là sư phạm) + entry copy ("Xe buýt hai tầng"); LOCAL_GAMES;
      BUNDLED_OVERRIDES; runPolicy authored 6 slot phẳng
- [x] 5.2 `variety.ts`: `NUMBER_BUS_VARIETY` + nhánh variantKey/bucketKey đọc
      `exercise.params.mode`
- [x] 5.3 `thumbnails.ts`: vector icon fallback (chờ PNG `number_bus.png`)

## 6. Audio (batch v4 — một lần)

- [x] 6.1 `promptAudio.ts`: ~32 key `nb_*` + mảnh ghép theo danh sách chốt ở
      design.md mục 7 (kể cả câu GĐ2; text màn hình sinh cùng chỗ với key);
      tái dùng `number_which_after`, clip số 0–50, `va`/`nhe`/`make_10_q`,
      `fb_*`
- [x] 6.2 Mirror inventory trong
      `kido-pipeline/src/explore/exploreAudioInventory.ts`
- [ ] 6.3 Chạy batch TTS pack `explore-audio-vi-v4` (VieNeu, giọng
      dodo-clone2); Human Gate duyệt — tiêu chí cắt `nb_chant` nếu
      robot/nhạt; export pack

## 7. kido-server

- [x] 7.1 `explore.registry.ts`: đồng bộ registry theo danh sách 12 code +
      thêm `number_bus` (local game, không sinh bài server)
- [x] 7.2 Cập nhật assertion số game public trong `explore.service.spec.ts`
      theo danh sách sau đồng bộ

## 8. Conformance + docs

- [x] 8.1 `mobile/scripts/verify-explore-number-bus-contracts.cjs` + npm
      script `test:explore-number-bus` — 11 hạng mục test theo design.md mục
      5 (determinism/runSlotKey; reject options mode dựng; coverage HAI CHIỀU
      + assert L3 warm-up trước count_on; off-by-one distractor; anti-copy
      hai vế kèm case k=5 và whole=2×shown; máy quét transcript tập clip
      báo/hint; audio coverage + [number:whole] trong missing_part + s1
      `nb_today`; layout thuần; smoke test nhánh authored + `params.level` =
      requestedLevel; mẫu ≥ 200 + per-whole distinct shown ≥ min(whole−1, 4)
      + đo tỷ lệ trùng variantKey trong-run; lint persona promptVi)
- [x] 8.2 Thêm `number_bus` vào generator map của
      `verify-explore-variety-buckets.cjs`
- [x] 8.3 Docs: BRD §7.13 (đã viết trong change này), thumbnail prompt trong
      `KIDO_EXPLORE_THUMBNAIL_PROMPTS.md` (đã viết), cập nhật
      `docs/AI_CONTEXT.md` (implementation map + ghi chú danh sách game codes
      đã đồng bộ)

## 9. Verify

- [x] 9.1 `cd mobile && npm run lint` + `npx tsc --noEmit`
- [x] 9.2 `cd mobile && npm run test:explore-number-bus` + toàn bộ contract
      script explore hiện có không vỡ
- [x] 9.3 `cd kido-server && npm test`
- [ ] 9.4 Chạy thử trên simulator: 1 run trọn 6 slot mỗi level L1–L4,
      airplane mode, reduce-motion, VoiceOver cơ bản — ĐÃ chạy iPhone 17 Pro
      (2026-09-23): L1 board_all + free_split (2 lượt), L3 missing_part
      (thiếu/thừa/đúng/trợ giúp 2), next_number, count_on (kể cả re-model);
      CÒN: L2, L4, SE, iPad, airplane mode, reduce-motion, VoiceOver
- [ ] 9.5 **Chốt GĐ1 bằng chơi thử với bé thật trước khi nới GĐ2**
