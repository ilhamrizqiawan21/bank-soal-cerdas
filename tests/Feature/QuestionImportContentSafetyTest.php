<?php

namespace Tests\Feature;

use App\Imports\QuestionsImport;
use App\Models\KkoMaster;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuestionImportContentSafetyTest extends TestCase
{
    use RefreshDatabase;

    public function test_import_sanitizes_pg_option_html_payloads(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'guru']));
        $this->createKko();

        $question = (new QuestionsImport)->model([
            'mata_pelajaran' => 'Matematika',
            'jenjang' => 'SMA',
            'kurikulum' => 'merdeka',
            'tipe_soal' => 'pg',
            'level_kognitif' => 'L1',
            'kko' => 'Menguji',
            'teks_soal' => 'Pilih jawaban yang paling tepat.',
            'indikator' => null,
            'opsi_a' => '<img src=x onerror="alert(1)">Pilihan A',
            'opsi_b' => '<script>alert(1)</script>Pilihan B',
            'opsi_c' => 'Pilihan C',
            'opsi_d' => 'Pilihan D',
            'jawaban_pg' => 'A',
        ]);

        $optionText = $question->pgOptions()->where('label', 'A')->value('option_text');
        $this->assertStringNotContainsString('onerror', (string) $optionText);
        $this->assertStringNotContainsString('alert', (string) $optionText);
        $this->assertStringContainsString('Pilihan A', (string) $optionText);
    }

    public function test_import_sanitizes_essay_rubric_payloads(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'guru']));
        $this->createKko();

        $question = (new QuestionsImport)->model([
            'mata_pelajaran' => 'Bahasa Indonesia',
            'jenjang' => 'SMA',
            'kurikulum' => 'merdeka',
            'tipe_soal' => 'uraian',
            'level_kognitif' => 'L1',
            'kko' => 'Menguji',
            'teks_soal' => 'Jelaskan isi paragraf berikut dengan tepat.',
            'indikator' => null,
            'rubrik_uraian' => '<p onclick="alert(1)">Rubrik aman</p><script>alert(1)</script>',
        ]);

        $rubricText = $question->essayRubric()->value('rubric_text');
        $this->assertStringNotContainsString('onclick', (string) $rubricText);
        $this->assertStringNotContainsString('script', (string) $rubricText);
        $this->assertStringContainsString('<p>Rubrik aman</p>', (string) $rubricText);
    }

    public function test_import_sanitizes_matching_pair_payloads(): void
    {
        $this->actingAs(User::factory()->create(['role' => 'guru']));
        $this->createKko();

        $question = (new QuestionsImport)->model([
            'mata_pelajaran' => 'IPA',
            'jenjang' => 'SMA',
            'kurikulum' => 'merdeka',
            'tipe_soal' => 'menjodohkan',
            'level_kognitif' => 'L1',
            'kko' => 'Menguji',
            'teks_soal' => 'Jodohkan konsep dengan definisi yang tepat.',
            'indikator' => null,
            'pasangan_kiri_1' => '<svg><script>alert(1)</script></svg><strong>Fotosintesis</strong>',
            'pasangan_kanan_1' => '<a href="javascript:alert(1)">Proses membuat makanan</a>',
        ]);

        $pair = $question->matchingPairs()->first();
        $this->assertStringNotContainsString('<svg', (string) $pair->left_text);
        $this->assertStringNotContainsString('javascript:', (string) $pair->right_text);
        $this->assertStringContainsString('<strong>Fotosintesis</strong>', (string) $pair->left_text);
        $this->assertStringContainsString('<a>Proses membuat makanan</a>', (string) $pair->right_text);
    }

    private function createKko(): void
    {
        KkoMaster::create([
            'level' => 'L1',
            'verb' => 'Menguji',
            'description' => 'test',
        ]);
    }
}
