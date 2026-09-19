# PROJECT KIDO — REVIEW & CẢI TIẾN KHU KHÁM PHÁ (bám chương trình thi vào lớp 1)

- **Trạng thái:** DRAFT PROPOSAL — chờ Truth/Human Gate
- **Ngày:** 2026-09-17
- **Nguồn đối chiếu:** tài liệu trường (Học viện Hành trình Sáng tạo — BTTC; "Tách gộp
  pvi 10"; "Kể chuyện theo tranh") + nguồn online (Chim Đa Đa 6 cuốn, 1088 câu đố, Monkey
  Math / KidsUP / POMath). Chi tiết nguồn: `docs/KIDO_TRIAL_2WEEKS.md` §1.

> **CẬP NHẬT 2026-09-18 — đã XÓA HẲN 7 game** theo yêu cầu: `number_explorer` (Khám phá
> số), `odd_one_out` (Ai lạc đàn), `sort_bins` (Dọn đồ), `number_between` (Số ở giữa),
> `visual_analogy` (Cặp đôi hoàn hảo), `balance_scale` (Cân thăng bằng), `shadow_match`
> (Tìm bóng). Đã gỡ toàn bộ module + renderer + contract + wiring; tách `shapePrimitives.ts`
> cho `mirror_build`/`shape_hunt`; đồng bộ prompt-audio mobile↔pipeline. Catalog còn **17 game
> đăng ký (16 hiển thị + Xưởng luyện nét ẩn)**; 18/18 explore contract PASS, không lỗi lint mới.
> Danh mục "giữ/cải tiến/game mới" bên dưới là bản khảo sát TRƯỚC đợt xóa — giữ lại làm lịch sử.

> Mục tiêu tài liệu: (1) **đính chính hiện trạng** khu Khám phá; (2) **đánh giá giữ/bỏ/cải
> tiến** từng game; (3) **đề xuất game mới** lấp đúng các dạng đề thi lớp 1 còn thiếu — tất
> cả trong khuôn khổ nguyên tắc BRD (`KIDO_EXPLORE_BRD.md`): deterministic generator +
> validator, không đọc chữ, không reward, offline-by-capability, reuse asset, ≥200 đề/ game.

---

## 0. ĐÍNH CHÍNH HIỆN TRẠNG (BRD đã cũ)

`KIDO_EXPLORE_BRD.md` (v0.4) mô tả **8 trò**. Thực tế `mobile/src/explore/registry.ts`
đã có **17 game** (16 hiển thị + `tracing_workshop` ẩn). **Việc #1: cập nhật BRD lên
đúng 17 game.** Danh mục thực tế (thứ tự sư phạm trong catalog):

| # | gameCode | Tên | Construct (năng lực) |
|--|--|--|--|
|1|`tap_count`|Chạm và đếm|Tương ứng 1-1 vật↔số|
|2|`subitize_flash`|Nhìn nhanh|Tri giác số lượng ≤5 tức thì|
|3|`quantity_compare`|Bên nào nhiều hơn?|So sánh số lượng|
|4|`number_explorer`|Khám phá số|Nhận số, thứ tự, trước–sau|
|5|`pattern_finder`|Tìm quy luật|Hoàn thành pattern|
|6|`missing_cell`|Ô thiếu|Suy ô khuyết theo hàng & cột (ma trận)|
|7|`peekaboo_recall`|Ú òa|Trí nhớ làm việc — vật vừa biến mất|
|8|`odd_one_out`|Ai lạc đàn?|Tìm phần tử vi phạm nhóm|
|9|`shape_hunt`|Săn hình|Lọc & chạm hết vật thỏa điều kiện|
|10|`sort_bins`|Dọn đồ|Phân loại vào nhóm|
|11|`memory_match`|Lật thẻ tìm cặp|Trí nhớ vị trí cặp|
|12|`number_bond`|Ngôi nhà tách gộp|**Tách–gộp số 5/10**|
|13|`arithmetic_machine`|Máy cộng trừ|Cộng/trừ trực quan|
|14|`stack_tower`|Xếp tháp cho Đô Đô|Seriation theo kích thước|
|15|`mirror_build`|Soi gương|Đối xứng qua gương|
|16|`route_planner`|Dẫn đường cho Đô Đô|Lập kế hoạch không gian trên lưới|
|17|`tracing_workshop`|Xưởng luyện nét|Vận động tinh (ĐANG ẨN — `catalogVisible:false`)|

