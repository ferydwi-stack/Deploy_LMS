<?php

namespace Tests\Feature;

use App\Models\Assignment;
use App\Models\Course;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CourseIsolationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guru_a_cannot_see_guru_b_courses(): void
    {
        $guruA = User::factory()->create(['role' => 'guru', 'name' => 'Guru A']);
        $guruB = User::factory()->create(['role' => 'guru', 'name' => 'Guru B']);

        $courseA = Course::factory()->create(['teacher_id' => $guruA->id, 'title' => 'Math A']);
        $courseB = Course::factory()->create(['teacher_id' => $guruB->id, 'title' => 'Math B']);

        $response = $this->actingAs($guruA)->getJson('/api/v1/courses');

        $response->assertOk();
        $courses = $response->json();
        
        $this->assertCount(1, $courses);
        $this->assertEquals('Math A', $courses[0]['title']);
        $this->assertNotContains('Math B', array_column($courses, 'title'));
    }

    public function test_guru_creates_assignment_siswa_enrolled_sees_it(): void
    {
        $guru = User::factory()->create(['role' => 'guru']);
        $siswa = User::factory()->create(['role' => 'siswa']);

        $course = Course::factory()->create(['teacher_id' => $guru->id]);
        $course->students()->attach($siswa->id, ['status' => 'active']);

        $assignment = Assignment::factory()->create([
            'course_id' => $course->id,
            'title' => 'Homework 1',
        ]);

        sleep(1);

        $response = $this->actingAs($siswa)->getJson('/api/v1/assignments');

        $response->assertOk();
        $assignments = $response->json();
        
        $this->assertNotEmpty($assignments);
        $this->assertContains('Homework 1', array_column($assignments, 'title'));
    }

    public function test_siswa_submit_guru_sees_submission_with_notification(): void
    {
        $guru = User::factory()->create(['role' => 'guru']);
        $siswa = User::factory()->create(['role' => 'siswa', 'name' => 'Siswa A']);

        $course = Course::factory()->create(['teacher_id' => $guru->id]);
        $course->students()->attach($siswa->id, ['status' => 'active']);

        $assignment = Assignment::factory()->create(['course_id' => $course->id]);

        $response = $this->actingAs($siswa)->postJson("/api/v1/assignments/{$assignment->id}/submit", [
            'note' => 'My submission',
        ]);

        $response->assertCreated();

        sleep(1);

        $submissionsResponse = $this->actingAs($guru)
            ->getJson("/api/v1/assignments/{$assignment->id}/submissions");

        $submissionsResponse->assertOk();
        $submissions = $submissionsResponse->json();
        
        $this->assertNotEmpty($submissions);
        $this->assertEquals($siswa->id, $submissions[0]['student_id']);

        $notificationsResponse = $this->actingAs($guru)->getJson('/api/v1/notifications');
        $notifications = $notificationsResponse->json('notifications');
        
        $this->assertNotEmpty($notifications);
    }

    public function test_siswa_submit_to_guru_a_guru_b_cannot_see(): void
    {
        $guruA = User::factory()->create(['role' => 'guru']);
        $guruB = User::factory()->create(['role' => 'guru']);
        $siswa = User::factory()->create(['role' => 'siswa']);

        $courseA = Course::factory()->create(['teacher_id' => $guruA->id]);
        $courseA->students()->attach($siswa->id, ['status' => 'active']);

        $assignment = Assignment::factory()->create(['course_id' => $courseA->id]);

        $this->actingAs($siswa)->postJson("/api/v1/assignments/{$assignment->id}/submit", [
            'note' => 'Submission for Guru A',
        ]);

        $response = $this->actingAs($guruB)
            ->getJson("/api/v1/assignments/{$assignment->id}/submissions");

        $response->assertStatus(403);
    }

    public function test_attendance_isolated_per_course(): void
    {
        $guru = User::factory()->create(['role' => 'guru']);
        $siswa = User::factory()->create(['role' => 'siswa']);

        $courseMath = Course::factory()->create(['teacher_id' => $guru->id, 'title' => 'Math']);
        $coursePhysics = Course::factory()->create(['teacher_id' => $guru->id, 'title' => 'Physics']);

        $courseMath->students()->attach($siswa->id, ['status' => 'active']);
        $coursePhysics->students()->attach($siswa->id, ['status' => 'active']);

        $this->actingAs($guru)->postJson("/api/v1/courses/{$courseMath->id}/attendances", [
            'date' => today()->toDateString(),
            'attendances' => [
                ['student_id' => $siswa->id, 'status' => 'hadir'],
            ],
        ]);

        $mathResponse = $this->actingAs($guru)
            ->getJson("/api/v1/courses/{$courseMath->id}/attendances");
        $physicsResponse = $this->actingAs($guru)
            ->getJson("/api/v1/courses/{$coursePhysics->id}/attendances");

        $mathResponse->assertOk();
        $physicsResponse->assertOk();

        $mathAttendances = $mathResponse->json('attendances');
        $physicsAttendances = $physicsResponse->json('attendances');

        $this->assertNotEmpty($mathAttendances);
        $this->assertEmpty($physicsAttendances);
    }

    public function test_guru_grades_submission_siswa_sees_grade_with_notification(): void
    {
        $guru = User::factory()->create(['role' => 'guru']);
        $siswa = User::factory()->create(['role' => 'siswa']);

        $course = Course::factory()->create(['teacher_id' => $guru->id]);
        $course->students()->attach($siswa->id, ['status' => 'active']);

        $assignment = Assignment::factory()->create(['course_id' => $course->id]);
        $submission = Submission::factory()->create([
            'assignment_id' => $assignment->id,
            'student_id' => $siswa->id,
            'status' => 'submitted',
        ]);

        $response = $this->actingAs($guru)->putJson("/api/v1/submissions/{$submission->id}/grade", [
            'score' => 85,
            'teacher_feedback' => 'Good work!',
        ]);

        $response->assertOk();

        $submissionResponse = $this->actingAs($siswa)->getJson('/api/v1/submissions/my');
        $submissions = $submissionResponse->json();

        $this->assertNotEmpty($submissions);
        $this->assertEquals(85, $submissions[0]['score']);
        $this->assertEquals('graded', $submissions[0]['status']);

        $notificationsResponse = $this->actingAs($siswa)->getJson('/api/v1/notifications');
        $notifications = $notificationsResponse->json('notifications');

        $this->assertTrue(is_array($notifications));
    }

    public function test_admin_sees_all_data(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $guru = User::factory()->create(['role' => 'guru']);

        $course = Course::factory()->create(['teacher_id' => $guru->id]);

        $response = $this->actingAs($admin)->getJson('/api/v1/courses');

        $response->assertOk();
        $courses = $response->json();

        $this->assertNotEmpty($courses);
        $this->assertContains($course->title, array_column($courses, 'title'));
    }

    public function test_siswa_cannot_submit_to_non_enrolled_course(): void
    {
        $guru = User::factory()->create(['role' => 'guru']);
        $siswa = User::factory()->create(['role' => 'siswa']);

        $course = Course::factory()->create(['teacher_id' => $guru->id]);
        $assignment = Assignment::factory()->create(['course_id' => $course->id]);

        $response = $this->actingAs($siswa)->postJson("/api/v1/assignments/{$assignment->id}/submit", [
            'note' => 'Trying to submit',
        ]);

        $response->assertStatus(403);
    }

    public function test_guru_cannot_see_other_guru_submissions(): void
    {
        $guruA = User::factory()->create(['role' => 'guru']);
        $guruB = User::factory()->create(['role' => 'guru']);
        $siswa = User::factory()->create(['role' => 'siswa']);

        $courseA = Course::factory()->create(['teacher_id' => $guruA->id]);
        $courseA->students()->attach($siswa->id, ['status' => 'active']);

        $assignment = Assignment::factory()->create(['course_id' => $courseA->id]);
        Submission::factory()->create([
            'assignment_id' => $assignment->id,
            'student_id' => $siswa->id,
        ]);

        $coursesB = $this->actingAs($guruB)->getJson('/api/v1/courses')->json();
        
        $this->assertNotContains($courseA->id, array_column($coursesB, 'id'));
    }

    public function test_two_browsers_two_users_data_isolated(): void
    {
        $userA = User::factory()->create(['role' => 'siswa', 'email' => 'siswa.a@test.com']);
        $userB = User::factory()->create(['role' => 'siswa', 'email' => 'siswa.b@test.com']);

        $guru = User::factory()->create(['role' => 'guru']);
        $courseA = Course::factory()->create(['teacher_id' => $guru->id, 'title' => 'Course A']);
        $courseB = Course::factory()->create(['teacher_id' => $guru->id, 'title' => 'Course B']);

        $courseA->students()->attach($userA->id, ['status' => 'active']);
        $courseB->students()->attach($userB->id, ['status' => 'active']);

        $responseBrowserA = $this->actingAs($userA)->getJson('/api/v1/courses');
        $responseBrowserB = $this->actingAs($userB)->getJson('/api/v1/courses');

        $responseBrowserA->assertOk();
        $responseBrowserB->assertOk();

        $coursesA = $responseBrowserA->json();
        $coursesB = $responseBrowserB->json();

        $this->assertContains('Course A', array_column($coursesA, 'title'));
        $this->assertNotContains('Course B', array_column($coursesA, 'title'));
        
        $this->assertContains('Course B', array_column($coursesB, 'title'));
        $this->assertNotContains('Course A', array_column($coursesB, 'title'));
    }
}
