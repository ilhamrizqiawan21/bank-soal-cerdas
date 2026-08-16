<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class Ujian extends Model
{
    use SoftDeletes;

    protected $table = 'ujian';
    
    protected $fillable = [
        'paket_soal_id', 'siswa_id', 'created_by',
        'title', 'description', 'duration_minutes',
        'total_soal', 'total_score',
        'started_at', 'finished_at', 'submitted_at',
        'status'
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'finished_at' => 'datetime',
        'submitted_at' => 'datetime',
    ];

    // Relations
    public function paketSoal()
    {
        return $this->belongsTo(PaketSoal::class);
    }

    public function siswa()
    {
        return $this->belongsTo(User::class, 'siswa_id');
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function jawaban()
    {
        return $this->hasMany(UjianJawaban::class);
    }

    // Accessors
    public function getStatusLabelAttribute()
    {
        return match($this->status) {
            'draft' => 'Draft',
            'active' => 'Sedang Berjalan',
            'finished' => 'Selesai',
            'expired' => 'Kadaluarsa',
            default => 'Unknown'
        };
    }

    public function getStatusBadgeAttribute()
    {
        return match($this->status) {
            'draft' => 'secondary',
            'active' => 'primary',
            'finished' => 'success',
            'expired' => 'danger',
            default => 'secondary'
        };
    }

    public function getDurationTextAttribute()
    {
        if (!$this->duration_minutes) return 'Tidak terbatas';
        return $this->duration_minutes . ' menit';
    }

    public function getProgressAttribute()
    {
        if ($this->total_soal == 0) return 0;
        $answered = $this->jawaban()->whereNotNull('jawaban')->count();
        return round(($answered / $this->total_soal) * 100);
    }
}