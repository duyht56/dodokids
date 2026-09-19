## 1. CORS restriction (rank 16)

- [x] 1.1 `main.ts`: `enableCors({ origin })` từ `CORS_ALLOWED_ORIGINS` (CSV); mặc định `origin: false`

## 2. Request-log hygiene (rank 21)

- [x] 2.1 `main.ts`: bỏ middleware "TEMP debug" log mỗi request

## 3. Verify

- [x] 3.1 `npm run build && npm test` xanh
- [x] 3.2 Xác nhận không còn 2 lỗi lint từ debug middleware trong `main.ts`
