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
        $todayWib = Carbon::today('Asia/Jakarta')->toDateString();
        $targetDate = $date ?: $todayWib;

        return Attendance::with('student')
            ->where('course_id', $course->id)
            ->whereDate('date', $targetDate)
            ->get();
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
                continue;
            }

            $rawStatus = strtolower(trim((string)$data['status']));
            if ($rawStatus === '-' || $rawStatus === '' || $rawStatus === 'belum absen' || $rawStatus === 'belum') {
                continue;
            }

            $cleanStatus = ($rawStatus === 'alpa') ? 'alpha' : $rawStatus;
            if (! in_array($cleanStatus, ['hadir', 'izin', 'sakit', 'alpha'], true)) {
                continue;
            }

            Attendance::updateOrCreate(
                [
                    'course_id' => $course->id,
                    'student_id' => $data['student_id'],
                    'date' => $date,
                ],
                [
                    'status' => $cleanStatus,
                    'note' => $data['note'] ?? 'Presensi oleh Guru Pengampu',
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
            throw new \Exception('Anda belum terdaftar di kelas ini.');
        }

        if (!$course->attendance_open_time || !$course->attendance_close_time) {
            throw new \Exception('Jadwal jam absensi belum diatur oleh guru pengampu.');
        }

        $nowWib = Carbon::now('Asia/Jakarta');
        $todayWib = Carbon::today('Asia/Jakarta')->toDateString();

        $openTimeStr = is_string($course->attendance_open_time) 
            ? substr($course->attendance_open_time, 0, 5) 
            : ($course->attendance_open_time ? $course->attendance_open_time->format('H:i') : '00:00');

        $closeTimeStr = is_string($course->attendance_close_time) 
            ? substr($course->attendance_close_time, 0, 5) 
            : ($course->attendance_close_time ? $course->attendance_close_time->format('H:i') : '23:59');

        $openTime = Carbon::createFromFormat('Y-m-d H:i', "{$todayWib} {$openTimeStr}", 'Asia/Jakarta');
        $closeTime = Carbon::createFromFormat('Y-m-d H:i', "{$todayWib} {$closeTimeStr}", 'Asia/Jakarta');

        if ($nowWib->lt($openTime)) {
            throw new \Exception("Absensi belum dibuka. Jadwal aktif: {$openTimeStr} - {$closeTimeStr} WIB.");
        }

        if ($nowWib->gt($closeTime)) {
            return Attendance::updateOrCreate(
                [
                    'course_id' => $course->id,
                    'student_id' => $student->id,
                    'date' => $todayWib,
                ],
                [
                    'status' => 'alpha',
                    'note' => "Terlambat absen (melewati {$closeTimeStr} WIB)",
                ]
            );
        }

        return Attendance::updateOrCreate(
            [
                'course_id' => $course->id,
                'student_id' => $student->id,
                'date' => $todayWib,
            ],
            [
                'status' => 'hadir',
                'note' => 'Presensi Mandiri Siswa (Tepat Waktu)',
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
