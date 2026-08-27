<?php

namespace Tests\Feature;

use App\Exports\QuestionsExport;
use App\Models\KkoMaster;
use App\Models\Question;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuestionExportTest extends TestCase
{
    use RefreshDatabase;

    public function test_question_export_route_is_accessible_for_authenticated_user(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)
            ->get(route('questions.export'))
            ->assertOk();
    }

    public function test_question_export_escapes_spreadsheet_formula_cells(): void
    {
        $guru = User::factory()->create(['name' => '@Guru']);
        $subject = Subject::create(['name' => '=Matematika', 'code' => 'MTK']);
        $kko = KkoMaster::create(['level' => 'L1', 'verb' => '+Menguji', 'description' => 'test']);
        $question = Question::create([
            'subject_id' => $subject->id,
            'kko_id' => $kko->id,
            'created_by' => $guru->id,
            'jenjang' => 'SMA',
            'curriculum' => 'merdeka',
            'type' => 'pg',
            'level_c' => 'L1',
            'question_text' => '=SUM(1,1)',
            'indicator_text' => 'Indikator',
        ]);
        $question->pgOptions()->createMany([
            ['label' => 'A', 'option_text' => '-Opsi A', 'is_correct' => true],
            ['label' => 'B', 'option_text' => '@Opsi B', 'is_correct' => false],
            ['label' => 'C', 'option_text' => '+Opsi C', 'is_correct' => false],
            ['label' => 'D', 'option_text' => '=Opsi D', 'is_correct' => false],
        ]);

        $row = (new QuestionsExport($guru))->map(
            $question->load(['subject', 'kko', 'creator', 'pgOptions', 'matchingPairs', 'essayRubric'])
        );

        $this->assertSame("'=Matematika", $row[1]);
        $this->assertSame("'+Menguji", $row[6]);
        $this->assertSame("'=SUM(1,1)", $row[7]);
        $this->assertSame('Indikator', $row[8]);
        $this->assertSame("'-Opsi A", $row[9]);
        $this->assertSame("'@Opsi B", $row[10]);
        $this->assertSame("'+Opsi C", $row[11]);
        $this->assertSame("'=Opsi D", $row[12]);
        $this->assertSame("'@Guru", $row[37]);
    }
}
