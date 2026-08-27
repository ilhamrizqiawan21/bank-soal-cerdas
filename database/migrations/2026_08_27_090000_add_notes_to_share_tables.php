<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('share_soal', function (Blueprint $table) {
            $table->json('notes')->nullable()->after('note');
        });

        Schema::table('share_paket', function (Blueprint $table) {
            $table->json('notes')->nullable()->after('note');
        });
    }

    public function down(): void
    {
        Schema::table('share_soal', function (Blueprint $table) {
            $table->dropColumn('notes');
        });

        Schema::table('share_paket', function (Blueprint $table) {
            $table->dropColumn('notes');
        });
    }
};
