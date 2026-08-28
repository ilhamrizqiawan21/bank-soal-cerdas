<?php

namespace Tests\Feature;

use App\Models\KkoMaster;
use App\Models\Question;
use App\Models\ShareSoal;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthSecurityTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_is_rate_limited(): void
    {
        $this->withoutMiddleware(VerifyCsrfToken::class);

        // 5 percobaan pertama masih diizinkan (kembali dengan error validasi)
        for ($i = 0; $i < 5; $i++) {
            $response = $this->post('/login', [
                'email' => 'admin@banksoal.com',
                'password' => 'salah',
            ]);
            $this->assertNotEquals(429, $response->getStatusCode(), "Percobaan ke-" . ($i + 1) . " tidak boleh diblokir");
        }

        // Percobaan ke-6 diblokir throttle
        $this->post('/login', ['email' => 'admin@banksoal.com', 'password' => 'salah'])
            ->assertStatus(429);
    }

    public function test_inactive_user_cannot_login(): void
    {
        $this->withoutMiddleware(VerifyCsrfToken::class);

        User::factory()->create([
            'email' => 'nonaktif@test.com',
            'password' => bcrypt('password123'),
            'is_active' => false,
        ]);

        $this->post('/login', ['email' => 'nonaktif@test.com', 'password' => 'password123'])
            ->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    public function test_authenticated_user_is_redirected_away_from_login_page(): void
    {
        $user = User::factory()->create(['is_active' => true]);

        $this->actingAs($user)
            ->get('/login')
            ->assertRedirect('/app/dashboard');
    }

    public function test_login_uses_safe_intended_path_from_query_string(): void
    {
        $this->withoutMiddleware(VerifyCsrfToken::class);

        User::factory()->create([
            'email' => 'guru-intended@test.com',
            'password' => bcrypt('password123'),
            'is_active' => true,
        ]);

        $this->get('/login?intended=/app/questions');

        $this->post('/login', [
            'email' => 'guru-intended@test.com',
            'password' => 'password123',
        ])->assertRedirect('/app/questions');
    }

    public function test_spa_shell_exposes_authenticated_user_bootstrap(): void
    {
        $user = User::factory()->create([
            'name' => 'Admin Bootstrap',
            'email' => 'bootstrap@test.com',
            'role' => 'admin',
            'is_active' => true,
        ]);

        $this->actingAs($user)
            ->get('/app/dashboard')
            ->assertOk()
            ->assertSee('window.__BOOTSTRAP__', false)
            ->assertSee('bootstrap@test.com', false);
    }

    public function test_share_detail_is_restricted_to_participants(): void
    {
        $guruA = User::factory()->create();
        $guruB = User::factory()->create();
        $outsider = User::factory()->create();

        $kko = KkoMaster::create(['level' => 'L1', 'verb' => 'Menguji', 'description' => 'test']);
        $subject = Subject::create(['name' => 'Matematika Uji', 'code' => 'MTK']);
        $question = Question::create([
            'subject_id' => $subject->id,
            'kko_id' => $kko->id,
            'created_by' => $guruA->id,
            'jenjang' => 'SMA',
            'curriculum' => 'merdeka',
            'type' => 'pg',
            'level_c' => 'L1',
            'question_text' => 'Soal uji akses share dengan teks yang cukup panjang.',
        ]);

        $share = ShareSoal::create([
            'question_id' => $question->id,
            'shared_by' => $guruA->id,
            'shared_to' => $guruB->id,
            'permission' => 'view',
            'is_accepted' => false,
        ]);

        // Peserta (penerima) lolos guard legacy, lalu diarahkan ke React SPA.
        $this->actingAs($guruB)
            ->get(route('share.detail', ['type' => 'soal', 'id' => $share->id]))
            ->assertRedirect('/app/share');

        // Bukan peserta -> 404 (IDOR tertutup)
        $this->actingAs($outsider)
            ->get(route('share.detail', ['type' => 'soal', 'id' => $share->id]))
            ->assertNotFound();
    }
}
