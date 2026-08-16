<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Tag extends Model
{
    protected $table = 'tag';
    
    protected $fillable = [
        'name', 'slug', 'color'
    ];

    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($tag) {
            if (empty($tag->slug)) {
                $tag->slug = Str::slug($tag->name);
            }
        });
    }

    // Relations
    public function questions()
    {
        return $this->belongsToMany(Question::class, 'question_tag');
    }
}