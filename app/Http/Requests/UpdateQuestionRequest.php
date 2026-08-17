<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuestionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subject_id' => 'required|exists:subjects,id',
            'jenjang' => 'required|in:SD,SMP,SMA',
            'curriculum' => 'required|in:merdeka,kbc,both',
            'type' => 'required|in:pg,uraian,menjodohkan,benar_salah',
            'level_c' => 'required|in:C1,C2,C3,C4,C5,C6',
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

    /**
     * Validasi tambahan setelah rules dijalankan (konsisten dengan StoreQuestionRequest).
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
