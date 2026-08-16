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
            
            // Relasi
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('restrict');
            $table->foreignId('kko_id')->constrained('kko_master')->onDelete('restrict');
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            
            // Identitas Soal
            $table->enum('jenjang', ['SD', 'SMP', 'SMA']);
            $table->enum('curriculum', ['merdeka', 'kbc', 'both']);
            $table->enum('type', ['pg', 'uraian', 'menjodohkan', 'benar_salah']);
            $table->enum('level_c', ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']);
            
            // Konten Soal
            $table->text('question_text');
            $table->text('indicator_text')->nullable();
            
            // Khusus untuk tipe benar_salah
            $table->boolean('correct_boolean')->nullable();
            
            // Soft Delete
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};