<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCourseRequest;
use App\Http\Requests\UpdateCourseRequest;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class CourseController extends Controller
{
    use AuthorizesRequests;
    public function index(Request $request)
    {
        $user = $request->user();
        
        $courses = app(\App\Services\CourseService::class)->getCoursesForUser($user);

        return response()->json($courses);
    }

    public function show(Request $request, $id)
    {
        $course = Course::with([
            'teacher',
            'students' => fn ($q) => $q->wherePivot('status', 'active')
        ])->findOrFail($id);
        $this->authorize('view', $course);

        return response()->json($course);
    }

    public function updateGrade(Request $request, $courseId, $studentId)
    {
        $validated = $request->validate([
            'uts_score' => 'required|integer|min:0|max:100',
            'uas_score' => 'required|integer|min:0|max:100',
        ]);

        $course = Course::findOrFail($courseId);
        $this->authorize('manageStudents', $course);

        if (! $course->students()->where('users.id', $studentId)->exists()) {
            return response()->json(['message' => 'Siswa tidak terdaftar di kelas ini.'], 422);
        }

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
        $this->authorize('create', Course::class);
        $validated = $request->validated();
        $user = $request->user();

        if ($user->role === 'guru') {
            $validated['teacher_id'] = $user->id;
        } elseif (empty($validated['teacher_id'])) {
            return response()->json(['message' => 'teacher_id wajib diisi.'], 422);
        }

        $teacher = User::where('id', $validated['teacher_id'])->where('role', 'guru')->first();
        if (! $teacher) {
            return response()->json(['message' => 'Guru pengajar tidak valid.'], 422);
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
        $this->authorize('update', $course);

        $validated = $request->validated();

        $course->update($validated);

        return response()->json([
            'message' => 'Mata pelajaran berhasil diperbarui.',
            'course' => $course,
        ]);
    }

    public function updateAttendanceSchedule(Request $request, $id)
    {
        $course = Course::findOrFail($id);
        $this->authorize('update', $course);

        $validated = $request->validate([
            'attendance_open_time' => 'nullable|date_format:H:i',
            'attendance_close_time' => 'nullable|date_format:H:i|after:attendance_open_time',
        ]);

        $course->update($validated);

        return response()->json([
            'message' => 'Jadwal absensi berhasil disimpan.',
            'course' => $course,
        ]);
    }

    public function destroy($id)
    {
        $course = Course::findOrFail($id);
        $this->authorize('delete', $course);
        $course->delete();

        return response()->json([
            'message' => 'Mata pelajaran berhasil dihapus.',
        ]);
    }
}
