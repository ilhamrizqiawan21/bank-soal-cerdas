<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('kko_master', function (Blueprint $table) {
            $table->string('bloom_level', 2)->nullable()->after('level');
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
