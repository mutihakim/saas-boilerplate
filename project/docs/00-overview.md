# 00 - Overview

## Tujuan

Dokumentasi ini menjadi source of truth untuk implementasi dan pengembangan fitur di `project`, bukan dokumen marketing.

Target audiens:

- Developer onboarding
- Internal engineer yang menambah modul baru
- Reviewer teknis yang memvalidasi alur route, guard, dan test

## Cakupan

In-scope:

- Arsitektur multi-tenant web + API
- RBAC
- i18n (frontend)
- Subscription (feature access + quota)
- Tenant settings dan branding per tenant
- UI walkthrough dan quality gates

Out-of-scope:

- Folder di luar `project`
- Dokumen produk non-teknis

## Documentation Contract

Semua perubahan fitur baru wajib mengubah dokumentasi pada PR yang sama.

Checklist minimum:

1. Update halaman fitur terkait di `docs/03-features/*`.
2. Tambahkan screenshot alur (`happy path`, `forbidden/unauthorized`, `quota/feature unavailable` bila relevan).
3. Update route map (`UI -> Route -> Middleware -> Controller/Policy/Service`).
4. Update test map di `docs/06-testing-quality.md`.
5. Jika fitur menyentuh tenant branding atau shell visibility, dokumentasikan fallback order dan expected forbidden UX.

## Konvensi

- Penamaan screenshot: `<feature>-<flow>-<state>.png`
- Referensi kode: `path + line anchor` bila butuh presisi
- Bahasa: Indonesia teknis

## Template Halaman Fitur

Setiap halaman fitur wajib memiliki section ini:

1. Tujuan dan ruang lingkup
2. Diagram alur request (web + api)
3. Mapping `UI -> Route -> Middleware -> Controller/Policy/Service`
4. Struktur data/konfigurasi
5. Error/edge case + expected response
6. Cara extend aman (`do` / `don't`)
