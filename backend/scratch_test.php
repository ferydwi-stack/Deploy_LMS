<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$siswa = App\Models\User::where('email', 'siswa@lms.com')->first();
echo "Siswa ID: " . $siswa->id . " Name: " . $siswa->name . "\n";

$pivot = DB::table('course_student')->get();
echo "Course Student Pivot Count: " . count($pivot) . "\n";
print_r($pivot->toArray());

$courses = App\Models\Course::whereHas('students', function($q) use ($siswa) {
    $q->where('users.id', $siswa->id)->where('course_student.status', 'active');
})->get();

echo "Courses count via whereHas: " . $courses->count() . "\n";
print_r($courses->toArray());

$enrolledCourses = $siswa->enrolledCourses;
echo "Siswa enrolledCourses count: " . $enrolledCourses->count() . "\n";

$allCourses = App\Models\Course::with(['teacher', 'students'])->get();
echo "All Courses count: " . $allCourses->count() . "\n";
foreach($allCourses as $c) {
    echo "Course Title: " . $c->title . " Students: " . $c->students->count() . "\n";
    foreach($c->students as $s) {
        echo "  - Student: " . $s->name . " (ID: " . $s->id . ") pivot status: " . ($s->pivot->status ?? 'N/A') . "\n";
    }
}
