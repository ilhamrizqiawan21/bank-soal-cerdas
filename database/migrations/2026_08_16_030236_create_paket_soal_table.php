<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paket_soal', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->enum('jenjang', ['SD', 'SMP', 'SMA']);
            $table->enum('curriculum', ['merdeka', 'kbc', 'both']);
            $table->integer('total_soal')->default(0);
            $table->integer('duration_minutes')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('restrict');
            $table->enum('status', ['draft', 'published', 'archived'])->default('draft');
            $table->softDeletes();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paket_soal');
    }
};