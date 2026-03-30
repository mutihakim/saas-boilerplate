# Core Platform Standard (Non-Negotiable)

## 1. Tujuan

- Menyediakan baseline arsitektur multi-tenant yang konsisten.
- Menetapkan kontrak engineering yang wajib untuk kualitas profesional.
- Memisahkan `Core Platform` dari `Optional Modules` agar reusable lintas domain.

## 2. Model Arsitektur

Boilerplate dibagi menjadi dua lapisan:

1. `Core Platform` (wajib)
2. `Optional Modules` (opsional, plug-and-play)

Core platform wajib mencakup:

- tenant isolation
- identity model (`users` vs `tenant_members`)
- RBAC dan authorization
- API contract dan error contract
- audit logging contract
- concurrency contract (optimistic locking)
- no full refresh interaction contract
- observability, security, migration, dan CI gates

Kontrak PWA/surface dan WhatsApp didefinisikan terpisah:

- [30-pwa-and-surfaces.md](./30-pwa-and-surfaces.md)
- [40-whatsapp-wwebjs.md](./40-whatsapp-wwebjs.md)

## 3. Tenant Isolation Contract

- Semua tabel bisnis wajib punya kolom `tenant_id`.
- Semua query domain wajib filter `tenant_id` paling awal.
- Semua unique constraint domain harus tenant-scoped (contoh: `tenant_id + email`).
- Semua route handler, service, job, event, dan cache key wajib membawa `tenant_id`.
- Akses cross-tenant harus gagal (disarankan `404` untuk mengurangi informasi bocor).

## 4. Identity Contract: `users` vs `tenant_members`

`users`:

- identitas login global
- tidak otomatis jadi actor domain

`tenant_members`:

- actor domain di tenant tertentu
- menyimpan role operasional tenant
- boleh profile-only (`user_id` nullable)

Kontrak relasi:

- satu `user` bisa punya banyak `tenant_members` lintas tenant
- satu `tenant_member` hanya milik satu tenant
- owner administratif tenant disimpan di `tenants.owner_user_id`, bukan di role operasional

Kontrak authorization:

- authorization domain harus memakai `tenant_member` aktif
- auth `user` saja tidak cukup untuk izin domain tenant

Kontrak audit:

- simpan jejak `user` untuk audit sistem (`created_by_user_id`, `reviewed_by_user_id`)
- simpan jejak `tenant_member` untuk actor domain (`actor_member_id`, `approved_by_member_id`)

## 5. RBAC Contract

Role default yang disarankan:

- `tenant_owner`
- `tenant_admin`
- `tenant_operator`
- `tenant_member`
- `tenant_viewer`

Aturan:

- semua mutation sensitif wajib lewat policy/gate
- role matrix per action harus didefinisikan sebelum coding
- middleware auth bukan pengganti policy domain

## 6. No Full Refresh Interaction Contract

Berlaku untuk seluruh area app interaktif:

- dilarang full reload untuk flow CRUD interaktif
- gunakan request async (Livewire action/fetch/axios)
- response backend untuk endpoint async harus payload async, bukan redirect page
- hindari pola `return back()->with(...)` pada endpoint async
- wajib ada:
  - loading indicator
  - disable state saat request in-flight
  - global success/error notification

Pengecualian:

- file download
- auth/session expiry redirect
- navigasi eksplisit ke context lain yang memang full page

## 7. API Contract

Versioning:

- gunakan URL versioning: `/api/v1/...`

Response envelope:

```json
{
  "ok": true,
  "data": {}
}
```

Error envelope:

```json
{
  "ok": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed.",
    "details": {}
  }
}
```

Idempotency:

- endpoint yang rawan duplikasi wajib dukung `Idempotency-Key`
- simpan key per tenant + actor + endpoint + request hash

Endpoint update/delete entity mutable wajib membawa `row_version`.

- default `row_version` dikirim sebagai field body request
- conflict versi wajib return `409` dengan code `VERSION_CONFLICT`

Contoh conflict envelope:

```json
{
  "ok": false,
  "error": {
    "code": "VERSION_CONFLICT",
    "message": "Resource has been modified by another request.",
    "details": {
      "current_row_version": 12,
      "server_snapshot": {}
    }
  }
}
```

## 8. Audit Logging Contract

