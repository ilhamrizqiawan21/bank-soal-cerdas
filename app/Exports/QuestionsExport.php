<?php

namespace App\Exports;

use App\Models\Question;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class QuestionsExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection(): \Illuminate\Support\Enumerable
    {
        return Question::with(['subject', 'kko'])->get();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Mata Pelajaran',
            'Jenjang',
            'Kurikulum',
            'Tipe Soal',
            'Level Kognitif',
            'KKO',
            'Teks Soal',
            'Indikator Soal',
            'Dibuat Oleh',
            'Dibuat Pada'
        ];
    }

    public function map($question): array
    {
        return [
            $question->id,
            $question->subject->name ?? '-',
            $question->jenjang,
            $question->curriculum_label ?? $question->curriculum,
            $question->type_label ?? $question->type,
            $question->level_c,
            $question->kko->verb ?? '-',
            $question->question_text,
            $question->indicator_text ?? '-',
            $question->creator->name ?? '-',
            $question->created_at->format('d/m/Y H:i'),
        ];
    }
}