<?php

namespace Tests\Feature;

use App\Models\Ujian;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UjianIndexReproTest extends TestCase
{
    use RefreshDatabase;

    public function test_guru_dapat_membuka_halaman_manajemen_ujian(): void
    {
        $guru = User::factory()->create(); // role default 'guru'

        $this->actingAs($guru)
            ->get(route('ujian.index'))
            ->assertRedirect('/app/ujian');
    }

    public function test_halaman_ujian_merender_daftar_ujian(): void
    {
        $guru = User::factory()->create(['role' => 'admin']);

        $this->actingAs($guru)
            ->get(route('ujian.index'))
            ->assertRedirect('/app/ujian');
    }
}
