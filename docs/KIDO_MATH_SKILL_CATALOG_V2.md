# PROJECT KIDO — MATH SKILL CATALOG V2 (Knowledge Graph)

- **Môn (SubjectCode):** `toan`
- **Độ tuổi:** 5–6 (Age 5–6 · School-readiness track)
- **Trạng thái:** DRAFT chuẩn hóa — kế thừa & thay thế phần taxonomy của `KIDO_MATH_CURRICULUM.md`
- **Phiên bản:** 2026-07-03-catalog-v2

> Catalog này chuẩn hóa lại **bộ skill + micro-skill** theo mô hình knowledge-graph (V2), làm nguồn chân lý cho **review** và **regenerate seed**. Khung 48 tuần chỉ là *một* learning path chạy trên graph này.

---

## 0. QUY ƯỚC CHUẨN HÓA

### 0.1 Kiến trúc
`Domain → Skill → Micro Skill → Difficulty → actionType → Seed → Activity`

### 0.2 Naming (khóa 2026-07-02, giữ nguyên để chống drift)
- **`skillCode`** giữ bộ `math_*` đã seed. Skill mới cũng theo `math_<skill>`.
- **`domainCode`** = field metadata MỚI (không nhét vào skillCode). 13 mã: `num arith pat cls cmp seq geo spa mea log mtx prb exe`.
- **`microSkillCode`** = `skillCode` + `_<micro>` (vd `math_count_1_20_scattered`).

### 0.3 actionType — KHÓA 5 MVP (không mở template mới)
`single_select · multi_select · sort_sequence · match_pair · count_tap`.
`watch_video` hoãn post-MVP. `hotspot/drag_drop/tangram/maze/trace` **không** đưa vào (chi phí sản xuất/annotate cao) — skill liên quan hạ cấp về 5 MVP hoặc gắn `⏸`.

### 0.4 Difficulty — L1..L5
`L1 Explore · L2 Practice · L3 Apply · L4 Challenge · L5 Master`.

### 0.5 Cờ trạng thái
`✓` đã có seed · `+` skill mới · `⏸` post-MVP (cần template/asset ngoài phạm vi) · `↔` đã gộp/di chuyển để dedup.

### 0.6 Nguyên tắc construct (Logic Signature Test)
Mỗi micro-skill = **một** thao tác tư duy. Item chỉ hợp lệ nếu trẻ *chưa từng thấy nội dung* vẫn làm đúng bằng **suy luận trên màn hình** — không phải *nhớ kiến thức* hay *đếm trá hình*. Mỗi Skill khai báo **Construct** + **Anti-pattern** (đưa vào rubric `SEED_SKILL_MATCH` + prompt regen).

---

## 1 · NUMBER SENSE `num`
*Cảm nhận số lượng & ký hiệu số.*

- **`math_number_recognition +`** — nhận diện thẻ số ↔ tên số · `single_select`, `match_pair`
  - Construct: gắn ký hiệu số với tên/số lượng. Anti-pattern: không yêu cầu đếm (đó là skill khác).
  - Micro: `_1_10` (L1) · `_1_20` (L2) · `_1_50` (L3)
- **`math_count_1_20 ✓`** — đếm vật → chọn số · `count_tap`
  - Construct: tương ứng 1-1 vật↔số đếm. Anti-pattern: vật xếp chồng/ẩn không đếm được bằng mắt.
  - Micro: `_linear` (L1) · `_scattered` (L2) · `_grouped` (L3) · `_two_groups` (L3, bắc cầu `cmp`)
- **`math_count_1_20_adv ✓`** — đếm phạm vi sát trần tuần · `count_tap` — Micro: `_15_20` (L3) · `_mixed_objects` (L4)
- **`math_subitize +`** — nhận nhanh số lượng nhỏ không đếm từng cái (chấm/xúc xắc) · `single_select`
  - Construct: tri giác số lượng ≤5 tức thì. Anti-pattern: bày >6 vật (buộc phải đếm → hỏng subitize).
  - Micro: `_dots` (L1) · `_dice` (L2) · `_tenframe` (L3)
