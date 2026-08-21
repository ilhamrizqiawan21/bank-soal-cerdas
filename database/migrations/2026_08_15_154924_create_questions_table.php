<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('restrict');
            $table->foreignId('kko_id')->constrained('kko_master')->onDelete('restrict');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->enum('jenjang', ['SD', 'SMP', 'SMA']);
            $table->enum('curriculum', ['merdeka', 'kbc', 'both']);
            $table->enum('type', ['pg', 'uraian', 'menjodohkan', 'benar_salah']);
            // L1 = LOTS, L2 = MOTS, L3 = HOTS
            $table->enum('level_c', ['L1', 'L2', 'L3']);
            $table->text('question_text');
            $table->text('indicator_text')->nullable();
            $table->boolean('correct_boolean')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
