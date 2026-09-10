# ROUTINE: Gen Vietnamese Seed (Tư Duy Ngôn Ngữ) — 1 tuần / lần chạy

> Prompt dán vào routine `/schedule` (Claude Code cloud agent). Sinh seed môn **Tư Duy Ngôn
> Ngữ** (`tieng_viet`) cho 48 tuần — mỗi tuần **2 ngày `D2` + `D5`**, mỗi ngày **8 activity**
> → **16 seed/tuần** → 768 seed. Rule chung: 1 buổi = 8 activity (AGENTS.md / AI_CONTEXT.md).
> Nguồn chân lý: [KIDO_LANG_CURRICULUM.md](../KIDO_LANG_CURRICULUM.md) (lộ trình) +
> [KIDO_LANG_SKILL_CATALOG.md](../KIDO_LANG_SKILL_CATALOG.md) (construct/anti-pattern).
> Đổi curriculum → sửa doc đó, prompt giữ nguyên.

> ⚠️ **PREREQUISITE — kiểm trước lần fire đầu, thiếu thì DỪNG và báo:**
> 1. `ActivitySeed.day` phải nhận `'D2' | 'D5'` (`kido-pipeline/src/types/seed.types.ts`) **và**
>    enum `day` trong `src/db/models/seed.model.ts` cũng phải có D2/D5 — thiếu một trong hai
>    thì import chết ở runtime dù TS compile qua.
> 2. ~~Skill 🔊 chỉ seed khi `audio_library` đã có clip~~ — **GỠ 2026-09-02.** Luật cũ này
>    sai hai lần: (a) seed chỉ là TEXT, không trỏ asset, nên audio chặn bước *generate* chứ
>    không chặn *seed* (`KIDO_LANG_CURRICULUM.md` §6.2); (b) `audio_library` được tạo LƯỜI
>    lúc generate (`getOrCreateLibraryClip`) — không có bộ clip nạp sẵn nào để chờ.
>    Thứ THẬT SỰ từng chặn `pho` là **dữ liệu ngữ âm**, và nó đã có:
>    **`kido-pipeline/src/curriculum/vi-phonetics.ts`** (kho từ + họ vần/âm đầu + bộ thanh +
>    validator từng skill). Skill 🔊 seed được từ Q2. Xem §7b bên dưới.
> 3. Ảnh: skill `voc`/`sem`/`lis`/`nar`/`syn`/`inf` cần asset có `viLabel` (tên tiếng Việt
>    DUY NHẤT). Chưa có `viLabel` → vẫn seed được (seed chỉ *mô tả*), nhưng ghi cờ.

---

Bạn là **content generator + pedagogical reviewer** cho app giáo dục mầm non Kido (trẻ **5–6
tuổi** Việt Nam). Nhiệm vụ: sinh seed môn Tư Duy Ngôn Ngữ, MỖI LẦN CHẠY sinh trọn **1 tuần
(cả D2 và D5)** rồi tự dừng.

**Môn này KHÔNG dạy mặt chữ.** Trẻ chưa biết đọc. Mọi bài đi qua **nghe – nhìn – chạm**.

## 0. ĐỌC BỐI CẢNH TRƯỚC (bắt buộc)

1. `docs/KIDO_LANG_CURRICULUM.md` — **§2** (phân vai D2/D5), **§3** (quý nào mở skill nào),
   **§4** (cấu trúc 8 activity + bảng difficulty theo quý), **§5** (spiral).
2. `docs/KIDO_LANG_SKILL_CATALOG.md` — **§0.6** (Language Signature Test), construct +
   anti-pattern từng skill (§1–§7).
3. `kido-pipeline/src/curriculum/lang-skill-catalog.ts` — bản code của construct/anti-pattern
   (nguồn chân lý cho reviewer; đọc để seed khớp thứ reviewer sẽ chấm).
3b. `kido-pipeline/src/curriculum/vi-phonetics.ts` — **BẮT BUỘC khi buổi D2 có skill `pho`**
   (Q2 trở đi). Kho từ + họ vần + họ âm đầu + bộ thanh + validator. Xem §7b.
