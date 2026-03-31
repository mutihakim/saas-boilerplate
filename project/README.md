<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

<p align="center">
<a href="https://github.com/laravel/framework/actions"><img src="https://github.com/laravel/framework/workflows/tests/badge.svg" alt="Build Status"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/dt/laravel/framework" alt="Total Downloads"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/v/laravel/framework" alt="Latest Stable Version"></a>
<a href="https://packagist.org/packages/laravel/framework"><img src="https://img.shields.io/packagist/l/laravel/framework" alt="License"></a>
</p>

## Panduan Instalasi & Troubleshooting

Dokumen ini berisi panduan esensial untuk meng-install SaaS Boilerplate di environment lokal (Windows/Linux/Mac), mulai dari setup konfigurasi server hingga troubleshooting isu-isu khusus (seperti peringatan React, isu autentikasi Sanctum, dsb.) yang biasa terjadi pada proses inisiasi.

### Latar Belakang & Persyaratan Sistem
Pastikan sistem Anda sudah ter-install:
- PHP 8.2+ (disarankan)
- Node.js versi LTS (v20+)
- Composer 2.x
- Database: PostgreSQL (sangat disarankan) atau MySQL.

### 1. Setup Awal & Repositori
1. Lakukan clone repositori ke lokal.
2. Masuk ke direktori utama (contoh: `/project`).
3. Jalankan `composer install` untuk mengunduh paket backend PHP.
4. Jalankan `npm install` untuk mengunduh modul frontend Node.js.
5. Jalankan `npm` (atau yarn) `install` di dalam direktori `/services/whatsapp` jika Anda ingin menggunakan modul WhatsApp Node.js.
6. Salin `.env.example` ke `.env` (di folder project).
7. Salin `.env.example` ke `.env` (di folder `services/whatsapp`).
8. Generate application key untuk Laravel: `php artisan key:generate`.

### 2. Pengaturan Database (PENTING)
1. Buka file `.env` di direktori project dan cari parameter `DB_DATABASE`.
2. Secara bawaan, nilainya adalah `cabinet_core`. Anda bebas/sangat disarankan untuk mengubahnya dengan nama database yang Anda inginkan.
   ```env
   DB_DATABASE=nama_database_anda
   ```
3. Sesuaikan koneksi database Anda yang lain seperti `DB_HOST`, `DB_PORT`, `DB_USERNAME`, dan `DB_PASSWORD`.
4. Buat satu database kosong di PostgreSQL/MySQL Anda dengan nama yang persis sama dengan yang Anda atur di `DB_DATABASE`.
5. Eksekusi migrasi dan seeding data bawaan:
   ```bash
   php artisan migrate --seed
   ```
*(Catatan: Project ini menggunakan package `stancl/tenancy`. Karena itu, sistem akan otomatis membuat database/schema tersendiri untuk setiap tenant dengan prefix `tenant_...` saat aplikasi berjalan).*

### 3. Kompilasi Aset Frontend (Perhatian Khusus)
Sistem menggunakan Vite yang dikompilasi secara static untuk lingkungan production.

> **Isu Umum: "Missing auth.json"**
> Saat menjalankan proses build, Vite mungkin akan melemparkan pesan error `failed to resolve import "./locales/en/auth.json"`. Error ini disebabkan direktori locales sengaja dihiraukan di `.gitignore`. 
> **Solusi:** *(Catatan: Issue ini telah diperbaiki di repositori utama dengan membatasi .gitignore hanya pada root `/auth.json`)*. Jika masih terjadi di versi lama Anda, buat file kosong `auth.json` secara manual (atau berisi `{}`) di dalam `resources/js/locales/en/auth.json` (dan `id`).

Setelah dipastikan, jalankan kompilasi:
```bash
npm run build
```

### 4. Eksekusi Aplikasi dengan PM2
Aplikasi ini dirancang dengan gaya microservices dalam 1 direktori. Hal ini meliputi server Laravel, Reverb (WebSockets), Node.js (Whatsapp), dan antrean Queue. Kami menyediakan file `ecosystem.config.cjs` di root directory.

Cara Menjalankannya:
```bash
pm2 start ecosystem.config.cjs
pm2 save
```
*(Catatan Windows: Jika terjadi permission runtime error, pastikan struktur PM2 script langsung mengarah ke file binary seperti `artisan` atau `node_modules/vite/bin/vite.js`, bukan melalui script alias `npm run`).*

### 5. Troubleshooting Issue Tingkat Lanjut
Selama pembuatan proyek berjalan / awal pemasangan fitur, Anda mungkin menemukan log error berikut:

