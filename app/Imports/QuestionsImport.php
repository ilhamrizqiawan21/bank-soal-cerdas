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
    public function model(array $row): \Illuminate\Database\Eloquent\Model|array|null
    {
        $subject = Subject::firstOrCreate(['name' => $row['mata_pelajaran']]);

        $kko = KkoMaster::where('verb', $row['kko'])->first();
        if (!$kko) {
            throw new \Exception("KKO '{$row['kko']}' tidak ditemukan!");
        }

        $type = $row['tipe_soal'];

        // ===== VALIDASI STRUKTURAL PER TIPE =====
        if ($type === 'pg') {
            $filled = collect(range('a', 'e'))->filter(fn ($l) => !empty($row["opsi_{$l}"] ?? null))->count();
            if ($filled < 2) {
                throw new \Exception("Soal PG wajib memiliki minimal 2 opsi: {$row['teks_soal']}");
            }
            if (empty($row['jawaban_pg'] ?? null)) {
                throw new \Exception("Soal PG wajib memiliki kunci jawaban (A-E): {$row['teks_soal']}");
            }
        } elseif ($type === 'benar_salah' && empty($this->jawabanBenarSalah($row))) {
            throw new \Exception("Soal Benar/Salah wajib memiliki jawaban (Benar/Salah): {$row['teks_soal']}");
        } elseif ($type === 'menjodohkan') {
            $hasPair = false;
            foreach (range(1, 10) as $i) {
                if (!empty($row["pasangan_kiri_{$i}"] ?? null) && !empty($row["pasangan_kanan_{$i}"] ?? null)) {
                    $hasPair = true;
                    break;
                }
            }
            if (!$hasPair) {
                throw new \Exception("Soal menjodohkan wajib memiliki minimal 1 pasangan lengkap: {$row['teks_soal']}");
            }
        }

        $question = new Question([
            'subject_id' => $subject->id,
            'kko_id' => $kko->id,
            'created_by' => Auth::id(),
            'jenjang' => $row['jenjang'],
            'curriculum' => $row['kurikulum'],
            'type' => $type,
            'level_c' => $row['level_kognitif'],
            'question_text' => $row['teks_soal'],
            'indicator_text' => $row['indikator'] ?? null,
            'correct_boolean' => $type === 'benar_salah'
                ? ($this->jawabanBenarSalah($row) === 'Benar')
                : null,
        ]);
        $question->save();

        // ===== DETAIL PER TIPE =====
        if ($type === 'pg') {
            $labels = ['A', 'B', 'C', 'D', 'E'];
            foreach ($labels as $label) {
                $text = $row['opsi_' . strtolower($label)] ?? null;
                if (!empty($text)) {
                    $question->pgOptions()->create([
                        'label' => $label,
                        'option_text' => $text,
                        'is_correct' => $label === $row['jawaban_pg'],
                    ]);
                }
            }
        } elseif ($type === 'uraian' && !empty($row['rubrik_uraian'] ?? null)) {
            $question->essayRubric()->create(['rubric_text' => $row['rubrik_uraian']]);
        } elseif ($type === 'menjodohkan') {
            foreach (range(1, 10) as $i) {
                $left = $row['pasangan_kiri_' . $i] ?? null;
                $right = $row['pasangan_kanan_' . $i] ?? null;
                if (!empty($left)) {
                    $question->matchingPairs()->create([
                        'pair_order' => $i,
                        'left_text' => $left,
                        'right_text' => $right ?? '',
                    ]);
                }
            }
        }

        return $question;
    }

    /**
     * Heading 'Jawaban Benar/Salah' di-slug Maatwebsite menjadi
     * 'jawaban_benarsalah' (slash tidak jadi underscore).
     */
    private function jawabanBenarSalah(array $row): ?string
    {
        return $row['jawaban_benarsalah'] ?? $row['jawaban_benar_salah'] ?? null;
    }

    public function rules(): array
    {
        $rules = [
            'mata_pelajaran' => 'required|string',
            'jenjang' => 'required|in:SD,SMP,SMA',
            'kurikulum' => 'required|in:merdeka,kbc,both',
            'tipe_soal' => 'required|in:pg,uraian,menjodohkan,benar_salah',
            'level_kognitif' => 'required|in:C1,C2,C3,C4,C5,C6',
            'kko' => 'required|string',
            'teks_soal' => 'required|string|min:10',
            'indikator' => 'nullable|max:1000',
            // Catatan: kolom teks detail sengaja tanpa rule "string" karena
            // Excel bisa mengubah teks pendek (mis. "3") menjadi angka.
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
}
