# Đề xuất: Xe buýt hai tầng (`number_bus`) — thể loại tách gộp & đếm thêm

## Why

Sau đợt gỡ 2026-09-22 (`number_bond`, `arithmetic_machine` cùng 4 game đếm),
Khám phá không còn game nào phủ hai kỹ năng trung tâm của school-readiness
toán 4–6 tuổi: **tách – gộp trong phạm vi 10** (part–whole / number bond —
hoạt động lõi của chương trình mầm non 5–6 tuổi VN và là sơ đồ mở đầu SGK Toán
lớp 1) và **đếm thêm** (counting on — chiến lược cộng nền tảng, chưa có node
lesson nào trong graph). Lesson chỉ có `single_select` một lượt; không nơi nào
trong Kido dạy tường minh *chiến lược*, làm mẫu được, và cho luyện lặp đến
thành thói quen.

Hai game cũ bị gỡ vì dead-mode (khai mode không bao giờ chạy), hint lộ đáp án,
phình catalog, và "một game gánh cả hệ thống". Bản thiết kế này được xây từ
đầu trên nghiên cứu sư phạm (Clements–Sarama learning trajectories, Fuson/
Baroody counting-on, mô hình part-whole Singapore, giáo án tách-gộp mầm non
VN, khảo sát DragonBox/Todo Math/Khan Kids) và đã qua một vòng phản biện đối
kháng 26 issue — toàn văn ở `design.md` (nguồn chuẩn khi proposal/spec/tasks
cần chi tiết).

## What Changes

