<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kko_master', function (Blueprint $table) {
            $table->enum('bloom_level', ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'])
                ->nullable()
                ->after('level');
            $table->index(['level', 'bloom_level']);
        });

        // Backfill existing KKO rows so an existing installation immediately
        // has a Bloom classification even before KkoSeeder is run again.
        $groups = [
            'C1' => ['Menyebutkan', 'Mengutip', 'Mendefinisikan', 'Menghafal', 'Mengidentifikasi'],
            'C2' => ['Menjelaskan', 'Menginterpretasi', 'Memberi contoh', 'Membedakan', 'Menyimpulkan', 'Mengkategorikan', 'Membandingkan'],
            'C3' => ['Menggunakan', 'Menerapkan', 'Menghitung', 'Menunjukkan', 'Melaksanakan'],
            'C4' => ['Menganalisis', 'Mengorganisasi'],
            'C5' => ['Mengaudit', 'Mengkritisi', 'Menjustifikasi', 'Mempertimbangkan', 'Menilai', 'Merekomendasikan'],
            'C6' => ['Merancang', 'Mengkonstruksi', 'Mengabstraksi', 'Mengkombinasikan', 'Mengembangkan'],
        ];

        foreach ($groups as $bloom => $verbs) {
            DB::table('kko_master')->whereIn('verb', $verbs)->update(['bloom_level' => $bloom]);
        }
    }

    public function down(): void
    {
        Schema::table('kko_master', function (Blueprint $table) {
            $table->dropIndex(['level', 'bloom_level']);
            $table->dropColumn('bloom_level');
        });
    }
};
