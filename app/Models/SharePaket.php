<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class SharePaket extends Model
{
    protected $table = 'share_paket';
    
    protected $fillable = [
        'paket_soal_id', 'shared_by', 'shared_to',
        'permission', 'is_accepted', 'accepted_at', 'note'
    ];

    protected $casts = [
        'is_accepted' => 'boolean',
        'accepted_at' => 'datetime',
    ];

    public function paketSoal()
    {
        return $this->belongsTo(PaketSoal::class);
    }

    public function sharedBy()
    {
        return $this->belongsTo(User::class, 'shared_by');
    }

    public function sharedTo()
    {
        return $this->belongsTo(User::class, 'shared_to');
    }

    public function getPermissionLabelAttribute()
    {
        return match($this->permission) {
            'view' => 'Lihat',
            'edit' => 'Edit',
            'copy' => 'Copy',
            default => 'Unknown'
        };
    }
}