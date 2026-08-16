<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('kko_master', function (Blueprint $table) {
            $table->id();
            $table->enum('level', ['C1', 'C2', 'C3', 'C4', 'C5', 'C6']);
            $table->string('verb', 100);
            $table->text('description')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('kko_master');
    }
};