- **Một game local, offline, stateless mới**: `number_bus` ("Xe buýt hai
  tầng") — MỘT exerciseType, mode qua `params.mode`. Fantasy duy nhất: xe buýt
  hai tầng của Đô Đô; **biển số = tổng, hai tầng = hai phần** (đúng sơ đồ
  tách-gộp SGK); từ L3 xe là ten-frame 5+5 đội lốt. GĐ1 ship **5 mode**:
  - `board_all` — gộp không-thể-sai (L1): hai bến lên hai tầng, danh tính hai
    phần giữ được sau khi gộp, mantra đồng bộ highlight.
  - `free_split` — tách tự do: mọi phân hoạch đều đúng, **lượt-chia-lại
    trong-bài** ("Còn cách chia nào nữa nhỉ?" là lời mời thật).
  - `next_number` — warm-up số-đứng-sau (tiên quyết Baroody), tái dùng clip
    `number_which_after` sẵn có.
  - `missing_part` — dựng-rồi-kiểm sau rèm (KHÔNG thẻ): audio luôn công bố
    tổng, silhouette đếm được/chạm được, rèm hé không đủ để đếm, bé tự sửa.
  - `count_on` — cửa đóng ("bears in a cave"): numeral trên cửa, chạm từng bạn
    phát [a+1]…, thẻ bắt buộc chứa distractor a+b−1, **re-model off-by-one
    ngay trong bài** (thẻ tạm ẩn → forced-tap đếm mẫu → chọn lại).
  - GĐ2 (change nối tiếp, sau playtest): `five_and`, `make_ten`, L5, lớp phủ
    "a + b = N" sau-khi-đúng, cổng MIN `chooseStart`, bài chẩn đoán, kênh
    `onAnswer(correct, detail?)` + `runFlags`.
- **Tiến trình mastery L1–L5** bám trajectory tách trong 3–4 → 5 → "5 và mấy"
  → 10; counting-all → counting-on; mỗi run neo MỘT level, tối đa 3 mode/lượt;
  thuật ngữ SGK ("tách", "gộp", "gồm", "đếm thêm" — không "số liền sau").
- **Generator deterministic + validator ĐỘC LẬP** tự tính bằng số học; luật
  anti-copy phát biểu lại: **chỉ áp cho distractor, không bao giờ áp cho đáp
  án đúng** (k=5 của make_ten và bond đôi whole=2×shown hợp lệ tường minh);
  reject `params.options` ở mode dựng; coverage mode↔level + vai-trò-slot
  assert HAI CHIỀU — đóng vĩnh viễn vết xe dead-mode.
- **Game đầu tiên dùng nhánh authored runPolicy** của `createExploreRunBatch`:
  6 slot PHẲNG, vai trò qua `generatorHint` trong `runSlot.constraints` (shape
  contract KHÔNG đổi). MỘT mở rộng engine duy nhất: nhánh authored resolve
  level hiệu dụng = clamp(startingLevel + levelOffset) thay vì `runSlot.level`
  tĩnh, kèm smoke test riêng cho nhánh này (chưa từng chạy với game thật).
- **Batch audio một lần → pack `explore-audio-vi-v4`**: ~32 clip `nb_*` (thu
  trọn cả câu GĐ2), tái dùng 51 clip số + `number_which_after` + `fb_*`; câu
  báo/hint không chứa số (2 ngoại lệ documented); chant "Tập tầm vông" có tiêu
  chí cắt tại Human Gate; công-bố-tổng của missing_part bắt buộc trong
  audioRefs.
- **Đồng bộ `EXPLORE_GAME_CODES` ba nơi đang lệch** (docs contract và
  kido-server còn thế hệ cũ `number_explorer`/`odd_one_out`/`sort_bins`, thiếu
  `ordinal_position`/`number_chain`/`spin_pattern`) về nguồn chuẩn mobile + game
  mới = 12 code.
- **Reorder catalog có chủ đích** (cần reviewer duyệt tường minh):
  `…memory_match → stack_tower → number_bus → number_chain → mirror_build…` —
  trục toán đi đếm → tách gộp/đếm thêm → chuỗi phép tính.
- BRD §7.13 (đã viết cùng change), thumbnail prompt, sửa docstring stale
  "2/4 miss" trong `rendererRegistry.tsx`.

**Tiền đề (change riêng, trước GĐ1):** `add-explore-parent-starting-levels`
(GĐ0) — `startingLevelByGame` per-game + persistence + màn phụ huynh + clamp
`resolveStartingLevel`. Đây là cơ chế "lên bậc qua nhiều phiên" hợp lệ duy nhất
trong khuôn zero-history.

## Capabilities

### New Capabilities

- `explore-number-bus-game`: puzzle tách-gộp + đếm thêm hai tầng với generator
  deterministic, validator độc lập "anti-copy chỉ distractor", 5 mode GĐ1,
  authored runPolicy 6 slot phẳng, re-model off-by-one trong-bài, support
  chỉ-TRỎ-không-ĐẾM-hộ, và tiến trình mastery L1–L4 (L5 ở GĐ2).

## Impact

- **Mobile Explore**: `games/numberBusGame.ts` (+ type
  `NumberBusSlotConstraints`), `renderers/NumberBusRenderer.tsx`,
  `registry.ts` (GAME_COPY reorder + chèn, LOCAL_GAMES, BUNDLED_OVERRIDES,
  nhánh authored resolve level hiệu dụng), `variety.ts` (nhánh
  `params.mode`), `rendererRegistry.tsx` (entry + sửa docstring),
  `promptAudio.ts`, `thumbnails.ts`, `types/explore.ts` (+`number_bus`);
  script `verify-explore-number-bus-contracts.cjs` + `test:explore-number-bus`.
- **kido-server**: `explore.types.ts` + `explore.registry.ts` đồng bộ danh
  sách 12 code, cập nhật assertion số game public trong spec test.
- **kido-pipeline**: mirror inventory audio trong
  `src/explore/exploreAudioInventory.ts`; batch TTS v4 chạy một lần.
- **docs**: `kido-explore-contract.ts` (danh sách 12 code), BRD §7.13,
  `KIDO_EXPLORE_THUMBNAIL_PROMPTS.md`, `AI_CONTEXT.md`.
- **Không** đổi schema lesson, curriculum freeze, progress, reward, analytics
  hay Explore-history (`explore-stateless-privacy`): mọi play state
  memory-only. Không đổi shape `ExploreRunSlot`/`ExploreRunPolicy`
  (`explore-run-v1` giữ nguyên).
- App bundle tăng ~32 clip ngắn; tới khi pack v4 approved + export, key mới
  resolve về im lặng (riêng công-bố-tổng là clip số đã bundled sẵn) và
  promptVi + hình luôn tự đứng.
