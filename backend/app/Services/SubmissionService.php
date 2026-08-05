<?php

namespace App\Services;

use App\Events\SubmissionCreated;
use App\Events\SubmissionGraded;
use App\Models\Assignment;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\Request;

class SubmissionService
{
    public function submit(Assignment $assignment, User $student, Request $request): Submission
    {
        $isEnrolled = $assignment->course->students()
            ->where('users.id', $student->id)
            ->where('course_student.status', 'active')
            ->exists();

        if (! $isEnrolled) {
            throw new \Exception('Tidak terdaftar di kelas ini');
        }

        $path = null;
        $originalFilename = null;

        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('tugas', 'public');
            $originalFilename = $request->file('file')->getClientOriginalName();
        }

        $isLate = $assignment->due_date && now()->greaterThan($assignment->due_date);

        $submission = Submission::updateOrCreate(
            ['assignment_id' => $assignment->id, 'student_id' => $student->id],
            [
                'file_path' => $path,
                'original_filename' => $originalFilename,
                'note' => $request->input('note'),
                'status' => $isLate ? 'late' : 'submitted',
                'submitted_at' => now(),
            ]
        );

        event(new SubmissionCreated($submission->load(['assignment.course.teacher', 'student'])));

        return $submission;
    }

    public function grade(Submission $submission, User $teacher, int $score, ?string $feedback): Submission
    {
        if ($submission->assignment->course->teacher_id !== $teacher->id) {
            throw new \Exception('Bukan tugas dari kelas Anda');
        }

        $submission->update([
            'score' => $score,
            'teacher_feedback' => $feedback,
            'status' => 'graded',
            'graded_at' => now(),
        ]);

        $submission->refresh()->load(['assignment', 'student']);

        event(new SubmissionGraded($submission));

        return $submission;
    }

    public function getSubmissionsForAssignment(Assignment $assignment)
    {
        return Submission::with('student')
            ->where('assignment_id', $assignment->id)
            ->latest()
            ->get();
    }

    public function getMySubmissions(User $student)
    {
        return Submission::with(['assignment.course'])
            ->where('student_id', $student->id)
            ->latest()
            ->get();
    }
}
