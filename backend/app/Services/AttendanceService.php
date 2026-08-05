<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Course;
use App\Models\User;
use Illuminate\Support\Collection;
use Carbon\Carbon;

class AttendanceService
{
    public function getCourseAttendances(Course $course, ?string $date = null): Collection
    {
        $query = Attendance::with('student')
            ->where('course_id', $course->id);

        if ($date) {
            $query->whereDate('date', $date);
        } else {
            $query->whereDate('date', today());
        }

        return $query->get();
    }

    public function saveBulkAttendances(Course $course, array $attendanceData, string $date): void
    {
        foreach ($attendanceData as $data) {
            Attendance::updateOrCreate(
                [
                    'course_id' => $course->id,
                    'student_id' => $data['student_id'],
                    'date' => $date,
                ],
                [
                    'status' => $data['status'],
                    'note' => $data['note'] ?? null,
                ]
            );
        }
    }

    public function selfAttend(Course $course, User $student): Attendance
    {
        $isEnrolled = $course->students()
            ->where('users.id', $student->id)
            ->where('course_student.status', 'active')
            ->exists();

        if (!$isEnrolled) {
            throw new \Exception('Tidak terdaftar di kelas ini');
        }

        return Attendance::updateOrCreate(
            [
                'course_id' => $course->id,
                'student_id' => $student->id,
                'date' => today(),
            ],
            [
                'status' => 'hadir',
                'note' => 'Self check-in',
            ]
        );
    }

    public function getMyAttendances(User $student): Collection
    {
        return Attendance::with('course')
            ->where('student_id', $student->id)
            ->orderBy('date', 'desc')
            ->get();
    }

    public function getAttendanceStats(Course $course, User $student): array
    {
        $attendances = Attendance::where('course_id', $course->id)
            ->where('student_id', $student->id)
            ->get();

        return [
            'total' => $attendances->count(),
            'hadir' => $attendances->where('status', 'hadir')->count(),
            'izin' => $attendances->where('status', 'izin')->count(),
            'sakit' => $attendances->where('status', 'sakit')->count(),
            'alpha' => $attendances->where('status', 'alpha')->count(),
        ];
    }
}
