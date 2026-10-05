## 1. Mobile (`mobile/`)

- [x] 1.1 `src/explore/promptLines.ts` (thuần, không import native): `lineKey`,
      template `nb_today`, `nb_total`, `nb_inside`, `nb_remodel`, `nb_gom`,
      `nb_gop`, `number_after`, `route_check_arrow` (số thứ tự «nhất»/«tư»),
      `pattern_hint_step`; `refs` chỉ dựng bằng key builder của `promptAudio.ts`;
      export `EXPLORE_PROMPT_LINES` (sắp theo key, key và transcript duy nhất)
- [x] 1.2 Đối chiếu miền tham số với danh sách 213 câu khảo sát
      (`utterances.json`): mọi câu ghép có line; template nào bỏ (`number_before`,
      `fb_level_up`, «Bé hãy chọn số» N của `numberChooseKeys`…) phải chứng minh
      không đọc được và ghi lý do
- [x] 1.3 `resolvePromptSegments(refs, hasClip)` — khớp line dài nhất trái → phải,
      `Map` khoá `refs.join('|')`, `endsSentence` cho line và phrase kết `. ! ?`
- [x] 1.4 `scripts/dump-explore-prompt-lines.cjs` + `npm run explore-lines:dump` →
      commit `src/explore/explorePromptLines.generated.json`
- [x] 1.5 Contract check: transcript không chữ số, kết `. ! ?`, persona "bé",
      khớp chữ trên màn (số → chữ; Dẫn đường đọc số thứ tự; Pattern chỉ so vế
      luật trước «:»); câu pilot đúng nguyên văn, chỉ bắt buộc có trong manifest
      khi tham số đọc được; manifest đã commit trùng với bản tính lại; resolver
      có test thuần
- [x] 1.6 Thêm tay `EXPLORE_AUDIO_DURATIONS_MS = {}` vào
      `exploreAudioRegistry.generated.ts` (ngay sau `EXPLORE_AUDIO_REGISTRY`)
- [x] 1.7 `audio.ts`: `playVoiceSequence` phát theo đoạn, `SENTENCE_GAP_MS = 280`
      huỷ được; giữ player pooled, `silenceSounding`, `segmentFinishers`, timeout
      8 s; export `bundledLineDurationMs(refs)`
- [x] 1.8 `numberBus/useBusSequencer.ts` `estimateSpeechMs` dùng thời lượng thật +
      nghỉ giữa câu; `numberBus/stage.ts` `mantra()` canh theo âm tiết khi biết
      thời lượng (`'all'` ở d+150, `onDone` ở d+450), ngược lại giữ
      `GOM_STEPS`/`GOP_STEPS`; `openingCaptions` theo thời lượng thật
- [x] 1.9 `exploreAudioCapability.ts`: thêm `explore-audio-vi-v5` (giữ v1–v4)
- [x] 1.10 Xác nhận `metro.config.js` dùng mặc định Expo (bundle được `.m4a`)
- [x] 1.11 `npm run test:explore-prompt-audio`, các `verify-explore-*` liên quan,
      `npx tsc --noEmit`, `npx eslint src/`; validator byte-identical; spec
      kido-server import generator mobile vẫn xanh

## 2. Pipeline (`kido-pipeline/`)

- [x] 2.1 Đọc manifest từ `<mobileRoot>/src/explore/explorePromptLines.generated.json`
      (mặc định `../mobile`); không chép tay transcript line
- [x] 2.2 `generate`: inventory như cũ + mọi line qua `getOrCreateLibraryClip(
      transcript, 'vi', EXPLORE_AUDIO_OWNER, { keyMode: 'diacritic-safe',
      format: 'wav', force })` → `pending_review`
- [x] 2.3 QC take line mới: ms/âm tiết sau cắt lặng, đo từ độ dài PCM thật, trong
      [150, 400]; trượt thì gen lại tối đa 2 lần, rồi giữ take cuối + cảnh báo
- [x] 2.4 `review`/`approve`/`reject` liệt kê và nhận line (audioId từ khoá
      diacritic-safe)
- [x] 2.5 `export`: line bắt buộc (fail-closed); line ra `.m4a` qua
      `encodeWavToM4a` từ WAV đã cắt (pad 30 ms), tên `exploreAudioFileBase(key)`;
      clip cũ giữ WAV
- [x] 2.6 Registry sinh ra thêm `EXPLORE_AUDIO_DURATIONS_MS` (đo từ PCM đã cắt,
      trước mã hoá; khoá sắp như registry)
- [x] 2.7 `EXPLORE_AUDIO_PACK_VERSION = 'explore-audio-vi-v5'`
- [x] 2.8 `trim` bỏ qua file không phải `.wav`
- [x] 2.9 Header `src/scripts/explore-audio.ts` ghi
      `VIENEU_TEMPERATURE=0.7 npm run explore-audio:generate`
