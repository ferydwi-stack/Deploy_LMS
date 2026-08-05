<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUserRequest;
use App\Models\Assignment;
use App\Models\Attendance;
use App\Models\Course;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AdminController extends Controller
{
    public function indexUsers(Request $request)
    {
        $query = User::query();

        if ($request->has('role')) {
            $query->where('role', $request->role);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhere('nisn_or_nip', 'like', "%{$search}%");
            });
        }

        return response()->json($query->latest()->get());
    }

    public function storeUser(StoreUserRequest $request)
    {
        $validated = $request->validated();

        $validated['password'] = Hash::make($validated['password']);

        $user = User::create($validated);

        return response()->json([
            'message' => 'Pengguna berhasil dibuat.',
            'user' => $user,
        ], 201);
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => "sometimes|required|email|unique:users,email,{$id}",
            'password' => 'nullable|string|min:6',
            'role' => 'sometimes|required|in:admin,guru,siswa',
            'nisn_or_nip' => 'nullable|string',
            'specialization' => 'nullable|string',
            'subject' => 'nullable|string',
            'phone' => 'nullable|string',
            'bio' => 'nullable|string',
        ]);

        if (! empty($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        } else {
            unset($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'message' => 'Data pengguna berhasil diperbarui.',
            'user' => $user,
        ]);
    }

    public function destroyUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'Pengguna berhasil dihapus.',
        ]);
    }

    public function resetPassword(Request $request, $id)
    {
        $user = User::findOrFail($id);
        $validated = $request->validate([
            'password' => 'required|string|min:6',
        ]);

        $user->update([
            'password' => Hash::make($validated['password']),
        ]);

        return response()->json([
            'message' => 'Password pengguna berhasil diperbarui.',
            'user' => $user,
        ]);
    }

    public function bulkImport(Request $request)
    {
        $request->validate([
            'users' => 'required|array',
            'users.*.name' => 'required|string',
            'users.*.email' => 'required|email',
            'users.*.role' => 'required|in:admin,guru,siswa',
        ]);

        $imported = 0;
        foreach ($request->users as $userData) {
            User::updateOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => Hash::make($userData['password'] ?? '12345678'),
                    'role' => $userData['role'],
                    'nisn_or_nip' => $userData['nisn_or_nip'] ?? null,
                ]
            );
            $imported++;
        }

        return response()->json([
            'message' => "Berhasil mengimpor {$imported} data pengguna.",
        ]);
    }

    public function stats()
    {
        $totalUsers = User::count();
        $totalTeachers = User::where('role', 'guru')->count();
        $totalStudents = User::where('role', 'siswa')->count();
        $totalCourses = Course::count();
        $totalAssignments = Assignment::count();

        $submissionsToday = Submission::whereDate('submitted_at', today())->count();

        $totalAttendance = Attendance::count();
        $presentAttendance = Attendance::where('status', 'hadir')->count();
        $attendanceRate = $totalAttendance > 0 ? round(($presentAttendance / $totalAttendance) * 100, 2) : 0;

        return response()->json([
            'total_users' => $totalUsers,
            'total_teachers' => $totalTeachers,
            'total_students' => $totalStudents,
            'total_courses' => $totalCourses,
            'total_assignments' => $totalAssignments,
            'submissions_today' => $submissionsToday,
            'attendance_rate' => $attendanceRate,
        ]);
    }
}
