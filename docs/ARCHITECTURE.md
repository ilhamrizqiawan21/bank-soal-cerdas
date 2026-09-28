# Architecture — Bank Soal Cerdas

## 1. Ringkasan Arsitektur

Bank Soal Cerdas adalah aplikasi monolitik Laravel yang sedang bermigrasi dari server-rendered Blade menuju **SPA React** dengan pola **strangler fig**: rute-rute lama tetap ada dan sebagian besar hanya melakukan redirect ke shell SPA di `/app/*`, sementara logika bisnis baru diarahkan ke endpoint JSON di bawah `/api/*`.

```text
┌────────────────────────────────────────────────────────────┐
│                        Browser                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  React SPA (src/)  — dimount di view "spa.blade.php" │    │
│  │  Router internal, komponen View per fitur            │    │
│  └───────────────────┬──────────────────────────────────┘    │
│                       │ fetch/axios (cookie session + CSRF)   │
└───────────────────────┼──────────────────────────────────────┘
                         ▼
┌────────────────────────────────────────────────────────────┐
│                     Laravel App (Monolith)                  │
│  routes/web.php                                              │
│   ├── auth routes (login/logout, session-based)              │
│   ├── /app, /app/{any}   → view "spa" (React shell)          │
│   ├── /api/*             → Controllers\Api\*  (JSON, dipakai │
│   │                         SPA)                              │
│   └── /questions, /ujian, ... → Controllers\* (Blade legacy, │
│                                   sebagian besar redirect ke  │
│                                   /app/...)                   │
│                                                                │
│  Middleware: auth (session), role:admin|guru|siswa            │
│  Authorization: Policies (Question, PaketSoal, Ujian)          │
│  Eloquent Models ──► MySQL/SQLite                              │
└────────────────────────────────────────────────────────────┘
```

## 2. Backend (Laravel 13, PHP 8.3+)

### 2.1 Routing (`routes/web.php`)

Semua rute didefinisikan dalam satu file, dikelompokkan dalam middleware `auth`:

- **Shell SPA**: `GET /app` dan `GET /app/{any}` merender view `spa` (React dimount di sana) — menjadi *catch-all* untuk routing sisi klien.
- **API (`/api/*`)**: dikonsumsi SPA lewat sesi web (bukan token terpisah), dikelompokkan lagi per role via middleware `role:admin,guru` atau `role:admin` atau `role:siswa`. Mencakup: profile/me, dashboard, subjects, kategori, kko, questions (+ import/export/duplicate), paket-soal (+ duplicate), ujian (+ publish, mine, answer, submit), share, analisis, tags, users.
- **Rute Blade legacy**: rute lama seperti `/questions`, `/paket-soal`, `/ujian`, `/kategori`, `/tag`, `/users`, `/profile`, `/settings`, `/share` masih terdaftar untuk kompatibilitas link lama; kebanyakan langsung `redirect()` ke path `/app/...` yang setara (lihat closure `$legacyAppRedirect`), sementara beberapa (mis. aksi `store`/`update`/`destroy` lewat `Route::resource`, `export`, `import`, `duplicate`, `toggle-status`) masih diproses langsung oleh controller Blade.
- **Otorisasi resource-level**: beberapa route closure memanggil `Gate::authorize('view'|'update', $model)` sebelum redirect, memastikan hanya pemilik/pihak berwenang yang bisa mengakses detail soal/paket/ujian tertentu meski lewat URL lama.

### 2.2 Layer Aplikasi

| Layer | Lokasi | Tanggung Jawab |
|---|---|---|
| Controllers (Blade) | `app/Http/Controllers/*.php` | Endpoint legacy; redirect ke SPA atau proses aksi non-GET yang belum dipindah |
| Controllers (API) | `app/Http/Controllers/Api/*.php` | Endpoint JSON untuk SPA — sumber kebenaran untuk logika CRUD/bisnis terbaru |
| Requests | `app/Http/Requests/` | Validasi input (mis. `StoreQuestionRequest`, `UpdateQuestionRequest`) |
| Policies | `app/Policies/` | Otorisasi berbasis kepemilikan/role granular per resource (`Question`, `PaketSoal`, `Ujian`) |
| Middleware | `app/Http/Middleware/CheckRole.php` | Guard role (`admin`/`guru`/`siswa`) + cek `is_active` |
| Models | `app/Models/` | Eloquent ORM, relasi antar entitas (lihat [ERD.md](./ERD.md)) |
| Imports/Exports | `app/Imports/`, `app/Exports/` | Import/export Excel (paket `maatwebsite/excel`) untuk soal & analisis |
| Support | `app/Support/` | Helper/utility lintas domain |

### 2.3 Autentikasi & Otorisasi

- Autentikasi berbasis **sesi Laravel** standar (`AuthenticatedSessionController`), bukan token API (Sanctum/Passport) — cocok karena SPA disajikan same-origin lewat Blade shell.
- **Role** (`admin`/`guru`/`siswa`) ditegakkan di level rute lewat middleware `role:...`.
- **Kepemilikan/berbagi resource** (mis. guru A tidak otomatis bisa mengubah soal guru B kecuali dibagikan) ditegakkan lewat Policy + `Gate::authorize`.
- Akun nonaktif (`users.is_active = false`) otomatis di-logout oleh `CheckRole` saat mencoba mengakses rute terproteksi.

### 2.4 Data Layer

Skema lengkap ada di [ERD.md](./ERD.md). Poin arsitektural penting:

