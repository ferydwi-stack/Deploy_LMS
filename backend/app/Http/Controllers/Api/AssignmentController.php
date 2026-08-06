<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAssignmentRequest;
use App\Models\Assignment;
use App\Models\Course;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Assignment::with(['course.teacher'])->withCount('submissions');

        if ($request->has('course_id') && ! empty($request->course_id)) {
            $query->where('course_id', $request->course_id);
        } elseif ($user) {
            if ($user->role === 'guru') {
                $query->whereHas('course', fn ($q) => $q->where('teacher_id', $user->id));
            } elseif ($user->role === 'siswa') {
                $query->whereHas('course.students', fn ($q) => $q->where('users.id', $user->id)
                    ->where('course_student.status', 'active'));
            }
        }

        $assignments = $query->latest()->get();

        return response()->json($assignments);
    }

    public function store(StoreAssignmentRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();

        if (empty($validated['course_id'])) {
            return response()->json(['message' => 'Mata pelajaran (course_id) wajib dipilih.'], 422);
        }

        if ($user && $user->role === 'guru') {
            $course = Course::find($validated['course_id']);
            if (! $course || $course->teacher_id !== $user->id) {
                return response()->json(['message' => 'Anda tidak memiliki akses ke kelas ini.'], 403);
            }
        }

        $assignment = Assignment::create($validated);

        return response()->json([
            'message' => 'Tugas berhasil dibuat.',
            'assignment' => $assignment->load(['course.teacher'])->loadCount('submissions'),
        ], 201);
    }

    public function show($id)
    {
        $assignment = Assignment::with(['course', 'submissions.student'])->findOrFail($id);

        return response()->json($assignment);
    }

    public function destroy($id)
    {
        $assignment = Assignment::findOrFail($id);
        $assignment->delete();

        return response()->json([
            'message' => 'Tugas berhasil dihapus.',
        ]);
    }
}
