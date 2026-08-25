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
        $accounts = [
            [
                'name' => 'Admin Bank Soal',
                'email' => 'admin@banksoal.com',
                'role' => 'admin',
                'password' => env('SEED_ADMIN_PASSWORD'),
            ],
            [
                'name' => 'Guru Pertama',
                'email' => 'guru@banksoal.com',
                'role' => 'guru',
                'password' => env('SEED_GURU_PASSWORD'),
            ],
        ];

        foreach ($accounts as $account) {
            $plain = $account['password'] ?: Str::password(20, symbols: false);

            User::create([
                'name' => $account['name'],
                'email' => $account['email'],
                'password' => Hash::make($plain),
                'role' => $account['role'],
            ]);

            if (! $account['password']) {
                $this->command->warn("Password acak untuk {$account['email']}: {$plain}");
            }
        }
    }
}
