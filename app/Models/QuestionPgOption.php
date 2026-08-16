<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionPgOption extends Model
{
    protected $fillable = ['question_id', 'label', 'option_text', 'is_correct'];
    
    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}