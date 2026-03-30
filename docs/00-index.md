# Boilerplate Documentation Index (Agent Entry Point)

Dokumen ini adalah pintu masuk untuk agent AI dan developer saat membuat aplikasi multi-tenant baru dengan standar yang sama.

## Cara Pakai (Untuk Agent)

Urutan baca default:

1. Baca [10-core-standard.md](./10-core-standard.md)
2. Baca [20-data-model-global.md](./20-data-model-global.md)
3. Baca [50-quality-gates-and-checklists.md](./50-quality-gates-and-checklists.md)
4. Tambahkan domain docs sesuai kebutuhan:
   - [30-pwa-and-surfaces.md](./30-pwa-and-surfaces.md)
   - [40-whatsapp-wwebjs.md](./40-whatsapp-wwebjs.md)

## Matrix Kebutuhan per Tipe Aplikasi

| Tipe Aplikasi | Dokumen Wajib |
|---|---|
| Multi-tenant app dasar (tanpa WhatsApp) | `10`, `20`, `50` |
| Multi-tenant app + PWA + dashboard | `10`, `20`, `30`, `50` |
| Multi-tenant app + WhatsApp wwebjs | `10`, `20`, `40`, `50` |
| SaaS publik + tenant marketing + dashboard | `10`, `20`, `30`, `50` |
| Full stack (SaaS + tenant landing + dashboard + WhatsApp) | `10`, `20`, `30`, `40`, `50` |

## Precedence Rule (Anti-Kontradiksi)

Jika ada konflik antar dokumen, gunakan urutan prioritas ini:

1. `10-core-standard.md` (non-negotiable)
2. `20-data-model-global.md` (kontrak data global)
3. `30/40` (kontrak domain/surface)
4. `50` (quality gate dan template eksekusi)

Dokumen domain tidak boleh melonggarkan kontrak dari dokumen core.

## Scope Ringkas per Dokumen

- `10-core-standard.md`: tenant isolation, identity (`users` vs `tenant_members`), RBAC, no refresh, API, audit, OCC, security, observability.
- `20-data-model-global.md`: blueprint tabel global + relasi + ERD + kontrak migration.
- `30-pwa-and-surfaces.md`: PWA baseline + surface SaaS landing, tenant landing, tenant dashboard.
- `40-whatsapp-wwebjs.md`: kontrak integrasi WhatsApp (`wwebjs`) end-to-end.
- `50-quality-gates-and-checklists.md`: setup baseline, verification scenarios, DoD, feature gate template.
