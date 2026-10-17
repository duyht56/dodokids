# Tasks — add-explore-balance-scale-game

> Nguồn chi tiết cho mọi mục: `design.md` của change này.

## 1. Contract codes (13 mã)

- [x] 1.1 `docs/kido-explore-contract.ts`: thêm `balance_scale` cuối danh sách
- [x] 1.2 `mobile/src/types/explore.ts`: thêm `balance_scale`
- [x] 1.3 `kido-server/src/modules/explore/explore.types.ts`: thêm `balance_scale`

## 2. Game module (mobile)

- [x] 2.1 `games/balanceScaleGame.ts`: 9 món, thang nặng, cặp/bộ ba, bảng
      level↔mode, runPolicy 6 slot (levelOffset + generatorHint), versions,
      `BALANCE_SCALE_GAME`, `BALANCE_SCALE_VARIETY`
- [x] 2.2 Generator deterministic 8 mode (balance, heavier, measure, exchange,
      predict, choose, chain, reverse), stamp `runSlotKey`
- [x] 2.3 Validator độc lập (design §8) + replay byte-identical
- [x] 2.4 Hàm thuần cho renderer: trọng lượng đĩa, góc nghiêng, câu phản hồi,
      `balanceSupportCue`
- [x] 2.5 `verify-explore-balance-scale-contracts.cjs` + npm script
      `test:explore-balance-scale`

## 3. Renderer (mobile)

- [x] 3.1 `renderers/BalanceScaleRenderer.tsx` + `renderers/balanceScale/*`:
      cân chính (beam xoay, đĩa treo, khối chèn), cân mẫu nhỏ, rổ, nút Thả cân,
      thẻ, cụm đổi, bóng mờ nhóm, bàn tay gợi ý, giảm chuyển động
- [x] 3.2 Luồng mode: sống (balance/measure), heavier, giữ + thả, đổi bắt
      buộc/tuỳ chọn/mở ở mức 2, thẻ, diễn lại phép đổi sau bài đúng
- [x] 3.3 Audio: câu đề (màn chơi), câu phản hồi/kết luận qua `onSpeakFeedback`

## 4. Đăng ký (mobile)

- [x] 4.1 `registry.ts` (GAME_COPY sau number_bus, LOCAL_GAMES,
      BUNDLED_OVERRIDES), `rendererRegistry.tsx`, `variety.ts`,
      `thumbnails.ts` (icon `scale`), nhóm catalog, `masteryCriteria.ts`
- [x] 4.2 `promptAudio.ts` (phrases/words/labels/key builders),
      `promptLines.ts` (`bal_ask`, `bal_is`, `bal_tap`), `npm run
      explore-lines:dump`
- [x] 4.3 Pack `explore-audio-vi-v6` trong `SUPPORTED_EXPLORE_AUDIO_PACK_VERSIONS`

## 5. kido-server / kido-pipeline / docs

- [x] 5.1 kido-server `explore.registry.ts` mirror + spec đếm catalog 13
- [x] 5.2 kido-pipeline mirror `exploreAudioInventory.ts` + pack v6
- [x] 5.3 BRD §7.14, `AI_CONTEXT.md`, `KIDO_EXPLORE_THUMBNAIL_PROMPTS.md`

## 6. Kiểm chứng

- [x] 6.1 mobile `tsc`, eslint file đổi, mọi `test:explore-*`
- [x] 6.2 kido-server jest explore + build; pipeline vitest explore
- [x] 6.3 Chơi thật trên iOS simulator: lượt L1 trọn cung, L5 choose, L6 chain/reverse
      (iPhone 17 Pro, 2026-10-16; chưa thử máy nhỏ cỡ SE/Android 360×640 và iPad)

## 7. Audio batch (Human Gate)

- [x] 7.1 Gen ~138 clip bằng VieNeu `dodo-clone2` temp 0.7 (2026-10-16: 24 clip + 114
      câu liền, 0 lần gen lại; đang `pending_review`)
- [x] 7.2 Owner duyệt (2026-10-16: owner bảo duyệt hết 138 câu, không nghe từng
      câu; thay tai người bằng QA tín hiệu tự động 139/139 clip sạch, kiểm chéo
      3 phiếu; trang nghe vẫn ở https://claude.ai/artifact/PFRbp6sYNfspNAWJNd762B)
- [x] 7.3 Export pack v6 → mobile (417 clip, 139 mới), test offline-audio + prompt-lines

## 8. Review sau khi đưa vào app (2026-10-16)

- [x] 8.1 Workflow review 5 chiều + kiểm chéo 3 phiếu: 27 phát hiện xác nhận
      (~14 lỗi riêng) — lặp bài trong lượt, thiếu nút bớt, trợ giúp lúc khoá,
      thẻ mờ vô tác dụng, câu chạm-để-đổi trong lời đề, heavier, a11y, nhịp nói
- [x] 8.2 Sửa: chống lặp bài trong lượt (`createExploreRunBatch`, mọi game có
      runPolicy), nút bớt, trợ giúp sau khi mở khoá, bỏ làm mờ thẻ, câu nhắc
      "nhẹ" + `onStart` ở `audio.ts`, onAnswer theo âm thanh thật, a11y đĩa
- [x] 8.3 Ba vòng kiểm chéo lại + mô phỏng đồng hồ ảo 6000 chuỗi (0 vi phạm);
      lớp âm thanh dùng chung xác nhận không đổi hành vi game khác, trừ câu
      nhắc nghỉ mắt của màn chơi giờ là câu nhắc nhẹ (trước đây cắt ngang đề)
