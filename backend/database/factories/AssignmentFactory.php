<?php

namespace Database\Factories;

use App\Models\Assignment;
use App\Models\Course;
use Illuminate\Database\Eloquent\Factories\Factory;

class AssignmentFactory extends Factory
{
    protected $model = Assignment::class;

    public function definition(): array
    {
        return [
            'course_id' => Course::factory(),
            'title' => fake()->sentence(4),
            'instruction' => fake()->paragraph(),
            'due_date' => fake()->dateTimeBetween('now', '+1 month'),
        ];
    }
}
