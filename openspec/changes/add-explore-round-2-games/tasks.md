## 1. Đăng ký 3 game mới (lớp chung)

- [x] 1.1 Mã game `number_line_hop`, `stack_tower`, `odd_one_out` trong `docs/kido-explore-contract.ts`, `mobile/src/types/explore.ts`, `kido-server/src/modules/explore/explore.types.ts`
- [x] 1.2 `registry.ts`: GAME_COPY (thứ tự sư phạm), LOCAL_GAMES, BUNDLED_OVERRIDES, `isProgressiveExploreRunGame` (+stack_tower, odd_one_out); `variety.ts` ủy quyền policy/key cho module game; `rendererRegistry.tsx` map exerciseType → renderer
- [x] 1.3 `thumbnails.ts` Partial + `EXPLORE_FALLBACK_ICONS` (icon vector cho tới khi có PNG); catalog 4 nhóm mới
- [x] 1.4 kido-server `explore.registry.ts`: PUBLIC_GAMES + `round2Definition` (enabled, offline, bundled); `explore.service.spec.ts` 12 game
- [x] 1.5 `scripts/verify-explore-variety-buckets.cjs` thêm 3 generator; `package.json` script `test:explore-{number-line-hop,stack-tower,odd-one-out,memory,pattern}`

## 2. Giọng Đô Đô + batch audio v2 (gom gen một lần)

- [x] 2.1 `promptAudio.ts` + mirror pipeline: 13 câu feedback, 12 tên game, 6 mảnh feedback tách gộp, 6 hướng dẫn tracing, 4 hop, 5 tower, 1 odd; builder `praiseKeys/retryKeys/hintKeys/levelUpKeys/easierKeys/runCompleteKeys/breakReminderKeys/gameNameKeys/numberBondFeedbackKeys/tracingGuidanceKeys/numberLineHopKeys/numberLineHopLandedKeys/stackTowerKeys/oddOneOutKeys`
- [x] 2.2 Pack v2: pipeline `EXPLORE_AUDIO_PACK_VERSION = 'explore-audio-vi-v2'`; mobile chấp nhận v1 + v2
- [x] 2.3 `audio-batch-v2.md`: 58 clip cần gen (trong 152 key inventory) + lệnh chạy một lần
- [ ] 2.4 (anh Duy / pipeline) `npm run explore-audio:generate` → `review` → `approve -- --all` → `export -- ../mobile`; chạy lại `npm run test:explore-offline-audio` + `test:explore-prompt-audio` sau export
- [x] 2.5 `ExplorePlayScreen`: nói khen xoay vòng / thử lại / gợi ý khi leo thang / lên phạm vi / kết lượt / nhắc nghỉ; Đô Đô phản ứng cạnh dòng feedback
- [x] 2.6 `ExploreCatalogScreen`: chạm thẻ → đọc tên game (650ms) rồi mở, chỉ khi clip đã bundle

## 3. supportLevel + hạ độ khó

- [x] 3.1 `ExploreRendererProps.supportLevel` (0/1/2 = hintLevel của màn chơi)
- [x] 3.2 `demoteRangeProgress` / `demoteArithmeticProgress`; màn chơi hạ 1 phạm vi sau 3 lần sai liên tiếp + "Mình thử bài dễ hơn nhé"; `advanceRangeProgress(…, game.levels)` cho thang 5 level
- [x] 3.3 Khám phá số: supportLevel 1 chấm/khung 10 dưới thẻ, 2 còn 2 lựa chọn
- [x] 3.4 Máy cộng trừ + So sánh: supportLevel 1 hiện số đếm, 2 chạy animation giải thích / pulse bên đúng

## 4. Ba game mới

- [x] 4.1 Đô Đô nhảy lò cò: generator/validator/renderer (nhảy từng ô + đếm to, không có "sai"), script `test:explore-number-line-hop`, spec server, capability spec
- [x] 4.2 Xếp tháp cho Đô Đô: 5 dimension, tháp nghiêng/khối trượt, Đô Đô leo, script, spec server, capability spec
- [x] 4.3 Ai lạc đàn?: noise L3/L5, validator "đúng 1 ô lạ trên mọi chiều", hint mờ không lộ, script, spec server, capability spec
- [x] 4.4 Script contract Lật thẻ + Tìm quy luật (`test:explore-memory`, `test:explore-pattern`)

## 5. Tích hợp và kiểm chứng

