<?php

namespace App\Policies;

use App\Models\PaketSoal;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class PaketSoalPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'guru'], true);
    }

    public function view(User $user, PaketSoal $paketSoal): bool
    {
        return $this->owns($user, $paketSoal)
            || $this->hasAcceptedShare($user, $paketSoal, ['view', 'edit', 'copy']);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'guru'], true);
    }

    public function update(User $user, PaketSoal $paketSoal): bool
    {
        return $this->owns($user, $paketSoal)
            || $this->hasAcceptedShare($user, $paketSoal, ['edit']);
    }

    public function delete(User $user, PaketSoal $paketSoal): bool
    {
        return $this->owns($user, $paketSoal);
    }

    public function duplicate(User $user, PaketSoal $paketSoal): bool
    {
        return $this->owns($user, $paketSoal)
            || $this->hasAcceptedShare($user, $paketSoal, ['copy', 'edit']);
    }

    public static function scopeVisibleTo(Builder $query, User $user): Builder
    {
        if ($user->role === 'admin') {
            return $query;
        }

        return $query->where(function (Builder $query) use ($user) {
            $query->where('created_by', $user->id)
                ->orWhereHas('shares', function (Builder $shareQuery) use ($user) {
                    $shareQuery->where('shared_to', $user->id)
                        ->where('is_accepted', true);
                });
        });
    }

    private function owns(User $user, PaketSoal $paketSoal): bool
    {
        return $user->role === 'admin' || (int) $paketSoal->created_by === (int) $user->id;
    }

    private function hasAcceptedShare(User $user, PaketSoal $paketSoal, array $permissions): bool
    {
        if ($user->role !== 'guru') {
            return false;
        }

        return $paketSoal->shares()
            ->where('shared_to', $user->id)
            ->where('is_accepted', true)
            ->whereIn('permission', $permissions)
            ->exists();
    }
}
