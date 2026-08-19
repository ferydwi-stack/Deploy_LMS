<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function courseReport(Course $course, Request $request)
    {
        $user = $request->user();

        // Security check
        if ($user->role === 'guru' && $course->teacher_id !== $user->id) {
            abort(403, 'Unauthorized access to class report.');
        }

        // Only fetch active students
        $students = $course->students()->wherePivot('status', 'active')->get();

        // Fetch course assignments with their submissions
        $assignments = $course->assignments()->with('submissions')->get();
        
        // Fetch course attendances
        $attendances = $course->attendances()->get(['student_id', 'status']);

        return response()->json([
            'course' => $course->only(['id', 'title', 'code']),
            'students' => $students,
            'assignments' => $assignments,
            'attendances' => $attendances
        ]);
    }
}