- [x] 5.1 `cd mobile && npx tsc --noEmit && npx eslint <file đã sửa>`; toàn bộ `npm run test:explore-*` xanh
- [x] 5.2 `cd kido-server && npx jest src/modules/explore` xanh; `openspec validate add-explore-round-2-games`
- [x] 5.3 BRD §7.9–7.11 cho 3 game mới; `docs/AI_CONTEXT.md`
- [x] 5.4 Simulator: catalog 12 game, chơi thử 3 game mới, hạ độ khó sau 3 lần sai, Đô Đô phản ứng cạnh feedback

## 6. Chi tiết từng phần (báo cáo của agent thực hiện)

### number_line_hop (báo cáo agent)
- [x] numberLineHopGame.ts: generator/validator deterministic, 5 level (0–5 locate+thẻ; 0–10 locate; 0–10 locate/add K≤4; 0–15 locate/add/subtract K≤5; 0–20 add/subtract K≤5), add start ≥ 1, validator kiểm tra cấu trúc + prompt + audioRefs + replay seed, variety capacity theo biến thể thật
- [x] NumberLineHopRenderer.tsx: dải đá 0..max có nhãn mọi viên, ≥ 48pt, ScrollView tự cuộn theo Đô Đô; Đô Đô nhảy từng viên (Animated native driver, parabol + squash/stretch 240ms) và đếm to từng viên qua onSpeakFeedback([numberKey(n)])
- [x] Đáp trượt không phải sai: 'Đây là số N' (text + numberLineHopLandedKeys cùng nguồn), Đô Đô đứng lại, ghim điểm bắt đầu cho add/subtract, đích giữ nguyên; đích → cheer + onAnswer(true)
- [x] Thẻ số / chip +K/−K với K chấm hiện khi L1, khi clip prompt chưa bundled (hasExploreAudioKeys) hoặc support ≥ 1; support = max(supportLevel, ⌊misses/2⌋); L1 pulse thẻ + viên bắt đầu, L2 pulse viên đích; reduce-motion được tôn trọng
- [x] scripts/verify-explore-number-line-hop-contracts.cjs (npm run test:explore-number-line-hop): 200 seed/level, replay, tamper (target±1, mode swap, steps 0, start, card, prompt, audio, forgery), 300 vòng 1-bài/level mọi bucket ≥ 20%, kiểm tra renderer/registry
- [x] kido-server explore.number-line-hop.spec.ts: corpus 60 seed/level, tamper, vòng 1-bài, registry hai phía (enabled/offline/local/catalogVisible, manifest trùng), renderer rules
- [x] openspec specs/explore-number-line-hop-game/spec.md: Purpose + ADDED requirements (modes & levels, hop + đếm to, đáp trượt không sai, thẻ đích hiển thị & support, conformance/variety)

### stack_tower (báo cáo agent)
Generator/validator stack_tower: tỉ lệ đơn điệu ≥ minRatio từng cấp (floor 3 chữ số), khối lớn nhất = 1, màu palette không trùng, chấm 1–6 khác nhau, sàn ≠ đáp án và ≠ ngược (n ≥ 3, fallback hoán vị xác định), validator suy lại thứ tự và kiểm tra prompt/audioRefs/replay byte-identical.
Bố cục thuần `layoutStackTowerScene` + `stackTowerAttemptSlot` trong stackTowerGame.ts: khối ≤ 85% bề rộng, tháp + Đô Đô trong chiều cao, không chồng lấn, tháp canh giữa xếp lên, tàu/skyline trái→phải trên một đường đáy, vị trí leo của Đô Đô.
Viết lại StackTowerRenderer: chạm để xếp (spring vào chỗ), xếp sai → nghiêng 8° quanh đáy + trượt về sàn + onTryAgainSound, không chữ, không onAnswer(false); quantity dùng DotGroup, đọc số chấm qua numberKey, không dùng vật lý tháp; Đô Đô leo ~250ms/khối (tàu 180ms + chạy khỏi màn hình) → cheer → onAnswer(true) ≤1.5s; hỗ trợ pulse (2 lần trượt/supportLevel ≥1) và làm mờ (mức 2); reduce-motion; hitSlop ≥ 48pt; useWindowDimensions + đo scene.
Script mobile/scripts/verify-explore-stack-tower-contracts.cjs (npm run test:explore-stack-tower): bảng cấp, 200 seed/cấp, tamper, 5 scene × 40 bố cục/cấp, 300 vòng một-bài/cấp (mỗi dimension ≥ 20%), quy tắc renderer.
Spec server kido-server/src/modules/explore/explore.stack-tower.spec.ts: cấp/dimension, corpus, tamper, bố cục, đăng ký offline/progressive, server registry mirror, quy tắc renderer.
OpenSpec capability explore-stack-tower-game (specs/explore-stack-tower-game/spec.md): dimension & cấp, sinh/validate, phản hồi vật lý không trạng thái sai, leo hoàn thành, hỗ trợ, bố cục, offline/stateless/audio best-effort, conformance; `openspec validate --strict` hợp lệ.

