<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // One row per detected anti-cheat event during a student's exam
        // attempt (fullscreen exit, tab/window blur, visibility change).
        // Previously these were only counted in browser state
        // (UjianKerjakanCBTView's cheatCount) and lost on refresh — a
        // teacher had no way to see, after the fact, which students
        // triggered anti-cheat warnings and how many times.
        Schema::create('ujian_pelanggaran', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ujian_id')->constrained('ujian')->onDelete('cascade');
            $table->enum('type', ['blur', 'visibility_hidden', 'fullscreen_exit']);
            $table->timestamp('occurred_at');
            $table->timestamps();

            $table->index(['ujian_id', 'occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ujian_pelanggaran');
    }
};
