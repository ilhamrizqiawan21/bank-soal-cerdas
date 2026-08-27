<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\UserSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class UserSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_default_seeded_accounts_use_predictable_local_password(): void
    {
        $this->seed(UserSeeder::class);

        $admin = User::where('email', 'admin@banksoal.com')->firstOrFail();
        $guru = User::where('email', 'guru@banksoal.com')->firstOrFail();

        $this->assertTrue(Hash::check('password123', $admin->password));
        $this->assertTrue(Hash::check('password123', $guru->password));
        $this->assertTrue($admin->is_active);
        $this->assertTrue($guru->is_active);
    }
}
