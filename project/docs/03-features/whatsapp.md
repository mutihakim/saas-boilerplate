# Fitur: Integrasi WhatsApp Real-Time

Modul WhatsApp memungkinkan tenant untuk menghubungkan nomor WhatsApp bisnis secara mandiri melalui arsitektur multi-tenant. Modul ini diotaki oleh microservice Node.js (`whatsapp-web.js`) yang menginisiasi _browser_ Chrome _headless_, yang kemudian berkomunikasi dua arah dengan API webhook murni Laravel.

## Arsitektur & Sinkronisasi (Reverb WebSockets)

Aplikasi SaaS ini **meninggalkan proses HTTP polling usang** dan beralih ke rute WebSocket berkecepatan tinggi melalui Laravel Reverb.

### 1. Sesi & Penautan QR Code
* Endpoint React `Settings.tsx` mendengarkan saluran aman `private-tenant.{id}.whatsapp` menggunakan Echo. 
* Begitu Node.js mengonversi QR *auth* baru, `InternalWhatsappCallbackController` secara asinkron mem-_broadcast_ ping `whatsapp.session.state.updated`. 
* **Optimasi Payload**: Guna menghemat beban pemrosesan server Reverb dan mitigasi "_413 Payload Too Large_", visual image Base64 dipotong dari payload Websocket; React akan mengambil gambarnya kembali via API GET segera setelah sensor ping Reverb memicu.

### 2. Auto-load Pesan Berjalan
* Layar obrolan `Chats.tsx` mendengarkan identitas event `.whatsapp.message.received`.
* Tiap kali PM2 Node.js mengirimkan setoran data *(webhook POST)* pesak masuk baru, _controller_ langsung mendelegasikan event `WhatsappMessageReceived`.
* React menangkap ping tersebut seketika dan menjalankan `loadMessages` tanpa perlu navigasi DOM atau kedipan layar tambahan.

### 3. Pagination Pesan Chat (Batch 15)
* Endpoint `GET /api/v1/tenants/{tenant}/whatsapp/chats/{jid}/messages` menggunakan cursor sederhana berbasis `before_id`.
* Default response hanya memuat 15 pesan terbaru (`limit=15`), dengan maksimum `limit=50`.
* Response menambahkan metadata:
  * `has_more` untuk menandai masih ada pesan lama.
  * `next_before_id` untuk request batch sebelumnya.
* UI `Chats.tsx` menampilkan tombol **Load more** (EN/ID). Saat diklik, UI memuat 15 pesan lama berikutnya dan mempertahankan posisi scroll agar tidak lompat.

### 4. Hardening Sesi Expired (401)
* Saat endpoint WhatsApp mengembalikan `401`, UI menghentikan chain request lanjutan, menampilkan notifikasi sesi berakhir (localized), lalu redirect ke login dengan `intended` URL.
* Tujuannya menghindari request loop/refresh spam dari halaman chat ketika cookie sesi sudah tidak valid.

### 5. Auto-Reply Command (`/` dan `!`)
* Callback incoming `POST /internal/v1/whatsapp/messages` sekarang memproses command otomatis untuk prefix `/` dan `!`.
* Command v1:
  * `ping` -> bot membalas status hidup (`Pong`).
  * `help` -> bot menampilkan daftar command yang tersedia.
* Command tidak dikenal akan fallback ke response help.
* Balasan dikirim melalui `WhatsappServiceClient` (service global) dan tidak mengganggu callback utama jika service sedang gagal.

### 6. Guard Nomor Global Antar Tenant (`connected_jid`)
* Satu `connected_jid` kini hanya boleh aktif di satu tenant.
* Policy conflict: **reject newcomer**. Jika tenant baru mencoba `connected` dengan nomor yang sudah aktif di tenant lain, callback akan memaksa tenant baru menjadi `disconnected`.
* Metadata conflict disimpan pada session:
  * `disconnect_reason=lifecycle_state=jid_conflict`
  * `conflict_connected_jid`
  * `conflict_owner_tenant_id`
  * `conflict_at`
* Setelah status conflict tersimpan, sistem juga men-trigger `removeSession` ke service untuk tenant newcomer sebagai _best effort_ (gagal remove tidak memutus callback utama).
* Safety net database: unique partial index `connected_jid IS NOT NULL` di `tenant_whatsapp_settings`.
* Saat migrasi, data duplikat existing dibersihkan otomatis dengan policy **keep tenant terlama** (`updated_at` paling lama, tie-break `id` terkecil); tenant lain ditandai `jid_conflict_migration`.

## Keamanan Otentikasi Channel
Semua saluran dilindungi berlapis oleh `routes/channels.php` yang secara paksa menolak koneksi (`403 Forbidden`) jika ID Tenant pada String Channel tidak sesuai dengan ID Tenant otoritasi sesi user terkait.

## Persyaratan Layanan Produksi

Mengingat skala modul, beberapa ekosistem wajib dinyalakan seiring berjalannya aplikasi SaaS:
1. `pm2 start tenant-whatsapp-service`
2. `pm2 start ecosystem.config.cjs --only cabinet-reverb,cabinet-queue-worker`
3. `pm2 save`
4. `pm2 startup`

## Batasan Infrastruktur (Architectural Constraint)
Secara teknis, _service Node.js_ ini menggunakan strategi `LocalAuth` bawaan dari _whatsapp-web.js_ yang menyimpan berkas data kredensial (_auth artifacts_) dalam satu folder fisik di server host (`WA_AUTH_DIR`).
- **Skalabilitas:** Ini bukanlah sebuah _development blocker_, melainkan konvensi rancangan. Jika Anda men-_deploy_ layanan ini dalam topologi multi-server (_Load Balancer_ / replika horizontal), otentikasi klien WA akan gagal tersinkronisasi. Solusi standarnya adalah Anda wajib meyediakan *Persistent Shared Volume* (seperti profil _EFS_ atau _NFS_) yang sama untuk _mount_ `WA_AUTH_DIR` tersebut lintas _node_, atau menerapkan tata letak *Sticky Sessions* pada lapisan ingress/LB Anda.
