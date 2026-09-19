## 1. Entitlement bypass — gate legacy complete-lesson (rank 1)

- [x] 1.1 `progress.module.ts`: import `EntitlementsModule` để inject `EntitlementService`
- [x] 1.2 `progress.service.ts`: inject `EntitlementService`; import `canAccessWeek` từ `../lessons/entitlement.policy`
- [x] 1.3 `completeLegacyLesson`: tra `lessonModel.findOne({ lessonId, lessonStatus:'imported' }).select('week')`; không có ⇒ `NotFoundException('Lesson not found')`
- [x] 1.4 Tính `effective = await entitlements.viewForChild(householdId, child)`; nếu `!canAccessWeek(effective, currentWeek, lesson.week)` ⇒ `ForbiddenException({ requiresUpgrade: true })`
- [x] 1.5 Đặt các check TRƯỚC khi push `completedLessons`/`advancePosition`/ghi sticker; canonical path giữ nguyên

## 2. Parent-PIN lockout race — atomic counters (rank 2)

- [x] 2.1 `anonymous-sessions.service.ts`: `verifyPin` fail path → `findOneAndUpdate($inc failedPinAttempts)` lấy post-increment; nếu `>= MAX` thì `updateOne` set `pinLockedUntil` (idempotent)
- [x] 2.2 `verifyPin` success path → reset atomic (`$set failedPinAttempts:0`, `$unset pinLockedUntil`) chỉ khi cần
- [x] 2.3 `recordRecoveryFailure` → atomic `$inc failedRecoveryAttempts` + set `recoveryLockedUntil` khi vượt ngưỡng
- [x] 2.4 Đồng bộ giá trị in-memory `household.*` với kết quả atomic để caller `save()` sau đó không ghi đè sai

## 3. Rate limiting — Redis guard toàn cục + per-route (rank 7, 8, 18, 19)

- [x] 3.1 `redis.service.ts`: thêm `incrementWindow(key, windowSeconds): Promise<number|null>` (INCR; EXPIRE khi count===1; catch ⇒ null)
- [x] 3.2 `common/rate-limit/rate-limit.decorator.ts`: `RATE_LIMIT_KEY`, `RateLimitConfig`, `RateLimit()`
- [x] 3.3 `common/rate-limit/rate-limit.guard.ts`: `RateLimitGuard` đọc metadata (hoặc default 120/60s), key `rl:{class}.{handler}:{ip}`, ném 429 khi vượt, fail-open
- [x] 3.4 `app.module.ts`: đăng ký `{ provide: APP_GUARD, useClass: RateLimitGuard }` (RedisConfigModule đã import)
- [x] 3.5 `main.ts`: tạo `NestExpressApplication`, `app.set('trust proxy', 1)`
- [x] 3.6 `@RateLimit` per-route: register(10/60), recover(5/60), parent-pin/verify(5/60), parent-pin(10/60), recovery-code/regenerate(10/60)
- [x] 3.7 `@RateLimit` per-route: iap verify-ios/verify-android/restore(20/60), activation-code/redeem(10/60), admin/publish(10/60)

## 4. SSRF — publish asset-URL checker (rank 5)

- [x] 4.1 `asset-url.checker.ts`: thêm `isPrivateIp(ip)` (IPv4 + IPv6 incl. IPv4-mapped, link-local, ULA, CGNAT, multicast/reserved)
- [x] 4.2 Thêm `assertSafeAssetUrl(rawUrl, resolver=dns.lookup)`: chỉ http/https; IP literal hoặc DNS-resolve rồi chặn private; allowlist tuỳ chọn `PUBLISH_ASSET_ALLOWED_HOSTS`
- [x] 4.3 `checkUrl`: gọi `assertSafeAssetUrl` trước; fetch với `redirect:'manual'` + `AbortSignal.timeout(5000)`; URL bị chặn ⇒ `{ ok:false, status:null, error:'blocked' }`
- [x] 4.4 `findBrokenUrls`: cap tổng số URL/hoạt động (200)

## 5. IAP — binding ổn định + restore cap (rank 6, 8)

- [x] 5.1 `iap.service.ts`: mở rộng `AppleReceiptResponse` item với `original_transaction_id?`, `transaction_id?`
- [x] 5.2 `validateApple`: lấy `bindingId = match.original_transaction_id ?? match.transaction_id ?? receiptData`; trả `token: bindingId`
- [x] 5.3 `restore.dto.ts`: `receipts` thêm `@ArrayMinSize(1) @ArrayMaxSize(20)`
- [x] 5.4 `iap.service.ts restore()`: dedup receipts trước khi validate

## 6. Tests & verify

- [x] 6.1 Test: legacy complete-lesson bị chặn khi week > entitlement / lesson không tồn tại; trong window vẫn qua (`progress.service.spec.ts`)
- [x] 6.2 Test: PIN lockout qua đường atomic (`anonymous-sessions.service.spec.ts` — "locks parent proof after five invalid PIN attempts")
- [x] 6.3 Test: `assertSafeAssetUrl`/`isPrivateIp`/`checkUrl` chặn localhost/127.0.0.1/169.254.169.254/10.x/[::1]; cho qua host công khai (`asset-url.checker.spec.ts`)
- [x] 6.4 Test: `validateApple` dùng `original_transaction_id` làm token (`iap.service.spec.ts`); `RestoreDto` reject mảng rỗng/quá lớn (`restore.dto.spec.ts`)
- [x] 6.5 Test: `RateLimitGuard` ném 429 khi vượt + override per-route; fail-open khi Redis null (`rate-limit.guard.spec.ts`)
- [x] 6.6 `npm install` (node_modules thiếu) + `npm run build` + `npm test` ⇒ 41 suites / 355 tests pass, build sạch

## Notes

- Lint (`eslint`) không nằm trong verify server theo AGENTS.md; production code mới lint sạch. 8 lỗi lint còn lại (`main.ts` TEMP debug middleware + `bootstrap()`, `progress.service.ts` `JSON.parse(cached)`) là có sẵn từ trước, không thuộc change này.
- Rate-limit dùng Redis tự viết thay `@nestjs/throttler` (không thêm dependency; xem design.md).
