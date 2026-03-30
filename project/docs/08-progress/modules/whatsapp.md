# Progress - WhatsApp Integration

Status: `Done`  
Last updated: `2026-03-31`  
Owner: `Integration Team`

## Tujuan Modul

Menyediakan kapabilitas integrasi WhatsApp berbasis WebSockets (via Laravel Reverb) secara real-time untuk tiap tenant.

## Milestone Checklist

- [x] Node.js Webhook & QR Session tracking terhubung.
- [x] Sinkronisasi status *Connecting* dan mitigasi Timeout Callback NodeJS.
- [x] Transisi HTTP Polling menuju Laravel Reverb WebSockets.
- [x] Broadcast Event (`WhatsappMessageReceived`, `WhatsappSessionStateUpdated`) beroperasi penuh.
- [x] Reverb 403 Forbidden payload dan payload limit resolution.

## Progress Terkini

- Infrastruktur frontend Inertia React _fully functional_ menggunakan `window.Echo`.
- Otomasi auto-load pesan chat dan sinkronisasi sesi telah di-_deploy_ dan diuji end-to-end tanpa error 500/403.
- Endpoint pesan chat kini memakai cursor pagination batch 15 (`before_id`, `has_more`, `next_before_id`) dan UI menyediakan tombol **Load more** (EN/ID) dengan posisi scroll stabil.
- Handling `401` di layar chat diperketat: stop chain request, tampilkan notif sesi expired, dan redirect ke login dengan `intended` URL.
- Proses `reverb:start` + `queue:work` sudah disiapkan untuk auto-run melalui PM2 profile `ecosystem.config.cjs`.
- Auto-reply command incoming (`/` dan `!`) untuk `ping` dan `help` sudah aktif dari callback Laravel, dengan fallback help untuk command tidak dikenal.
- UI WhatsApp Settings direfresh: QR/Handshake digabung ke card status sesi, plus card baru `Command Guide` (EN/ID).
- Guard bisnis lintas tenant aktif: satu `connected_jid` hanya boleh aktif di satu tenant (policy reject newcomer), dengan metadata conflict `jid_conflict` untuk observabilitas UI.
- Safety net database ditambahkan via unique partial index `connected_jid IS NOT NULL`, termasuk cleanup migrasi duplikasi existing (`jid_conflict_migration`, keep tenant terlama).
- Saat conflict runtime, tenant newcomer kini juga otomatis ditrigger `removeSession` ke service secara best effort agar auth cache service ikut dibersihkan.

## Blocker & Dependency

- Blocker: (Tidak ada)
- Dependency: PM2 `tenant-whatsapp-service` serta PM2 app `cabinet-reverb` dan `cabinet-queue-worker` wajib jalan di _background production_.

## Next Actions

1. Menambahkan dukungan penerimaan/pengiriman file media (Image/Video).
2. Menyempurnakan layout status centang (Read Receipts) di sidebar History Chat.
3. Menambahkan test browser/E2E untuk alur Load more + recovery sesi expired + command guide visibility.

## Referensi PR/Issue/Test

- Feature docs: `docs/03-features/whatsapp.md`
- Entry points:
  - `services/whatsapp/src/index.js`
  - `resources/js/Pages/Tenant/WhatsApp/Chats.tsx`
  - `resources/js/Pages/Tenant/WhatsApp/Settings.tsx`
  - `ecosystem.config.cjs`
