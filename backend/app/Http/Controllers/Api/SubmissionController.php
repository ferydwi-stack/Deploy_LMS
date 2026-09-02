<?php

namespace App\Http\Controllers\Api;

use App\Events\SubmissionCreated;
use App\Events\SubmissionGraded;
use App\Http\Controllers\Controller;
use App\Http\Requests\SubmitAssignmentRequest;
use App\Models\Assignment;
use App\Models\Submission;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class SubmissionController extends Controller
{
    public function submit(SubmitAssignmentRequest $request, $assignmentId)
    {
        $assignment = Assignment::findOrFail($assignmentId);
        $student = $request->user();

        $isEnrolled = $assignment->course->students()
            ->where('users.id', $student->id)
            ->where('course_student.status', 'active')
            ->exists();

        if (! $isEnrolled) {
            return response()->json(['message' => 'Anda belum terdaftar aktif di kelas ini.'], 403);
        }

        $note = trim((string)$request->input('note'));
        if (!$request->hasFile('file') && empty($note)) {
            return response()->json(['message' => 'Mohon unggah berkas file jawaban atau tuliskan tautan/catatan tugas.'], 422);
        }

        $path = null;
        $originalName = null;

        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $originalName = $file->getClientOriginalName();
            $path = \App\Services\PersistentStorageService::store($file, 'tugas');
        }

        $isLate = $assignment->due_date && now()->greaterThan($assignment->due_date);

        $submission = Submission::updateOrCreate(
            [
                'assignment_id' => $assignment->id,
                'student_id' => $student->id,
            ],
            [
                'file_path' => $path,
                'original_filename' => $originalName,
                'note' => $note ?: ($path ? 'Berkas jawaban terlampir' : 'Tugas dikumpulkan via web LMS'),
                'status' => $isLate ? 'late' : 'submitted',
                'submitted_at' => now(),
            ]
        );

        $teacher = $assignment->course->teacher;
        app(NotificationService::class)->notifyTeacherOfSubmission(
            $teacher,
            $student->name,
            $assignment->title,
            $assignment->id
        );

        return response()->json([
            'message' => 'Tugas berhasil dikumpulkan!',
            'submission' => $submission,
        ], 201);
    }

    public function grade(Request $request, $id)
    {
        $submission = Submission::with(['assignment.course', 'student'])->findOrFail($id);
        $teacher = $request->user();

        if ($teacher->role !== 'admin' && $submission->assignment->course->teacher_id !== $teacher->id) {
            return response()->json(['message' => 'Bukan tugas dari kelas Anda.'], 403);
        }

        $validated = $request->validate([
            'score' => 'required|integer|min:0|max:100',
            'teacher_feedback' => 'nullable|string',
        ]);

        $submission->update([
            'score' => $validated['score'],
            'teacher_feedback' => $validated['teacher_feedback'] ?? null,
            'status' => 'graded',
        ]);

        $student = $submission->student;
        app(NotificationService::class)->notifyStudentOfGrade(
            $student,
            $submission->assignment->title,
            $validated['score']
        );

        return response()->json([
            'message' => 'Penilaian tugas berhasil disimpan.',
            'submission' => $submission,
        ]);
    }

    public function mySubmissions(Request $request)
    {
        $student = $request->user();
        $submissions = Submission::where('student_id', $student->id)
            ->with(['assignment.course'])
            ->latest()
            ->get();

        return response()->json($submissions);
    }

    public function assignmentSubmissions(Request $request, $assignmentId)
    {
        $assignment = Assignment::with('course')->findOrFail($assignmentId);
        $user = $request->user();

        if ($user->role !== 'admin' && ($user->role !== 'guru' || $assignment->course->teacher_id !== $user->id)) {
            return response()->json(['message' => 'Anda tidak memiliki akses ke pengumpulan tugas ini.'], 403);
        }

        $submissions = Submission::where('assignment_id', $assignmentId)
            ->with('student')
            ->latest()
            ->get();

        return response()->json($submissions);
    }
}
