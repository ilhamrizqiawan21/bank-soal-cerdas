<?php

namespace App\Policies;

use App\Models\Ujian;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class UjianPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'guru'], true);
    }

    public function view(User $user, Ujian $ujian): bool
    {
        return $this->owns($user, $ujian)
            || ($user->role === 'siswa' && (int) $ujian->siswa_id === (int) $user->id);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'guru'], true);
    }

    public function update(User $user, Ujian $ujian): bool
    {
        return $this->owns($user, $ujian);
    }

    public function delete(User $user, Ujian $ujian): bool
    {
        return $this->owns($user, $ujian);
    }

    public function publish(User $user, Ujian $ujian): bool
    {
        return $this->owns($user, $ujian);
    }

    public static function scopeManageableBy(Builder $query, User $user): Builder
    {
        if ($user->role === 'admin') {
            return $query;
        }

        return $query->where('created_by', $user->id);
    }

    private function owns(User $user, Ujian $ujian): bool
    {
        return $user->role === 'admin' || (int) $ujian->created_by === (int) $user->id;
    }
}
