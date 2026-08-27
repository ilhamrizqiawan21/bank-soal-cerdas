<?php

namespace Tests\Feature;

use App\Models\Kategori;
use App\Models\KkoMaster;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class ApiContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_me_returns_current_user_in_data_shape(): void
    {
        $user = User::factory()->create(['role' => 'siswa']);

        $this->actingAs($user)
            ->getJson('/api/me')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->assertJsonPath('data.email', $user->email)
            ->assertJsonMissingPath('data.password');
    }

    public function test_api_profile_and_password_can_be_updated(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('password123'),
            'role' => 'guru',
        ]);

        $this->actingAs($user)
            ->putJson('/api/profile', [
                'name' => 'Guru Updated',
                'email' => 'guru.updated@example.test',
                'phone' => '08123456789',
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Guru Updated')
            ->assertJsonPath('data.email', 'guru.updated@example.test');

        $this->actingAs($user)
            ->putJson('/api/settings/password', [
                'current_password' => 'password123',
                'password' => 'newpassword123',
                'password_confirmation' => 'newpassword123',
            ])
            ->assertOk()
            ->assertJson(['data' => null]);

        $this->assertTrue(Hash::check('newpassword123', $user->fresh()->password));
    }

    public function test_api_profile_avatar_can_be_uploaded_from_react(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['role' => 'guru']);

        $avatar = UploadedFile::fake()->image('avatar.jpg', 256, 256);

        $path = $this->actingAs($user)
            ->postJson('/api/profile/avatar', [
                'avatar' => $avatar,
            ])
            ->assertOk()
            ->assertJsonPath('data.id', $user->id)
            ->json('data.avatar');

        Storage::disk('public')->assertExists($path);
    }

    public function test_master_data_api_is_restricted_to_admin_or_guru(): void
    {
        $siswa = User::factory()->create(['role' => 'siswa']);

        foreach (['/api/subjects', '/api/kategori', '/api/tags', '/api/kko'] as $path) {
            $this->actingAs($siswa)->getJson($path)->assertForbidden();
        }
    }

    public function test_subject_api_uses_data_shape_and_crud_contract(): void
    {
        $guru = User::factory()->create(['role' => 'guru']);

        $createdId = $this->actingAs($guru)
            ->postJson('/api/subjects', ['name' => 'Matematika', 'code' => 'MTK'])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Matematika')
            ->json('data.id');

        $this->actingAs($guru)
            ->getJson('/api/subjects')
            ->assertOk()
            ->assertJsonStructure(['data' => [['id', 'name', 'code', 'questions_count']]]);

        $this->actingAs($guru)
            ->putJson("/api/subjects/{$createdId}", ['name' => 'Matematika Wajib', 'code' => 'MTKW'])
            ->assertOk()
            ->assertJsonPath('data.name', 'Matematika Wajib');

        $this->actingAs($guru)
            ->deleteJson("/api/subjects/{$createdId}")
            ->assertOk()
            ->assertJson(['data' => null]);

        $this->assertDatabaseMissing('subjects', ['id' => $createdId]);
    }

    public function test_kategori_api_uses_data_shape_and_crud_contract(): void
    {
        $guru = User::factory()->create(['role' => 'guru']);
        $parent = Kategori::create(['name' => 'Bab 1', 'type' => 'bab']);

        $createdId = $this->actingAs($guru)
            ->postJson('/api/kategori', [
                'name' => 'Aljabar',
                'code' => 'ALG',
                'type' => 'topik',
                'parent_id' => $parent->id,
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Aljabar')
            ->json('data.id');

        $this->actingAs($guru)
            ->getJson('/api/kategori?type=topik')
            ->assertOk()
            ->assertJsonStructure(['data' => [['id', 'name', 'type', 'children_count', 'questions_count']]]);

        $this->actingAs($guru)
            ->putJson("/api/kategori/{$createdId}", [
                'name' => 'Aljabar Linear',
                'code' => 'ALGL',
                'type' => 'topik',
                'parent_id' => $parent->id,
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Aljabar Linear');

        $this->actingAs($guru)
            ->deleteJson("/api/kategori/{$createdId}")
            ->assertOk()
            ->assertJson(['data' => null]);
    }

    public function test_kko_api_supports_level_filter(): void
    {
        $guru = User::factory()->create(['role' => 'guru']);
        KkoMaster::create(['level' => 'L1', 'verb' => 'Mengingat', 'bloom_level' => 'C1', 'description' => 'test']);
        KkoMaster::create(['level' => 'L2', 'verb' => 'Menerapkan', 'bloom_level' => 'C3', 'description' => 'test']);

        $this->actingAs($guru)
            ->getJson('/api/kko?level=L1')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.level', 'L1');
    }
}
