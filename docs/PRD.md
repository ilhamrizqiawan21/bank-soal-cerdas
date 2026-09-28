# Product Requirements Document (PRD) — Bank Soal Cerdas

## 1. Ringkasan

Bank Soal Cerdas adalah platform manajemen bank soal dan evaluasi pembelajaran berbasis web. Aplikasi ini membantu **admin**, **guru**, dan **siswa** mengelola siklus penyusunan soal, paket soal, ujian online, kolaborasi antar pengguna, serta analisis hasil evaluasi dalam satu sistem terpadu.

## 2. Latar Belakang & Tujuan

Guru dan sekolah sering mengelola bank soal secara manual (dokumen terpisah, spreadsheet) sehingga sulit melakukan standardisasi kualitas soal (kesesuaian kurikulum, level kognitif, KKO), sulit menyusun paket ujian yang konsisten, dan sulit menganalisis hasil evaluasi siswa secara agregat.

Tujuan produk:

- Menyediakan bank soal terstruktur dan dapat dicari/difilter berdasarkan kurikulum, jenjang, tipe soal, dan level kognitif (Taksonomi Bloom).
- Memungkinkan penyusunan **paket soal** yang dapat dipakai ulang untuk berbagai ujian.
- Mendukung **ujian online** end-to-end: pembuatan, publikasi, pengerjaan oleh siswa, hingga penilaian.
- Memberi **analisis hasil evaluasi** agar guru dapat menilai pencapaian belajar per ujian maupun per siswa.
- Mendukung **kolaborasi** berbagi soal/paket soal antar guru.

## 3. Target Pengguna & Peran

| Role | Deskripsi | Akses utama |
|---|---|---|
| **Admin** | Mengelola sistem secara keseluruhan | Semua fitur, termasuk manajemen pengguna |
| **Guru** | Menyusun soal, paket soal, dan ujian | Bank soal, paket soal, ujian, analisis, kategori & tag, kolaborasi |
| **Siswa** | Mengerjakan ujian yang ditugaskan | "Ujian Saya": kerjakan, kirim jawaban, lihat hasil |

Peran disimpan pada kolom `users.role` (`admin` \| `guru` \| `siswa`) dan ditegakkan lewat middleware `role:...` serta Policy (`QuestionPolicy`, `PaketSoalPolicy`, `UjianPolicy`). Akun nonaktif (`is_active = false`) otomatis di-logout saat mengakses rute yang dilindungi.

## 4. Lingkup Fitur

### 4.1 Bank Soal
- CRUD soal dengan tipe: **Pilihan Ganda (pg)**, **Uraian (uraian)**, **Menjodohkan (menjodohkan)**, **Benar/Salah (benar_salah)**.
- Klasifikasi: mata pelajaran (`subject`), jenjang (`SD`/`SMP`/`SMA`), kurikulum (`merdeka`/`kbc`/`both`), KKO (`kko_master`), level kognitif (`L1`/`L2`/`L3` — mapping dari C1–C6).
- Kategori (hierarkis: KD/topik/bab) dan tag berwarna, relasi many-to-many ke soal.
- Import soal (Excel via `maatwebsite/excel`), export soal, duplikasi soal.
- Soft delete soal (riwayat tetap ada saat dipakai di paket/ujian lama).

### 4.2 Paket Soal
- Membuat & mengelola paket soal (nama, deskripsi, jenjang, kurikulum, durasi, opsi acak soal & acak pilihan jawaban).
- Menambahkan/mengurutkan soal dari bank soal ke dalam paket (`paket_soal_items`, dengan skor per soal).
- Status siklus: `draft` → `published` → `archived`.
- Duplikasi paket soal.

### 4.3 Ujian Online
**Admin/Guru:**
- Membuat ujian berbasis paket soal, menentukan peserta (siswa), durasi, dan mempublikasikan ujian.
- Mengelola status ujian: `draft` → `active` → `finished`/`expired`.

