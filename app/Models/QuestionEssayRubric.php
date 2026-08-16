<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionEssayRubric extends Model
{
    protected $fillable = ['question_id', 'rubric_text'];
    
    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}