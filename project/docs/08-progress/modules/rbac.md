# Progress - RBAC

Status: `In Progress`  
Last updated: `2026-03-30`  
Owner: `Platform Team`

## Tujuan Modul

Menjaga kontrol akses per tenant secara konsisten melalui route middleware, policy authorization, dan Spatie teams context.

## Milestone Checklist

- [x] Dokumen fitur RBAC (`03-features/rbac.md`) tersedia.
- [x] Mapping route/middleware/controller/policy terdokumentasi.
- [x] Test map RBAC ditautkan di dokumentasi.
- [ ] Screenshot real UI flow lengkap (happy, forbidden, conflict).
- [ ] PR checklist enforcement untuk update progress masih perlu disosialisasi.

## Progress Terkini

- Kontrak RBAC inti sudah didokumentasikan, termasuk `permission.team`, `tenant.feature`, policy fallback role.
- Referensi endpoint API roles/members sudah sinkron dengan docs API.
- Shell tenant/admin kini memakai satu source of truth untuk navigasi, sehingga permission-aware menu tidak lagi tersebar di beberapa layout warisan.

## Blocker & Dependency

- Blocker: capture screenshot UI real belum tersedia.
- Dependency: environment seed data role/permission stabil untuk screenshot repeatable dan smoke workspace.

## Next Actions

1. Ganti placeholder screenshot RBAC dengan capture real dari flow roles.
2. Tambahkan contoh satu kasus `VERSION_CONFLICT` berbasis data test.
3. Validasi lintas halaman agar istilah permission konsisten (`team.role_permissions.assign`).

## Referensi PR/Issue/Test

- Feature docs: `docs/03-features/rbac.md`
- Test terkait:
  - `tests/Feature/TenantMemberApiTest.php`
  - `tests/Feature/SuperadminControlPlaneTest.php`
  - `tests/Feature/TenantSelectorAccessTest.php`
