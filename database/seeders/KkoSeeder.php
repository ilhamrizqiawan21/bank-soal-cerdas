<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\KkoMaster;  // <-- Tambahkan ini

class KkoSeeder extends Seeder
{
    public function run(): void
    {
        $kkoData = [
            // C1 - Mengingat
            ['level' => 'C1', 'verb' => 'Menyebutkan'],
            ['level' => 'C1', 'verb' => 'Mengutip'],
            ['level' => 'C1', 'verb' => 'Mendefinisikan'],
            ['level' => 'C1', 'verb' => 'Menghafal'],
            ['level' => 'C1', 'verb' => 'Mengidentifikasi'],
            
            // C2 - Memahami
            ['level' => 'C2', 'verb' => 'Menjelaskan'],
            ['level' => 'C2', 'verb' => 'Menginterpretasi'],
            ['level' => 'C2', 'verb' => 'Memberi contoh'],
            ['level' => 'C2', 'verb' => 'Membedakan'],
            ['level' => 'C2', 'verb' => 'Menyimpulkan'],
            
            // C3 - Menerapkan
            ['level' => 'C3', 'verb' => 'Menggunakan'],
            ['level' => 'C3', 'verb' => 'Menerapkan'],
            ['level' => 'C3', 'verb' => 'Menghitung'],
            ['level' => 'C3', 'verb' => 'Menunjukkan'],
            ['level' => 'C3', 'verb' => 'Melaksanakan'],
            
            // C4 - Menganalisis
            ['level' => 'C4', 'verb' => 'Menganalisis'],
            ['level' => 'C4', 'verb' => 'Membandingkan'],
            ['level' => 'C4', 'verb' => 'Mengorganisasi'],
            ['level' => 'C4', 'verb' => 'Mengaudit'],
            ['level' => 'C4', 'verb' => 'Mengkategorikan'],
            
            // C5 - Mengevaluasi
            ['level' => 'C5', 'verb' => 'Mengkritisi'],
            ['level' => 'C5', 'verb' => 'Menjustifikasi'],
            ['level' => 'C5', 'verb' => 'Mempertimbangkan'],
            ['level' => 'C5', 'verb' => 'Menilai'],
            ['level' => 'C5', 'verb' => 'Merekomendasikan'],
            
            // C6 - Mencipta
            ['level' => 'C6', 'verb' => 'Merancang'],
            ['level' => 'C6', 'verb' => 'Mengkonstruksi'],
            ['level' => 'C6', 'verb' => 'Mengabstraksi'],
            ['level' => 'C6', 'verb' => 'Mengkombinasikan'],
            ['level' => 'C6', 'verb' => 'Mengembangkan'],
        ];

        foreach ($kkoData as $kko) {
            KkoMaster::create($kko);
        }
    }
}