**Siswa:**
- Melihat daftar ujian yang ditugaskan ("Ujian Saya").
- Mengerjakan ujian (antarmuka CBT), menyimpan jawaban per soal secara bertahap, mengirim (submit) ujian.
- Melihat hasil ujian setelah selesai/dinilai.

### 4.4 Analisis
- Ringkasan hasil evaluasi lintas ujian.
- Detail hasil per ujian dan per siswa.
- Export hasil analisis.

### 4.5 Kategori & Tag
- Kategori hierarkis (parent/child) untuk mengelompokkan soal berdasarkan KD/topik/bab.
- Tag bebas dengan warna untuk pelabelan tambahan.

### 4.6 Kolaborasi
- Berbagi soal atau paket soal ke pengguna lain dengan level izin (`view`/`edit`/`copy`).
- Penerima dapat menerima atau menolak berbagi, menambahkan catatan (notes), dan melihat riwayat berbagi.

### 4.7 Manajemen Pengguna (Admin)
- CRUD pengguna, aktivasi/nonaktivasi akun (`toggle-status`).
- Data profil: NIP, telepon, alamat, gender, tanggal lahir, avatar, `last_login_at`.

### 4.8 Profil & Pengaturan
- Update profil, avatar, dan password oleh pengguna sendiri.

## 5. Taksonomi Bloom & Level Kognitif

Soal diklasifikasikan dengan enam level kognitif Bloom, dipetakan ke tiga level penyimpanan (`level_c` pada tabel `questions`, `level` pada `kko_master`):

| Level C | Keterangan | Kategori | Disimpan sebagai |
|---|---|---|---|
| C1 | Mengingat | LOTS | L1 |
| C2 | Memahami | LOTS | L1 |
| C3 | Menerapkan | LOTS/MOTS | L2 |
| C4 | Menganalisis | HOTS | L3 |
| C5 | Mengevaluasi | HOTS | L3 |
| C6 | Mencipta | HOTS | L3 |

Klasifikasi ini dipakai untuk melihat komposisi tingkat kemampuan kognitif pada bank soal maupun hasil evaluasi.

## 6. Alur Utama

```text
Pengguna → Authentication → (Admin | Guru | Siswa)

Admin/Guru: Bank Soal → Paket Soal → Ujian → Analisis
Siswa:      Ujian → Jawaban → Hasil
```

## 7. Non-Functional Requirements

- Backend: PHP 8.3+, Laravel 13.
- Frontend: React 19 + TypeScript sebagai SPA yang disajikan lewat shell Blade (`/app/*`), pola *strangler* di atas rute Blade legacy yang tersisa.
- Autentikasi berbasis sesi Laravel (bukan token API terpisah); SPA memanggil `/api/*` dengan cookie sesi + CSRF.
- Responsive UI untuk desktop & mobile, mendukung light/dark theme.
- Keamanan: tidak boleh ada credential/secret ter-commit; validasi akses lewat middleware role + Policy per resource (mis. hanya pemilik/berkolaborasi yang bisa mengubah soal/paket/ujian tertentu).

## 8. Di Luar Lingkup (Saat Ini)

- Tidak ada mode ujian offline/luring.
- Tidak ada integrasi LMS pihak ketiga.
- Tidak ada penilaian otomatis berbasis AI untuk soal uraian (dinilai manual atau via rubrik yang disiapkan guru).

## 9. Roadmap Singkat

Fitur inti (autentikasi, dashboard, bank soal, paket soal, ujian online, analisis, kategori, tag, kolaborasi, manajemen pengguna, profil, responsive UI, light/dark theme) sudah tersedia. Tahap berikutnya berfokus pada penyempurnaan UX, penguatan analisis, optimasi performa, peningkatan test coverage, dan kesiapan deployment production. Lihat [ARCHITECTURE.md](./ARCHITECTURE.md) dan `README.md` untuk detail teknis dan status roadmap terkini.
