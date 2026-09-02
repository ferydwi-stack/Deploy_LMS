<?php

namespace App\Enums;

enum UserRole: string
{
    case ADMIN = 'admin';
    case GURU = 'guru';
    case SISWA = 'siswa';

    public static function values(): array
    {
        return array_column(self::cases(), 'value');
    }
}
