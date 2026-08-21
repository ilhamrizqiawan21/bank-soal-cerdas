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
            $table->enum('level', ['L1', 'L2', 'L3']);
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
