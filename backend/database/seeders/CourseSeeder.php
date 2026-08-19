<?php

namespace Database\Seeders;

use App\Models\Assignment;
use App\Models\Course;
use App\Models\Material;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Database\Seeder;

class CourseSeeder extends Seeder
{
    public function run(): void
    {
        $guru = User::where('role', 'guru')->first();
        $siswa = User::where('role', 'siswa')->first();

        if (!$guru || !$siswa) {
            return;
        }

        $course = Course::create([
            'title' => 'Pemrograman Web Next.js & Laravel',
            'description' => 'Mata pelajaran integrasi Frontend Next.js 15 dan Backend Laravel 12 REST API.',
            'teacher_id' => $guru->id,
            'code' => 'WEB-101',
        ]);

        Material::create([
            'course_id' => $course->id,
            'title' => 'Modul 1: Pengenalan REST API Laravel 12',
            'content' => 'Materi tentang konsep Decoupled Architecture, CORS, dan Laravel Sanctum Token Authentication.',
            'file_path' => null,
        ]);

        $assignment = Assignment::create([
            'course_id' => $course->id,
            'title' => 'Tugas 1: Integrasi API Auth Next.js & Laravel',
            'instruction' => 'Buatlah halaman login di Next.js 15 yang melakukan HTTP POST ke Laravel API /api/v1/auth/login dan menyimpan Sanctum token.',
            'due_date' => now()->addDays(7),
        ]);

        Submission::create([
            'assignment_id' => $assignment->id,
            'student_id' => $siswa->id,
            'file_path' => 'tugas/sample_tugas_1.pdf',
            'original_filename' => 'Tugas1_AhmadRizky.pdf',
            'note' => 'Pak, ini tugas 1 saya sudah selesai.',
            'score' => 95,
            'teacher_feedback' => 'Bagus sekali, integrasi token bekerja dengan lancar.',
            'status' => 'graded',
            'submitted_at' => now(),
        ]);
    }
}
