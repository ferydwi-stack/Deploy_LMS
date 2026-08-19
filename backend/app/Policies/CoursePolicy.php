<?php

namespace App\Policies;

use Illuminate\Auth\Access\Response;
use App\Models\Course;
use App\Models\User;

class CoursePolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Course $course): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'guru') {
            return $course->teacher_id === $user->id;
        }

        if ($user->role === 'siswa') {
            return $course->students()->where('users.id', $user->id)->exists();
        }

        return false;
    }

    public function create(User $user): bool
    {
        return in_array($user->role, ['admin', 'guru']);
    }

    public function update(User $user, Course $course): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'guru' && $course->teacher_id === $user->id;
    }

    public function delete(User $user, Course $course): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'guru' && $course->teacher_id === $user->id;
    }

    public function enroll(User $user, Course $course): bool
    {
        return $user->role === 'siswa';
    }

    public function manageStudents(User $user, Course $course): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'guru' && $course->teacher_id === $user->id;
    }

    public function restore(User $user, Course $course): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, Course $course): bool
    {
        return $user->role === 'admin';
    }
}
