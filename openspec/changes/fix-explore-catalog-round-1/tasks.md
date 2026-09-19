## 1. Lớp chung — vòng xếp bài và distractor

- [x] 1.1 `variety.ts`: `orderExploreBuckets(bucketOrder, recentBucketKeys, rotation)`; `planExploreRound` nhận `recentBucketKeys` + `bucketRotation`, phục vụ bucket vừa chơi sau cùng
- [x] 1.2 `types/explore.ts` + `registry.ts`: `ExploreBatchOptions.recentBucketKeys/bucketRotation` (local-only), provider giữ nguyên cửa sổ loại trừ 8 key (`EXPLORE_REPLAY_EXCLUSION_WINDOW`) thay vì cắt về `count`, rotation ngẫu nhiên khi caller không truyền
- [x] 1.3 `scripts/verify-explore-variety-buckets.cjs`: chuỗi 120 lượt 1 bài cho mọi game/level có ≥2 bucket, mỗi bucket sinh được phải đạt ≥15% (cả hai profile audio)
- [x] 1.4 `games/numberUtils.ts`: `buildNearTargetOptions(..., { exclude, window })` — pool theo cửa sổ ±3, 50% một phía, không để đáp án luôn ở giữa

## 2. Lớp chung — vòng chơi, mascot, catalog

- [x] 2.1 `explore/components/ExploreMascot.tsx`: Đô Đô thật (dodo.png) với mood idle/cheer/think, tôn trọng reduce-motion
- [x] 2.2 `ExplorePlayScreen.tsx`: kết thúc tự nhiên sau `CONTINUOUS_RUN_TARGET` = 8 câu đúng (Dẫn đường: xong Chặng 5) → màn "Mình luyện xong rồi!"; bỏ flame + "N câu liền"/"N/5 lượt đúng", thay bằng chip phạm vi + chấm tiến trình chỉ tăng; `level_up` khi Dẫn đường lên chặng; nút 🔊 toàn cục trên top bar; phase state thay so sánh chuỗi feedback; timer chuyển bài được dọn khi unmount/đổi lượt; render qua `ExploreExerciseView`; bỏ copy "Lượt chơi này không được lưu lại."
- [x] 2.3 `games/rangeProgress.ts` + `games/arithmeticGame.ts`: progress `{ level, recent }`, lên phạm vi khi 5 đúng trong 7 lượt gần nhất; `createRangeProgress(startLevel)`/`createArithmeticProgress(startLevel)`
- [x] 2.4 Tôn trọng `startingLevel` của phụ huynh: continuous game bắt đầu đúng phạm vi; progressive game chơi cửa sổ level liên tiếp từ đó (`progressiveRunLevels`); memory chạy 3 bảng (`PROGRESSIVE_RUN_SIZE`)
- [x] 2.5 `explore/audio.ts`: prompt/feedback audio tôn trọng `audioEnabled`/`volume` trong Settings
- [x] 2.6 `registry.ts` GAME_COPY + `ExploreCatalogScreen.tsx`: thứ tự sư phạm, 4 nhóm cho trẻ, thumbnail 108pt, bỏ mô tả và copy cho phụ huynh, badge chỉ khi không chơi được
- [x] 2.7 `promptAudio.ts` + `kido-pipeline/src/explore/exploreAudioInventory.ts`: câu hỏi phép trừ `arith_remain_q` ("Còn lại bao nhiêu?") — clip mới đi qua pipeline generate → Human Gate → export
- [x] 2.8 `package.json`: script `test:explore-number|compare|arithmetic`
- [x] 2.9 `kido-server/package.json` + `test/fileMock.js`: jest map `.wav/.png` để spec explore import được runtime mobile; cập nhật `explore.stateless-privacy.spec.ts`, `explore.variety.spec.ts`, phần arithmetic của `explore.number-bond-arithmetic.spec.ts`
- [x] 2.10 Docs: `docs/AI_CONTEXT.md` (implementation map), spec delta `explore-session-runtime`, `explore-catalog`

## 3. Từng game (Đợt 1)

