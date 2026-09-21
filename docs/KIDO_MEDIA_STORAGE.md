# Kido Media Storage & Voice

**Trạng thái:** CHỐT 2026-09-21
**Phạm vi:** nơi lưu ảnh/âm thanh đã publish, định dạng clip, và engine TTS theo ngôn ngữ.
**Code:** `kido-pipeline/src/services/{storage,tts,vieneu-tts,audio-encode}.service.ts`,
`kido-pipeline/src/services/{lesson-audio,audio-library,asset-url-rewrite}.ts`

Tài liệu này là nguồn chân lý cho ba quyết định gắn với nhau. Khi
`KIDO_PIPELINE.md` hay `KIDO_CONTENT_PIPELINE.md` còn nói "GCS", tài liệu này
thắng.

---

## 1. Storage of record: Cloudflare R2

Ảnh và âm thanh đã publish nằm ở **Cloudflare R2**, không còn ở Google Cloud
Storage. Vertex AI (Gemini text/image, TTS tiếng Anh) vẫn chạy trên GCP — chỉ
phần *lưu trữ media* chuyển đi.

### Vì sao

Kho nội dung rất nhỏ nhưng **mọi thiết bị đều prefetch rồi cache**
(`mobile/src/services/assetCache.ts`), nên hoá đơn gần như toàn bộ là egress,
không phải dung lượng.

Số đo thật (2026-09-20, đếm trực tiếp trên bucket production):

| Bucket | Objects | Dung lượng | TB/object |
|---|---|---|---|
| `kido-assets-images-v2` | 960 | 35 MB | 38 KB |
| `kido-assets-audio-v2` | 1.280 | 247 MB | 197 KB (WAV) |

Ngoại suy 48 tuần × 3 môn ≈ **2–4 GB** — lọt trong free tier 10 GB của R2.
Egress ≈ **175 MB/máy/tháng** trước khi nén audio.

| Nhà cung cấp | Egress | 1k máy | 10k máy | 50k máy |
|---|---|---|---|---|
| **Cloudflare R2** | **$0** | ~$0 | ~$1 | ~$5 |
| Bizfly CDN (VN) | 500đ/GB | $3,4 | $33 | $158 |
| Bunny.net (Asia) | $0,03/GB | $5,3 | $53 | $263 |
| GCS (cũ) | $0,12/GB | $21 | $210 | $1.050 |

### Latency: không mất gì

Đo từ kết nối VN (3 mẫu RTT TCP, 2026-09-20):

| Endpoint | RTT | Throughput file 1,1 MB |
|---|---|---|
| `vngcloud.vn` (VN) | 5–9 ms | — |
| `hn.ss.bfcplatform.vn` (Bizfly HN) | 16–37 ms | — |
| Cloudflare edge | 23–36 ms | 1,9–2,3 MB/s |
| `storage.googleapis.com` (cũ) | 25–45 ms | 1,9–2,9 MB/s |
| `bunny.net` | 52–79 ms | — |

> ⚠️ `curl https://cloudflare.com/cdn-cgi/trace` từ VN trả `colo=HKG` /
> `colo=SIN`. Mạng VN **không** được route vào PoP Cloudflare ở HN/SGN —
> VNPT/Viettel và toàn bộ 3G/4G/5G đi vòng qua Hong Kong/Singapore. Dù vậy
> throughput đo được vẫn ngang GCS, nên đây là ghi chú vận hành, không phải lý
> do chặn. Nếu đứt cáp biển làm số này xấu đi rõ rệt thì phương án dự phòng là
> mirror nội địa (Bizfly/VNCDN) — chỉ làm khi **đo được**, không làm phòng xa.

### Luật vận hành

- **`R2_PUBLIC_BASE_*` BẮT BUỘC là custom domain.** Host `<id>.r2.dev` bị
  rate-limit, không cache ở edge, và Cloudflare ghi rõ nó chỉ để debug.
- **Object key giữ nguyên** (`images/<file>`, `audio/<file>`) so với GCS. Nhờ
  vậy migrate chỉ là đổi host.
- **Không tự tạo bucket.** `ensureBucketExists` giờ *ném lỗi* thay vì
  `createBucket`: một bucket R2 tạo tự động sẽ không có custom domain nào bind
  vào, mọi object trong đó không app nào với tới được, mà pipeline vẫn báo thành
  công.
