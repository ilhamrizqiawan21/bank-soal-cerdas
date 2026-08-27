<?php

namespace App\Models;

use App\Support\HtmlSanitizer;
use Illuminate\Database\Eloquent\Model;

class QuestionEssayRubric extends Model
{
    protected $fillable = ['question_id', 'rubric_text'];

    public function setRubricTextAttribute($value): void
    {
        $this->attributes['rubric_text'] = HtmlSanitizer::clean($value);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
