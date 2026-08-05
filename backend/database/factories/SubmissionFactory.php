<?php

namespace Database\Factories;

use App\Models\Assignment;
use App\Models\Submission;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class SubmissionFactory extends Factory
{
    protected $model = Submission::class;

    public function definition(): array
    {
        return [
            'assignment_id' => Assignment::factory(),
            'student_id' => User::factory()->create(['role' => 'siswa'])->id,
            'file_path' => 'tugas/sample.pdf',
            'original_filename' => 'sample.pdf',
            'note' => fake()->sentence(),
            'status' => 'submitted',
            'submitted_at' => now(),
        ];
    }
}
