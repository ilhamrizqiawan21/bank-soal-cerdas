<?php

namespace Tests\Feature;

use App\Imports\QuestionsImport;
use App\Models\KkoMaster;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class QuestionImportHardeningTest extends TestCase
{
    use RefreshDatabase;

    public function test_pg_import_requires_at_least_four_options_and_valid_answer_key(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'guru']));
        $this->createKko();

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Soal PG harus memiliki minimal 4 opsi dan kunci valid');

        (new QuestionsImport)->model([
            'mata_pelajaran' => 'Matematika',
            'jenjang' => 'SMA',
            'kurikulum' => 'merdeka',
            'tipe_soal' => 'pg',
            'level_kognitif' => 'L1',
            'kko' => 'Menguji',
            'teks_soal' => 'Soal PG import minimal opsi.',
            'indikator' => null,
            'opsi_a' => 'A',
            'opsi_b' => 'B',
            'jawaban_pg' => 'A',
        ]);
    }

    public function test_import_transaction_rolls_back_rows_when_later_row_fails(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'guru']));
        $this->createKko();
        $import = new QuestionsImport;

        try {
            DB::transaction(function () use ($import) {
                $import->model($this->validPgRow('Soal valid sebelum row gagal.'));
                $import->model([
                    'mata_pelajaran' => 'Matematika',
                    'jenjang' => 'SMA',
                    'kurikulum' => 'merdeka',
                    'tipe_soal' => 'pg',
                    'level_kognitif' => 'L1',
                    'kko' => 'Menguji',
                    'teks_soal' => 'Soal gagal tanpa empat opsi.',
                    'indikator' => null,
                    'opsi_a' => 'A',
                    'opsi_b' => 'B',
                    'jawaban_pg' => 'A',
                ]);
            });
        } catch (\Exception) {
            // Expected; assertion below proves no partial row remains.
        }

        $this->assertDatabaseCount('questions', 0);
    }

    public function test_import_has_row_limit(): void
    {
        $this->assertSame(1001, (new QuestionsImport)->limit());
    }

    private function createKko(): void
    {
        KkoMaster::create([
            'level' => 'L1',
            'verb' => 'Menguji',
            'description' => 'test',
        ]);
    }

    private function validPgRow(string $text): array
    {
        return [
            'mata_pelajaran' => 'Matematika',
            'jenjang' => 'SMA',
            'kurikulum' => 'merdeka',
            'tipe_soal' => 'pg',
            'level_kognitif' => 'L1',
            'kko' => 'Menguji',
            'teks_soal' => $text,
            'indikator' => null,
            'opsi_a' => 'A',
            'opsi_b' => 'B',
            'opsi_c' => 'C',
            'opsi_d' => 'D',
            'jawaban_pg' => 'A',
        ];
    }
}