#### a) Peringatan DOM Prop: Invalid prop `aria-expanded` supplied to `React.Fragment`
**Gejala:** Console peramban dibanjiri error React DevTools saat Anda berinteraksi dengan tombol UI. 
**Penyebab:** Dropdown bawaan Breeze otomatis menginjeksikan properti `aria-expanded` ke child elements. Sayangnya `<React.Fragment>` tidak mengizinkan prop tersebut. 
**Solusi:** *(Telah diperbaiki di repo utama)*. Hilangkan `<React.Fragment>`, gunakan button asli sebagai elemen terluar.

#### b) Error 401 Unauthorized API Sanctum SPA & Redirect Misterius ke Dashboard
**Gejala:** Saat tenant mengakses module feature tertentu (misal WhatsApp Chats), request API mengembalikan 401 Unauthorized lalu tiba-tiba redirect ke `/dashboard` karena efek loop middleware SPA.
**Penyebab:** Middleware SPA Sanctum tidak mengenali nomor port kustom Anda (jika Anda menggunakan port selain 80).
**Solusi:** Buka file `.env` kustom Anda. Tambahkan daftar alamat dan port yang Anda jalankan (pastikan port tersebut kosong/tidak terpakai oleh aplikasi lain) pada parameter `SANCTUM_STATEFUL_DOMAINS`.
```env
SANCTUM_STATEFUL_DOMAINS="localhost,localhost:PORT_ANDA,127.0.0.1,127.0.0.1:PORT_ANDA"
```
Setelah itu jalankan `php artisan optimize:clear` dan bersihkan cache peramban.

#### c) Halaman Blank Screen White UI Component (Cannot read properties of undefined reading 'private')
**Gejala:** React UI benar-benar rusak/putih saat Anda berpindah ke halaman yang memiliki listener socket WebSocket.
**Penyebab:** Modul `window.Echo` menjadi undefined lantaran variabel `.env` bernama `VITE_REVERB_APP_KEY` dan lainnya belum diisi.
**Solusi:** *(Sebagian telah ditambahkan guard di repo utama)*. Pastikan variabel `REVERB_APP_KEY` terisi di `.env`. Tambahkan guard `if (!(window as any).Echo) return;` sebelum memanggil `Echo.private()`. Serta hindari rujukan live DOM (`[0]`) di fungsi cleanup hook React.

#### d) Permintaan UI "Connect" Tidak Terbaca di Log Microservice Node.js
**Gejala:** Ketika menekan "Connect" di pengaturan WhatsApp, loading berjalan di UI tetapi di sisi log `pm2 logs cabinet-whatsapp` tidak ada respons masuk (tidak muncul `session.connect.requested`). 
**Penyebab:** Pada file konfigurasi utama backend `project/.env`, flag pengaktifan layanan WhatsApp mungkin masih dalam posisi mati (`false`). Akibatnya backend Laravel memutuskan aliran request. 
**Solusi:** *(Telah diperbaiki di repo utama menjadi true sebagai bawaan)*. Ubah variabel menjadi true:
```env
WHATSAPP_SERVICE_ENABLED=true
```
Lalu bersihkan cache: `php artisan optimize:clear`.

#### e) QR Code Muncul di Terminal PM2 Namun UI React Terjebak di "Loading prepare QR code"
**Gejala:** Saat Anda memantau `pm2 logs cabinet-whatsapp`, Anda melihat bongkahan teks QR Code berbasis ASCII. Namun ajaibnya, UI di browser hanya loading berputar-putar. 
**Penyebab Kompleks:**
- Kunci koneksi WebSocket yang ada di `project/.env` kosong (`REVERB_APP_KEY=`). Akibatnya Echo Client mati demi menghindari error properti patah.
- Terdapat miskonfigurasi di perutean internal server WebSocket, di mana `BROADCAST_DRIVER=log`. Hal ini memerintahkan Laravel untuk mendelegasikan event websocket ke dalam teks storage/logs/laravel.log, BUKAN mengirimkannya via Reverb Socket Router. 
**Solusi:** *(Telah diperbaiki di repo utama dengan menset driver ke reverb dan mengisi nilai dummy)*. Pastikan driver Anda adalah `reverb` dan isi secara asal dummy key Reverb:
```env
BROADCAST_DRIVER=reverb

REVERB_APP_ID=543210
REVERB_APP_KEY=local_cabinet_key
REVERB_APP_SECRET=local_cabinet_secret
```
Setelah itu, **sangat ditekankan** untuk menjalankan kompilasi antarmuka statis Anda melalui `npm run build` karena kunci Reverb butuh disuntikkan secara fisik via awalan variabel `VITE_`. Lalu putar ulang reverb:
```bash
php artisan optimize:clear
npm run build
pm2 restart cabinet-reverb
```

