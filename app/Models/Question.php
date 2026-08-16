<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Question extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'subject_id', 'kko_id', 'created_by',
        'jenjang', 'curriculum', 'type', 'level_c',
        'question_text', 'indicator_text', 'correct_boolean'
    ];
    
    // Relations
    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
    
    public function kko()
    {
        return $this->belongsTo(KkoMaster::class);
    }
    
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    // Relasi ke tipe soal
    public function pgOptions()
    {
        return $this->hasMany(QuestionPgOption::class);
    }
    
    public function matchingPairs()
    {
        return $this->hasMany(QuestionMatchingPair::class)->orderBy('pair_order');
    }
    
    public function essayRubric()
    {
        return $this->hasOne(QuestionEssayRubric::class);
    }
    
    // Helper attributes
    public function getHotsLevelAttribute()
    {
        return in_array($this->level_c, ['C1', 'C2', 'C3']) ? 'LOTS' : 'HOTS';
    }
    
    public function getCurriculumLabelAttribute()
    {
        return match($this->curriculum) {
            'merdeka' => 'Merdeka',
            'kbc' => 'KBC',
            'both' => 'Merdeka & KBC',
            default => 'Unknown'
        };
    }
}