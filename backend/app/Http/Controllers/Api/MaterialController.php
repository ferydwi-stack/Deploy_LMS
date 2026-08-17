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
        $query = Material::query();
        $user = $request->user();

        // Isolasi data: filter berdasarkan peran kecuali admin
        if ($user && $user->role === 'guru') {
            $query->whereHas('course', function ($q) use ($user) {
                $q->where('teacher_id', $user->id);
            });
        } elseif ($user && $user->role === 'siswa') {
            $query->whereHas('course.students', function ($q) use ($user) {
                $q->where('users.id', $user->id)
                  ->where('course_student.status', 'active');
            });
        }

        if ($request->has('course_id') && $request->course_id) {
            $query->where('course_id', $request->course_id);
        }

        $materials = $query->latest()->get();

        return response()->json($materials);
    }

    public function store(StoreMaterialRequest $request)
    {
        $validated = $request->validated();

        $courseId = $request->input('course_id');
        $type = $request->input('type');
        $url = $request->input('url');
        $inputContent = $request->input('content');

        if (empty($courseId)) {
            return response()->json(['message' => 'course_id wajib diisi.'], 422);
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

    public function destroy(Request $request, $id)
    {
        $material = Material::findOrFail($id);
        
        $user = $request->user();
        
        // Authorization: Hanya admin atau guru pemilik course yang bisa menghapus
        if ($user->role !== 'admin') {
            if ($user->role !== 'guru' || $material->course->teacher_id !== $user->id) {
                return response()->json(['message' => 'Unauthorized. Anda bukan guru di kelas ini.'], 403);
            }
        }

        if ($material->file_path) {
            Storage::disk('public')->delete($material->file_path);
        }

        $material->delete();

        return response()->json([
            'message' => 'Materi berhasil dihapus.',
        ]);
    }
}