Nhận định chung: **khu Khám phá đã phủ RẤT tốt trục số học & tri giác** (đếm, số, so sánh,
tách gộp, cộng trừ, quy luật, phân loại, trí nhớ, đối xứng, seriation, không gian). Đối chiếu
tài liệu trường, phần **còn thiếu là nhóm "suy luận quan hệ/logic thị giác"**: tìm bóng, ẩn
dụ tương tự, cân thăng bằng/tương đương, số liền kề–số ở giữa, sudoku, vị trí thứ tự.

---

## 1. MA TRẬN PHỦ SÓNG THI LỚP 1 (đối chiếu tài liệu trường)

| Dạng đề trường (nguồn) | Lesson 48 tuần | Khám phá hiện có | Trạng thái |
|---|---|---|---|
| Đếm trong tranh / đếm ứng dụng (BTTC #1,5,24) | ✅ `count_tap` | ✅ `tap_count` | Đủ |
| Nhận số / thứ tự / trước–sau (Tách gộp B3) | ✅ | ✅ `number_explorer` | Đủ (thiếu "số ở giữa") |
| So sánh số lượng | ✅ `compare_tap` | ✅ `quantity_compare` | Đủ |
| So sánh bằng KÝ HIỆU `< > =` (Tách gộp B2) | ⚠️ chưa | ❌ | **Thiếu** |
| Tách–gộp trong 10 (Tách gộp B1) | ⚠️ `compose_decompose` (trial) | ✅ `number_bond` | Đủ |
| Cộng/trừ trực quan; **chuỗi phép tính** (Tách gộp B3') | ✅ `arithmetic_1_50` | ✅ `arithmetic_machine` | Đủ (thiếu chế độ "chuỗi") |
| Quy luật lặp / xoay (BTTC #12,15,16,22) | ✅ | ✅ `pattern_finder` | Đủ (thiếu "xoay") |
| Ma trận 2×2/3×3 (BTTC #8,21) | ✅ matrix | ✅ `missing_cell` | Đủ |
| **Sudoku / latin square con vật (BTTC #13)** | ❌ | ⚠️ `missing_cell` gần | **Thiếu (mở rộng)** |
| Phân loại 1–2 thuộc tính (BTTC) | ✅ | ✅ `sort_bins`,`shape_hunt` | Đủ |
| Tìm vật lạc nhóm (BTTC) | ✅ | ✅ `odd_one_out` | Đủ |
| Trí nhớ / chú ý (Chim Đa Đa) | — | ✅ `memory_match`,`peekaboo_recall` | Đủ (trùng lặp) |
| Đối xứng (BTTC #11) | ✅ | ✅ `mirror_build` | Đủ |
| Seriation kích thước / cân nặng (BTTC2 #17) | ✅ | ✅ `stack_tower` | Đủ (thiếu seriation theo CÂN) |
| Không gian / mê cung (Chim Đa Đa "tìm đường") | — | ⚠️ `route_planner` (lập lệnh) | **Thiếu mê cung tự do** |
| **Tìm bóng / shadow (Chim Đa Đa, BTTC #23)** | ❌ | ❌ | **Thiếu (ưu tiên cao)** |
| **Ẩn dụ quan hệ / analogy thị giác (BTTC #7,16,17,23)** | ⚠️ ngôn ngữ | ❌ | **Thiếu (ưu tiên cao)** |
| **Cân thăng bằng / tương đương (BTTC2 #1,2; BTTC3 #19,20)** | ❌ | ❌ | **Thiếu (ưu tiên cao)** |
| **Vị trí thứ tự / ordinal (BTTC3 #10)** | ⚠️ `spatial_position` | ❌ | **Thiếu** |
| Số lẻ/chẵn + cực trị (BTTC3 #9) | ❌ | ❌ | Thiếu (biên — cân nhắc) |
| Đại số ảnh / giá trị hình (BTTC #6) | ⚠️ `verbal_math` | ❌ | Thiếu (biên — cân nhắc) |

---

## 2. ĐÁNH GIÁ TỪNG GAME — GIỮ / CẢI TIẾN / BỎ

### 2.1. GIỮ NGUYÊN (đúng construct, đúng đề trường)

`tap_count`, `subitize_flash`, `quantity_compare`, `sort_bins`, `odd_one_out`,
`shape_hunt`, `number_bond`, `mirror_build`, `route_planner`, `missing_cell`.
→ Không cần đổi. Đây là lõi khớp trực tiếp taxonomy thi lớp 1.

### 2.2. CẢI TIẾN (giữ engine, thêm mode — effort thấp, giá trị cao)

| Game | Cải tiến đề xuất | Bám tài liệu |
|---|---|---|
| `number_explorer` | Thêm mode **"số ở giữa"** (`3 < □ < 8`) và **số liền trước/liền sau** dạng thẻ số | Tách gộp B2/B3, BTTC |
| `arithmetic_machine` | Thêm mode **"chuỗi phép tính"** (máy nối tiếp: 6 →−4→ □ →+2→ □), gồm cả suy ngược tìm số đầu | Tách gộp B3' |
| `missing_cell` | Nâng thành **sudoku/latin-square 3×3–4×4** (mỗi biểu tượng xuất hiện 1 lần/hàng & cột) | BTTC3 #13 |
| `pattern_finder` | Thêm grammar **xoay/lật** (pentagon màu quay 1 bước) | BTTC3 #12, BTTC2 #16 |
| `stack_tower` | Thêm biến thể seriation theo **cân nặng** (dùng cân trực quan, xếp nhẹ→nặng) | BTTC2 #17 |

> Tất cả là **mode mới trong generator sẵn có** + validator tương ứng — không cần renderer mới.

### 2.3. CÂN NHẮC BỎ BỚT / GỘP (giảm quá tải lựa chọn)

Vấn đề: catalog **16 game phẳng** là quá nhiều lựa chọn cho trẻ 4–6 (BRD chủ đích ~8).
Không xoá engine đã đầu tư, mà **thu gọn mặt tiền + gộp trùng lặp**:

1. **Trùng trí nhớ:** `memory_match` (nhớ vị trí cặp) và `peekaboo_recall` (nhớ vật biến mất)
   cùng đo working memory. → **Giữ 1 làm mặc định** (đề xuất `memory_match`), đưa cái còn lại
   vào nhóm "Thử thách" hoặc luân phiên; tránh hai ô trí nhớ cạnh nhau.
2. **Gom nhóm catalog thành 4 hàng** thay vì 16 ô phẳng, mỗi hàng 3–4 trò:
   *Số & Đếm · Quy luật & Logic · Không gian & Hình · Trí nhớ & Chú ý.* Giảm choice-overload
   mà không bỏ nội dung (đúng tinh thần Chim Đa Đa: mỗi tập một năng lực chính).
3. **`tracing_workshop`:** giữ **ẨN** như hiện tại (bộ nét tiếng Việt chưa ổn định thị giác) —
   không đưa lại catalog cho tới khi sửa path pack.
4. `stack_tower` vs seriation trong `number_explorer`: nếu cần cắt để gọn, `stack_tower` là
   ứng viên demote (themed variant của seriation) — nhưng nó **thu hút** nên đề xuất GIỮ,
   chỉ xếp vào hàng "Không gian & Hình".

> Tóm lại: **không xoá game nào**, nhưng **mặt tiền rút còn ~8–10 trò nổi bật + gom hàng**,
> phần còn lại vẫn chơi được qua nhóm. "Bỏ bớt" ở đây = bỏ bớt *tải lựa chọn*, giữ *năng lực*.

---

## 3. GAME MỚI ĐỀ XUẤT (lấp đúng đề thi lớp 1)

Mỗi game tuân thủ BRD §8: `GameConfig + skill level + approved asset pool + seed →
deterministic generator → exercise → deterministic validator`. Ưu tiên tái dùng asset pool
& primitive sẵn có; offline khi mọi dependency đã bundled.

> **Cập nhật (2026-09-17):** `shadow_match` **ĐÃ LÀM XONG** — không dùng emoji (không tô
> bóng được) mà dùng **react-native-svg vẽ vật bằng primitive** (`shadowAssets.ts`, 12
> vật); bóng = cùng primitive tô tối ⇒ khớp outline, offline, không cần art. `balance_scale`
> cũng đã land. Cả 7 game mới verify xanh.

### 3.1. ⭐ Tìm bóng — `shadow_match` (ĐÃ LÀM — SVG primitive, offline)

- **Construct:** nối một vật với đúng cái BÓNG (silhouette) của nó — tri giác hình dạng tổng thể.
- **actionType tương đương:** `match_pair` (nối vật↔bóng) hoặc `single_select` (chọn bóng đúng).
- **Generator:** chọn 1 approved sprite → render silhouette (đổ đen, giữ alpha) làm đáp án;
  distractor = silhouette của vật KHÁC, hoặc cùng vật bị **lật/xoay/đổi tỉ lệ nhẹ** (mức khó cao).
- **Validator:** đúng 1 bóng khớp outline vật đề; distractor phải khác outline đo được (IoU < ngưỡng).
- **Độ khó:** L1 bóng khác loài rõ → L5 cùng loài, khác tư thế/lật.
- **Asset:** **reuse toàn bộ object sprite** đã duyệt; bóng sinh tự động lúc build → **offline**.
- **Nguồn:** Chim Đa Đa (tìm bóng), BTTC3 #23. Chi phí nội dung ~0.

### 3.2. ⭐ Cân thăng bằng — `balance_scale` (ƯU TIÊN CAO)

- **Construct:** suy luận **tương đương/cân bằng** — nền tảng tiền-đại số (dấu `=`).
- **Mode:** (a) bên nào nặng hơn; (b) chọn số vật để hai bên cân bằng ("cần thêm mấy quả?");
  (c) **bắc cầu**: 1 lê = 2 táo, 1 táo = 2 dâu → 1 lê = ? dâu; (d) chỉ ra cân VẼ SAI.
- **actionType:** `single_select` / `multi_select` / `count_tap` tùy mode.
- **Generator:** gán "trọng số" nguyên cho mỗi sprite; dựng bất đẳng thức/đẳng thức từ trọng số;
  render đòn cân nghiêng theo tổng trọng số.
- **Validator:** so tổng trọng số hai bên = rule xác định; đáp án suy ra DUY NHẤT.
- **Độ khó:** L1 so 1 vật mỗi bên → L5 bắc cầu 2 bước.
- **Asset:** reuse sprite trái cây/đồ vật + 1 asset cân (thumbnail). Offline được.
- **Nguồn:** BTTC2 #1,2; BTTC3 #19,20. Lấp đúng khoảng trống "dấu `=`/tương đương".

### 3.3. ⭐ Suy luận tương tự (thị giác) — `visual_analogy` (ƯU TIÊN TRUNG-CAO)

- **Construct:** "A với B như C với ?" — quan hệ THỊ GIÁC (nhỏ→to, cả→bộ phận, vật→công dụng,
  con vật→nơi ở). KHÔNG dùng chữ (khác `lang_verbal_analogy` của môn Tiếng Việt).
- **actionType:** `single_select` (chọn ô cho dấu `?`).
- **Generator:** khai báo **grammar quan hệ** trên các cặp asset đã gắn quan hệ (vd `whole→part`,
  `object→tool`, `animal→home`, `small→big`); random hoá token; sinh 3–4 distractor sai quan hệ.
- **Validator:** chỉ 1 phương án thỏa ĐÚNG quan hệ đang xét; distractor phải "gần" (đúng vật, sai quan hệ).
- **Độ khó:** L1 quan hệ kích thước → L5 quan hệ chức năng/nơi ở.
- **Asset:** cần **bảng quan hệ** (relation table) trên asset pool — công một lần, tái dùng nhiều.
- **Nguồn:** BTTC3 #7,23; BTTC #16,17 (nối bộ phận↔đồ vật, nghề↔dụng cụ).

### 3.4. Vị trí thứ tự — `ordinal_position` (TRUNG BÌNH)

- **Construct:** đếm thứ tự có mốc & hướng — "vật ở **hàng 2, vị trí thứ 3 từ trái**".
- **actionType:** `single_select` (chạm đúng ô trên lưới/kệ).
- **Generator:** lưới R×C sprite; sinh câu hỏi (hàng thứ m, cột thứ n, từ trái/phải/trên/dưới).
- **Validator:** đúng 1 ô theo toạ độ tính được.
- **Độ khó:** L1 hàng đơn → L5 lưới 3×N, đổi mốc trái/phải.
- **Asset:** reuse sprite. Offline. **Nguồn:** BTTC3 #10.

### 3.5. Mê cung — `maze` (TRUNG BÌNH)

- **Construct:** tìm đường từ A→B (planning không gian) — bổ sung cho `route_planner` (game này
  là kéo đường tự do, không phải xếp chuỗi lệnh).
- **Generator/Validator:** tái dùng mô hình generator + solver độc lập của `route_planner`
  (lưới sinh cục bộ, chứng minh có nghiệm) — chỉ đổi interaction sang vẽ/kéo đường.
- **Độ khó:** L1 mê cung nhỏ 1 nhánh → L5 nhiều ngã rẽ.
- **Offline** hoàn toàn. **Nguồn:** Chim Đa Đa "tìm đường", các bộ tracing/mê cung.

### 3.6. Cân nhắc (biên — chưa ưu tiên)

- **`number_compare_symbol`** (điền `< > =`): mạnh về thi lớp 1 nhưng **hiển thị KÝ HIỆU** — cần
  cân nhắc với ranh giới "audio-first, ít chữ". Đề xuất để ở **lesson** (có dẫn audio) hơn là Explore.
- **`odd_even_superlative`** (số lẻ nhỏ nhất — BTTC3 #9) & **`picture_algebra`** (giá trị hình —
  BTTC #6): construct hay nhưng hơi trừu tượng cho phần lớn 4–6; để **post-MVP**.

---

## 4. ƯU TIÊN TRIỂN KHAI

| Đợt | Hạng mục | Lý do |
|---|---|---|
| **P0 (cải tiến rẻ)** | "chuỗi phép tính" (`arithmetic_machine`), sudoku (`missing_cell`); **gom catalog 4 hàng**; giữ ẩn tracing | Chỉ thêm mode/UX, không renderer mới |
| **P1 (game mới, reuse cao)** | `shadow_match`, `balance_scale` | Đề thi lớp 1 kinh điển, chi phí asset ~0, offline |
| **P2** | `visual_analogy`, `ordinal_position`, `maze` | Cần relation table / interaction mới |
| **P3 (biên)** | `number_compare_symbol` (ưu tiên đưa vào lesson), `odd_even_superlative`, `picture_algebra` | Trừu tượng hơn / vướng ranh giới hiển thị chữ |

> **Cập nhật triển khai (2026-09-17) — 4 game ĐÃ LAND + verify xanh (catalog 17→21):**
> - ✅ `balance_scale` (Cân thăng bằng) — P1.
> - ✅ `ordinal_position` (Đúng vị trí, "hàng m thứ n từ trái/phải" — BTTC3 #10) — P2.
> - ✅ `visual_analogy` (Cặp đôi hoàn hảo, A:B::C:? tri giác) — P2.
> - ✅ `number_between` (Số ở giữa `a<□<b` — Tách gộp Bài 2) — thay cho "số ở giữa" ở P0, làm **standalone** (không đụng contract 456 dòng của `number_explorer`).
> - ✅ `number_chain` (Máy nối tiếp — chuỗi phép tính 2 chặng, xuôi + suy ngược — Tách gộp Bài 3) — thay cho "chuỗi phép tính (`arithmetic_machine`)" ở P0, làm **standalone** (không đụng contract 403 dòng của `arithmetic_machine`).
> - ✅ `spin_pattern` (Xoay hình — quy luật xoay mũi tên 90°/bước — BTTC3 #12) — thay cho "pattern_finder + xoay" ở §2.2, làm **standalone** (không đụng contract 804 dòng của `pattern_finder`).
> - ✅ `shadow_match` (Tìm bóng — Chim Đa Đa / BTTC3 #23) — KHÔNG còn chặn: dùng **react-native-svg** vẽ vật bằng primitive (`shadowAssets.ts`, 12 vật), bóng = cùng primitive tô tối ⇒ khớp outline, offline, **không cần art ngoài**. (Bản "con vật thật" clay-style là Tier 2 tùy chọn: sprite PNG + `<Image tintColor>`.)
> - ⏸ `maze`: đã cân nhắc BỎ (trùng `route_planner`).
> **Tổng: catalog 17 → 24 game (23 hiển thị + Xưởng luyện nét ẩn). 7 game mới đều verify xanh (contract .cjs riêng + variety-buckets toàn cục + eslint), không regression game cũ.**
> Mỗi game: `games/<name>Game.ts` + `renderers/<Name>Renderer.tsx` + `scripts/verify-explore-<name>-contracts.cjs` (200 seed×5 cấp + replay + capacity + tamper + support + chained-round + renderer contract) + npm `test:explore-<name>`.

---

## 5. VIỆC CẦN LÀM KÈM (đồng bộ tài liệu)

1. **Cập nhật `KIDO_EXPLORE_BRD.md`** từ 8 → 17 game (đính chính §0) + bổ sung game mới đã duyệt.
2. Mỗi game mới: thêm **construct + generator rule + validator + boundary test** (BRD §8.3) trước khi code.
3. Giữ **mọi bất biến BRD §17**: không reward, không history, no-stress, deterministic-first,
   reuse-first, offline-by-capability.
4. Không đổi `actionType` canonical hay taxonomy mà không cập nhật doc tương ứng (AGENTS.md).

---

## 6. TÀI LIỆU LIÊN QUAN

- `docs/KIDO_EXPLORE_BRD.md` (cần cập nhật), `mobile/src/explore/registry.ts`
- `docs/KIDO_TRIAL_2WEEKS.md` (gói học thử đi kèm)
- `docs/KIDO_MATH_SKILL_CATALOG_V2.md`, `docs/KIDO_VISUAL_ASSET_SYSTEM.md`