4. `kido-pipeline/src/types/seed.types.ts` — interface `ActivitySeed` (kiểm `day` có D2/D5).
5. `docs/kido-activity-schema.ts` — payload từng actionType.
6. `docs/KIDO_SEED_AUTHORING.md` — quy tắc `questionCore` vs `answerSpec`, KHÔNG nhãn A/B/C.
7. `kido-pipeline/seeds/*-vi.json` đã có — biết tuần nào xong, tránh lặp vật, giữ mạch spiral
   (đọc `metadata.chosenSkills`).

## 1. XÁC ĐỊNH TUẦN CẦN LÀM

- Quét `kido-pipeline/seeds/` tìm file `w{WW}-vi.json` (hậu tố `-vi` để KHÔNG đè seed Toán
  `w{WW}.json` và seed tiếng Anh `w{WW}-en.json`). Chọn **tuần nhỏ nhất trong 1..48 CHƯA có**.
  Đó là `W`.
- Nếu đủ 48 tuần: in "✅ Đã đủ 48 tuần tiếng Việt" và DỪNG (nhắc user tắt routine).
- `quarter` = ceil(W/12). Ngày cố định: **`D2` và `D5`**. 2 ngày × 8 activity = **16 seed**.
- Không còn điều kiện dừng ở W12. Skill 🔊 từ Q2 lấy từ `vi-phonetics.ts` (§7b).

## 2. TRA SKILL ĐANG MỞ (§3 curriculum)

- Từ `quarter`, lấy **tập skill đã mở tính dồn** (Q1 → Q1; Q3 → Q1+Q2+Q3…). Skill đã mở
  **không bao giờ đóng**.
- Tách theo buổi: **D2** = `voc`/`lis`/`pho` · **D5** = `sem`/`nar`/`syn`/`inf`. KHÔNG trộn
  skill D5 vào D2 và ngược lại.
- Micro-skill: dùng đúng mức của quý hiện tại (§3). Skill cũ hạ về micro thấp hơn khi làm warmup.

## 3. CHỌN SKILL CHO 8 ACTIVITY MỖI BUỔI (§4)

- Mỗi buổi dùng **3–4 skill khác nhau**, mỗi skill **2–3 activity**. KHÔNG 8 activity cùng 1 skill.
  *(4 skill × 2 = 8 ✓ · 3 skill × (3+3+2) = 8 ✓)*
- **Spiral (§5) — luật hai tầng:**
  - Skill của **quý hiện tại + quý liền trước**: phải xuất hiện **≥1 lần / 4 tuần**.
  - Skill **cũ hơn**: **≥1 lần / 8 tuần** (vai `warmup` là đủ).
  - Đọc file 4–8 tuần gần nhất để biết skill nào "đến hạn" tái xuất hiện.
- Mỗi skill dùng đúng **actionType của nó** (tra catalog). Ghi vào `metadata.chosenSkills`.

## 4. CẤU TRÚC 1 BUỔI (8 activity)

- **difficulty**: `warmup×2` (idx 1–2), `core×4` (idx 3–6), `challenge×2` (idx 7–8).
  `activityIndex` 1..8 khó tăng dần.
- **Mức micro theo quý** (§4 curriculum — `difficulty` là VỊ TRÍ TRONG BÀI, không phải mức tuyệt đối):

  | Quý | warmup | core | challenge |
  |---|---|---|---|
  | Q1 | L1 skill đã dạy | L2 | L2 biến thể khó nhất / L3 cuối Q1 |
  | Q2 | L1–L2 (skill Q1) | L2–L3 | L3 |
  | Q3 | L2 (skill cũ) | L3 | L4 |
  | Q4 | L2–L3 (skill cũ) | L4 | L4–L5 |

  **Trẻ 5–6: `L1` KHÔNG bao giờ là `core`** — chỉ dùng làm warmup.
- **Đa dạng actionType:** ≥2 loại khác nhau mỗi buổi; KHÔNG lặp 1 loại quá **4/8**
  (sửa 2026-09-02: bản cũ ghi 5/8 nhưng validator `seed-week-validate.ts` chặn ở 4 —
  `MAX_SAME_ACTION`. Hai file `w01-vi`/`w02-vi` đang dính warning vì luật cũ.)
  **KHÔNG dùng `count_tap`/`compare_tap`** (hình dạng của Toán).

## 5. HỢP ĐỒNG MỖI SEED

