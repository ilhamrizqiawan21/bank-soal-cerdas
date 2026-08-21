<?php

namespace Database\Seeders;

use App\Models\KkoMaster;
use Illuminate\Database\Seeder;

class KkoBloomSeeder extends Seeder
{
    public function run(): void
    {
        $groups = [
            'C1' => ['L1', ['Menyebutkan','Mengidentifikasi','Mendefinisikan','Menamai','Mendaftar','Mengingat','Memilih','Mencatat','Mengulang','Mengenali']],
            'C2' => ['L1', ['Menjelaskan','Menguraikan','Mengartikan','Menafsirkan','Memberi contoh','Mengklasifikasikan','Merangkum','Menyimpulkan','Membandingkan','Membedakan','Memperkirakan']],
            'C3' => ['L2', ['Menerapkan','Menggunakan','Melaksanakan','Menghitung','Mengoperasikan','Mendemonstrasikan','Mengimplementasikan','Mempraktikkan','Menentukan','Memodifikasi','Mensimulasikan']],
            'C4' => ['L3', ['Menganalisis','Menguraikan','Mengaitkan','Mengorganisasikan','Membedakan','Membandingkan','Menyeleksi','Mendeteksi','Mendiagnosis','Menelaah','Mengelompokkan']],
            'C5' => ['L3', ['Menilai','Mengevaluasi','Mengkritik','Memvalidasi','Memeriksa','Mempertimbangkan','Membuktikan','Merekomendasikan','Memberi argumentasi','Menjustifikasi','Memutuskan']],
            'C6' => ['L3', ['Merancang','Membuat','Membangun','Mengembangkan','Merumuskan','Mengkonstruksi','Mengombinasikan','Memproduksi','Merencanakan','Menciptakan','Menyusun','Menghasilkan']],
        ];

        foreach ($groups as $bloom => [$level, $verbs]) {
            foreach ($verbs as $verb) {
                KkoMaster::updateOrCreate(
                    ['verb' => $verb],
                    ['level' => $level, 'bloom_level' => $bloom, 'description' => $this->description($bloom)]
                );
            }
        }
    }

    private function description(string $bloom): string
    {
        return match ($bloom) {
            'C1' => 'Mengingat kembali fakta, istilah, konsep, atau informasi.',
            'C2' => 'Memahami makna informasi dan mampu menjelaskan atau menginterpretasikannya.',
            'C3' => 'Menerapkan konsep, aturan, prosedur, atau pengetahuan pada situasi tertentu.',
            'C4' => 'Menganalisis bagian-bagian informasi dan menemukan hubungan atau pola.',
            'C5' => 'Mengevaluasi berdasarkan kriteria, bukti, standar, atau pertimbangan.',
            'C6' => 'Menciptakan atau menghasilkan gagasan, rancangan, prosedur, atau produk baru.',
        };
    }
}
