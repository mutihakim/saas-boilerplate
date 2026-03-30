# WhatsApp Module Contract (`wwebjs`) - Optional

Modul ini opsional. Core platform tetap harus berjalan tanpa modul WhatsApp.

## 1. Arsitektur Modul

- web app (Laravel API + UI)
- WhatsApp service terpisah (`whatsapp-web.js`)
- callback channel dari service ke web app

## 2. Service Endpoint Contract (Public-to-App Internal)

- `GET /health`
- `GET /api/v1/tenants/:tenantId/whatsapp/session`
- `POST /api/v1/tenants/:tenantId/whatsapp/session/connect`
- `POST /api/v1/tenants/:tenantId/whatsapp/session/disconnect`
- `POST /api/v1/tenants/:tenantId/whatsapp/messages/send`

## 3. Callback Endpoint Contract (Service-to-App)

- `GET /internal/v1/whatsapp/sessions`
- `POST /internal/v1/whatsapp/session-state`
- `POST /internal/v1/whatsapp/messages`
- `POST /internal/v1/whatsapp/media`

## 4. Security Contract

- semua callback wajib kirim `X-Internal-Token`
- request tanpa token valid harus `403`
- callback endpoint tidak boleh expose CSRF dependency

## 5. Session Lifecycle Contract

- satu tenant maksimal satu active session
- session naming generic: `tenant-{tenant_id_compact}`
- auth state disimpan di direktori service lokal (`WA_AUTH_DIR`)
- state `connecting` punya TTL global maksimum 5 menit
- bila tidak mencapai `ready` dalam 5 menit, session wajib auto-disconnect dengan `meta.disconnect_reason=qr_timeout`
- timeout QR dan manual disconnect wajib menonaktifkan auto-restore (`auto_connect=false`)
- tidak ada auto-reconnect setelah timeout/manual disconnect; user harus klik Connect lagi
- saat service start:
  - fetch restore candidates
  - auto connect bila `auto_connect=true`
- session orphan (tenant sudah tidak ada) wajib dipruning

Session state callback meta minimum:

- `disconnect_reason` (`qr_timeout`, `manual_disconnect`, `auth_failure`, `service_disconnected`)
- `qr_generated_at`
- `connect_requested_at`
- `disconnected_at`

## 6. Message and Media Contract

Message log:

- simpan semua incoming/outgoing ke `tenant_whatsapp_messages`
- dedupe by `(tenant_id, direction, whatsapp_message_id)`

JID normalization:

- valid format:
  - `digits@c.us`
  - `digits@g.us`
  - `digits@lid.us`
- panjang digits: 6..20
- normalisasi input nomor plain ke `@c.us`

Media ingestion:

- allowed:
  - `image/*`
  - `application/pdf`
- max size: `4 MB`
- simpan metadata media ke `tenant_whatsapp_media`
- attachment yang sudah dipakai untuk action satu kali harus ditandai `consumed_at`

## 7. Command Engine Contract (Opsional)

- command parser aktif jika body diawali `/`
- command ringan (`/help`, `/ping`) boleh dijawab service
- command bisnis harus diproses backend app
- state command bertahap wajib pakai `tenant_whatsapp_command_contexts`
- TTL context default:
  - normal flow: 30 menit
  - attach-media flow: 10 menit

## 8. Reminder and Notification Contract

- outbound notification audit masuk `tenant_whatsapp_notifications`
- status minimal:
  - `sent`
  - `failed`
- dedupe outbound wajib pakai `notification_key` (tenant-scoped)

## 9. Integration Guardrails

- Semua endpoint modul ini tetap patuh tenant isolation, observability, dan audit policy dari [10-core-standard.md](./10-core-standard.md).
- Skema tabel modul ini mengacu ke [20-data-model-global.md](./20-data-model-global.md).
- Verifikasi dan gate rilis mengacu ke [50-quality-gates-and-checklists.md](./50-quality-gates-and-checklists.md).