- **`math_order_numbers +`** — xếp thẻ số theo thứ tự (↔ nhận "Number Order" từ Sequencing) · `sort_sequence`
  - Micro: `_1_10` (L2) · `_before_after` (L3) · `_between` (L4)
- **`math_compose_decompose +`** — tách/gộp số (5 = 2+3) trực quan · `single_select`, `count_tap`
  - Micro: `_within_5` (L3) · `_within_10` (L4)
- **`math_number_line +`** — vị trí số trên trục · `single_select` — Micro: `_locate` (L4) · `_jump` (L5)

## 2 · ARITHMETIC `arith`
*Phép tính trực quan (Visual Scaffolding bắt buộc: luôn có nhóm vật làm điểm tựa).*

- **`math_arithmetic_1_50 ✓`** — cộng/trừ trực quan · `single_select`, `count_tap`
  - Construct: thao tác thêm/bớt trên nhóm vật rồi chọn kết quả. Anti-pattern: phép tính trừu tượng không kèm hình.
  - Micro: `_add_within_5` (L2) · `_add_within_10` (L3) · `_sub_within_5` (L3) · `_sub_within_10` (L4)
- **`math_missing_number +`** — điền số thiếu ô trống (2+▢=5) · `single_select`
  - Construct: suy ngược để cân bằng. Anti-pattern: đọc to phép tính = lộ đáp án (giữ ở answerSpec).
  - Micro: `_add_slot` (L3) · `_bridge` (L4, sát format Amsterdam)
- **`math_mental_math + ⏸`** — nhẩm không hình (L5) — *cân nhắc: vi phạm Visual Scaffolding, chỉ mở khi cần.*

## 3 · PATTERN `pat`
*Phát hiện & nối tiếp quy luật.*

- **`math_pattern_ab ✓`** — CHỈ chuỗi AB (A-B-A-B) · `single_select` — Micro: `_ab_2color` (L1) · `_ab_2shape` (L2). *(ABB/AAB không thuộc skill này — dùng `math_pattern_abc` cho đơn vị dài hơn.)*
- **`math_pattern_abc ✓`** — chuỗi ABC/ABCD · `single_select` — Micro: `_abc` (L2) · `_abcd` (L3)
- **`math_pattern_growing +`** — quy luật tăng dần (▲ ▲▲ ▲▲▲) · `single_select` — Micro: `_size` (L3) · `_count` (L4)
- **`math_pattern_shrinking +`** — quy luật giảm dần · `single_select` — Micro: `_size` (L3)
- **`math_pattern_number +`** — dãy số bước nhảy (2,4,6,▢) — (↔ = `math_sequence_jump` cũ) · `single_select`
  - Micro: `_step2` (L3) · `_step_mixed` (L4)
- **`math_pattern_mixed +`** — đan xen 2–3 thuộc tính (hình+màu+lượng) · `single_select` — Micro: `_2attr` (L4) · `_3attr` (L5)

*Construct chung: đáp án suy ra từ quy luật hiển thị. Anti-pattern: distractor là màu/hình KHÔNG có trong chuỗi (trẻ loại ngay). Rotation/Mirror ↔ dời sang `spa`.*

## 4 · CLASSIFICATION `cls`
*Phân loại theo thuộc tính.*

- **`math_classify_1attr ✓`** — chọn tất cả vật thỏa 1 tiêu chí · `multi_select`, `match_pair`
  - Micro: `_color` (L1) · `_shape` (L2) · `_size` (L2)
- **`math_classify_2attr ✓`** — thỏa đồng thời 2 thuộc tính · `multi_select`
  - Anti-pattern: thiếu distractor "đúng 1 tiêu chí" → bài mất ý nghĩa.
  - Micro: `_color_size` (L3) · `_color_shape` (L3)
- **`math_classify_3attr +`** — 3 thuộc tính · `multi_select` — Micro: `_full` (L5)
- **`math_odd_one_out +`** — vật khác nhóm (↔ = `math_compare_diff` cũ, gộp cả spot-difference) · `single_select`
  - Construct: tìm phần tử vi phạm tiêu chí chung. Anti-pattern: nhiều hơn 1 vật có thể coi là "lạc".
  - Micro: `_category` (L2) · `_attribute` (L3) · `_function` (L4)