```json
{
  "seedId": "SEED-tieng_viet-w{WW}-D2-{II}",  // WW & II 2 chữ số: w05, 01..08
  "week": 5, "day": "D2", "quarter": 1,
  "subject": "tieng_viet",
  "skillCode": "<lang_*, canonical — KHÔNG bịa>",
  "actionType": "<hợp lệ của skill>",
  "difficulty": "warmup",
  "activityIndex": 1,
  "questionCore": "<câu Đô Đô ĐỌC cho bé>",
  "answerSpec": "<spec dựng payload — KHÔNG đọc cho bé>"
}
```

> **`domainCode`: TUYỆT ĐỐI BỎ TRỐNG.** Môn ngôn ngữ có hệ domain riêng (`LangDomainCode`)
> KHÔNG thuộc union 13 domain Toán; `getDomainCode()` chỉ biết Toán. Đừng khai, đừng bịa
> `"pho"`/`"voc"` vào field này (chốt 2026-07-16 — xem curriculum §7).
>
> KHÔNG bịa field ngoài hợp đồng `ActivitySeed`.

## 6. questionCore vs answerSpec

- **`questionCore`** = câu Đô Đô đọc cho bé (TTS): ngắn, vui, ngôi "Bé"; KHÔNG liệt kê option;
  KHÔNG lộ đáp án; KHÔNG thuật ngữ học thuật ("âm vị", "lượng từ" → nói kiểu trò chơi).
- **`answerSpec`** = object cụ thể + đáp án đúng, dùng dựng payload. **Ghi đáp án bằng NỘI
  DUNG, KHÔNG dùng nhãn "A/B/C".** Grammar theo actionType:
  - `single_select`: `options: <mô tả vật>, <…>; đúng = <nội dung đáp án đúng>`
  - `multi_select`: `options: <…>; đúng = {<các đáp án đúng>}`
  - `match_pair`: `cặp đúng = <trái1>↔<phải1>, <trái2>↔<phải2> (mỗi trái khớp DUY NHẤT 1 phải)`
  - `sort_sequence`: `items (đúng thứ tự) = 1.<..> → 2.<..> → 3.<..>`
  - `audio_select`: `clip1 = <từ/âm>; clip2 = <từ/âm>[; clip3 = <từ/âm>]; đúng = <clip khớp câu hỏi>`
    — 2..3 clip, mỗi clip ≤4 từ. **Từ/âm MẪU đặt trong `questionCore`** (payload không có
    `promptAudio`), vd `questionCore` = "Từ nào vần với *lá* nhỉ?".

## 7. LANGUAGE SIGNATURE TEST (chất lượng cốt lõi — §0.6 catalog)

Môn Toán dùng Logic Signature Test ("không phải nhớ kiến thức"). **Môn này KHÔNG.** Với mỗi
seed, áp **ba** test — cả ba phải đúng:

1. **Ear Test** — trẻ chưa biết đọc chữ vẫn làm được; KHÔNG ký tự tiếng Việt nào trên màn hình.
2. **Mute Test (QUAN TRỌNG NHẤT)** — *tắt tiếng đi, bé có đoán được đáp án chỉ bằng nhìn ảnh
   không?* Nếu CÓ → bài đang đo thị giác, không đo ngôn ngữ → **hỏng, viết lại**.
   - Distractor phải chỉ khác nhau ở **NỘI DUNG NGÔN NGỮ** — KHÔNG khác màu / kích thước /
     hình dạng / phong cách vẽ.
   - *Ví dụ HỎNG:* "từ nào lạc nhóm" với 3 ảnh con vật màu xanh + 1 cái bàn màu đỏ → bé loại
     bằng màu. *Sửa:* cả 4 ảnh đồng nhất thị giác, chỉ khác **nghĩa của từ**.
   - **Miễn trừ** cho `lang_word_association`, `lang_part_whole`, `lang_story_sequence`: quan
     hệ nằm sẵn trong ảnh nên "giải được khi tắt tiếng" là BÌNH THƯỜNG. Với ba skill này chỉ
     cấm suy đáp án từ khớp màu/hình/kích thước hay ghép rìa hình.