- [x] 3.1 Chạm và đếm: bỏ lộ tổng trên badge, thẻ số mở sau khi chạm ≥1 vật, thẻ sai mờ; đọc số + SFX + nảy khi chạm; vật nhiễu rung đỏ không phạt; ExploreMascot
- [x] 3.2 Máy cộng trừ: câu hỏi trừ "Còn lại bao nhiêu?", không "bớt 0"/"thêm 0", distractor lỗi điển hình, thẻ sai khóa/rung, chống mash-tap, ExploreMascot; `verify-explore-arithmetic-contracts.cjs`
- [x] 3.3 Tìm quy luật: khôi phục 5 câu hỏi theo family (promptAudio + registry + pipeline mirror), dãy một hàng, distractor chỉ từ vocabulary (seeded), dọn timeout, ExploreMascot; `explore.pattern.spec.ts`
- [x] 3.4 Khám phá số: distractor loại số đang hiện / số tham chiếu, đọc số khi chạm thẻ, ExploreMascot; `verify-explore-number-contracts.cjs`; `explore.number-count.spec.ts`
- [x] 3.5 Bên nào nhiều hơn: đọc số khi chạm-để-đếm, pool `compareAssets.ts`, nút cùng màu, ExploreMascot; `verify-explore-compare-contracts.cjs`; `explore.quantity-compare.spec.ts`
- [x] 3.6 Ngôi nhà tách gộp: phần có sẵn theo seed + shuffle slot trong block, bớt chữ, chạm lá để bớt, ScrollView, ExploreMascot; BRD §7.5
- [x] 3.7 Dẫn đường: layout vừa iPhone SE, D-pad, icon xóa khác icon thoát, Đô Đô thật trong ô; spec renderer/layout
- [x] 3.8 Xưởng luyện nét (vẫn ẩn): decimate điểm theo khoảng cách thay cap 192; `explore.tracing.spec.ts`
- [x] 3.9 Lật thẻ: bảng 3/6 cặp hiển thị đúng, 8 cặp không cần cuộn, ExploreMascot, chấm tiến trình; `explore.memory-match.spec.ts`

## 4. Tích hợp và kiểm chứng

- [x] 4.1 `cd mobile && npx tsc --noEmit && npx eslint <file đã sửa>` sạch; toàn bộ `npm run test:explore-*` xanh
- [x] 4.2 `cd kido-server && npx jest src/modules/explore` xanh (sau khi đối soát các spec dùng chung)
- [x] 4.3 Chạy app trên iOS Simulator: catalog mới, một lượt Khám phá số/So sánh/Máy cộng trừ thấy đủ mode và kết thúc sau 8 câu, Đô Đô thật, nút 🔊

## 5. Chi tiết từng game (báo cáo của agent thực hiện)

### 5.1 Chạm và đếm (`tap_count`)

- [x] tap_count: huy hiệu chỉ hiện số vật đã đếm (bỏ "/tổng"), không còn label/văn bản nào nêu tổng; thẻ số mở ngay sau vật đầu tiên được đếm, bé có thể trả lời trước khi chạm hết; thẻ sai mờ + khoá không chạm lại được, vật vẫn đếm tiếp; thẻ đúng → onAnswer(true)
- [x] tap_count: mỗi lần chạm vật đúng gọi onSelectSound + onSpeakFeedback([numberKey(n)]) để Đô Đô đếm "một, hai, ba…" bằng clip số 0–50 đã bundled, kèm bounce scale (Animated, native driver); chạm vật nhiễu → lắc đỏ (ANIMATION.shake) + onTryAgainSound, không phạt, không gọi onAnswer(false); tôn trọng reduce-motion; timer dọn khi unmount
- [x] tap_count: thay mascot 🐘 bằng <ExploreMascot mood="idle"|"cheer" size={56}/> (cheer ngắn khi đúng); bỏ AudioPlaceholder vì đã có 🔊 toàn cục; giữ nguyên layout còn lại
- [x] countGame.ts: giữ nguyên ranges/generator/validator (replay theo seed byte-identical); thêm createCountProgress(startingLevel), export COUNT_PROMOTION_WINDOW/COUNT_PROMOTION_REQUIRED (COUNT_PROMOTION_STREAK đánh dấu deprecated), ghi chú hợp đồng bucket `count` ↔ capacity = maxCount với variety.ts
- [x] openspec: delta spec explore-count-game (MODIFIED Tap-and-count interaction; ADDED Count-aloud and tap feedback) tại openspec/changes/fix-explore-catalog-round-1/specs/explore-count-game/spec.md
- [x] Verify: npx tsc --noEmit (0 lỗi), npx eslint 2 file (sạch), npm run test:explore-variety-buckets (pass); npx jest explore.number-count.spec.ts: 3 fail có sẵn từ trước (audioRefs không rỗng, progress shape {level, recent}) – đã nêu cách sửa trong báo cáo
- [x] (lead) Cập nhật regex trong verify-explore-prompt-audio-contracts.cjs (dòng 142) và verify-explore-sound-contracts.cjs (dòng 130) sang dạng JSX prop; bỏ TapCountRenderer khỏi REPLAY_RENDERERS
- [x] (lead/server) Sửa explore.number-count.spec.ts theo serverSpecFindings (audioRefs = tapCountKeys(); progress {level, recent} với COUNT_PROMOTION_REQUIRED/WINDOW)

