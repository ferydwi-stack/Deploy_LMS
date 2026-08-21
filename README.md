# 🎓 EduSchool LMS - Sistem E-Learning Modern

<div align="center">

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Laravel](https://img.shields.io/badge/Laravel-12.0-FF2D20?style=for-the-badge&logo=laravel)](https://laravel.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)](https://www.mysql.com/)

**Platform Pembelajaran Daring (LMS) Full-Stack Berkinerja Tinggi & Responsif**

🌐 **Frontend Live**: [https://sistem-e-learning-g9xn.vercel.app](https://sistem-e-learning-g9xn.vercel.app)  
🚀 **Backend API Live**: [https://deploylms-production.up.railway.app/api/v1](https://deploylms-production.up.railway.app/api/v1)

</div>

---

## 📑 Daftar Isi
- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama & Keunggulan](#-fitur-utama--keunggulan)
- [Akun Demo Siap Pakai](#-akun-demo-siap-pakai)
- [Fitur Berdasarkan Peran (Role)](#-fitur-berdasarkan-peran-role)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Struktur Folder](#-struktur-folder)
- [Panduan Instalasi & Menjalankan di Lokal](#-panduan-instalasi--menjalankan-di-lokal)
- [Konfigurasi Environment (.env)](#-konfigurasi-environment-env)
- [Automated Testing](#-automated-testing)

---

## 📖 Tentang Proyek

**EduSchool LMS** adalah sistem manajemen pembelajaran digital terpadu yang dirancang khusus untuk institusi pendidikan menengah (SMA/SMK). Sistem ini memfasilitasi seluruh proses kegiatan belajar-mengajar digital mulai dari distribusi materi ajar, pengumpulan tugas & penilaian terstruktur, presensi kelas harian mandiri, hingga rekapitulasi laporan nilai dan kehadiran secara instan.

Dibangun dengan arsitektur modern memisahkan **Frontend SPA (Next.js 15 App Router)** dan **Backend API (Laravel 12 RESTful API)** dengan basis data **MySQL 8.0**.

---

## ⚡ Fitur Utama & Keunggulan

1. **Auto-Update Real-time Tanpa Refresh Manual**:
   - Menggunakan pendekatan *Hybrid Event-Driven Invalidation* via `BroadcastChannel` dan *Window Focus / Online Revalidation*.
   - Saat Guru membuat tugas, menginput nilai, atau Siswa mengumpulkan tugas dan mengisi absen, data di layar semua pengguna yang relevan langsung terbarui secara otomatis dalam hitungan milidetik tanpa perlu memuat ulang halaman.
   - Hemat daya dan kuota server dengan *Automatic Tab Visibility Throttling* (berhenti otomatis saat tab di-minimize).
2. **Mobile First & Fully Responsive**:
   - Tampilan dioptimalkan untuk perangkat mobile/smartphone hingga layar desktop lebar dengan transisi interaktif.
3. **Presensi Digital Mandiri & Terjadwal**:
   - Guru dapat menentukan jendela jam absensi kelas (misal: 07:00 - 16:00 WIB).
   - Siswa melakukan check-in mandiri dengan validasi waktu nyata dan isolasi presensi per kelas.
4. **Penilaian Terstruktur (Tugas, UTS & UAS)**:
   - Nilai tugas disertai *teacher feedback*, serta input nilai ujian semester yang terisolasi independen per mata pelajaran.
5. **Dukungan Tautan Modul & Pratinjau Interaktif**:
   - Materi modul mendukung link eksternal (Google Drive, YouTube, LMS Doc) dengan ekstraksi URL otomatis dan modal pratinjau.
6. **Manajemen Pengguna Massal**:
   - Admin dapat menambah pengguna satu per satu atau melakukan *Bulk Import* puluhan data akun via template berkas Excel/CSV.

---

## 🔑 Akun Demo Siap Pakai

Semua akun di bawah telah terdaftar di sistem produksi dan siap digunakan untuk pengujian:

| Peran (Role) | Email Login | Password | Hak Akses & Tugas |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@lms.com` | `password` | Manajemen user, konfigurasi sistem, dan rekap laporan global. |
| **Guru Pengajar** | `guru@lms.com` | `password` | Kelola kelas, upload materi, buat tugas, beri nilai, dan jadwal absen. |
| **Peserta Didik** | `siswa@lms.com` | `password` | Masuk kelas, baca materi, kumpul tugas, dan absensi mandiri. |
| **Peserta Didik 2** | `siswa2@lms.com` | `password` | Akun siswa sekunder untuk uji coba interaksi multi-siswa. |

---

## 👥 Fitur Berdasarkan Peran (Role)

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  ADMINISTRATOR  │       │  GURU PENGAJAR  │       │ PESERTA DIDIK   │
├─────────────────┤       ├─────────────────┤       ├─────────────────┤
│ • Ringkasan     │       │ • Buat & Kelola │       │ • Gabung Kelas  │
│   Statistik LMS │       │   Mata Pelajaran│       │   (Kode / ID)   │
│ • CRUD Akun     │       │ • Unggah Modul  │       │ • Akses Materi  │
│   Pengguna      │       │   (Link / File) │       │   Pembelajaran  │
│ • Bulk Import   │       │ • Buat Tugas &  │       │ • Kumpul Tugas  │
│   CSV / Excel   │       │   Tenggat Waktu │       │   (Submit Jawaban)
│ • Pengaturan    │       │ • Penilaian &   │       │ • Presensi      │
│   Sekolah       │       │   Feedback      │       │   Mandiri       │
│ • Rekapitulasi  │       │ • Input Nilai   │       │ • Notifikasi    │
│   Laporan Presensi│     │   UTS & UAS     │       │   Lonceng Live  │
│ • Ekspor XLSX   │       │ • Atur Jam      │       │ • Cek Rapor &   │
│   & CSV         │       │   Presensi Kelas│       │   Nilai Saya    │
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

---

## 🏗 Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           CLIENT (Browser)                              │
│         Next.js 15 (React 19, TypeScript, Tailwind CSS v4)              │
│   • useRealtimeData Hook  • BroadcastChannel Sync  • Focus Revalidation │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ HTTPS REST API
                                     │ Bearer Token (Sanctum)
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         BACKEND SERVER (Railway)                        │
│                 Laravel 12 Framework (PHP 8.2+)                         │
│                                                                         │
│   Controllers: Auth, Course, Assignment, Submission, Material,          │
│                Attendance, Admin, Notification, Report                  │
│   Middlewares: auth:sanctum, check.role (admin/guru/siswa)              │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Eloquent ORM
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        DATABASE (MySQL 8.0)                             │
│   • users           • courses          • course_student                 │
│   • materials       • assignments      • submissions                    │
│   • attendances     • notifications    • settings                       │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Struktur Folder

```
Sistem-E-learning-main/
├── Frontend/                      # Aplikasi Web Next.js 15
│   ├── app/                       # App Router Pages
│   │   ├── admin/                 # Halaman Dashboard, User, Reports, Settings
│   │   ├── guru/                  # Halaman Kelas, Materi, Tugas, Absensi
│   │   ├── siswa/                 # Halaman Belajar, Tugas, Absensi, Rapor
│   │   ├── login/                 # Halaman Autentikasi
│   │   └── reset-password/        # Halaman Reset Password
│   ├── components/                # Komponen UI (Navbar, Sidebar, Modals)
│   ├── hooks/                     # Custom Hooks (useAuth, useRealtimeData, useNotifications)
│   ├── lib/                       # API Client & Helper (`api.ts`)
│   └── types/                     # TypeScript Interface Models
│
├── backend/                       # RESTful API Laravel 12
│   ├── app/
│   │   ├── Http/Controllers/Api/  # REST API Controllers
│   │   ├── Models/                # Eloquent ORM Models
│   │   └── Services/              # Business Logic Services
│   ├── database/
│   │   ├── migrations/            # Struktur Skema Database
│   │   └── seeders/               # Akun & Pengaturan Awal
│   └── routes/
│       └── api.php                # Rute Endpoints API
│
└── Data_Import_Akun_Massal_50_User.xlsx  # Template Import Pengguna
```

---

## 🛠 Panduan Instalasi & Menjalankan di Lokal

### 1. Prasyarat Sistem
* **Node.js**: Versi 18+ (Rekomendasi v20+)
* **PHP**: Versi 8.2+
* **Composer**: Versi 2.x
* **MySQL Server**: Versi 8.0 (atau menggunakan Laragon / XAMPP)

---

### 2. Menjalankan Backend (Laravel)

1. Masuk ke direktori backend:
   ```bash
   cd backend
   ```
2. Install dependensi PHP:
   ```bash
   composer install
   ```
3. Salin file environment:
   ```bash
   cp .env.example .env
   ```
4. Sesuaikan konfigurasi database di `.env`:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=lms_db
   DB_USERNAME=root
   DB_PASSWORD=
   ```
5. Generate application key & jalankan migrasi database:
   ```bash
   php artisan key:generate
   php artisan migrate --seed
   ```
6. Jalankan server lokal:
   ```bash
   php artisan serve
   ```
   *Backend akan berjalan di `http://127.0.0.1:8000`.*

---

### 3. Menjalankan Frontend (Next.js)

1. Buka terminal baru dan masuk ke direktori frontend:
   ```bash
   cd Frontend
   ```
2. Install dependensi Node.js:
   ```bash
   npm install
   ```
3. Konfigurasi file `.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1
   ```
   *(Atau arahkan ke URL Railway: `https://deploylms-production.up.railway.app/api/v1`)*
4. Jalankan server pengembangan Next.js:
   ```bash
   npm run dev
   ```
   *Frontend akan berjalan di `http://localhost:3000`.*

---

## 🌐 Konfigurasi Environment Production

| Variabel | Letak File | Nilai Production |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `Frontend/.env.local` / Vercel | `https://deploylms-production.up.railway.app/api/v1` |
| `APP_URL` | `backend/.env` / Railway | `https://deploylms-production.up.railway.app` |
| `FRONTEND_URL` | `backend/.env` / Railway | `https://sistem-e-learning-g9xn.vercel.app` |
| `SESSION_DOMAIN` | `backend/.env` / Railway | `up.railway.app` |

---

## 🧪 Automated Testing

Proyek ini telah diverifikasi menggunakan *Automated E2E Testing Runner* yang menguji seluruh alur peran (Admin, Guru, Siswa 1, Siswa 2) pada 53 skenario fitur lengkap dengan tingkat kelolosan **100% (53/53 Passed)**.

Untuk memeriksa kesehatan kompilasi Next.js:
```bash
cd Frontend
npm run build
```
*(Seluruh 36 halaman rute terkompilasi optimal tanpa error type-checking).*

---

<div align="center">

**Dikembangkan untuk Mendukung Pendidikan Digital Indonesia 🇮🇩**

</div>
