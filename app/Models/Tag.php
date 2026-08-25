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

    /**
     * Pastikan slug unik (jika bentrok, tambahkan suffix -2, -3, ...).
     */
    public static function uniqueSlug(string $name, ?int $ignoreId = null): string
    {
        $base = Str::slug($name);
        $slug = $base;
        $i = 2;

        while (static::where('slug', $slug)->where('id', '!=', $ignoreId ?? 0)->exists()) {
            $slug = $base . '-' . $i++;
        }

        return $slug;
    }
}