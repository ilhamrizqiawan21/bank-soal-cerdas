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

    private function createActiveUjian(): array
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
        $question->pgOptions()->createMany([
            ['label' => 'A', 'option_text' => 'Tiga', 'is_correct' => false],
            ['label' => 'B', 'option_text' => 'Empat', 'is_correct' => true],
        ]);

        $paket = PaketSoal::create([
            'name' => 'Paket Uji',
            'jenjang' => 'SMA',
            'curriculum' => 'merdeka',
            'status' => 'published',
            'created_by' => $guru->id,
            'total_soal' => 1,
        ]);
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

        return [$ujian, $siswa, $siswaLain, $question];
    }

    public function test_siswa_pemilik_dapat_membuka_halaman_kerjakan(): void
    {
        [$ujian, $siswa] = $this->createActiveUjian();

        $this->actingAs($siswa)
            ->get(route('ujian.kerjakan', $ujian->id))
            ->assertOk()
            ->assertSee('window.__ujianData')
            ->assertDontSee('is_correct');
    }

    public function test_siswa_lain_tidak_bisa_membuka_ujian_orang_lain(): void
    {
        [$ujian, , $siswaLain] = $this->createActiveUjian();

        $this->actingAs($siswaLain)
            ->get(route('ujian.kerjakan', $ujian->id))
            ->assertNotFound();
    }

    public function test_submit_jawaban_memvalidasi_payload(): void
    {
        [$ujian, $siswa, , $question] = $this->createActiveUjian();

        // Tanpa jawaban -> validasi gagal, redirect kembali dengan error
        $this->actingAs($siswa)
            ->post(route('ujian.jawaban', $ujian->id), [])
            ->assertStatus(302)
            ->assertSessionHasErrors('jawaban');

        // Kunjungi halaman dulu agar baris jawaban dibuat, lalu kirim jawaban valid
        $this->actingAs($siswa)->get(route('ujian.kerjakan', $ujian->id));

        $this->actingAs($siswa)
            ->post(route('ujian.jawaban', $ujian->id), [
                'jawaban' => [
                    (string) $question->id => ['selected_option' => 1, 'jawaban' => ''],
                ],
            ])
            ->assertOk();

        $this->assertDatabaseHas('ujian_jawaban', [
            'ujian_id' => $ujian->id,
            'question_id' => $question->id,
            'selected_option' => 1,
        ]);
    }
}
