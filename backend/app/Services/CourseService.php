<?php

namespace App\Services;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Str;

class CourseService
{
    public function getCoursesForUser(User $user): Collection
    {
        $query = Course::with('teacher')->withCount(['materials', 'assignments', 'students']);

        return match ($user->role) {
            'guru' => $query->where('teacher_id', $user->id)->latest()->get(),
            'siswa' => $query->whereHas('students', fn ($q) => $q->where('users.id', $user->id)
                ->where('course_student.status', 'active')
            )->latest()->get(),
            'admin' => $query->latest()->get(),
            default => collect(),
        };
    }

    public function createCourse(User $user, array $data): Course
    {
        $code = $data['code'] ?? strtoupper(Str::random(6));

        return Course::create([
            'title' => $data['title'],
            'description' => $data['description'] ?? null,
            'teacher_id' => $user->id,
            'code' => $code,
        ]);
    }

    public function enrollStudent(Course $course, User $student): void
    {
        if ($student->role !== 'siswa') {
            throw new \Exception('Hanya siswa yang bisa enroll');
        }

        if ($course->students()->where('users.id', $student->id)->exists()) {
            throw new \Exception('Sudah terdaftar di kelas ini');
        }

        $course->students()->attach($student->id, ['status' => 'active']);

        app(NotificationService::class)->notifyTeacherOfEnrollment(
            $course->teacher,
            $student->name,
            $course->title,
            $course->id
        );
    }

    public function enrollByCode(string $code, User $student): Course
    {
        $course = Course::where('code', $code)->firstOrFail();
        $this->enrollStudent($course, $student);

        return $course;
    }

    public function leaveCourse(Course $course, User $student): void
    {
        $course->students()->updateExistingPivot($student->id, ['status' => 'dropped']);
    }

    public function getEnrolledStudents(Course $course): Collection
    {
        return $course->students()
            ->wherePivot('status', 'active')
            ->get();
    }

    public function kickStudent(Course $course, int $studentId): void
    {
        $course->students()->updateExistingPivot($studentId, ['status' => 'dropped']);
    }

    public function getAvailableCourses(): Collection
    {
        return Course::with('teacher')
            ->withCount('students')
            ->latest()
            ->get();
    }
}
