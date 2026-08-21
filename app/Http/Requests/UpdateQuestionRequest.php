<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateQuestionRequest extends FormRequest
{
    public function authorize(): bool { return true; }

    public function rules(): array
    {
        return [
            'subject_id' => 'required|exists:subjects,id',
            'jenjang' => 'required|in:SD,SMP,SMA',
            'curriculum' => 'required|in:merdeka,kbc,both',
            'type' => 'required|in:pg,uraian,menjodohkan,benar_salah',
            'level_c' => 'required|in:L1,L2,L3',
            'kko_id' => 'required|exists:kko_master,id',
            'question_text' => 'required|string|min:10|max:5000',
            'indicator_text' => 'nullable|string|max:1000',
            'options' => 'required_if:type,pg|array|min:4|max:5',
            'options.*' => 'required|string|max:500',
            'correct_option' => 'required_if:type,pg|integer|min:0|max:4',
            'rubric_text' => 'required_if:type,uraian|string|max:5000',
            'left_texts' => 'required_if:type,menjodohkan|array|min:2|max:10',
            'left_texts.*' => 'required|string|max:500',
            'right_texts' => 'required_if:type,menjodohkan|array|min:2|max:10',
            'right_texts.*' => 'required|string|max:500',
            'correct_boolean' => 'required_if:type,benar_salah|boolean',
        ];
    }

    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            if ($this->type === 'pg' && $this->has('options')) {
                if (!isset($this->options[$this->correct_option]) || empty($this->options[$this->correct_option])) {
                    $validator->errors()->add('correct_option', 'Harus ada jawaban benar yang dipilih.');
                }
            }
            if ($this->type === 'menjodohkan' && count($this->left_texts ?? []) !== count($this->right_texts ?? [])) {
                $validator->errors()->add('left_texts', 'Jumlah pernyataan dan pasangan harus sama.');
            }
        });
    }
}
