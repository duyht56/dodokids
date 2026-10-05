# Đề xuất: Câu liền cho giọng Khám phá (`add-explore-whole-line-audio`)

## Why

Giọng Đô Đô trong Khám phá đọc câu có số bằng cách **ghép clip tổng hợp riêng
lẻ** («Có tất cả» + «sáu» + «bạn nhé.»). Mỗi mảnh mang ngữ điệu riêng nên câu
nghe rời, phẳng, và "!"/"?" không rơi vào con số — chỗ bé cần nghe rõ nhất. Chủ
sản phẩm đã phản ánh sau khi nghe Xe buýt hai tầng.

Khảo sát code ngày 2026-10-05: **213** lượt nói có thể phát, **128** lượt ghép
nhiều clip (**381** mối nối), 122 lượt có mối nối nằm *giữa* một câu. Theo game
(ghép / tổng): Xe buýt 97/118, Dẫn đường 24/38, Pattern 2/15.

Pilot cùng ngày: 10 câu Xe buýt đọc **nguyên câu** bằng VieNeu-TTS (giọng
`dodo-clone2`), temperature 0.7 / 0.9 / 1.2 × 3 take = 90 take. Chủ sản phẩm
chốt «lần 1 với 0.7 rất ok» → **temperature 0.7**.

BRD §9 đã định hướng khoá `templateId + params + voiceVersion`, và bảng rủi ro
§16 ghi sẵn biện pháp cho "Audio template nghe rời rạc": render theo câu hoàn
chỉnh. Change này hiện thực hoá điều đó.

## What Changes

- **Câu liền ở cấp CÂU, render lúc authoring.** Mỗi câu ghép (một số/từ chèn
  vào một mảnh câu) có một "line" riêng, được kido-pipeline tổng hợp nguyên câu,
  qua Human Gate, rồi bundle vào app trong pack `explore-audio-vi-v5`. Câu cố
  định vốn đã là một clip (`nb_hidden_q`, `nb_total_q`, `fb_*`…) không đổi.
- **Mobile là nguồn chuẩn của line.** Module thuần mới
  `mobile/src/explore/promptLines.ts`: khoá
  `explore-audio:vi:line:<templateId>:<params>:v1`, mỗi template dựng `refs`
  chỉ bằng các key builder sẵn có trong `promptAudio.ts`, transcript theo
  persona Đô Đô/bé, và miền tham số phủ mọi bộ đọc được. Template cần có:
  `nb_today`, `nb_total`, `nb_inside`, `nb_remodel`, `nb_gom`, `nb_gop`,
  `number_after`, `route_check_arrow`, `pattern_hint_step` (thêm
  `number_before`, `fb_level_up` hay «Bé hãy chọn số» N chỉ khi đọc được).
  Lời theo đúng phong cách câu pilot đã duyệt («Sáu gồm bốn và hai!», «Gộp hai
  và ba được năm!», «Số nào đứng sau số bảy?», «Có tất cả sáu bạn nhé.»,
  «Trong xe có năm bạn rồi nha.», «Hôm nay mình chơi với số bốn!», «Số ba ở
  trong xe rồi, mình đếm thêm nha!»); câu pilot chỉ thành line khi tham số đọc
  được — «Gộp hai và ba được năm!» thì không, vì xếp lên xe chỉ có tổng 3–4.
- **Manifest JSON mobile → pipeline.** Mobile sinh và commit
  `mobile/src/explore/explorePromptLines.generated.json`
  (`npm run explore-lines:dump`); kido-pipeline đọc file này, không chép tay
  transcript.
- **Phát có fallback.** `audio.ts` gom `audioRefs` thành đoạn bằng resolver
  thuần `resolvePromptSegments` (khớp dài nhất, trái → phải): line có trong
  registry thì phát MỘT clip, không có thì phát các clip ghép y như hôm nay.
  Giữa hai câu chèn nghỉ 280 ms (huỷ được). `exercise.audioRefs`, generator,
  validator và mọi key builder **không đổi** — không đổi contract.
- **Thời lượng thật.** Registry sinh ra thêm `EXPLORE_AUDIO_DURATIONS_MS` (đo từ
  PCM đã cắt lặng). `estimateSpeechMs` của Xe buýt dùng số thật; thần chú
  gồm/gộp canh highlight theo vị trí âm tiết trong clip thay cho mốc cố định
  (giữ nguyên mốc cũ khi chưa có thời lượng).
