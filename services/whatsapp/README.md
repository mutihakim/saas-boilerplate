# tenant-whatsapp-service

Global WhatsApp (`whatsapp-web.js`) service for multi-tenant sessions.

## Setup

1. Copy env:
   - `cp .env.example .env`
2. Install dependencies:
   - `npm install`
3. Start with PM2:
   - `pm2 start pm2.config.js`
   - `pm2 restart tenant-whatsapp-service`

## Environment

- `PORT` (default `3010`)
- `APP_CALLBACK_URL` (Laravel app base URL, no trailing slash)
- `WHATSAPP_INTERNAL_TOKEN` (shared secret with Laravel internal callback)
- `WA_AUTH_DIR` (auth/session directory, default `./wa-auth`)
- `REQUEST_TIMEOUT_MS` (callback HTTP timeout, default `8000`)
- `CONNECTING_TIMEOUT_MS` (max QR connecting window, default `300000` / 5 minutes)

## Session Lifecycle Policy

- Global PM2 service, max 1 active session per tenant.
- `connecting` has a hard timeout of 5 minutes.
- If timeout is reached before `ready`, service auto-disconnects the session and sends `disconnect_reason=qr_timeout`.
- Manual disconnect and QR timeout both set `auto_connect=false` via callback, so session will not auto-restore after service restart until user clicks Connect again.

## Endpoints

- `GET /health`
- `GET /api/v1/tenants/:tenantId/whatsapp/session`
- `POST /api/v1/tenants/:tenantId/whatsapp/session/connect`
- `POST /api/v1/tenants/:tenantId/whatsapp/session/disconnect`
- `POST /api/v1/tenants/:tenantId/whatsapp/messages/send`
