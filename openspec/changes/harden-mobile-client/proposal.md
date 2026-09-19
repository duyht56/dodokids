## Why

Đợt review bảo mật phát hiện các điểm hardening ở client mobile. Nội dung server đã được enforce authoritative (EntitlementGuard + rate limit từ change `harden-server-security`), nên các mục này là hardening phía client, mức LOW nhưng đáng làm trước go-live:

1. **Subscription store tamperable (rank 13)** — `subscriptionStore` persist `plan/status/paidWeeks/expiresAt` vào AsyncStorage (plaintext). Rooted device sửa `status:'active'` + chặn `/iap/entitlement` (airplane mode) ⇒ UI mở khoá (chỉ UI — nội dung vẫn 403 server-side).
2. **Parent-gate first-run không có adult challenge (rank 14)** — lần đầu (chưa có PIN), modal cho tạo PIN ngay, không có thử thách người-lớn. Trẻ gõ 1234 hai lần là vào khu vực phụ huynh. Vi phạm Apple Guideline 1.3 / Google Families.
3. **Android cleartext HTTP (rank 17)** — `app.json` đặt `usesCleartextTraffic:true` vô điều kiện; `api.ts` fallback `http://localhost`/`http://<metroHost>` cả ở build non-dev khi thiếu `KIDO_API_URL`.

Defer: rank 22 (TLS cert pinning) — review coi là MVP-acceptable; cần cert/SPKI hash + native config, để sau.

## What Changes

- **entitlement-cache-integrity**: không persist các trường entitlement authoritative (`plan/status/paidWeeks/expiresAt`); chỉ persist `trialStartDate`. Launch reconcile từ server (`useIapBootstrap` đã làm) là nguồn sự thật. Tradeoff: cold-launch offline hiển thị trial cho tới khi kết nối lại (nội dung premium vốn cần server nên không mất truy cập thực).
- **parent-gate-adult-challenge**: thêm bước xác minh người lớn (phép cộng ghi bằng chữ tiếng Việt) TRƯỚC khi cho tạo PIN ở lần đầu (`isSetup`). Đường verify (đã có PIN) giữ nguyên (server rate-limited).
- **mobile-transport-security**: bỏ `usesCleartextTraffic` cứng khỏi `app.json`, đặt trong `app.config.js` = true CHỈ khi dev (apiUrl thiếu hoặc http). `api.ts` non-dev fallback về `https://api.dodokids.vn` (không còn silently http), cảnh báo nếu prod dùng http.

## Capabilities

### New Capabilities
- `entitlement-cache-integrity`: entitlement là UI-cache, reconcile từ server, không persist trạng thái trả phí tamperable.
- `parent-gate-adult-challenge`: cổng người lớn cho first-run parent setup.
- `mobile-transport-security`: cleartext HTTP chỉ ở dev; release enforce https.

## Impact

- `mobile/src/store/subscriptionStore.ts` — persist `partialize` (rank 13).
- `mobile/src/components/ParentGateModal.tsx` — adult challenge (rank 14).
- `mobile/app.json`, `mobile/app.config.js`, `mobile/src/services/api.ts` — cleartext/https (rank 17).

## Out of Scope (deferred)

- rank 22 (TLS certificate/SPKI pinning) — MVP-acceptable per review; cần native config + pin-set.
