# Quality Gates and Checklists

Dokumen ini adalah kontrak verifikasi implementasi agar boilerplate tetap production-grade.

## 1. Setup Baseline

### 1.1 Core App Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
npm install
npm run build
```

### 1.2 WhatsApp Service Setup (Optional)

```bash
cd services/whatsapp
npm install
pm2 start pm2.config.js
pm2 restart tenant-whatsapp-service
```

### 1.3 Environment Minimum

```env
DB_CONNECTION=pgsql
WHATSAPP_SERVICE_ENABLED=true
WHATSAPP_SERVICE_URL=http://127.0.0.1:3010
WHATSAPP_SERVICE_TIMEOUT=5
WHATSAPP_INTERNAL_TOKEN=replace_with_secure_token
```

## 2. Verification Checklist

Command baseline:

```bash
php artisan migrate
php artisan test
php artisan view:cache
npm run build
php artisan optimize:clear
```

Server runtime checks:

```bash
sudo systemctl reload php8.3-fpm
pm2 restart tenant-whatsapp-service
```

Scenario baseline wajib:

- success update dengan `row_version` valid -> `row_version` increment
- stale update dengan `row_version` lama -> `409 VERSION_CONFLICT`
- mutation sukses menulis tepat satu `activity_logs` row
- mutation rollback tidak menulis `activity_logs` success
- cross-tenant mutation ditolak dan tidak membuat mutation success log
- observability log dan activity log tidak tercampur fungsi (operasional vs audit)
- audit log append-only tervalidasi (tidak ada update/delete path)
- PWA install prompt muncul di browser support
- offline fallback page ter-load saat jaringan putus
- endpoint `tenant-private` tidak disimpan di offline persistent cache
- logout/tenant switch melakukan cache purge session-bound
- route host tenant resolve benar:
  - custom domain tenant
  - fallback domain route
- custom domain unverified/ssl-failed tidak serve tenant page
- publish workflow tenant landing berjalan `draft -> in_review -> approved -> published -> archived`
- bulk update, worker update, dan soft delete pada entity mutable tetap patuh OCC

## 3. Definition of Done (Per Feature)

Sebuah fitur dianggap selesai jika:

- tidak ada query bisnis tanpa `tenant_id`
- policy/gate sudah menutup semua mutation sensitif
- flow interaktif mengikuti no full refresh contract
- response API mengikuti contract (`ok/data/error`)
- log audit actor (`user` dan/atau `tenant_member`) tercatat sesuai konteks
- observability log minimum fields terpenuhi
- conflict concurrency (`409 VERSION_CONFLICT`) ada dan tertangani async
- jika fitur menyentuh surface public/app, kontrak landing/dashboard terpenuhi
- jika fitur menyentuh PWA, install/offline/update lifecycle tervalidasi
- test minimum (happy path, validation, authorization, cross-tenant) lulus
- dokumentasi gate decision diperbarui

## 4. Feature Gate Template

```md
## Feature Start Gate
- Tenant Isolation Gate:
- RBAC Gate:
- Reuse Gate:
- Integration Gate (optional module impact):
- Surface Gate (SaaS landing / tenant landing / dashboard):
- PWA Gate (jika terdampak):

## API Contract
- Endpoint:
- Request shape:
- Concurrency field (`row_version`):
- Success response:
- Error response:
- Conflict response (`409 VERSION_CONFLICT`):
- Idempotency requirement:
- Private cache policy impact (jika endpoint authenticated):

## Data Contract
- Tables touched:
- Tenant-scoped constraints:
- Audit log write rule:
- Audit integrity fields and redaction rule:
- OCC strategy (`row_version` compare-and-increment):
- OCC edge coverage (bulk/worker/soft-delete):
- Public sites/domain mapping impact (jika ada):
- Domain mapping security rule (host uniqueness + resolver precedence):
- Migration strategy (expand/backfill/switch/cleanup):

## Verification
- Commands run:
- PWA checks:
- Surface checks:
- Test results:
- Residual risks:
```

## 5. Maintenance Rule

- Jangan menambah aturan baru di domain docs tanpa sinkronisasi dengan core standard.
- Jika aturan baru bersifat lintas domain, update dulu [10-core-standard.md](./10-core-standard.md), lalu referensikan dari dokumen lain.
- Jika ada perubahan skema global, update [20-data-model-global.md](./20-data-model-global.md) dan checklist verifikasinya.
