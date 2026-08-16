<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ujian_jawaban', function (Blueprint $table) {
            $table->id();
            $table->foreignId('ujian_id')->constrained('ujian')->onDelete('cascade');
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->foreignId('paket_soal_item_id')->constrained('paket_soal_items')->onDelete('cascade');
            
            $table->text('jawaban')->nullable();
            $table->integer('selected_option')->nullable();
            $table->boolean('is_correct')->nullable();
            $table->integer('score')->default(0);
            $table->integer('max_score')->default(1);
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ujian_jawaban');
    }
};