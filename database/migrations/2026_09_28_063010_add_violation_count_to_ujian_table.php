<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Cached count so exam lists/dashboards can flag a suspicious
        // attempt with a single column read, instead of joining/counting
        // ujian_pelanggaran on every row of every listing.
        Schema::table('ujian', function (Blueprint $table) {
            $table->unsignedInteger('violation_count')->default(0)->after('total_score');
        });
    }

    public function down(): void
    {
        Schema::table('ujian', function (Blueprint $table) {
            $table->dropColumn('violation_count');
        });
    }
};
