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

    // ============ RELASI KATEGORI & TAG ============

    public function kategori()
    {
        return $this->belongsToMany(Kategori::class, 'question_kategori');
    }

    public function tags()
    {
        return $this->belongsToMany(Tag::class, 'question_tag');
    }

    // ============ RELASI SHARE ============

    public function shares()
    {
        return $this->hasMany(ShareSoal::class);
    }
}