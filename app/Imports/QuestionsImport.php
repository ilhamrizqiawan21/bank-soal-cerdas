<?php

namespace App\Imports;

use App\Models\KkoMaster;
use App\Models\Question;
use App\Models\Subject;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithLimit;
use Maatwebsite\Excel\Concerns\WithValidation;

class QuestionsImport implements ToModel, WithHeadingRow, WithLimit, WithValidation
{
    private const MAX_ROWS = 1000;

    public function model(array $row): Model|array|null
    {
        $subject = Subject::firstOrCreate(['name' => $row['mata_pelajaran']]);
        $level = strtoupper(trim($row['level_kognitif']));
        $kko = KkoMaster::where('level', $level)->where('verb', $row['kko'])->first();
        if (! $kko) {
            throw new \Exception("KKO '{$row['kko']}' tidak ditemukan pada level {$level}!");
        }
        $type = $row['tipe_soal'];

        if ($type === 'pg') {
            $filled = collect(range('a', 'e'))->filter(fn ($label) => ! empty($row["opsi_{$label}"] ?? null))->count();
            $correctLabel = strtolower((string) ($row['jawaban_pg'] ?? ''));

            if ($filled < 4 || empty($row['jawaban_pg'] ?? null) || empty($row["opsi_{$correctLabel}"] ?? null)) {
                throw new \Exception("Soal PG harus memiliki minimal 4 opsi dan kunci valid: {$row['teks_soal']}");
            }
        } elseif ($type === 'benar_salah' && empty($this->jawabanBenarSalah($row))) {
            throw new \Exception("Soal Benar/Salah wajib memiliki jawaban: {$row['teks_soal']}");
        }

        $question = new Question([
            'subject_id' => $subject->id, 'kko_id' => $kko->id, 'created_by' => Auth::id(),
            'jenjang' => $row['jenjang'], 'curriculum' => $row['kurikulum'], 'type' => $type, 'level_c' => $level,
            'question_text' => $row['teks_soal'], 'indicator_text' => $row['indikator'] ?? null,
            'correct_boolean' => $type === 'benar_salah' ? ($this->jawabanBenarSalah($row) === 'Benar') : null,
        ]);
        $question->save();

        if ($type === 'pg') {
            foreach (['A', 'B', 'C', 'D', 'E'] as $label) {
                $text = $row['opsi_'.strtolower($label)] ?? null;
                if (! empty($text)) {
                    $question->pgOptions()->create(['label' => $label, 'option_text' => $text, 'is_correct' => $label === strtoupper($row['jawaban_pg'])]);
                }
            }
        } elseif ($type === 'uraian' && ! empty($row['rubrik_uraian'] ?? null)) {
            $question->essayRubric()->create(['rubric_text' => $row['rubrik_uraian']]);
        } elseif ($type === 'menjodohkan') {
            for ($i = 1; $i <= 10; $i++) {
                $left = $row['pasangan_kiri_'.$i] ?? null;
                $right = $row['pasangan_kanan_'.$i] ?? null;
                if (! empty($left)) {
                    $question->matchingPairs()->create(['pair_order' => $i, 'left_text' => $left, 'right_text' => $right ?? '']);
                }
            }
        }

        return $question;
    }

    public function limit(): int
    {
        return self::MAX_ROWS + 1;
    }

    public function rules(): array
    {
        $rules = [
            'mata_pelajaran' => 'required|string',
            'jenjang' => 'required|in:SD,SMP,SMA',
            'kurikulum' => 'required|in:merdeka,kbc,both',
            'tipe_soal' => 'required|in:pg,uraian,menjodohkan,benar_salah',
            'level_kognitif' => 'required|in:L1,L2,L3',
            'kko' => 'required|string',
            'teks_soal' => 'required|string|min:10',
            'indikator' => 'nullable|max:1000',
            'opsi_a' => 'nullable|max:500',
            'opsi_b' => 'nullable|max:500',
            'opsi_c' => 'nullable|max:500',
            'opsi_d' => 'nullable|max:500',
            'opsi_e' => 'nullable|max:500',
            'jawaban_pg' => 'nullable|in:A,B,C,D,E',
            'jawaban_benarsalah' => 'nullable|in:Benar,Salah',
            'jawaban_benar_salah' => 'nullable|in:Benar,Salah',
            'rubrik_uraian' => 'nullable|max:5000',
        ];
        for ($i = 1; $i <= 10; $i++) {
            $rules["pasangan_kiri_{$i}"] = 'nullable|max:500';
            $rules["pasangan_kanan_{$i}"] = 'nullable|max:500';
        }

        return $rules;
    }

    private function jawabanBenarSalah(array $row): ?string
    {
        return $row['jawaban_benarsalah'] ?? $row['jawaban_benar_salah'] ?? null;
    }
}
