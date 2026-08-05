<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CourseStudentSeeder extends Seeder
{
    public function run(): void
    {
        $course = Course::where('code', 'WEB-101')->first();
        $siswa1 = User::where('email', 'siswa@lms.com')->first();
        $siswa2 = User::where('email', 'siswa2@lms.com')->first();

        if (!$course || !$siswa1) {
            return;
        }

        DB::table('course_student')->updateOrInsert(
            ['course_id' => $course->id, 'student_id' => $siswa1->id],
            ['status' => 'active', 'created_at' => now(), 'updated_at' => now()]
        );

        if ($siswa2) {
            DB::table('course_student')->updateOrInsert(
                ['course_id' => $course->id, 'student_id' => $siswa2->id],
                ['status' => 'active', 'created_at' => now(), 'updated_at' => now()]
            );
        }
    }
}
