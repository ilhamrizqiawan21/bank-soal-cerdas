<?php

namespace Tests\Feature;

use App\Models\KkoMaster;
use App\Models\PaketSoal;
use App\Models\Question;
use App\Models\SharePaket;
use App\Models\ShareSoal;
use App\Models\Subject;
use App\Models\Ujian;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BackendP0SecurityTest extends TestCase
{
    use RefreshDatabase;

    private Subject $subject;

    private KkoMaster $kko;

    protected function setUp(): void
    {
        parent::setUp();

        $this->subject = Subject::create(['name' => 'Matematika Security', 'code' => 'MTK']);
        $this->kko = KkoMaster::create([
            'level' => 'L1',
            'bloom_level' => 'C1',
            'verb' => 'Menguji',
            'description' => 'Security test',
        ]);
    }

    public function test_guru_cannot_access_private_question_owned_by_other_guru(): void
    {
        $owner = User::factory()->create();
        $outsider = User::factory()->create();
        $question = $this->createQuestion($owner, 'Soal privat milik guru A yang tidak boleh terlihat.');

        $this->actingAs($outsider)
            ->get(route('questions.index'))
            ->assertRedirect('/app/questions');

        $this->actingAs($outsider)
            ->get(route('api.questions.index'))
            ->assertOk()
            ->assertDontSee('Soal privat milik guru A');

        $this->actingAs($outsider)->get(route('questions.show', $question))->assertForbidden();
        $this->actingAs($outsider)->get(route('questions.edit', $question))->assertForbidden();
        $this->actingAs($outsider)->delete(route('questions.destroy', $question))->assertForbidden();
        $this->actingAs($outsider)->post(route('questions.duplicate', $question))->assertForbidden();
    }

    public function test_guru_can_view_but_not_edit_question_shared_as_view_only(): void
    {
        $owner = User::factory()->create();
        $receiver = User::factory()->create();
        $question = $this->createQuestion($owner, 'Soal shared view only untuk guru penerima.');

        ShareSoal::create([
            'question_id' => $question->id,
            'shared_by' => $owner->id,
            'shared_to' => $receiver->id,
            'permission' => 'view',
            'is_accepted' => true,
        ]);

        $this->actingAs($receiver)
            ->get(route('questions.index'))
            ->assertRedirect('/app/questions');

        $this->actingAs($receiver)
            ->get(route('api.questions.index'))
            ->assertOk()
            ->assertSee('Soal shared view only');

        $this->actingAs($receiver)->get(route('questions.show', $question))->assertRedirect("/app/questions/{$question->id}");
        $this->actingAs($receiver)->get(route('api.questions.show', $question))->assertOk();
        $this->actingAs($receiver)->get(route('questions.edit', $question))->assertForbidden();
        $this->actingAs($receiver)->delete(route('questions.destroy', $question))->assertForbidden();
        $this->actingAs($receiver)->post(route('questions.duplicate', $question))->assertForbidden();
    }

    public function test_question_export_is_scoped_to_current_guru(): void
    {
        $owner = User::factory()->create();
        $outsider = User::factory()->create();

        $this->createQuestion($owner, 'Soal export milik owner.');
        $this->createQuestion($outsider, 'Soal export milik outsider.');

        $response = $this->actingAs($outsider)->get(route('questions.export'));

        $response->assertOk();
        $this->assertDatabaseCount('questions', 2);
    }

    public function test_guru_cannot_access_private_paket_owned_by_other_guru(): void
    {
        $owner = User::factory()->create();
        $outsider = User::factory()->create();
        $paket = $this->createPaket($owner, 'Paket privat milik guru A');

        $this->actingAs($outsider)
            ->get(route('paket-soal.index'))
            ->assertRedirect('/app/paket-soal');

        $this->actingAs($outsider)
            ->get(route('api.paket-soal.index'))
            ->assertOk()
            ->assertDontSee('Paket privat milik guru A');

        $this->actingAs($outsider)->get(route('paket-soal.show', $paket))->assertForbidden();
        $this->actingAs($outsider)->get(route('paket-soal.edit', $paket))->assertForbidden();
        $this->actingAs($outsider)->delete(route('paket-soal.destroy', $paket))->assertForbidden();
        $this->actingAs($outsider)->post(route('paket-soal.duplicate', $paket))->assertForbidden();
    }

    public function test_guru_can_view_but_not_edit_paket_shared_as_view_only(): void
    {
        $owner = User::factory()->create();
        $receiver = User::factory()->create();
        $paket = $this->createPaket($owner, 'Paket shared view only');

        SharePaket::create([
            'paket_soal_id' => $paket->id,
            'shared_by' => $owner->id,
            'shared_to' => $receiver->id,
            'permission' => 'view',
            'is_accepted' => true,
        ]);

        $this->actingAs($receiver)
            ->get(route('paket-soal.index'))
            ->assertRedirect('/app/paket-soal');

        $this->actingAs($receiver)
            ->get(route('api.paket-soal.index'))
            ->assertOk()
            ->assertSee('Paket shared view only');

        $this->actingAs($receiver)->get(route('paket-soal.show', $paket))->assertRedirect("/app/paket-soal/{$paket->id}");
        $this->actingAs($receiver)->get(route('api.paket-soal.show', $paket))->assertOk();
        $this->actingAs($receiver)->get(route('paket-soal.edit', $paket))->assertForbidden();
        $this->actingAs($receiver)->delete(route('paket-soal.destroy', $paket))->assertForbidden();
        $this->actingAs($receiver)->post(route('paket-soal.duplicate', $paket))->assertForbidden();
    }

    public function test_guru_cannot_access_ujian_owned_by_other_guru(): void
    {
        $owner = User::factory()->create();
        $outsider = User::factory()->create();
        $ujian = $this->createUjian($owner);

        $this->actingAs($outsider)
            ->get(route('ujian.index'))
            ->assertRedirect('/app/ujian');

        $this->actingAs($outsider)
            ->get(route('api.ujian.index'))
            ->assertOk()
            ->assertDontSee('Ujian privat security');

        $this->actingAs($outsider)->get(route('ujian.show', $ujian))->assertForbidden();
        $this->actingAs($outsider)->get(route('ujian.edit', $ujian))->assertForbidden();
        $this->actingAs($outsider)->delete(route('ujian.destroy', $ujian))->assertForbidden();
        $this->actingAs($outsider)->post(route('ujian.publish', $ujian))->assertForbidden();
        $this->actingAs($outsider)->get(route('analisis.ujian', $ujian->id))->assertForbidden();
    }

    public function test_ujian_update_ignores_unvalidated_sensitive_fields(): void
    {
        $owner = User::factory()->create();
        $attackerTarget = User::factory()->create(['role' => 'siswa']);
        $ujian = $this->createUjian($owner);
        $originalSiswaId = $ujian->siswa_id;

        $this->actingAs($owner)
            ->put(route('ujian.update', $ujian), [
                'title' => 'Judul aman',
                'description' => 'Deskripsi aman',
                'duration_minutes' => 90,
                'status' => 'draft',
                'siswa_id' => $attackerTarget->id,
                'created_by' => $attackerTarget->id,
                'total_score' => 999,
                'submitted_at' => now()->toDateTimeString(),
            ])
            ->assertRedirect(route('ujian.index'));

        $ujian->refresh();

        $this->assertSame('Judul aman', $ujian->title);
        $this->assertSame($originalSiswaId, $ujian->siswa_id);
        $this->assertSame($owner->id, $ujian->created_by);
        $this->assertSame(0, $ujian->total_score);
        $this->assertNull($ujian->submitted_at);
    }

    private function createQuestion(User $owner, string $text): Question
    {
        return Question::create([
            'subject_id' => $this->subject->id,
            'kko_id' => $this->kko->id,
            'created_by' => $owner->id,
            'jenjang' => 'SMA',
            'curriculum' => 'merdeka',
            'type' => 'benar_salah',
            'level_c' => 'L1',
            'question_text' => $text,
            'correct_boolean' => true,
        ]);
    }

    private function createPaket(User $owner, string $name): PaketSoal
    {
        $question = $this->createQuestion($owner, "{$name} - soal pendukung.");

        $paket = PaketSoal::create([
            'name' => $name,
            'description' => 'Paket untuk pengujian security.',
            'jenjang' => 'SMA',
            'curriculum' => 'merdeka',
            'duration_minutes' => 60,
            'created_by' => $owner->id,
            'status' => 'published',
            'total_soal' => 1,
        ]);

        $paket->items()->create([
            'question_id' => $question->id,
            'order' => 1,
            'score' => 10,
        ]);

        return $paket;
    }

    private function createUjian(User $owner): Ujian
    {
        $siswa = User::factory()->create(['role' => 'siswa']);
        $paket = $this->createPaket($owner, 'Paket untuk ujian privat');

        return Ujian::create([
            'paket_soal_id' => $paket->id,
            'siswa_id' => $siswa->id,
            'created_by' => $owner->id,
            'title' => 'Ujian privat security',
            'description' => 'Ujian untuk test IDOR.',
            'duration_minutes' => 60,
            'total_soal' => 1,
            'total_score' => 0,
            'status' => 'draft',
        ]);
    }
}
