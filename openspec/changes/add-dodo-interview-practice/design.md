# Design — Luyện phỏng vấn cùng Đô Đô

## Bối cảnh

Kido đã có: playback audio pre-generate + cache offline (`mobile/src/services/speech.ts`, `assetCache.ts`), pipeline TTS Gemini giọng Sulafat/Puck (`kido-pipeline/src/services/tts.service.ts`) + GCS, mascot animation (`ExploreMascot`), parental gate, IAP/entitlements (2 SKU), NestJS + Redis. Chưa có: mic permission, websocket/streaming, LLM runtime. Tài liệu `docs/KIDO_ENGLISH_CURRICULUM.md:47` từng loại mic/ASR khỏi MVP vì rủi ro ASR giọng trẻ.

## Quyết định kiến trúc

### 1. Không TTS realtime — mọi lời Đô Đô là clip duyệt sẵn

Format phỏng vấn là kịch bản: lời Đô Đô chỉ gồm (a) ~50–100 câu hỏi, (b) ~20 clip dẫn/chuyển, (c) ~15 clip phản hồi chọn theo mức điểm. Ba tập hữu hạn này pre-generate một lần qua pipeline TTS và đi qua Human Gate như content thường. Hệ quả:

- Latency hỏi–đáp = 0 (quan trọng với trẻ 5 tuổi, không có khoảng chờ 2–4s).
- Giọng Đô Đô đồng nhất với bài học (cùng giọng Sulafat/Puck).
- Không rủi ro model nói câu không phù hợp với trẻ (Apple/Google Families đặt trách nhiệm này lên developer).
- Câu hỏi chạy offline sau prefetch; chỉ cần mạng khi upload câu trả lời.
- Không cần websocket/sticky-session sau Caddy 4 replica.

Trade-off chấp nhận: Đô Đô không đối đáp bằng giọng theo nội dung câu trả lời; phản hồi giọng chỉ chọn từ pool template, phản hồi cá nhân hóa nằm ở report text phụ huynh. Hội thoại tự do là phạm vi Phase 2, ngoài change này.

### 2. Chấm async qua queue, không realtime

Chiều động duy nhất là bé → server: upload file audio từng câu (multipart, retry queue phía client), worker BullMQ trên Redis sẵn có gọi Vertex Gemini Flash (audio understanding trực tiếp, không cần STT rời) với rubric prompt → structured JSON. Phiên của bé không bao giờ chờ kết quả chấm; màn kết thúc hiển thị ngay. Kiến trúc stateless, chạy nguyên trạng trên 4 replica.

### 3. Module riêng, không phải actionType

Phỏng vấn không phải activity trong lesson: không thêm `actionType` vào `docs/kido-activity-schema.ts`, không đụng `mapServerLesson`. Server có module `interview` riêng (session, answer, result, consent-check); mobile có stack màn hình riêng ngoài Khám phá (ràng buộc C-13 Khám phá free 100%).

### 4. Provider: Vertex Gemini Flash

Cùng stack GCP/Vertex pipeline đang dùng (`@google/genai`, ADC) — không thêm nhà cung cấp mới vào bề mặt compliance; audio input Flash rẻ (~500–1.300đ/phiên 10 câu, đã gồm chấm); cấu hình zero-retention/no-training của Vertex là căn cứ khai báo với 2 store. Log token/phiên để đối chiếu cost thực tế.

### 5. Persona

Đô Đô xưng "Đô Đô", gọi "bé" (quyết định 2026-09-11, áp dụng toàn app). Ghi thành `docs/KIDO_DODO_PERSONA.md` (canonical): quy tắc xưng hô + giọng điệu (ngắn, vui, không mệnh lệnh, không chê). Rubric prompt của worker cũng phải sinh feedback theo persona này. Copy Explore hiện lệch chuẩn ("Con hãy chạm…") sửa ở change riêng vì kéo theo regen audio batch.

### 6. Dữ liệu & retention

- Bản ghi: upload lên storage tạm (GCS bucket riêng, không phải bucket audio content), worker chấm xong → xóa file. Mặc định không lưu audio; "cho phụ huynh nghe lại bản ghi" không nằm trong phạm vi mặc định (nếu POC fail thì phương án lùi mới bật lưu-có-consent).
- Lưu lâu dài: điểm theo câu, transcript tóm tắt, feedback — gắn childId ẩn danh sẵn có (không PII).
- Request AI: đi từ kido-server, không kèm định danh thiết bị/trẻ.

## Go/No-Go (Phase 0)

Bộ mẫu ≥20 bản ghi giọng trẻ 5–6 tuổi thật (Việt + Anh, có nhiễu, có nói nhỏ). Ngưỡng: ≥85% câu rõ ràng được hiểu đúng nội dung; 0 false-negative gắt (câu đúng bị chấm sai) — rubric thiết kế "không chắc → chưa nghe rõ". Không đạt → lùi về phương án không AI (bản ghi + checklist phụ huynh), giữ nguyên UX phiên.

## Rủi ro chính

| Rủi ro | Giảm thiểu |
|---|---|
| Apple Kids Category reject vì gửi giọng trẻ sang AI bên thứ ba (tiền lệ 5.1.1(i)/5.1.2(i)) | Consent phụ huynh nêu đích danh provider; proxy 100% qua kido-server; zero-retention; audio xóa sau chấm; sẵn kịch bản kháng nghị; phương án lùi không AI |
| ASR/model hiểu sai giọng trẻ → phản hồi gây ức chế | Gate Phase 0; rubric hào phóng; "chưa nghe rõ" thay vì "sai"; bé chỉ thấy phản hồi tích cực |
| Privacy policy hiện cam kết "Không ghi âm" | Viết lại policy + Data safety + nutrition label TRƯỚC khi ship; inventory quyền khớp manifest 100% (checklist §2.5) |
| Cost trượt nếu dùng nhiều | Cap 2 phiên/bé/ngày server-side; log token/phiên; câu hỏi audio ~0đ marginal |

## Ngoài phạm vi

Chat tự do theo lượt (Phase 2), realtime speech-to-speech + gói add-on riêng (Phase 3), sửa xưng hô copy Explore (change riêng), `watch_video`.
