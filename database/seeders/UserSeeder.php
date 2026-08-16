<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;  // <-- Tambahkan ini

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin Bank Soal',
            'email' => 'admin@banksoal.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        User::create([
            'name' => 'Guru Pertama',
            'email' => 'guru@banksoal.com',
            'password' => Hash::make('password123'),
            'role' => 'guru',
        ]);
    }
}