### 5.2 Máy cộng trừ (`arithmetic_machine`)

- [x] Máy cộng trừ: câu trừ đọc 'Có A, bớt B. Còn lại bao nhiêu?' (khớp audio key arith_remain_q); câu cộng giữ 'Có tất cả bao nhiêu?' (arithmeticGame.ts)
- [x] Máy cộng trừ: không còn sinh 'bớt 0'/'thêm 0' — toán hạng sau toán hạng đầu luôn ≥ 1, kết quả vẫn ≥ 0; validator từ chối toán hạng < 1; version generator/validator giữ v3
- [x] Máy cộng trừ: đáp án nhiễu ưu tiên 'lỗi điển hình' {a, b, kết quả±1} khi trong phạm vi, trên nền buildNearTargetOptions dùng chung; 3 option duy nhất trong [0, maxRange], replay-equal
- [x] Máy cộng trừ: validator bỏ variantKey/bucketKey do LocalExploreProvider gắn thêm trước khi so replay (cùng mẫu numberBondGame) để bài đã phục vụ vẫn validate được
- [x] ArithmeticRenderer: thay 🐘 bằng <ExploreMascot mood='think'/'cheer'>; thẻ sai rung + xám + khóa không chạm lại; chống chạm liên tục (cờ bận + cool-down 450ms, tôn trọng Reduce Motion); giữ dòng phép tính và bubble; không nút replay riêng (🔊 toàn cục ở top bar)
- [x] Script hợp đồng mới scripts/verify-explore-arithmetic-contracts.cjs (npm run test:explore-arithmetic): 200 seed/level, replay JSON identical, không toán hạng 0, prompt trừ/cộng đúng câu hỏi + audio key, option hợp lệ + nhiễu lỗi điển hình, đáp án không ở giữa ≥45%, 300 vòng 1 bài/level add & subtract ≥25%, tamper bị từ chối, cửa sổ 5/7 của progress
- [x] OpenSpec delta specs/explore-arithmetic-game/spec.md trong fix-explore-catalog-round-1 (MODIFIED: Arithmetic safety constraints, Arithmetic conformance; ADDED: Arithmetic prompt copy, Arithmetic answer choices, Arithmetic answer interaction)
- [x] Xác minh: tsc 0 lỗi file sở hữu; eslint sạch; test:explore-arithmetic + test:explore-variety-buckets PASS; server spec các describe Arithmetic PASS (lỗi còn lại thuộc NumberBondRenderer)

### 5.3 Tìm quy luật (`pattern_finder`)

