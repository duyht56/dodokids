# Design — harden-server-config

## rank 16 — CORS restriction

The API is consumed by a native mobile app (no browser CORS) and by a server-to-server publish client, so a wildcard reflected origin is unnecessary. Configure:

```
const corsOrigins = (process.env.CORS_ALLOWED_ORIGINS ?? '')
  .split(',').map((o) => o.trim()).filter(Boolean);
app.enableCors({ origin: corsOrigins.length ? corsOrigins : false });
```

Default (env unset) → `origin: false`, i.e. no cross-origin browser access. A future web surface can opt in via `CORS_ALLOWED_ORIGINS`. Native app and publish are unaffected (they do not rely on CORS). Never combine a reflected origin with credentials.

## rank 21 — request-log hygiene

Remove the unconditional `app.use((req,res,next) => console.log('[REQ] ...'))` middleware. It logged method/url/ip for every request with no NODE_ENV guard. Removing it also clears the two pre-existing lint errors it caused (`req: any` unsafe member access). Structured request logging with retention can be added later via Caddy or a proper logger if needed.

## Risks

- If some browser-based tool currently relies on the wildcard CORS, it would need to be added to `CORS_ALLOWED_ORIGINS`. No such first-party browser client is known (mobile is native; pipeline publishes server-to-server).
