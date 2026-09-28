# RULES_AI.md — Aturan Penggunaan AI dalam Proyek Bank Soal Cerdas

Dokumen ini berisi aturan dan batasan bagi siapa pun (manusia maupun AI agent) yang menggunakan asisten AI/coding agent untuk berkontribusi pada repository ini. Untuk konvensi teknis repo, lihat [AGENTS.md](./AGENTS.md).

## 1. Prinsip Umum

1. **AI membantu, manusia bertanggung jawab.** Setiap perubahan yang dihasilkan atau dibantu AI tetap harus direview oleh kontributor manusia sebelum di-merge ke `main`.
2. **Transparansi.** Commit atau PR yang sebagian besar dihasilkan AI sebaiknya menyebutkan hal itu (mis. co-author line), agar reviewer tahu perlu perhatian ekstra pada bagian yang dihasilkan otomatis.
3. **Tidak ada tindakan destruktif otomatis.** AI tidak boleh menjalankan operasi yang menghapus data/branch/history (mis. `git push --force`, `git reset --hard`, `DROP TABLE`, `migrate:fresh` di database yang berisi data nyata) tanpa konfirmasi eksplisit dari pengguna untuk aksi tersebut secara spesifik.

## 2. Data & Privasi

- **Dilarang** memasukkan data pribadi siswa/guru/pengguna nyata (nama asli, NIS, email pribadi, nomor telepon, dsb.) ke dalam prompt AI, dokumentasi, contoh kode, atau fixture test yang di-commit. Gunakan data sintetis/faker (lihat `database/factories/`).
- **Dilarang** membagikan isi `.env`, kredensial database, API key, atau secret apa pun ke AI (baik lewat prompt maupun file yang dibaca AI) untuk tujuan selain debugging yang benar-benar diperlukan, dan segera rotasi kredensial jika pernah tidak sengaja terekspos (lihat riwayat commit `fix: rotasi kredensial & bersihkan secret dari riwayat git` sebagai preseden di repo ini).
- Hasil pekerjaan siswa (jawaban ujian) di `ujian_jawaban` bersifat sensitif secara akademik — jangan diekspor/dibagikan ke luar proses development kecuali untuk kebutuhan debugging yang disetujui, dan hindari menempelkannya utuh ke prompt AI pihak ketiga.

## 3. Batasan Perubahan Kode oleh AI

- **Skema database**: AI hanya boleh mengubah skema lewat migration baru, tidak dengan mengedit langsung migration lama yang sudah pernah dijalankan/merge (lihat aturan setara di [AGENTS.md](./AGENTS.md) §3, §7).
- **Autentikasi & otorisasi**: perubahan pada `CheckRole` middleware, Policy (`QuestionPolicy`, `PaketSoalPolicy`, `UjianPolicy`), atau logika role di `routes/web.php` harus disertai penjelasan eksplisit di PR tentang dampak akses, dan idealnya disertai test. Ini area berisiko tinggi karena salah konfigurasi bisa membocorkan data lintas role (mis. siswa mengakses data ujian siswa lain).
- **Fitur ujian (CBT)**: perubahan pada alur pengerjaan ujian (`UjianKerjakanCBTView`, endpoint `answer`/`submit`) harus mempertimbangkan kondisi race/duplikasi submit dan status waktu (`started_at`, `finished_at`, durasi) — jangan mengubah logika ini tanpa memahami efeknya terhadap penilaian yang sudah berjalan.
- **Import/Export Excel**: perubahan pada `app/Imports`/`app/Exports` harus tetap kompatibel dengan template yang sudah beredar, atau harus memperbarui dokumentasi template jika format berubah.

## 4. Dependensi & Lingkungan

- Jangan menambah/mengganti dependency mayor (framework, ORM, library UI besar) hanya atas inisiatif AI. Diskusikan dulu dengan pemilik proyek karena ini memengaruhi maintenance jangka panjang.
- Jangan menjalankan perintah yang mengubah lockfile (`composer.lock`, `package-lock.json`, `bun.lock`) tanpa memastikan versi yang di-lock kompatibel dan sudah diuji (`php artisan test`, `npm run lint`).

## 5. Testing Sebelum Klaim Selesai

AI/agent **tidak boleh** melaporkan suatu perubahan sebagai selesai/berhasil tanpa:

- Menjalankan test backend relevan (`php artisan test`) bila mengubah PHP.
- Menjalankan type-check frontend (`npm run lint`) bila mengubah TypeScript/React.
- Untuk perubahan UI, mencoba alur golden path secara nyata (dev server) jika memungkinkan, dan menyatakan secara eksplisit jika verifikasi visual tidak dilakukan.

Lihat [INSTALLATION.md](./INSTALLATION.md) §6 untuk perintah lengkap.

## 6. Isu Keamanan

- Jika AI menemukan potensi kerentanan (mis. celah otorisasi, injeksi, XSS) saat bekerja di repo ini, **jangan** menuliskan langkah eksploitasi rinci di commit message, PR publik, atau dokumentasi yang tersimpan di repo. Laporkan dan perbaiki langsung, atau diskusikan secara privat dengan pemilik repo sesuai kebijakan di `README.md` bagian *Security*.
- Jangan menonaktifkan mekanisme keamanan (CSRF, middleware `auth`, `role:...`, validasi input) untuk "mempermudah testing" dan lupa mengaktifkannya kembali sebelum merge.

## 7. Dokumentasi

- Perubahan fitur yang signifikan (menambah modul baru, mengubah alur peran, mengubah skema inti) wajib disertai pembaruan dokumen terkait di `docs/` (`PRD.md`, `ERD.md`, `ARCHITECTURE.md`) pada PR yang sama, bukan sebagai pekerjaan susulan yang terpisah.
