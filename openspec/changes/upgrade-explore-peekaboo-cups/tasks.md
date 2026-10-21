## 1. Game (mobile, nhánh `feat/explore-peekaboo-cups` từ `main` @ `bcb3dab`)

- [x] 1.1 (mobile `4a3d5fa`) `peekabooRecallGame.ts`: hai kiểu bài `missing` / `cups`, thang 5 bậc mới (`PEEKABOO_RECALL_LEVELS`), bộ thẻ "biến mất" = món mất + 1 món còn trên bàn + món lạ, bài cốc = thẻ là đúng các món dưới cốc + cốc được hỏi theo hoán vị seed, câu trả lời `assetIds`.
- [x] 1.2 Validator độc lập từng kiểu bài (hai điều kiện "đã thấy" / "không còn trên bàn", thẻ = món dưới cốc, cốc hỏi khác nhau, đáp án theo cốc) + replay byte-identical.
- [x] 1.3 `peekabooLookMs` (1 giây mỗi món, ≥ 3 giây); bucket `missing_3 … cups_4x2`; `variantKey` không gồm thẻ (B10).
- [x] 1.4 Version v2 (generator, validator, config, manifest, dependency 2).

## 2. Renderer + shell

- [x] 2.1 `PeekabooRecallRenderer.tsx`: cốc vẽ bằng View, mũi tên nhún (đứng yên khi giảm chuyển động), bậc 5 hai cốc liền, chạm sai báo ngay.
- [x] 2.2 Diễn lại + câu kết qua `onSpeakFeedback`, báo `onAnswer(true)` sau khi câu đọc xong (≤ 6 s) và bàn hiện ≥ 1,4 s; tạm dừng giữ báo; chạm đôi không nói hai lần.
- [x] 2.3 Bong bóng theo pha; bỏ «Cùng nhớ nhé…» và dòng nhắc dưới thẻ; khung thẻ viền đứt lúc chờ (E07).
- [x] 2.4 `renderers/peekabooLayout.ts`: một hàng món, một hàng thẻ, co theo chiều cao đo được, thẻ ≥ 56pt (B04).
- [x] 2.5 Tạm dừng: trong lúc nhìn → nhìn lại đủ một lượt (Đợt 1); đã che / úp cốc / đang lộ ô → giữ nguyên, chơi tiếp từ bước đó (C04 của review đối kháng Đợt 1: bản Đợt 1 hiện lại đủ bộ sau khi bé đã thấy ô trống). Kiểm mới trong `test:explore-peekaboo` §9c đỏ trên mã trước sửa; `test:explore-play-shell` §4 dùng bài bậc 1, đọc bong bóng qua testID, tạm dừng dưới tấm che giữ che.
- [x] 2.6 `supportHintPhraseId/supportHintKeys` nhận bài hiện tại: bài cốc mức 1 = `peekaboo_hint_place`; `ExplorePlayScreen` truyền `currentExercise` (2 chỗ).
- [x] 2.7 `levelIntroLine('peekaboo')` đọc bảng `PEEKABOO_LEVEL_INTRO` (bậc 2 dùng lại `peekaboo_intro_3`).
- [x] 2.8 Sau khi gộp vào nhánh tích hợp `integrate/explore-2026-10-21` (mobile `9779e61`): kiểm trên cây gộp, 91b0c8d KHÔNG bỏ việc màn chơi đọc lại cue cũ của Ú òa — tạm dừng dưới tấm che / lúc lộ ô / cốc úp thì quay lại đọc lại câu nhìn trên bàn đã che; tạm dừng lúc diễn lại (câu kết chưa có clip) thì đọc lại câu hỏi vừa trả lời. Renderer cue rỗng khi bộ đồ đã che và báo bận từ thẻ đúng cuối tới ngay trước `onAnswer(true)`. `test:explore-play-shell` §8 (màn chơi thật + renderer thật) đỏ khi bỏ từng nửa.

## 3. Audio (KHÔNG render clip trong change này)

