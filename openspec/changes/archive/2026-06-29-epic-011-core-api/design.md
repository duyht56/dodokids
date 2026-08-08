## Context

Stack được chốt: **NestJS + MongoDB Atlas + Redis + Mongoose + TypeScript**. Backlog gốc ghi Next.js nhưng user đã quyết định chuyển sang NestJS — phù hợp hơn cho một API server thuần túy (không cần SSR). `kido-activity-schema.ts` là nguồn sự thật (source of truth) cho toàn bộ data model — Mongoose schemas phải mirror chính xác file này.

Hiện tại chưa có `kido-server/`. FE đang dùng mock data tạm thời.

## Goals / Non-Goals

**Goals:**
- Khởi tạo NestJS project có thể chạy được với `npm run start:dev`
- Mongoose schemas đầy đủ, typed, indexed cho 7 collections
- Redis connected và sẵn sàng dùng cho cache/session
- 3 endpoint phục vụ EPIC-003: `POST /children`, `GET /progress/:childId`, `GET /lessons/today`
- FE có thể gọi real API từ ngày đầu

**Non-Goals:**
- IAP verification APIs (EPIC-010/011)
- Content pipeline APIs (EPIC-012)
- Admin review interface (EPIC-013)
- Report generation với AI (EPIC-009)
- Authentication/JWT (không có auth trong MVP — childId là định danh duy nhất)

## Decisions

### D1: Dùng NestJS Modules pattern chuẩn
Mỗi domain là 1 module: `ChildrenModule`, `LessonsModule`, `ProgressModule`. Mỗi module có controller, service, schema riêng. Không dùng barrel imports phức tạp — import trực tiếp để tránh circular dependency.

### D2: Mongoose schemas dùng `@nestjs/mongoose` decorators
Dùng `@Schema()`, `@Prop()` của `@nestjs/mongoose` — không viết raw Mongoose schema. Lý do: type-safe hơn, tự động inference với TypeScript, tích hợp sẵn với NestJS DI. Schema definitions mirror 1:1 với `kido-activity-schema.ts`.

### D3: Activity payload lưu dưới dạng Mixed/subdocument
`payload` trong Activity collection là `Schema.Types.Mixed` do discriminated union (6 loại payload khác nhau). Validation xảy ra ở tầng service với Zod schemas — không validate trong Mongoose để giữ flexibility. Thay thế đã cân nhắc: lưu 6 collection riêng biệt → quá phức tạp cho query.

### D4: Redis dùng `@nestjs-modules/ioredis` (ioredis wrapper)
`ioredis` mạnh hơn `node-redis` cho production (reconnect logic, cluster support). Dùng làm: (1) cache GET /lessons/today với TTL 5 phút, (2) rate-limit parent gate attempts, (3) session parentUnlocked (nếu sau này cần multi-device). Thay thế: `cache-manager` — ít control hơn.

### D5: GET /lessons/today trả stub response nếu chưa có content
Khi DB chưa có lesson data (giai đoạn đầu), endpoint trả về một stub lesson với 6 placeholder activities. FE vẫn navigate được vào LessonPlayer mà không crash. Stub được detect bằng `isStub: true` flag trong response — FE hiển thị "Nội dung đang được cập nhật".

### D6: childId tự generate phía server, không dùng MongoDB ObjectId làm public ID
Format: `child_{nanoid(10)}` — ví dụ `child_xK3mP9qRvT`. Lý do: ObjectId có thể bị dự đoán, nanoid ngắn và URL-safe. FE lưu childId vào AsyncStorage sau `POST /children`.

### D7: Dùng `class-validator` + `ValidationPipe` global cho DTOs
`class-validator` là standard của NestJS ecosystem. Zod được dùng bổ sung ở service layer để validate `payload` của Activity (vì discriminated union phức tạp hơn class-validator xử lý được). Không dùng cả hai ở cùng 1 tầng.

## Risks / Trade-offs

- [Mongoose Mixed type cho Activity.payload] → Không có DB-level validation. Mitigation: Zod validation bắt buộc ở service layer trước khi write; integration tests cover all 6 payload types.
- [Stub lesson response] → FE phải handle `isStub: true` để không crash LessonPlayer. Mitigation: document rõ trong API contract spec, FE check flag trước khi render.
- [Chưa có auth] → childId trong request body/query là "honor system". Mitigation: chấp nhận cho MVP; add JWT + device binding ở sprint sau khi có backend ổn định hơn.
- [Redis unavailable locally] → NestJS startup fail nếu Redis không chạy. Mitigation: Redis connection dùng `lazyConnect: true` + graceful degradation — nếu Redis down thì bypass cache, không crash server.

## Migration Plan

1. Tạo `kido-server/` với NestJS CLI
2. Config `.env` với `MONGODB_URI` và `REDIS_URL`
3. Implement schemas và modules theo thứ tự: Common Types → Schemas → ChildrenModule → ProgressModule → LessonsModule
4. FE update `api-client` service để point sang `http://localhost:3001` (dev) — không thay đổi type contracts
5. Seed script tạo 1 child test + 1 lesson stub để FE test end-to-end ngay

## Environment (confirmed)

- **NestJS port:** `3001`
- **MongoDB:** local, `mongodb://localhost:27017/kido`
- **Redis:** local, `redis://localhost:6888`