- [x] 2.10 `npx vitest run src/explore` + `npx tsc --noEmit`

## 3. Batch audio (Human Gate — cần VieNeu local + MongoDB)

- [x] 3.1 Bật VieNeu (giọng `dodo-clone2`); ghi revision model Hugging Face đang
      chạy vào nhật ký batch
- [x] 3.2 `cd mobile && npm run explore-lines:dump` (manifest mới nhất đã commit)
- [x] 3.3 `cd kido-pipeline && VIENEU_TEMPERATURE=0.7 npm run explore-audio:generate`
      → line ở `pending_review`; đọc cảnh báo QC
- [x] 3.4 `npm run explore-audio:review` — chủ sản phẩm nghe **TỪNG** line (không
      nghe mẫu); take hỏng → `reject` + gen lại
- [x] 3.5 `npm run explore-audio:approve -- --all` chỉ SAU KHI đã nghe hết, hoặc
      `approve <audioId…>` từng phần (Human Gate; không bao giờ tự động)
- [x] 3.6 `npm run explore-audio:export -- ../mobile` → pack v5, line `.m4a`,
      `EXPLORE_AUDIO_DURATIONS_MS` đầy đủ; ghi chênh lệch dung lượng bundle
      (2026-10-05: VieNeu v3 Turbo HF `61b85e3d93…`, MOSS codec `ceff0d0749…`,
      `dodo-clone2`, temp 0.7. 93 line gen, cả 93 qua QC ở take 1 (189–253
      ms/âm tiết). Chủ sản phẩm nghe trên trang duyệt, không câu nào lỗi, rồi
      `approve <93 audioId>`. Export ra 278 clip (93 line `.m4a`, tổng 804 KB),
      các clip WAV v4 không đổi byte nào. Thời lượng line 870–2530 ms.)

## 4. Verify

- [ ] 4.1 iOS Simulator: Xe buýt mở màn, `missing_part`, `count_on`,
      `next_number`, thần chú gồm/gộp (highlight khớp tiếng), làm mẫu đếm thêm;
      Dẫn đường «thứ nhất»/«thứ tư»; gợi ý luật Pattern
- [ ] 4.2 Máy thật Android + iOS, bật airplane mode: mọi câu trên phát từ bundle
- [ ] 4.3 Fallback: build thiếu một line (hoặc registry đã bỏ mọi khoá
      `explore-audio:vi:line:*` nhưng giữ `EXPLORE_AUDIO_DURATIONS_MS` — xem
      Rollback trong design) → câu đó phát bằng clip ghép như cũ, không lỗi
- [ ] 4.4 Dừng/nghe lại/rời màn trong lúc nghỉ giữa câu → không còn âm thanh sót;
      phản hồi chen ngang đề vẫn như cũ
- [ ] 4.5 Không lịch sử/analytics Khám phá, không đụng đường publish kido-server
- [ ] 4.6 Nghe tiếng vọng đáp án trước câu tổng (`next_number`, `count_on`:
      line `nb_count_finish` «N! Có tất cả N bạn nhé.») — so với take pilot
      `count_finish`

## 5. Docs

- [x] 5.1 OpenSpec change: proposal, design, tasks, spec delta
      `explore-prompt-audio` + `explore-audio-pipeline`;
      `npx openspec validate add-explore-whole-line-audio --strict` pass
- [x] 5.2 `docs/KIDO_EXPLORE_BRD.md` §9 Audio + dòng rủi ro "Audio template nghe
      rời rạc" ghi quyết định, trỏ về change này
- [x] 5.3 `docs/AI_CONTEXT.md`: bản đồ audio Khám phá (khoá line,
      `promptLines.ts`, manifest JSON, pack v5, fallback; line là `.m4a`)
- [x] 5.4 Ghi chú "superseded cho câu ghép" trong
      `add-explore-prompt-audio/design.md`
- [x] 5.5 Ghi chú câu nâng đỡ «thứ nhất/thứ tư» thành line trong
      `add-explore-route-feedback-audio/tasks.md`
- [x] 5.6 ~~Ghi nguồn giọng `dodo-clone2` + bằng chứng đồng ý của người cho
      giọng~~ — chủ sản phẩm quyết định bỏ qua (2026-10-05), không chặn phát
      hành pack v5
- [ ] 5.7 Sau 3.6: cập nhật BRD/AI_CONTEXT từ "đang làm" sang "đã ship" kèm số
      line và dung lượng thật; release log mobile
- [ ] 5.8 Archive change này chỉ SAU `add-explore-prompt-audio` rồi
      `add-explore-route-feedback-audio` (hai capability nó MODIFIED mới là delta
      của hai change đó)
