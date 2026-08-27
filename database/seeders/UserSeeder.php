<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $localDefaultPassword = app()->environment(['local', 'testing']) ? 'password123' : null;

        $accounts = [
            [
                'name' => 'Admin Bank Soal',
                'email' => 'admin@banksoal.com',
                'role' => 'admin',
                'password' => env('SEED_ADMIN_PASSWORD') ?: $localDefaultPassword,
            ],
            [
                'name' => 'Guru Pertama',
                'email' => 'guru@banksoal.com',
                'role' => 'guru',
                'password' => env('SEED_GURU_PASSWORD') ?: $localDefaultPassword,
            ],
        ];

        foreach ($accounts as $account) {
            $plain = $account['password'] ?: Str::password(20, symbols: false);

            User::updateOrCreate([
                'email' => $account['email'],
            ], [
                'name' => $account['name'],
                'password' => Hash::make($plain),
                'role' => $account['role'],
                'is_active' => true,
            ]);

            if ($account['password'] === $localDefaultPassword) {
                $this->command->info("Password lokal untuk {$account['email']}: {$plain}");
            } elseif (! $account['password']) {
                $this->command->warn("Password acak untuk {$account['email']}: {$plain}");
            }
        }
    }
}
