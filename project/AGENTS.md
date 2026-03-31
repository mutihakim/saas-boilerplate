# AGENTS.md - Docs-First + Progress-First Workflow for `project`

## Mandatory Note

`AGENTS.md` adalah satu-satunya **Source of Truth** untuk workflow agent AI di folder `project`.

## 1) Mission & Scope

Panduan ini berlaku untuk semua agent AI yang mengubah kode, dokumentasi, atau test di folder `project`.

Tujuan utama:

- Selalu bekerja berdasarkan dokumentasi `project/docs` (docs-driven).
- Menjaga konsistensi standar arsitektur/fitur yang sudah ada.
- Memastikan progress modul selalu terbarui pada setiap PR/merge.

## 2) Mandatory Read Order

Sebelum implementasi perubahan, agent wajib membaca:

1. `docs/00-overview.md`
2. `docs/02-architecture.md`
3. `docs/03-features/{rbac,i18n,subscription}.md` sesuai modul yang disentuh
4. `docs/06-testing-quality.md`
5. `docs/07-extension-guide.md`
6. `docs/08-progress/index.md` dan `docs/08-progress/modules/<module>.md` terkait

Jika perubahan menyentuh endpoint, baca juga `docs/04-api-reference.md`.
Jika perubahan menyentuh alur UI, baca juga `docs/05-ui-walkthrough.md`.

## 3) Non-Negotiable Standards

1. Tenant route guard
- Route tenant wajib mempertahankan guard yang sesuai:
  - `tenant.initialize`
  - `tenant.access`
  - `permission.team`
  - `tenant.feature` (bila fitur berbayar/berentitlement)

2. RBAC naming
- Permission wajib konsisten dengan format `module.action`.
- Hindari naming baru yang tidak mengikuti matrix `config/permission_modules.php`.

3. Subscription policy
- Semua logic plan/limit wajib melalui `SubscriptionEntitlements`.
- Pemeriksaan kuota (seperti pengecekan *max members*) diperbolehkan dilakukan di tingkat *Controller* agar dapat mengembalikan custom respons JSON (misal `HTTP 422` dengan envelope lengkap `ok: false`) ketimbang melemparkan generic `RuntimeException` lewat Policy/Gate.
- Dilarang hardcode jumlah plan limit tanpa mengekstrak dari `subscription_entitlements` config.

4. i18n policy
- Dilarang menambah user-facing copy hardcoded pada area yang sudah translated.
- Gunakan key translation yang konsisten dan update locale yang relevan.

## 4) Docs Update Contract (Strict)

Jika perubahan menyentuh fitur/modul:

1. Wajib update dokumen fitur terkait di `docs/03-features/*`.
2. Wajib update `docs/04-api-reference.md` jika endpoint/middleware contract berubah.
3. Wajib update `docs/06-testing-quality.md` jika test map/scenario berubah.
4. Wajib update referensi screenshot jika flow UI berubah.

PR tidak dianggap selesai bila kontrak di atas diabaikan tanpa alasan eksplisit.

## 5) Progress Update Contract (Strict)

Jika PR menyentuh sebuah modul:

1. Wajib update `docs/08-progress/modules/<module>.md`.
2. Wajib update `docs/08-progress/index.md` jika status/progress/blocker high-level berubah.
3. Timestamp wajib format `YYYY-MM-DD`.
4. Bagian `Next Actions` maksimal 3 item aktif.

## 6) PR Completion Checklist for Agents

Sebelum menutup pekerjaan, agent wajib melaporkan status:

- Code change done
- Test/verification done
- Docs changed
- Progress changed

Jika ada item tidak dilakukan, agent wajib menulis alasan eksplisit dan risikonya.

## 7) Output Style for Agent Reports

- Ringkas, langsung ke perubahan inti.
- Wajib menyertakan bukti file yang disentuh.
- Wajib menyebut file docs/progress yang diperbarui.
- Jika ada deviation dari standar ini, jelaskan alasan secara eksplisit.
