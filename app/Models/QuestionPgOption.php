<?php

namespace App\Models;

use App\Support\HtmlSanitizer;
use Illuminate\Database\Eloquent\Model;

class QuestionPgOption extends Model
{
    protected $fillable = ['question_id', 'label', 'option_text', 'is_correct'];

    public function setOptionTextAttribute($value): void
    {
        $this->attributes['option_text'] = HtmlSanitizer::clean($value);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
