<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\KkoMaster;

class KkoSeeder extends Seeder
{
    public function run(): void
    {
        $kkoData = [
            // L1 - Mengingat & memahami
            ['level' => 'L1', 'verb' => 'Menyebutkan'],
            ['level' => 'L1', 'verb' => 'Mengutip'],
            ['level' => 'L1', 'verb' => 'Mendefinisikan'],
            ['level' => 'L1', 'verb' => 'Menghafal'],
            ['level' => 'L1', 'verb' => 'Mengidentifikasi'],
            ['level' => 'L1', 'verb' => 'Menjelaskan'],
            ['level' => 'L1', 'verb' => 'Menginterpretasi'],
            ['level' => 'L1', 'verb' => 'Memberi contoh'],
            ['level' => 'L1', 'verb' => 'Membedakan'],
            ['level' => 'L1', 'verb' => 'Menyimpulkan'],

            // L2 - Menerapkan
            ['level' => 'L2', 'verb' => 'Menggunakan'],
            ['level' => 'L2', 'verb' => 'Menerapkan'],
            ['level' => 'L2', 'verb' => 'Menghitung'],
            ['level' => 'L2', 'verb' => 'Menunjukkan'],
            ['level' => 'L2', 'verb' => 'Melaksanakan'],

            // L3 - Menalar / HOTS
            ['level' => 'L3', 'verb' => 'Menganalisis'],
            ['level' => 'L3', 'verb' => 'Membandingkan'],
            ['level' => 'L3', 'verb' => 'Mengorganisasi'],
            ['level' => 'L3', 'verb' => 'Mengaudit'],
            ['level' => 'L3', 'verb' => 'Mengkategorikan'],
            ['level' => 'L3', 'verb' => 'Mengkritisi'],
            ['level' => 'L3', 'verb' => 'Menjustifikasi'],
            ['level' => 'L3', 'verb' => 'Mempertimbangkan'],
            ['level' => 'L3', 'verb' => 'Menilai'],
            ['level' => 'L3', 'verb' => 'Merekomendasikan'],
            ['level' => 'L3', 'verb' => 'Merancang'],
            ['level' => 'L3', 'verb' => 'Mengkonstruksi'],
            ['level' => 'L3', 'verb' => 'Mengabstraksi'],
            ['level' => 'L3', 'verb' => 'Mengkombinasikan'],
            ['level' => 'L3', 'verb' => 'Mengembangkan'],
        ];

        foreach ($kkoData as $kko) {
            KkoMaster::create($kko);
        }
    }
}