#### f) Error "missing_internal_token" / Koneksi Ditolak di Log WhatsApp Node.js
**Gejala:** Terminal `cabinet-whatsapp` selalu melempar ralat `"reason": "missing_internal_token"`. 
**Penyebab:** Eksekusi Node.js v20+ bawaan baru sudah mendukung manajemen file bawaan `.env` tanpa modifikasi dotenv. Namun kita masih perlu memberi argument saat pemanggilan skrip. Selain itu, ada mismatch isi parameter internal seperti port.
**Solusi:** *(Telah ditambahkan file konfigurasi eksekusi PM2 di repo utama)*.
Pastikan eksklusif Node argument `--env-file=.env` ada di `/ecosystem.config.cjs`:
```javascript
{
   name: "cabinet-whatsapp",
   cwd: "./services/whatsapp",
   script: "src/index.js",
   node_args: "--env-file=.env" /* <-- Wajib ada */
}
```
Pastikan file `services/whatsapp/.env` benar-benar setara konfigurasi silangnya terhadap file `project/.env` Laravel:
```env
APP_CALLBACK_URL=http://127.0.0.1:PORT_ANDA
WHATSAPP_INTERNAL_TOKEN=change-me
```
Menerapkan konfigurasi PM2:
```bash
pm2 start ecosystem.config.cjs
pm2 save
```

## About Laravel

Laravel is a web application framework with expressive, elegant syntax. We believe development must be an enjoyable and creative experience to be truly fulfilling. Laravel takes the pain out of development by easing common tasks used in many web projects, such as:

- [Simple, fast routing engine](https://laravel.com/docs/routing).
- [Powerful dependency injection container](https://laravel.com/docs/container).
- Multiple back-ends for [session](https://laravel.com/docs/session) and [cache](https://laravel.com/docs/cache) storage.
- Expressive, intuitive [database ORM](https://laravel.com/docs/eloquent).
- Database agnostic [schema migrations](https://laravel.com/docs/migrations).
- [Robust background job processing](https://laravel.com/docs/queues).
- [Real-time event broadcasting](https://laravel.com/docs/broadcasting).

Laravel is accessible, powerful, and provides tools required for large, robust applications.

## Learning Laravel

Laravel has the most extensive and thorough [documentation](https://laravel.com/docs) and video tutorial library of all modern web application frameworks, making it a breeze to get started with the framework.

You may also try the [Laravel Bootcamp](https://bootcamp.laravel.com), where you will be guided through building a modern Laravel application from scratch.

If you don't feel like reading, [Laracasts](https://laracasts.com) can help. Laracasts contains over 2000 video tutorials on a range of topics including Laravel, modern PHP, unit testing, and JavaScript. Boost your skills by digging into our comprehensive video library.

## Laravel Sponsors

We would like to extend our thanks to the following sponsors for funding Laravel development. If you are interested in becoming a sponsor, please visit the [Laravel Partners program](https://partners.laravel.com).

### Premium Partners

- **[Vehikl](https://vehikl.com/)**
- **[Tighten Co.](https://tighten.co)**
- **[WebReinvent](https://webreinvent.com/)**
- **[Kirschbaum Development Group](https://kirschbaumdevelopment.com)**
- **[64 Robots](https://64robots.com)**
- **[Curotec](https://www.curotec.com/services/technologies/laravel/)**
- **[Cyber-Duck](https://cyber-duck.co.uk)**
- **[DevSquad](https://devsquad.com/hire-laravel-developers)**
- **[Jump24](https://jump24.co.uk)**
- **[Redberry](https://redberry.international/laravel/)**
- **[Active Logic](https://activelogic.com)**
- **[byte5](https://byte5.de)**
- **[OP.GG](https://op.gg)**

## Contributing

Thank you for considering contributing to the Laravel framework! The contribution guide can be found in the [Laravel documentation](https://laravel.com/docs/contributions).

## Code of Conduct

In order to ensure that the Laravel community is welcoming to all, please review and abide by the [Code of Conduct](https://laravel.com/docs/contributions#code-of-conduct).

## Security Vulnerabilities

If you discover a security vulnerability within Laravel, please send an e-mail to Taylor Otwell via [taylor@laravel.com](mailto:taylor@laravel.com). All security vulnerabilities will be promptly addressed.

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
