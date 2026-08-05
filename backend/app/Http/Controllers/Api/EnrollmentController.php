<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\CourseService;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function enroll(Course $course, Request $request)
    {
        $user = $request->user();
        
        $this->authorize('enroll', $course);
        
        app(CourseService::class)->enrollStudent($course, $user);
        
        return response()->json(['message' => 'Successfully enrolled in course']);
    }

    public function enrollByCode(Request $request)
    {
        $user = $request->user();
        
        $validated = $request->validate([
            'code' => 'required|string|exists:courses,code',
        ]);
        
        $course = app(CourseService::class)->enrollByCode($validated['code'], $user);
        
        return response()->json(['message' => 'Successfully enrolled', 'course' => $course]);
    }

    public function leave(Course $course, Request $request)
    {
        $user = $request->user();
        
        app(CourseService::class)->leaveCourse($course, $user);
        
        return response()->json(['message' => 'You have left the course']);
    }

    public function students(Course $course, Request $request)
    {
        $this->authorize('manageStudents', $course);
        
        $students = app(CourseService::class)->getEnrolledStudents($course);
        
        return response()->json(['students' => $students]);
    }

    public function kickStudent(Course $course, int $studentId, Request $request)
    {
        $this->authorize('manageStudents', $course);
        
        app(CourseService::class)->kickStudent($course, $studentId);
        
        return response()->json(['message' => 'Student removed from course']);
    }

    public function available(Request $request)
    {
        $courses = app(CourseService::class)->getAvailableCourses();
        
        return response()->json(['courses' => $courses]);
    }
}
