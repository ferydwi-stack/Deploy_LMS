<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Course::with(['teacher', 'students'])->withCount(['materials', 'assignments', 'students']);

        if ($user && $user->role === 'guru') {
            $query->where('teacher_id', $user->id);
        } elseif ($user && $user->role === 'siswa') {
            $query->whereHas('students', fn ($q) => $q->where('users.id', $user->id)
                ->where('course_student.status', 'active'));
        }

        return response()->json($query->latest()->get());
    }

    public function show($id)
    {
        $course = Course::with(['teacher', 'students', 'materials', 'assignments.submissions', 'attendances'])->findOrFail($id);

        return response()->json($course);
    }

    public function updateGrade(Request $request, $courseId, $studentId)
    {
        $validated = $request->validate([
            'uts_score' => 'required|integer|min:0|max:100',
            'uas_score' => 'required|integer|min:0|max:100',
        ]);

        $course = Course::findOrFail($courseId);

        $course->students()->updateExistingPivot($studentId, [
            'uts_score' => $validated['uts_score'],
            'uas_score' => $validated['uas_score'],
        ]);

        return response()->json([
            'message' => 'Nilai UTS & UAS berhasil disimpan ke database MySQL.',
            'uts_score' => $validated['uts_score'],
            'uas_score' => $validated['uas_score'],
        ]);
    }

    public function store(StoreCourseRequest $request)
    {
        $validated = $request->validated();

        if (empty($validated['teacher_id'])) {
            $user = $request->user();
            if ($user) {
                $validated['teacher_id'] = $user->id;
            } else {
                $firstTeacher = User::where('role', 'guru')->first();
                $validated['teacher_id'] = $firstTeacher ? $firstTeacher->id : 1;
            }
        }

        $course = Course::create($validated);

        return response()->json([
            'message' => 'Mata pelajaran berhasil dibuat.',
            'course' => $course->load('teacher'),
        ], 201);
    }

    public function update(UpdateCourseRequest $request, $id)
    {
        $course = Course::findOrFail($id);

        $validated = $request->validated();

        $course->update($validated);

        return response()->json([
            'message' => 'Mata pelajaran berhasil diperbarui.',
            'course' => $course,
        ]);
    }

    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $course->delete();

        return response()->json([
            'message' => 'Mata pelajaran berhasil dihapus.',
        ]);
    }
}
