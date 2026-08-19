<?php

namespace App\Policies;

use Illuminate\Auth\Access\Response;
use App\Models\Assignment;
use App\Models\User;

class AssignmentPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Assignment $assignment): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'guru') {
            return $assignment->course->teacher_id === $user->id;
        }

        if ($user->role === 'siswa') {
            return $assignment->course->students()->where('users.id', $user->id)->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        if (in_array($user->role, ['admin', 'guru'])) {
            return true;
        }

        return false;
    }

    public function update(User $user, Assignment $assignment): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'guru' && $assignment->course->teacher_id === $user->id;
    }

    public function delete(User $user, Assignment $assignment): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'guru' && $assignment->course->teacher_id === $user->id;
    }

    public function restore(User $user, Assignment $assignment): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, Assignment $assignment): bool
    {
        return $user->role === 'admin';
    }
}
