# Media Migration — Handoff (R2 + VieNeu + AAC)

> Cập nhật: 2026-09-21 · Viết cho người **tiếp tục** đợt chuyển media: code đã
> xong và đã lên `main` của cả 4 repo, nhưng **chưa có gì chạy lên production** —
> chưa copy một object nào, chưa sinh lại một clip nào.
>
> Tài liệu này để **làm tiếp**. [`KIDO_MEDIA_STORAGE.md`](./KIDO_MEDIA_STORAGE.md)
> để **tra quyết định và lý do**; khi hai bên lệch nhau thì file kia thắng về
> phần "tại sao", file này thắng về phần "đang ở đâu".
>
> Cấu trúc repo: `kido-app/` là **multi-repo**. Root = `duyht56/dodokids`
> (`docs/`, `openspec/`), `kido-pipeline/` = `kido-tth/content-pipeline`,
> `kido-server/` = `kido-tth/backend`, `mobile/` = `kido-tth/mobile`,
> `landing/` = `duyht56/kido`. Mỗi repo commit + push riêng.

---

## 0. Đang ở đâu

Ba việc chốt cùng một lượt vì đợt regen audio ghi đè toàn bộ object, nên không
còn bài toán backfill:

1. Storage of record: GCS → **Cloudflare R2**
2. TTS tiếng Việt: Gemini/Sulafat → **VieNeu-TTS v3 Turbo** (tiếng Anh giữ Gemini)
3. Clip bài học: WAV 24 kHz → **AAC-LC 32k `.m4a`**

| Repo | Commit | Nội dung |
|---|---|---|
| content-pipeline | `a306d94` | toàn bộ code + 2 script migrate + 21 test |
| backend | `586528f` | `.env.example`: `PUBLISH_ASSET_ALLOWED_HOSTS` |
| dodokids | `6509b59` | `KIDO_MEDIA_STORAGE.md` + cập nhật 3 doc cũ |

### Đã kiểm chứng

- `npx tsc -p tsconfig.build.json --noEmit` — không lỗi mới.
- 21 test mới pass, trong đó có **test chạy ffmpeg thật** (assert box `ftyp`
  của MP4) → đường encode WAV→m4a đã chứng minh chạy được trên máy dev.
- Toàn bộ suite pipeline: **550/555**.

### CHƯA kiểm chứng — đọc kỹ trước khi tin

- **VieNeu chưa từng được pipeline gọi thật lần nào.** Test định tuyến
  (`tts-routing.test.ts`) mock `vieneuTtsService`, nó chỉ chứng minh *đúng
  provider được gọi với đúng text*, không chứng minh server trả về audio dùng
  được. Lần gọi end-to-end đầu tiên là ở bước §2.1 bên dưới.
- **R2 chưa từng nhận một byte nào.** `storage.service.ts` chưa chạy ngoài test.
- **5 test fail sẵn** từ trước đợt này (đã stash code rồi chạy lại trên cây sạch
  để xác nhận): `vi-label.test.ts` (3), `review.prompt.test.ts` (1),
  `visual-presentation.test.ts` (1). Xem §6.

---

## 1. Việc BẮT BUỘC làm trước, ngoài code

Không có bước nào ở §2 chạy được trước khi xong mục này.

### 1.1 Dựng R2

1. Tạo 2 bucket: `kido-assets-images`, `kido-assets-audio`.
2. **Bind custom domain** cho từng bucket (vd `assets.dodokids.vn`,
   `audio.dodokids.vn`).
   > ⚠️ Tuyệt đối không dùng `<id>.r2.dev`. Host đó bị rate-limit, không cache ở
   > edge, và Cloudflare ghi rõ nó chỉ để debug. `storage.service.ts` sẽ ném lỗi
   > nếu `R2_PUBLIC_BASE_*` rỗng, nhưng nó **không** phát hiện được anh điền
   > nhầm `r2.dev` vào đó.
