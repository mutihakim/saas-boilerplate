# 07 - Extension Guide

## Prinsip Utama

Jika ingin mengambil referensi halaman dari folder `velzon`, lakukan porting melalui adapter compat dan jangan hidupkan kembali struktur shell lama di core app.

Aturan mounting area:

1. Modul logged-in default mount ke shared shell `resources/js/app-shell/AppShellLayout.tsx`.
2. Wrapper `Auth` dan `Landing` tetap khusus konteksnya, tetapi harus memakai visual system yang sama.
3. Jika referensi baru butuh helper visual ala Velzon, tambahkan adapter di `resources/js/compat/velzon` alih-alih menghidupkan ulang layout/menu data lama.

Aturan tetap:

1. Core app hanya boleh memakai page root `Auth`, `Tenant`, `Admin`, `Landing`.
2. Helper yang meniru pola halaman referensi harus diekspor dari `resources/js/compat/velzon`.
3. Asset/icon/plugin tambahan yang hanya dibutuhkan modul porting harus masuk lewat entry compat, bukan `resources/scss/themes.scss`.

## A. Menambah Module Permission (RBAC + Subscription)

Langkah aman:

1. Tambah module/action di `config/permission_modules.php`.
2. Tambah module/action di `config/subscription_entitlements.php` pada tiap plan relevan.
3. Pasang `tenant.feature:<module>,<action>` di route web/api yang sesuai.
4. Update policy bila butuh authorize khusus.
5. Update UI gating (hide/show action) berdasarkan shared props entitlements/permissions.
6. Tambah/ubah test feature untuk guard + behavior.
7. Update dokumen:
   - `docs/03-features/rbac.md` atau `docs/03-features/subscription.md`
   - `docs/04-api-reference.md`
   - `docs/06-testing-quality.md`
8. Jika modul memakai referensi halaman dari `velzon`, buat adapter presentational di `resources/js/compat/velzon` dan pastikan import core tetap melewati root compat tersebut.

## B. Menambah Bahasa Baru (i18n)

1. Tambah folder locale baru: `resources/js/locales/<lang>/`.
2. Tambah file namespace yang sama (`common.json`, `layout.json`, `auth.json`, `admin.json`, `tenant.json`).
3. Daftarkan resource di `resources/js/i18n.ts`.
4. Daftarkan opsi dropdown di `resources/js/common/languages.ts`.
5. Uji fallback saat key tidak tersedia.
6. Update `docs/03-features/i18n.md`.

## C. Menambah Limit Quota Baru

1. Tambah key limit di `config/subscription_entitlements.php`.
2. Implement check di service/controller yang relevan memakai `SubscriptionEntitlements::limit()` atau `assertUnderLimit()`.
3. Expose usage di `HandleInertiaRequests` bila perlu ditampilkan UI.
4. Tambah test untuk kondisi di bawah limit dan melebihi limit.
5. Update dokumentasi subscription + testing.

## D. Menambah Field Tenant Settings atau Branding Baru

1. Tambah kolom tenant lewat migration.
2. Tambah field ke `app/Models/Tenant.php`.
3. Tambah validasi di request tenant settings yang sesuai.
4. Tambah payload di `TenantSettingsController::tenantPayload()`.
5. Jika field dipakai shell, expose juga lewat shared props di `HandleInertiaRequests`.
6. Jika field adalah branding asset, ikuti kontrak slot per tenant di `TenantBranding`.
7. Tambah test untuk permission, persistence, fallback, dan cleanup bila perlu.
8. Update `docs/03-features/tenant-settings.md`, `docs/05-ui-walkthrough.md`, dan `docs/06-testing-quality.md`.

## Do / Don't

Do:

- Gunakan middleware + policy sebagai guard utama.
- Pertahankan konsistensi naming `module.action`.
- Update docs dan test dalam PR yang sama.
- Port referensi UI dari `velzon` melalui compat adapter tipis dan review ulang asset yang benar-benar diperlukan.
- Gunakan namespace `appShell` bila menyentuh `PUT /settings/theme`.
- Jika modul baru menambah opsi shell, ikuti shape canonical `appShell` ala Velzon penuh; jangan membuat namespace preferensi baru untuk tenant atau admin.
- Untuk field tenant settings, pisahkan domain organisasi tenant dari account user dan pertahankan route di `/t/{tenant}/settings/*`.
- Untuk unauthorized state tenant workspace, pertahankan pola forbidden cover yang konsisten; jangan menggantinya dengan modal generik.

Don't:

- Jangan menambah route tenant tanpa `tenant.initialize`, `tenant.access`, `permission.team`.
- Jangan hardcode plan check tersebar tanpa reuse `SubscriptionEntitlements`.
- Jangan merge fitur baru tanpa screenshot dan test map update.
- Jangan mengembalikan `Layouts/HorizontalLayout`, `Layouts/VerticalLayouts`, `resources/js/admin-shell`, Redux layout slice, atau page namespace demo ke core app.
- Jangan memuat stylesheet berat Velzon secara global hanya demi satu modul admin atau satu halaman tenant.
