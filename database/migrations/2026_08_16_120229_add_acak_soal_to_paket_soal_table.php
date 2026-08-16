<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('paket_soal', function (Blueprint $table) {
            $table->boolean('acak_soal')->default(false)->after('duration_minutes');
            $table->boolean('acak_pilihan')->default(false)->after('acak_soal');
        });
    }

    public function down(): void
    {
        Schema::table('paket_soal', function (Blueprint $table) {
            $table->dropColumn(['acak_soal', 'acak_pilihan']);
        });
    }
};