# KIDO EXPLORE — THUMBNAIL PROMPT PACK

- **Version:** 1.1
- **Updated:** 2026-10-05
- **Output:** square thumbnails for the Kido Explore catalog — §5–§8 delivered
  2026-10-05 (`number-bus`, `spin-pattern`, `number-chain`, `ordinal-position`)
- **Recommended size:** generate 1024 × 1024 px, 1:1; ship a 512 × 512 PNG
  without alpha in `mobile/src/assets/images/explore/`

## Shared art direction

All thumbnails belong to one visual family:

- 3D clay render illustration.
- Smooth, rounded shapes with soft highlights.
- Muted, desaturated pastel background.
- Vibrant child-friendly subjects with strong foreground/background contrast.
- One clear visual idea per thumbnail.
- Centered composition with generous safe margins.
- Slightly elevated 3/4 camera angle.
- Clear silhouette and readable at small mobile thumbnail size.
- Gentle contact shadows; no harsh lighting.
- No frame, no app UI, no button, no badge. Đô Đô appears only where the game
  title names Đô Đô (`stack_tower`, `route_planner`).
- No words, title, logo or watermark.
- One flat pastel background from edge to edge — no gradient, no vignette, no
  rounded-square tile. (The 2026-08 batch was cut from one 3×3 sheet and kept a
  faint tile edge; do not copy it.) Matte handmade plasticine texture and
  medium-soft pastels (#BADBF0, #BCE7D4, #E2C3E3, #FEE9AC, #FED2D7 in that
  batch) match the current set better than near-white backgrounds.
- The catalog crops every thumbnail to a **circle** (108 pt on phones,
  `thumbnailFrame` in `ExploreCatalogScreen.tsx`): keep every important element
  inside the central circle (~75% of the frame); corners are plain background.

The prompts below are self-contained and can be copied independently.

---

## 1. Xưởng luyện nét

**File suggestion:** `explore-tracing-workshop.png`

```text
A playful preschool tracing workshop represented by one large chunky yellow clay pencil following a wide dotted path across a cream practice card; the path begins as a simple curved line, flows into the outline of a friendly uppercase letter A, and ends as the outline of the numeral 3; show only these two exact practice symbols and keep them large and unmistakable; add three small colorful guide dots and a subtle glowing start point to communicate tracing direction; 3D clay render illustration, smooth rounded surfaces, soft highlights, gentle contact shadows, centered composition, slightly elevated 3/4 camera angle, very pale peach background (#FFF7F2), vibrant child-friendly colors, simple uncluttered scene, generous safe margins, strong readable silhouette at small mobile thumbnail size, preschool educational app thumbnail, square 1:1 framing, no hands, no extra letters or numbers, no words, no title, no logo, no watermark, no border, no app UI, high quality, clean and playful
```

**Ý nghĩa hình ảnh:** bút chì + đường nét + một chữ và một số, thể hiện đầy đủ
tracing line/letter/number nhưng không biến thumbnail thành trang tập viết.

---

## 2. Khám phá số

**File suggestion:** `explore-number-discovery.png`

```text
Three large freestanding clay number blocks showing the exact Arabic numerals 1, 2, and 3 in correct ascending order, arranged like friendly stepping stones; the number 2 is slightly raised with a soft warm glow to suggest discovery and recognition, while all three numerals remain equally clear and correctly formed; add two tiny round counting beads near the base as a subtle number-sense detail; 3D clay render illustration, smooth rounded surfaces with soft highlights, gentle contact shadows, centered composition, slightly elevated 3/4 camera angle, very pale mint background (#F2FAF6), vibrant coral, sky blue, and sunny yellow number blocks, minimal uncluttered scene, generous safe margins, strong readability at small mobile thumbnail size, preschool educational app thumbnail, square 1:1 framing, no extra numerals, no mathematical operators, no words, no title, no logo, no watermark, no border, no app UI, high quality, clean and playful
```

**Ý nghĩa hình ảnh:** nhận diện số và thứ tự số; không mô tả phép tính.

---

## 3. Tìm quy luật

**File suggestion:** `explore-patterns.png`

