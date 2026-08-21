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

    protected $appends = ['hots_level', 'curriculum_label', 'type_label'];

    public function subject() { return $this->belongsTo(Subject::class); }
    public function kko() { return $this->belongsTo(KkoMaster::class); }
    public function creator() { return $this->belongsTo(User::class, 'created_by'); }
    public function pgOptions() { return $this->hasMany(QuestionPgOption::class); }
    public function matchingPairs() { return $this->hasMany(QuestionMatchingPair::class)->orderBy('pair_order'); }
    public function essayRubric() { return $this->hasOne(QuestionEssayRubric::class); }

    public function getHotsLevelAttribute(): string
    {
        return $this->level_c === 'L3' ? 'HOTS' : ($this->level_c === 'L2' ? 'MOTS' : 'LOTS');
    }

    public function getCurriculumLabelAttribute(): string
    {
        return match($this->curriculum) {
            'merdeka' => 'Merdeka', 'kbc' => 'KBC', 'both' => 'Merdeka & KBC', default => 'Unknown'
        };
    }

    public function getTypeLabelAttribute(): string
    {
        return match($this->type) {
            'pg' => 'Pilihan Ganda', 'uraian' => 'Uraian', 'menjodohkan' => 'Menjodohkan', 'benar_salah' => 'Benar/Salah', default => 'Unknown'
        };
    }

    public function getCorrectAnswer()
    {
        return match ($this->type) {
            'pg' => $this->pgOptions->where('is_correct', true)->first(),
            'benar_salah' => $this->correct_boolean ? 'Benar' : 'Salah',
            'uraian' => $this->essayRubric->rubric_text ?? null,
            'menjodohkan' => $this->matchingPairs,
            default => null,
        };
    }

    public function hasCorrectAnswer(): bool { return !is_null($this->getCorrectAnswer()); }
    public function kategori() { return $this->belongsToMany(Kategori::class, 'question_kategori'); }
    public function tags() { return $this->belongsToMany(Tag::class, 'question_tag'); }
    public function shares() { return $this->hasMany(ShareSoal::class); }
}
