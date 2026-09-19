## Why

Một đợt review bảo mật/performance (multi-agent, có bước adversarial verify) trên `kido-server` và `mobile` phát hiện các lỗ hổng bảo mật phía server. Change này xử lý nhóm **security-critical của kido-server** trước tiên vì liên quan trực tiếp tới toàn vẹn thanh toán, chiếm quyền household, và go-live — những phần còn lại (performance server, mobile) tách thành change riêng.

Các vấn đề được đưa vào change này (đã verify trên code thật, có file:line):

1. **Bypass gói cước (HIGH)** — đường `PATCH /progress/:childId/complete-lesson` không có `eventId` đi vào `completeLegacyLesson`, path này KHÔNG kiểm tra lesson tồn tại và `advancePosition` đẩy `progress.currentWeek` tự do; read-access (`EntitlementGuard` → `maxUnlockedWeek`) suy ra từ chính `currentWeek`. Một subscriber `monthly` có thể mở khoá toàn bộ 48 tuần bằng cách hoàn thành một lessonId bịa/đoán được.
2. **Race vô hiệu lockout PIN (HIGH)** — `verifyPin`/`recordRecoveryFailure` tăng bộ đếm thất bại bằng read-modify-write không atomic quanh `await scrypt`; nhiều request đồng thời gộp N lần fail thành 1, `pinLockedUntil` không kích hoạt → brute-force PIN 4–6 số → chiếm parent area.
3. **SSRF ở publish asset-URL checker (MEDIUM)** — `checkUrl` fetch URL client kiểm soát hoàn toàn, không chặn scheme/loopback/link-local/private range, follow redirect, không timeout, và trả status/error làm oracle.
4. **Apple purchase binding theo raw receipt blob (MEDIUM)** — `PurchaseBinding.tokenHash` băm nguyên blob receipt (không ổn định) thay vì `original_transaction_id`; một subscription trả tiền gán được cho nhiều household.
5. **Không có rate limiting ở đâu (MEDIUM)** + `/register` tạo household vô hạn + `/iap/restore` không cap mảng + recovery/redeem không throttle (backstop cho #2).

## What Changes

- **entitlement-policy**: `completeLegacyLesson` verify lesson `imported` tồn tại và gate tuần hoàn thành theo entitlement hiệu lực (`viewForChild` + `canAccessWeek`) trước khi ghi nhận/đẩy `currentWeek`. Read-access không còn nâng được bằng client-writable state qua legacy path.
- **parent-pin-auth**: bộ đếm thất bại PIN và recovery chuyển sang atomic (`$inc` + set khoá có điều kiện) để không mất increment dưới concurrency; kết hợp rate-limit endpoint xác thực.
- **api-rate-limiting**: thêm rate-limit guard toàn cục dựa trên Redis (dùng ioredis sẵn có, KHÔNG thêm `@nestjs/throttler`), fail-open khi Redis lỗi; per-route limit chặt cho `register`, `recover`, `parent-pin/verify`, `parent-pin`, `recovery-code/regenerate`, `iap/*`, `activation-code/redeem`, `admin/publish`. Bật `trust proxy` để key theo IP thật sau Caddy.
- **publish-asset-ssrf**: validate mọi asset URL trước khi fetch (chỉ http/https, resolve DNS chặn loopback/link-local/private/reserved, `redirect: 'manual'`, `AbortSignal.timeout`, cap số URL), và trả lý do chung thay vì echo status/error nội bộ.
- **iap-purchase-binding**: parse `original_transaction_id` (Apple) làm khoá binding ổn định thay cho raw blob; thêm `@ArrayMinSize/@ArrayMaxSize` + dedup cho `RestoreDto.receipts`.

## Capabilities

### New Capabilities
- `entitlement-policy`: Legacy lesson completion phải verify lesson tồn tại + gate theo entitlement window; `currentWeek` không nâng được ngoài quyền truy cập.
- `parent-pin-auth`: Đếm thất bại PIN/recovery atomic, chống race defeat lockout.
- `api-rate-limiting`: Rate limiting toàn cục + per-route dựa trên Redis, fail-open, key theo IP thật sau proxy.
- `publish-asset-ssrf`: Asset-URL checker chống SSRF (scheme allowlist, chặn private IP, no-redirect-follow, timeout, no oracle).
- `iap-purchase-binding`: Anti-replay binding theo định danh subscription ổn định + giới hạn kích thước restore.

## Impact

- `kido-server/src/modules/progress/progress.service.ts` — gate legacy completion theo entitlement.
- `kido-server/src/modules/progress/progress.module.ts` — import `EntitlementsModule`.
- `kido-server/src/modules/anonymous-sessions/anonymous-sessions.service.ts` — atomic PIN/recovery failure counters.
- `kido-server/src/common/redis/redis.service.ts` — thêm `incrementWindow` (INCR + EXPIRE).
- `kido-server/src/common/rate-limit/rate-limit.decorator.ts`, `rate-limit.guard.ts` — mới.
- `kido-server/src/app.module.ts` — đăng ký `APP_GUARD` rate-limit.
- `kido-server/src/main.ts` — `trust proxy`.
- `kido-server/src/modules/anonymous-sessions/anonymous-sessions.controller.ts`, `iap.controller.ts`, `publish.controller.ts` — `@RateLimit` per-route.
- `kido-server/src/modules/publish/asset-url.checker.ts` — SSRF guard.
- `kido-server/src/modules/iap/iap.service.ts` — Apple `original_transaction_id` binding.
- `kido-server/src/modules/iap/dto/restore.dto.ts` — array size cap.
- Specs/tests mới cho từng capability.

## Out of Scope (deferred to other changes)

- Performance server (rank 3/9/10/11/12/28/30), mobile perf & hardening.
- Rank 16 (CORS wildcard) và rank 21 (TEMP debug middleware) — low, không nằm trong scope đã chốt; sẽ xử lý ở change hardening riêng.