```text
A clean clay pattern puzzle laid out from left to right using large simple tokens: red circle, blue star, red circle, blue star, followed by one empty softly glowing rounded slot; place one blue star tile hovering directly above the empty slot as the obvious piece ready to complete the repeating AB pattern; every token must keep the exact same size and spacing, and the pattern must be visually unambiguous; 3D clay render illustration, smooth rounded surfaces, soft highlights, gentle contact shadows, centered horizontal composition, slightly elevated 3/4 camera angle, very pale mint background (#F2FAF6), vibrant coral red and sky blue tokens, minimal uncluttered scene, generous safe margins, strong readability at small mobile thumbnail size, preschool educational app thumbnail, square 1:1 framing, no question mark, no letters, no numerals, no words, no title, no logo, no watermark, no border, no app UI, high quality, clean and playful
```

**Ý nghĩa hình ảnh:** quy luật AB rõ ràng và một mảnh đang chờ được đặt vào ô
trống.

---

## 4. Lật thẻ tìm cặp

**File suggestion:** `explore-memory-match.png`

```text
A preschool memory matching game made from six chunky rounded clay cards arranged in a neat 2-by-3 grid; exactly two face-up cards show the same single red apple icon and form the matching pair, while the other four cards are face-down with identical soft lavender backs and one simple embossed circle motif; one face-down card is slightly tilted upward as if it has just been flipped; 3D clay render illustration, smooth rounded surfaces, soft highlights, gentle contact shadows, centered composition, slightly elevated 3/4 camera angle, very pale pink background (#FFF5F7), vibrant child-friendly colors, clean uncluttered scene, generous safe margins, strong readability at small mobile thumbnail size, preschool educational app thumbnail, square 1:1 framing, exactly six cards, no hands, no extra icons, no words, no title, no logo, no watermark, no border, no app UI, high quality, clean and playful
```

**Ý nghĩa hình ảnh:** hai thẻ giống nhau đã mở, các thẻ còn lại úp xuống, thể
hiện đúng memory matching mà không tạo cảm giác thắng/thưởng.

---

## 5. Xe buýt hai tầng

**File:** `number-bus.png` (đã giao 2026-10-05)

```text
Square 1:1 thumbnail for a preschool "two-deck bus" number game about parts and a whole.

Scene: a friendly, rounded toy double-decker bus made of chunky clay, side view facing right with a slight elevation, centered (about 70% of the width). The lower deck body is warm amber-orange (#E69F00) and the upper deck body is soft sky blue (#56B4E9), separated by a thin cream stripe, so the two decks clearly read as two parts of one bus. Each deck has one row of exactly four round windows. Lower deck: the three front windows each show one little clay bear cub passenger, and the back window shows an empty plain white seat. Upper deck: the two front windows each show one bear cub, and the two back windows show empty plain white seats. All five bear cubs are identical (same species, size and color), happy and looking out. On the middle of the roof stands one round sign with a thick coral-red rim and a cream face showing a big bold coral-red numeral 5. Chunky dark wheels, a small cream door, and a plain light-glass front windshield.

The numeral 5 on the roof sign is the only text in the image. Exactly five passengers (3 below + 2 above) and exactly eight passenger windows.

Background: soft mint (#CDEDDD).

Style: handmade modeling-clay (plasticine) 3D illustration, soft matte clay with subtle handmade texture, chunky rounded shapes, soft studio light, gentle highlights and soft contact shadows, vibrant child-friendly colors. One flat solid pastel background color from edge to edge: no gradient, no vignette, no rounded-square tile, no frame, no border.

Composition: square 1:1, centered, generous margins. The app crops this image to a circle, so keep every element inside the central circle (about the middle 75% of the frame) and leave the four corners as plain background. Clear silhouettes, readable at small mobile thumbnail size.

No driver, no other characters, no bus stop, no route sign or writing on the bus, no hands, no reward icons, no app UI, no title, no logo, no watermark.
```

**Ý nghĩa hình ảnh:** biển nóc = tổng, hai tầng = hai phần (3 + 2 = 5) — đúng ẩn
dụ của game. Bản 1.1 sửa theo design rev.3: sức chứa tầng cố định theo level
(L1 = 4 ghế rời/tầng) nên có ghế trống; năm hành khách cùng một loài (thuộc tính
duy nhất phân biệt hai phần là tầng); màu theo `NUMBER_BUS_COLORS` (tầng dưới cam,
tầng trên xanh, biển đỏ cam); bỏ bến xe và tài xế để không thêm vật phải đếm.

---

## 6. Xoay hình

**File:** `spin-pattern.png` (đã giao 2026-10-05)