### odd_one_out (báo cáo agent)
Viết lại generator/validator `mobile/src/explore/games/oddOneOutGame.ts`: 5 level (2×2/2×3/2×4, cột 2/3/4), nhiễu L3/L5 với mỗi giá trị nhiễu ≥ 2 ô, luật đúng-một-token-duy-nhất trên chiều mục tiêu và không token nào duy nhất trên chiều khác, cùng loại token, ràng buộc màu (3 màu an toàn mù màu)/hình (không trộn vuông–thoi)/kích cỡ (tỉ lệ ≥ 1.5)/chấm (≤ 4, lệch 1)/chủ đề (fruit/animal/transport, validator re-resolve asset), replay byte-identical; helper thuần `oddOneOutSupportCells` không bao giờ chứa đáp án; variety capacity đo thực tế.
Viết lại `mobile/src/explore/renderers/OddOneOutRenderer.tsx`: ô ≥ 72pt, đúng → ô lạc nhảy ra + các ô còn lại gật đồng bộ + Đô Đô cheer + badge check, sai → rung + mờ/khóa ô, supportLevel 1 viền teal một cặp ô giống nhau, supportLevel 2 mờ/khóa ≤ 2 ô chắc chắn chung, ExploreMascot think/cheer, Animated native driver tôn trọng reduce motion, hình bằng View, chấm qua DotGroup, emoji chỉ là nội dung.
Thêm `mobile/scripts/verify-explore-odd-one-out-contracts.cjs` (npm run test:explore-odd-one-out): 200 seed/level, replay, luật một-lạc, level/nhiễu/palette/hình/kích cỡ/chấm/chủ đề, tamper, support không lộ đáp án, 300 lượt một-bài mỗi chiều ≥ 20%, luật trình bày renderer.
Thêm `kido-server/src/modules/explore/explore.odd-one-out.spec.ts`: corpus 250 bài, chế độ size/count/theme, nhiễu theo level, tamper, support helper, đăng ký offline + mirror server registry, kiểm tra nguồn renderer.
Thêm OpenSpec spec `openspec/changes/add-explore-round-2-games/specs/explore-odd-one-out-game/spec.md` (capability mới: puzzle deterministic, luật một-lạc, 5 level + nhiễu, luật token, feedback chạm, support không lộ, variety + audio best-effort, conformance).

### support_number (báo cáo agent)
NumberExplorerRenderer nhận `supportLevel` (mặc định 0) và chỉ đổi phần hiển thị, không đổi exercise/generator/validator (replay theo seed giữ nguyên).
Mức 1 – mode chọn: thêm `QuantityAnchor` cỡ thẻ (khung 10 mini ≤ 10; thanh chục + khung đơn vị > 10, chỉ hình khối) dưới số trên thẻ lựa chọn, thẻ SỐ MẪU và thẻ SỐ THAM CHIẾU.
Mức 1 – order_cards: làm sáng ô trống kế tiếp (viền coral + nền tint, nhãn a11y "Ô tiếp theo") và đổi gợi ý màn hình thành "Ô sáng là chỗ đặt số tiếp theo".
Mức 2: thu hẹp bộ chọn còn đáp án + 1 distractor giữ lại (tất định từ `randomSeed`, order mode theo seed + chỉ số bước trong các thẻ chưa đặt); thẻ còn lại mờ + khoá (`locked`), không đánh dấu đáp án; mức 2 bao gồm cả hình ảnh mức 1.
Giữ nguyên ListenButton của hear_select, đọc số khi chạm (`onSpeakFeedback([numberKey(n)])`), mascot Đô Đô; mọi hỗ trợ hoạt động im lặng khi thiếu clip.
Thêm delta OpenSpec `specs/explore-number-game/spec.md` (ADDED: Support level visuals, 8 scenario cho mức 1/mức 2/không audio/không đổi exercise).
Xác minh: tsc 0 lỗi, eslint sạch, test:explore-variety-buckets / test:explore-prompt-audio / test:explore-number pass; kido-server jest explore.variety.spec + explore.number-count.spec 94/94 pass (không cần sửa spec server).

