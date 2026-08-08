## Why

Kido đang có nhiều lớp phần thưởng nhưng semantics không còn nhất quán: công thức sao vẫn mang ngưỡng từ lesson 6 hoạt động trong khi contract hiện tại là 8, XP được hiển thị dù chưa có công dụng, sticker chỉ kích hoạt theo D5 và mới có metadata cho 12/48 tuần, còn tiến độ online/offline có thể lệch nhau hoặc làm phần thưởng vừa nhận biến mất. Cần chốt lại một hệ thống phần thưởng low-pressure, offline-safe và có một nguồn sự thật trước khi tiếp tục đầu tư UI/art cho bộ sưu tập.

## What Changes

- Ẩn XP khỏi trải nghiệm trẻ em V1 nhưng giữ field, phép cộng và dữ liệu XP nội bộ để tương thích; không migration hoặc xóa lịch sử XP trong change này.
- Đổi công thức sao cho lesson 8 hoạt động: 6-8 câu đúng ngay lần đầu = 3 sao, 3-5 = 2 sao, 0-2 = 1 sao; hoàn thành luôn có ít nhất 1 sao và replay chỉ có thể nâng best-star.
- Chỉ cấp sticker khi trẻ hoàn thành toàn bộ lesson canonical bắt buộc của tuần; học bù lesson còn thiếu vẫn kích hoạt sticker, sao không ảnh hưởng điều kiện, và mỗi tuần chỉ cấp một lần.
- Biến Lesson Complete thành trải nghiệm hai pha: kết quả sao trước, sau đó reveal sticker nếu completion vừa hoàn tất tuần; các ngày khác và replay không reveal sticker.
- Thay bảng emoji 12 tuần bằng catalog 48 sticker có ID ổn định, chia 4 thế giới x 12 tuần, dùng asset bundle local để xem và reveal offline.
- Thêm completion-event queue bền vững trên mobile và xử lý idempotent trên server. Chỉ lesson canonical đã publish/cache với `lessonId` và `contentVersion` ổn định mới tạo phần thưởng lâu dài; mock/demo lesson không ghi sao, streak, sticker hoặc completion canonical.
- Trả reward/progress snapshot canonical sau mỗi completion sync và dùng snapshot đó để reconcile local state thay vì cộng XP/streak hoặc union sticker rời rạc.
- Thay sáu badge hiện tại bằng các mốc tích lũy không thể bị mất: hoàn thành lesson đầu tiên, sticker đầu tiên, và đủ 12/24/36/48 sticker. Streak vẫn có celebration 7/14/30 nhưng không cấp badge vĩnh viễn.
- Giữ semantics Adventure Map hiện tại ngoài phạm vi change; việc thay cách tổng hợp sao theo tuần cần một review UI riêng.

## Capabilities

### New Capabilities

- `reward-sync`: Completion-event queue offline, canonical reward eligibility, server-side idempotency và snapshot reconciliation giữa mobile với server.
- `sticker-catalog`: Catalog 48 sticker có ID/tuần/thế giới/asset ổn định, bundled local và quy tắc cấp một sticker cho mỗi tuần hoàn thành.

### Modified Capabilities

- `star-rating`: Đổi ngưỡng sao sang lesson 8 hoạt động và giữ best-score/server verification theo completion event canonical.
- `lesson-player`: Ghi completion event canonical, không cấp reward lâu dài cho mock/demo, và dùng snapshot server khi sync.
- `lessons-api`: Bổ sung canonical reward context (`contentVersion`, frozen week plan) vào lesson response để completion offline có thể được xác minh khi reconnect.
- `lesson-complete`: Bỏ XP khỏi UI và thêm luồng hai pha để reveal sticker mới nhận.
- `progress-api`: Mở rộng complete-lesson cho idempotency key, content identity, sticker theo full-week completion và reward/progress snapshot.
- `state-management`: Thêm durable pending-event state và snapshot reconciliation; loại bỏ incremental reward mutation khỏi completion flow.
- `achievements-api`: Trả sticker catalog 48 tuần và badge tích lũy không thể bị thu hồi.
- `achievements-screen`: Hiển thị bộ sưu tập 4 thế giới, trạng thái locked/earned và badge tích lũy mới; refresh theo canonical/local snapshot.
- `mongoose-schemas`: Lưu reward-event idempotency/receipt và dữ liệu sticker đã nhận theo stable ID mà vẫn đọc được dữ liệu tuần legacy.

## Impact

- Mobile: `LessonPlayerScreen`, `LessonCompleteScreen`, `StickerCollectionScreen`, `StickerGrid`, `authStore`, progress/achievement services, navigation params và local sticker assets.
- Server: lessons/progress controller/service/DTO, child/lesson schema, reward-event persistence/idempotency, achievement derivation và cache invalidation.
- Contracts/docs: progress, star, lesson-complete, achievements, state-management, schema và canonical lesson flag semantics (`isStickerDay` chỉ là presentation hint, không phải điều kiện cấp sticker duy nhất).
- Verification: unit/contract tests cho ngưỡng 8 hoạt động, first completion/replay, full-week/catch-up, duplicate event, offline reconnect, mock ineligibility, 48-week catalog và non-revocable badges; on-device QA cho reveal và collection layouts.
- Không thêm dependency runtime mới theo mặc định; lựa chọn storage/queue sẽ ưu tiên Zustand persist/AsyncStorage và Mongo/Mongoose hiện có.