```text
Square 1:1 thumbnail for a preschool "rotation pattern" game.

Scene: a straight horizontal row of four identical round cream clay discs, standing upright and facing the viewer, evenly spaced across the middle of the image (the row spans about 70% of the width). Each of the first three discs holds the exact same chunky coral-orange clay arrow (same shape, size and color); only its direction changes, turning a quarter-turn clockwise from one disc to the next: disc 1 points RIGHT, disc 2 points DOWN, disc 3 points LEFT. Disc 4 is empty, with a softly glowing dashed ring. Floating just above disc 4 is the same coral-orange arrow pointing UP, with two small curved motion swooshes, as if it is spinning into place. Straight-on front view with only a slight elevation, so the directions read exactly as right, down, left, up.

Background: soft periwinkle (#D9DDF7).

Style: handmade modeling-clay (plasticine) 3D illustration, soft matte clay with subtle handmade texture, chunky rounded shapes, soft studio light, gentle highlights and soft contact shadows, vibrant child-friendly colors. One flat solid pastel background color from edge to edge: no gradient, no vignette, no rounded-square tile, no frame, no border.

Composition: square 1:1, centered, generous margins. The app crops this image to a circle, so keep every element inside the central circle (about the middle 75% of the frame) and leave the four corners as plain background. Clear silhouettes, readable at small mobile thumbnail size.

Exactly four discs and exactly four arrows. No numbers, no letters, no question mark, no other symbols, no hands, no characters, no reward icons, no app UI, no title, no logo, no watermark.
```

**Ý nghĩa hình ảnh:** cùng MỘT mũi tên xoay 90° thuận chiều kim đồng hồ mỗi bước
(phải → xuống → trái → lên), một ô trống — đúng luật `spin_cw`. Đĩa tròn đứng thay
cho token phẳng để không trùng bố cục với Tìm quy luật nằm cạnh trong catalog;
nhìn chính diện để phối cảnh không làm méo hướng mũi tên.

---

## 7. Máy nối tiếp

**File:** `number-chain.png` (đã giao 2026-10-05)

```text
Square 1:1 thumbnail for a preschool "number chain machine" game.

Scene: a cheerful little clay number machine, front view with a slight elevation. A short chunky conveyor belt runs straight from left to right across the middle of the image (about 75% of the width). On the belt, from left to right: an upright cream clay card showing the numeral 3; a big friendly coral-orange cogwheel with a round cream badge in its center showing "+1"; an upright cream card showing the numeral 4; a big friendly sunny-yellow cogwheel with a round cream badge showing "+2"; and, at the right end, an empty card-shaped slot with a softly glowing dashed outline, waiting for the answer. The numbers look like they travel along the belt through the two cogwheels.

The only text in the whole image is exactly: 3, +1, 4, +2 (large, bold, dark brown, correctly formed). No other numbers, letters or symbols, no question mark, no equals sign.

Background: soft sky blue (#CBE4F6).

Style: handmade modeling-clay (plasticine) 3D illustration, soft matte clay with subtle handmade texture, chunky rounded shapes, soft studio light, gentle highlights and soft contact shadows, vibrant child-friendly colors. One flat solid pastel background color from edge to edge: no gradient, no vignette, no rounded-square tile, no frame, no border.

Composition: square 1:1, centered, generous margins. The app crops this image to a circle, so keep every element inside the central circle (about the middle 75% of the frame) and leave the four corners as plain background. Clear silhouettes, readable at small mobile thumbnail size.

No hands, no characters, no reward icons, no app UI, no title, no logo, no watermark.
```

**Ý nghĩa hình ảnh:** chuỗi hai chặng 3 → (+1) → 4 → (+2) → ô trống, đúng màn
`forward` có hiện số giữa (L1–L2). Phép tính trên ảnh phải đúng (3 + 1 = 4);
không vẽ dấu "?" để giữ quy ước ô trống phát sáng như các thumbnail khác.

---

## 8. Đúng vị trí

**File:** `ordinal-position.png` (đã giao 2026-10-05)

```text
Square 1:1 thumbnail for a preschool "find the friend in the right position" game.

Scene: a low chunky cream clay shelf with four equal open cubbies in one straight row, front view with a slight elevation, centered (about 70% of the width). In each cubby sits one different cute little clay animal friend, all the same size and facing the viewer, from left to right: a white bunny, a grey kitten, a green frog, a brown bear cub. Just left of the shelf, a small chunky coral-orange arrow points RIGHT toward the row, showing which way to count. Only the third friend from the left, the green frog, is highlighted: its cubby glows with a soft warm golden light and the frog does a happy little hop. The other three friends are calm and not highlighted.

Background: soft lilac (#E6DAF4).

Style: handmade modeling-clay (plasticine) 3D illustration, soft matte clay with subtle handmade texture, chunky rounded shapes, soft studio light, gentle highlights and soft contact shadows, vibrant child-friendly colors. One flat solid pastel background color from edge to edge: no gradient, no vignette, no rounded-square tile, no frame, no border.

Composition: square 1:1, centered, generous margins. The app crops this image to a circle, so keep every element inside the central circle (about the middle 75% of the frame) and leave the four corners as plain background. Clear silhouettes, readable at small mobile thumbnail size.

Exactly four animals and one arrow. No numbers, no letters, no question mark, no hands, no other characters, no reward icons, no app UI, no title, no logo, no watermark.
```

