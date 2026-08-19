<?php

namespace App\Listeners;

use App\Events\SubmissionCreated;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendSubmissionNotification
{
    public function handle(SubmissionCreated $event): void
    {
        $submission = $event->submission;
        $teacher = $submission->assignment->course->teacher;
        $student = $submission->student;

        app(NotificationService::class)->notifyTeacherOfSubmission(
            $teacher,
            $student->name,
            $submission->assignment->title,
            $submission->assignment->id
        );
    }
}
