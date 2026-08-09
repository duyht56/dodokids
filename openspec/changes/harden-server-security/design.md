# Design — harden-server-security

## 1. Entitlement bypass (legacy complete-lesson)

**Root cause.** `completeLesson` routes to `completeLegacyLesson` khi thiếu `eventId`. Legacy path (`progress.service.ts`) không tra `lessonModel` và `advancePosition` set `progress.currentWeek = min(48, week+1)` cho id có `day>=5`. `EntitlementGuard`/`LessonsService.findToday` suy read-access từ `maxUnlockedWeek(entitlement, currentWeek)` — với `monthly` = `currentWeek + 4`. lessonId có dạng `w{n}-d{d}-{subject}` nên đoán được ⇒ chỉ check tồn tại là chưa đủ.

**Quyết định.** Gate legacy completion GIỐNG hệt read guard:
1. Tra `lessonModel.findOne({ lessonId, lessonStatus: 'imported' })` lấy `week` chính thức; không có ⇒ `NotFound`.
2. Tính entitlement hiệu lực bằng `EntitlementService.viewForChild(householdId, child)` (bao gồm overlay campaign) — trùng logic guard, tránh sai lệch stored vs effective.
3. `canAccessWeek(effective, currentWeek, lesson.week)` false ⇒ `Forbidden { requiresUpgrade: true }`.

Không cần clamp thêm: vì chỉ hoàn thành được lesson trong cửa sổ hiện tại, `advancePosition` chỉ có thể đẩy `currentWeek` lên tối đa `accessible+1` — đúng ngữ nghĩa "rolling window" của gói monthly, và trùng với đường canonical (vốn đã bị chặn bởi frozen week-plan). Canonical path KHÔNG đổi (đã an toàn nhờ kiểm tra week-plan membership).

**Tradeoff.** Thêm một lần đọc DB (`viewForChild`) trên legacy path — chấp nhận được vì legacy là đường tương thích client cũ, tần suất thấp.

## 2. Parent-PIN lockout race

**Root cause.** `verifyPin` đọc `failedPinAttempts` từ document đã load, chạy scrypt (~100ms), rồi `household.failedPinAttempts = x+1; save()`. Không atomic, không `optimisticConcurrency` ⇒ last-write-wins gộp N fail thành 1.

**Quyết định.** Đếm thất bại atomic ở tầng DB:
- Fail: `findOneAndUpdate({householdId}, {$inc:{failedPinAttempts:1}}, {new:true})` lấy giá trị post-increment chính xác; nếu `>= MAX_SECURITY_FAILURES` thì `updateOne` set `pinLockedUntil` (idempotent).
- Success: nếu đang có counter/lock thì reset atomic (`$set failedPinAttempts:0`, `$unset pinLockedUntil`).
- Áp dụng tương tự cho `recordRecoveryFailure`/`failedRecoveryAttempts`.

Atomic counter bảo đảm không mất increment giữa các lần thử. Chống burst đồng thời (nhiều request cùng vượt qua `assertNotLocked` trước khi khoá được đặt) do **rate-limit per-IP trên `/parent-pin/verify`** đảm nhiệm (mục 5). Không dùng Redis lock per-household để giữ thay đổi tối thiểu và không phụ thuộc Redis cho tính đúng.

## 3. Rate limiting — vì sao tự viết thay vì @nestjs/throttler

- `node_modules` chưa cài và `@nestjs/throttler` chưa có; storage Redis lại cần thêm package thứ hai. `ioredis` + `RedisService` đã sẵn.
- **Quyết định:** `RateLimitGuard` (global `APP_GUARD`) + decorator `@RateLimit({limit, windowSeconds})`. Key = `rl:{controller}.{handler}:{ip}` (route + IP). Đếm bằng `RedisService.incrementWindow` = `INCR` rồi `EXPIRE` khi lần đầu. **Fail-open**: Redis lỗi ⇒ `incrementWindow` trả `null` ⇒ cho qua (đồng nhất triết lý degrade của `RedisService`; tính đúng của lockout PIN đã do counter atomic ở DB đảm nhiệm).
- Global guard chạy TRƯỚC route guard nên chưa có `deviceSession`; vì vậy key theo IP (đủ cho brute-force/DoS). Bật `trust proxy` (1 hop Caddy) để `req.ip` là IP client thật (Caddy set `X-Forwarded-For`).
- Default 120/60s/IP; override chặt per-route qua decorator.

## 4. SSRF ở publish asset-URL checker

**Quyết định.** Thêm `assertSafeAssetUrl(rawUrl, resolver)` chạy trước mọi fetch trong `checkUrl`:
- `new URL()` — chỉ chấp nhận `http:`/`https:`.
- Nếu host là IP literal ⇒ kiểm tra trực tiếp; nếu là hostname ⇒ `dns.lookup(host,{all:true})` và chặn nếu BẤT KỲ địa chỉ nào thuộc loopback/link-local (169.254/`fe80`)/private (10/172.16-31/192.168/`fc00::/7`)/CGNAT/multicast/reserved/`::1`/IPv4-mapped.
- Allowlist tuỳ chọn qua `PUBLISH_ASSET_ALLOWED_HOSTS` (CSV); nếu set thì host phải khớp.
- `fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(5000) })` — không follow redirect (chống DNS-rebind qua redirect), có timeout.
- Cap tổng số URL/hoạt động; URL bị chặn trả lý do chung `blocked` (không echo status/error nội bộ ⇒ triệt oracle).

**Tradeoff.** TOCTOU giữa resolve và fetch vẫn tồn tại về lý thuyết; `redirect:'manual'` + chặn private theo mọi bản ghi DNS thu hẹp đáng kể. Đủ mạnh cho MVP; agent DNS-pinned để sau nếu cần.

## 5. IAP purchase binding + restore cap

- **Apple:** mở rộng `AppleReceiptResponse` để đọc `original_transaction_id`; `validateApple` trả `token = original_transaction_id` (fallback về `receiptData` nếu thiếu) ⇒ `bindPurchase` băm định danh subscription ổn định. Google giữ nguyên `purchaseToken` (ổn định theo purchase; finding chỉ liên quan Apple). Binding mới thay khoá cũ tự nhiên khi user verify lại.
- **Restore:** `RestoreDto.receipts` thêm `@ArrayMinSize(1) @ArrayMaxSize(20)`; `restore()` dedup receipts trước khi gọi outbound. Kết hợp rate-limit `/iap/*`.

## Risks

- Người dùng có binding cũ (theo blob) sẽ tạo binding mới theo `original_transaction_id` ở lần verify kế; không mất entitlement (child.iapReceipts vẫn idempotent theo tokenHash mới).
- Rate-limit fail-open khi Redis chết: chấp nhận (lockout PIN vẫn đúng nhờ atomic DB counter). Cần theo dõi Redis.
- Trust proxy = 1: đúng với 1 hop Caddy hiện tại; nếu thêm hop phải chỉnh.