- **`math_group_by_category +`** — nối vật ↔ nhóm (living/habitat/food/vehicle: đổi *bộ dữ liệu*, không tách skill) · `match_pair`
  - Construct: mỗi cặp phải là quan hệ rõ ràng, ổn định và có thể kiểm chứng; tránh quan hệ chỉ đúng theo mùa/tùy loài/gây tranh cãi (ví dụ `gấu ↔ hang`).
  - Micro: `_habitat` (L2) · `_food` (L2) · `_living_nonliving` (L3)

## 5 · COMPARISON `cmp`
*Phán đoán tương đối 2–3 vật (KHÔNG dùng đơn vị đo — đó là `mea`).*

- **`math_compare_quantity ✓`** — nhiều/ít hơn · **`compare_tap`** (2 khung tap-đếm, CÙNG 1 vật, app nhân bản sprite mỗi bên) — Micro: `_more_less` (L1). *(`_equal` L2 hoãn: cần UI 3 đáp án, ngoài scope compare_tap.)*
- **`math_compare_size +`** — to/nhỏ hơn · `single_select` · cùng một sprite với preset `small`/`large` (uniform scale)
- **`math_compare_length +`** — dài/ngắn hơn (thay bản 4–5 của `math_measurement_base`) · `single_select` — Micro: `_2items` (L2) · `_3items` (L3)
- **`math_compare_height +`** — cao/thấp hơn · `single_select` — Micro: `_2items` (L2)
- **`math_compare_weight ⏸`** — post-MVP; cần visual cân chuyên dụng, cấm dùng scale/ảnh độc lập
- **`math_compare_capacity ⏸`** — post-MVP; cần container/mức chất lỏng chuyên dụng, cấm dùng scale/ảnh độc lập

*Construct: so trực tiếp thuộc tính tri giác được. Anti-pattern (length/height/weight/capacity — `single_select`): chênh lệch quá nhỏ để ước lượng (4 vs 5 ở L1).*
*`math_compare_quantity` (`compare_tap`): vì tap-đếm được nên chênh lệch nhỏ HỢP LỆ theo difficulty — ngưỡng warmup ≥3, core ≥2, challenge ≥1 (4 vs 5 = bài challenge). Anti-pattern mới: 2 bên khác vật (phải CÙNG 1 vật, chỉ khác số lượng).*

## 6 · SEQUENCING / SERIATION `seq`
*Sắp xếp theo thứ tự.*

- **`math_seriation_size +`** — xếp 4 vật theo MỘT chiều đo đơn điệu (to/dài/cao/nặng dần) · `sort_sequence`
  - **Construct logic mạnh nhất của domain.** Thay lõi của `math_sequence_order ✓`.
  - Anti-pattern: các bước không đơn điệu / chênh <20% (mơ hồ thứ tự). Chỉ 1 thứ tự đúng (neo 2 đầu).
  - Micro: `_size` (L2) · `_length` (L3) · `_height` (L3) · `_quantity` (L4, bắc cầu `num`)
- **`math_sequence_time +`** — chuỗi thời gian/routine (↔ tách từ `math_sequence_order`) · `sort_sequence`
  - *Phụ thuộc kiến thức đời sống → tỉ trọng thấp, không tính là logic thuần.*
  - Micro: `_daily_routine` (L2) · `_lifecycle` (L3) · `_story` (L3)

*Ghi chú dedup: `Cause & Effect` ↔ dời sang `log`; `Number Order`/`Pattern Order` ↔ trả về `num`/`pat`.*

## 7 · GEOMETRY `geo`
*Hình phẳng.*

- **`math_shape_recognize +`** — nhận diện hình cơ bản · `single_select`, `match_pair` — Micro: `_basic` (L1) · `_rotated` (L3)
- **`math_shape_properties +`** — đếm cạnh/góc · `single_select` — Micro: `_sides` (L3)
- **`math_geometry_base ✓`** — đếm hình ẩn trong hình phức (hidden shape → về `single_select` chọn số) · `single_select`
  - Micro: `_count_hidden` (L3) · `_grid_count` (L4)
