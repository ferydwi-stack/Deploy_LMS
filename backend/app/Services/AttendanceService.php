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
        $enrolledStudentIds = $course->students()
            ->wherePivot('status', 'active')
            ->pluck('users.id')
            ->map(fn ($id) => (int) $id)
            ->all();

        foreach ($attendanceData as $data) {
            if (! in_array((int) $data['student_id'], $enrolledStudentIds, true)) {
                throw new \InvalidArgumentException('Siswa tidak terdaftar aktif di kelas ini.');
            }

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

        if (!$course->attendance_open_time || !$course->attendance_close_time) {
            throw new \Exception('Jadwal absensi belum diatur oleh guru.');
        }

        $now = now();
        $openTime = Carbon::createFromFormat('Y-m-d H:i', today()->toDateString().' '.$course->attendance_open_time->format('H:i'));
        $closeTime = Carbon::createFromFormat('Y-m-d H:i', today()->toDateString().' '.$course->attendance_close_time->format('H:i'));

        if ($now->lt($openTime)) {
            throw new \Exception('Absensi belum dibuka oleh guru.');
        }

        if ($now->gt($closeTime)) {
            return Attendance::updateOrCreate(
                [
                    'course_id' => $course->id,
                    'student_id' => $student->id,
                    'date' => today(),
                ],
                [
                    'status' => 'alpha',
                    'note' => 'Terlambat absen',
                ]
            );
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

    public function getAllStudentStats(Course $course): array
    {
        $studentIds = $course->students()
            ->wherePivot('status', 'active')
            ->pluck('users.id');

        $attendances = Attendance::where('course_id', $course->id)
            ->whereIn('student_id', $studentIds)
            ->get();

        $stats = [];
        foreach ($studentIds as $studentId) {
            $studentAtt = $attendances->where('student_id', $studentId);
            $total = $studentAtt->count();
            $hadir = $studentAtt->where('status', 'hadir')->count();
            $stats[$studentId] = [
                'total' => $total,
                'hadir' => $hadir,
                'izin' => $studentAtt->where('status', 'izin')->count(),
                'sakit' => $studentAtt->where('status', 'sakit')->count(),
                'alpha' => $studentAtt->where('status', 'alpha')->count(),
                'percentage' => $total > 0 ? round(($hadir / $total) * 100) : 0,
            ];
        }

        return $stats;
    }
}
