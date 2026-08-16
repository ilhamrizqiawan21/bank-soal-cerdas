<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

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
            'jenjang' => 'required|in:SD,SMP,SMA',
            'curriculum' => 'required|in:merdeka,kbc,both',
            'type' => 'required|in:pg,uraian,menjodohkan,benar_salah',
            'level_c' => 'required|in:C1,C2,C3,C4,C5,C6',
            'kko_id' => 'required|exists:kko_master,id',
            'question_text' => 'required|string|min:10',
            'indicator_text' => 'nullable|string',
            'options' => 'required_if:type,pg|array|min:4|max:5',
            'options.*' => 'required|string',
            'correct_option' => 'required_if:type,pg|integer|min:0',
            'rubric_text' => 'required_if:type,uraian|string',
            'left_texts' => 'required_if:type,menjodohkan|array|min:2',
            'left_texts.*' => 'required|string',
            'right_texts' => 'required_if:type,menjodohkan|array|min:2',
            'right_texts.*' => 'required|string',
            'correct_boolean' => 'required_if:type,benar_salah|boolean',
        ];
    }

    public function messages(): array
    {
        return [
            'subject_id.required' => 'Mata pelajaran harus dipilih.',
            'jenjang.required' => 'Jenjang harus dipilih.',
            'curriculum.required' => 'Kurikulum harus dipilih.',
            'type.required' => 'Tipe soal harus dipilih.',
            'level_c.required' => 'Level kognitif harus dipilih.',
            'kko_id.required' => 'KKO harus dipilih.',
            'question_text.required' => 'Teks soal wajib diisi.',
            'question_text.min' => 'Teks soal minimal 10 karakter.',
        ];
    }
}