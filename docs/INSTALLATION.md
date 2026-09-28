# Installation Guide — Bank Soal Cerdas

Panduan ini melengkapi bagian *Installation* pada `README.md` dengan detail environment, troubleshooting, dan setup production.

## 1. Requirements

| Komponen | Versi |
|---|---|
| PHP | ^8.3 |
| Composer | terbaru |
| Node.js + NPM | mendukung dependency di `package.json` (Vite 8, React 19) |
| Database | MySQL (default) atau SQLite; lihat `config/database.php` |
| Git | terbaru |

Versi dependency pasti mengikuti `composer.json` dan `package.json`.

## 2. Clone Repository

```bash
git clone https://github.com/ilhamrizqiawan21/bank-soal-cerdas.git
cd bank-soal-cerdas
```

## 3. Setup Otomatis (Opsional)

Project menyediakan Composer script `setup` yang menjalankan seluruh langkah dasar sekaligus:

```bash
composer run setup
```

Script ini akan: `composer install` → salin `.env.example` ke `.env` (jika belum ada) → `php artisan key:generate` → `php artisan migrate --force` → `npm install --ignore-scripts` → `npm run build`.

Jika ingin kontrol lebih rinci (mis. memilih database, menjalankan seeder), ikuti langkah manual di bawah.

## 4. Setup Manual

### 4.1 Install dependency PHP

```bash
composer install
```

### 4.2 Siapkan environment

```bash
cp .env.example .env
php artisan key:generate
```

Variabel penting di `.env`:

| Variabel | Keterangan |
|---|---|
| `APP_NAME` | Default: `Bank Soal Cerdas` |
| `APP_URL` | URL aplikasi lokal, mis. `http://localhost:8000` |
| `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD` | Konfigurasi database |
| `SESSION_DRIVER` | Default `database` — pastikan tabel `sessions` termigrasi |
| `QUEUE_CONNECTION` | Default `database` |
| `CACHE_STORE` | Default `database` |
| `SEED_ADMIN_PASSWORD`, `SEED_GURU_PASSWORD` | Password default untuk akun hasil seeding (development) |

### 4.3 Konfigurasi database

Contoh MySQL:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bank_soal_cerdas
DB_USERNAME=root
DB_PASSWORD=
```

Alternatif SQLite (cocok untuk development cepat/CI):

```bash
touch database/database.sqlite
```

```env
DB_CONNECTION=sqlite
DB_DATABASE=/absolute/path/to/database/database.sqlite
```

Jalankan migration:

```bash
php artisan migrate
```

### 4.4 Seed data awal (opsional, disarankan untuk development)

```bash
php artisan db:seed
```

Cek `database/seeders/` untuk melihat data referensi yang dibuat (mis. akun admin/guru default, mata pelajaran, KKO master).

### 4.5 Install dependency frontend

```bash
npm install
```

### 4.6 Build asset frontend

```bash
npm run build
```

### 4.7 Jalankan aplikasi

```bash
php artisan serve
```

Buka `http://localhost:8000`.

## 5. Development Workflow

Frontend menggunakan Vite dengan HMR:

```bash
npm run dev
```

Secara default Vite berjalan di `0.0.0.0:3000` (lihat script `dev` di `package.json`). Di terminal lain jalankan server Laravel:

```bash
php artisan serve
```

Atau jalankan keduanya sekaligus lewat script Composer:

```bash
composer run dev
```

(Script ini menjalankan `php artisan dev`, yang secara internal mengorkestrasi server PHP + queue listener + Vite via `concurrently`.)

### Type-checking frontend

```bash
npm run lint
```

(Menjalankan `tsc --noEmit` — tidak melakukan lint gaya kode, hanya pemeriksaan tipe TypeScript.)

## 6. Testing

Backend (PHPUnit/Laravel):

```bash
php artisan test
# atau
composer run test
```

Kualitas kode PHP (Laravel Pint):

```bash
./vendor/bin/pint
```

End-to-end (Playwright), lihat `tests/e2e/` dan `playwright.config.ts`:

```bash
npm run test:e2e
```

> Pastikan aplikasi (dan build frontend) sudah berjalan sesuai konfigurasi `playwright.config.ts` sebelum menjalankan e2e test.

## 7. Production Setup (Ringkas)

1. Salin `.env.production.example` sebagai referensi konfigurasi production, sesuaikan `.env` di server (jangan pernah commit `.env`).
2. `composer install --no-dev --optimize-autoloader`.
3. `npm ci && npm run build` (build asset di CI/build machine, bukan di server production bila memungkinkan).
4. `php artisan migrate --force`.
5. `php artisan config:cache`, `php artisan route:cache`, `php artisan view:cache`.
6. Pastikan `storage/` dan `bootstrap/cache/` writable oleh web server.
7. Atur web server (Apache/Nginx) mengarah ke `public/` sebagai document root. `.htaccess` di root & `public/.htaccess` sudah disediakan untuk Apache.
8. Set `APP_ENV=production`, `APP_DEBUG=false`, `SESSION_SECURE_COOKIE=true` (jika HTTPS), dan review konfigurasi `mail`, `queue`, `cache` untuk beban production.

## 8. Troubleshooting

| Gejala | Kemungkinan Penyebab | Solusi |
|---|---|---|
| Halaman blank / 500 setelah clone | `APP_KEY` belum di-generate | `php artisan key:generate` |
| Asset CSS/JS tidak termuat | Belum `npm run build`, atau Vite dev server tidak berjalan | Jalankan `npm run build` (production) atau `npm run dev` (development) |
| `SQLSTATE[HY000] [1049] Unknown database` | Database belum dibuat | Buat database sesuai `DB_DATABASE` sebelum migrate |
| Redirect loop ke `/login` | Akun `is_active = false` | Aktifkan akun via admin (`UserController@toggleStatus`) |
| 403 saat akses menu tertentu | Role user tidak sesuai middleware `role:...` pada rute | Cek `routes/web.php` dan role user |
| Import soal Excel gagal | Format file tidak sesuai template `maatwebsite/excel` | Cek `app/Imports` dan pesan error validasi |

## 9. Struktur Referensi

Lihat [ARCHITECTURE.md](./ARCHITECTURE.md) untuk struktur direktori lengkap dan alur request, serta [ERD.md](./ERD.md) untuk skema database.