3. Quyền bucket: **chỉ mở đọc object, KHÔNG mở liệt kê.**
   > 🔒 Hai bucket GCS hiện tại đang cho phép anonymous LIST — bất kỳ ai cũng
   > `curl "https://storage.googleapis.com/kido-assets-audio-v2/?max-keys=1000"`
   > để liệt kê rồi hút sạch catalog. Đó là cách đếm ra con số ở §5. Đừng lặp lại.
4. Tạo API token R2 (Object Read & Write) → điền `R2_*` trong
   `kido-pipeline/.env` (mẫu đầy đủ ở `.env.example`).

### 1.2 Mở allowlist trên kido-server

```
PUBLISH_ASSET_ALLOWED_HOSTS=assets.dodokids.vn,audio.dodokids.vn,storage.googleapis.com
```

`asset-url.checker.ts:99-131`: biến **rỗng = không giới hạn host**. Nhưng nếu nó
*được đặt* mà thiếu domain R2 thì `/admin/publish` loại sạch asset URL với
`host_not_allowed`, và lỗi chỉ lộ ra ở tận bước publish sau khi đã sinh xong.

Giữ `storage.googleapis.com` trong danh sách cho tới khi app đã cài refetch xong
URL ảnh đã migrate.

### 1.3 Bật VieNeu

```bash
cd D:/project/vieneu-tts && uv run python -m apps.openai_speech
```

Phải chạy trước **mọi** job audio. Pipeline cố ý **fail clip + ghi log** khi
không gọi được chứ không im lặng rơi về Gemini — một bộ clip nửa VieNeu nửa
Gemini đúng là thứ đợt này sinh ra để dẹp.

Muốn quay về giọng cũ toàn bộ: `TTS_VI_PROVIDER=gemini`.

---

## 2. Runbook — thứ tự có ràng buộc

### 2.1 Pilot VieNeu — làm TRƯỚC MỌI THỨ

Đây là việc quan trọng nhất còn lại, và là lần đầu tiên VieNeu được gọi thật.

```bash
cd kido-pipeline
npm run regen:audio -- --week 1 --limit 3
```

Cần rút ra **ba** thứ, và phải chốt xong trước khi chạy lô lớn:

| Đo cái gì | Vì sao |
|---|---|
| Giây/clip trên CPU/ONNX | RTF 0,76 trong ghi chú cũ suy ra ~10.000 clip ≈ **8–9 tiếng** chạy liên tục. Đó là suy luận, chưa phải số đo. |
| **Nghe** giọng `Ngọc Huyền` | Đổi giọng sau khi đã sinh 10.000 clip = chạy lại từ đầu. `GET /v1/voices` liệt kê các preset có sẵn. |
| **Nghe** clip tiếng Anh (Gemini) | Xác nhận đường `en` không bị đợt này làm hỏng. |

> Nếu nghe thấy clip đọc to câu "Nói bằng tiếng Việt giọng miền Bắc chuẩn…" thì
> định tuyến đã hỏng: đó là prefix chỉ-dẫn-không-phát-ra của riêng Gemini, VieNeu
> là TTS thuần nên sẽ đọc nó. `tts-routing.test.ts` khoá luật này, nhưng vẫn phải
> nghe một lần bằng tai.

### 2.2 Bê ảnh sang R2

Ảnh **copy nguyên bytes**, không sinh lại — chúng đã là WebP downscale và đã qua
Human Gate; sinh lại vừa tốn tiền vừa đổi tranh đã duyệt.

```bash
npm run migrate:images-r2 -- --dry-run     # xem trước, không ghi gì
npm run migrate:images-r2                  # copy object + đổi URL trong Mongo
```

Chạy lại được: object đã có trong R2 thì bỏ qua, phép đổi URL chỉ khớp prefix cũ
nên lượt hai là no-op (có test: `asset-url-rewrite.test.ts`).

Cờ khác: `--skip-copy` (chỉ đổi URL), `--skip-db` (chỉ copy object),
`--limit N`, `--force`.

### 2.3 Regen audio — theo lô, đừng chạy cả bộ

```bash
npm run regen:audio -- --dry-run --week 1
npm run regen:audio -- --week 1-8
```

- Clip **tiếng Anh cũng được sinh lại**: chúng đổi bucket và đổi định dạng như
  mọi thứ khác, chỉ giữ nguyên engine Gemini.
