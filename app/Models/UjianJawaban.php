<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UjianJawaban extends Model
{
    protected $table = 'ujian_jawaban';
    
    protected $fillable = [
        'ujian_id', 'question_id', 'paket_soal_item_id',
        'jawaban', 'selected_option', 'is_correct', 'score', 'max_score'
    ];

    public function ujian()
    {
        return $this->belongsTo(Ujian::class);
    }

    public function question()
    {
        return $this->belongsTo(Question::class);
    }

    public function paketSoalItem()
    {
        return $this->belongsTo(PaketSoalItem::class);
    }
}