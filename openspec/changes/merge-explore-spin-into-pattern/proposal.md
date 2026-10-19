# Đề xuất: Gộp Xoay hình vào Tìm quy luật (`merge-explore-spin-into-pattern`)

## Why

Ngày 2026-10-19 owner thấy ba game Tìm quy luật (`pattern_finder`), Xoay hình
(`spin_pattern`) và Ô thiếu (`missing_cell`) đều thuộc loại "quy luật", nên hỏi
có nên gộp thành một game không. Đánh giá (ghi chú trong side-session-notes của
session "Giao diện khám phá trên mobile") đi tới kết luận như sau, và owner
**chốt ngày 2026-10-19**:

- **Gộp Xoay hình vào Tìm quy luật** thành họ quy luật `rotation`, chỉ ở bậc 3.
- **Giữ Ô thiếu là game riêng.** Ma trận hai thuộc tính là năng lực khác dãy
  một chiều (BRD §7.12; bảng đối chiếu đề thi trong `KIDO_EXPLORE_REVIEW.md` §1
  xếp "Ma trận 2×2/3×3" thành dòng riêng).
- **Tách nhóm catalog** thành "Quy luật" và "Trí nhớ".

Lý do gộp Xoay hình:

- Bản review §2.2 vốn đề xuất "xoay" là một grammar của `pattern_finder`.
  `spin_pattern` bị tách riêng chỉ để khỏi đụng contract 804 dòng
  (`KIDO_EXPLORE_REVIEW.md:208`), tức lý do kỹ thuật chứ không phải sư phạm.
  Bảng đối chiếu đề thi cũng xếp "Quy luật lặp / xoay" chung một dòng.
- Đứng riêng, Xoay hình có ba lỗi:
  - Kho bậc 1 chỉ có 4 bài (`SPIN_PATTERN_VARIETY.capacityByLevel[1] = 4`), nên
    không chơi theo bậc được (`update-explore-leveled-rounds` để nó lại chờ owner).
  - Ở bậc 1–2, hàng 4 mũi tên đủ cả bốn hướng trừ ô trống, nên đáp án luôn là
    "hướng chưa thấy". Bé chọn đúng mà không cần đọc quy luật xoay.
  - Hàng 6 mũi tên (L4/L5) cần 376pt nên xuống dòng trên máy hẹp hơn khoảng
    416pt. Xuống dòng làm mất quy luật.
- Catalog bớt một thẻ gần giống "Tìm quy luật" (catalog có 13 mã, BRD nhắm
  khoảng 8–10).

Không gộp cả ba vì:

- Một thang bậc trộn dãy, mũi tên và bảng làm điều kiện lên bậc (≥ 4/6) không
  còn nói lên bé giỏi dạng nào.
- Bé chưa đọc được mà đổi dạng bài liên tục thì dễ rối, và chưa có playtest
  nào cho việc này.
- Xếp nối tiếp thì thang dài 6 bậc trở lên, phiên 3–5 phút gần như không tới
  phần bảng.
- Chi phí gấp khoảng hai lần: 12–18 ngày công so với 6–8.

## What Changes

- **`pattern_finder` có họ thứ sáu `rotation`**:
  - Hàng 6 ô gồm cùng MỘT mũi tên một màu, mỗi ô xoay một phần tư vòng (90°)
    theo chiều kim đồng hồ hoặc ngược chiều.
  - Chỉ xuất hiện ở **bậc 3**, cạnh `object_cycle` / `color_cycle`.
  - Ô trống chỉ ở vị trí thứ 5 hoặc thứ 6 (index 4–5). Ở đó cả bốn hướng đều
    hiện trên hàng, và đáp án lặp lại ô thứ 1 hoặc thứ 2.
  - Ba lựa chọn, đều là hướng đã có trên hàng.
  - Chỉ có mode `complete`, chưa có "tìm chỗ sai" cho mũi tên.
- **Bậc 4–5 không có mũi tên.** Hàng ở đó dài 4, nên chu kỳ 4 không có ô trống
  hợp lệ, và ô ở giữa lại lộ đáp án "hướng chưa thấy".
- **Tăng version**: `pattern-finder-v5` → `v6`, `pattern-finder-validator-v4` →
  `v5`, config `v5` → `v6`; mirror ở kido-server.
- **Bỏ game `spin_pattern`** khỏi `EXPLORE_GAME_CODES` ở cả ba nơi (docs, mobile,
  server), khỏi registry, catalog, renderer, thumbnail, variety và contract.
  Logic xoay và hình mũi tên chuyển sang `patternGame.ts` /
  `PatternFinderRenderer.tsx`.
