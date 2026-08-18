# Bank Soal Cerdas

> Platform manajemen bank soal dan evaluasi pembelajaran berbasis web.

**Bank Soal Cerdas** adalah aplikasi untuk membantu admin, guru, dan siswa mengelola proses penyusunan soal, paket soal, ujian online, kolaborasi soal, serta analisis hasil evaluasi pembelajaran dalam satu platform.

---

## ✨ Fitur Utama

### 📚 Bank Soal

Mengelola koleksi soal secara terstruktur dengan dukungan:

- CRUD soal
- Pencarian dan filter
- Klasifikasi kurikulum
- Tipe soal
- Level kognitif C1–C6
- KKO (Kata Kerja Operasional)
- Kategori dan tag
- Import soal
- Export soal
- Duplikasi soal

### 📦 Paket Soal

Menyusun kumpulan soal untuk digunakan dalam evaluasi atau ujian.

- Membuat dan mengelola paket soal
- Menambahkan soal dari bank soal
- Mengelola komposisi soal
- Duplikasi paket soal

### 📝 Ujian Online

Mendukung alur ujian dari pembuatan sampai penyelesaian oleh siswa.

**Admin/Guru:**

- Membuat ujian
- Menentukan paket soal
- Mengatur peserta
- Mengatur durasi
- Mempublikasikan ujian
- Mengelola status ujian

**Siswa:**

- Melihat ujian yang tersedia
- Mengerjakan ujian
- Menyimpan/mengirim jawaban
- Mengakhiri ujian
- Melihat hasil ujian

### 📊 Analisis

Menyediakan halaman analisis untuk membantu mengevaluasi hasil ujian, termasuk detail berdasarkan ujian dan siswa serta export hasil analisis.

### 🗂️ Kategori & Tag

Mengorganisasi soal agar bank soal lebih mudah dikelola, difilter, dan digunakan kembali.

### 🤝 Kolaborasi

Mendukung berbagi soal dan paket soal antar pengguna.

- Berbagi soal
- Berbagi paket soal
- Menerima soal/paket
- Menolak soal/paket
- Melihat detail
- Melihat riwayat berbagi

### 👥 Manajemen Pengguna

Admin dapat mengelola pengguna dan status akses akun.

Role utama aplikasi:

| Role | Fokus Akses |
|---|---|
| **Admin** | Administrasi sistem dan seluruh fitur pengelolaan |
| **Guru** | Bank soal, paket soal, ujian, analisis, dan kolaborasi |
| **Siswa** | Mengikuti ujian dan melihat hasil |

### 👤 Profil & Pengaturan

Pengguna dapat memperbarui informasi profil, avatar, dan password melalui halaman akun.

---

## 🧠 Taksonomi Bloom

Soal dapat diklasifikasikan berdasarkan enam level kognitif:

| Level | Keterangan | Kategori |
|---|---|---|
| C1 | Mengingat | LOTS |
| C2 | Memahami | LOTS |
| C3 | Menerapkan | LOTS |
| C4 | Menganalisis | HOTS |
| C5 | Mengevaluasi | HOTS |
| C6 | Mencipta | HOTS |

Klasifikasi ini digunakan untuk membantu melihat komposisi tingkat kemampuan kognitif pada bank soal dan hasil evaluasi.

---

## 🏗️ Alur Utama Aplikasi

```text
                         ┌───────────────┐
                         │    Pengguna   │
                         └───────┬───────┘
                                 │
                         ┌───────▼───────┐
                         │ Authentication│
                         └───────┬───────┘
                                 │
                  ┌──────────────┼──────────────┐
                  │              │              │
                Admin          Guru           Siswa
                  │              │              │
                  └───────┬──────┘              │
                          │                     │
                   ┌──────▼──────┐       ┌─────▼─────┐
                   │  Bank Soal  │       │   Ujian   │
                   └──────┬──────┘       └─────┬─────┘
                          │                     │
                   ┌──────▼──────┐       ┌─────▼─────┐
                   │ Paket Soal  │       │  Jawaban  │
                   └──────┬──────┘       └─────┬─────┘
                          │                     │
                   ┌──────▼──────┐       ┌─────▼─────┐
                   │    Ujian    │       │   Hasil   │
                   └──────┬──────┘       └───────────┘
                          │
                   ┌──────▼──────┐
                   │   Analisis  │
                   └─────────────┘
```

---

## 🛠️ Tech Stack

### Backend

- **PHP 8.3+**
- **Laravel 13**
- Laravel Eloquent ORM
- Laravel Authentication
- Laravel Excel

### Frontend

- Blade Templates
- Bootstrap 5
- Tailwind CSS
- Alpine.js
- Sass
- Vite
- Font Awesome
- Chart.js

### Development & Testing

- Composer
- NPM
- Laravel Pint
- PHPUnit
- Laravel Debugbar

---

## 📋 Requirements

Sebelum menjalankan project, pastikan tersedia:

- PHP `^8.3`
- Composer
- Node.js dan NPM
- Database yang didukung Laravel, misalnya MySQL atau SQLite
- Git

Versi dependency utama mengikuti `composer.json` dan `package.json` pada repository.

---

## 🚀 Installation

### 1. Clone repository

```bash
git clone https://github.com/ilhamrizqiawan21/bank-soal-cerdas.git
cd bank-soal-cerdas
```

### 2. Install dependency PHP

```bash
composer install
```

### 3. Siapkan environment

```bash
cp .env.example .env
php artisan key:generate
```

### 4. Konfigurasi database

Edit `.env` sesuai database yang digunakan.

