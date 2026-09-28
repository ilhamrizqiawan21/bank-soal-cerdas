<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UjianPelanggaran extends Model
{
    protected $table = 'ujian_pelanggaran';

    protected $fillable = [
        'ujian_id', 'type', 'occurred_at',
    ];

    protected $casts = [
        'occurred_at' => 'datetime',
    ];

    public function ujian()
    {
        return $this->belongsTo(Ujian::class);
    }

    public function getTypeLabelAttribute(): string
    {
        return match ($this->type) {
            'blur' => 'Berpindah jendela/aplikasi',
            'visibility_hidden' => 'Berpindah tab',
            'fullscreen_exit' => 'Keluar dari mode layar penuh',
            default => 'Tidak diketahui',
        };
    }
}
