<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAssignmentRequest;
use App\Models\Assignment;
use App\Models\Course;
use Illuminate\Http\Request;

class AssignmentController extends Controller
{
    public function index(Request $request)
    {
        $query = Assignment::with(['course.teacher'])->withCount('submissions');

        if ($request->has('course_id') && ! empty($request->course_id)) {
            $query->where('course_id', $request->course_id);
        }

        $assignments = $query->latest()->get();

        return response()->json($assignments);
    }

    public function store(StoreAssignmentRequest $request)
    {
        $validated = $request->validated();

        if (empty($validated['course_id'])) {
            $firstCourse = Course::first();
            $validated['course_id'] = $firstCourse ? $firstCourse->id : 1;
        }

        $assignment = Assignment::create($validated);

        return response()->json([
            'message' => 'Tugas berhasil dibuat.',
            'assignment' => $assignment->load(['course.teacher'])->loadCount('submissions'),
        ], 201);
    }

    public function show($id)
    {
        $assignment = Assignment::with(['course', 'submissions.student'])->findOrFail($id);

        return response()->json($assignment);
    }

    public function destroy($id)
    {
        $assignment = Assignment::findOrFail($id);
        $assignment->delete();

        return response()->json([
            'message' => 'Tugas berhasil dihapus.',
        ]);
    }
}