Contoh MySQL:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=bank_soal_cerdas
DB_USERNAME=root
DB_PASSWORD=
```

Kemudian jalankan migration:

```bash
php artisan migrate
```

### 5. Install dependency frontend

```bash
npm install
```

### 6. Build asset frontend

```bash
npm run build
```

### 7. Jalankan aplikasi

```bash
php artisan serve
```

Buka:

```text
http://localhost:8000
```

---

## ⚡ Development

Untuk development frontend dengan Vite:

```bash
npm run dev
```

Di terminal lain:

```bash
php artisan serve
```

Project juga menyediakan script Composer untuk workflow development:

```bash
composer run dev
```

---

## 🧪 Testing

Menjalankan test suite:

```bash
php artisan test
```

atau:

```bash
composer run test
```

Untuk menjaga kualitas kode PHP, Laravel Pint juga tersedia:

```bash
./vendor/bin/pint
```

---

## 📁 Struktur Project

```text
bank-soal-cerdas/
├── app/
│   ├── Http/
│   │   ├── Controllers/
│   │   └── Middleware/
│   ├── Models/
│   └── ...
│
├── database/
│   ├── factories/
│   ├── migrations/
│   └── seeders/
│
├── resources/
│   ├── js/
│   ├── sass/
│   └── views/
│
├── routes/
│   └── web.php
│
├── public/
├── storage/
├── tests/
├── composer.json
├── package.json
└── README.md
```

---

## 🎨 Frontend & Design System

Antarmuka aplikasi dikembangkan dengan pendekatan design system agar seluruh menu memiliki pengalaman visual yang konsisten.

Prinsip utama:

- Hierarki visual yang jelas
- Spacing dan ukuran komponen yang konsisten
- Komponen form, card, table, badge, dan action yang seragam
- Responsive layout untuk desktop dan mobile
- Light mode dan dark mode
- Sidebar dan header yang konsisten di seluruh aplikasi
- Fokus pada keterbacaan dan efisiensi workflow pengguna

Halaman aplikasi mengikuti pola visual yang sama, termasuk:

- Dashboard
- Bank Soal
- Paket Soal
- Analisis
- Manajemen Ujian
- Kategori
- Tag
- Kolaborasi
- Manajemen Pengguna
- Profil

---

## 🔐 Access Control

Route aplikasi dilindungi dengan authentication dan middleware role.

Secara umum:

```text
Admin
 ├── Manajemen pengguna
 ├── Bank soal
 ├── Paket soal
 ├── Ujian
 ├── Analisis
 ├── Kategori & tag
 └── Kolaborasi

Guru
 ├── Bank soal
 ├── Paket soal
 ├── Ujian
 ├── Analisis
 ├── Kategori & tag
 └── Kolaborasi

Siswa
 └── Ujian saya
      ├── Kerjakan
      ├── Kirim jawaban
      └── Hasil
```

---

## 🔄 Git Workflow

Pengembangan menggunakan branch-based workflow agar perubahan fitur dan perbaikan dapat direview secara terpisah.

Contoh workflow:

```bash
git switch main
git pull origin main

git switch -c feature/nama-fitur
```

Setelah perubahan selesai:

```bash
git add .
git commit -m "feat: deskripsi perubahan"
git push -u origin feature/nama-fitur
```

Kemudian buat Pull Request ke `main` untuk review dan integrasi.

### Konvensi commit yang disarankan

```text
feat:     fitur baru
fix:      perbaikan bug
style:    perubahan tampilan/style
refactor: perubahan struktur tanpa mengubah behavior
perf:     peningkatan performa
docs:     dokumentasi
test:     perubahan test
chore:    maintenance
```

---

## 🗺️ Roadmap

Pengembangan dilakukan secara bertahap dengan prioritas pada stabilitas fitur, UX, dan konsistensi design system.

### Saat ini

- [x] Authentication
- [x] Dashboard
- [x] Bank Soal
- [x] Paket Soal
- [x] Ujian Online
- [x] Analisis
- [x] Kategori
- [x] Tag
- [x] Kolaborasi
- [x] Manajemen Pengguna
- [x] Profil
- [x] Responsive UI
- [x] Light/Dark Theme

### Berikutnya

- [ ] Penyempurnaan UX seluruh workflow
- [ ] Penguatan analisis hasil evaluasi
- [ ] Optimasi performa query dan frontend
- [ ] Peningkatan test coverage
- [ ] Penyempurnaan sistem kolaborasi
- [ ] Dokumentasi teknis yang lebih lengkap
- [ ] Persiapan deployment production

---

## 🤝 Contributing

Perubahan fitur sebaiknya dibuat pada branch terpisah dan diajukan melalui Pull Request.

Sebelum membuat Pull Request, pastikan:

1. Aplikasi dapat dijalankan dengan normal.
2. Migration dan perubahan database sudah diperiksa.
3. Asset frontend berhasil dibuild.
4. Test yang relevan sudah dijalankan.
5. Tidak ada credential atau secret yang ikut di-commit.
6. Perubahan UI diuji pada desktop dan mobile jika relevan.

---

## 🔒 Security

Jangan commit informasi sensitif seperti:

- `.env`
- API key
- password
- token
- credential database
- private key

Jika menemukan masalah keamanan pada aplikasi, jangan publikasikan detail eksploit secara terbuka sebelum dilakukan mitigasi.

---

## 📄 License

Project ini dikembangkan sebagai aplikasi **Bank Soal Cerdas**. Ketentuan lisensi dan penggunaan project dapat ditentukan oleh pemilik repository.

---

## 👨‍💻 Project

**Bank Soal Cerdas**  
Platform manajemen bank soal dan evaluasi pembelajaran berbasis web.
