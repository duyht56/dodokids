# PROJECT KIDO — LANGUAGE SKILL CATALOG (Tư Duy Ngôn Ngữ)

- **Môn (SubjectCode):** `tieng_viet`
- **Độ tuổi:** **5–6** (Age 5–6 · School-readiness track) — chốt 2026-07-16, khớp
  `KIDO_MATH_SKILL_CATALOG_V2.md`. Không làm phân hệ 4–5. `L1` chỉ là vai warmup,
  không phải tầng nội dung — xem `KIDO_LANG_CURRICULUM.md` §4.
- **Trạng thái:** DRAFT — `audio_select` ĐÃ land (OpenSpec `add-audio-select-activity`, 2026-07-14); domain `pho` không còn bị chặn bởi contract (còn chặn bởi Bộ Từ Vựng Lõi, xem §8/§9)
- **Phiên bản:** 2026-07-16-lang-catalog-v1.1 (sửa sau review: đếm lại 33 skill,
  đồng bộ §8 với `audio_select` đã land, tách blocker ⛔ `lang_word_match`)

> Catalog này là nguồn chân lý **bộ skill + micro-skill** của môn Tư Duy Ngôn Ngữ,
> song song với `KIDO_MATH_SKILL_CATALOG_V2.md`. Nó dùng chung kiến trúc
> knowledge-graph và cùng vòng đời pipeline, nhưng có **tiêu chuẩn hợp lệ riêng**
> (§0.6) vì môn ngôn ngữ không thể thỏa Logic Signature Test của môn Toán.

---

## 0. QUY ƯỚC CHUẨN HÓA

### 0.1 Kiến trúc
`Domain → Skill → Micro Skill → Difficulty → actionType → Seed → Activity`

Giống hệt môn Toán. Không có bước nào mới trong pipeline.

### 0.2 Phạm vi — CHỐT 2026-07-10

Môn này **thuần nghe / nói / tư duy**. Quyết định phạm vi:

- **KHÔNG** dạy nhận diện mặt chữ (29 chữ cái).
- **KHÔNG** dạy ghép vần trên chữ viết, không đánh vần.
- **KHÔNG** hiển thị chữ tiếng Việt trên UI của trẻ, ở bất kỳ activity nào.
- **CÓ** dạy nhận thức âm vị (`pho`) hoàn toàn **bằng đường tai** — vần, âm đầu,
  thanh điệu, đếm tiếng, ghép âm bằng miệng (oral blending). Oral blending
  KHÔNG phải đánh vần: bé nghe `/b/` + `/àn/` (vần mang sẵn thanh) và chọn tiếng
  "bàn", không nhìn chữ.

Lý do giữ `pho` dù bỏ mặt chữ: nhận thức âm vị là dự báo mạnh nhất cho khả năng
đọc về sau, và nó là năng lực **nghe**, không phụ thuộc chữ viết. Bỏ nó thì môn
này rớt xuống thành "từ vựng + nghe hiểu".

### 0.3 Naming

- **`skillCode`** = `lang_<skill>`. Prefix `lang_` song song `math_`/`en_`, không đụng độ.
- **`domainCode`** = field metadata (giống môn Toán, KHÔNG nhét vào skillCode).
  7 mã: `pho voc sem lis nar syn inf`.
