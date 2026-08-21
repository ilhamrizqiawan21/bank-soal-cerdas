<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Mapping: C1-C2 -> L1 (mengingat/memahami), C3 -> L2 (menerapkan), C4-C6 -> L3 (menalar/HOTS).
        Schema::table('questions', function (Blueprint $table) {
            $table->string('level_c', 10)->default('L1')->change();
        });

        DB::statement("UPDATE questions SET level_c = CASE
            WHEN level_c IN ('C1', 'C2') THEN 'L1'
            WHEN level_c = 'C3' THEN 'L2'
            WHEN level_c IN ('C4', 'C5', 'C6') THEN 'L3'
            ELSE 'L1' END");

        Schema::table('questions', function (Blueprint $table) {
            $table->enum('level_c', ['L1', 'L2', 'L3'])->default('L1')->change();
        });

        Schema::table('kko_master', function (Blueprint $table) {
            $table->string('level', 10)->default('L1')->change();
        });

        DB::statement("UPDATE kko_master SET level = CASE
            WHEN level IN ('C1', 'C2') THEN 'L1'
            WHEN level = 'C3' THEN 'L2'
            WHEN level IN ('C4', 'C5', 'C6') THEN 'L3'
            ELSE 'L1' END");

        Schema::table('kko_master', function (Blueprint $table) {
            $table->enum('level', ['L1', 'L2', 'L3'])->default('L1')->change();
        });
    }

    public function down(): void
    {
        Schema::table('questions', function (Blueprint $table) {
            $table->string('level_c', 10)->default('C1')->change();
        });
        DB::statement("UPDATE questions SET level_c = CASE WHEN level_c = 'L1' THEN 'C1' WHEN level_c = 'L2' THEN 'C3' ELSE 'C4' END");
        Schema::table('questions', function (Blueprint $table) {
            $table->enum('level_c', ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'])->default('C1')->change();
        });

        Schema::table('kko_master', function (Blueprint $table) {
            $table->string('level', 10)->default('C1')->change();
        });
        DB::statement("UPDATE kko_master SET level = CASE WHEN level = 'L1' THEN 'C1' WHEN level = 'L2' THEN 'C3' ELSE 'C4' END");
        Schema::table('kko_master', function (Blueprint $table) {
            $table->enum('level', ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'])->default('C1')->change();
        });
    }
};
