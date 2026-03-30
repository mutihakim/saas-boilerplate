# Progress - Subscription

Status: `In Progress`  
Last updated: `2026-03-30`  
Owner: `Platform Team`

## Tujuan Modul

Mengontrol akses fitur dan kuota per plan tenant secara eksplisit melalui middleware guard dan service entitlements.

## Milestone Checklist

- [x] Dokumen fitur subscription (`03-features/subscription.md`) tersedia.
- [x] Plan matrix dan limit labels terdokumentasi.
- [x] Guard behavior web/API (`FEATURE_NOT_AVAILABLE`, redirect upgrade) terdokumentasi.
- [x] Test map guard/quota/admin update sudah ditautkan.
- [ ] Screenshot real flow upgrade/quota belum lengkap.

## Progress Terkini

- Kontrak `plan_code`, `tenant.feature`, dan `PLAN_QUOTA_EXCEEDED` sudah terdokumentasi dengan jelas.
- Admin flow ubah subscription dan dampaknya ke entitlements frontend sudah tercatat.
- Shared Inertia usage count kini hanya dihitung untuk dashboard tenant agar biaya shell global tetap rendah.

## Blocker & Dependency

- Blocker: bukti visual untuk quota exceeded di UI belum tersedia.
- Dependency: test data plan tenant untuk demo flow free/pro/business dan URL upgrade smoke yang konsisten.

## Next Actions

1. Ganti placeholder screenshot subscription dengan capture real 3 state utama.
2. Tambah catatan lintas modul untuk sinkronisasi `permission_modules` dan `subscription_entitlements`.
3. Validasi ulang copy error message agar konsisten web vs API.

## Referensi PR/Issue/Test

- Feature docs: `docs/03-features/subscription.md`
- Test terkait:
  - `tests/Feature/TenantSubscriptionAdminTest.php`
  - `tests/Feature/TenantSubscriptionGuardTest.php`
  - `tests/Feature/TenantSubscriptionQuotaTest.php`