- **Audio**:
  - Câu đề dùng lại clip `spin_which` có sẵn ("Mũi tên ở ô trống quay về hướng
    nào nhỉ?").
  - Gợi ý dùng lại `pattern_hint_shape` ("Nhìn nhóm hình lặp lại từ đầu nhé."),
    vẫn đúng khi ô trống ở vị trí 5–6.
  - Chỉ viết lại `pattern_intro_3` để nhắc có mũi tên xoay. Câu mới cần owner
    duyệt, gen một clip và export lại pack.
- **Catalog**: nhóm "Quy luật và phân loại" tách thành "Quy luật" (Tìm quy luật,
  Ô thiếu) và "Trí nhớ" (Lật thẻ tìm cặp, Ú òa). Thứ tự thẻ trong catalog giữ
  nguyên.

## Capabilities

### Modified Capabilities

- `explore-pattern-game`: thêm họ `rotation` (bậc 3), mũi tên là primitive được
  duyệt, câu đề `spin_which`, version v6 / validator-v5. Delta viết trên bản của
  hai change chưa archive: `enhance-explore-pattern-families-fixerror` và
  `fix-explore-catalog-round-1`.
- `explore-catalog`: "Free Explore catalog" chia nhóm theo năng lực, không còn
  thẻ Xoay hình riêng. Delta viết trên bản của `replace-explore-tracing-with-route-planner`,
  `fix-explore-catalog-round-1` và `add-explore-round-2-games` (đều chưa archive).

## Impact

- **mobile**:
  - Sửa: `games/patternGame.ts`, `renderers/PatternFinderRenderer.tsx`,
    `promptAudio.ts`, `variety.ts`, `registry.ts`, `rendererRegistry.tsx`,
    `thumbnails.ts`, `types/explore.ts`, `screens/child/ExploreCatalogScreen.tsx`,
    `masteryCriteria.ts` (tiêu chí "khi nào bé vững" cho Tìm quy luật), `package.json`.
  - Xoá: `games/spinPatternGame.ts`, `renderers/SpinPatternRenderer.tsx`,
    `scripts/verify-explore-spin-pattern-contracts.cjs`,
    `assets/images/explore/spin-pattern.png`.
  - Contract: pattern, variety-buckets, prompt-lines, number-bus (assert
    "number_bus đứng sau spin_pattern"), leveled-rounds.
- **kido-server**: `explore.types.ts`, `explore.registry.ts` (PUBLIC_GAMES,
  union, BUNDLED_LOCAL_GAMES, version pattern), `explore.service.spec.ts`
  (13 → 12 game), `explore.pattern.spec.ts`.
- **kido-pipeline**: `src/explore/exploreAudioInventory.ts` (câu
  `pattern_intro_3` mới, comment `spin_which`).
- **docs**: `kido-explore-contract.ts` (bỏ mã), `AI_CONTEXT.md` (12 mã, version
  v6), BRD §7.7 + §10, `KIDO_EXPLORE_REVIEW.md:208` (ghi đã đảo quyết định
  standalone), `KIDO_EXPLORE_THUMBNAIL_PROMPTS.md` (thumbnail Xoay hình nghỉ),
  `KIDO_MARKETING_CLAIMS.md` C-50 (xoay là một phần của Tìm quy luật).
- **openspec**: `update-explore-leveled-rounds` bỏ `spin_pattern` khỏi danh sách
  chờ owner.
- **Landing** (repo riêng): `/khu-kham-pha` không cần sửa, vì câu "kể cả quy
  luật xoay hướng" vẫn đúng.
- **marketing/** (repo gốc, chưa track): card `rotate.mp4` trong
  `marketing/ads-video/src/overview.tsx` quay game Xoay hình cũ. Nhãn "Xoay hình"
  ở đó chỉ là tên Sequence trong Remotion, không hiện trên video. Nếu quảng cáo
  còn chạy sau bản phát hành thì phải quay lại cảnh bậc 3 của Tìm quy luật.
- **App cũ** đã phát hành vẫn chơi Xoay hình offline như cũ: khi server không
  còn mã đó thì app vẫn hiện bản bundled (`isExploreGameCatalogVisible`). Chỉ mất
  kill switch của game này trên app cũ (design §8).
- **Zero history giữ nguyên.** Khoá `startingLevelByGame.spin_pattern` cũ trong
  cấu hình phụ huynh bị bỏ qua, không cần migrate.
- **Đánh đổi**: bé bắt đầu ở bậc 1 phải qua ít nhất 2 vòng (12 bài) mới gặp mũi
  tên. Hiện lượt Xoay hình nào cũng có mũi tên. Xem design §6.
- **Phụ thuộc**:
  - Phần `update-explore-leveled-rounds` đã commit ngày 2026-10-20 (mobile
    `ac1b996`, kido-server `9acc711`, kido-pipeline `efcef7a`, repo gốc `3ca9b5b`).
  - Archive trước change này: `enhance-explore-pattern-families-fixerror`,
    `fix-explore-catalog-round-1`, `replace-explore-tracing-with-route-planner`,
    `add-explore-round-2-games` (design §8).