- [x] 3.1 Khối câu mới liền nhau cuối `PROMPT_PHRASES` (`promptAudio.ts`, chú thích tên change), không đảo mục cũ; mirror vào kido-pipeline `src/explore/exploreAudioInventory.ts` (kido-pipeline `a0ca617`, nhánh local `feat/explore-peekaboo-cups` từ main `27436a4`).
- [x] 3.2 `npm run explore-lines:dump` (không có câu liền mới: 9 câu đều là câu cố định; file JSON không đổi).
- [ ] 3.3 Đợt audio chung **v8** — 9 id mới (`explore-audio:vi:phrase:<id>:v1`), owner nghe duyệt:
  - `peekaboo_mantra` — «Bé nhìn kỹ chỗ của từng món nhé!»
  - `peekaboo_cups_which` — «Dưới cốc này là gì nhỉ?»
  - `peekaboo_cups_which_next` — «Còn dưới cốc này là gì nhỉ?»
  - `peekaboo_hint_place` — «Bé nhớ lại xem món nào nằm ở chỗ này nhé.»
  - `peekaboo_missing_done` — «Lúc nãy món này nằm ở đây, rồi trốn mất đó!»
  - `peekaboo_cups_done` — «Nhớ chỗ của từng món là tìm ra ngay!»
  - `peekaboo_cups_intro_3` — «Bây giờ Đô Đô úp cốc lên, bé nhớ chỗ của từng món nhé!»
  - `peekaboo_cups_intro_4` — «Bây giờ có bốn cái cốc, bé nhớ hết nhé!»
  - `peekaboo_cups_intro_5` — «Bây giờ Đô Đô hỏi hai cốc liền, bé nhớ thật kỹ nhé!»
  Không còn đọc (giữ trong inventory vì đã có clip pack v7): `peekaboo_intro_2`, `peekaboo_intro_4`, `peekaboo_intro_5`.

## 4. Server mirror

- [x] 4.1 (kido-server `659efb7`, nhánh `feat/explore-peekaboo-cups` từ main `2c86f85`) `explore.registry.ts`: `BundledLocalGameSpec.version` (giống từng dòng cơ chế của nhánh `fix/explore-missing-cell-leak` 54b73d2), `peekaboo_recall` = 2.
- [x] 4.2 `explore.peekaboo-recall.spec.ts`: thang bậc, chứng minh từng kiểu bài, tamper, version v2.

## 5. Contract + kiểm chứng

- [x] 5.1 `verify-explore-peekaboo-contracts.cjs` viết lại: thang bậc gỡ một hỗ trợ mỗi bậc, corpus độc lập, tamper hai kiểu, bộ giải ngây thơ trên vòng planner thật (ngẫu nhiên cố định → không chập chờn), không lặp tình huống, bố cục 5 thiết bị, renderer mount thật (cốc, mũi tên, bậc 5, tạm dừng, chạm đôi, shell im, giảm chuyển động). Kiểm chạm đôi đỏ trên mã chưa sửa.
- [x] 5.2 mobile: `npx tsc --noEmit`, `npm run lint` (0 lỗi), 20/20 `npm run test:explore-*`.
- [x] 5.3 kido-server: `npx jest src/modules/explore` (21 suite), `npm run build`. kido-pipeline: `npx vitest run src/explore` (81).
- [x] 5.4 iOS Simulator iPhone 17e (390×844), dev client + Metro từ worktree, server local (ảnh: `tmp/explore-review-2026-10-21/peekaboo-cups/sim/`): bậc 2 trọn vòng 6 bài (sai 1 → mờ thẻ + gợi ý «…vừa trốn đi…») → lên «Bậc 3/5» → bài cốc 3 cốc + mũi tên + diễn lại; bậc 5 hai cốc liền, sai 2 lần ở cốc thứ hai → gợi ý «…nằm ở chỗ này…» rồi lật lại cả bộ, đúng → diễn lại hai ô.
- [ ] 5.5 Máy SE 375×667 thật (máy ảo SE đang được phiên khác dùng; bố cục SE đã kiểm bằng contract §7).
- [ ] 5.6 Bé thật chơi thử (độ khó bậc 3 với 3 cốc, thời gian nhìn 3–4 giây).

## 6. Docs

- [x] 6.1 BRD `KIDO_EXPLORE_BRD.md` mục Ú òa (§7.12): thang bậc, câu thần chú, diễn lại.
- [x] 6.2 `docs/AI_CONTEXT.md`.
- [ ] 6.3 C-50 (`KIDO_MARKETING_CLAIMS.md`) — dòng C-50 hiện nằm trong thay đổi chưa commit của việc SEO landing, không có trên nhánh này. Khi bản có bài cốc lên store: "nhớ đồ vật rồi tìm món vừa biến mất (Ú òa)" → "nhớ đồ vật rồi tìm món vừa biến mất, và nhớ món nào nằm dưới cốc nào (Ú òa)".

## 7. Chờ owner

- [ ] 7.1 Quyết định ở `design.md` (bậc 3 = 3 hay 4 cốc; 1 giây mỗi món; bậc 1 có 4 thẻ).
- [ ] 7.2 Gộp nhánh mobile / kido-server / kido-pipeline (không push: push kido-pipeline main = deploy).
- [ ] 7.3 Lưu trữ sau `fix-explore-play-reliability` (requirement "The look never runs out unseen" ở đây MODIFIED bản change đó ADDED; trên nhánh tích hợp 21/10 bản đó đã sửa theo C04, kịch bản "Paused under the cover" giữ che ở cả hai).
