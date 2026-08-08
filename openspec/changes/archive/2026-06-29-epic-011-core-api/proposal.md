## Why

EPIC-003 (Home & Navigation) cần real API ngay từ đầu để tránh mock data gây technical debt. Data model của Kido có dependency chain sâu (`children → progress → lessons → activities → assets`) — chuẩn hóa schema từ sớm ở tầng BE ngăn việc refactor đau đớn khi app đã có 5–6 screens. Backend dùng **NestJS + MongoDB + Redis + Mongoose + TypeScript**.

## What Changes

- Khởi tạo NestJS project mới tại `kido-server/` (trong monorepo)
- Kết nối MongoDB Atlas qua Mongoose với tất cả schemas từ `kido-activity-schema.ts`
- Kết nối Redis (cache, session, rate-limit)
- Implement 3 nhóm API phục vụ EPIC-003 ngay:
  - `POST /children` — tạo child profile
  - `GET /progress/:childId` — lấy progress (currentWeek, currentDay, streakCount)
  - `GET /lessons/today?childId=` — lấy lesson hôm nay (stub content nếu chưa có data)
- Mongoose schemas đầy đủ cho toàn bộ collections: `children`, `lessons`, `activities`, `assets_library`, `activity_assets`, `iap_receipts`, `pipeline_logs`
- Shared TypeScript types mirror `kido-activity-schema.ts` — FE và BE dùng chung

## Capabilities

### New Capabilities
- `nestjs-project-setup`: NestJS app với config module, Mongoose connection, Redis connection, global validation pipe, Zod/class-validator, CORS cho React Native
- `mongoose-schemas`: Tất cả MongoDB schemas typed với Mongoose — `children`, `lessons`, `activities`, `assets_library`, `activity_assets`, `iap_receipts`, `pipeline_logs`
- `children-api`: CRUD cho child profile — `POST /children`, `GET /children/:id`, `PATCH /children/:id`
- `progress-api`: Read/write progress — `GET /progress/:childId`, `PATCH /progress/:childId/complete-lesson`
- `lessons-api`: Serve lesson data — `GET /lessons/today`, `GET /lessons/:lessonId`, stub response khi chưa có content

### Modified Capabilities

## Impact

- Thư mục mới: `kido-server/` (NestJS app)
- `kido-server/src/` cấu trúc: `modules/children`, `modules/lessons`, `modules/progress`, `common/schemas`, `common/types`, `config/`
- FE (`mobile/`) sẽ update `src/services/api.ts` để point đến real endpoint thay vì mock
- Phụ thuộc: MongoDB Atlas connection string, Redis URL (local dev: `redis://localhost:6379`)
- Shared types package: `kido-server/src/common/types/` được copy/symlink sang `mobile/src/types/shared/`
