import {
  User,
  Subject,
  Kategori,
  Tag,
  KkoMaster,
  Question,
  PaketSoal,
  Ujian,
  ShareSoal,
  SharePaket
} from '../types';

export const INITIAL_USERS: User[] = [
  {
    id: 'user-admin-1',
    name: 'Admin Bank Soal',
    email: 'admin@banksoal.com',
    role: 'admin',
    is_active: true,
    nip_nisn: '198501012010011001',
    created_at: '2026-08-01T08:00:00Z',
  },
  {
    id: 'user-guru-1',
    name: 'Budi Pratama, S.Pd.',
    email: 'guru@banksoal.com',
    role: 'guru',
    is_active: true,
    nip_nisn: '198805122014021003',
    created_at: '2026-08-01T09:30:00Z',
  },
  {
    id: 'user-guru-2',
    name: 'Siti Rahmawati, M.Pd.',
    email: 'siti.rahma@banksoal.com',
    role: 'guru',
    is_active: true,
    nip_nisn: '199203152018012004',
    created_at: '2026-08-02T10:00:00Z',
  },
  {
    id: 'user-siswa-1',
    name: 'Ahmad Rizky Pratama',
    email: 'ahmad.rizky@siswa.sch.id',
    role: 'siswa',
    is_active: true,
    nip_nisn: '0071234567',
    created_at: '2026-08-05T07:00:00Z',
  },
  {
    id: 'user-siswa-2',
    name: 'Anisa Putri Maharani',
    email: 'anisa.putri@siswa.sch.id',
    role: 'siswa',
    is_active: true,
    nip_nisn: '0071234568',
    created_at: '2026-08-05T07:05:00Z',
  },
  {
    id: 'user-siswa-3',
    name: 'Dimas Prasetyo Nugroho',
    email: 'dimas.prasetyo@siswa.sch.id',
    role: 'siswa',
    is_active: true,
    nip_nisn: '0071234569',
    created_at: '2026-08-05T07:10:00Z',
  },
  {
    id: 'user-siswa-4',
    name: 'Zahra Nur Aulia',
    email: 'zahra.aulia@siswa.sch.id',
    role: 'siswa',
    is_active: true,
    nip_nisn: '0071234570',
    created_at: '2026-08-05T07:15:00Z',
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  { id: 'subj-1', name: 'Matematika', code: 'MTK', description: 'Aljabar, Geometri, Kalkulus, Statistika & Peluang' },
  { id: 'subj-2', name: 'Ilmu Pengetahuan Alam (IPA)', code: 'IPA', description: 'Fisika, Biologi, Kimia dan Ilmu Bumi' },
  { id: 'subj-3', name: 'Ilmu Pengetahuan Sosial (IPS)', code: 'IPS', description: 'Sejarah, Geografi, Sosiologi, dan Ekonomi' },
  { id: 'subj-4', name: 'Bahasa Indonesia', code: 'BIND', description: 'Literasi, Teks Fiksi & Non-Fiksi, Tata Bahasa' },
  { id: 'subj-5', name: 'Bahasa Inggris', code: 'BING', description: 'Reading Comprehension, Grammar, and Vocabulary' },
  { id: 'subj-6', name: 'Informatika', code: 'INF', description: 'Berpikir Komputasional, Algoritma & Pemrograman' },
  { id: 'subj-7', name: 'Pendidikan Agama Islam', code: 'PAI', description: 'Akidah, Akhlak, Fiqih, Sejarah Kebudayaan Islam' },
  { id: 'subj-8', name: 'Pendidikan Pancasila & Kewarganegaraan', code: 'PPKN', description: 'Nilai Pancasila, UUD 1945, NKRI, Kebhinekaan' },
  { id: 'subj-9', name: 'Seni Budaya', code: 'SBK', description: 'Seni Rupa, Musik, Tari, dan Teater' },
  { id: 'subj-10', name: 'PJOK', code: 'PJOK', description: 'Pendidikan Jasmani, Olahraga, dan Kesehatan' },
];

export const INITIAL_KATEGORI: Kategori[] = [
  {
    id: 'kat-1',
    name: 'Asesmen Sumatif Akhir Semester (SAS)',
    slug: 'sas',
    type: 'sumatif',
    color: 'emerald',
    description: 'Evaluasi pencapaian kompetensi peserta didik di akhir semester'
  },
  {
    id: 'kat-2',
    name: 'Asesmen Formatif / Ulangan Harian (UH)',
    slug: 'formatif',
    type: 'formatif',
    color: 'blue',
    description: 'Pemantauan dan perbaikan proses pembelajaran berkala per tujuan pembelajaran'
  },
  {
    id: 'kat-3',
    name: 'Asesmen Sumatif Tengah Semester (STS / PTS)',
    slug: 'sts',
    type: 'sumatif',
    color: 'indigo',
    description: 'Penilaian capaian belajar tengah semester untuk feedback pertengahan tahun'
  },
  {
    id: 'kat-4',
    name: 'Asesmen Diagnostik Kognitif & Non-Kognitif',
    slug: 'diagnostik',
    type: 'diagnostik',
    color: 'purple',
    description: 'Pemetaan kesiapan belajar, gaya belajar, dan prasyarat materi sebelum bab baru'
  },
  {
    id: 'kat-5',
    name: 'Simulasi AKM & ANBK (Literasi-Numerasi)',
    slug: 'anbk',
    type: 'try_out',
    color: 'amber',
    description: 'Latihan soal standar Asesmen Nasional Berbasis Komputer tingkat nasional'
  },
  {
    id: 'kat-6',
    name: 'Persiapan Olimpiade Sains Nasional (OSN)',
    slug: 'osn',
    type: 'osn',
    color: 'rose',
    description: 'Kumpulan soal tingkat tinggi (HOTS C5-C6) kompetisi sains dan penalaran'
  },
  {
    id: 'kat-7',
    name: 'Ujian Sekolah / Ujian Akhir Jenjang (US)',
    slug: 'ujian-sekolah',
    type: 'sumatif',
    color: 'teal',
    description: 'Penilaian kelulusan akhir jenjang sekolah standar kurikulum'
  }
];

export const INITIAL_TAGS: Tag[] = [
  {
    id: 'tag-1',
    name: 'HOTS (Higher Order Thinking Skills)',
    slug: 'hots',
    category: 'kognitif',
    color: 'rose',
    description: 'Soal penalaran tingkat tinggi yang menuntut peserta didik menganalisis (C4), mengevaluasi (C5), atau mengkreasi (C6).',
    criteria: 'Membutuhkan sintesis konsep, bukan sekadar hafalan ingatan langsung.'
  },
  {
    id: 'tag-2',
    name: 'Numerasi & Penalaran Data',
    slug: 'numerasi',
    category: 'literasi_numerasi',
    color: 'blue',
    description: 'Menguji kemampuan menafsirkan angka, representasi grafik, rasio, tabel, pola statistika, dan pemecahan masalah kuantitatif.',
    criteria: 'Menyajikan data kuantitatif dalam konteks kehidupan nyata atau saintifik.'
  },
  {
    id: 'tag-3',
    name: 'Literasi Membaca & Teks Informasi',
    slug: 'literasi',
    category: 'literasi_numerasi',
    color: 'emerald',
    description: 'Mengukur kemampuan menemukan informasi tersurat/tersirat, menginterpretasi makna, dan merefleksi teks bacaan.',
    criteria: 'Berbasis wacana komprehensif, artikel ilmiah populer, atau teks fiksi multi-paragraf.'
  },
  {
    id: 'tag-4',
    name: 'Profil Pancasila: Bernalar Kritis',
    slug: 'bernalar-kritis',
    category: 'profil_pancasila',
    color: 'indigo',
    description: 'Mengembangkan objektivitas, menganalisis validitas informasi, serta mengidentifikasi bias atau argumen logis.',
    criteria: 'Menyajikan dua sudut pandang atau situasi paradoks yang perlu ditimbang secara kritis.'
  },
  {
    id: 'tag-5',
    name: 'Profil Pancasila: Kreatif & Mandiri',
    slug: 'kreatif-mandiri',
    category: 'profil_pancasila',
    color: 'purple',
    description: 'Mendorong peserta didik memunculkan solusi alternatif yang orisinal dan kemampuan mengambil keputusan mandiri.',
    criteria: 'Soal open-ended atau multi-solusi yang memberi ruang inovasi pemikiran.'
  },
  {
    id: 'tag-6',
    name: 'Kontekstual & Autentik (Kehidupan Nyata)',
    slug: 'kontekstual',
    category: 'stimulus',
    color: 'amber',
    description: 'Berlatar situasi keseharian, isu lingkungan, sosial-budaya, atau teknologi masa kini yang relevan dengan siswa.',
    criteria: 'Stimulus mengangkat fenomena nyata, bukan skenario abstrak tanpa konteks.'
  },
  {
    id: 'tag-7',
    name: 'Stimulus Infografis & Visual Data',
    slug: 'stimulus-visual',
    category: 'stimulus',
    color: 'teal',
    description: 'Soal dirancang dengan stimulus berupa infografis, diagram alur, skema mekanis, peta tematik, atau kurva data.',
    criteria: 'Jawaban memerlukan integrasi antara teks pendamping dan elemen visual gambar.'
  },
  {
    id: 'tag-8',
    name: 'Tingkat Kesulitan: Tinggi (Hard)',
    slug: 'level-tinggi',
    category: 'kesulitan',
    color: 'rose',
    description: 'Daya pembeda tajam, langkah penyelesaian bertingkat, dan membutuhkan transfer antardisiplin ilmu.',
    criteria: 'Tingkat kesulitan tinggi untuk menyeleksi penguasaan konsep mendalam.'
  },
  {
    id: 'tag-9',
    name: 'Tingkat Kesulitan: Sedang (Medium)',
    slug: 'level-sedang',
    category: 'kesulitan',
    color: 'amber',
    description: 'Aplikasi konsep baku dan prosedur sistematis pada situasi terstruktur (L2 / MOTS).',
    criteria: 'Dapat diselesaikan dengan pemahaman konsep pokok dan latihan terarah.'
  },
  {
    id: 'tag-10',
    name: 'Tingkat Kesulitan: Dasar (Easy)',
    slug: 'level-dasar',
    category: 'kesulitan',
    color: 'emerald',
    description: 'Mengingat definisi pokok, fakta dasar, atau rumus langsung tanpa manipulasi rumit (L1 / LOTS).',
    criteria: 'Butir soal pengenalan fondasi materi dasar.'
  },
];

export const INITIAL_KKO: KkoMaster[] = [
  // C1 - Mengingat (L1)
  { id: 'kko-c1-1', verb: 'Menyebutkan', level: 'L1', bloom_level: 'C1', description: 'Mengingat kembali fakta, istilah, atau nama objek.' },
  { id: 'kko-c1-2', verb: 'Mengidentifikasi', level: 'L1', bloom_level: 'C1', description: 'Mengenali ciri-ciri atau komponen spesifik.' },
  { id: 'kko-c1-3', verb: 'Mendefinisikan', level: 'L1', bloom_level: 'C1', description: 'Memberikan arti tepat dari suatu istilah.' },
  { id: 'kko-c1-4', verb: 'Mendaftar', level: 'L1', bloom_level: 'C1', description: 'Menuliskan rincian item dalam urutan berurutan.' },
  
  // C2 - Memahami (L1)
  { id: 'kko-c2-1', verb: 'Menjelaskan', level: 'L1', bloom_level: 'C2', description: 'Memahami makna informasi dan mampu menguraikannya.' },
  { id: 'kko-c2-2', verb: 'Mengklasifikasikan', level: 'L1', bloom_level: 'C2', description: 'Mengelompokkan berdasarkan karakteristik tertentu.' },
  { id: 'kko-c2-3', verb: 'Menyimpulkan', level: 'L1', bloom_level: 'C2', description: 'Menarik intisari dari sebuah gagasan atau data teks.' },
  { id: 'kko-c2-4', verb: 'Membandingkan', level: 'L1', bloom_level: 'C2', description: 'Menemukan persamaan dan perbedaan antar fenomena.' },

  // C3 - Menerapkan (L2)
  { id: 'kko-c3-1', verb: 'Menerapkan', level: 'L2', bloom_level: 'C3', description: 'Menggunakan rumus atau prosedur pada situasi nyata.' },
  { id: 'kko-c3-2', verb: 'Menghitung', level: 'L2', bloom_level: 'C3', description: 'Melakukan operasi matematis kuantitatif sistematis.' },
  { id: 'kko-c3-3', verb: 'Mengoperasikan', level: 'L2', bloom_level: 'C3', description: 'Menjalankan alat, formula, atau algoritma.' },
  { id: 'kko-c3-4', verb: 'Mendemonstrasikan', level: 'L2', bloom_level: 'C3', description: 'Menunjukkan cara kerja suatu proses atau prinsip.' },

  // C4 - Menganalisis (L3 - HOTS)
  { id: 'kko-c4-1', verb: 'Menganalisis', level: 'L3', bloom_level: 'C4', description: 'Membedah struktur data, teks, atau sistem menjadi bagian-bagian.' },
  { id: 'kko-c4-2', verb: 'Mendiagnosis', level: 'L3', bloom_level: 'C4', description: 'Menemukan akar masalah atau anomali dari gejala yang ada.' },
  { id: 'kko-c4-3', verb: 'Mengaitkan', level: 'L3', bloom_level: 'C4', description: 'Menghubungkan sebab-akibat antar variabel multisektor.' },
  { id: 'kko-c4-4', verb: 'Menelaah', level: 'L3', bloom_level: 'C4', description: 'Memeriksa kritis argumen atau asumsi yang mendasari.' },

  // C5 - Mengevaluasi (L3 - HOTS)
  { id: 'kko-c5-1', verb: 'Mengevaluasi', level: 'L3', bloom_level: 'C5', description: 'Memberikan penilaian kritis berdasarkan kriteria dan standar.' },
  { id: 'kko-c5-2', verb: 'Memvalidasi', level: 'L3', bloom_level: 'C5', description: 'Membuktikan kebenaran hipotesis atau efektivitas solusi.' },
  { id: 'kko-c5-3', verb: 'Merekomendasikan', level: 'L3', bloom_level: 'C5', description: 'Mengusulkan keputusan paling optimal beserta alasan kuat.' },
  { id: 'kko-c5-4', verb: 'Menjustifikasi', level: 'L3', bloom_level: 'C5', description: 'Mempertahankan argumen dengan landasan teori dan data.' },

  // C6 - Menciptakan (L3 - HOTS)
  { id: 'kko-c6-1', verb: 'Merancang', level: 'L3', bloom_level: 'C6', description: 'Membuat konsep, model rancangan, atau arsitektur baru.' },
  { id: 'kko-c6-2', verb: 'Merumuskan', level: 'L3', bloom_level: 'C6', description: 'Menyusun solusi komprehensif atas permasalahan kompleks.' },
  { id: 'kko-c6-3', verb: 'Mengkonstruksi', level: 'L3', bloom_level: 'C6', description: 'Menggabungkan elemen-elemen menjadi kesatuan utuh fungsional.' },
  { id: 'kko-c6-4', verb: 'Mengembangkan', level: 'L3', bloom_level: 'C6', description: 'Menghasilkan inovasi atau modifikasi prototipe yang lebih adaptif.' },
];

export const INITIAL_QUESTIONS: Question[] = [];

export const INITIAL_PAKET_SOAL: PaketSoal[] = [];

export const INITIAL_UJIAN: Ujian[] = [];

export const INITIAL_SHARE_SOAL: ShareSoal[] = [];

export const INITIAL_SHARE_PAKET: SharePaket[] = [];
