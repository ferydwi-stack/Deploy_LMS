<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Submission;
use Illuminate\Http\Request;

class StudentStatsController extends Controller
{
    public function dashboardStats(Request $request)
    {
        $user = $request->user();

        // Count pending assignments
        $activeCourseIds = $user->enrolledCourses()->wherePivot('status', 'active')->pluck('courses.id');
        $totalAssignments = \App\Models\Assignment::whereIn('course_id', $activeCourseIds)->count();
        $submittedCount = Submission::where('student_id', $user->id)->count();
        
        $pendingTasks = max(0, $totalAssignments - $submittedCount);

        // Overall Attendance Rate
        $totalAttendances = Attendance::where('student_id', $user->id)->count();
        $presentCount = Attendance::where('student_id', $user->id)->where('status', 'hadir')->count();
        
        $attendanceRate = $totalAttendances > 0 
            ? round(($presentCount / $totalAttendances) * 100) 
            : 0;

        // Latest GPA (rough estimation of graded submissions)
        $gradedSubmissions = Submission::where('student_id', $user->id)
            ->whereNotNull('score')
            ->get();
            
        $averageScore = $gradedSubmissions->count() > 0 
            ? round($gradedSubmissions->avg('score'), 1) 
            : 0;

        return response()->json([
            'pending_tasks' => $pendingTasks,
            'attendance_rate' => $attendanceRate,
            'average_score' => $averageScore,
            'active_courses' => $activeCourseIds->count()
        ]);
    }
}