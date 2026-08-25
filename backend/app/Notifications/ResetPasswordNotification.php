<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public string $url;

    public function __construct(string $url)
    {
        $this->url = $url;
    }

    public function via($notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Permintaan Reset Password - EduSchool LMS')
            ->greeting('Halo, ' . $notifiable->name . '!')
            ->line('Anda menerima email ini karena kami menerima permintaan reset password untuk akun Anda di EduSchool LMS.')
            ->action('Reset Password Saya', $this->url)
            ->line('Tautan reset password ini berlaku selama 60 menit.')
            ->line('Jika Anda tidak merasa meminta reset password, abaikan email ini dan akun Anda tetap aman.')
            ->salutation('Salam hormat,' . "\n" . 'Tim EduSchool LMS');
    }
}
