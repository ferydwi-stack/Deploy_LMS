<?php

namespace App\Listeners;

use App\Events\SubmissionGraded;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendGradeNotification
{
    public function handle(SubmissionGraded $event): void
    {
        $submission = $event->submission;
        $student = $submission->student;

        app(NotificationService::class)->notifyStudentOfGrade(
            $student,
            $submission->assignment->title,
            $submission->score
        );
    }
}