3. **Age-Vocab Test (TRẦN)** — mọi từ nằm trong vốn từ trẻ **5–6 tuổi** Việt Nam.
4. **Toddler Test (SÀN)** — *"bé **3 tuổi** có làm đúng bài này không?"* Nếu **CÓ** →
   **quá dễ, viết lại**. Trẻ 5–6 đã có 2000+ từ; phân biệt mèo/chó/thỏ, to/nhỏ, chạy/ngủ
   là việc của tuổi lên 3.
   - *Ví dụ HỎNG (đã từng lọt):* `questionCore` "Bé chỉ giúp Đô Đô con mèo nào?" ·
     `answerSpec` "options: con mèo, con chó, con thỏ; đúng = con mèo".
   - *Sửa:* phân biệt tinh trong nhóm hẹp → "options: con bò, con bê, con trâu, con nghé;
     đúng = con bê"; hoặc cụm nhiều thành phần → "Con mèo đang ngủ **trên ghế** là con nào?"
   - Mỗi bài phải có ≥1 nguồn khó **RENDER ĐƯỢC** (xem test 5): **từ ít gặp** (phễu, cân,
     kìm) · **phân biệt tinh giữa các VẬT RIÊNG BIỆT cùng nhóm hẹp** (vịt/ngan/ngỗng;
     cà rốt/củ cải/su hào) · **động từ tinh cùng họ, mỗi option 1 tư thế** (bò/trườn/leo) ·
     **≥2 điều kiện hoặc có phủ định** (mỗi option vẫn là 1 vật đơn).
   - **`warmup` KHÔNG có nghĩa là dễ như tuổi lên 3** — chỉ là dễ hơn các bài khác trong
     cùng buổi.
   - **Ngoại lệ:** skill âm vị (`lang_syllable_count`, vần, âm đầu, thanh) không áp test này.
5. **Renderability Test (MỖI OPTION = MỘT VẬT ĐƠN) — chống lỗi ảnh gen tệ nhất:**
   Pipeline ảnh chỉ vẽ **nhất quán** được vật đơn trên nền trơn. Nếu option là **cảnh** hay
   **quan hệ vị trí**, generator gen mỗi option ra một bối cảnh khác → phá phép so sánh (bé
   thấy 4 diorama khác nhau thay vì so đúng thuộc tính đích).
   - ❌ "chó nằm ngoài cửa / chó nằm trong nhà / mèo nằm ngoài cửa" — cảnh (chó + cửa + vị trí).
   - ❌ "quyển sách dày / quyển sách mỏng" — thuộc tính liên tục, mỗi ảnh một góc, không so được.
   - ❌ "khúc suối nông / khúc suối sâu" — cảnh phong cảnh.
   - ✅ "con bò / con bê / con trâu / con nghé" — 4 vật đơn, render sạch, so được.
   - **Làm khó bằng CHỌN VẬT KHÁC** (từ tinh, nhóm hẹp), KHÔNG bằng cảnh/vị trí/thuộc-tính-liên-tục.
   - **Vị trí/quan hệ không gian → skill `lang_position_word` (HOÃN, cần pipeline compose).** Không nhét vào word_to_picture.
   - **`lang_antonym` KHÔNG dùng single_select ảnh** (đối cực là thuộc tính liên tục) → chuyển audio_select Q2+.

**CHỐNG BÁO NHẦM:** trẻ phải **NHỚ nghĩa từ / quy ước đời sống** là **ĐÚNG bản chất môn này**
— khác hẳn môn Toán. Bài "trời mưa → mặc áo mưa" **HỢP LỆ** ở `lang_story_causality` (dù bị
CẤM ở `math_logic_causality`). Đừng tự loại seed vì lý do "bé trả lời bằng cách nhớ".

**Ranh giới với môn Toán** (5 cặp dễ gán nhầm — §10 catalog): `lang_odd_word_out` (lạc theo
**nghĩa**, không phải thuộc tính thị giác) · `lang_story_causality` (quy ước đời sống, KHÔNG
phải domino đổ) · `lang_verbal_analogy` (quan hệ nghe mới ra) · `lang_position_word` (hiểu
**nghĩa của từ** chỉ vị trí) · `lang_story_sequence` (logic truyện, không phải to/nhỏ dần).

## 7b. SKILL ÂM VỊ `pho` — DÙNG `vi-phonetics.ts`, ĐỪNG TỰ ĐOÁN (Q2 trở đi)

Bài âm vị hỏng **im lặng**: nhìn seed thì hợp lý, nhưng nghe lên thì có hai đáp án đúng hoặc
không có đáp án nào. Vì vậy mọi từ dùng cho `pho` phải lấy từ
`kido-pipeline/src/curriculum/vi-phonetics.ts`, KHÔNG tự nghĩ ra.

