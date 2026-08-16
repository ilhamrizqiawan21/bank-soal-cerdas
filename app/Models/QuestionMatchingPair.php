<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuestionMatchingPair extends Model
{
    protected $fillable = ['question_id', 'pair_order', 'left_text', 'right_text'];
    
    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}