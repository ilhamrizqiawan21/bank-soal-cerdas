<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject_id' => 'required|exists:subjects,id',
            'jenjang' => ['required', Rule::in(['SD', 'SMP', 'SMA'])],
            'curriculum' => ['required', Rule::in(['merdeka', 'kbc', 'both'])],
            'type' => ['required', Rule::in(['pg', 'uraian', 'menjodohkan', 'benar_salah'])],
            'level_c' => ['required', Rule::in(['C1', 'C2', 'C3', 'C4', 'C5', 'C6'])],
            'kko_id' => 'required|exists:kko_master,id',
            'question_text' => 'required|string|min:10|max:5000',
            'indicator_text' => 'nullable|string|max:1000',
            
            // PG
            'options' => 'required_if:type,pg|array|min:4|max:5',
            'options.*' => 'required|string|max:500',
            'correct_option' => 'required_if:type,pg|integer|min:0|max:4',
            
            // Uraian
            'rubric_text' => 'required_if:type,uraian|string|max:5000',
            
            // Menjodohkan
            'left_texts' => 'required_if:type,menjodohkan|array|min:2|max:10',
            'left_texts.*' => 'required|string|max:500',
            'right_texts' => 'required_if:type,menjodohkan|array|min:2|max:10',
            'right_texts.*' => 'required|string|max:500',
            
            // Benar/Salah
            'correct_boolean' => 'required_if:type,benar_salah|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'subject_id.required' => 'Mata pelajaran harus dipilih.',
            'subject_id.exists' => 'Mata pelajaran tidak valid.',
            'jenjang.required' => 'Jenjang harus dipilih.',
            'jenjang.in' => 'Jenjang tidak valid.',
            'curriculum.required' => 'Kurikulum harus dipilih.',
            'curriculum.in' => 'Kurikulum tidak valid.',
            'type.required' => 'Tipe soal harus dipilih.',
            'type.in' => 'Tipe soal tidak valid.',
            'level_c.required' => 'Level kognitif harus dipilih.',
            'level_c.in' => 'Level kognitif tidak valid.',
            'kko_id.required' => 'KKO harus dipilih.',
            'kko_id.exists' => 'KKO tidak valid.',
            'question_text.required' => 'Teks soal wajib diisi.',
            'question_text.min' => 'Teks soal minimal 10 karakter.',
            'question_text.max' => 'Teks soal maksimal 5000 karakter.',
            'options.required_if' => 'Pilihan ganda wajib diisi minimal 4 opsi.',
            'options.min' => 'Pilihan ganda minimal 4 opsi.',
            'options.max' => 'Pilihan ganda maksimal 5 opsi.',
            'options.*.required' => 'Semua opsi wajib diisi.',
            'correct_option.required_if' => 'Jawaban benar harus dipilih.',
            'rubric_text.required_if' => 'Rubrik penilaian wajib diisi.',
            'left_texts.required_if' => 'Pernyataan menjodohkan wajib diisi minimal 2.',
            'left_texts.min' => 'Pernyataan menjodohkan minimal 2.',
            'right_texts.required_if' => 'Pasangan menjodohkan wajib diisi.',
            'left_texts.*.required' => 'Semua pernyataan wajib diisi.',
            'right_texts.*.required' => 'Semua pasangan wajib diisi.',
            'correct_boolean.required_if' => 'Jawaban benar/salah harus dipilih.',
            'correct_boolean.boolean' => 'Jawaban benar/salah tidak valid.',
        ];
    }

    /**
     * Validasi tambahan setelah rules dijalankan
     */
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            // Cek PG: harus ada minimal 1 jawaban benar
            if ($this->type == 'pg' && $this->has('options')) {
                $hasCorrect = false;
                foreach ($this->options as $index => $option) {
                    if ($index == $this->correct_option && !empty($option)) {
                        $hasCorrect = true;
                        break;
                    }
                }
                if (!$hasCorrect) {
                    $validator->errors()->add('correct_option', 'Harus ada minimal 1 jawaban benar yang dipilih.');
                }
            }
            
            // Cek Menjodohkan: jumlah left dan right harus sama
            if ($this->type == 'menjodohkan') {
                $leftCount = count($this->left_texts ?? []);
                $rightCount = count($this->right_texts ?? []);
                if ($leftCount !== $rightCount) {
                    $validator->errors()->add('left_texts', 'Jumlah pernyataan dan pasangan harus sama.');
                }
            }
        });
    }
}