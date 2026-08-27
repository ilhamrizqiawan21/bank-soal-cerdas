<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('nip', 50)->nullable()->unique()->after('role');
            $table->string('phone', 20)->nullable()->after('is_active');
            $table->text('address')->nullable()->after('phone');
            $table->enum('gender', ['L', 'P'])->nullable()->after('address');
            $table->date('birth_date')->nullable()->after('gender');
            $table->string('avatar')->nullable()->after('birth_date');
            $table->timestamp('last_login_at')->nullable()->after('avatar');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['nip', 'phone', 'address', 'gender', 'birth_date', 'avatar', 'last_login_at']);
        });
    }
};