- [x] Khôi phục patternKeys(family, atEnd) + 5 phrase per-family trong promptAudio.ts (giữ pattern_find_generic trong inventory nhưng không còn là prompt từng câu); thêm patternPromptPhraseId() để promptVi và clip dùng chung phrase id
- [x] patternGame.ts: audioRefs theo từng câu đố; promptVi lấy từ PROMPT_PHRASES (khớp verbatim); validator từ chối promptVi/audioRefs sai họ hoặc vị trí
- [x] Thêm tay 5 entry pattern vào exploreAudioRegistry.generated.ts (clip đã bundle), header 89→94 clip kèm ghi chú; mirror 5 phrase vào kido-pipeline exploreAudioInventory.ts
- [x] Distractor chỉ từ vocabulary: cycle = toàn bộ token của dãy (L1–L2: 2 option, L3: 3), tiến trình = giá trị gần trong range loại trừ giá trị đang hiện (buildNearTargetOptions, seed); xáo thứ tự theo seed
- [x] Validator: option ∈ vocabulary / trong range & không trùng giá trị hiện, đúng 1 option hoàn thành grammar, số option theo patternOptionCount(), thứ tự option == replay theo seed
- [x] PatternFinderRenderer: dãy luôn 1 dòng (fitPatternTokenSize, bỏ flexWrap sequenceRow, chấm co theo size), hàng option được wrap
- [x] PatternFinderRenderer: thay 🐘 bằng <ExploreMascot/> (idle/cheer/think), bỏ AudioPlaceholder/onReplayPrompt (dùng 🔊 toàn cục)
- [x] PatternFinderRenderer: sửa race sai→đúng (clearTimeout khi commit + unmount, cổng settling trong 900ms phản hồi sai)
- [x] Cập nhật kido-server explore.pattern.spec.ts (17 test pass): audio per-family, vocabulary-only, shuffle theo seed, 5 test từ chối mới, run theo startingLevel
- [x] Viết delta spec openspec/changes/fix-explore-catalog-round-1/specs/explore-pattern-game/spec.md (MODIFIED: Unique missing answer, Pattern completion interaction; ADDED: Per-puzzle spoken question)
- [x] Verify: tsc 0 lỗi, eslint sạch, test:explore-offline-audio + test:explore-variety-buckets pass, jest pattern spec pass, vitest inventory pass; test:explore-prompt-audio chỉ fail ở 3 assertion stale trong script shared (đã ghi sharedLayerRequests)

### 5.4 Khám phá số (`number_explorer`)

- [x] Khám phá số: distractor loại mọi số đang hiển thị (missing_number) và số tham chiếu (before_after) qua buildNearTargetOptions({ exclude }); kiểm tính khả thi ở mọi level.
- [x] Khám phá số: thêm distractor đảo chữ số (21↔12) xác suất 50% theo seed cho số hai chữ số trong phạm vi (digitSwapOf, DIGIT_SWAP_CHANCE).
- [x] Validator Khám phá số: từ chối option ∩ visibleSequence ≠ ∅, reference ∈ options, dãy không liên tiếp/ngoài phạm vi, order_cards chia sẵn theo thứ tự; giữ replay-equality.
- [x] NumberExplorerRenderer: Đô Đô thật (ExploreMascot idle/think/cheer) thay 🐘; chạm thẻ → onSpeakFeedback([numberKey(n)]); thẻ sai mờ + khoá (chế độ chọn) / nudge viền đỏ (sắp xếp); bỏ AudioPlaceholder, giữ ListenButton lớn cho hear_select.
- [x] Script mobile/scripts/verify-explore-number-contracts.cjs (npm run test:explore-number): ≥200 seed/level/mode ở cả hai audio profile, replay byte-identical, biên, luật distractor, order không pre-sorted, validator tamper, đối xứng audio-gate, 300 vòng một-bài mọi bucket ≥20%.
- [x] kido-server explore.number-count.spec.ts: cập nhật audioRefs, tập mode theo audio capability, test rò rỉ distractor/tamper/digit-swap, progress { level, recent } cửa sổ 5/7 + createRangeProgress(startLevel).
- [x] OpenSpec delta specs/explore-number-game/spec.md (MODIFIED: modes, distractors, conformance; ADDED: tapped number feedback) — openspec validate OK.
- [x] (Lead) Sửa regex play-screen trong verify-explore-prompt-audio-contracts.cjs:141 và verify-explore-sound-contracts.cjs:129 sang dạng prop JSX.

### 5.5 Bên nào nhiều hơn (`quantity_compare`)

