<?php

namespace App\Exports;

use App\Models\Question;
use App\Models\User;
use App\Policies\QuestionPolicy;
use Illuminate\Support\Enumerable;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class QuestionsExport implements FromCollection, WithHeadings, WithMapping
{
    public function __construct(private readonly User $user) {}

    public function collection(): Enumerable
    {
        return QuestionPolicy::scopeVisibleTo(
            Question::with(['subject', 'kko', 'creator', 'pgOptions', 'matchingPairs', 'essayRubric']),
            $this->user
        )->orderBy('id')->get();
    }

    public function headings(): array
    {
        $headings = [
            'ID', 'Mata Pelajaran', 'Jenjang', 'Kurikulum', 'Tipe Soal', 'Level Kognitif', 'KKO',
            'Teks Soal', 'Indikator',
            'Opsi A', 'Opsi B', 'Opsi C', 'Opsi D', 'Opsi E',
            'Jawaban PG', 'Jawaban Benar/Salah', 'Rubrik Uraian',
        ];

        for ($i = 1; $i <= 10; $i++) {
            $headings[] = "Pasangan Kiri {$i}";
            $headings[] = "Pasangan Kanan {$i}";
        }

        $headings[] = 'Dibuat Oleh';
        $headings[] = 'Dibuat Pada';

        return $headings;
    }

    public function map($question): array
    {
        // Opsi PG urut label (A-E)
        $options = $question->pgOptions->sortBy('label')->values();
        $optionTexts = [];
        foreach (range(0, 4) as $i) {
            $optionTexts[] = $options->get($i)->option_text ?? null;
        }

        $correctOption = $question->pgOptions->firstWhere('is_correct', true);

        // Pasangan menjodohkan (max 10)
        $pairs = [];
        foreach (range(1, 10) as $i) {
            $pair = $question->matchingPairs->get($i - 1);
            $pairs[] = $pair->left_text ?? null;
            $pairs[] = $pair->right_text ?? null;
        }

        return array_map($this->safeCell(...), [
            $question->id,
            $question->subject->name ?? '-',
            $question->jenjang,
            $question->curriculum,
            $question->type,
            $question->level_c,
            $question->kko->verb ?? '-',
            $question->question_text,
            $question->indicator_text ?? '',
            ...$optionTexts,
            $correctOption ? $correctOption->label : '',
            $question->type === 'benar_salah' ? ($question->correct_boolean ? 'Benar' : 'Salah') : '',
            $question->essayRubric->rubric_text ?? '',
            ...$pairs,
            $question->creator->name ?? '-',
            $question->created_at->format('d/m/Y H:i'),
        ]);
    }

    private function safeCell(mixed $value): mixed
    {
        if (! is_string($value) || $value === '') {
            return $value;
        }

        if (preg_match('/^[=\+\-@\t\r\n]/', $value) === 1) {
            return "'{$value}";
        }

        return $value;
    }
}
