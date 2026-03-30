# 04 - API Reference

## Base

- Public: `/api/v1/...`
- Tenant protected: `/api/v1/tenants/{tenant}/...`
- Auth: `auth:sanctum`

## Middleware Contract

Tenant API route group menggunakan:

1. `auth:sanctum`
2. `tenant.initialize`
3. `tenant.access`
4. `permission.team`
5. `tenant.feature:<module>,<action>` (per endpoint)

Mutation endpoint umumnya memakai:

- `superadmin.impersonation`
- `throttle:tenant.mutation`

## Endpoint Groups

### Lifecycle

- `POST /api/v1/tenants`
- `POST /api/v1/invitations/accept`
- `POST /api/v1/tenants/{tenant}/suspend`
- `POST /api/v1/tenants/{tenant}/restore`

### Members

- `GET /api/v1/tenants/{tenant}/members`
- `POST /api/v1/tenants/{tenant}/members`
- `PATCH /api/v1/tenants/{tenant}/members/{member}`
- `DELETE /api/v1/tenants/{tenant}/members/{member}`
- `PATCH /api/v1/tenants/{tenant}/members/{member}/profile`
- `PATCH /api/v1/tenants/{tenant}/members/{member}/whatsapp-jid`

### Roles

- `GET /api/v1/tenants/{tenant}/roles`
- `POST /api/v1/tenants/{tenant}/roles`
- `PATCH /api/v1/tenants/{tenant}/roles/{role}`
- `PATCH /api/v1/tenants/{tenant}/roles/{role}/permissions`
- `DELETE /api/v1/tenants/{tenant}/roles/{role}`

### Invitations

- `GET /api/v1/tenants/{tenant}/invitations`
- `POST /api/v1/tenants/{tenant}/invitations`
- `POST /api/v1/tenants/{tenant}/invitations/{invitation}/revoke`
- `DELETE /api/v1/tenants/{tenant}/invitations/{invitation}`
- `POST /api/v1/tenants/{tenant}/invitations/{invitation}/resend`

### WhatsApp

- `GET /api/v1/tenants/{tenant}/whatsapp/session`
- `POST /api/v1/tenants/{tenant}/whatsapp/session/connect`
- `POST /api/v1/tenants/{tenant}/whatsapp/session/disconnect`
- `GET /api/v1/tenants/{tenant}/whatsapp/chats`
- `GET /api/v1/tenants/{tenant}/whatsapp/chats/{jid}/messages`
- `POST /api/v1/tenants/{tenant}/whatsapp/chats/{jid}/send`
- `POST /api/v1/tenants/{tenant}/whatsapp/chats/{jid}/read`

Internal callback behavior note:

- `POST /internal/v1/whatsapp/messages` (internal token protected) dapat memicu auto outgoing reply jika incoming text diawali `/` atau `!` dan command valid (`ping`, `help`).
- Jika command tidak dikenali, sistem mengirim fallback help message.
- `POST /internal/v1/whatsapp/session-state` menerapkan guard global `connected_jid`: jika nomor sudah aktif di tenant lain, tenant callback yang baru akan dipaksa `disconnected` dengan metadata conflict (`jid_conflict`) dan endpoint tetap merespons `200`.
- Pada path conflict tersebut, backend akan mencoba `remove session` ke service untuk tenant newcomer secara _best effort_; kegagalan service hanya dicatat di log dan tidak mengubah respons callback (`200`).

Query contract for `GET /whatsapp/chats/{jid}/messages`:

- `limit` (optional, default `15`, max `50`)
- `before_id` (optional cursor id untuk mengambil pesan yang lebih lama)

Response contract for `GET /whatsapp/chats/{jid}/messages`:

- `data.messages[]` (ascending by id, oldest -> newest di batch yang diminta)
- `data.has_more` (`true` jika masih ada pesan lebih lama)
- `data.next_before_id` (`id` pesan paling tua di batch saat ini; kirim ke request berikutnya sebagai `before_id`)

JID accepted:

- `digits@c.us`
- `digits@g.us`
- `digits@lid.us`
- plain number input will be normalized to `digits@c.us`

## Error Contract (Yang Sering Muncul)

- `FEATURE_NOT_AVAILABLE` (403)
- `PLAN_QUOTA_EXCEEDED` (422)
- `VALIDATION_ERROR` (422)
- `VERSION_CONFLICT` (409)
- `IMMUTABLE_SYSTEM_ROLE` (422)
