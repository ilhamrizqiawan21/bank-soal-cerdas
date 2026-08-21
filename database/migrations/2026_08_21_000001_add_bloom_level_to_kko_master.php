<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
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
    }

    public function down(): void
    {
        Schema::table('kko_master', function (Blueprint $table) {
            $table->dropIndex(['level', 'bloom_level']);
            $table->dropColumn('bloom_level');
        });
    }
};
