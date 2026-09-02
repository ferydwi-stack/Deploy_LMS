<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAssignmentRequest;
use App\Models\Assignment;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class AssignmentController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request)
    {
        $query = Assignment::with(['course.teacher'])->withCount('submissions');
        $user = $request->user();

        // Isolasi data: filter berdasarkan peran kecuali admin
        if ($user && $user->role === 'guru') {
            $query->whereHas('course', function ($q) use ($user) {
                $q->where('teacher_id', $user->id);
            });
        } elseif ($user && $user->role === 'siswa') {
            $query->whereHas('course.students', function ($q) use ($user) {
                $q->where('users.id', $user->id)
                  ->where('course_student.status', 'active');
            });
        }

        if ($request->has('course_id') && ! empty($request->course_id)) {
            $query->where('course_id', $request->course_id);
        }

        $assignments = $query->latest()->get();

        return response()->json($assignments);
    }

    public function store(StoreAssignmentRequest $request)
    {
        $this->authorize('create', Assignment::class);
        $validated = $request->validated();

        if (empty($validated['course_id'])) {
            return response()->json(['message' => 'course_id wajib diisi.'], 422);
        }

        $course = Course::findOrFail($validated['course_id']);
        $this->authorize('update', $course);

        $attachmentPath = null;
        $attachmentName = null;
        if ($request->hasFile('file')) {
            $file = $request->file('file');
            $attachmentName = $file->getClientOriginalName();
            $attachmentPath = \App\Services\PersistentStorageService::store($file, 'tugas_soal');
        }

        $assignment = Assignment::create([
            'course_id' => $validated['course_id'],
            'title' => $request->input('title', $validated['title'] ?? 'Tugas Baru'),
            'instruction' => $validated['instruction'] ?? '',
            'due_date' => $validated['due_date'] ?? null,
            'attachment_path' => $attachmentPath,
            'attachment_name' => $attachmentName,
        ]);

        return response()->json([
            'message' => 'Tugas berhasil dibuat.',
            'assignment' => $assignment->load(['course.teacher'])->loadCount('submissions'),
        ], 201);
    }

    public function show($id)
    {
        $assignment = Assignment::with(['course', 'submissions.student'])->findOrFail($id);
        $this->authorize('view', $assignment);

        return response()->json($assignment);
    }

    public function destroy(Request $request, $id)
    {
        $assignment = Assignment::findOrFail($id);
        $this->authorize('delete', $assignment);

        if ($assignment->attachment_path) {
            Storage::disk('public')->delete($assignment->attachment_path);
        }

        $assignment->delete();

        return response()->json([
            'message' => 'Tugas berhasil dihapus.',
        ]);
    }
}
