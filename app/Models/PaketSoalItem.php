<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaketSoalItem extends Model
{
    protected $table = 'paket_soal_items';
    
    protected $fillable = [
        'paket_soal_id', 'question_id', 'order', 'score'
    ];

    public function paketSoal()
    {
        return $this->belongsTo(PaketSoal::class);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }
}