- semua mutation domain penting wajib menulis `activity_logs`
- write audit log harus dalam transaksi yang sama dengan mutation utama
- audit log minimum menyimpan:
  - `tenant_id`
  - `actor_user_id` (nullable)
  - `actor_member_id` (nullable)
  - `action`
  - `target_type`
  - `target_id`
  - `changes` (ringkasan before/after)
  - `metadata` (source channel, extra context)
  - `request_id`
- audit log integritas minimum:
  - `occurred_at` (UTC event time)
  - `result_status` (`success|failed|rejected`)
  - `before_version` dan `after_version` (untuk entity OCC)
  - `source_ip` dan `user_agent` (jika context HTTP tersedia)
- audit log bersifat append-only:
  - update/delete audit row dilarang
  - koreksi audit dilakukan dengan row audit baru (`correction_event`)
- field sensitif dalam `changes/metadata` wajib redaction/masking
- event gagal authorization/validation tidak ditulis sebagai mutation success log

## 9. Concurrency Contract (OCC `row_version`)

- semua entity mutable yang rawan concurrent update wajib punya kolom `row_version`
- update pattern wajib compare-and-increment:
  - `WHERE id = ? AND tenant_id = ? AND row_version = ?`
  - jika match -> update data + `row_version = row_version + 1`
  - jika tidak match -> return `409 VERSION_CONFLICT`
- conflict path wajib ditangani async oleh UI (toast + reload partial, tanpa full refresh)
- entity append-only tidak wajib `row_version` (contoh: immutable event/message ledger)
- edge-case OCC wajib:
  - bulk update/delete harus tetap OCC per record (tanpa bypass)
  - worker/job background yang mutate entity mutable wajib pakai OCC yang sama
  - soft delete pada entity mutable wajib increment `row_version`
  - daftar exception OCC harus eksplisit di dokumen desain fitur (tidak implicit)

## 10. Data and Migration Contract

- semua timestamp bisnis disimpan dalam UTC
- konversi timezone hanya saat render
- nominal uang gunakan `amount_minor` (integer), hindari float
- migration strategy wajib:
  1. expand schema (backward compatible)
  2. backfill data
  3. switch read/write path
  4. cleanup kolom lama (rilis berikutnya)

Detail data model global ada di [20-data-model-global.md](./20-data-model-global.md).

## 11. Security Contract

- semua internal callback antar service wajib token auth (`X-Internal-Token`) dan wajib aktif di semua environment non-local
- secret tidak boleh hardcoded di source
- aktifkan rate limit untuk endpoint publik dan endpoint command
- validasi input wajib di boundary controller/API
- log security event minimum:
  - auth failure
  - forbidden access
  - invalid callback token

## 12. Observability and Logging Layers Contract

Boilerplate wajib membedakan 2 layer logging:

- `Observability logs`:
  - tujuan: monitoring operasional, tracing, debugging runtime
  - source: request lifecycle, worker/job, external service call
  - retention: mengikuti policy monitoring platform
- `Activity logs`:
  - tujuan: audit domain mutation per tenant
  - source: business action yang mengubah state
  - retention: mengikuti policy audit/compliance

Satu aksi domain bisa menulis keduanya (contoh update data penting: observability + activity audit).

Structured observability log wajib punya field minimal:

- `timestamp`
- `level`
- `service`
- `tenant_id` (jika ada context)
- `actor_id` (user/member bila tersedia)
- `trace_id` atau `request_id`
- `event_name`

Metrics minimal:

- request latency (`p50/p95/p99`)
- error rate per endpoint
- queue lag dan failed jobs
- outbound message success/failure rate

## 13. CI/CD Quality Gates

PR dianggap lulus jika:

- unit/feature tests pass
- static checks pass
- build assets pass
- migration smoke-test pass
- tidak ada perubahan yang melanggar contract tenant isolation

Checklist operasional lengkap ada di [50-quality-gates-and-checklists.md](./50-quality-gates-and-checklists.md).

## 14. Optional Domain Modules (High-Level)

Workflow/Task (opsional):

- seluruh entity workflow tenant-scoped
- completion dan approval harus pisahkan actor `user` vs `tenant_member`
- event side effect (point, notification, reminder) harus idempotent

Finance (opsional):

- transaksi tenant-scoped
- gunakan `amount_minor` integer
- category tenant-scoped
- attachment tenant-scoped
- action `void` wajib menyimpan actor + reason + timestamp
