# PWA and Surface Contract

Dokumen ini mendefinisikan kontrak surface wajib dan baseline PWA untuk core platform multi-tenant.

Kontrak core (tenant isolation, no refresh, security, audit, observability) tetap mengacu ke [10-core-standard.md](./10-core-standard.md).

## 1. Surface Contract (Wajib)

Core platform wajib punya 3 surface:

1. `Global SaaS Landing` (public, non-tenant)
2. `Tenant Marketing Landing` (public, tenant-scoped)
3. `Tenant Dashboard` (authenticated, tenant-scoped)

### 1.1 Global SaaS Landing

- tujuan: marketing platform SaaS
- minimum sections:
  - hero + value proposition
  - feature highlights
  - trust/proof section
  - CTA utama (signup/login/contact)
- wajib i18n-ready

### 1.2 Tenant Marketing Landing

- tujuan: tenant memasarkan produk/jasa masing-masing
- domain strategy:
  - custom domain tenant (utama)
  - fallback domain route (subdomain/path) saat domain belum aktif
- domain mapping security rule:
  - `host` harus unik global (case-insensitive)
  - resolver precedence: `verified custom domain -> fallback route`
  - unverified/ssl-failed custom domain tidak boleh serve tenant content (fail-safe ke fallback/holding page)
  - perubahan ownership domain wajib melalui re-verification
- publishing workflow wajib:
  - `draft -> in_review -> approved -> published -> archived`
- wajib audit publish/unpublish ke `activity_logs`
- host routing wajib resolve tenant context sebelum render konten

### 1.3 Tenant Dashboard

- tujuan: workspace operasional tenant setelah login
- minimum widgets:
  - summary cards
  - quick actions
  - recent activity preview
- semua data wajib tenant-scoped + RBAC-aware
- interaksi dashboard wajib no full refresh

## 2. PWA Baseline Contract (Wajib)

PWA baseline wajib tersedia di core platform:

- `manifest.json` valid
- service worker (`sw.js`) terdaftar aman (graceful fail)
- offline fallback page
- install prompt/button state-aware

Caching strategy minimum:

- static app shell: cache-first
- API dinamis: network-first (dengan timeout/fallback)
- navigasi offline: fallback page

## 3. PWA Data Classification Rule (Wajib)

- `public-static` (asset publik): boleh di-cache jangka panjang dengan versioned filename
- `public-dynamic` (konten publik berubah): boleh di-cache pendek dengan revalidation
- `tenant-private` (authenticated/tenant data): default `no-store` dan tidak boleh masuk cache offline persisten

Jika ada exception cache untuk data authenticated read-only:

- cache key wajib scoped `tenant_id + actor_id + app_version`
- TTL pendek + eviction eksplisit
- wajib threat-review di dokumen fitur

## 4. Session Boundary Rule

Saat logout, tenant switch, atau user switch:

- purge cache yang terikat session sebelumnya
- service worker tidak boleh melayani stale data private tenant lama

## 5. Lifecycle Minimum

- deteksi update service worker
- prompt refresh saat versi baru siap
- safe fallback saat browser tidak support PWA

## 6. Integration Notes

- Event publish/unpublish tenant landing harus sinkron dengan audit log append-only.
- Endpoint authenticated yang dipakai dashboard harus mengikuti private cache policy (`tenant-private`).
- Semua interaksi UI di ketiga surface harus patuh no full refresh contract.

Referensi data model untuk surface ini ada di [20-data-model-global.md](./20-data-model-global.md).
