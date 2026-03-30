# 06 - Testing & Quality

## Mandatory Quality Gates

Jalankan ini sebelum merge:

```bash
npm run check:clean
npm run lint
npm run typecheck
npm run build
npm run docs:build
php artisan test
```

Kriteria lulus:

1. Tidak ada namespace page non-core di `resources/js/Pages`.
2. Tidak ada import shell lama atau package legacy yang dilarang oleh `scripts/cleanliness-check.mjs`.
3. Build default tidak memunculkan warning asset/font yang tidak resolve.
4. Build default tidak memunculkan warning chunk size.
5. Shared app shell harus tetap tunggal: tenant dan admin tidak boleh punya kontrak shell terpisah.
6. Folder asset residue Velzon yang dibanned oleh `check:clean` tidak boleh muncul lagi di `resources/images` atau `resources/scss/pages`.
7. Tenant settings harus tetap muncul di sidebar tenant; unauthorized access diverifikasi lewat `403`, bukan hide-only navigation.

## Test Matrix (Current)

Auth/security:

- `tests/Feature/Auth/AuthenticationTest.php`
- `tests/Feature/Auth/MfaAuthenticationTest.php`
- `tests/Feature/ProfileTest.php`

Tenant/RBAC:

- `tests/Feature/TenantMemberApiTest.php`
- `tests/Feature/TenantSelectorAccessTest.php`
- `tests/Feature/TenantSettingsTest.php`
- `tests/Feature/SuperadminControlPlaneTest.php`
- `tests/Feature/TenantWhatsappServiceIntegrationTest.php`

Subscription:

- `tests/Feature/TenantSubscriptionAdminTest.php`
- `tests/Feature/TenantSubscriptionGuardTest.php`
- `tests/Feature/TenantSubscriptionQuotaTest.php`

WhatsApp (API + Realtime):

- `tests/Feature/TenantWhatsappServiceIntegrationTest.php`
- Wajib mencakup:
  - `401` unauthenticated untuk endpoint tenant WhatsApp.
  - `403` feature unavailable (`FEATURE_NOT_AVAILABLE`) saat plan tidak mengaktifkan `whatsapp.chats`.
  - Cursor pagination pesan (`limit=15`, `before_id`, `has_more`, `next_before_id`).
  - Auto command reply incoming (`/ping`, `!help`) melalui callback internal.
  - Pesan non-command tidak boleh memicu auto-reply.
  - Service command down tetap menjaga callback `200` (no hard fail di callback path).
  - Guard bisnis `1 connected_jid = 1 tenant aktif` (reject newcomer + owner tenant tetap connected).
  - Unique partial index `connected_jid` non-null menolak duplikasi lintas tenant.
  - Pada conflict `connected_jid`, callback tetap `200` walau proses `remove session` ke service gagal (best effort).

E2E smoke:

- `tests/e2e/auth-smoke.spec.ts`
- `tests/e2e/workspace-smoke.spec.ts`

## Workspace Smoke Inputs

`tests/e2e/workspace-smoke.spec.ts` memakai environment berikut bila tersedia:

- `E2E_AUTH_EMAIL`
- `E2E_AUTH_PASSWORD`
- `E2E_TENANT_SLUG`
- `E2E_UPGRADE_URL` (opsional)
- `E2E_ADMIN_DASHBOARD_URL` (opsional)

Catatan:

- Gunakan akun seed tanpa MFA/Turnstile blocking untuk smoke test.
- Jika env workspace tidak tersedia, spec workspace akan skip dengan alasan eksplisit.
- Smoke workspace memverifikasi tenant dan admin sama-sama memakai customizer shared shell yang sama.
- Smoke workspace juga perlu memverifikasi parity perilaku shell: compact `md/sm/sm-hover`, submenu aktif, dan profile dropdown tenant/admin.
- Smoke workspace tenant juga perlu memverifikasi branding tenant: logo compact, logo expanded, dan favicon fallback setelah upload/reset.
- Smoke workspace tenant juga perlu memverifikasi tenant settings nav tetap terlihat dan unauthorized route berakhir pada forbidden cover state.

## Validasi Konten Docs (Wajib)

1. Tiap halaman fitur punya minimal 1 diagram flow.
2. Tiap halaman fitur punya minimal 3 screenshot.
3. Route/middleware/controller yang disebut harus tersedia di `routes/*` dan `app/*`.
4. Endpoint RBAC/subscription harus punya referensi test terkait.
5. Tenant settings dan branding upload harus punya referensi test terkait untuk permission, overwrite slot, reset fallback, dan cleanup storage.
6. Unauthorized tenant settings access harus punya screenshot dan smoke expectation yang konsisten dengan forbidden cover tenant lain.

## Validasi Teknis Docs Site

Jalankan:

```bash
npm run docs:build
```

Kriteria lulus:

1. Sidebar urut sesuai IA.
2. Tidak ada broken links internal.
3. Search menemukan kata kunci:
   - `team.roles`
   - `tenant.feature`
   - `I18N_LANGUAGE`
   - `plan_code`
   - `PLAN_QUOTA_EXCEEDED`

## Acceptance Onboarding

Onboarding dianggap lulus jika developer baru dapat:

1. Menjalankan aplikasi dari `01-quickstart`.
2. Menjelaskan alur RBAC, i18n, subscription, dan compat import policy tanpa baca source code penuh.
3. Menambah satu module permission baru via `07-extension-guide`.