- [x] Bên nào nhiều hơn — chạm đếm đọc số: QuantityCompareRenderer nối `onCountSprite` của board → `onSelectSound()` + `onSpeakFeedback([numberKey(số đã đếm bên đó)])` (best-effort, thiếu clip không chặn chơi).
- [x] Bên nào nhiều hơn — pool sprite riêng `mobile/src/explore/games/compareAssets.ts` (10 emoji 🍎 🍌 🍓 🐟 🐥 ⭐ 🌼 🚗 🎈 🧸, id `compare-*`, labelVi, cờ countable/singleObject/backgroundFree); generator chọn theo seed, validator chỉ nhận bản sao đúng của entry trong pool (từ chối sprite `count-*`, glyph/label tráo); manifest asset `compare-emoji-primitives` v1, manifest v4; level range và prompt audio (clip chung theo mode) giữ nguyên.
- [x] Bên nào nhiều hơn — renderer: Đô Đô thật qua `<ExploreMascot mood=idle|think|cheer size=56/>` thay 🐘; bỏ AudioPlaceholder/onReplayPrompt (dùng 🔊 toàn cục của ExplorePlayScreen).
- [x] Bên nào nhiều hơn — script `mobile/scripts/verify-explore-compare-contracts.cjs` (`npm run test:explore-compare`): pool 8–12 + tamper, 200 seed/level (validate, replay byte-identical, range/gap/equal, asset ∈ pool, audioRefs = compareKeys, bucket khai báo), 300 vòng 1-bài/level qua LocalExploreProvider mọi bucket ≥ 20%, kiểm tra nguồn renderer.
- [x] Bên nào nhiều hơn — cập nhật `kido-server/src/modules/explore/explore.quantity-compare.spec.ts` theo pool mới (+ sửa drift audioRefs có sẵn): 10/10 pass, snapshot không đổi.
- [x] Bên nào nhiều hơn — OpenSpec delta `openspec/changes/fix-explore-catalog-round-1/specs/explore-quantity-compare-game/spec.md` (MODIFIED: modes + conformance; ADDED: tap-to-count spoken numbers, mascot/prompt presentation).
- [x] (shared, chờ lead) QuantityComparisonBoard.tsx: hai nút "Bên này!" cùng màu (palette.primary).
- [x] (shared, chờ lead) kido-server explore.registry.ts: mirror manifest v4 + asset `compare-emoji-primitives` cho quantity_compare (tap_count giữ `countable-emoji-primitives`).

### 5.6 Ngôi nhà tách gộp (`number_bond`)

- [x] number_bond: slot khai báo `prefilledPool` thay cho `prefilledPart` cố định; generator rút phần có sẵn theo seed trong pool (`drawPrefilledPartition`), validator kiểm tra membership (`isNumberBondPrefilledAllowed`) + replay byte-identical; `validateNumberBondRunPolicy` duyệt mọi tổ hợp (`minimumDistinctAnchors`) để bảo đảm ≥4 anchor khác nhau mỗi block với MỌI cách rút (block 5: 4 cố định + 1 ôn tập; block 10: [7,8],[1,2,4],[2,3,6],[1,3,9],[5] → 54 chuỗi).
- [x] number_bond: reducer thêm action `unassign` (chạm lá trong ô Bé thêm để bớt đúng lá đó); kiểm tra thừa giữ nguyên lá và nhắc bớt, không reset về 0; `localFeedback` rỗng khi không có gì mới — bỏ các dòng hướng dẫn trùng lặp và caption "N gồm A và B" lặp lại.
- [x] number_bond renderer: dùng `<ExploreMascot>` (cheer sau "Gộp lại", think/cheer khi chọn sai/đúng ở mode khác), bỏ `AudioPlaceholder` (đã có 🔊 toàn cục), bọc `ScrollView` + tile lá tính theo bề rộng cửa sổ (3 lá/hàng, 32–44pt) để vừa iPhone SE không cắt nút Kiểm tra; đếm to số lá khi thêm/bớt bằng clip số có sẵn (best-effort).
- [x] BRD §7.5: cập nhật tương tác chạm lá để bớt, kiểm tra thừa không đưa về 0, không lặp chữ ngoài bong bóng Đô Đô, mục Sinh bài mô tả pool phần có sẵn + bảo đảm ≥4 anchor/block.
- [x] OpenSpec delta `openspec/changes/fix-explore-catalog-round-1/specs/explore-number-bond-game/spec.md` (MODIFIED: Authored prefilled part, Locked and tappable parts, Child-authored complement check, Phone-safe interaction hierarchy, Deterministic and private conformance; ADDED: Replay variety across runs).
- [x] Kiểm chứng: `npx tsc --noEmit` 0 lỗi; `npx eslint` 4 file sạch; `npm run test:explore-variety-buckets` pass; script contract ad-hoc (replay, membership, ≥4 anchor, 13 lượt nối tiếp khác nhau, reducer) pass.
- [x] Lead: sửa `ExplorePlayScreen` không cắt `.slice(-8)` với game có runPolicy (lệch index exclusion) — ĐÃ LÀM; xáo thứ tự slot trong block ở `registry.ts` HOÃN sang Đợt 3 (cần run seed chung, pool theo slot đã đủ đa dạng); cập nhật `verify-explore-prompt-audio-contracts.cjs` (regex play screen + bỏ NumberBondRenderer khỏi REPLAY_RENDERERS) và 2 assertion trong `explore.number-bond-arithmetic.spec.ts` ('🔒 Có sẵn', overfilled reset).

