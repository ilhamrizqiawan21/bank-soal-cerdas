<?php

namespace App\Models;

use App\Support\HtmlSanitizer;
use Illuminate\Database\Eloquent\Model;

class QuestionMatchingPair extends Model
{
    protected $fillable = ['question_id', 'pair_order', 'left_text', 'right_text'];

    public function setLeftTextAttribute($value): void
    {
        $this->attributes['left_text'] = HtmlSanitizer::clean($value);
    }

    public function setRightTextAttribute($value): void
    {
        $this->attributes['right_text'] = HtmlSanitizer::clean($value);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}
