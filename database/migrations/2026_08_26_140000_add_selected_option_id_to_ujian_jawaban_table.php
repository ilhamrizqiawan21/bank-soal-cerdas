<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ujian_jawaban', function (Blueprint $table) {
            $table->foreignId('selected_option_id')
                ->nullable()
                ->after('selected_option')
                ->constrained('question_pg_options')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('ujian_jawaban', function (Blueprint $table) {
            $table->dropConstrainedForeignId('selected_option_id');
        });
    }
};
