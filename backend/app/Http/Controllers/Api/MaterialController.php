<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMaterialRequest;
use App\Models\Course;
use App\Models\Material;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MaterialController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Material::query();

        if ($request->has('course_id') && $request->course_id) {
            $query->where('course_id', $request->course_id);
        } elseif ($user) {
            if ($user->role === 'guru') {
                $query->whereHas('course', fn ($q) => $q->where('teacher_id', $user->id));
            } elseif ($user->role === 'siswa') {
                $query->whereHas('course.students', fn ($q) => $q->where('users.id', $user->id)
                    ->where('course_student.status', 'active'));
            }
        }

        $materials = $query->latest()->get();

        return response()->json($materials);
    }

    public function store(StoreMaterialRequest $request)
    {
        $validated = $request->validated();
        $user = $request->user();

        $courseId = $request->input('course_id');
        $type = $request->input('type');
        $url = $request->input('url');
        $inputContent = $request->input('content');

        if (empty($courseId)) {
            return response()->json(['message' => 'Mata pelajaran (course_id) wajib dipilih.'], 422);
        }

        if ($user && $user->role === 'guru') {
            $course = Course::find($courseId);
            if (! $course || $course->teacher_id !== $user->id) {
                return response()->json(['message' => 'Anda tidak memiliki akses ke kelas ini.'], 403);
            }
        }

        $filePath = null;
        if ($request->hasFile('file')) {
            $filePath = $request->file('file')->store('materi', 'public');
        } elseif (! empty($url)) {
            $filePath = $url;
        }

        $contentStr = $inputContent ?? 'Modul materi pembelajaran.';
        if (! empty($type)) {
            $contentStr = ($inputContent ? $inputContent.' ' : '').'[Category: '.$type.']';
        }

        $material = Material::create([
            'course_id' => $courseId,
            'title' => $validated['title'],
            'content' => $contentStr,
            'file_path' => $filePath,
        ]);

        return response()->json([
            'message' => 'Materi berhasil ditambahkan.',
            'material' => $material,
        ], 201);
    }

    public function destroy($id)
    {
        $material = Material::findOrFail($id);

        if ($material->file_path) {
            Storage::disk('public')->delete($material->file_path);
        }

        $material->delete();

        return response()->json([
            'message' => 'Materi berhasil dihapus.',
        ]);
    }
}