**Ý nghĩa hình ảnh:** một hàng bạn KHÁC nhau, mũi tên chỉ hướng đếm, sáng đúng bạn
thứ 3 tính từ trái (không phải bạn đứng giữa) — đúng mode `row_left`. Không ghi
số thứ tự vì game cũng không ghi.

---

## Generation and review checklist

Mỗi ảnh chỉ được duyệt khi đạt các điều kiện sau:

- Đúng tỷ lệ 1:1 và không bị crop chủ thể ở thumbnail nhỏ.
- Không có chữ, title, logo, watermark hoặc UI giả.
- Không tự thêm mascot hoặc nhân vật không được yêu cầu.
- Số lượng / thứ tự đúng tuyệt đối:
  - prompt 4 (Lật thẻ tìm cặp): 6 thẻ, đúng một cặp mở;
  - prompt 5 (Xe buýt hai tầng): tầng dưới 3 bạn + 1 ghế trống, tầng trên 2 bạn
    + 2 ghế trống, biển "5", năm bạn giống hệt nhau;
  - prompt 6 (Xoay hình): phải → xuống → trái → ô trống, mũi tên bay chỉ lên,
    bốn mũi tên cùng hình/cỡ/màu;
  - prompt 7 (Máy nối tiếp): 3 → +1 → 4 → +2 → ô trống;
  - prompt 8 (Đúng vị trí): đúng 4 bạn khác nhau, mũi tên bên trái chỉ sang
    phải, chỉ bạn thứ 3 tính từ trái sáng.
- Chữ/số/ký hiệu trong prompt 1, 2, 5 và 7 không méo hoặc sai hình dạng.
- Thu ảnh về ~108 px trong khung tròn: không chi tiết quan trọng nào bị cắt ở
  góc.
- Các object cần đếm không chồng lấp.
- Mỗi thumbnail truyền đạt một game khác biệt khi xem cả bộ cùng nhau.
- Background pastel nhẹ; chủ thể có độ tương phản đủ cao.
- Style thống nhất: 3D clay, bề mặt tròn mịn, bóng mềm, camera 3/4.
- Không dùng biểu cảm cạnh tranh, phần thưởng hoặc gamification icon.

## Recommended generation workflow

1. Đính kèm hai thumbnail đã ship (vd. `missing-cell.png`, `peekaboo-recall.png`)
   làm style reference, gửi kèm một lần ở đầu cuộc chat:

   ```text
   I'm making square thumbnails for a preschool learning app. The two attached images are existing thumbnails from the same set. Use them ONLY as a style reference: handmade clay material, soft lighting, flat pastel background, level of detail. Do not copy their objects, layout or characters, and do not copy the rounded-square tile edge. I will send one prompt at a time; for each prompt, generate one square 1:1 image.
   ```

2. Sinh 3–4 phương án cho từng prompt.
3. Loại ngay ảnh sai số lượng, sai ký hiệu hoặc thêm chữ.
4. Xem toàn bộ ảnh ở kích thước hiển thị thực tế (khung tròn) trước khi chọn.
5. Chọn một ảnh chuẩn style làm reference cho các lượt sinh còn lại.
6. Sau khi chốt: resize 512 × 512, bỏ alpha, đặt đúng tên file ở trên. Game
   chưa từng có ảnh phải thêm `require` vào `EXPLORE_THUMBNAILS` và bỏ khỏi
   `EXPLORE_FALLBACK_ICONS` trong `mobile/src/explore/thumbnails.ts`; thay ảnh
   đã có thì chỉ cần ghi đè file cùng tên.
7. Chủ thể chỉ là một dải ngang thì crop-zoom quanh chủ thể để điểm xa nhất nằm
   ở ~90% bán kính khung tròn (đợt 2026-10-05: number-bus 1,23×, number-chain
   1,15×, ordinal-position 1,14×; spin-pattern giữ nguyên vì đã chạm ~95%).