- Clip thư viện dùng `force: true` → từ dùng chung đang tồn tại ở giọng/định
  dạng cũ bị ghi đè, và bị đưa về `pending_review`.
- Clip nào fail thì **giữ URL cũ**, không để activity thành câm.
- `--skip-done` bỏ qua activity đã ở đúng định dạng đích → dùng khi chạy lại sau
  khi đứt.

### 2.4 Human Gate → publish

Duyệt xong mới publish. Bước publish là chỗ asset staging cục bộ được upload lên
R2 và URL công khai được ghi lại.

```bash
npm run publish:week -- <week>
```

### 2.5 Dọn

Giữ bucket GCS **sống** cho tới khi app đã cài refetch xong URL mới. Sau đó mới
xoá, và bỏ `GCP_BUCKET_*` khỏi `.env` (`GCP_PROJECT`/`GCP_LOCATION` vẫn cần —
Vertex vẫn chạy trên GCP).

---

## 3. Rollback

| Hỏng ở đâu | Làm gì |
|---|---|
| Giọng VieNeu không đạt | `TTS_VI_PROVIDER=gemini` trong `.env`, **restart `dev:all`**, chạy lại `regen:audio`. Không cần đụng code. |
| Muốn giữ WAV thay vì `.m4a` | Đổi `config.tts.clipFormat` về `'wav'` (`src/config/index.ts`), chạy lại regen. |
| R2 có vấn đề | URL cũ trên GCS vẫn sống nếu chưa xoá bucket. Đổi URL ngược lại bằng `migrate:images-r2` với rule đảo — **chưa có cờ sẵn**, phải sửa tay. |
| Publish bị `host_not_allowed` | Thiếu domain R2 trong `PUBLISH_ASSET_ALLOWED_HOSTS` (§1.2). |

> ⚠️ **Worker không hot-reload.** `dev:all` chạy 5 Bull worker qua ts-node thuần.
> Sửa `.env` hay code mà không restart `dev:all` thì worker đang chạy vẫn dùng
> bản cũ. Script standalone (`regen:audio`, `migrate:images-r2`) thì nạp code mới
> ngay.

---

## 4. Bản đồ code

| File | Vai trò |
|---|---|
| `src/services/storage.service.ts` | R2 qua S3 API. `ensureBucketExists` **ném lỗi** thay vì tạo bucket — bucket R2 tạo tự động không bind custom domain, object không ai với tới mà pipeline vẫn báo OK. |
| `src/services/vieneu-tts.service.ts` | Client `/v1/audio/speech`. Serialize theo `VIENEU_CONCURRENCY` (CPU chỉ phục vụ 1–2 stream, quá thì 429). |
| `src/services/tts.service.ts` | Định tuyến ngôn ngữ → engine. **Bỏ hẳn khối prefix khi đi VieNeu.** |
| `src/services/audio-encode.ts` | WAV → AAC `.m4a` qua `ffmpeg-static`. Output ra temp file chứ không pipe (muxer MP4 phải seek lại để ghi `moov`). |
| `src/services/lesson-audio.ts` | `LESSON_CLIP_FORMAT`, `LESSON_CLIP_KEY_MODE`, ngôn ngữ từng slot. |
| `src/services/asset-url-rewrite.ts` | Đổi prefix URL thuần, tách khỏi script để test được. |
| `src/scripts/migrate-images-to-r2.ts` | §2.2 |
| `src/scripts/regen-audio.ts` | §2.3 |

**Ngoại lệ phải nhớ:** kho clip **Khám phá** cố ý giữ `.wav` — nó đóng thẳng vào
bundle app (không tốn egress) và bước export cắt khoảng lặng ở mức WAV. Vì vậy
định dạng là **tham số** của `getOrCreateLibraryClip({ format })` với mặc định
`'wav'`, không phải hằng số toàn cục. **Đổi mặc định là hỏng pack đó.**

---

## 5. Số đo thật — đừng đo lại

Đếm trực tiếp trên bucket production 2026-09-20:

