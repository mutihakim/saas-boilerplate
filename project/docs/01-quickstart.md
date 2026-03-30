# 01 - Quickstart

## Prasyarat

- PHP 8.2+
- Composer
- Node.js 20+
- NPM
- SQLite/MySQL sesuai `.env`

## Setup Lokal

```bash
composer install
npm install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
```

## Menjalankan Aplikasi

Terminal 1:

```bash
php artisan serve
```

Terminal 2:

```bash
npm run dev
```

## Validasi Minimum

```bash
php artisan test
npm run test:e2e
```

## Menjalankan Docs Site

```bash
npm run docs:dev
```

Build static HTML:

```bash
npm run docs:build
```

Output build ada di `docs/.vitepress/dist`.