**Điều dễ sai nhất — giọng Bắc trung hoà ba nhóm âm đầu:**

| Chữ viết | Nghe ra (giọng Bắc) |
|---|---|
| `d` · `gi` · `r` | cùng một âm `/z/` — "dao", "giày", "rắn" cùng âm đầu |
| `ch` · `tr` | cùng một âm — "chó", "trâu" cùng âm đầu |
| `s` · `x` | cùng một âm — "sao", "xe" cùng âm đầu |

Nhìn mặt chữ mà tưởng chúng khác nhau ⇒ bài `lang_onset_match` có **hai đáp án đúng**.
Module đã mã hoá việc này (`onsetSound`); cứ dùng validator thì không sập bẫy.

**Cách làm cho mỗi bài `pho`:**

1. Lấy từ bằng helper, không gõ tay: `rhymeFamilies()` / `onsetFamilies()` (mặc định chỉ trả
   họ có ≥3 từ) · `PHO_TONE_SETS` / `toneSetsWithAtLeast(n)` · `wordsBySyllableCount(n)`.
2. Dựng bài rồi **chạy validator tương ứng**, sửa đến khi trả về mảng rỗng:

   | Skill | Hàm |
   |---|---|
   | `lang_rhyme_match` | `validateRhymeExercise(sample, options, { level })` |
   | `lang_onset_match` | `validateOnsetExercise(sample, options, { level })` |
   | `lang_tone_discriminate` | `validateToneExercise(options, { level })` |
   | `lang_oral_blend` | `validateBlendExercise(answer, options, { level })` |
   | `lang_syllable_count` | `validateSyllableCountExercise(word, { level })` |

   Chọn `level` theo **mức micro của quý** (bảng §4), KHÔNG chỉ theo `difficulty`:

   | Quý | warmup | core | challenge |
   |---|---|---|---|
   | Q2 | easy | easy | hard |
   | Q3 | easy | hard | hard |
   | Q4 | easy | hard | hard |

   Lý do: `difficulty` là VỊ TRÍ TRONG BUỔI, không phải mức tuyệt đối. Một bài `core` ở
   tuần 41 đứng sau 40 tuần luyện âm vị, nên dùng vần gần giống (`ăn` với `anh`) ở đó là
   đúng lộ trình; cũng bài ấy ở tuần 14 thì quá sớm. Ghi rõ mức đã thẩm vào `answerSpec`.

   Mức `easy` chặn thêm: vần gần giống, cặp âm đầu `l`/`n`, cặp thanh `hỏi`/`ngã`, từ láy
   trong bài đếm tiếng.

   "Vần gần giống" bắt **hai trục**, đừng chỉ nghĩ tới trục thứ nhất: khác **âm cuối**
   (`an`/`ang`, `it`/`ich`) và khác **âm chính** (`ăn`/`ân` — khăn/cân · `ăt`/`ât` — mắt/mất ·
   `ôi`/`uôi` — đôi/đuôi · `o`/`ơ` — bò/bơ). Trục thứ hai thường khó nghe hơn trục thứ nhất.

   **Mảng rỗng = bài hợp lệ**, không có ngoại lệ. Riêng bài âm đầu, gọi thêm
   `onsetSpellingNotes(sample, options)` để ĐỌC (không phải để sửa): nó chỉ ra cặp từ khác mặt
   chữ nhưng cùng âm giọng Bắc — vd bài `chó` / `trăng` là HỢP LỆ dù nhìn chữ tưởng sai.

   Chạy nhanh một bài để kiểm:

   ```bash
   cd kido-pipeline && npx ts-node -e "import('./src/curriculum/vi-phonetics').then(m=>console.log(m.validateRhymeExercise('lá',['cá','bò'])))"
   ```

3. Ghi `answerSpec` theo grammar `audio_select` ở §6, dùng đúng những từ đã qua validator.

**Luật cứng:**

- Chỉ dùng từ có trong `PHO_WORDS` / `PHO_MULTI_SYLLABLE_WORDS`. Từ ngoài kho chưa được khảo
  sát nghĩa lẫn ngữ âm — validator sẽ chặn, và đó là cố ý.
- Bài vần: đúng **một** option cùng vần với từ mẫu, và **không** option nào cùng âm đầu với
  từ mẫu (nhiễu chéo sang skill âm đầu). Bài âm đầu: ngược lại.
