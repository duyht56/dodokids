## Why

Hai mục low-severity còn lại từ review bảo mật server, tách khỏi `harden-server-security` để không đụng phần đã ship:

1. **CORS wildcard (rank 16)** — `main.ts` gọi `app.enableCors()` không tham số ⇒ `Access-Control-Allow-Origin` phản chiếu mọi origin. Consumer là app native (không cần CORS) + publish là server-to-server, nên wildcard rộng hơn cần thiết; bất kỳ web origin nào cũng đọc được response từ endpoint công khai.
2. **TEMP debug middleware (rank 21)** — `main.ts` cài middleware log `[REQ] <method> <url> from <ip>` cho MỌI request, không guard `NODE_ENV`, còn bật ở production. Là debug thừa + overhead mỗi request.

## What Changes

- **cors-restriction**: `enableCors({ origin })` với allowlist từ env `CORS_ALLOWED_ORIGINS` (CSV); mặc định (không set) ⇒ `origin: false` (tắt CORS trình duyệt). App native + publish server-to-server không bị ảnh hưởng.
- **request-log-hygiene**: bỏ middleware "TEMP debug" khỏi `main.ts`.

## Capabilities

### New Capabilities
- `cors-restriction`: CORS theo allowlist, mặc định tắt (không wildcard).
- `request-log-hygiene`: không log mỗi request ở production.

## Impact

- `kido-server/src/main.ts` — CORS config (rank 16), bỏ debug middleware (rank 21).

## Out of Scope (deferred)

- helmet / security headers (S4-4, low) — cần cân nhắc thêm dependency hoặc middleware header thủ công.
- rank 20 (sandbox receipt / bundle_id, low) — hardening IAP, để sau.