### 5.7 Dẫn đường cho Đô Đô (`route_planner`)

- [x] route_planner: bảng đo chiều cao còn lại bằng onLayout (ước lượng frame đầu từ useWindowDimensions + useSafeAreaInsets), ô = min(theo rộng routePlannerCellSize, theo cao), sàn 28pt; marker và ảnh Đô Đô co theo ô — nút "Đô Đô đi thôi!" luôn hiện trên 375×667 không cần cuộn (spec explore.route-planner-layout kiểm ngân sách, cell ≥38pt mọi cấp).
- [x] route_planner: gộp prompt + hướng dẫn vào một bong bóng lời Đô Đô (minHeight 65), bỏ tiêu đề "Đường đi của con" (ô lệnh 34pt, nhãn a11y từng bước giữ nguyên), gap 8pt, dải lệnh/khối điều khiển ≤360pt trên tablet.
- [x] route_planner: phím mũi tên thành D-pad (↑ trên; ← ↓ → dưới), cao 56pt, rộng 56pt từ 360pt (≥48pt ở 320pt); cột phải = nút chạy + hàng Xóa bước/Xóa hết, tổng khối 118pt.
- [x] route_planner: tách hai nút X — undo: Icon 'undo' + caption "Xóa bước" + a11y "Xóa bước cuối"; clear: Icon 'eraser' + caption "Xóa hết" + a11y "Xóa cả đường đi"; bỏ Icon 'x'/'rotate-ccw' trong renderer (X góc trên trái màn hình vẫn là thoát).
- [x] Icon.tsx: nối thêm 'undo' và 'eraser' (Lucide undo-2 / eraser), không đổi icon cũ.
- [x] route_planner: thay 🐵 bằng ảnh dodo.png thật trong ô lưới (Image resizeMode contain, đĩa kem nền); giữ marker 🏠⭐✨🔑✅🔒🔓 tới Đợt 3; bỏ 🎉 trong câu thắng.
- [x] route_planner: giữ nguyên hợp đồng FEEDBACK_TEXT ↔ route_fb_* và onSpeakFeedback?.(guidanceNow.audioRefs); onSelectSound/onTryAgainSound không đổi.
- [x] kido-server: cập nhật explore.route-planner-renderer.spec.ts (D-pad, icon/nhãn undo-clear, dodo.png, không emoji mascot, onLayout + Math.min(byWidth, byHeight), KEY_SIZE/KEY_MIN_WIDTH/EDIT_MIN_WIDTH) và explore.route-planner-layout.spec.ts (đọc hằng số layout từ renderer, mirror chrome ExplorePlayScreen 72/90/paddingHorizontal 20, ngân sách 375×667, khối điều khiển một hàng 320→768, fitCell co theo cao) — 22/22 pass.
- [x] OpenSpec: delta specs/explore-route-planner-game/spec.md — MODIFIED "Responsive accessible controls" (375×667 không cuộn, ô theo rộng+cao, D-pad, undo/clear icon-nhãn riêng), ADDED "Đô Đô character on the board".
- [x] (lead) nới regex play-screen trong verify-explore-prompt-audio-contracts.cjs / verify-explore-sound-contracts.cjs và assert setRouteLevel(1) trong explore.route-planner-privacy.spec.ts cho khớp ExplorePlayScreen mới (xem sharedLayerRequests / serverSpecFindings).
- [x] (tuỳ chọn, lead duyệt) ExplorePlayScreen: feedbackArea minHeight 0 cho route_planner để bảng rộng hơn trên máy thấp.

