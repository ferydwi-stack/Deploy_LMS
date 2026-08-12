<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Assignment;
use Illuminate\Http\Request;

class TeacherStatsController extends Controller
{
    public function dashboardStats(Request $request)
    {
        $user = $request->user();

        // Ensure only teacher can access
        if ($user->role !== 'guru') {
            abort(403);
        }

        // Get Teacher's Courses
        $myCourses = Course::where('teacher_id', $user->id)
            ->withCount('students')
            ->get();
            
        $courseIds = $myCourses->pluck('id');
        $totalStudents = $myCourses->sum('students_count');

        // Get Pending Grading Assignments
        $pendingAssignments = Assignment::whereIn('course_id', $courseIds)
            ->whereHas('submissions', function ($query) {
                $query->whereNull('score');
            })
            ->count();

        return response()->json([
            'total_courses' => $myCourses->count(),
            'total_students' => $totalStudents,
            'pending_assignments' => $pendingAssignments,
            'courses' => $myCourses
        ]);
    }
}