### support_arith_compare (báo cáo agent)
ArithmeticRenderer: nhận supportLevel; mức 1 đổi lời nhắc thành 'Con đếm mỗi nhóm rồi chọn nhé!' và tô sáng dòng phép tính (equationPanelHint, amber); mức 2 chỉ giữ đáp án + 1 thẻ nhiễu, thẻ còn lại mờ/khóa (status 'dimmed', không rung), chọn xác định từ randomSeed qua supportDimmedOptions (export)
VisualMathPrimitives: VisualMathScene nhận supportLevel; mức 1 hiện CountChip dưới từng nhóm toán hạng / CountStrip (toán hạng + dấu, không bao giờ in kết quả; make_10 chỉ hiện toán hạng đầu); mức 2 phát bước ngữ nghĩa addGroup (nhóm 2 trượt vào), removeGroup (ô bị bớt rơi xuống, ObjectGroup.removeProgress), number line (NumberLine.hopProgress phồng bước nhảy + nút theo thứ tự), ten frame replay pulse; SemanticAnimationView thêm replayKey và tôn trọng reduce motion; tách numberLineHops() thuần
QuantityComparisonBoard: thêm 2 prop tùy chọn, chỉ cộng thêm: revealCounts (bộ đếm hiện đủ số lượng, style amber, nhãn a11y 'Bên trái có N') và pulseSide (PulseView scale 1→1.03 loop + viền gợi ý cho khung hoặc nút Bằng nhau; tắt khi solved và khi reduce motion)
QuantityCompareRenderer: nhận supportLevel; revealCounts={supportLevel >= 1}, pulseSide = correctSide khi supportLevel >= 2 và chưa giải; helper text theo mức hỗ trợ; mascot 'think' khi có hỗ trợ
kido-server explore.number-bond-arithmetic.spec.ts: thêm test source-text 'layers support visuals on the same exercise without touching the generator'
OpenSpec: specs/explore-arithmetic-game/spec.md và specs/explore-quantity-compare-game/spec.md (## ADDED Requirements — Support level visuals, 6 scenario mỗi file)
Xác minh: tsc sạch cho 4 file, eslint 0 lỗi, test:explore-variety-buckets / prompt-audio / arithmetic / compare pass, jest 3 spec server 103/103 pass

### scripts_memory_pattern (báo cáo agent)
Thêm `mobile/scripts/verify-explore-memory-contracts.cjs` (`npm run test:explore-memory`): 200 seed/level validate + replay byte-identical, số cặp 2/3/4/6/8 theo MEMORY_LEVELS, mọi thẻ là MEMORY_ASSETS với cờ memoryEligible/singleObject/recognizable/backgroundFree, mỗi asset đúng 2 lần (một bản mỗi mặt), L1–L2 không ghép cùng similarityGroup (trực tiếp + memoryAssetsAreCompatible), checksum bảng tái tính độc lập, layout 375×667 (budget = 667 − MEMORY_BOARD_CHROME_HEIGHT) và 768×1024 không cuộn, thẻ ≥ 48pt, ≤ 16 thẻ, tamper (trùng cardId / số thẻ lẻ / sai pairCount / checksum cũ / asset lạ) bị từ chối, reducer lật thẻ, progressive run createExploreRunBatch + LocalExploreProvider từ L1/L3/L5 → 3 level liên tiếp kẹp trong 1..5, 60 vòng một-bài/level.
Thêm `mobile/scripts/verify-explore-pattern-contracts.cjs` (`npm run test:explore-pattern`): 200 seed/level validate + replay, tái suy luận ngữ pháp độc lập chứng minh đúng một option hoàn thành và là đáp án, options ⊆ vocabulary (cycle) / giá trị gần trong range loại trừ giá trị hiển thị (progression), thứ tự option deterministic và vị trí đáp án không cố định, promptVi = PROMPT_PHRASES[patternPromptPhraseId] và audioRefs = một phrase clip theo family có transcript trùng promptVi, assetRefs đúng sprite, fitPatternTokenSize (renderer thật qua stub react-native) tại 320/375/430 → size ∈ [34, 52] và hàng vừa innerWidth ở 375/430, tamper đa dạng bị từ chối, progressive run từ L1/L3/L5 → 5 level 1..5, 60 vòng một-bài/level mọi grammar ≥ 20%.
Chạy lại `npm run test:explore-variety-buckets`, `npm run test:explore-prompt-audio`, `npx tsc --noEmit`, `npx eslint` cho 2 script mới (mobile) và `npx jest explore.variety/memory-match/pattern.spec.ts` (kido-server): tất cả xanh, không hồi quy.