- Entitas inti: `subjects`, `kko_master`, `questions` (+ tabel detail per tipe soal), `kategori`/`tag` (many-to-many ke `questions`), `paket_soal` (+ `paket_soal_items`), `ujian` (+ `ujian_jawaban`), `share_soal`/`share_paket`.
- **Soft deletes** pada `questions`, `paket_soal`, `ujian` menjaga integritas riwayat ujian yang sudah berjalan.
- Level kognitif disederhanakan dari Bloom C1–C6 menjadi L1/L2/L3 untuk kebutuhan operasional, dengan `kko_master.bloom_level` tetap menyimpan nilai C1–C6 asli untuk pelaporan.

## 3. Frontend (React 19 + TypeScript, `src/`)

### 3.1 Build Tooling

- **Vite 8** (`vite.config.ts`) dengan `laravel-vite-plugin` untuk integrasi asset Laravel, dan `@vitejs/plugin-react`.
- **Tailwind CSS v4** via `@tailwindcss/vite` + `postcss.config.cjs`.
- **TypeScript** strict mode (lihat `tsconfig.json`); `npm run lint` menjalankan `tsc --noEmit` sebagai gerbang kualitas tipe.

### 3.2 Struktur Kode

```text
src/
├── App.tsx           # Root komponen + routing internal SPA
├── main.tsx           # Entry point, mount ke DOM (lihat resources/views/spa.blade.php)
├── types.ts            # Tipe data bersama (kontrak dengan response API)
├── index.css            # Global styles (Tailwind)
├── context/             # React Context (state global: auth/user, theme, dsb.)
├── lib/                 # HTTP client (axios) + helper lain
├── components/
│   ├── ui/               # Design-system primitives (Button, Modal, DataTable, Badge, Toast, Skeleton, dst.)
│   ├── charts/            # Wrapper Chart.js (ChartCanvas)
│   └── *View.tsx           # Komponen halaman per fitur (Question, PaketSoal, Ujian, Analisis, User, dst.)
```

### 3.3 Pola Komponen

- Setiap fitur besar punya komponen `*ListView` (daftar + filter/search), `*FormView` (create/edit), dan modal pendukung (mis. `QuestionDetailModal`, `QuestionImportModal`, `PaketSoalExportModal`).
- `AppShell.tsx`, `Sidebar.tsx`, `Navbar.tsx`, `AppBreadcrumb.tsx` membentuk layout konsisten di seluruh halaman SPA, mendukung light/dark theme.
- `AppStates.tsx` kemungkinan menstandarkan state loading/empty/error di seluruh halaman (dipakai bersama `EmptyState`, `Skeleton` dari `ui/`).

### 3.4 Komunikasi dengan Backend

- SPA memanggil `/api/*` menggunakan **axios** dengan cookie sesi Laravel (same-origin), termasuk header CSRF sesuai konvensi Laravel untuk request non-GET.
- Tidak ada API terpisah untuk mobile/pihak ketiga saat ini — `/api/*` didesain khusus untuk dikonsumsi SPA ini.

## 4. Alur Data End-to-End (Contoh: Ujian)

```text
Guru buat Paket Soal (paket_soal + paket_soal_items)
        │
        ▼
Guru buat Ujian per siswa (ujian: paket_soal_id, siswa_id, duration)
        │  POST /api/ujian, POST /api/ujian/{ujian}/publish
        ▼
Siswa lihat "Ujian Saya" (GET /api/ujian-saya) → status draft/active
        │
        ▼
Siswa kerjakan ujian (UjianKerjakanCBTView)
        │  POST /api/ujian/{ujian}/jawaban  (per soal, incremental)
        ▼
Siswa submit ujian
        │  POST /api/ujian/{ujian}/submit  → status finished, submitted_at terisi
        ▼
Guru/Admin lihat Analisis (GET /api/analisis, /api/analisis/ujian/{ujian}, /api/analisis/siswa/{siswa})
```

## 5. Testing Architecture

| Jenis | Lokasi | Tooling |
|---|---|---|
| Unit/Feature (PHP) | `tests/Unit`, `tests/Feature` | PHPUnit (`phpunit.xml`) |
| End-to-end | `tests/e2e` | Playwright (`playwright.config.ts`) |

## 6. Keputusan Arsitektural Kunci

- **Strangler pattern Blade → React**: memungkinkan migrasi bertahap tanpa "big bang rewrite"; rute lama tetap valid (backward compatible link/bookmark) sambil logika baru terpusat di SPA + API.
- **Auth berbasis sesi (bukan token)**: menyederhanakan implementasi karena SPA dan API same-origin, menghindari kompleksitas refresh token/SPA token storage.
- **Satu file route**: `routes/web.php` menampung web + API routes agar mudah melihat keseluruhan permukaan akses aplikasi dalam satu tempat, dengan pemisahan namespace controller (`Controllers\` vs `Controllers\Api\`) sebagai batas konseptual.
- **Level kognitif L1–L3 vs Bloom C1–C6**: operasional (penilaian, filter) memakai 3 level agar sederhana bagi guru, sementara data Bloom granular tetap tersimpan di `kko_master` untuk kebutuhan analitik lebih dalam di masa depan.

Untuk detail fitur produk lihat [PRD.md](./PRD.md), skema lengkap di [ERD.md](./ERD.md), langkah setup di [INSTALLATION.md](./INSTALLATION.md), dan konvensi kerja AI/kontributor di [AGENTS.md](./AGENTS.md) & [RULES_AI.md](./RULES_AI.md).
