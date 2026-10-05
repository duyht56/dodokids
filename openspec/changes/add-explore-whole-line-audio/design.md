## Context

`add-explore-prompt-audio` chọn kho clip **ghép được**: câu cố định là một clip,
còn số/nhãn/từ là clip slot dùng chung, ráp lại lúc chạy. Lý do khi đó: tổ hợp
tham số làm bộ câu nguyên vẹn bùng nổ. Thiết kế đó vẫn để ngỏ "một vài câu khó
nghe có thể thu nguyên câu" (Risks + Open Questions của change đó).

Đến pack `explore-audio-vi-v4` (Xe buýt hai tầng), câu ghép đã chiếm phần lớn
thời lượng nói của Khám phá. Số đo ngày 2026-10-05 bằng script liệt kê mọi câu
đọc được từ code (script khảo sát `enumerate-utterances.mjs`, chạy tạm, không
commit):

| Chỉ số | Giá trị |
|---|---|
| Câu nói có thể phát (distinct) | 213 |
| — một clip | 85 |
| — ghép nhiều clip | 128 (tối đa 6 mảnh) |
| Tổng mối nối | 381 |
| Câu có mối nối *giữa câu* | 122 |
| Xe buýt / Dẫn đường / Pattern (ghép / tổng) | 97/118 · 24/38 · 2/15 |

Mỗi mảnh được TTS đọc như một câu độc lập, nên «Có tất cả» lên giọng kết câu,
«sáu» đọc như từ đơn, «bạn nhé.» lại bắt đầu từ đầu. Chủ sản phẩm nghe thấy
"rời, phẳng". Bản ghép còn đọc sai số thứ tự: «Xem lại mũi tên thứ một/bốn nhé»
(tiếng Việt phải là «thứ nhất», «thứ tư»).

Pilot P0 (2026-10-05): 10 câu Xe buýt, VieNeu-TTS v3 Turbo qua server local,
giọng clone `dodo-clone2`, đọc nguyên câu ở temperature 0.7 / 0.9 / 1.2 × 3
take = 90 take, đặt cạnh bản ghép. Tốc độ đọc sau khi cắt lặng: 200–276
ms/âm tiết trên cả 90 take (riêng 0.7: 207–264; take nhiều câu tính cả chỗ ngừng
giữa câu). Chủ sản phẩm chốt take 1 ở **0.7**.

## Goals / Non-Goals

**Goals:**

- Mọi câu (cấp câu) đọc được trong Khám phá có số/từ chèn vào mảnh câu đều có
  một clip nguyên câu, render lúc authoring, qua Human Gate, bundle offline.
- Không đổi `exercise.audioRefs`, generator, validator hay key builder nào —
  replay byte-identical, spec kido-server import generator mobile không đổi.
- Clip ghép hôm nay ở lại trong bundle và là fallback tự động.
- Nhịp hình (thần chú Xe buýt, caption mở màn) bám theo thời lượng thật của
  clip, không theo ước lượng.

**Non-Goals:**

- TTS lúc chạy (máy hoặc server), tải pack qua R2, kido-server, landing.
- Gen lại clip v4 hiện có, đổi giọng/temperature của bài học.
- Thu một clip cho cả lượt nói nhiều câu.

## Decisions

### Line ở cấp CÂU, không ở cấp lượt nói

