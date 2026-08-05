<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Collection;

class NotificationService
{
    public function send(User $user, string $type, string $title, string $message, ?array $data = null): Notification
    {
        return Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'title' => $title,
            'message' => $message,
            'data' => $data,
        ]);
    }

    public function getNotifications(User $user, int $limit = 50): Collection
    {
        return Notification::where('user_id', $user->id)
            ->latest()
            ->limit($limit)
            ->get();
    }

    public function getUnreadCount(User $user): int
    {
        return Notification::where('user_id', $user->id)
            ->unread()
            ->count();
    }

    public function markAsRead(Notification $notification): void
    {
        $notification->markAsRead();
    }

    public function markAllAsRead(User $user): void
    {
        Notification::where('user_id', $user->id)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);
    }

    public function notifyTeacherOfSubmission(User $teacher, string $studentName, string $assignmentTitle, int $assignmentId): void
    {
        $this->send(
            $teacher,
            'submission',
            'Tugas Baru Dikumpulkan',
            "{$studentName} telah mengumpulkan tugas \"{$assignmentTitle}\"",
            ['assignment_id' => $assignmentId]
        );
    }

    public function notifyStudentOfGrade(User $student, string $assignmentTitle, int $score): void
    {
        $this->send(
            $student,
            'grade',
            'Tugas Telah Dinilai',
            "Tugas \"{$assignmentTitle}\" telah dinilai. Nilai: {$score}",
            ['score' => $score]
        );
    }

    public function notifyTeacherOfEnrollment(User $teacher, string $studentName, string $courseTitle, int $courseId): void
    {
        $this->send(
            $teacher,
            'enrollment',
            'Siswa Baru Bergabung',
            "{$studentName} telah bergabung ke kelas \"{$courseTitle}\"",
            ['course_id' => $courseId]
        );
    }
}
