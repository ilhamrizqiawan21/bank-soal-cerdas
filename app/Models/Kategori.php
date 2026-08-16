<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Kategori extends Model
{
    protected $table = 'kategori';
    
    protected $fillable = [
        'name', 'code', 'description', 'type', 'parent_id'
    ];

    // Relations
    public function parent()
    {
        return $this->belongsTo(Kategori::class, 'parent_id');
    }

    public function children()
    {
        return $this->hasMany(Kategori::class, 'parent_id');
    }

    public function questions()
    {
        return $this->belongsToMany(Question::class, 'question_kategori');
    }

    // Accessors
    public function getTypeLabelAttribute()
    {
        return match($this->type) {
            'kd' => 'Kompetensi Dasar',
            'topik' => 'Topik',
            'bab' => 'Bab',
            default => 'Unknown'
        };
    }
}