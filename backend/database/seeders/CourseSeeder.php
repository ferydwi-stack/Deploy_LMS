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

        Course::firstOrCreate(
            ['code' => 'WEB-101'],
            [
                'title' => 'Pemrograman Web Next.js & Laravel',
                'description' => 'Mata pelajaran integrasi Frontend Next.js 15 dan Backend Laravel 12 REST API.',
                'teacher_id' => $guru->id,
            ]
        );
    }
}