- **`math_symmetry_half +`** — đối xứng + nửa hình + hoàn thiện hình (gộp) · `single_select`
  - Construct: suy phần còn thiếu qua trục đối xứng. Anti-pattern: hình 3D/không có trục rõ.
  - Micro: `_mirror_half` (L3) · `_complete` (L4)
- **`math_compose_shape + ⏸`** — ghép mảnh thành hình. MVP: "mảnh nào vừa chỗ trống?" · `single_select` (tangram-lite) — Micro: `_fit_piece` (L4)
- **`math_tangram_transform ✓ ⏸`** — tangram/gấp giấy đầy đủ (cần drag+xoay) — *hoãn; bản gấp-giấy làm được bằng `single_select` "đoán hình sau khi mở".*

## 8 · SPATIAL REASONING `spa`
*Quan hệ không gian & xoay hình.*

- **`math_spatial_position +`** — trái/phải, trong/ngoài, trên/dưới (position → `single_select` chọn thẻ) · `single_select`
  - Micro: `_left_right` (L2) · `_in_out` (L2) · `_near_far` (L3)
- **`math_spatial_basic ✓`** — mirror/đối xứng hình phẳng · `single_select` — Micro: `_mirror` (L3)
- **`math_mental_rotation +`** — hình sau khi xoay trông thế nào · `single_select` — Micro: `_2d_rotate` (L4)
- **`math_paper_folding +`** — đoán kết quả gấp/đục lỗ (là `single_select`, không cần fold thật) · `single_select` — Micro: `_predict` (L4)
- **`math_spatial_3d ✓`** — đếm khối lập phương xếp chồng (có khối ẩn), top-view · `count_tap`, `single_select`
  - Anti-pattern: answerSpec phải ghi rõ tổng gồm khối khuất. Micro: `_count_blocks` (L4) · `_top_view` (L5)
- **`math_maze + ⏸`** — tìm đường (cần renderer riêng) — *hoãn.*
- **`math_map_reading + ⏸`** — đọc bản đồ đơn giản — *hoãn.*

## 9 · MEASUREMENT `mea`
*Đo bằng đơn vị (tách bạch khỏi Comparison & Counting).*

- **`math_measure_nonstandard +`** — đo bằng đơn vị không chuẩn, **có bước lập luận đơn vị** (bút chì 3 tẩy vs 5 tẩy → dài hơn), KHÔNG chỉ đếm · `single_select`
  - Re-spec từ `math_measurement_base ✓`. Anti-pattern: "đếm mấy cái kẹp giấy" đơn thuần = skill Đếm trá hình.
  - Micro: `_compare_units` (L3) · `_iterate` (L4)
- **`math_measure_estimate +`** — ước lượng dài/cao hơn/kém · `single_select` — Micro: `_visual` (L4)
- **`math_measure_time_money + ⏸`** — giờ/lịch/tiền/nhiệt độ (gộp, nặng kiến thức) — *hoãn/đánh giá riêng.*

## 10 · LOGIC `log`
*Suy luận suy-ra-được (không phải nhớ kiến thức).*

- **`math_logic_causality ✓`** — nhân quả **vật lý suy-ra-được** (re-spec) · `single_select`
  - Construct: dự đoán hệ quả từ tình huống hiển thị (đẩy domino→đổ, bóng tới mép→rơi). **Anti-pattern: quy ước đời sống (mưa→áo mưa, ốm→bác sĩ) = nhớ kiến thức, KHÔNG hợp lệ.**
  - Micro: `_physical` (L2) · `_predict_result` (L3)
- **`math_logic_if_then +`** — nếu…thì trên quy tắc cho sẵn · `single_select` — Micro: `_given_rule` (L3)
- **`math_logic_analogy +`** — A với B như C với ? · `single_select` — Micro: `_visual` (L4)
- **`math_logic_elimination ✓`** — bắc cầu (Voi>Gấu>Thỏ → ai nhẹ nhất) · `single_select`
  - Anti-pattern: thẻ đáp án chỉ mascot, không chữ; chuỗi bắc cầu ở answerSpec. Micro: `_transitive_3` (L4) · `_transitive_4` (L5)
