<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\User;
use App\Services\AttendanceService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    use AuthorizesRequests;
    public function index(Course $course, Request $request)
    {
        $this->authorize('view', $course);
        
        $todayWib = \Carbon\Carbon::today('Asia/Jakarta')->toDateString();
        $date = $request->query('date', $todayWib);
        $attendances = app(AttendanceService::class)->getCourseAttendances($course, $date);
        
        return response()->json(['attendances' => $attendances]);
    }

    public function stats(Course $course)
    {
        $this->authorize('view', $course);

        $stats = app(AttendanceService::class)->getAllStudentStats($course);

        return response()->json(['stats' => $stats]);
    }

    public function store(Course $course, Request $request)
    {
        $this->authorize('update', $course);
        
        if ($request->has('attendances') && is_array($request->input('attendances'))) {
            $normalizedAttendances = array_map(function ($item) {
                if (isset($item['status'])) {
                    $st = strtolower(trim((string)$item['status']));
                    $item['status'] = ($st === 'alpa') ? 'alpha' : $st;
                }
                return $item;
            }, $request->input('attendances'));
            $request->merge(['attendances' => $normalizedAttendances]);
        }

        $validated = $request->validate([
            'date' => 'required|date',
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:users,id',
            'attendances.*.status' => 'required|in:hadir,izin,sakit,alpha',
            'attendances.*.note' => 'nullable|string',
        ]);
        
        try {
            app(AttendanceService::class)->saveBulkAttendances($course, $validated['attendances'], $validated['date']);
        } catch (\InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }
        
        return response()->json(['message' => 'Attendance saved successfully']);
    }

    public function selfAttend(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
        ]);
        
        $course = Course::findOrFail($validated['course_id']);
        
        try {
            $attendance = app(AttendanceService::class)->selfAttend($course, $user);
        } catch (\Exception $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }
        
        return response()->json([
            'message' => $attendance->status === 'alpha' ? 'Anda terlambat absen dan tercatat Alfa.' : 'Kehadiran berhasil dicatat.',
            'attendance' => $attendance,
        ]);
    }

    public function myAttendances(Request $request)
    {
        $user = $request->user();
        $attendances = app(AttendanceService::class)->getMyAttendances($user);
        
        return response()->json(['attendances' => $attendances]);
    }
}
