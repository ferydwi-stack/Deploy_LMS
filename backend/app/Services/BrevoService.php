<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BrevoService
{
    public static function sendResetPasswordEmail(string $recipientEmail, string $recipientName, string $resetUrl): bool
    {
        $apiKey = env('BREVO_API_KEY', env('MAIL_PASSWORD'));
        $senderEmail = env('MAIL_FROM_ADDRESS', 'ferydwir27@gmail.com');
        $senderName = env('MAIL_FROM_NAME', 'EduSchool LMS');

        $htmlContent = '
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
                .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
                .logo { font-size: 24px; font-weight: 800; color: #2563eb; margin-bottom: 24px; display: inline-block; }
                .title { font-size: 20px; font-weight: 700; color: #1e293b; margin-bottom: 12px; }
                .text { font-size: 15px; line-height: 1.6; color: #475569; margin-bottom: 24px; }
                .btn { display: inline-block; background-color: #2563eb; color: #ffffff !important; text-decoration: none; padding: 14px 28px; border-radius: 12px; font-weight: 600; font-size: 15px; margin-bottom: 24px; }
                .footer { font-size: 13px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 20px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="card">
                <div class="logo">🎓 EduSchool LMS</div>
                <div class="title">Permintaan Reset Password</div>
                <p class="text">Halo, <strong>' . htmlspecialchars($recipientName) . '</strong>!<br>Kami menerima permintaan untuk mereset kata sandi akun Anda di platform EduSchool LMS. Klik tombol di bawah ini untuk membuat password baru:</p>
                <div style="text-align: center;">
                    <a href="' . htmlspecialchars($resetUrl) . '" class="btn" target="_blank">Reset Password Saya</a>
                </div>
                <p class="text" style="font-size: 13px; color: #64748b;">Tautan ini berlaku selama 60 menit. Jika Anda tidak meminta reset password, silakan abaikan email ini.</p>
                <div class="footer">
                    &copy; ' . date('Y') . ' EduSchool LMS - Dikembangkan untuk Pendidikan Digital Modern.
                </div>
            </div>
        </body>
        </html>';

        try {
            $response = Http::withHeaders([
                'api-key' => $apiKey,
                'Content-Type' => 'application/json',
                'Accept' => 'application/json',
            ])->post('https://api.brevo.com/v3/smtp/email', [
                'sender' => [
                    'name' => $senderName,
                    'email' => $senderEmail,
                ],
                'to' => [
                    [
                        'email' => $recipientEmail,
                        'name' => $recipientName,
                    ],
                ],
                'subject' => 'Permintaan Reset Password - EduSchool LMS',
                'htmlContent' => $htmlContent,
            ]);

            if ($response->successful()) {
                return true;
            }

            Log::error('Brevo API Error: ' . $response->body());
            throw new \Exception('Brevo API: ' . ($response->json('message') ?? $response->body()));
        } catch (\Throwable $e) {
            Log::error('Brevo Exception: ' . $e->getMessage());
            throw $e;
        }
    }
}
