# AGENTS.md — Panduan untuk AI Coding Agent

Dokumen ini menjelaskan konteks dan konvensi repository **Bank Soal Cerdas** agar AI coding agent (Claude Code, Copilot, dsb.) dapat bekerja secara konsisten dengan gaya proyek. Untuk kebijakan keamanan/penggunaan AI secara umum lihat [RULES_AI.md](./RULES_AI.md).

## 1. Gambaran Proyek

- **Domain**: platform bank soal & ujian online untuk admin, guru, siswa. Lihat [PRD.md](./PRD.md) untuk detail fitur.
- **Stack**: Laravel 13 (PHP 8.3+) sebagai backend + API, React 19/TypeScript sebagai SPA (pola *strangler pattern* — SPA disajikan lewat rute `/app/*`, rute Blade lama masih ada dan berangsur di-redirect ke SPA).
- **Database**: relasional (MySQL/SQLite), lihat [ERD.md](./ERD.md).

## 2. Struktur Direktori Penting

```text
app/Http/Controllers/         # Controller Blade legacy (redirect ke SPA)
app/Http/Controllers/Api/     # Controller JSON API yang dikonsumsi SPA
app/Http/Middleware/CheckRole.php  # Middleware role:admin|guru|siswa
app/Models/                   # Eloquent models
app/Policies/                 # Authorization policy (Question, PaketSoal, Ujian)
app/Imports/, app/Exports/    # Laravel Excel import/export
database/migrations/          # Sumber kebenaran skema DB
database/seeders/             # Data referensi (subjects, KKO, dsb.)
routes/web.php                # Semua rute (web + api, digabung dalam satu file)
resources/views/spa.blade.php # Shell Blade tempat SPA React dimount (lihat resources/views)
src/                           # Source React SPA (App.tsx, components/, context/, lib/, types.ts)
src/components/ui/             # Design system component (Button, Modal, DataTable, dst.)
tests/Feature, tests/Unit      # PHPUnit
tests/e2e                      # Playwright
```

## 3. Konvensi Backend (Laravel)

- **Routing**: satu file `routes/web.php`. Rute API SPA berada di bawah prefix `api` di dalam grup `middleware(['auth'])`; rute Blade legacy tetap ada tetapi kebanyakan sudah di-redirect ke `/app/...` via closure `$legacyAppRedirect`.
- **Role & Access Control**: gunakan middleware `role:admin`, `role:guru`, atau kombinasi `role:admin,guru` pada rute. Untuk otorisasi berbasis kepemilikan resource (mis. guru hanya boleh mengubah soal miliknya atau yang dibagikan padanya), gunakan `Gate::authorize()` dengan Policy terkait (`QuestionPolicy`, `PaketSoalPolicy`, `UjianPolicy`). **Jangan** menaruh logika otorisasi kepemilikan langsung di controller — taruh di Policy.
- **Controller ganda**: setiap resource biasanya punya controller Blade (`App\Http\Controllers\X`) dan controller API (`App\Http\Controllers\Api\X`). Saat menambah fitur baru untuk SPA, tambahkan/ubah di controller **Api**, bukan controller Blade — controller Blade legacy pada dasarnya hanya melakukan redirect atau menangani aksi yang belum dipindah ke API.
- **Soft delete**: `questions`, `paket_soal`, `ujian` pakai `SoftDeletes`. Saat query, pastikan sadar akan efek `deleted_at` terhadap relasi historis (jawaban siswa, item paket).
- **Level kognitif**: field `level_c` pada `questions` dan `level` pada `kko_master` memakai nilai `L1`/`L2`/`L3` (bukan `C1`–`C6` lagi). Klasifikasi Bloom asli (C1–C6) hanya disimpan di `kko_master.bloom_level`. Jangan menulis `C1`..`C6` langsung ke kolom `level_c`/`level`.
- **Migration**: setiap perubahan skema harus lewat migration baru (jangan edit migration lama yang sudah ada di `main`, kecuali migration tersebut baru dibuat di branch yang sama dan belum pernah di-merge).
- **Validation**: gunakan Form Request (`app/Http/Requests/`) untuk validasi input kompleks, mengikuti pola `StoreQuestionRequest`/`UpdateQuestionRequest`.

