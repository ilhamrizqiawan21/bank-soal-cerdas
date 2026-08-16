<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaketSoal extends Model
{
    use SoftDeletes;

    protected $table = 'paket_soal';
    
    protected $fillable = [
        'name', 'description', 'jenjang', 'curriculum',
        'total_soal', 'duration_minutes', 'created_by', 'status'
    ];

    // Relations
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function items()
    {
        return $this->hasMany(PaketSoalItem::class)->orderBy('order');
    }

    public function questions()
    {
        return $this->belongsToMany(Question::class, 'paket_soal_items', 'paket_soal_id', 'question_id')
                    ->withPivot('order', 'score')
                    ->orderBy('order');
    }

    // Accessors
    public function getCurriculumLabelAttribute()
    {
        return match($this->curriculum) {
            'merdeka' => 'Merdeka',
            'kbc' => 'KBC',
            'both' => 'Merdeka & KBC',
            default => 'Unknown'
        };
    }

    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            'draft' => 'Draft',
            'published' => 'Published',
            'archived' => 'Archived',
            default => 'Unknown'
        };
    }

    public function getStatusBadgeAttribute()
    {
        return match($this->status) {
            'draft' => 'secondary',
            'published' => 'success',
            'archived' => 'danger',
            default => 'secondary'
        };
    }

    // ============ RELASI SHARE ============

    public function shares()
    {
        return $this->hasMany(SharePaket::class);
    }

    public function sharedToMe()
    {
        return $this->hasMany(SharePaket::class, 'paket_soal_id')
            ->where('shared_to', auth()->id())
            ->where('is_accepted', true);
    }
}