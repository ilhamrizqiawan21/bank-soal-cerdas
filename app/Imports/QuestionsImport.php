<?php

namespace App\Imports;

use App\Models\Question;
use App\Models\Subject;
use App\Models\KkoMaster;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;
use Illuminate\Support\Facades\Auth;

class QuestionsImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        $subject = Subject::firstOrCreate(['name' => $row['mata_pelajaran']]);
        
        $kko = KkoMaster::where('verb', $row['kko'])->first();
        if (!$kko) {
            throw new \Exception("KKO '{$row['kko']}' tidak ditemukan!");
        }

        return new Question([
            'subject_id' => $subject->id,
            'kko_id' => $kko->id,
            'created_by' => Auth::id(),
            'jenjang' => $row['jenjang'],
            'curriculum' => $row['kurikulum'],
            'type' => $row['tipe_soal'],
            'level_c' => $row['level_kognitif'],
            'question_text' => $row['teks_soal'],
            'indicator_text' => $row['indikator'] ?? null,
            'correct_boolean' => $row['jawaban_benar'] ?? null,
        ]);
    }

    public function rules(): array
    {
        return [
            'mata_pelajaran' => 'required|string',
            'jenjang' => 'required|in:SD,SMP,SMA',
            'kurikulum' => 'required|in:merdeka,kbc,both',
            'tipe_soal' => 'required|in:pg,uraian,menjodohkan,benar_salah',
            'level_kognitif' => 'required|in:C1,C2,C3,C4,C5,C6',
            'kko' => 'required|string',
            'teks_soal' => 'required|string|min:10',
        ];
    }
}