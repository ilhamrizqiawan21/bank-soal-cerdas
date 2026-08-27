<?php

namespace Tests\Feature;

use App\Models\KkoMaster;
use App\Models\PaketSoal;
use App\Models\Question;
use App\Models\QuestionPgOption;
use App\Models\Subject;
use App\Models\Ujian;
use App\Models\UjianJawaban;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BackendApiContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_paket_soal_api_crud_and_duplicate_use_contract_shape(): void
    {
        $guru = User::factory()->create(['role' => 'guru']);
        $question = $this->createQuestionFor($guru);

        $paketId = $this->actingAs($guru)
            ->postJson('/api/paket-soal', [
                'name' => 'Paket Aljabar',
                'description' => 'Paket latihan aljabar.',
                'jenjang' => 'SMA',
                'curriculum' => 'merdeka',
                'duration_minutes' => 60,
                'acak_soal' => true,
                'acak_pilihan' => false,
                'status' => 'published',
                'questions' => [$question->id],
                'scores' => [5],
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Paket Aljabar')
            ->assertJsonPath('data.items.0.score', 5)
            ->json('data.id');

        $this->actingAs($guru)
            ->getJson('/api/paket-soal?per_page=10')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'name', 'items']],
                'meta' => ['current_page', 'per_page', 'total'],
                'links' => ['first', 'last', 'prev', 'next'],
            ]);

        $this->actingAs($guru)
            ->putJson("/api/paket-soal/{$paketId}", [
                'name' => 'Paket Aljabar Update',
                'description' => null,
                'jenjang' => 'SMA',
                'curriculum' => 'both',
                'duration_minutes' => 45,
                'status' => 'draft',
                'questions' => [$question->id],
                'scores' => [10],
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Paket Aljabar Update')
            ->assertJsonPath('data.items.0.score', 10);

        $duplicateId = $this->actingAs($guru)
            ->postJson("/api/paket-soal/{$paketId}/duplicate")
            ->assertCreated()
            ->assertJsonPath('data.status', 'draft')
            ->json('data.id');

        $this->assertNotSame($paketId, $duplicateId);

        $this->actingAs($guru)
            ->deleteJson("/api/paket-soal/{$paketId}")
            ->assertOk()
            ->assertJson(['data' => null]);
    }

    public function test_paket_soal_api_supports_react_list_filters(): void
    {
        $guru = User::factory()->create(['role' => 'guru']);
        $question = $this->createQuestionFor($guru);

        $matching = PaketSoal::create([
            'name' => 'Paket Sumatif Matematika',
            'description' => 'Latihan fungsi kuadrat.',
            'jenjang' => 'SMA',
            'curriculum' => 'merdeka',
            'duration_minutes' => 90,
            'status' => 'published',
            'created_by' => $guru->id,
            'total_soal' => 1,
        ]);
        $matching->items()->create([
            'question_id' => $question->id,
            'order' => 1,
            'score' => 10,
        ]);

        PaketSoal::create([
            'name' => 'Paket Draft IPA',
            'description' => 'Materi campuran.',
            'jenjang' => 'SMP',
            'curriculum' => 'kbc',
            'duration_minutes' => 60,
            'status' => 'draft',
            'created_by' => $guru->id,
            'total_soal' => 0,
        ]);

        $this->actingAs($guru)
            ->getJson('/api/paket-soal?search=sumatif&jenjang=SMA&curriculum=merdeka&status=published&per_page=9')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $matching->id)
            ->assertJsonPath('meta.per_page', 9);
    }

    public function test_ujian_api_management_and_student_submission_contract(): void
    {
        $guru = User::factory()->create(['role' => 'guru']);
        $siswa = User::factory()->create(['role' => 'siswa', 'is_active' => true]);
        $question = $this->createQuestionFor($guru);
        $option = QuestionPgOption::create([
            'question_id' => $question->id,
            'label' => 'A',
            'option_text' => 'Empat',
            'is_correct' => true,
        ]);
        QuestionPgOption::create([
            'question_id' => $question->id,
            'label' => 'B',
            'option_text' => 'Lima',
            'is_correct' => false,
        ]);
        $paket = $this->createPaketFor($guru, $question);

        $ujianId = $this->actingAs($guru)
            ->postJson('/api/ujian', [
                'paket_soal_id' => $paket->id,
                'siswa_id' => $siswa->id,
                'title' => 'Ujian Aljabar',
                'description' => 'Ujian kontrak API.',
                'duration_minutes' => 30,
            ])
            ->assertCreated()
            ->assertJsonPath('data.title', 'Ujian Aljabar')
            ->json('data.id');

        $this->actingAs($guru)
            ->getJson('/api/ujian')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'title', 'paket_soal', 'siswa']],
                'meta' => ['current_page', 'per_page', 'total'],
                'links' => ['first', 'last', 'prev', 'next'],
            ]);

        $this->actingAs($guru)
            ->postJson("/api/ujian/{$ujianId}/publish")
            ->assertOk()
            ->assertJsonPath('data.status', 'active');

        $this->actingAs($siswa)
            ->getJson('/api/ujian-saya')
            ->assertOk()
            ->assertJsonCount(1, 'data');

        $this->actingAs($siswa)
            ->getJson("/api/ujian/{$ujianId}")
            ->assertOk()
            ->assertJsonPath('data.jawaban.0.question.pg_options.0.id', $option->id);

        $this->actingAs($siswa)
            ->postJson("/api/ujian/{$ujianId}/jawaban", [
                'jawaban' => [
                    $question->id => ['selected_option_id' => $option->id],
                ],
            ])
            ->assertOk()
            ->assertJsonPath('data.jawaban.0.selected_option_id', $option->id);

        $this->actingAs($siswa)
            ->postJson("/api/ujian/{$ujianId}/submit")
            ->assertOk()
            ->assertJsonPath('data.status', 'finished')
            ->assertJsonPath('data.total_score', 5);
    }

    public function test_share_and_analisis_api_are_policy_scoped(): void
    {
        $owner = User::factory()->create(['role' => 'guru']);
        $recipient = User::factory()->create(['role' => 'guru']);
        $outsider = User::factory()->create(['role' => 'guru']);
        $question = $this->createQuestionFor($owner);
        $paket = $this->createPaketFor($owner, $question);

        $shareKey = $this->actingAs($owner)
            ->postJson('/api/share', [
                'resource_type' => 'paket',
                'resource_id' => $paket->id,
                'shared_to' => $recipient->id,
                'permission' => 'view',
                'note' => 'Silakan cek paket ini.',
            ])
            ->assertCreated()
            ->assertJsonPath('data.resource_type', 'paket')
            ->json('data.share_key');

        $this->actingAs($recipient)
            ->postJson("/api/share/{$shareKey}/accept")
            ->assertOk()
            ->assertJsonPath('data.is_accepted', true);

        $this->actingAs($recipient)
            ->postJson("/api/share/{$shareKey}/notes", [
                'text' => 'Saya sudah telaah paket ini.',
            ])
            ->assertCreated()
            ->assertJsonPath('data.note.text', 'Saya sudah telaah paket ini.')
            ->assertJsonPath('data.share.notes.0.user_id', (string) $recipient->id);

        $this->actingAs($recipient)
            ->getJson('/api/share')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.notes.0.text', 'Saya sudah telaah paket ini.');

        $this->actingAs($outsider)
            ->getJson('/api/share')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $siswa = User::factory()->create(['role' => 'siswa', 'is_active' => true]);
        $ujian = Ujian::create([
            'paket_soal_id' => $paket->id,
            'siswa_id' => $siswa->id,
            'created_by' => $owner->id,
            'title' => 'Ujian Privat',
            'duration_minutes' => 30,
            'total_soal' => 1,
            'status' => 'finished',
            'total_score' => 5,
        ]);
        $paketItem = $paket->items()->first();
        UjianJawaban::create([
            'ujian_id' => $ujian->id,
            'question_id' => $question->id,
            'paket_soal_item_id' => $paketItem->id,
            'jawaban' => 'A',
            'selected_option' => 0,
            'is_correct' => true,
            'score' => 5,
            'max_score' => 5,
        ]);

        $this->actingAs($owner)
            ->getJson('/api/analisis')
            ->assertOk()
            ->assertJsonPath('data.summary.total_ujian', 1);

        $this->actingAs($owner)
            ->getJson("/api/analisis/ujian/{$ujian->id}")
            ->assertOk()
            ->assertJsonPath('data.ujian.id', $ujian->id)
            ->assertJsonPath('data.soal_stats.0.correct', 1);

        $this->actingAs($owner)
            ->getJson("/api/analisis/siswa/{$siswa->id}")
            ->assertOk()
            ->assertJsonPath('data.siswa.id', $siswa->id)
            ->assertJsonPath('data.stats.total_ujian_selesai', 1);

        $export = $this->actingAs($owner)->get('/api/analisis/export');
        $export->assertOk();
        $export->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('Ujian Privat', $export->streamedContent());

        $this->actingAs($outsider)
            ->getJson('/api/analisis')
            ->assertOk()
            ->assertJsonPath('data.summary.total_ujian', 0);
    }

    public function test_users_api_is_admin_crud_and_options_feed_for_react(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $guru = User::factory()->create(['role' => 'guru']);

        $createdId = $this->actingAs($admin)
            ->postJson('/api/users', [
                'name' => 'Siswa API',
                'email' => 'siswa.api@example.test',
                'password' => 'password123',
                'password_confirmation' => 'password123',
                'role' => 'siswa',
                'nip' => '00998877',
                'is_active' => true,
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'Siswa API')
            ->assertJsonPath('data.nip', '00998877')
            ->assertJsonMissingPath('data.password')
            ->json('data.id');

        $this->actingAs($guru)
            ->getJson('/api/users/options?roles=admin,guru,siswa')
            ->assertOk()
            ->assertJsonFragment(['email' => 'siswa.api@example.test']);

        $this->actingAs($guru)
            ->getJson('/api/users')
            ->assertForbidden();

        $this->actingAs($admin)
            ->putJson("/api/users/{$createdId}", [
                'name' => 'Siswa API Updated',
                'email' => 'siswa.updated@example.test',
                'role' => 'siswa',
                'nip' => '00998877',
                'is_active' => true,
            ])
            ->assertOk()
            ->assertJsonPath('data.name', 'Siswa API Updated');

        $this->actingAs($admin)
            ->postJson("/api/users/{$createdId}/toggle-status")
            ->assertOk()
            ->assertJsonPath('data.is_active', false);

        $this->actingAs($admin)
            ->deleteJson("/api/users/{$createdId}")
            ->assertOk()
            ->assertJson(['data' => null]);

        $this->actingAs($admin)
            ->deleteJson("/api/users/{$admin->id}")
            ->assertStatus(422);
    }

    public function test_dashboard_api_is_role_and_policy_scoped(): void
    {
        $owner = User::factory()->create(['role' => 'guru']);
        $outsider = User::factory()->create(['role' => 'guru']);
        $siswa = User::factory()->create(['role' => 'siswa', 'is_active' => true]);
        $otherSiswa = User::factory()->create(['role' => 'siswa', 'is_active' => true]);
        $question = $this->createQuestionFor($owner);
        $paket = $this->createPaketFor($owner, $question);

        Ujian::create([
            'paket_soal_id' => $paket->id,
            'siswa_id' => $siswa->id,
            'created_by' => $owner->id,
            'title' => 'Ujian Dashboard Owner',
            'duration_minutes' => 30,
            'total_soal' => 1,
            'status' => 'active',
            'started_at' => now(),
        ]);

        Ujian::create([
            'paket_soal_id' => $paket->id,
            'siswa_id' => $otherSiswa->id,
            'created_by' => $owner->id,
            'title' => 'Ujian Dashboard Siswa Lain',
            'duration_minutes' => 30,
            'total_soal' => 1,
            'status' => 'active',
            'started_at' => now(),
        ]);

        $this->actingAs($owner)
            ->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('data.role', 'guru')
            ->assertJsonPath('data.summary.total_soal', 1)
            ->assertJsonPath('data.summary.total_paket', 1)
            ->assertJsonPath('data.summary.total_ujian', 2)
            ->assertJsonCount(1, 'data.recent_questions');

        $this->actingAs($outsider)
            ->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('data.summary.total_soal', 0)
            ->assertJsonPath('data.summary.total_paket', 0)
            ->assertJsonPath('data.summary.total_ujian', 0);

        $this->actingAs($siswa)
            ->getJson('/api/dashboard')
            ->assertOk()
            ->assertJsonPath('data.role', 'siswa')
            ->assertJsonPath('data.summary.total_ujian', 1)
            ->assertJsonPath('data.summary.active_ujian', 1)
            ->assertJsonCount(1, 'data.active_ujian')
            ->assertJsonStructure(['data' => ['active_ujian' => [['deadline_at']]]]);
    }

    private function createQuestionFor(User $user): Question
    {
        $subject = Subject::firstOrCreate(['name' => 'Matematika'], ['code' => 'MTK']);
        $kko = KkoMaster::firstOrCreate(
            ['level' => 'L1', 'verb' => 'Mengingat'],
            ['bloom_level' => 'C1', 'description' => 'test']
        );

        return Question::create([
            'subject_id' => $subject->id,
            'kko_id' => $kko->id,
            'created_by' => $user->id,
            'jenjang' => 'SMA',
            'curriculum' => 'merdeka',
            'type' => 'pg',
            'level_c' => 'L1',
            'question_text' => 'Berapa hasil dua tambah dua?',
            'indicator_text' => 'Menghitung operasi dasar',
        ]);
    }

    private function createPaketFor(User $user, Question $question): PaketSoal
    {
        $paket = PaketSoal::create([
            'name' => 'Paket API',
            'description' => 'Paket untuk test API.',
            'jenjang' => 'SMA',
            'curriculum' => 'merdeka',
            'duration_minutes' => 30,
            'created_by' => $user->id,
            'status' => 'published',
            'total_soal' => 1,
        ]);

        $paket->items()->create([
            'question_id' => $question->id,
            'order' => 1,
            'score' => 5,
        ]);

        return $paket;
    }
}