Một line = một câu ghép = dãy `refs` liền nhau mà hôm nay ráp một số/từ VÀO một
mảnh câu. Câu cố định đã là một clip (`nb_hidden_q`, `nb_total_q`,
`nb_board_q`, `fb_*`…) không thành line. Lượt nói nhiều câu (mở màn + đề +
câu hỏi) được phát thành nhiều đoạn, có nghỉ giữa câu. Nhờ vậy miền tổ hợp nhỏ
(93 line trong manifest: `nb_gom` 35, `nb_count_finish` 9, `number_after` 8,
`route_check_arrow` 8, `nb_inside` 7, `nb_remodel` 7, `nb_today` 6, `nb_total`
6, `nb_gop` 5, `pattern_hint_step` 2 — số chốt là độ dài manifest), mỗi câu vẫn
có ngữ điệu trọn, và chỗ nối còn lại là chỗ người thật cũng ngừng. Ngoại lệ duy
nhất cho "một line = một câu" là `nb_count_finish` (mục "Tiếng vọng đáp án trước
câu tổng").

Template bắt buộc (`{x}` = `vietnameseNumberWord(x)`):

| templateId | params | refs (key builder sẵn có) | transcript |
|---|---|---|---|
| `nb_today` | `[w]` | `numberBusOpeningKeys(w)` | Hôm nay mình chơi với số {w}! |
| `nb_total` | `[n]` | `numberBusTotalKeys(n)` | Có tất cả {n} bạn nhé. |
| `nb_count_finish` | `[n]` | `numberKey(n)` + `numberBusTotalKeys(n)` | {N}! Có tất cả {n} bạn nhé. |
| `nb_inside` | `[a]` | `numberBusInsideKeys(a)` | Trong xe có {a} bạn rồi nha. |
| `nb_remodel` | `[a]` | `numberBusRemodelKeys(a)` | Số {a} ở trong xe rồi, mình đếm thêm nha! |
| `nb_gom` | `[whole,a,b]` | `numberBusMantraKeys('gom',…)` | {Whole} gồm {a} và {b}! |
| `nb_gop` | `[whole,a,b]` | `numberBusMantraKeys('gop',…)` | Gộp {a} và {b} được {whole}! |
| `number_after` | `[n]` | `numberBeforeAfterKeys('after',n)` | Số nào đứng sau số {n}? |
| `route_check_arrow` | `[step]` | `route_fb_check_arrow` + số + `nhe` | Xem lại mũi tên thứ {ordinal(step)} nhé. |
| `pattern_hint_step` | `[n]` | `patternRuleHintKeys('numeric', n)` | câu gợi ý luật trên màn, số đọc thành chữ, kết "." |

`ordinal`: 1 → «nhất», 4 → «tư», còn lại `vietnameseNumberWord`. Ba câu ghép
có key builder nhưng **không đọc được** nên không có template: «Số nào đứng trước
số» N (`numberBeforeAfterKeys` chỉ được gọi với `'after'`), «Giỏi quá! Mình thử
phạm vi» N (`levelUpKeys`) và «Bé hãy chọn số» N (`numberChooseKeys`) — hai hàm
sau không có call site ngoài `promptAudio.ts`. Check
`npm run test:explore-prompt-lines` fail khi một trong ba có call site, để
template được thêm cùng lúc. Mobile thêm mọi câu ghép đọc được khác mà nó tìm
thấy; bỏ template nào thì phải chứng minh không đọc được và ghi lý do. Danh sách
213 câu khảo sát dùng để đối chiếu miền, code là chuẩn.

Câu pilot quy định **phong cách lời** của template, không phải danh sách line:
check mobile đòi template sinh đúng nguyên văn câu pilot với tham số pilot, còn
câu pilot chỉ nằm trong manifest khi tham số của nó đọc được. «Gộp hai và ba
được năm!» không đọc được: xếp lên xe (`board_all`) chỉ có tổng 3–4
(`NUMBER_BUS_BOARD_PART_MAX = 3`), nên `nb_gop` chỉ có 5 line (3-1-2 … 4-3-1).

Luật transcript (check `npm run test:explore-prompt-lines`,
`scripts/verify-explore-prompt-lines-contracts.cjs`): không chữ số; kết bằng
`.`, `!` hoặc `?`; xưng "Đô Đô", gọi "bé" (không bao giờ "con"); `refs` trùng
byte với key renderer phát ra; khớp chữ trên màn của cùng câu nếu có (số → chữ,
so không phân biệt hoa/thường và dấu câu). Hai ngoại lệ có chủ đích:

- Câu nâng đỡ của Dẫn đường hiện chữ số «thứ 4», tiếng nói đọc số thứ tự «thứ
  tư» — phép so khớp của template này đọc số theo số thứ tự.
- Gợi ý luật của Pattern hiện «Mỗi số thêm 2: ＋2 ＋2 …»; chỉ vế luật trước dấu
  «:» được đọc và đem so («Mỗi số thêm hai.»), đuôi «＋2 ＋2 …» là phần hình.

### Tiếng vọng đáp án trước câu tổng (`nb_count_finish`)

`NextNumberScene.tsx` và `CountOnScene.tsx` khen đáp án bằng
`speak([numberKey(N), ...numberBusTotalLine(N).audioRefs])`: con số N vang lại,
rồi «Có tất cả N bạn nhé.» (N = 2…10). Nếu chỉ có line `nb_total`, app sẽ phát
clip số v4 «năm» rồi line liền nhau. Take pilot «Năm! Có tất cả năm bạn nhé.»
đọc một hơi nghe tốt hơn, nên change này thêm template `nb_count_finish [n]`,
`refs = [numberKey(n), ...numberBusTotalKeys(n)]`, transcript «{N}! Có tất cả {n}
bạn nhé.» (chốt sau review, 2026-10-05). Khớp dài nhất tự chọn nó. Đây là ngoại
lệ có chủ đích của "một line = một câu": màn chỉ hiện «Có tất cả N bạn nhé.»,
con số vang lại là bong bóng số trên bảng, nên check so chữ trên màn của
template này so với «N! » + chữ câu tổng.

Hai luật resolver đi kèm:

- Một line mở đầu bằng số (`nb_gom`, `nb_count_finish`) KHÔNG được ăn con số
  đang kết thúc một mảnh câu đứng trước (cụm từ hoặc phrase chưa có dấu kết
  câu). Ví dụ: khi line `nb_today` thiếu, «Hôm nay mình chơi với số» + «sáu»
  vẫn ghép, và «sáu» không bị `nb_count_finish:6` lấy mất.
- Một clip số đứng một mình ngay trước một line được tính là hết câu (có nghỉ
  280 ms): tiếng vọng khi `nb_count_finish` thiếu, hoặc mảnh mở màn ghép như ví
  dụ trên.

### Khoá line = BRD §9 `templateId + params + voiceVersion`

`explore-audio:vi:line:<templateId>:<params nối bằng '-'>:v1`, `templateId`
khớp `/^[a-z0-9_]+$/` (ví dụ `explore-audio:vi:line:nb_total:6:v1`,
`explore-audio:vi:line:nb_gom:6-4-2:v1`). `voiceVersion` sống ở cấp pack
(`EXPLORE_AUDIO_PACK_VERSION`), như mọi clip Khám phá khác; hậu tố `:v1` là
version của template/transcript, tăng khi lời câu đổi. File:
`exploreAudioFileBase(key)` → `explore-audio-vi-line-nb-total-6-v1.m4a`.

### Resolver thuần + fallback, contract không đổi

`resolvePromptSegments(refs, hasClip)` đi trái → phải: tại vị trí `i` lấy line
**dài nhất** có `refs` trùng `refs[i..i+len)` VÀ đã có clip; nếu không, lấy
`refs[i]` làm đoạn clip đơn nếu có clip (bỏ qua nếu không). Tra bằng `Map` khoá
`refs.join('|')`. `endsSentence` = true cho đoạn line và cho clip phrase có
transcript kết bằng `. ! ?`; clip số/từ = false.

Vì line chỉ là cách *phát* một dãy `refs` sẵn có, `exercise.audioRefs` và mọi
generator/validator/key builder giữ nguyên: không đổi wire contract, replay
byte-identical, spec kido-server import generator mobile không phải sửa. Line
thiếu (chưa export, bị reject, build cũ) → resolver tự rơi về clip ghép, đúng
hành vi hôm nay. Cùng resolver phục vụ cả đề bài lẫn phản hồi, vì
`playExplorePromptAudio` và `playExploreFeedbackAudio` đều đi qua
`playVoiceSequence`.

### Manifest JSON đi một chiều mobile → pipeline

Mobile sinh `mobile/src/explore/explorePromptLines.generated.json`
(`{ "version": 1, "lines": [{ key, templateId, params, refs, transcript }] }`,
sắp theo `key`, thụt 2 space, có newline cuối) bằng
`npm run explore-lines:dump` (`scripts/dump-explore-prompt-lines.cjs`, cùng kỹ
thuật nạp TS như `scripts/verify-explore-*.cjs`) và commit nó. kido-pipeline đọc
file từ `<mobileRoot>/src/explore/` (mặc định `../mobile`, giống export). Lý do:
transcript line phụ thuộc generator và on-screen text của mobile; chép tay sang
pipeline (như mirror `exploreAudioInventory.ts`) chính là nguồn lệch mà change
route-feedback đã phải dựng check để bắt. JSON thay vì import TS chéo package
để pipeline không cần toolchain mobile.

### Line xuất `.m4a`, clip slot/phrase giữ WAV

Line được export AAC-LC `.m4a` qua `encodeWavToM4a` sẵn có, mã hoá từ WAV đã
cắt lặng (pad 30 ms). 93 line × ~1,6 s ở WAV 24 kHz mono 16-bit (~48 KB/s)
là ~6–7 MB — nhiều hơn nửa pack hiện tại (190 file, ~10 MB); AAC còn khoảng
0,5–1 MB. `.m4a` đã chạy native trên iOS/Android qua `expo-audio` (clip bài học
dùng nó từ 2026-09-21), Metro bundle được vì `mobile/metro.config.js` dùng
`getDefaultConfig` của Expo.

Clip phrase/word/number/label giữ WAV, không đụng byte nào: chúng là fallback
ghép, nơi mối nối phải sát — AAC có priming/padding đầu–cuối sẽ nới mọi mối
nối; và đổi chúng nghĩa là gen/export lại pack v4 (ngoài phạm vi). Lệnh `trim`
chỉ làm việc với `.wav`, bỏ qua `.m4a`.

### Thời lượng thật cho nhịp hình

Export ghi thêm vào registry sinh ra:
`export const EXPLORE_AUDIO_DURATIONS_MS: Record<string, number>` — một mục mỗi
clip được export (phrase/word/number/label VÀ line), ms nguyên, đo từ PCM **đã
cắt lặng, trước khi mã hoá** (container AAC cộng priming nên không tin được),
khoá sắp như registry. Tới lần export sau, mobile tự thêm export này dạng object
rỗng cùng vị trí; code mobile chịu được thiếu mục.

- `bundledLineDurationMs(refs)` (thuần, trong `audio.ts`): trả thời lượng khi
  `refs` resolve đúng MỘT line đã bundle có thời lượng, ngược lại `null`.
- `useBusSequencer.estimateSpeechMs`: cộng thời lượng thật của từng đoạn đã
  resolve (+ nghỉ giữa câu), đoạn nào không có số thì dùng heuristic cũ.
  `openingCaptions` hưởng theo.
- `stage.ts` `mantra()`: khi biết `d = bundledLineDurationMs(line.audioRefs)`,
  bước caption/highlight đặt theo vị trí âm tiết trong `d` (gồm: N | gồm | A |
  và | B; gộp: Gộp | A | và | B | được | N; đếm âm tiết của chữ được đọc mỗi
  đoạn), highlight `'all'` ở `d + 150` ms, `onDone` ở `d + 450` ms. Không biết
  `d` thì giữ nguyên `GOM_STEPS`/`GOP_STEPS` hiện tại. Reduce-motion không đổi.

### Nghỉ giữa câu 280 ms, huỷ được

Giữa hai đoạn mà đoạn trước `endsSentence`, `playVoiceSequence` chờ
`SENTENCE_GAP_MS = 280`, rồi kiểm lại số thứ tự sequence trước khi phát tiếp —
`stopExplorePromptAudio`, đề mới hay phản hồi chen vào đều cắt được khoảng
nghỉ. Mọi luật an toàn hiện có của `audio.ts` giữ nguyên: player pooled,
`silenceSounding`, `segmentFinishers`, timeout 8 s mỗi đoạn. Hôm nay hai câu
liền nhau chỉ cách nhau phần pad còn lại sau khi cắt lặng, nên nghe dính; 280 ms
là một nhịp ngừng cuối câu khi nói chậm cho trẻ.

### QC rẻ, deterministic cho mỗi take line MỚI

VieNeu thỉnh thoảng nuốt chữ hoặc kéo dài/lặp đoạn. QC đo ms/âm tiết sau khi cắt
lặng, từ **độ dài dữ liệu PCM thật** (header WAV streaming của VieNeu ghi sai
kích thước `data`), chấp nhận [150, 400]; pilot đo 200–276. Trượt → gen lại
(`force`) tối đa thêm 2 lần, rồi giữ take cuối và in cảnh báo QC liệt kê nó. QC
chỉ lọc lỗi thô — không bao giờ duyệt thay người: mọi line vẫn ở
`pending_review`.

### Pipeline: sinh, duyệt, export fail-closed

- `generate` = clip inventory hiện có (hành vi không đổi) + mọi line của
  manifest qua `getOrCreateLibraryClip(transcript, 'vi', EXPLORE_AUDIO_OWNER,
  { keyMode: 'diacritic-safe', format: 'wav', force })`. Khoá diacritic-safe vì
  line là tập mới (không phải migrate) và clip trùng chữ khác dấu không được
  dùng chung file — cùng lý do bài học đã chuyển sang khoá giữ dấu.
- `review`/`approve`/`reject` liệt kê và nhận line (audioId lấy từ khoá
  diacritic-safe của transcript).
- `export`: line là **bắt buộc** — thiếu, chưa duyệt hay không có audio thì
  dừng, như với clip inventory hôm nay. `EXPLORE_AUDIO_PACK_VERSION =
  'explore-audio-vi-v5'`; mobile thêm v5 vào
  `SUPPORTED_EXPLORE_AUDIO_PACK_VERSIONS` (giữ v1–v4).

### Giọng: VieNeu, `dodo-clone2`, temperature 0.7

Không đổi code temperature: người vận hành chạy
`VIENEU_TEMPERATURE=0.7 npm run explore-audio:generate` (ghi trong header CLI).
Bài học giữ giá trị trong `.env` của pipeline. Chủ sản phẩm nghe **từng** line
trước khi `approve`, không nghe mẫu đại diện: lỗi TTS (nuốt chữ, sai thanh, lặp
đoạn) xảy ra theo từng take.

## Risks / Trade-offs

- [Đồng ý của người cho giọng gốc `dodo-clone2` chưa được ghi nhận] → chủ sản
  phẩm quyết định bỏ qua, không làm điều kiện phát hành pack v5 (2026-10-05).
- [VieNeu không deterministic — cùng câu, cùng temperature cho take khác nhau] →
  export lấy byte của clip đã duyệt trong `audio_library`, không bao giờ tổng hợp
  lại lúc export; `--force` đưa clip về `pending_review` và phải nghe lại.
- [Revision model trên Hugging Face không được ghim → lần gen sau giọng có thể
  khác] → ghi revision/commit model vào nhật ký batch; ghim trước batch kế tiếp.
- [Line (0.7) nằm cạnh clip phrase v4 trong cùng lượt nói, màu giọng có thể lệch
  nhẹ] → nghe trong app các lượt ghép line + phrase (mở màn, `missing_part`,
  `count_on`); lệch rõ thì gen lại các phrase đó ở batch sau.
- [Bundle tăng] → line là AAC (~0,5–1 MB); ghi kích thước pack vào release check.
- [Chữ trên màn và lời line lệch nhau] → contract check của mobile so transcript
  với on-screen text (số → chữ, số thứ tự cho Dẫn đường, vế luật trước «:» cho
  Pattern).
- [Line dùng chung keyspace diacritic-safe của `audio_library` với clip bài học
  (`lesson-audio.ts` cũng dùng khoá này, nhưng lưu `.m4a`)] → nếu một câu line
  trùng chữ với một clip bài học, dùng lại clip đó sẽ đưa vào pack một file
  export không cắt/đo được, còn `--force` sẽ ghi đè clip của bài học. `generate`
  vì vậy dừng trước mọi lần gọi TTS khi một line trùng clip không phải WAV
  (`existingLineStatuses` trong `generateExploreAudio.ts`); cách xử lý: sửa lời
  line trong `promptLines.ts`, hoặc gỡ clip bằng tay.
- [Tiếng vọng đáp án «N» trước «Có tất cả N bạn nhé.»] → giải bằng
  `nb_count_finish` (mục "Tiếng vọng đáp án trước câu tổng"); vẫn nghe trong app
  (task 4.6).
- [Manifest cũ so với code] → manifest sinh bằng script, commit cùng thay đổi
  template; export fail-closed khi line thiếu.
- [Khoảng nghỉ làm lệch nhịp hình] → `estimateSpeechMs` cộng cả khoảng nghỉ.

## Migration Plan

1. Mobile: `promptLines.ts`, manifest + script dump, resolver trong `audio.ts`,
   `EXPLORE_AUDIO_DURATIONS_MS` rỗng, nhịp Xe buýt có fallback, +v5. Chưa có
   line nào trong registry → app phát y như hôm nay.
2. Pipeline: đọc manifest, sinh line + QC, review/approve/reject, export `.m4a` +
   thời lượng, pack v5, `trim` bỏ qua non-WAV.
3. Batch audio: `VIENEU_TEMPERATURE=0.7` generate → chủ sản phẩm nghe từng line →
   approve → export vào `mobile/`.
4. Verify trên simulator và máy thật, airplane mode; fallback khi thiếu line.
5. Rollback (sửa tay — pipeline sau change này chỉ export được v5 có đủ line,
   không sinh lại được registry dạng v4): trong `exploreAudioRegistry.generated.ts`
   bỏ mọi khoá `explore-audio:vi:line:*` khỏi `EXPLORE_AUDIO_REGISTRY` và
   `EXPLORE_AUDIO_DURATIONS_MS` nhưng **giữ** export
   `EXPLORE_AUDIO_DURATIONS_MS` (mobile import nó; xoá đi là `tsc` lỗi TS2305),
   rồi xoá các file `.m4a` line. Muốn về hẳn bản v4 thì lấy registry v4 cũ
   **cộng** `export const EXPLORE_AUDIO_DURATIONS_MS: Record<string, number> =
   {};`. Cả hai cách: resolver tự rơi về clip ghép, không đổi code nào khác.

## Open Questions

- Có gen lại các phrase v4 hay đi cùng line (`nb_hidden_q`, `nb_total_q`,
  `nb_board_q`…) ở 0.7 để đồng màu giọng không? Quyết sau khi nghe bản v5 trong
  app.
- `number_before`, `fb_level_up`, «Bé hãy chọn số» N (`numberChooseKeys`): hiện
  không đọc được; khi có call site (check mobile sẽ fail) thì thêm template và
  chạy một batch line nhỏ.
- Tiếng vọng đáp án trước câu tổng: đã chốt `nb_count_finish` (2026-10-05);
  nghe lại trong app ở task 4.6.