## 4. Konvensi Frontend (React SPA di `src/`)

- Komponen halaman (view) diberi akhiran `View` (mis. `QuestionListView.tsx`, `UjianKerjakanCBTView.tsx`) dan ditaruh langsung di `src/components/`.
- Komponen UI generik/reusable ada di `src/components/ui/` (Button, Modal, DataTable, Badge, Toast, dll.) — **gunakan komponen ini** daripada membuat elemen native baru agar konsisten dengan design system.
- State global/context ada di `src/context/`; helper/klien API ada di `src/lib/`.
- Tipe data bersama didefinisikan di `src/types.ts` — perbarui file ini saat menambah/mengubah field yang dikonsumsi dari API.
- SPA memanggil endpoint `/api/*` dengan sesi Laravel (cookie based), bukan token bearer — pastikan request menyertakan CSRF token (lihat helper di `src/lib/`).
- Styling: Tailwind CSS v4 (lihat `postcss.config.cjs`, `@tailwindcss/vite`). Dukung light/dark mode sesuai konvensi yang sudah ada di komponen `ui/`.

## 5. Menjalankan & Memverifikasi Perubahan

Sebelum menganggap perubahan selesai:

1. **Backend**: `php artisan test` (atau test spesifik yang relevan dengan file yang diubah).
2. **Frontend type-check**: `npm run lint` (menjalankan `tsc --noEmit`).
3. **Code style PHP**: `./vendor/bin/pint` sebelum commit jika mengubah file PHP.
4. Jika mengubah alur UI yang bisa diuji manual, jalankan `npm run dev` + `php artisan serve` dan coba alur golden path (lihat skill `run` bila tersedia).
5. E2E (`npm run test:e2e`) dijalankan bila perubahan menyentuh alur kritikal (login, ujian, submit jawaban) — lihat `tests/e2e/`.

Lihat detail lengkap di [INSTALLATION.md](./INSTALLATION.md).

## 6. Menambah Fitur Baru — Checklist Singkat

1. Tambahkan/ubah migration di `database/migrations/` jika perlu skema baru → update [ERD.md](./ERD.md).
2. Tambahkan Model/relasi Eloquent di `app/Models/` sesuai skema.
3. Tambahkan Policy jika resource baru butuh otorisasi berbasis kepemilikan/role granular.
4. Tambahkan controller **Api** + rute di bawah `Route::prefix('api')` dengan middleware role yang sesuai.
5. (Opsional, untuk kompatibilitas) tambahkan rute Blade legacy yang redirect ke `/app/...`.
6. Implementasikan UI di `src/components/`, gunakan komponen `ui/` yang ada, perbarui `src/types.ts`.
7. Perbarui dokumen ini/[PRD.md](./PRD.md) bila menambah fitur besar yang mengubah lingkup produk.

## 7. Hal yang Harus Dihindari

- Jangan hardcode credential, API key, atau password di kode maupun migration/seeder (gunakan `.env`).
- Jangan menghapus soft-delete record secara permanen tanpa alasan eksplisit — riwayat ujian bergantung pada relasi soal/paket lama.
- Jangan mengubah nilai enum kolom (`role`, `type`, `status`, `level_c`, dst.) tanpa migration yang menyesuaikan data lama, karena banyak logika bergantung pada nilai persis ini (lihat contoh migration `migrate_cognitive_levels_to_l1_l3`).
- Jangan menambah dependency besar/framework baru tanpa kebutuhan jelas — proyek sengaja mempertahankan stack Laravel + React yang relatif minimal.

Lihat juga [RULES_AI.md](./RULES_AI.md) untuk batasan penggunaan AI dalam repository ini.
