<?php

namespace Tests\Feature;

use App\Models\KkoMaster;
use App\Models\Question;
use App\Models\Subject;
use App\Models\Tag;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuestionApiContractTest extends TestCase
{
    use RefreshDatabase;

    public function test_question_api_crud_uses_data_meta_links_shape(): void
    {
        $guru = User::factory()->create(['role' => 'guru']);
        $subject = Subject::create(['name' => 'Matematika', 'code' => 'MTK']);
        $kko = KkoMaster::create(['level' => 'L1', 'verb' => 'Menguji', 'bloom_level' => 'C1', 'description' => 'test']);

        $createdId = $this->actingAs($guru)
            ->postJson('/api/questions', [
                'subject_id' => $subject->id,
                'kko_id' => $kko->id,
                'jenjang' => 'SMA',
                'curriculum' => 'merdeka',
                'type' => 'pg',
                'level_c' => 'L1',
                'question_text' => 'Berapa hasil dua tambah dua?',
                'indicator_text' => 'Menghitung operasi dasar',
                'options' => ['Tiga', 'Empat', 'Lima', 'Enam'],
                'correct_option' => 1,
            ])
            ->assertCreated()
            ->assertJsonPath('data.question_text', 'Berapa hasil dua tambah dua?')
            ->assertJsonCount(4, 'data.pg_options')
            ->json('data.id');

        $this->actingAs($guru)
            ->getJson('/api/questions?per_page=10')
            ->assertOk()
            ->assertJsonStructure([
                'data' => [['id', 'question_text', 'pg_options']],
                'meta' => ['current_page', 'per_page', 'total'],
                'links' => ['first', 'last', 'prev', 'next'],
            ]);

        $this->actingAs($guru)
            ->putJson("/api/questions/{$createdId}", [
                'subject_id' => $subject->id,
                'kko_id' => $kko->id,
                'jenjang' => 'SMA',
                'curriculum' => 'merdeka',
                'type' => 'pg',
                'level_c' => 'L1',
                'question_text' => 'Berapa hasil tiga tambah tiga?',
                'indicator_text' => null,
                'options' => ['Empat', 'Lima', 'Enam', 'Tujuh'],
                'correct_option' => 2,
            ])
            ->assertOk()
            ->assertJsonPath('data.question_text', 'Berapa hasil tiga tambah tiga?');

        $duplicateId = $this->actingAs($guru)
            ->postJson("/api/questions/{$createdId}/duplicate")
            ->assertCreated()
            ->assertJsonPath('data.created_by', $guru->id)
            ->json('data.id');

        $this->assertNotSame($createdId, $duplicateId);

        $this->actingAs($guru)
            ->deleteJson("/api/questions/{$createdId}")
            ->assertOk()
            ->assertJson(['data' => null]);
    }

    public function test_question_api_applies_object_level_policy(): void
    {
        $owner = User::factory()->create(['role' => 'guru']);
        $outsider = User::factory()->create(['role' => 'guru']);
        $question = $this->createQuestionFor($owner);

        $this->actingAs($outsider)
            ->getJson('/api/questions')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->actingAs($outsider)
            ->getJson("/api/questions/{$question->id}")
            ->assertForbidden();

        $this->actingAs($outsider)
            ->postJson("/api/questions/{$question->id}/duplicate")
            ->assertForbidden();
    }

    public function test_question_api_supports_react_list_filters(): void
    {
        $guru = User::factory()->create(['role' => 'guru']);
        $subject = Subject::create(['name' => 'Matematika', 'code' => 'MTK']);
        $kkoC4 = KkoMaster::create(['level' => 'L3', 'verb' => 'Menganalisis', 'bloom_level' => 'C4', 'description' => 'test']);
        $kkoC1 = KkoMaster::create(['level' => 'L1', 'verb' => 'Mengingat', 'bloom_level' => 'C1', 'description' => 'test']);
        $tag = Tag::create(['name' => 'HOTS', 'slug' => 'hots', 'color' => '#f59e0b']);

        $matching = Question::create([
            'subject_id' => $subject->id,
            'kko_id' => $kkoC4->id,
            'created_by' => $guru->id,
            'jenjang' => 'SMA',
            'curriculum' => 'merdeka',
            'type' => 'pg',
            'level_c' => 'L3',
            'question_text' => 'Analisis grafik fungsi kuadrat.',
        ]);
        $matching->tags()->attach($tag->id);

        Question::create([
            'subject_id' => $subject->id,
            'kko_id' => $kkoC1->id,
            'created_by' => $guru->id,
            'jenjang' => 'SMP',
            'curriculum' => 'kbc',
            'type' => 'benar_salah',
            'level_c' => 'L1',
            'question_text' => 'Bilangan genap habis dibagi dua.',
            'correct_boolean' => true,
        ]);

        $this->actingAs($guru)
            ->getJson("/api/questions?jenjang=SMA&bloom_level=C4&tag_id={$tag->id}&per_page=8")
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $matching->id)
            ->assertJsonPath('meta.per_page', 8);
    }

    private function createQuestionFor(User $user): Question
    {
        $subject = Subject::create(['name' => 'IPA', 'code' => 'IPA']);
        $kko = KkoMaster::create(['level' => 'L1', 'verb' => 'Mengingat', 'bloom_level' => 'C1', 'description' => 'test']);

        return Question::create([
            'subject_id' => $subject->id,
            'kko_id' => $kko->id,
            'created_by' => $user->id,
            'jenjang' => 'SMA',
            'curriculum' => 'merdeka',
            'type' => 'benar_salah',
            'level_c' => 'L1',
            'question_text' => 'Air mendidih pada suhu seratus derajat.',
            'correct_boolean' => true,
        ]);
    }
}
