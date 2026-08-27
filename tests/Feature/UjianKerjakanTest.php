<?php

namespace Tests\Feature;

use App\Models\KkoMaster;
use App\Models\PaketSoal;
use App\Models\Question;
use App\Models\Subject;
use App\Models\Ujian;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UjianKerjakanTest extends TestCase
{
    use RefreshDatabase;

    private function createActiveUjian(array $paketOverrides = []): array
    {
        $guru = User::factory()->create();
        $siswa = User::factory()->create(['role' => 'siswa']);
        $siswaLain = User::factory()->create(['role' => 'siswa']);

        $kko = KkoMaster::create(['level' => 'L1', 'verb' => 'Menguji', 'description' => 'test']);
        $subject = Subject::create(['name' => 'Matematika Uji', 'code' => 'MTK']);
        $question = Question::create([
            'subject_id' => $subject->id,
            'kko_id' => $kko->id,
            'created_by' => $guru->id,
            'jenjang' => 'SMA',
            'curriculum' => 'merdeka',
            'type' => 'pg',
            'level_c' => 'L1',
            'question_text' => 'Berapa hasil dua tambah dua? (soal uji otomatis)',
        ]);
        $options = $question->pgOptions()->createMany([
            ['label' => 'A', 'option_text' => 'Tiga', 'is_correct' => false],
            ['label' => 'B', 'option_text' => 'Empat', 'is_correct' => true],
        ]);

        $paket = PaketSoal::create(array_merge([
            'name' => 'Paket Uji',
            'jenjang' => 'SMA',
            'curriculum' => 'merdeka',
            'status' => 'published',
            'created_by' => $guru->id,
            'total_soal' => 1,
        ], $paketOverrides));
        $paket->items()->create(['question_id' => $question->id, 'order' => 1, 'score' => 10]);

        $ujian = Ujian::create([
            'paket_soal_id' => $paket->id,
            'siswa_id' => $siswa->id,
            'created_by' => $guru->id,
            'title' => 'Ujian Uji',
            'total_soal' => 1,
            'status' => 'active',
            'started_at' => now(),
        ]);

        return [$ujian, $siswa, $siswaLain, $question, $options, $guru, $paket];
    }

    public function test_siswa_pemilik_dapat_membuka_halaman_kerjakan(): void
    {
        [$ujian, $siswa] = $this->createActiveUjian();

        $this->actingAs($siswa)
            ->get(route('ujian.kerjakan', $ujian->id))
            ->assertRedirect("/app/ujian/{$ujian->id}/kerjakan");

        $this->actingAs($siswa)
            ->get(route('api.ujian.show', $ujian))
            ->assertOk()
            ->assertJsonMissing(['is_correct' => true]);
    }

    public function test_siswa_lain_tidak_bisa_membuka_ujian_orang_lain(): void
    {
        [$ujian, , $siswaLain] = $this->createActiveUjian();

        $this->actingAs($siswaLain)
            ->get(route('ujian.kerjakan', $ujian->id))
            ->assertForbidden();
    }

    public function test_submit_jawaban_memvalidasi_payload(): void
    {
        [$ujian, $siswa, , $question, $options] = $this->createActiveUjian();
        $correctOption = $options->first(fn ($option) => (bool) $option->is_correct);

        // Tanpa jawaban -> validasi gagal, redirect kembali dengan error
        $this->actingAs($siswa)
            ->withHeaders(['Accept' => 'application/json'])
            ->post("/api/ujian/{$ujian->id}/jawaban", [])
            ->assertStatus(422)
            ->assertJsonValidationErrors('jawaban');

        $this->actingAs($siswa)
            ->withHeaders(['Accept' => 'application/json'])
            ->post("/api/ujian/{$ujian->id}/jawaban", [
                'jawaban' => [
                    (string) $question->id => ['selected_option_id' => $correctOption->id, 'jawaban' => ''],
                ],
            ])
            ->assertOk();

        $this->assertDatabaseHas('ujian_jawaban', [
            'ujian_id' => $ujian->id,
            'question_id' => $question->id,
            'selected_option_id' => $correctOption->id,
            'selected_option' => null,
        ]);
    }

    public function test_pg_acak_pilihan_mengirim_option_id_dan_grading_berdasarkan_id(): void
    {
        [$ujian, $siswa, , $question, $options] = $this->createActiveUjian(['acak_pilihan' => true]);
        $correctOption = $options->first(fn ($option) => (bool) $option->is_correct);

        $this->actingAs($siswa)
            ->get(route('api.ujian.show', $ujian))
            ->assertOk()
            ->assertJsonFragment(['id' => $correctOption->id])
            ->assertJsonMissing(['is_correct' => true]);

        $this->actingAs($siswa)
            ->withHeaders(['Accept' => 'application/json'])
            ->post("/api/ujian/{$ujian->id}/jawaban", [
                'jawaban' => [
                    (string) $question->id => ['selected_option_id' => $correctOption->id, 'jawaban' => ''],
                ],
            ])
            ->assertOk();

        $this->actingAs($siswa)
            ->withHeaders(['Accept' => 'application/json'])
            ->post("/api/ujian/{$ujian->id}/submit")
            ->assertOk();

        $this->assertDatabaseHas('ujian_jawaban', [
            'ujian_id' => $ujian->id,
            'question_id' => $question->id,
            'selected_option_id' => $correctOption->id,
            'is_correct' => true,
            'score' => 10,
        ]);
        $this->assertDatabaseHas('ujian', [
            'id' => $ujian->id,
            'status' => 'finished',
            'total_score' => 10,
        ]);
    }

    public function test_publish_hanya_bisa_dari_status_draft(): void
    {
        [$ujian, , , , , $guru] = $this->createActiveUjian();
        $ujian->update(['status' => 'finished', 'started_at' => now()->subHour()]);
        $startedAt = $ujian->started_at;

        $this->actingAs($guru)
            ->from(route('ujian.show', $ujian))
            ->post(route('ujian.publish', $ujian))
            ->assertRedirect(route('ujian.show', $ujian))
            ->assertSessionHas('error', 'Ujian hanya bisa dipublikasikan dari status draft.');

        $ujian->refresh();
        $this->assertSame('finished', $ujian->status);
        $this->assertTrue($ujian->started_at->equalTo($startedAt));
    }
}