| Bucket | Objects | Dung lượng | TB/object |
|---|---|---|---|
| `kido-assets-images-v2` | 960 | 35 MB | 38 KB |
| `kido-assets-audio-v2` | 1.280 | 247 MB | 197 KB (WAV) |

Ngoại suy 48 tuần × 3 môn ≈ **2–4 GB** → lọt free tier 10 GB của R2.
Egress ≈ **175 MB/máy/tháng** trước khi nén; sau khi nén còn ~**16 MB**.

Latency đo từ kết nối VN (3 mẫu RTT TCP):

| Endpoint | RTT | Throughput file 1,1 MB |
|---|---|---|
| Cloudflare edge | 23–36 ms | 1,9–2,3 MB/s |
| `storage.googleapis.com` (cũ) | 25–45 ms | 1,9–2,9 MB/s |

`curl https://cloudflare.com/cdn-cgi/trace` từ VN trả `colo=HKG` / `colo=SIN` —
mạng VN **không** vào PoP Cloudflare ở HN/SGN. Throughput vẫn ngang GCS nên đây
là ghi chú vận hành, không phải lý do chặn. Nếu đứt cáp biển làm số này xấu đi
rõ rệt thì phương án dự phòng là mirror nội địa (Bizfly ~500đ/GB, đo được 16–37
ms) — **chỉ làm khi đo được**, đừng làm phòng xa.

---

## 6. Việc treo & rủi ro đã biết

### 6.1 `npm run build` của kido-pipeline đang hỏng — có sẵn từ trước

`src/curriculum/vi-label-map.ts` có 5 key trùng (TS1117, dòng 713–716 và 725),
kéo theo 3 test trong `vi-label.test.ts`. **Nghĩa là pipeline chưa build/deploy
được**, không liên quan đợt này (đã xác nhận bằng cách stash rồi chạy lại trên
cây sạch).

Sửa đúng không phải là xoá bớt key trùng: comment quanh dòng 723–726 cho thấy
key là biến thể của key đã có (`iron` ↔ `steam_iron` = "bàn là") phải khai vào
**nhóm synonym**, và luật "không để biến thể miền Nam lọt vào map" đã freeze
2026-07-16. Đụng vào là phải cập nhật doc canonical cùng lượt
(`KIDO_LANG_CURRICULUM.md`, `KIDO_LANG_SKILL_CATALOG.md`).

### 6.2 Commit `586528f` của kido-server mô tả sai nội dung

Commit đó ghi "Không đụng code" nhưng thực tế có kèm 26 dòng của
`explore.number-bond-arithmetic.spec.ts` — bị quét nhầm vào do `git add -A` khi
working tree còn việc dở của đợt number-bond. Nội dung file đúng và test 20/20
pass; chỉ message sai. Sửa message phải force-push `main` nên **để nguyên, ghi
lại ở đây**.

### 6.3 Chưa làm, cố ý

- **Pack Khám phá vẫn WAV** — 200 file, 14 MB bundle thẳng vào IPA/APK. Chuyển
  sang `.m4a` sẽ bớt ~12,5 MB dung lượng tải app. Việc riêng, chưa mở.
- **Tiếng Anh chưa thử VieNeu.** Model card ghi v3 Turbo có code-switching
  Anh–Việt (~10k giờ EN–VI), nên về lý thuyết gộp được về một engine. Nhưng sản
  phẩm này **dạy** tiếng Anh: phát âm sai là lỗi nội dung. Muốn gộp thì sinh thử
  ~20 clip EN rồi nghe A/B với Gemini trước, đừng gộp thẳng.
- **Chưa có cờ rollback URL** cho `migrate:images-r2` (xem §3).

---

## 7. Liên quan

- [`KIDO_MEDIA_STORAGE.md`](./KIDO_MEDIA_STORAGE.md) — quyết định và lý do.
- [`KIDO_CONTENT_PIPELINE.md`](./KIDO_CONTENT_PIPELINE.md) — vòng đời nội dung.
- [`KIDO_PIPELINE.md`](./KIDO_PIPELINE.md) — runbook vận hành, bảng biến môi trường.
- [`AI_CONTEXT.md`](./AI_CONTEXT.md) — Source Hierarchy (mục 13).
