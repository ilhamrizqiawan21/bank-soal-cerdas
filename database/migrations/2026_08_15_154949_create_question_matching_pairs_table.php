<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('question_matching_pairs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('questions')->onDelete('cascade');
            $table->integer('pair_order')->default(1);
            $table->text('left_text');
            $table->text('right_text');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('question_matching_pairs');
    }
};