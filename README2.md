# 📖 README2 — Panduan Running & Pembuatan Proyek

## Flow Pengembangan & Cara Menjalankan Sistem E-Learning

> Dokumen ini menjelaskan secara detail langkah-langkah pembuatan proyek dari nol, cara menjalankan di lokal, dan cara deploy ke production.

---

## 📋 Daftar Isi

- [Prasyarat (Prerequisites)](#-prasyarat-prerequisites)
- [Flow Pembuatan Proyek](#-flow-pembuatan-proyek)
- [Cara Menjalankan di Lokal](#-cara-menjalankan-di-lokal)
- [Flow Alur Kerja Aplikasi](#-flow-alur-kerja-aplikasi)
- [Cara Deploy ke Production](#-cara-deploy-ke-production)
- [Troubleshooting](#-troubleshooting)

---

## ⚙ Prasyarat (Prerequisites)

### Software yang Dibutuhkan

| Software | Versi Minimum | Fungsi | Download |
|----------|--------------|--------|----------|
| PHP | 8.2+ | Runtime backend Laravel | php.net |
| Composer | 2.x | PHP dependency manager | getcomposer.org |
| Node.js | 18+ | Runtime Frontend Next.js | nodejs.org |
| npm | 9+ | Node package manager | (bundled with Node.js) |
| MySQL | 8.0 | Database server | mysql.com |
| Git | 2.x | Version control | git-scm.com |
| Laragon (opsional) | 6.x | Local dev environment (Windows) | laragon.org |

### PHP Extensions yang Dibutuhkan
```
bcmath, ctype, curl, dom, fileinfo, json, mbstring,
openssl, pdo, pdo_mysql, tokenizer, xml, zip
```

---

## 🔨 Flow Pembuatan Proyek

### Tahap 1: Inisialisasi Backend (Laravel 12)

```bash
# 1. Buat proyek Laravel baru
composer create-project laravel/laravel backend

# 2. Masuk ke folder backend
cd backend

# 3. Install Laravel Sanctum untuk autentikasi API
composer require laravel/sanctum

# 4. Publish konfigurasi Sanctum
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
```

### Tahap 2: Desain Database (19 Migration Files)

Urutan pembuatan migrasi:

```bash
# Tabel utama (sudah ada dari Laravel)
# 0001_01_01_000000_create_users_table.php     → users, password_reset_tokens, sessions
# 0001_01_01_000001_create_cache_table.php      → cache, cache_locks
# 0001_01_01_000002_create_jobs_table.php       → jobs, job_batches, failed_jobs

# Tabel domain bisnis
php artisan make:migration create_courses_table
php artisan make:migration create_materials_table
php artisan make:migration create_assignments_table
php artisan make:migration create_submissions_table
php artisan make:migration create_personal_access_tokens_table
php artisan make:migration create_activity_logs_table
php artisan make:migration create_attendances_table
php artisan make:migration create_course_student_table
php artisan make:migration create_notifications_table

# Tabel tambahan (alter table)
php artisan make:migration add_submission_status_fields_to_submissions_table
php artisan make:migration add_exam_scores_to_course_student_table
php artisan make:migration add_profile_fields_to_users_table
php artisan make:migration add_attachment_fields_to_assignments_table
php artisan make:migration add_class_name_to_users_table
php artisan make:migration add_attendance_schedule_to_courses_table
php artisan make:migration create_settings_table
```

### Tahap 3: Buat Model Eloquent (9 Models)

```bash
php artisan make:model User        # (sudah ada, tinggal edit)
php artisan make:model Course
php artisan make:model Assignment
php artisan make:model Submission
php artisan make:model Material
php artisan make:model Attendance
php artisan make:model Notification
php artisan make:model ActivityLog
php artisan make:model Setting
```

**Relasi antar Model:**

```
User (1) ────────── (M) Course          → hasMany / belongsTo (teacher_id)
User (M) ────────── (M) Course          → belongsToMany via course_student (enrollment)
User (1) ────────── (M) Submission      → hasMany / belongsTo (student_id)
User (1) ────────── (M) Attendance      → hasMany / belongsTo (student_id)
User (1) ────────── (M) Notification    → hasMany / belongsTo (user_id)
User (1) ────────── (M) ActivityLog     → hasMany / belongsTo (user_id)
Course (1) ──────── (M) Assignment      → hasMany / belongsTo
Course (1) ──────── (M) Material        → hasMany / belongsTo
Course (1) ──────── (M) Attendance      → hasMany / belongsTo
Assignment (1) ──── (M) Submission      → hasMany / belongsTo
```

### Tahap 4: Buat Controller API (12 Controllers)

```bash
php artisan make:controller Api/AuthController
php artisan make:controller Api/AdminController
php artisan make:controller Api/CourseController
php artisan make:controller Api/AssignmentController
php artisan make:controller Api/SubmissionController
php artisan make:controller Api/MaterialController
php artisan make:controller Api/AttendanceController
php artisan make:controller Api/EnrollmentController
php artisan make:controller Api/NotificationController
php artisan make:controller Api/ReportController
php artisan make:controller Api/StudentStatsController
php artisan make:controller Api/TeacherStatsController
```

### Tahap 5: Buat Middleware, Policies, Services

```bash
# Middleware untuk cek role
php artisan make:middleware CheckRole

# Policy untuk otorisasi
php artisan make:policy CoursePolicy --model=Course
php artisan make:policy AssignmentPolicy --model=Assignment
php artisan make:policy SubmissionPolicy --model=Submission

# Service layer (manual create di app/Services/)
# - CourseService.php
# - AttendanceService.php
# - SubmissionService.php
# - NotificationService.php

# Events & Listeners
php artisan make:event SubmissionCreated
php artisan make:event SubmissionGraded
php artisan make:listener SendSubmissionNotification
php artisan make:listener SendGradeNotification
```

### Tahap 6: Definisikan API Routes

File: `backend/routes/api.php`

```
Route::prefix('v1')->group(function () {
    // Public routes (login, forgot/reset password)
    // Protected routes (auth:sanctum middleware)
    //   - courses, assignments, materials, submissions
    //   - attendances, notifications, profile, stats
    // Admin-only routes (auth:sanctum + role:admin)
    //   - admin/users, admin/settings, admin/stats
});
```

### Tahap 7: Inisialisasi Frontend (Next.js 15)

```bash
# Kembali ke root proyek
cd ..

# Buat proyek Next.js
npx create-next-app@latest Frontend --typescript --tailwind --app --src-dir=false

# Masuk ke folder Frontend
cd Frontend

# Install dependencies tambahan
npm install lucide-react xlsx axios clsx tailwind-merge
```

### Tahap 8: Buat Struktur Frontend

```
Frontend/
├── app/                    # Buat halaman per role
│   ├── admin/              # 7 halaman admin
│   ├── guru/               # 8 halaman guru
│   ├── siswa/              # 8 halaman siswa
│   ├── login/page.tsx      # Halaman login
│   └── reset-password/     # Halaman reset password
├── components/             # Komponen reusable
├── context/                # React Context
├── hooks/                  # Custom hooks
├── lib/api.ts              # API service layer
└── types/                  # TypeScript types
```

---

## 🚀 Cara Menjalankan di Lokal

### Step 1: Clone Repository

```bash
git clone https://github.com/ferydwi-stack/Sistem-E-learning.git
cd Sistem-E-learning
```

### Step 2: Setup Backend

```bash
# 1. Masuk folder backend
cd backend

# 2. Install PHP dependencies
composer install

# 3. Copy file environment
cp .env.example .env

# 4. Generate application key
php artisan key:generate

# 5. Konfigurasi database di file .env
#    Edit file backend/.env:
#    DB_CONNECTION=mysql
#    DB_HOST=127.0.0.1
#    DB_PORT=3306
#    DB_DATABASE=db_lms        ← nama database lokal
#    DB_USERNAME=root
#    DB_PASSWORD=               ← password MySQL lokal (kosong jika Laragon)

# 6. Buat database di MySQL
#    Buka MySQL client dan jalankan:
#    CREATE DATABASE db_lms;

# 7. Jalankan migrasi database
php artisan migrate

# 8. (Opsional) Jalankan seeder untuk data contoh
php artisan db:seed

# 9. Buat symbolic link untuk storage
php artisan storage:link

# 10. Jalankan backend server
php artisan serve
#     → Backend berjalan di http://127.0.0.1:8000
```

### Step 3: Setup Frontend

```bash
# Buka terminal baru, kembali ke root proyek
cd Frontend

# 1. Install Node.js dependencies
npm install

# 2. Buat file environment
#    Buat file Frontend/.env.local dengan isi:
#    NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api/v1

# 3. Jalankan development server
npm run dev
#     → Frontend berjalan di http://localhost:3000
```

### Step 4: Akses Aplikasi

```
Buka browser → http://localhost:3000

Login sebagai Admin:
  Email: admin@eduschool.sch.id
  Password: (sesuai yang di-seed atau yang Anda buat)
```

### Ringkasan Port & Service

| Service | URL | Port |
|---------|-----|------|
| Frontend (Next.js) | http://localhost:3000 | 3000 |
| Backend (Laravel) | http://127.0.0.1:8000 | 8000 |
| MySQL Database | localhost | 3306 |

---

## 🔄 Flow Alur Kerja Aplikasi

### Flow 1: Login → Dashboard

```
[Browser] → GET /login
    │
    ├── User mengisi email + password
    │
    ├── POST /api/v1/auth/login
    │   └── Backend: validasi → cek user → cek password
    │       ├── ✅ Berhasil → return access_token + user data
    │       └── ❌ Gagal → return 401 "Email atau password salah"
    │
    ├── Frontend: simpan token ke localStorage('lms_token')
    ├── Frontend: simpan user ke localStorage('lms_user')
    │
    └── Redirect berdasarkan role:
        ├── admin → /admin/dashboard
        ├── guru  → /guru/dashboard
        └── siswa → /siswa/dashboard
```

### Flow 2: Guru Membuat Kelas Baru

```
[Guru] → /guru/courses → Klik "Buat Kelas Baru"
    │
    ├── Redirect ke /guru/courses/new
    ├── Guru mengisi: Nama Kelas, Deskripsi
    │
    ├── POST /api/v1/courses
    │   Headers: Authorization: Bearer {token}
    │   Body: { title, description }
    │   └── Backend: validasi → set teacher_id = user.id → generate kode unik
    │       └── Insert ke tabel courses
    │
    └── Response: { course: { id, title, code, teacher } }
        └── Redirect kembali ke /guru/courses
```

### Flow 3: Siswa Gabung Kelas via Kode

```
[Siswa] → /siswa/courses → Masukkan Kode Kelas
    │
    ├── POST /api/v1/courses/enroll-by-code
    │   Body: { code: "ABC123" }
    │   └── Backend: cari course by code
    │       ├── Cek apakah siswa sudah enrolled
    │       ├── Insert ke tabel course_student (status: active)
    │       └── Kirim notifikasi ke guru
    │
    └── Response: { message: "Berhasil bergabung", course }
```

### Flow 4: Guru Buat Tugas → Siswa Submit → Guru Nilai

```
[Guru] Buat Tugas:
    POST /api/v1/assignments
    Body: FormData { course_id, title, instruction, due_date, attachment(file) }
    └── Insert ke tabel assignments + upload file ke storage
    └── Kirim notifikasi ke siswa enrolled

[Siswa] Submit Jawaban:
    POST /api/v1/assignments/{id}/submit
    Body: FormData { file, note }
    └── Insert ke tabel submissions + upload file
    └── Event: SubmissionCreated → Listener: SendSubmissionNotification (ke guru)

[Guru] Beri Nilai:
    PUT /api/v1/submissions/{id}/grade
    Body: { score: 85, teacher_feedback: "Bagus!" }
    └── Update tabel submissions (score, feedback, status='graded')
    └── Event: SubmissionGraded → Listener: SendGradeNotification (ke siswa)
```

### Flow 5: Absensi (Guru Input / Siswa Self-Attend)

```
[Guru] Input Absensi Kelas:
    POST /api/v1/courses/{id}/attendances
    Body: { date: "2026-08-21", attendances: [
        { student_id: 1, status: "hadir" },
        { student_id: 2, status: "izin", note: "Sakit" }
    ]}
    └── Bulk insert/update ke tabel attendances

[Siswa] Absen Mandiri (Self-Attend):
    POST /api/v1/attendances/self
    Body: { course_id: 5 }
    └── Backend: cek jadwal absensi (open_time ≤ now ≤ close_time)
        ├── ✅ Dalam waktu → Insert attendance (status: hadir)
        └── ❌ Di luar waktu → return 422 "Di luar jadwal absensi"
```

### Flow 6: Admin Import User Massal

```
[Admin] → /admin/users → Klik "Import Data"
    │
    ├── Upload file CSV/XLSX
    ├── Frontend: parse file dengan library XLSX
    │   └── Extract: name, email, role, class/subject
    │
    ├── Preview data yang akan diimport
    │
    ├── POST /api/v1/admin/users/bulk-import
    │   Body: { users: [{ name, email, role, password, ... }, ...] }
    │   └── Backend: loop → updateOrCreate per user
    │
    └── Response: { message: "Berhasil mengimpor 50 data pengguna" }
```

---

## 🌐 Cara Deploy ke Production

### Deploy Database (Railway MySQL)

```bash
# 1. Buat akun Railway → railway.app
# 2. Buat project baru → Add MySQL service
# 3. Catat credentials:
#    - Host: sakura.proxy.rlwy.net
#    - Port: 39395
#    - User: root
#    - Password: ***
#    - Database: railway

# 4. Export database lokal
mysqldump -u root db_lms --result-file=db_lms.sql

# 5. Import ke Railway MySQL
mysql -h sakura.proxy.rlwy.net -P 39395 -u root -p railway < db_lms.sql
```

### Deploy Backend (Railway - Nixpacks)

```bash
# 1. Buat file backend/nixpacks.toml:
[phases.setup]
nixPkgs = ["php83", "php83Extensions.pdo", "php83Extensions.pdo_mysql", ...]

[phases.install]
cmds = ["composer install --no-dev --optimize-autoloader"]

[start]
cmd = "php artisan storage:link --force || true && php artisan config:clear && php artisan serve --host=0.0.0.0 --port=${PORT:-8000}"

# 2. Buat file backend/Procfile:
web: php artisan storage:link --force || true && php artisan config:clear && php artisan serve --host=0.0.0.0 --port=$PORT

# 3. Rename Dockerfile → Dockerfile.bak (agar Railway pakai Nixpacks)

# 4. Set environment variables di Railway:
#    APP_ENV=production
#    APP_KEY=base64:...
#    DB_HOST=mysql.railway.internal
#    DB_PORT=3306
#    DB_DATABASE=railway
#    DB_USERNAME=root
#    DB_PASSWORD=***
#    PORT=80

# 5. Connect ke GitHub repo → Railway auto-deploy
```

### Deploy Frontend (Vercel)

```bash
# 1. Buat akun Vercel → vercel.com
# 2. Import GitHub repository
# 3. Set Root Directory: Frontend
# 4. Set environment variable:
#    NEXT_PUBLIC_API_URL=https://sistem-e-learning-production.up.railway.app/api/v1
# 5. Deploy → Vercel auto-build Next.js
```

### Arsitektur Production

```
User Browser
    │
    ├── https://your-app.vercel.app  (Frontend - Vercel)
    │       │
    │       │ API calls (HTTPS)
    │       ▼
    ├── https://sistem-e-learning-production.up.railway.app  (Backend - Railway)
    │       │
    │       │ MySQL connection (internal network)
    │       ▼
    └── mysql.railway.internal:3306  (Database - Railway MySQL)
```

---

## 🔧 Troubleshooting

### Masalah Umum

| Masalah | Penyebab | Solusi |
|---------|----------|--------|
| `CORS error` di browser | Backend tidak allow origin | Tambahkan `CORS_ALLOWED_ORIGINS` di `.env` |
| `401 Unauthenticated` | Token expired/invalid | Logout → Login ulang |
| `500 Internal Server Error` | Biasanya config cache | `php artisan config:clear && php artisan cache:clear` |
| `npm run build` error | TypeScript type error | Periksa error di terminal, fix type issues |
| File upload gagal | Storage link belum ada | `php artisan storage:link` |
| MySQL connection refused | DB belum running | Start MySQL service di Laragon/XAMPP |
| Railway deploy gagal | Dockerfile conflict | Rename `Dockerfile` → `Dockerfile.bak` |
| PowerShell mysqldump garbled | UTF-16LE encoding | Gunakan `mysqldump --result-file=file.sql` |

### Perintah Debug Berguna

```bash
# Backend
php artisan config:clear          # Clear cached config
php artisan cache:clear           # Clear application cache
php artisan route:list            # List semua API routes
php artisan tinker                # Interactive PHP shell

# Frontend
npm run build                     # Build dan cek error
npm run dev                       # Dev server dengan hot reload

# Database
php artisan migrate:status        # Cek status migrasi
php artisan migrate:fresh --seed  # Reset database + seed
```

---

*Dokumen ini dibuat sebagai panduan lengkap untuk memahami, menjalankan, dan men-deploy proyek Sistem E-Learning.*
