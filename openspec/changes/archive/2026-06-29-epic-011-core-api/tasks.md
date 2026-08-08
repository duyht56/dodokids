## 1. Project Scaffolding

- [x] 1.1 Chạy `nest new kido-server` tại `D:\project\kido-app\`, chọn `npm`, xóa file test mẫu
- [x] 1.2 Cấu hình `tsconfig.json`: `strict: true`, `strictNullChecks: true`, `paths` alias `@/*` → `src/*`
- [x] 1.3 Cài dependencies: `@nestjs/mongoose mongoose @nestjs-modules/ioredis ioredis @nestjs/config nanoid class-validator class-transformer`
- [x] 1.4 Tạo `kido-server/.env.example` và `kido-server/.env` với: `PORT=3001`, `MONGODB_URI=mongodb://localhost:27017/kido`, `REDIS_URL=redis://localhost:6888`, `NODE_ENV=development`
- [x] 1.5 Cấu hình `ConfigModule.forRoot({ isGlobal: true })` trong `AppModule`
- [x] 1.6 Bật `ValidationPipe` global: `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`
- [x] 1.7 Bật CORS trong `main.ts`: `app.enableCors()` cho development
- [x] 1.8 Tạo `HealthController` với `GET /health` trả về `{ status: 'ok', timestamp: new Date().toISOString() }`
- [x] 1.9 Verify: `npm run start:dev` chạy thành công, `GET /health` trả `200`

## 2. MongoDB Connection & Mongoose Setup

- [x] 2.1 Kết nối Mongoose trong `AppModule` với `MongooseModule.forRootAsync()` đọc `MONGODB_URI` từ `ConfigService`
- [x] 2.2 Log connection events: success → `[Mongoose] Connected`, error → `[Mongoose] Connection error: {message}`
- [x] 2.3 Verify: server khởi động log đúng connection status khi có/không có MongoDB

## 3. Redis Connection

- [x] 3.1 Cài và cấu hình `@nestjs-modules/ioredis` trong `AppModule` với `lazyConnect: true`, `REDIS_URL` từ `ConfigService`
- [x] 3.2 Tạo `RedisService` (`src/common/redis/redis.service.ts`) wrap ioredis với methods: `get(key)`, `set(key, value, ttlSeconds)`, `del(key)` — trả về `null` nếu Redis unavailable thay vì throw
- [x] 3.3 Verify graceful degradation: khi Redis không chạy, server vẫn start và log cảnh báo

## 4. Common Types (mirror kido-activity-schema.ts)

- [x] 4.1 Copy `docs/kido-activity-schema.ts` vào `kido-server/src/common/types/activity.types.ts` — đây là source of truth cho toàn bộ type definitions trong server
- [x] 4.2 Tạo `kido-server/src/common/types/child.types.ts` với interfaces: `ChildProgress`, `ChildEntitlement`, `IChild`
- [x] 4.3 Tạo `kido-server/src/common/types/api.types.ts` với response DTOs dùng chung: `ApiResponse<T>`, `PaginatedResponse<T>`

## 5. Mongoose Schemas

- [x] 5.1 Tạo `src/common/schemas/child.schema.ts`: `@Schema()` class `Child` với tất cả fields, `progress` và `entitlement` là nested `@Schema({ _id: false })` classes, index unique trên `childId`
- [x] 5.2 Tạo `src/common/schemas/activity.schema.ts`: `@Schema()` class `ActivityDocument` với `payload: Schema.Types.Mixed`, `meta` là nested schema, index trên `{ lessonId: 1 }` và `{ 'meta.week': 1, status: 1 }`
- [x] 5.3 Tạo `src/common/schemas/lesson.schema.ts`: `@Schema()` class `LessonDocument` với `activities: [{ type: Types.ObjectId, ref: 'Activity' }]`, index trên `{ week: 1, day: 1, subject: 1 }` (unique)
- [x] 5.4 Tạo `src/common/schemas/library-asset.schema.ts`: `@Schema()` class `LibraryAssetDocument` với `attributes` nested schema, compound index trên 7 attributes fields + `status`, text index trên `tags`
- [x] 5.5 Tạo `src/common/schemas/activity-asset.schema.ts`: `@Schema()` class `ActivityAssetDocument`, index trên `{ activityId: 1 }`
- [x] 5.6 Tạo `src/common/schemas/iap-receipt.schema.ts`: index trên `{ childId: 1, isActive: 1 }`
- [x] 5.7 Tạo `src/common/schemas/pipeline-log.schema.ts`
- [x] 5.8 Export tất cả schemas từ `src/common/schemas/index.ts`
- [x] 5.9 Verify: Mongoose sync tạo đúng indexes trên MongoDB (check qua MongoDB Compass hoặc `db.collection.getIndexes()`)

## 6. ChildrenModule

- [x] 6.1 Tạo `src/modules/children/` với `children.module.ts`, `children.controller.ts`, `children.service.ts`
- [x] 6.2 Tạo `src/modules/children/dto/create-child.dto.ts`: `name: string` (min 1, max 20), `age: number` (IsIn [4,5,6])
- [x] 6.3 Implement `ChildrenService.create(dto)`: generate `childId = 'child_' + nanoid(10)`, set `progress` defaults, set `entitlement` defaults, insert, return document
- [x] 6.4 Implement `ChildrenService.findById(childId)`: query `{ childId }`, throw `NotFoundException` nếu không tìm thấy
- [x] 6.5 Implement `ChildrenController`: `POST /children` → `create()`, `GET /children/:childId` → `findById()`
- [x] 6.6 Verify: `POST /children` với body hợp lệ trả `201`, với body lỗi trả `400`, `GET /children/:id` trả `200`/`404` đúng

## 7. ProgressModule

- [x] 7.1 Tạo `src/modules/progress/` với `progress.module.ts`, `progress.controller.ts`, `progress.service.ts`
- [x] 7.2 Tạo `src/modules/progress/dto/complete-lesson.dto.ts`: `lessonId: string`, `stars: number` (1-3), `activityResults: ActivityResult[]`
- [x] 7.3 Implement `ProgressService.getProgress(childId)`: query child, kiểm tra Redis cache trước (`progress:{childId}`), return progress + entitlement summary, set cache TTL 60s
- [x] 7.4 Implement `ProgressService.completeLesson(childId, dto)`:
  - Check `completedLessons` — nếu đã có → return current progress (idempotent)
  - Push `lessonId` vào `completedLessons`
  - Advance `currentDay`: nếu `currentDay < 5` → `currentDay++`; nếu `currentDay === 5` → `currentWeek++`, `currentDay = 1`, check `stickerEarned`
  - Cập nhật `streakCount` theo `lastLessonDate` (tăng nếu hôm qua học, reset nếu bỏ ngày)
  - Invalidate Redis key `progress:{childId}`
  - Return `{ ...progress, stickerEarned }`
- [x] 7.5 Implement `ProgressController`: `GET /progress/:childId`, `PATCH /progress/:childId/complete-lesson`
- [x] 7.6 Verify: complete-lesson idempotent, streakCount logic đúng, Redis invalidate sau write

## 8. LessonsModule

- [x] 8.1 Tạo `src/modules/lessons/` với `lessons.module.ts`, `lessons.controller.ts`, `lessons.service.ts`
- [x] 8.2 Implement `LessonsService.findToday(childId)`:
  - Lấy `currentWeek`, `currentDay` từ child progress
  - Query: `Lesson.findOne({ week, day: currentDay, lessonStatus: 'imported' }).populate('activities')`
  - Nếu không có → trả stub response `{ isStub: true, lessonTitle: 'Nội dung đang được cập nhật', activities: [] }`
  - Cache Redis key `lesson:today:{childId}` TTL 300s
- [x] 8.3 Implement `LessonsService.findById(lessonId)`: parse lessonId format `w{week}-d{day}-{subject}`, query DB, `404` nếu không có hoặc status khác `imported`
- [x] 8.4 Implement `LessonsController`: `GET /lessons/today?childId=`, `GET /lessons/:lessonId`
- [x] 8.5 Validate query param: `GET /lessons/today` không có `childId` → `400`
- [x] 8.6 Verify: stub response khi DB rỗng, real lesson khi có data, cache hoạt động

## 9. Seed Script & Integration Test

- [x] 9.1 Tạo `kido-server/src/scripts/seed.ts`: tạo 1 child test (`child_test00001`), 1 stub lesson `w01-d1-toan` với 1 activity đơn giản, import vào DB
- [x] 9.2 Thêm script `"seed": "ts-node src/scripts/seed.ts"` vào `package.json`
- [x] 9.3 Chạy seed và verify end-to-end: `POST /children` → dùng `childId` vừa tạo → `GET /lessons/today?childId=` trả lesson thực (không phải stub)
- [x] 9.4 Update `mobile/src/services/api.ts`: thay `BASE_URL` mock thành `http://localhost:3001`, test FE gọi được `POST /children` và `GET /progress/:childId` thành công
- [x] 9.5 Verify TypeScript toàn bộ `kido-server/`: `npx tsc --noEmit` — zero errors
