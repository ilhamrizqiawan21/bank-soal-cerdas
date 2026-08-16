<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Builder;

class Question extends Model
{
    use SoftDeletes;
    
    protected $fillable = [
        'subject_id', 'kko_id', 'created_by',
        'jenjang', 'curriculum', 'type', 'level_c',
        'question_text', 'indicator_text', 'correct_boolean'
    ];
    
    protected $appends = ['hots_level', 'curriculum_label', 'type_label'];
    
    // ============ RELATIONS ============
    
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
    
    // ============ SCOPES ============
    
    public function scopeFilter($query, $filters)
    {
        if (isset($filters['curriculum']) && $filters['curriculum'] != 'semua') {
            $query->where('curriculum', $filters['curriculum']);
        }
        if (isset($filters['level_c']) && $filters['level_c'] != 'semua') {
            $query->where('level_c', $filters['level_c']);
        }
        if (isset($filters['type']) && $filters['type'] != 'semua') {
            $query->where('type', $filters['type']);
        }
        if (isset($filters['kko_id']) && $filters['kko_id'] != 'semua') {
            $query->where('kko_id', $filters['kko_id']);
        }
        if (isset($filters['search'])) {
            $query->where('question_text', 'like', "%{$filters['search']}%");
        }
        return $query;
    }
    
    public function scopeByCurriculum($query, $curriculum)
    {
        return $query->where('curriculum', $curriculum);
    }
    
    public function scopeByLevel($query, $level)
    {
        return $query->where('level_c', $level);
    }
    
    public function scopeByType($query, $type)
    {
        return $query->where('type', $type);
    }
    
    public function scopeHOTS($query)
    {
        return $query->whereIn('level_c', ['C4', 'C5', 'C6']);
    }
    
    public function scopeLOTS($query)
    {
        return $query->whereIn('level_c', ['C1', 'C2', 'C3']);
    }
    
    // ============ ACCESSORS ============
    
    public function getHotsLevelAttribute(): string
    {
        return in_array($this->level_c, ['C1', 'C2', 'C3']) ? 'LOTS' : 'HOTS';
    }
    
    public function getCurriculumLabelAttribute(): string
    {
        return match($this->curriculum) {
            'merdeka' => 'Merdeka',
            'kbc' => 'KBC',
            'both' => 'Merdeka & KBC',
            default => 'Unknown'
        };
    }
    
    public function getTypeLabelAttribute(): string
    {
        return match($this->type) {
            'pg' => 'Pilihan Ganda',
            'uraian' => 'Uraian',
            'menjodohkan' => 'Menjodohkan',
            'benar_salah' => 'Benar/Salah',
            default => 'Unknown'
        };
    }
    
    // ============ HELPERS ============
    
    public function getCorrectAnswer()
    {
        switch ($this->type) {
            case 'pg':
                return $this->pgOptions->where('is_correct', true)->first();
            case 'benar_salah':
                return $this->correct_boolean ? 'Benar' : 'Salah';
            case 'uraian':
                return $this->essayRubric->rubric_text ?? null;
            case 'menjodohkan':
                return $this->matchingPairs;
            default:
                return null;
        }
    }
    
    public function hasCorrectAnswer(): bool
    {
        return !is_null($this->getCorrectAnswer());
    }
}