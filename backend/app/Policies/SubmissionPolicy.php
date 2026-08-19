<?php

namespace App\Policies;

use Illuminate\Auth\Access\Response;
use App\Models\Submission;
use App\Models\User;

class SubmissionPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Submission $submission): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'guru') {
            return $submission->assignment->course->teacher_id === $user->id;
        }

        if ($user->role === 'siswa') {
            return $submission->student_id === $user->id;
        }

        return false;
    }

    public function create(User $user): bool
    {
        if ($user->role !== 'siswa') {
            return false;
        }

        return true;
    }

    public function update(User $user, Submission $submission): bool
    {
        if ($user->role === 'siswa') {
            return $submission->student_id === $user->id && $submission->status !== 'graded';
        }

        return false;
    }

    public function delete(User $user, Submission $submission): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        if ($user->role === 'siswa') {
            return $submission->student_id === $user->id && $submission->status !== 'graded';
        }

        return false;
    }

    public function grade(User $user, Submission $submission): bool
    {
        if ($user->role === 'admin') {
            return true;
        }

        return $user->role === 'guru' && $submission->assignment->course->teacher_id === $user->id;
    }

    public function restore(User $user, Submission $submission): bool
    {
        return $user->role === 'admin';
    }

    public function forceDelete(User $user, Submission $submission): bool
    {
        return $user->role === 'admin';
    }
}