### 5.8 Xưởng luyện nét (`tracing_workshop`)

- [x] Xưởng luyện nét: bỏ cap 192 điểm thô trong onPanResponderMove; lọc điểm thô theo khoảng cách ≥ 0,5 đơn vị (MIN_RAW_TRACING_POINT_DISTANCE), lưới an toàn MAX_RAW_TRACING_POINTS = 2000, không early-return (mobile/src/explore/games/tracingEvaluator.ts, renderers/TracingWorkshopRenderer.tsx)
- [x] Xưởng luyện nét: niêm điểm nhấc tay vào trail (shouldSealRawTracingPoint) để nét và đánh giá kết thúc đúng chỗ ngón tay dừng (sửa tittle i/j bị thiếu 0,5 đơn vị ở L5)
- [x] Xưởng luyện nét: trail hiển thị trong tracingState dùng MAX_RAW_TRACING_POINTS thay magic 191
- [x] Xưởng luyện nét: nâng giới hạn resample MAX_TRACING_POINTS 192 → 512 (380 → 1020 đơn vị) vì mê cung/ngôi sao (322/320 đơn vị) nằm trong biên jitter; thêm test hợp đồng mọi nét × 1,5 < sức chứa
- [x] Xưởng luyện nét: sửa projectToTracingPath phân xử đoạn tự đè (`u`/`ư` thân phải lên rồi xuống) theo hướng ngón tay; nét lý tưởng 60 Hz của u/ư giờ được chấp nhận ở mọi level
- [x] Xưởng luyện nét: thay 🐘 bằng <ExploreMascot mood="idle" size={56} /> trong TracingWorkshopRenderer
- [x] kido-server explore.tracing.spec.ts: thêm 6 test (decimation theo khoảng cách, nét thẳng chậm == nhanh, 6 s/10 s mọi nét mọi level, chậm == nhanh, retrace u/ư, kích thước resample) + source-check renderer không còn cap/emoji; 27/27 pass
- [x] OpenSpec delta specs/explore-tracing-workshop/spec.md (MODIFIED Progressive tracing evaluation + ADDED Tracing presents the shared mascot)
- [x] Xác minh: tsc 0 lỗi, eslint sạch, jest tracing + catalog-visibility pass, test:explore-variety-buckets pass; test:explore-prompt-audio fail do regex của script vs ExplorePlayScreen mới (shared layer, đã báo lead)

### 5.9 Lật thẻ tìm cặp (`memory_match`)

- [x] 3.9 Lật thẻ: `calculateMemoryBoardLayout(width, pairCount, boardHeightBudget?)` thêm `rows`/`boardHeight`/`requiresVerticalScroll`, cỡ thẻ theo cả chiều rộng lẫn ngân sách chiều cao; bảng 3 cặp 3×2, 6 cặp 4×3, 8 cặp 4×4 vừa 375×667 không cuộn dọc, thẻ ≥48pt (màn quá nhỏ mới cuộn dọc)
- [x] 3.9 Lật thẻ: renderer đo vùng bảng bằng `onLayout` (ước lượng đầu từ `MEMORY_BOARD_CHROME_HEIGHT`), thay 🐘 bằng `ExploreMascot` (cheer khi đúng cặp, think khi úp lại cặp sai), thêm hàng chấm tiến trình chỉ tăng cạnh "Đã tìm n/N cặp", không nút replay riêng
- [x] 3.9 Lật thẻ: `explore.memory-match.spec.ts` cập nhật cho 2/3/4/6/8 cặp, run 3 bảng từ `startingLevel` (clamp L3→L5), kiểm tra bố cục 375×667 và fallback màn nhỏ, snapshot tái sinh; spec delta `specs/explore-memory-match-game/spec.md`
- [x] 3.9 Kiểm chứng: tsc/eslint sạch trên 3 file; `npm run test:explore-variety-buckets` xanh; `npx jest explore.memory-match.spec.ts` 13/13 xanh; variety/stateless-privacy/catalog-visibility spec vẫn xanh