- **`math_logic_inference +`** — suy phần còn thiếu từ manh mối · `single_select` — Micro: `_clue` (L4)
- **`math_logic_rule_discovery +`** — tìm quy tắc chung rồi áp dụng · `single_select` — Micro: `_find_rule` (L5)
- **`math_conditional_count ✓`** — lọc & chọn TẤT CẢ vật thỏa nhiều điều kiện · `multi_select`
  - Anti-pattern: cần distractor thỏa 1 phần điều kiện. Micro: `_2cond` (L3) · `_3cond` (L4)

## 11 · MATRIX REASONING `mtx`
*Ma trận khuyết ô — dạng đặc trưng trường điểm.*

- **`math_matrix_2x2_basic ✓`** — 2×2, 1 thuộc tính · `single_select` — Micro: `_1attr` (L3)
- **`math_matrix_2x2_adv ✓`** — 2×2, màu+hình · `single_select` — Micro: `_2attr` (L4)
- **`math_matrix_2x3 +`** — 2×3 · `single_select` — Micro: `_base` (L4)
- **`math_matrix_3x3 +`** — 3×3 khuyết 1 ô (↔ = `math_matrix_logic` cũ) · `single_select` — Micro: `_row_col` (L5)
- **`math_matrix_progressive +`** — quy luật tiến triển theo hàng+cột · `single_select` — Micro: `_progressive` (L5)

*Construct: đáp án thỏa đồng thời quy luật hàng & cột. Anti-pattern: distractor phải sai đúng 1 chiều (đúng màu/sai hình).*

## 12 · PROBLEM SOLVING `prb`
*Vận dụng vào bối cảnh truyện.*

- **`math_word_problems ✓`** — bài toán 1 bước trong truyện tranh · `single_select`
  - Anti-pattern: questionCore kể tình huống, KHÔNG nêu phép tính. Micro: `_add` (L3) · `_sub` (L4)
- **`math_picture_problem +`** — đọc dữ kiện từ tranh rồi giải · `single_select` — Micro: `_1step` (L3)
- **`math_two_step_problem +`** — 2 bước tính · `single_select` — Micro: `_2step` (L5)
- **`math_verbal_math ✓`** — mã hóa ký hiệu→số (Sao=3, Kim cương=2) · `single_select`
  - Anti-pattern: quy ước hình↔số ở answerSpec; questionCore chỉ "tính giúp Đô Đô". Micro: `_decode` (L4) · `_encode` (L5)
- **`math_missing_information + ⏸`** — nhận ra thiếu dữ kiện (L5) — *nâng cao, cân nhắc.*

## 13 · EXECUTIVE THINKING `exe`
*Chức năng điều hành — phần lớn là chế độ ĐÁNH GIÁ, không phải content dạy được.*

- **`math_visual_memory +`** — nhớ vật/vị trí vừa hiện · `single_select`, `match_pair` — Micro: `_recall` (L3)
- **`math_error_detection +`** — tìm chỗ sai trong chuỗi/hình · `single_select` — Micro: `_spot_error` (L4)
- **`math_planning + ⏸`** — lập kế hoạch nhiều bước — *hoãn.*
- *Working Memory / Attention / Self-check → tách sang **Assessment epic**, KHÔNG seed như content.*

---

## 14 · GHI CHÚ MIGRATION

1. **Kế thừa seed cũ:** 14 skillCode `✓` giữ nguyên mã. `math_sequence_order`, `math_measurement_base`, `math_compare_diff` bị **re-spec/di chuyển** → seed cũ của chúng cần audit lại theo Construct mới (nguồn gốc yêu cầu regen).
2. **Độ tuổi 5–6:** seed 4–5 (Nhóm 2) hiện tại thành out-of-scope của catalog này → re-tag thành tầng L1 Foundation hoặc park; xử lý ở bước seed, không chặn catalog.
3. **`domainCode`:** cần thêm field vào `ActivitySeed`/schema (metadata), không đổi `skillCode`.
4. **`⏸` post-MVP:** ở trong catalog để giữ tầm nhìn, KHÔNG seed cho tới khi có template/asset tương ứng.
5. **Construct + Anti-pattern** ở mỗi Skill = tầng nạp vào rule `SEED_SKILL_MATCH` (review) và ràng buộc prompt regen.
