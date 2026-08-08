## ADDED Requirements

### Requirement: NestJS project khởi tạo tại kido-server/ và chạy được
Project SHALL được khởi tạo tại `kido-server/` trong monorepo với NestJS CLI, TypeScript strict mode, port mặc định `3001`. `npm run start:dev` SHALL khởi động server thành công và phản hồi `GET /health` với `{ status: 'ok' }`.

#### Scenario: Server khởi động thành công
- **WHEN** chạy `npm run start:dev` tại `kido-server/`
- **THEN** server lắng nghe trên port 3001 và log `Application is running on: http://localhost:3001`

#### Scenario: Health check endpoint phản hồi
- **WHEN** gửi `GET http://localhost:3001/health`
- **THEN** response là `200 OK` với body `{ "status": "ok", "timestamp": "<ISO>" }`

### Requirement: Kết nối MongoDB và Redis được thiết lập khi startup
Server SHALL kết nối MongoDB qua Mongoose và Redis qua ioredis khi khởi động. Kết nối thất bại SHALL được log rõ ràng nhưng KHÔNG crash server (graceful degradation cho Redis).

#### Scenario: MongoDB kết nối thành công
- **WHEN** `MONGODB_URI` hợp lệ được cung cấp trong `.env`
- **THEN** Mongoose log `[Mongoose] Connected to MongoDB` và server sẵn sàng nhận request

#### Scenario: Redis không khả dụng — server vẫn chạy
- **WHEN** `REDIS_URL` trỏ tới Redis không chạy
- **THEN** server khởi động bình thường, log cảnh báo `[Redis] Connection failed — cache disabled`, và các endpoint không dùng Redis vẫn hoạt động

### Requirement: Global ValidationPipe và CORS được cấu hình
Server SHALL bật `ValidationPipe` global với `whitelist: true`, `forbidNonWhitelisted: true`, `transform: true`. CORS SHALL cho phép origin từ `*` trong development và restricted trong production.

#### Scenario: Request body chứa field không khai báo trong DTO bị reject
- **WHEN** client gửi POST body chứa field lạ không có trong DTO
- **THEN** server trả về `400 Bad Request` với message mô tả field bị reject

#### Scenario: React Native client gọi được API không bị CORS block
- **WHEN** React Native app (bất kỳ origin) gọi API trong môi trường development
- **THEN** response chứa header `Access-Control-Allow-Origin: *`