- **Sửa số thứ tự.** Câu nâng đỡ Dẫn đường đọc «thứ nhất», «thứ tư» thay cho
  «thứ một», «thứ bốn» của bản ghép.
- **Pipeline.** `generate` thêm mọi line của manifest (khoá diacritic-safe, WAV,
  `pending_review`, không bao giờ tự duyệt) kèm QC tốc độ đọc 150–400 ms/âm
  tiết (tự gen lại tối đa 2 lần); `review`/`approve`/`reject` thấy line;
  `export` bắt buộc đủ line (fail-closed), xuất line dạng AAC `.m4a`, clip cũ
  giữ WAV; `trim` bỏ qua file không phải `.wav`. Pack version → v5.

### Đã cân nhắc và loại

- **TTS lúc chạy, trên máy hoặc server.** Loại vì:
  - BRD §3 mục 8 (`docs/KIDO_EXPLORE_BRD.md:69`): không gọi TTS không kiểm soát
    trong lúc trẻ chơi.
  - `openspec/specs/explore-stateless-privacy/spec.md:10`: không được truyền
    exercise/đáp án — gửi «Sáu gồm bốn và hai» lên server chính là truyền bài.
  - Offline-audio (`enable-explore-offline-audio`, BRD §3 mục 12): game local
    phải chơi được trong airplane mode với dependency đã bundle.
  - Hạ tầng: VPS 4 GB, VieNeu chạy CPU một luồng — không phục vụ được nhiều bé
    cùng lúc với độ trễ chấp nhận được.
  - Human Gate: mọi câu đọc cho trẻ phải được người nghe và duyệt trước khi
    phát; tổng hợp lúc chạy bỏ qua bước này.
- **Thu cả lượt nói nhiều câu thành một clip** (mở màn + đề + câu hỏi): tổ hợp
  nổ theo mode × số và trùng lặp; nghỉ tự nhiên giữa hai câu đã nghe ổn.
- **Chỉnh mối nối (crossfade, cắt sát hơn) cho bản ghép**: không sửa được ngữ
  điệu — vấn đề nằm trong từng mảnh, không ở mối nối.
- **Gen lại toàn bộ pack v4**: ngoài phạm vi; clip v4 giữ nguyên, làm fallback.

## Capabilities

### Modified Capabilities

- `explore-prompt-audio`: phát theo đoạn (line nguyên câu ưu tiên, clip ghép là
  fallback, nghỉ giữa câu); thêm khoá line cấp câu, manifest, thời lượng thật
  cho nhịp Xe buýt, pack v5; câu nâng đỡ Dẫn đường đọc số thứ tự.
- `explore-audio-pipeline`: sinh/duyệt/export thêm line từ manifest, QC tốc độ
  đọc, line xuất `.m4a`, registry kèm thời lượng, export fail-closed cả với line.

## Impact

- **Mobile:** `promptLines.ts` (mới), `explorePromptLines.generated.json` +
  `scripts/dump-explore-prompt-lines.cjs` (mới), `audio.ts` (resolver + nghỉ
  giữa câu + `bundledLineDurationMs`), `exploreAudioRegistry.generated.ts` (thêm
  `EXPLORE_AUDIO_DURATIONS_MS`, rỗng tới lần export sau),
  `numberBus/useBusSequencer.ts`, `numberBus/stage.ts`,
  `exploreAudioCapability.ts` (+v5). Bundle tăng khoảng 0,5–1 MB (93 line AAC).
- **kido-pipeline:** `src/explore/*` (generate, approval, export, trim, pack
  version), `src/scripts/explore-audio.ts` (ghi chú `VIENEU_TEMPERATURE=0.7`).
  Một batch audio mới qua Human Gate.
- **Docs:** BRD §9 + bảng rủi ro §16, `docs/AI_CONTEXT.md`, ghi chú trong
  `add-explore-prompt-audio` và `add-explore-route-feedback-audio`.
- **kido-server: không đổi.** Không đổi schema, contract, curriculum, progress,
  reward; không lịch sử/analytics Khám phá (`docs/EXPLORE_ZERO_HISTORY.md`).
- Chưa export line thì app phát y như hôm nay: rollout gắn với pack v5.
- **Thứ tự archive:** `explore-prompt-audio` và `explore-audio-pipeline` mới chỉ
  là delta chưa archive, nên change này chỉ archive được SAU
  `add-explore-prompt-audio` rồi `add-explore-route-feedback-audio`; archive
  trước thì `openspec archive` dừng ("target spec does not exist").