- **Catalog code = FILE RIÊNG, KHÔNG mở rộng `DomainCode` của Toán.**
  Đã implement tại `kido-pipeline/src/curriculum/lang-skill-catalog.ts` với type
  `LangDomainCode` riêng — theo đúng tiền lệ `english-skill-catalog.ts` ("Tách file
  riêng vì English KHÔNG dùng 13 math domain"). Tuy 7 mã này *không trùng* 13 mã toán
  (`num arith pat cls cmp seq geo spa mea log mtx prb exe`) nên nhét chung union
  *chạy* được, làm vậy sẽ trộn ba hệ domain khác bản chất vào một type và trái
  convention. `getDomainCode()` giữ nguyên chỉ-Toán; tra construct đa môn dùng
  `getSkillConstruct()` (Toán → Anh → Việt).
- **`microSkillCode`** = `skillCode` + `_<micro>` (vd `lang_rhyme_match_identify`).
- **`seedId`** = `SEED-tieng_viet-w<NN>-D<2|5>-<II>` — tiếng Việt học **D2 + D5**
  (chốt 2026-07-16; D1/D4 là Toán, D3 là tiếng Anh). Xem `KIDO_LANG_CURRICULUM.md`.
- **`lessonId`** = `w<NN>-d2-tieng_viet` / `w<NN>-d5-tieng_viet`.

### 0.4 actionType

Dùng 6 actionType MVP hiện có, **cộng thêm `audio_select` (đã land 2026-07-14)**:

| actionType | Vai trò trong môn ngôn ngữ |
|---|---|
| `single_select` | Chủ lực. Nghe câu hỏi → chọn 1 ảnh. |
| `multi_select` | Chọn tất cả vật thỏa mô tả nghe được. |
| `sort_sequence` | Xếp tranh theo chuỗi truyện; xếp ảnh theo trật tự câu. |
| `match_pair` | Nối từ ↔ ảnh, liên tưởng chức năng, bộ phận ↔ tổng thể. |
| `count_tap` | **Không dùng.** Không có vật để tap trong bài ngôn ngữ. |
| `compare_tap` | **Không dùng.** Đặc thù `math_compare_quantity`. |
| `audio_select` 🔊 | **ĐÃ LAND 2026-07-14** (OpenSpec `add-audio-select-activity`). Mỗi option là 1 clip audio (`audioRef`), 2–3 clip, chỉ `tieng_viet`/`tieng_anh`. Dùng cho các skill `pho` **đối chiếu âm thanh** (vần/âm đầu/thanh/ghép âm) + `lang_picture_to_word` — KHÔNG phải mọi skill `pho`: `lang_syllable_count` vẫn dùng `single_select` + thẻ số. Xem §8. |

Skill gắn cờ 🔊 dùng `audio_select` — actionType này **đã implement** (contract + validator + mobile + preview). Việc seed giờ chỉ còn chờ Bộ Từ Vựng Lõi (§8/§9), không còn bị chặn bởi contract.

### 0.5 Difficulty — L1..L5
`L1 Explore · L2 Practice · L3 Apply · L4 Challenge · L5 Master`.
Ánh xạ sang seed: `warmup` ≈ L1–L2 · `core` ≈ L3 · `challenge` ≈ L4–L5.

### 0.6 Nguyên tắc construct — LANGUAGE SIGNATURE TEST

Môn Toán yêu cầu trẻ giải được "bằng suy luận trên màn hình, không phải nhớ kiến
thức". Môn ngôn ngữ **không thể** thỏa điều đó: từ vựng về bản chất là quy ước
phải nhớ, và `math_logic_causality` còn cấm hẳn loại bài "mưa → áo mưa" mà ở đây
lại là bài nghe-hiểu hợp lệ. Vì vậy môn này dùng bộ ba test riêng. Cả ba phải
đúng thì seed mới hợp lệ.

**Test 1 — Ear Test.** Trẻ chưa biết đọc chữ vẫn làm được. Không có ký tự tiếng
Việt nào hiện trên màn hình trẻ.

**Test 2 — Mute Test (quan trọng nhất).** *Tắt tiếng đi, trẻ KHÔNG thể đoán ra
đáp án chỉ bằng nhìn ảnh.* Nếu đoán được, bài đang đo thị giác hoặc logic hình
học chứ không đo ngôn ngữ → **flag critical**.

> Ví dụ TRƯỢT Mute Test: bài "từ nào lạc nhóm" với 3 ảnh con vật màu xanh và 1
> ảnh cái bàn màu đỏ — bé loại cái bàn bằng màu, không cần nghe gì. Sửa: cả 4 ảnh
> đồng nhất về màu/kích thước/phong cách, chỉ khác ở **nghĩa của từ**.

**Ngoại lệ Mute Test — skill quan hệ ngữ nghĩa không có câu hỏi audio.** Ba skill
dùng `match_pair`/`sort_sequence` mà **quan hệ nằm sẵn trong ảnh**, không phụ
thuộc câu hỏi đọc lên: `lang_word_association`, `lang_part_whole`,
`lang_story_sequence`. Chúng "giải được khi tắt tiếng" theo nghĩa đen nhưng VẪN
hợp lệ, vì chất liệu tư duy là **quan hệ ngữ nghĩa/tự sự giữa các từ-vật**, không
phải thuộc tính thị giác (màu/cỡ/hình). Với nhóm này, Mute Test đổi thành: *tắt
tiếng, cặp/chuỗi đúng không được suy ra từ khớp màu/hình/kích thước hay ghép rìa
hình.* Rule review (`LANG_MUTE_TEST`) phải whitelist đúng ba skill này để không
flag oan; mọi skill còn lại vẫn theo Mute Test tuyệt đối ở trên.

**Test 3 — Age-Vocab Test (TRẦN).** Mọi từ dùng trong bài nằm trong Bộ Từ Vựng Lõi
đã duyệt (§9), không vượt quá vốn từ trẻ 5–6 tuổi Việt Nam.

**Test 4 — Toddler Test (SÀN).** *"Một bé **3 tuổi** có làm đúng bài này không?"*
Nếu **có** → bài quá dễ cho 5–6 → **flag `SEED_TOO_EASY` (critical)**.

> Test 3 chỉ chặn bài **quá khó**. Không có Test 4 thì bài **quá dễ** lọt hết — vì
> "mèo" cũng nằm trong vốn từ trẻ 5–6. Đây là lỗ hổng thật đã sinh ra seed hỏng:
> *"Bé chỉ giúp Đô Đô con mèo nào?" · options: mèo / chó / thỏ* — pass cả 3 test cũ,
> nhưng là bài của tuổi lên 3.

Trẻ 5–6 đã có **2000+ từ**. Bài phải có ít nhất **một** nguồn khó thật sự:

Trẻ 5–6 đã có **2000+ từ**. Bài phải có ít nhất **một** nguồn khó thật sự — và nguồn
khó đó phải **RENDER ĐƯỢC** (Test 5):

| Nguồn khó | Đạt | Không đạt |
|---|---|---|
| Từ ít gặp / mới học | phễu, cân, kìm, cối | mèo, chó, bàn, táo |
| Phân biệt **tinh** giữa các VẬT RIÊNG BIỆT, nhóm hẹp | bò/bê/trâu/nghé · vịt/ngan/ngỗng · cà rốt/củ cải/su hào | mèo/bàn/táo (nhóm xa) |
| Động từ tinh cùng họ, mỗi option 1 tư thế | bò/trườn/leo/nhảy lò cò · rót/đổ/khuấy | chạy–ngủ |
| Nhiều điều kiện (option vẫn là 1 vật đơn) | ≥2 điều kiện, hoặc có **phủ định** | 1 điều kiện đơn |

**Test 5 — Renderability Test (mỗi OPTION = MỘT VẬT ĐƠN).** Đây là **gốc rễ vụ ảnh gen
tệ** (review w01 2026-07-16). Pipeline ảnh chỉ vẽ **nhất quán** được vật đơn trên nền
trơn; nếu option là **cảnh** hoặc **quan hệ vị trí**, generator gen mỗi option ra một
bối cảnh khác → phá phép so sánh (bé thấy 4 diorama khác nhau, không so được thuộc tính đích).

| Nguồn khó BỊ CẤM (đòi cảnh, render không nhất quán) | Vì sao |
|---|---|
| Cụm quan hệ vị trí — "chó nằm **ngoài cửa** / **trong nhà**" | Mỗi option gen một cửa/nền khác; thuộc `lang_position_word` (hoãn) |
| Thuộc tính LIÊN TỤC — dày/mỏng, nông/sâu, cao/thấp | Mỗi ảnh một góc chụp, không so được; **và** nhìn là giải được (trượt Mute Test) |

→ Làm khó bằng **CHỌN VẬT KHÁC** (từ tinh, nhóm hẹp), KHÔNG bằng cảnh/vị trí/thuộc-tính-liên-tục.

**`warmup` ≠ dễ như tuổi lên 3.** `warmup` nghĩa là *dễ hơn các bài khác **trong cùng
buổi học***, không phải hạ xuống mức mầm non bé.

**Ngoại lệ Toddler Test:** skill **âm vị** (`lang_syllable_count`, vần, âm đầu, thanh)
không áp — tách âm tiết/vần là kỹ năng siêu ngôn ngữ khó với mọi lứa tuổi.

**Anti-pattern chung toàn môn:** distractor khác biệt về màu / kích thước / hình
dạng / phong cách vẽ. Distractor phải chỉ khác nhau ở **nội dung ngôn ngữ**.

### 0.7 Cờ trạng thái
`+` skill mới (toàn bộ catalog này là mới) · `⏸` post-MVP · `🔊` cần `audio_select`
(option audio, single-answer) · `⛔` chặn bởi mở rộng contract KHÁC ngoài
`audio_select` (vd `match_pair` có `audioRef` trên item).

---

## 1 · PHONOLOGICAL AWARENESS `pho`
*Nhận thức âm thanh của tiếng nói, tách rời khỏi nghĩa. Toàn bộ bằng đường tai.*

Đơn vị tự nhiên của tiếng Việt là **tiếng** (âm tiết), cấu trúc `âm đầu + vần +
thanh điệu`. Thanh điệu là đặc thù không có trong phonics tiếng Anh và phải được
dạy riêng.

- **`lang_syllable_count +`** — đếm số tiếng trong từ/cụm · `single_select`
  - Construct: tách dòng lời nói thành từng tiếng rời. Đáp án là **thẻ số**
    (tái dùng `number_card` trong Static Primitive Pack).
  - Anti-pattern: từ láy âm dễ nghe nhầm thành 1 tiếng ("lóng lánh"); ảnh minh
    họa vật gợi ý số lượng (2 con bướm cho "bươm bướm").
  - Micro: `_2syl` (L1) · `_3syl` (L2) · `_mixed` (L3)

- **`lang_rhyme_match + 🔊`** — tìm từ cùng vần · `audio_select`
  - Construct: so phần **vần** của tiếng, bỏ qua âm đầu và thanh điệu
    (cá / má / lá cùng vần `a`).
  - Anti-pattern: option cùng âm đầu với từ mẫu (bé bắt nhầm âm đầu); từ mẫu và
    đáp án là cùng một từ; vần gần giống (`an` vs `ang`) ở L1–L2.
  - Micro: `_identify` (L2) · `_odd_one_out` (L3)

- **`lang_onset_match + 🔊`** — tìm từ cùng âm đầu · `audio_select`
  - Construct: so **âm đầu** của tiếng (bà / bàn / bóng cùng `b`).
  - Anti-pattern: option cùng vần với từ mẫu (nhiễu chéo với `lang_rhyme_match`);
    âm đầu là cặp dễ lẫn theo phương ngữ (`l`/`n`, `tr`/`ch`, `s`/`x`) ở L1–L3.
  - Micro: `_identify` (L2) · `_odd_one_out` (L3)

- **`lang_tone_discriminate + 🔊`** — phân biệt thanh điệu · `audio_select`
  - Construct: cùng âm đầu + cùng vần, chỉ khác thanh — ví dụ **`cà`** (quả cà,
    thanh huyền) vs **`cá`** (con cá, thanh sắc). Đặc thù tiếng Việt, construct
    mạnh nhất của domain.
  - **Tiêu chí chọn từ (KHÔNG phải "một nghĩa").** Tiếng Việt đơn âm đồng âm tràn
    lan — `cà` còn là động từ và nằm trong loạt ghép (cà phê, cà rốt), `cá` còn
    nghĩa "cá cược" — nên đòi "một nghĩa" là bất khả thi. Yêu cầu thực tế: mỗi
    biến thể thanh phải có **một nghĩa danh từ cụ thể TRỘI rõ**, vẽ được, và được
    chốt bằng **`viLabel` duy nhất** (§9.1). Chính `viLabel` khử đồng âm, không
    phải bản thân từ.
  - Anti-pattern: cặp `hỏi`/`ngã` ở L1–L3 (nhiều phương ngữ không phân biệt);
    cặp thanh mà một trong hai không tạo thành từ có nghĩa/có ảnh minh họa.
    **TRÁNH bộ `ma/má/mà/mạ`** làm ví dụ: `mà` là liên từ không vẽ được, `má/mạ`
    đa nghĩa/lệ thuộc phương ngữ — vi phạm chính ràng buộc "mỗi biến thể phải là
    từ rõ nghĩa, minh họa được" ở §9.
  - Micro: `_2tone_far` (L3) · `_minimal_pair` (L4)
  - *Lưu ý: bộ tối thiểu 4 thanh mà cả 4 đều vẽ được rất hiếm — L4 nên dừng ở cặp
    2 thanh, chỉ mở 3–4 thanh khi §9 xác nhận đủ asset.*

- **`lang_oral_blend + 🔊`** — ghép âm bằng miệng thành tiếng · `audio_select`
  - Construct: nghe âm đầu + **phần vần MANG SẴN THANH** rời nhau → chọn audio
    tiếng đúng. Ví dụ `/b/` + `/àn/` (vần "an" thanh huyền) → "bàn". **Bằng tai,
    tuyệt đối không hiện chữ.**
  - Anti-pattern: tách thanh ra khỏi vần (`/b/` + `/an/` không thanh cho phép cả
    *ban/bàn/bán/bản/bãn/bạn* → đáp án không duy nhất); hiển thị bất kỳ ký tự
    nào; tách quá 2 phần (âm đầu + vần là tối đa ở tuổi này).
  - Micro: `_onset_rime` (L4)

- **`lang_phoneme_delete + ⏸`** — bỏ âm đầu rồi đọc phần còn lại (L5)
  - *Hoãn: quá tải nhận thức cho 5–6 tuổi, và giá trị chủ yếu ở giai đoạn đã
    biết đọc.*

---

## 2 · VOCABULARY `voc`
*Ánh xạ từ ↔ vật. Bề rộng vốn từ.*

- **`lang_word_to_picture +`** — nghe từ → chọn ảnh đúng · `single_select`
  - Construct: hiểu nghĩa quy chiếu của từ.
  - Anti-pattern: distractor không cùng trường nghĩa (nghe "con mèo", options là
    mèo / cái ghế / quả táo → bé loại bằng phỏng đoán thô). Distractor phải cùng
    nhóm ngữ nghĩa: mèo / chó / thỏ.
  - Micro: `_noun` (L1) · `_verb` (L2) · `_adjective` (L3)

- **`lang_picture_to_word + 🔊`** — nhìn ảnh → chọn từ nghe được · `audio_select`
  - Construct: chiều ngược của `lang_word_to_picture` — gọi tên vật.
  - Anti-pattern: vật có nhiều tên gọi hợp lệ ("gà" / "con gà" / "gà trống").
    Chỉ dùng asset có `viLabel` duy nhất (§9).
  - Micro: `_noun` (L2)

- **`lang_word_match + ⛔`** — nối từ ↔ ảnh, 3–4 cặp · `match_pair`
  - Construct: một cột là **từ (audio)**, một cột là ảnh; bé nối từng cặp.
  - **CHẶN bởi contract, KHÔNG phải audio_select.** `PairItem` chỉ mang `assetRef`
    (ảnh) — không có đường phát âm cho từng item cột trái, mà `audio_select` là
    single-answer nên cũng không dựng được tương tác nối nhiều cặp. Skill này cần
    **`match_pair` có `audioRef` trên item** (một mở rộng contract RIÊNG, ngoài
    phạm vi `audio_select`). Không seed cho tới khi có mở rộng đó.
  - Micro: `_noun_set` (L2) · `_verb_set` (L3)

- **`lang_action_word +`** — chọn tranh khớp động từ nghe được · `single_select`
  - Construct: động từ, không phải danh từ. Cùng một nhân vật ở cả 4 ảnh, chỉ
    khác **hành động** (Đô Đô đang chạy / nhảy / ngủ / ăn).
  - Anti-pattern: đổi nhân vật giữa các option → bé chọn bằng nhân vật.
  - Micro: `_verb_in_scene` (L3)

---

## 3 · SEMANTICS `sem`
*Quan hệ giữa các từ. Bề sâu vốn từ.*

- **`lang_antonym + 🔊`** — trái nghĩa · `audio_select` (**KHÔNG** single_select ảnh)
  - Construct: nghe từ mẫu + 2–3 clip từ → chọn từ ĐỐI CỰC trên cùng một chiều nghĩa
    (nghe "dày" → chọn clip "mỏng").
  - **Vì sao audio, không ảnh** (chốt 2026-07-16, sau review w01): đối cực gần như luôn là
    thuộc tính LIÊN TỤC của cùng một vật (dày/mỏng, nông/sâu). Vẽ bằng ảnh thì (1) nhìn là
    giải được, không cần hiểu từ → trượt Mute Test; (2) mỗi ảnh gen một góc/độ khác nhau →
    không so được. Nghe hai clip từ thì cả hai lỗi biến mất. Xem §0.6 Test 5.
  - Anti-pattern: cặp không thật sự đối cực (to ↔ dài); distractor không phải đối cực trên
    cùng chiều (dày ↔ đỏ). Clip ≤4 từ, 2–3 option.
  - Micro: `_adjective` (L2) · `_verb` (L3)
  - **Lịch:** Q2+ (cần `audio_library`), KHÔNG ở Q1 — xem `KIDO_LANG_CURRICULUM.md` §3.

- **`lang_category_member +`** — chọn TẤT CẢ thành viên của nhóm nghe được · `multi_select`
  - Construct: quan hệ thượng danh–hạ danh ("con vật" ⊃ mèo, gà, cá).
  - Anti-pattern: thiếu distractor **cận nhóm** (nghe "con vật" mà distractor là
    cái bàn thì quá dễ; phải có "cây" hoặc "búp bê hình thú").
  - Micro: `_basic` (L2) · `_subordinate` (L3)

- **`lang_odd_word_out +`** — từ lạc nhóm ngữ nghĩa · `single_select`
  - Construct: 4 ảnh **đồng nhất hoàn toàn về thị giác**, 1 từ lạc nhóm về nghĩa.
  - Anti-pattern: đây là skill dễ trượt Mute Test nhất trong catalog. Bất kỳ
    khác biệt màu / cỡ / phong cách nào giữa 4 ảnh đều là lỗi critical. Nhiều
    hơn 1 từ có thể coi là "lạc" cũng là lỗi.
  - Micro: `_category` (L2) · `_attribute` (L3)

- **`lang_word_association +`** — cái gì đi với cái gì · `match_pair`
  - Construct: liên tưởng chức năng (bàn chải ↔ kem đánh răng, chìa khóa ↔ ổ khóa).
  - Anti-pattern: cặp chỉ liên quan bằng màu sắc hoặc hình dạng.
  - Micro: `_functional` (L2) · `_thematic` (L3)

- **`lang_part_whole +`** — bộ phận ↔ tổng thể · `match_pair`
  - Construct: bánh xe ↔ ô tô, cánh ↔ chim, lá ↔ cây.
  - Anti-pattern: bộ phận nhận ra được chỉ nhờ ghép hình (thành bài `math_compose_shape`).
  - Micro: `_object` (L3)

- **`lang_verbal_analogy +`** — A với B như C với ? · `single_select`
  - Construct: quan hệ **ngữ nghĩa** nghe được ("chim với tổ như người với ?").
    Phân biệt với `math_logic_analogy` — bên đó quan hệ là thị giác.
  - Anti-pattern: quan hệ suy được từ hình ảnh mà không cần nghe.
  - Micro: `_semantic` (L4) · `_functional` (L5)

- **`lang_synonym + ⏸`** — đồng nghĩa (L5)
  - *Hoãn: trẻ 5–6 hiếm khi có hai từ đồng nghĩa cùng lúc trong vốn từ.*

---

## 4 · LISTENING COMPREHENSION `lis`
*Hiểu ngôn ngữ nói ở cấp câu và đoạn.*

- **`lang_follow_instruction +`** — chọn đúng TẬP vật theo chỉ dẫn · `multi_select`
  - Construct: giữ nhiều điều kiện trong trí nhớ làm việc rồi chọn đúng **tập**
    vật thỏa ("chạm tất cả con vật VÀ đồ ăn màu đỏ").
  - **Ràng buộc actionType:** `multi_select` chỉ validate *tập* đáp án, KHÔNG có
    thứ tự. Vì vậy độ đúng của bài phải nằm ở **chọn đúng tập theo điều kiện**, cấm
    ra bài mà đáp án phụ thuộc **trình tự** thao tác ("chạm mèo *rồi mới* chạm
    táo") — thứ tự không kiểm được, bé làm sai thứ tự vẫn được tính đúng. Bài cần
    thứ tự thật sự phải chuyển sang `sort_sequence` (xếp thẻ theo trình tự).
  - Anti-pattern: chỉ dẫn đoán được từ ảnh; đáp án phụ thuộc thứ tự (xem trên);
    số điều kiện vượt 3 (quá tải, thành bài đo working memory chứ không đo hiểu).
  - Micro: `_1cond` (L1) · `_2cond` (L2) · `_3cond` (L4)

- **`lang_listen_detail +`** — nghe đoạn ngắn → chọn chi tiết đúng · `single_select`
  - Construct: trích xuất một dữ kiện đã nói thẳng trong đoạn.
  - Anti-pattern: đoạn dài quá 3 câu; chi tiết hỏi nằm ở câu cuối (thành bài đo
    trí nhớ gần).
  - Micro: `_who_what` (L2) · `_where_when` (L3)

- **`lang_listen_inference +`** — suy ra điều KHÔNG nói thẳng · `single_select`
  - Construct: "Đô Đô cầm ô ra khỏi nhà. Trời thế nào?" — suy luận cầu nối.
    **Đây là chỗ quy ước đời sống HỢP LỆ**, khác hẳn `math_logic_causality`.
  - Anti-pattern: đáp án đã được nói thẳng (thành `lang_listen_detail`); suy luận
    cần kiến thức người lớn.
  - Micro: `_implied` (L4) · `_emotion` (L4)

- **`lang_riddle +`** — câu đố mô tả → đoán vật · `single_select`
  - Construct: gộp nhiều manh mối để thu hẹp về một vật ("có 4 chân, kêu meo meo").
    Thỏa Mute Test tuyệt đối vì ảnh không chứa manh mối nào.
  - Anti-pattern: một manh mối đã đủ loại hết distractor (không luyện được phép
    gộp); manh mối dựa trên đặc điểm không có trong ảnh.
  - Micro: `_2clue` (L3) · `_3clue` (L4)

---

## 5 · NARRATIVE `nar`
*Cấu trúc truyện: thứ tự, nhân quả, nhân vật.*

- **`lang_story_sequence +`** — xếp tranh theo chuỗi truyện · `sort_sequence`
  - Construct: suy thứ tự từ logic tình huống của truyện.
  - Anti-pattern: swap 2 tranh liền kề vẫn hợp lý (thứ tự không duy nhất); chuỗi
    suy được bằng kích thước tăng dần (thành `math_seriation_size`).
  - Micro: `_3panel` (L2) · `_4panel` (L3)

- **`lang_story_causality +`** — vì sao / chuyện gì xảy ra tiếp · `single_select`
  - Construct: nhân quả **theo quy ước đời sống và ý định nhân vật** (trời mưa →
    mặc áo mưa; làm đổ sữa → lau nhà). Đây là **điểm khác biệt cốt lõi** với
    `math_logic_causality`, vốn CẤM đúng loại bài này và chỉ nhận nhân quả vật lý.
  - Anti-pattern: hệ quả vật lý thuần túy (domino đổ) → đó là bài toán, không
    phải bài ngôn ngữ.
  - Micro: `_why` (L3) · `_what_next` (L3)

- **`lang_story_character +`** — ai làm gì, cảm xúc nhân vật · `single_select`
  - Construct: theo dõi tác nhân qua nhiều tranh; đọc cảm xúc từ tình huống
    (không phải từ nét mặt).
  - Anti-pattern: nét mặt nhân vật đã lộ cảm xúc → trượt Mute Test.
  - Micro: `_who` (L2) · `_emotion` (L3)

- **`lang_story_retell + ⏸`** — bé kể lại truyện (L5)
  - *Hoãn: cần thu âm giọng trẻ + ASR tiếng Việt, ngoài phạm vi pipeline hiện tại.*

---

## 6 · SYNTAX & MORPHOLOGY `syn`
*Cấu trúc câu và hình thái từ tiếng Việt.*

- **`lang_classifier +`** — lượng từ: con / cái / quả / chiếc / cây · `single_select`
  - Construct: chọn vật đi đúng với lượng từ nghe được. Đặc thù tiếng Việt, không
    có tương đương trong tiếng Anh.
  - **KHÔNG đánh đồng `con` = "vật sống".** `con` chủ yếu đi với động vật, nhưng
    tiếng Việt vẫn dùng `con` cho nhiều vật vô tri (con đường, con dao, con sông,
    con thuyền, con mắt), và nhiều thứ sống lại KHÔNG dùng `con` (cây, hoa, người
    → "cây/bông/người"). Vì `con` đa dụng, mỗi bài chỉ đối chiếu trong một **tập
    vật đã kiểm** để lượng từ đúng là DUY NHẤT — không suy từ quy tắc "sống/không
    sống".
  - Anti-pattern: vật nhận nhiều lượng từ hợp lệ (quả/trái; con đường/con lộ);
    distractor cũng nhận đúng lượng từ đang hỏi → đáp án không duy nhất; lượng từ
    hiếm (thửa, tấm, bức) ngoài vốn từ 5–6 tuổi.
  - Micro: `_animal_object` (L2) · `_extended` (L3)

- **`lang_position_word +`** — từ chỉ vị trí: trên/dưới/trong/ngoài/giữa · `single_select`
  - Construct: hiểu **từ** chỉ quan hệ không gian. Phân biệt với
    `math_spatial_position`: bên đó bé nhìn và so sánh vị trí; ở đây bé phải
    hiểu nghĩa của từ được đọc lên.
  - Anti-pattern: chỉ một option có vật ở vị trí bất thường → đoán được không cần nghe.
  - Micro: `_basic` (L2) · `_between` (L3)

- **`lang_word_order +`** — trật tự từ trong câu · `sort_sequence`
  - Construct: nghe câu → xếp các **thẻ ảnh** (không phải thẻ chữ) theo đúng trật
    tự chủ–vị–bổ ("Mèo · ăn · cá" ≠ "Cá · ăn · mèo").
  - Anti-pattern: đảo trật tự vẫn cho câu hợp lý; dùng thẻ chữ (vi phạm §0.2).
  - Micro: `_svo_3` (L3) · `_svo_4` (L4)

- **`lang_question_word +`** — ai / cái gì / ở đâu / khi nào · `single_select`
  - Construct: khớp loại từ để hỏi với loại câu trả lời (hỏi "ở đâu" → chọn ảnh
    địa điểm, không chọn ảnh người).
  - Anti-pattern: chỉ một option thuộc đúng phạm trù → không cần hiểu từ để hỏi.
  - Micro: `_who_what` (L3) · `_where_when` (L3)

---

## 7 · VERBAL REASONING `inf`
*Suy luận mà chất liệu là ngôn ngữ, không phải hình.*

- **`lang_elimination +`** — loại trừ bằng lời · `single_select`
  - Construct: gộp 2–3 mệnh đề phủ định/khẳng định để chốt một vật ("Không phải
    con mèo. Nó biết bay. Nó không có lông vũ.").
  - Anti-pattern: manh mối cuối đã đủ chốt đáp án (các manh mối trước thành thừa);
    trùng lặp với `lang_riddle` — ở đây phải có ít nhất một mệnh đề **phủ định**.
  - Micro: `_2clue` (L3) · `_3clue` (L4)

- **`lang_if_then +`** — áp dụng quy tắc "nếu… thì" cho sẵn · `single_select`
  - Construct: quy tắc được đọc lên (không hiện hình), bé áp dụng vào tình huống mới.
  - Anti-pattern: quy tắc trùng với quy ước đời sống bé đã biết → không cần nghe quy tắc.
  - Micro: `_given_rule` (L3)

- **`lang_absurdity +`** — phát hiện câu vô lý · `single_select`
  - Construct: nghe 3–4 câu, chỉ ra câu bất khả ("Con cá trèo lên cây").
    Chuẩn WPPSI, construct verbal-reasoning mạnh nhất của domain.
  - Anti-pattern: câu vô lý về mặt **thị giác** thay vì ngữ nghĩa; câu vô lý vì
    sai kiến thức khoa học chứ không sai logic đời thường.
  - Micro: `_spot` (L3) · `_explain_why` (L5) ⛔
  - **`_explain_why` KHÔNG dựng được với contract hiện tại**: micro này đòi trẻ *giải
    thích lý do*, nhưng mọi actionType đều là **chọn** — không có đường thu câu giải
    thích (giống ranh giới "không đo nói" của tiếng Anh). Chỉ seed `_spot`.

- **`lang_verbal_classification +`** — nghe 3 từ, tìm điểm chung, chọn từ thứ 4 cùng nhóm · `single_select`
  - Construct: quy nạp phạm trù từ các mẫu bằng lời rồi mở rộng.
  - Anti-pattern: 3 từ mẫu thuộc nhiều phạm trù chung cùng lúc → đáp án không duy nhất.
  - Micro: `_common_class` (L4) · `_abstract_class` (L5)

---

## 8 · `audio_select` — ĐÃ LAND (ref OpenSpec `add-audio-select-activity`, 2026-07-14)

> Contract đã hiện thực (types + `audio_library` + validator R22 + audio step + mobile + preview). Điểm chặn seed `pho` còn lại là **Bộ Từ Vựng Lõi** (§9), KHÔNG phải actionType.

Bốn skill `pho` **đối chiếu âm thanh** (`lang_rhyme_match`, `lang_onset_match`,
`lang_tone_discriminate`, `lang_oral_blend`) cùng `lang_picture_to_word` trả lời
bằng **clip âm thanh**, nên phải dùng `audio_select`. (`lang_syllable_count` KHÔNG
thuộc nhóm này — nó trả lời bằng thẻ số qua `single_select`.)

### 8.1 Shape THẬT (nguồn: `docs/kido-activity-schema.ts` — không phải đề xuất)

```ts
// Con trỏ tới 1 clip audio — mirror AssetReference.
// type='library'  → tra audio_library theo word-key ASCII bỏ dấu ("con-ca"),
//                   tái dùng, usageCount++ (mặc định cho TỪ THẬT)
// type='activity' → clip đặc thù (âm vị /b/, câu hội thoại), không tái dùng
export interface AudioReference {
  type: 'library' | 'activity'
  audioId: string
  altTextVi: string
  transcript?: string           // strip trước publish
}

export interface AudioOptionCard {
  optionId: string              // "opt_1" | "opt_2" | "opt_3"
  audioRef: AudioReference
  altTextVi: string             // ≤4 từ
}

export interface AudioSelectPayload {
  promptImage?: AssetReference  // Scaffold thị giác TÙY CHỌN (thường bỏ trống)
  options: AudioOptionCard[]    // 2..3 clip
  correctAnswer: string         // optionId
}
```

**Khác biệt phải nhớ so với các actionType chọn-ảnh:** option KHÔNG có `isCorrect`
(chỉ `correctAnswer`), KHÔNG có `layout`, `optionId` là `opt_1..opt_3` (không phải
`opt_A`), và **KHÔNG có `promptAudio`** — từ/âm mẫu phải nằm trong
`audioScript.question` để TTS đọc lên (vd "Từ nào vần với *lá*?"). Guardrail đã
enforce: ≤3 option, mỗi clip ≤4 từ, chỉ `tieng_viet`/`tieng_anh`.

### 8.2 `answerSpec` — format canonical (đã có trong `KIDO_SEED_AUTHORING.md`)

```text
"clip1 = <từ/âm>; clip2 = <từ/âm>[; clip3 = <từ/âm>]; đúng = <clip khớp câu hỏi>"
```

Ví dụ hợp lệ cho `lang_rhyme_match`:
`"clip1 = cá; clip2 = bò; clip3 = gấu; đúng = cá"`, với `questionCore` = "Từ nào
vần với *lá*?" — **từ mẫu nằm ở câu hỏi, không ở payload** (không có `promptAudio`).

**Lưu ý reviewer:** mọi distractor phải khác vần với từ mẫu — nếu để `gà` làm
distractor cho mẫu `lá` thì `gà` cũng vần `a`, bài có 2 đáp án đúng. Tương tự với
âm đầu và thanh điệu.

### 8.3 Còn chặn: `match_pair` không mang audio

`PairItem` vẫn chỉ có `{ itemId, assetRef }` — **không có `audioRef`**, và
`audio_select` là single-answer nên không dựng được tương tác nối nhiều cặp. Vì
vậy `lang_word_match` (⛔) vẫn chưa seed được: cần một mở rộng contract RIÊNG cho
`match_pair`, không gộp vào `add-audio-select-activity` (đã archive 2026-07-15).

---

## 9 · YÊU CẦU ASSET

### 9.1 `viLabel` — ĐÃ LAND 2026-07-16

`LibraryAsset.attributes.object` là tiếng Anh (`"cat"`, `"apple"`). Bài gọi tên và
bài âm vị phụ thuộc vào **tên tiếng Việt canonical** của vật: ảnh con gà không được
lúc gọi "gà", lúc "con gà trống" — nếu không, `lang_syllable_count` đếm ra 1 vs 2
tiếng và `lang_rhyme_match` so vần của "con" thay vì "gà".

```ts
attributes: {
  // ...
  viLabel?: string  // "mèo" | "táo" | "bàn" — danh từ TRẦN, viết thường.
}
```

**Optional ở tầng type — có chủ ý.** Đặt `required` sẽ phá *mọi* nơi tạo
`LibraryAsset['attributes']` (kể cả `FindOrCreateAssetInput` dùng chung của môn Toán).
Ràng buộc enforce ở **tầng pipeline**, không ở tầng type.

**AUTHORING-ONLY.** Publish KHÔNG mang `attributes` sang `kido-server` (đã kiểm:
`src/publish/` không đụng field này), và `LibraryAsset` bên server là bản mirror
**không module nào dùng**. Vì vậy `viLabel` **chỉ thêm ở `docs/kido-activity-schema.ts`
(canonical) + `kido-pipeline`** — cố ý KHÔNG thêm vào `kido-server`.

**Đã land:**

| Nơi | Việc |
|---|---|
| `docs/kido-activity-schema.ts` | `viLabel?` trong `LibraryAsset.attributes` (canonical) |
| `kido-pipeline/src/types/activity.types.ts` | mirror |
| `kido-pipeline/src/db/models/asset.model.ts` | Mongoose prop, `default: null` |
| `kido-pipeline/src/curriculum/vi-label.ts` | `validateViLabel` · `viLabelFor` · `hasUsableViLabel` · map ~90 object EN→VI · `VI_REGIONAL_VARIANTS` |
| `kido-pipeline/src/scripts/backfill-vi-labels.ts` | backfill có `--dry-run`; bỏ qua primitive; **không đoán** — object chưa có nhãn thì báo ra |
| `vi-label.test.ts` | 14 test, gồm test tự kiểm chính map |

**Quy tắc đặt nhãn (enforce bằng `validateViLabel`):** danh từ **trần**, viết thường,
không chữ số, ≤3 tiếng, và **không kèm lượng từ** khi lượng từ đứng trước danh từ khác
("con mèo" ✗, "ngôi sao" ✗ → dùng `sao`). Label **một tiếng** luôn hợp lệ kể cả khi trùng
mặt chữ với lượng từ (`cây` = cái cây ✓, `ô` = cái ô ✓). Lượng từ — nếu là nội dung bài
(`lang_classifier`) — ghép ở `questionCore`, KHÔNG ở nhãn.

**Asset CỐ Ý không có `viLabel`** (`viLabelSkipReason()` — tách khỏi "chưa soạn nhãn" để
danh sách việc-cần-làm không bị nhiễu):

- **`category: 'character'`** — mascot (Đô Đô, Mimi) là **danh từ riêng**: viết hoa (trái quy
  tắc viết thường) và KHÔNG thuộc vốn từ chung. Dùng mascot trong bài vần/âm đầu là sai — trẻ
  chưa chắc biết tên, và tên riêng không dạy được ngữ âm. Mascot xuất hiện trong tranh truyện
  (`nar`) qua `promptImage`, không cần nhãn để đọc. Bắt theo **category**, không theo danh sách
  tên, nên mascot mới thêm cũng tự được bỏ qua.
- **Ảnh gộp** (`plate_apples_many`/`_few`) — dựng cho bài so sánh số lượng môn Toán; không phải
  MỘT vật nên không có danh từ trần nào đúng.

**Nhãn trùng nhau** giữa hai object code là hợp lệ khi chúng là cùng một vật
(`VI_LABEL_SYNONYMS`, vd `airplane`/`plane` — drift trong asset library). Quy tắc "DUY NHẤT"
là *mỗi asset đúng MỘT tên*, KHÔNG phải *mỗi tên đúng một asset* — nhiều ảnh mèo cùng mang
nhãn `mèo` là bình thường.

**Phương ngữ: CHỐT MIỀN BẮC** (2026-07-16). Mọi nhãn dùng biến thể miền Bắc (chuẩn sách giáo
khoa): `lợn` (không "heo") · `ngô` (không "bắp") · `dứa` (không "thơm/khóm") · `bát` (không
"chén") · `thìa` (không "muỗng") · `ô` (không "dù") · `mũ` (không "nón") · `tất` (không "vớ") ·
`dưa chuột` (không "dưa leo").

Đây KHÔNG phải chi tiết văn phong: hai biến thể khác cả **vần** lẫn **số tiếng** (`lợn` vần
`ơn` vs `heo` vần `eo`) ⇒ cho **đáp án khác nhau** ở `lang_rhyme_match`, `lang_onset_match`,
`lang_syllable_count`. Đổi sau khi đã seed `pho` ⇒ phải **audit lại toàn bộ seed `pho`**.
Khoá bằng test trong `vi-label.test.ts`; `backfill-vi-labels.ts` in `regionalVariantsUsed` mỗi lần chạy.

> ⚠️ **Chưa xử lý — giọng TTS.** `config.models.ttsVoice` là voice prebuilt của Gemini
> (`Sulafat`); tên voice **không mã hoá phương ngữ** nên không enforce được bằng config.
> **Phải NGHE để xác nhận giọng đọc là Bắc** khi dựng `audio_library` (curriculum §6.2 bước 4)
> — nhãn Bắc + giọng Nam sẽ làm bài âm vị lệch.

> **`viLabel` KHÔNG chặn bước SEED** — seed chỉ là text (`questionCore`/`answerSpec`), không
> trỏ asset. Nó chặn bước **GENERATE** (dựng payload + chọn/gen ảnh).

### 9.2 Bộ Từ Vựng Lõi

Static Primitive Pack (~337 SVG hình học + thẻ số) **gần như không tái dùng được**
cho môn này. Ngoại lệ duy nhất: `number_card` dùng làm option cho
`lang_syllable_count`.

**Tách bạch hai thứ (đừng gộp — chúng có chi phí và tiến độ khác hẳn nhau):**

| | Cần cho | Chi phí |
|---|---|---|
| **(A) Danh sách từ + chú giải ngữ âm** (vần / âm đầu / thanh) ✅ **XONG 2026-09-02** (`vi-phonetics.ts`) + clip `audio_library` (TTS, sinh lười lúc generate) | domain **`pho`** | Rẻ — dữ liệu ngôn ngữ + TTS |
| **(B) Bộ ẢNH có `viLabel`** | `voc` `sem` `lis` `nar` `syn` `inf` | Đắt — gen ảnh |

> **`pho` KHÔNG cần (B).** Spec `audio-select-activity` cấm `assetRef` trên option — bài
> `pho` không hiển thị thẻ ảnh nào; option chỉ là clip audio. (`promptImage` vẫn hợp lệ ở
> từng bài, nhưng không phải điều kiện tiên quyết của cả domain.) Vì bé không thấy ảnh
> option, tiêu chí chọn từ cho `pho` là **"từ có nghĩa cụ thể trẻ 5–6 đã biết"**, KHÔNG
> phải "vẽ được".

Phần (B) cần một bộ **200–300 danh từ/động từ/tính từ cụ thể**, gen mới, mỗi asset
có `viLabel` duy nhất. Phần (A) cần danh sách từ phủ đủ:

- Các vần thông dụng, mỗi vần ≥3 từ trẻ 5–6 biết nghĩa (cho `lang_rhyme_match`).
- Các âm đầu thông dụng, mỗi âm ≥3 từ (cho `lang_onset_match`).
- Các bộ khác thanh mà **mọi biến thể đều có nghĩa cụ thể TRỘI rõ, trẻ 5–6 đã
  biết** (vd cặp `cà`/`cá`) — rất hiếm khi đủ 3–4 thanh; đây là ràng buộc chặt
  nhất. Tiêu chí KHÔNG phải "một nghĩa" (đơn âm tiếng Việt đồng âm tràn lan — xem
  §1), cũng KHÔNG phải "vẽ được" (bài `pho` không hiển thị ảnh option). Loại khi
  biến thể **không có nghĩa cụ thể nào trẻ nắm được**: `ma/má/mà/mạ` hỏng vì `mà`
  là liên từ. Khảo sát nguồn từ trước khi seed `lang_tone_discriminate`; nếu không
  đủ, giới hạn cặp 2 thanh.
- Đủ độ dài 1/2/3 tiếng (cho `lang_syllable_count`).

Cả (A) và (B) nên là **epic riêng**. Thứ tự: **(B) chặn Q1** của
`KIDO_LANG_CURRICULUM.md` (Q1 toàn skill dựa ảnh), còn **(A) chỉ chặn `pho` từ Q2**
— nên Q1 seed được TRƯỚC khi có (A). Xem §6 của curriculum.

> ✅ **(A) ĐÃ LAND 2026-09-02** — `kido-pipeline/src/curriculum/vi-phonetics.ts`
> (+ `vi-phonetics.test.ts`). Nội dung: kho từ một tiếng có `gloss` là nghĩa cụ thể trẻ 5–6
> nắm (tiêu chí của §9.2 này, KHÔNG phải "vẽ được"), họ vần và họ âm đầu đều ≥3 từ, bảng từ
> 2–3 tiếng cho `lang_syllable_count` kèm cờ **từ láy** (bẫy của anti-pattern), và bộ khác
> thanh **khảo sát tay** — đúng như đoạn trên cảnh báo, rất ít bộ đủ 3 thanh mà mọi biến thể
> đều có nghĩa trội, nên bộ nào có một biến thể là hư từ thì cả bộ bị loại.
>
> Module cũng mã hoá **trung hoà âm đầu giọng Bắc** (`d`/`gi`/`r` → `/z/`, `ch`/`tr`, `s`/`x`):
> `lang_onset_match` so bằng ÂM NGHE ĐƯỢC chứ không bằng con chữ. Kèm validator từng skill trả
> về danh sách lỗi, và `auditPhoInventory()` tự kiểm chính kho từ — nó đã bắt hai bộ thanh sai
> của bản nháp đầu (`mắt`/`mất` và `to`/`tổ` khác VẦN chứ không khác thanh).

---

## 10 · DEDUP VỚI MÔN TOÁN

Năm cặp skill dùng chung ảnh nhưng khác construct. Reviewer phải phân biệt được,
nếu không seed sẽ bị gán nhầm subject.

| Skill ngôn ngữ | Skill toán | Ranh giới |
|---|---|---|
| `lang_odd_word_out` | `math_odd_one_out` | Toán: lạc theo thuộc tính **thị giác**. Ngôn ngữ: lạc theo **nghĩa của từ**, 4 ảnh đồng nhất thị giác. |
| `lang_story_causality` | `math_logic_causality` | Toán: nhân quả **vật lý** (domino đổ). Ngôn ngữ: quy ước đời sống + ý định nhân vật (mưa → áo mưa). Hai bên **loại trừ nhau**. |
| `lang_verbal_analogy` | `math_logic_analogy` | Toán: quan hệ thị giác. Ngôn ngữ: quan hệ ngữ nghĩa, nghe mới ra. |
| `lang_position_word` | `math_spatial_position` | Toán: so sánh vị trí bằng mắt. Ngôn ngữ: hiểu **nghĩa của từ** chỉ vị trí. |
| `lang_story_sequence` | `math_seriation_size` | Toán: thứ tự theo một chiều đo đơn điệu. Ngôn ngữ: thứ tự theo logic truyện. |

Trong cả năm cặp, **Mute Test là dao mổ**: nếu tắt tiếng mà vẫn giải được thì đó
là bài toán, không phải bài ngôn ngữ.

---

## 11 · TRẠNG THÁI & VIỆC CẦN LÀM

**Tổng: 33 skill · 7 domain.** Chưa skill nào có seed.

Số skill mỗi domain (§1–§7): `pho` 6 · `voc` 4 · `sem` 7 · `lis` 4 · `nar` 4 ·
`syn` 4 · `inf` 4 = **33**.

| Trạng thái | Số | Skill |
|---|---|---|
| **Contract sẵn sàng — không cần audio** | **23** | `pho`: `lang_syllable_count` (1) · `voc`: `lang_word_to_picture`, `lang_action_word` (2) · `sem`: trừ `lang_synonym` ⏸ VÀ `lang_antonym` 🔊 (5) · `lis`: cả 4 (4) · `nar`: tất cả trừ `lang_story_retell` (3) · `syn`: cả 4 (4) · `inf`: cả 4 (4) |
| **Contract sẵn sàng — dùng `audio_select` 🔊** (đã land 2026-07-14; chỉ còn chờ Bộ Từ Vựng Lõi + `audio_library`) | 6 | `lang_rhyme_match`, `lang_onset_match`, `lang_tone_discriminate`, `lang_oral_blend`, `lang_picture_to_word`, **`lang_antonym`** (đối cực → nghe, không vẽ; xem §0.6 Test 5) |
| Chặn bởi contract khác ⛔ | 1 | `lang_word_match` (cần `match_pair` có `audioRef` trên item — xem §8.3) |
| Post-MVP ⏸ | 3 | `lang_phoneme_delete`, `lang_synonym`, `lang_story_retell` |

Kiểm: 23 + 6 + 1 + 3 = 33. ✓ → **29/33 skill đã sẵn contract** (không đổi — `lang_antonym`
chuyển từ nhóm không-audio sang nhóm audio 2026-07-16, vẫn sẵn contract); chỉ 1 skill còn
chờ mở rộng contract, 3 skill hoãn.

Thứ tự triển khai đề xuất:

1. ~~**Nạp Construct + Anti-pattern** vào `SEED_SKILL_MATCH` + Language Signature
   Test~~ — **XONG 2026-07-16.** `lang-skill-catalog.ts` (33 skill, `LangDomainCode`
   riêng) → nối vào `getSkillConstruct()`; `signatureTestLines()` trong
   `seed-review.prompts.ts` swap Logic → **Language Signature Test** cho `lang_*`
   (Ear/Mute/Age-Vocab + câu chống báo nhầm "nhớ nghĩa từ là ĐÚNG bản chất môn");
   `muteTestExempt` bơm bản Mute Test miễn trừ cho 3 skill ở §0.6; `sort_sequence`
   định tuyến sang rubric `LANG_GRAMMAR_ORDER`/`LANG_STORY_ORDER` thay vì
   `SEQ_CAUSAL_CHAIN` của Toán. Khoá bằng `seed-review.lang.test.ts` (8 test).
   *Ghi chú:* Mute Test được nhúng TRONG `SEED_SKILL_MATCH` (nơi Logic Signature Test
   vốn nằm), không tách thành rule `LANG_MUTE_TEST` riêng — cùng hiệu lực critical,
   ít lệch khỏi cấu trúc prompt hiện có.
2. **Thêm `viLabel`** (optional) vào `LibraryAsset` + backfill asset sẽ tái dùng
   cho môn ngôn ngữ. Rẻ, không chặn ai (xem §9.1 về blast radius).
3. **Seed 24 skill không cần audio** — chứng minh môn ngôn ngữ chạy được end-to-end
   trên pipeline hiện tại, không đổi gì.
4. **Dựng Bộ Từ Vựng Lõi** (200–300 từ) + nạp `audio_library`. Epic riêng — đây là
   thứ DUY NHẤT còn chặn 5 skill 🔊 (contract đã xong).
5. **(Sau, nếu cần)** mở rộng `match_pair` mang `audioRef` trên item — mở khóa
   `lang_word_match` (⛔). Change RIÊNG, không gộp với `add-audio-select-activity`
   (đã archive).
