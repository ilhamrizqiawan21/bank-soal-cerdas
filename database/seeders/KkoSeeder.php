<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\KkoMaster;

class KkoSeeder extends Seeder
{
    /**
     * Mapping level aplikasi:
     * L1 = C1 Mengingat + C2 Memahami
     * L2 = C3 Menerapkan
     * L3 = C4 Menganalisis + C5 Mengevaluasi + C6 Mencipta
     */
    public function run(): void
    {
        $kkoData = [
            'C1' => [
                'level' => 'L1',
                'description' => 'Mengingat kembali fakta, istilah, konsep, atau informasi yang telah dipelajari.',
                'verbs' => ['Menyebutkan', 'Mengidentifikasi', 'Mendefinisikan', 'Menamai', 'Mendaftar', 'Mengingat', 'Memilih', 'Mencatat', 'Mengulang', 'Mengenali'],
            ],
            'C2' => [
                'level' => 'L1',
                'description' => 'Memahami makna informasi dan mampu menjelaskan, menginterpretasikan, atau mengklasifikasikannya.',
                'verbs' => ['Menjelaskan', 'Menguraikan', 'Mengartikan', 'Menafsirkan', 'Memberi contoh', 'Mengklasifikasikan', 'Merangkum', 'Menyimpulkan', 'Membandingkan', 'Membedakan', 'Memperkirakan', 'Mengubah'],
            ],
            'C3' => [
                'level' => 'L2',
                'description' => 'Menerapkan konsep, aturan, prosedur, atau pengetahuan pada situasi tertentu.',
                'verbs' => ['Menerapkan', 'Menggunakan', 'Melaksanakan', 'Menghitung', 'Mengoperasikan', 'Mendemonstrasikan', 'Mengimplementasikan', 'Mempraktikkan', 'Menentukan', 'Memodifikasi', 'Mensimulasikan'],
            ],
            'C4' => [
                'level' => 'L3',
                'description' => 'Menganalisis informasi dengan menguraikan bagian dan menemukan hubungan atau pola.',
                'verbs' => ['Menganalisis', 'Mengaitkan', 'Mengorganisasikan', 'Menyeleksi', 'Mendeteksi', 'Mendiagnosis', 'Menelaah', 'Menemukan hubungan'],
            ],
            'C5' => [
                'level' => 'L3',
                'description' => 'Mengevaluasi berdasarkan kriteria, bukti, standar, atau pertimbangan tertentu.',
                'verbs' => ['Menilai', 'Mengevaluasi', 'Mengkritik', 'Memvalidasi', 'Memeriksa', 'Mempertimbangkan', 'Membuktikan', 'Merekomendasikan', 'Memberi argumentasi', 'Menjustifikasi', 'Memutuskan'],
            ],
            'C6' => [
                'level' => 'L3',
                'description' => 'Menciptakan atau menghasilkan gagasan, rancangan, prosedur, atau produk baru.',
                'verbs' => ['Merancang', 'Membuat', 'Membangun', 'Mengembangkan', 'Merumuskan', 'Mengkonstruksi', 'Mengombinasikan', 'Memproduksi', 'Merencanakan', 'Menciptakan', 'Menyusun', 'Menghasilkan'],
            ],
        ];

        foreach ($kkoData as $bloomLevel => $group) {
            foreach ($group['verbs'] as $verb) {
                KkoMaster::updateOrCreate(
                    ['verb' => $verb],
                    [
                        'level' => $group['level'],
                        'bloom_level' => $bloomLevel,
                        'description' => $group['description'],
                    ]
                );
            }
        }
    }
}