- Bài thanh: mọi option **cùng âm đầu + cùng vần**, chỉ khác thanh, và mọi biến thể phải có
  nghĩa cụ thể — đó là lý do chỉ dùng `PHO_TONE_SETS` đã khảo sát tay, không tự ghép.
- Thiếu từ cho một họ vần/âm đầu → **bổ sung vào `vi-phonetics.ts` rồi chạy
  `npx vitest run src/curriculum/vi-phonetics.test.ts`**, đừng lách bằng từ bịa.

## 8. RÀNG BUỘC KHÁC

- **Anti-pattern từng skill:** đọc `lang-skill-catalog.ts` và tránh đúng thứ ghi ở đó —
  reviewer sẽ flag critical bằng chính nội dung này.
- **Object diversity:** trong 1 tuần không lặp 1 vật quá 2 lần (rule `SEED_OBJECT_DIVERSITY`).
- **Chủ đề** chỉ là hướng dẫn chọn vật cho sinh động (KHÔNG phải field, đừng khai).
- **KHÔNG seed:** `lang_word_match` (⛔ match_pair chưa mang audio), `lang_phoneme_delete`,
  `lang_synonym`, `lang_story_retell` (⏸ post-MVP), `lang_absurdity._explain_why`
  (⛔ đòi trẻ giải thích — không actionType nào thu được).
- `audio_select` chỉ cho `tieng_viet`/`tieng_anh`, ≤3 clip, clip ≤4 từ.

## 9. TỰ KIỂM trước khi ghi (seed nào fail → sinh lại)

- [ ] 16 seed: D2 idx 1..8 + D5 idx 1..8; mỗi buổi `warmup×2, core×4, challenge×2`.
- [ ] `subject: "tieng_viet"`, **`domainCode` KHÔNG xuất hiện**, `seedId` đúng format `D2`/`D5`.
- [ ] D2 chỉ dùng skill `voc`/`lis`/`pho`; D5 chỉ dùng `sem`/`nar`/`syn`/`inf`.
- [ ] Mỗi buổi 3–4 skill, mỗi skill 2–3 activity; ≥2 actionType; không `count_tap`/`compare_tap`.
- [ ] Skill ∈ tập đã mở của quý; micro đúng bảng §4; **L1 không làm core**.
- [ ] Spiral: skill đến hạn (4 tuần / 8 tuần) đã có mặt.
- [ ] **Mọi seed pass Ear + Mute + Age-Vocab + Toddler**; distractor sai vì lý do NGÔN NGỮ.
- [ ] **Đọc lại từng seed và tự hỏi "bé 3 tuổi có làm được không?"** — nếu có, viết lại.
- [ ] Không dính anti-pattern của skill; `answerSpec` đúng grammar; không nhãn A/B/C.
- [ ] Không seed skill ⛔/⏸.

## 10. GHI FILE

Ghi `kido-pipeline/seeds/w{WW}-vi.json`:

```json
{
  "metadata": {
    "subject": "tieng_viet", "week": 5, "quarter": 1, "days": ["D2", "D5"],
    "stage": "<Q1..Q4>",
    "totalSeeds": 16,
    "chosenSkills": ["<skill đã dùng>"],
    "generatedBy": "schedule-routine", "version": "lang-v1"
  },
  "seeds": [ /* 16 seed */ ]
}
```

Sau khi ghi: in tóm tắt (tuần, quý, skill mỗi buổi, phân bố actionType, skill spiral đã ôn).
KHÔNG import DB (bước riêng). DỪNG — lần chạy sau tự làm tuần kế tiếp.

---

## Ghi chú vận hành

- **Nhịp:** cần 48 lần fire (16 seed/lần → 768 seed).
- **Phụ thuộc:** không còn. Q1 không có skill 🔊; từ Q2 skill 🔊 lấy từ `vi-phonetics.ts`.
  Clip TTS sinh ở bước **generate**, không phải điều kiện của bước seed (curriculum §6.2).
- **Nguồn chân lý:** đổi lộ trình → sửa `KIDO_LANG_CURRICULUM.md`; đổi construct/anti-pattern
  → sửa **cả** `KIDO_LANG_SKILL_CATALOG.md` **lẫn** `lang-skill-catalog.ts` (reviewer đọc bản code).
- **Import:** `cd kido-pipeline && npm run import-seeds`.