- **`Cache-Control: public, max-age=31536000, immutable`** cho mọi object. Clip
  hay sprite sinh lại luôn mang key mới chứ không ghè lên key cũ.
- **kido-server:** nếu `PUBLISH_ASSET_ALLOWED_HOSTS` có giá trị thì nó **phải**
  chứa hai domain R2, nếu không `/admin/publish` loại sạch với
  `host_not_allowed`.

---

## 2. Định dạng clip: AAC-LC trong `.m4a`

Mọi clip **bài học** gửi xuống thiết bị là AAC-LC 32 kbps mono, 24 kHz, trong
container `.m4a` (`LESSON_CLIP_FORMAT`).

| | KB/giây | TB/clip (~4,1s) | Kho ~10.000 clip |
|---|---|---|---|
| Gemini 24 kHz WAV (cũ) | 48 | 197 KB | 1,97 GB |
| VieNeu 48 kHz WAV | 96 | 394 KB | 3,94 GB |
| **AAC 32k `.m4a`** | **4** | **~20 KB** | **~0,2 GB** |

> **KHÔNG dùng Opus.** iOS/AVFoundation không có demuxer Ogg lẫn WebM, nên clip
> Opus đơn giản là không phát được dưới `expo-audio` (chỉ chạy nếu bọc trong
> container CAF của Apple). `.m4a` chạy native trên cả iOS lẫn Android. Đây là
> ràng buộc kỹ thuật, không phải lựa chọn thẩm mỹ.

Content-Type khi upload là `audio/mp4` — không phải `audio/m4a` (không phải
media type hợp lệ). Sai Content-Type là lý do phổ biến khiến clip tải về được
nhưng không phát.

### Ngoại lệ: kho clip Khám phá vẫn là WAV

`mobile/src/assets/audio/explore/*.wav` (200 file, 14 MB) **đóng thẳng vào
bundle app**, không đi qua mạng, nên không tốn egress; và bước export của nó cắt
khoảng lặng ở mức WAV (`trimExploreAudioSilence.ts`). Vì vậy định dạng là **tham
số** của `getOrCreateLibraryClip({ format })` với mặc định `'wav'`, chứ không
phải hằng số toàn cục. Đổi mặc định là hỏng pack đó.

*(Chuyển pack Khám phá sang `.m4a` sẽ bớt ~12,5 MB dung lượng tải app — việc
riêng, chưa làm.)*

---

## 3. TTS: tách theo ngôn ngữ

| Ngôn ngữ | Engine | Giọng |
|---|---|---|
| `vi` | **VieNeu-TTS v3 Turbo** (server OpenAI-compatible cục bộ) | preset, mặc định `Ngọc Huyền` |
| `en` | **Gemini** (không đổi) | `TTS_VOICE_EN`, mặc định `Puck` |

Định tuyến **không** nằm ở chỗ gọi: `lesson-audio.ts` quyết định ngôn ngữ của
từng slot (`audioLangForField`, `audioLangForOptions` — môn tiếng Anh đọc
`question`/`correct`/`hint1` bằng tiếng Anh, `hint2`/`explain` bằng tiếng Việt),
rồi `tts.service.ts` ánh xạ ngôn ngữ → engine.

### Vì sao đổi tiếng Việt

Sulafat là giọng đa ngôn ngữ **không khoá vùng miền**, nên tiếng Việt trôi
Bắc/Nam từng clip qua ~9.600 clip narration. Một giọng preset của VieNeu là một
người nói cố định cho cả bộ. Weights Apache-2.0, model card cho phép dùng thương
mại.

### Vì sao KHÔNG đổi tiếng Anh

VieNeu v3 Turbo có quảng cáo code-switching Anh–Việt (~10k giờ EN–VI), nhưng sản
phẩm này **dạy** tiếng Anh: phát âm sai là lỗi nội dung. Cần nghe A/B trước khi
giao 384 activity tiếng Anh cho nó. Đến lúc đó, tiếng Anh ở nguyên chỗ cũ.

### ⚠️ Bẫy: VieNeu KHÔNG nhận prefix

