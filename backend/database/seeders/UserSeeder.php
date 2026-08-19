<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'admin@lms.com'],
            [
                'name' => 'Administrator LMS',
                'password' => Hash::make('password'),
                'role' => 'admin',
                'nisn_or_nip' => '100001',
            ]
        );

        User::updateOrCreate(
            ['email' => 'guru@lms.com'],
            [
                'name' => 'Budi Santoso, S.Pd (Guru)',
                'password' => Hash::make('password'),
                'role' => 'guru',
                'nisn_or_nip' => '19880312',
            ]
        );

        User::updateOrCreate(
            ['email' => 'siswa@lms.com'],
            [
                'name' => 'Ahmad Rizky (Siswa)',
                'password' => Hash::make('password'),
                'role' => 'siswa',
                'nisn_or_nip' => '20260001',
            ]
        );

        User::updateOrCreate(
            ['email' => 'siswa2@lms.com'],
            [
                'name' => 'Siti Nurhaliza (Siswa)',
                'password' => Hash::make('password'),
                'role' => 'siswa',
                'nisn_or_nip' => '20260002',
            ]
        );
    }
}
