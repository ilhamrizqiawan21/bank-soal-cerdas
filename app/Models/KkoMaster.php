<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class KkoMaster extends Model
{
    protected $table = 'kko_master';
    protected $fillable = ['level', 'verb', 'description'];
    
    public function questions()
    {
        return $this->hasMany(Question::class);
    }
}