`TTS_WRAP_PREFIX` / `TTS_BARE_PREFIX` ("Nói bằng tiếng Việt giọng miền Bắc
chuẩn…") là **chỉ dẫn không phát ra** — một mẹo riêng của đường
`generateContent` audio-out của Gemini. VieNeu là TTS thuần: nó sẽ **đọc to**
prefix đó. `tts.service.ts` vì vậy bỏ hẳn khối prefix khi đi đường VieNeu, và
`opts.wrap` trở nên vô nghĩa với nó — chất giọng đến từ `VIENEU_VOICE`.

Luật này được khoá bằng test: `src/services/tts-routing.test.ts`.

### Vận hành

VieNeu phải **đang chạy** trước mọi job audio:

```bash
cd D:/project/vieneu-tts && uv run python -m apps.openai_speech
```

Pipeline **fail clip và ghi log** khi không gọi được, chứ không im lặng rơi về
Gemini — một bộ clip nửa VieNeu nửa Gemini chính là thứ thay đổi này sinh ra để
dẹp. Muốn quay về giọng cũ toàn bộ thì đặt `TTS_VI_PROVIDER=gemini`.

Host CPU/ONNX chỉ phục vụ 1 stream (fp32) hoặc 2 (int8); quá số đó là xếp hàng
rồi 429. `VIENEU_CONCURRENCY` mặc định 1.

---

## 4. Runbook migrate

Thứ tự **có ràng buộc**: chỉ regen audio sau khi R2 đã sẵn sàng, vì clip mới
staging cục bộ rồi mới upload lúc publish.

### 4.1 Chuẩn bị R2 (một lần, ngoài code)

1. Tạo 2 bucket: `kido-assets-images`, `kido-assets-audio`.
2. Bind custom domain cho từng bucket (vd `assets.dodokids.vn`,
   `audio.dodokids.vn`). **Không dùng `r2.dev`.**
3. Tạo API token R2 (Object Read & Write) → điền `R2_*` trong
   `kido-pipeline/.env`.
4. Thêm hai domain vào `PUBLISH_ASSET_ALLOWED_HOSTS` trên kido-server (giữ cả
   `storage.googleapis.com` cho tới khi app đã refetch xong).

### 4.2 Bê ảnh sang (không sinh lại)

Ảnh được **copy nguyên bytes** — chúng đã là WebP downscale và đã qua Human
Gate; sinh lại vừa tốn tiền vừa đổi tranh đã duyệt.

```bash
cd kido-pipeline
npm run migrate:images-r2 -- --dry-run     # kiểm trước
npm run migrate:images-r2                  # copy object + đổi URL trong Mongo
```

Chạy lại được: object đã có trong R2 thì bỏ qua, và phép đổi URL chỉ khớp prefix
cũ nên lượt hai là no-op.

### 4.3 Regen toàn bộ audio

```bash
# Bật VieNeu trước
npm run regen:audio -- --dry-run --week 1
npm run regen:audio -- --week 1-8
npm run regen:audio                        # cả bộ
```

Clip tiếng Anh **cũng** được sinh lại — chúng đổi bucket và đổi định dạng như
mọi thứ khác, chỉ là giữ nguyên engine. Clip thư viện dùng `force: true` để từ
dùng chung đang tồn tại ở giọng/định dạng cũ bị ghi đè thay vì tái dùng; việc đó
đưa chúng về `pending_review`.

### 4.4 Publish

Human Gate duyệt → `npm run publish:week -- <week>`. Bước publish upload mọi
asset staging cục bộ lên R2 và ghi lại URL công khai.

### 4.5 Dọn

Giữ bucket GCS **sống** cho tới khi app đã cài refetch xong URL mới. Sau đó mới
xoá, và bỏ `GCP_BUCKET_*` khỏi `.env`.

> 🔒 **Việc cần làm kèm:** hai bucket GCS hiện cho phép **anonymous LIST** — ai
> cũng liệt kê và hút sạch catalog được. Khi tạo bucket R2 đừng lặp lại: chỉ mở
> đọc object, không mở liệt kê.

---

## 5. Liên quan

- `docs/KIDO_CONTENT_PIPELINE.md` — vòng đời nội dung (bước Image/Audio).
- `docs/KIDO_PIPELINE.md` — runbook vận hành, bảng biến môi trường.
- `docs/KIDO_VISUAL_ASSET_SYSTEM.md` — hệ thống asset hình ảnh.
- `docs/kido-activity-schema.ts` — hợp đồng `audioFiles`, `AudioReference`.
