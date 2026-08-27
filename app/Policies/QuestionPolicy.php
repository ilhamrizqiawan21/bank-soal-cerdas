<?php

namespace App\Policies;

use App\Models\Question;
use App\Models\User;
use Illuminate\Database\Eloquent\Builder;

class QuestionPolicy
{
    public function viewAny(User $user): bool
    {
        return in_array($user->role, ['admin', 'guru'], true);
    }

    public function view(User $user, Question $question): bool
    {
        return $this->owns($user, $question)
            || $this->hasAcceptedShare($user, $question, ['view', 'edit', 'copy']);
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'guru'], true);
    }

    public function update(User $user, Question $question): bool
    {
        return $this->owns($user, $question)
            || $this->hasAcceptedShare($user, $question, ['edit']);
    }

    public function delete(User $user, Question $question): bool
    {
        return $this->owns($user, $question);
    }

    public function duplicate(User $user, Question $question): bool
    {
        return $this->owns($user, $question)
            || $this->hasAcceptedShare($user, $question, ['copy', 'edit']);
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

    private function owns(User $user, Question $question): bool
    {
        return $user->role === 'admin' || (int) $question->created_by === (int) $user->id;
    }

    private function hasAcceptedShare(User $user, Question $question, array $permissions): bool
    {
        if ($user->role !== 'guru') {
            return false;
        }

        return $question->shares()
            ->where('shared_to', $user->id)
            ->where('is_accepted', true)
            ->whereIn('permission', $permissions)
            ->exists();
    }
}
