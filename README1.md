# 📚 Sistem E-Learning (EduSchool LMS)

## Penjelasan Lengkap Proyek

> **Sistem Manajemen Pembelajaran (LMS)** berbasis web modern yang dirancang untuk mendukung kegiatan belajar-mengajar secara digital di lingkungan sekolah menengah (SMA/SMK). Sistem ini menghubungkan tiga aktor utama: **Administrator**, **Guru**, dan **Siswa** dalam satu ekosistem pembelajaran terpadu.

---

## 📋 Daftar Isi

- [Deskripsi Proyek](#-deskripsi-proyek)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
- [Fitur per Role](#-fitur-per-role)
- [Struktur Folder Proyek](#-struktur-folder-proyek)
- [Database Schema (ERD Textual)](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Deployment Architecture](#-deployment-architecture)

---

## 🎯 Deskripsi Proyek

Sistem E-Learning ini adalah aplikasi **full-stack** yang terdiri dari:

| Komponen | Teknologi | Deskripsi |
|----------|-----------|-----------|
| **Frontend** | Next.js 15 + React 19 + TypeScript | Single Page Application (SPA) dengan Server-Side Rendering |
| **Backend** | Laravel 12 + PHP 8.2+ | REST API dengan autentikasi token (Sanctum) |
| **Database** | MySQL 8.0 | Relational database dengan 11 tabel utama |
| **Styling** | Tailwind CSS v4 | Utility-first CSS framework |
| **Icons** | Lucide React | Modern icon library |

### Tujuan Sistem
1. Menyediakan platform pembelajaran digital yang terstruktur
2. Memfasilitasi pengelolaan kelas, materi, tugas, dan penilaian secara online
3. Menyediakan sistem absensi digital dengan penjadwalan otomatis
4. Memberikan laporan dan rekapitulasi nilai secara real-time
5. Mendukung manajemen pengguna secara massal (import CSV/XLSX)

---

## 🏗 Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER (Client)                      │
│                   Next.js 15 + React 19 SPA                 │
│         Tailwind CSS v4 · Lucide Icons · TypeScript          │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/HTTPS (REST API)
                           │ Bearer Token (Sanctum)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND API SERVER                         │
│               Laravel 12 · PHP 8.2+ · Sanctum               │
│                                                              │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │ Auth     │ │ Course   │ │ Assignment│ │ Admin    │       │
│  │Controller│ │Controller│ │Controller │ │Controller│       │
│  └────┬─────┘ └────┬─────┘ └────┬──────┘ └────┬─────┘      │
│       │             │            │              │            │
│  ┌────┴─────┐ ┌────┴─────┐ ┌───┴───────┐ ┌────┴─────┐     │
│  │ Services │ │ Policies │ │ Events    │ │ Listeners│      │
│  └──────────┘ └──────────┘ └───────────┘ └──────────┘      │
│                                                              │
│  ┌──────────────────────────────────────────────────┐       │
│  │           Middleware Layer                        │       │
│  │  auth:sanctum  ·  role:admin  ·  CheckRole       │       │
│  └──────────────────────────────────────────────────┘       │
└──────────────────────────┬──────────────────────────────────┘
                           │ Eloquent ORM
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                     MySQL 8.0 DATABASE                       │
│                                                              │
│  users · courses · course_student · assignments              │
│  submissions · materials · attendances · notifications       │
│  activity_logs · settings · personal_access_tokens           │
└─────────────────────────────────────────────────────────────┘
```

### Pola Arsitektur
- **Frontend**: Component-Based Architecture (React) dengan Custom Hooks pattern
- **Backend**: MVC + Service Layer + Policy-based Authorization + Event-Driven Notifications
- **Komunikasi**: RESTful API dengan JSON response
- **Autentikasi**: Token-based (Laravel Sanctum Personal Access Token)

---

## 🛠 Teknologi yang Digunakan

### Frontend Stack
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| Next.js | 15.1.7+ | Framework React dengan SSR/SSG |
| React | 19.0.0 | Library UI komponen |
| TypeScript | 5.7.3 | Static typing untuk JavaScript |
| Tailwind CSS | 4.0.7 | Utility-first CSS framework |
| Lucide React | 0.475.0 | Library ikon SVG |
| XLSX | 0.18.5 | Parser file Excel untuk import massal |
| Axios | 1.7.9 | HTTP client (cadangan) |

### Backend Stack
| Teknologi | Versi | Fungsi |
|-----------|-------|--------|
| PHP | 8.2+ | Bahasa pemrograman server |
| Laravel | 12.0 | Framework PHP MVC |
| Laravel Sanctum | 4.3 | API token authentication |
| MySQL | 8.0 | Relational database |
| Eloquent ORM | - | Object-Relational Mapping |

### DevOps & Deployment
| Platform | Fungsi |
|----------|--------|
| Vercel | Hosting Frontend (Next.js) |
| Railway | Hosting Backend (Laravel) + Database (MySQL) |
| GitHub | Version control & CI/CD trigger |

---

## 👥 Fitur per Role

### 🔐 Role: ADMIN (Super Administrator)

| Fitur | Halaman | Deskripsi |
|-------|---------|-----------|
| Dashboard Admin | `/admin/dashboard` | Statistik realtime: total user, guru, siswa, kelas, tugas, tingkat kehadiran |
| Manajemen Pengguna | `/admin/users` | CRUD user (Admin/Guru/Siswa), reset password, import massal CSV/XLSX |
| Tambah User | `/admin/users/add` | Form tambah pengguna baru |
| Edit User | `/admin/users/edit` | Form edit data pengguna |
| Daftar Kelas | `/admin/courses` | Melihat semua kelas dari seluruh guru |
| Daftar Tugas | `/admin/assignments` | Melihat semua tugas dari seluruh kelas |
| Laporan Nilai | `/admin/reports` | Rekapitulasi nilai UTS/UAS seluruh siswa (bisa export) |
| Pengaturan Platform | `/admin/settings` | Tahun ajaran, semester, nama sekolah, preferensi akses |
| Profil Admin | `/admin/profile` | Edit profil administrator, statistik pengguna |

### 👨‍🏫 Role: GURU (Pengajar)

| Fitur | Halaman | Deskripsi |
|-------|---------|-----------|
| Dashboard Guru | `/guru/dashboard` | Statistik kelas, siswa, tugas, tingkat kehadiran |
| Manajemen Kelas | `/guru/courses` | Membuat, melihat, menghapus kelas pembelajaran |
| Buat Kelas Baru | `/guru/courses/new` | Form pembuatan kelas dengan kode unik |
| Manajemen Tugas | `/guru/tugas` | Membuat tugas, melihat pengumpulan, memberikan nilai |
| Buat Tugas | `/guru/tugas/create` | Form pembuatan tugas dengan lampiran file |
| Manajemen Materi | `/guru/materi` | Upload dan kelola materi pembelajaran (PDF, dokumen) |
| Upload Materi | `/guru/materi/upload` | Form upload file materi |
| Absensi Kelas | `/guru/absensi` | Pencatatan kehadiran siswa per kelas per tanggal |
| Daftar Tugas | `/guru/assignments` | Melihat semua tugas yang telah dibuat |
| Laporan Nilai | `/guru/reports` | Input/edit nilai UTS & UAS per siswa |
| Profil Guru | `/guru/profile` | Edit profil, mata pelajaran, statistik kelas |

### 👨‍🎓 Role: SISWA (Peserta Didik)

| Fitur | Halaman | Deskripsi |
|-------|---------|-----------|
| Dashboard Siswa | `/siswa/dashboard` | Statistik kelas yang diikuti, tugas pending, kehadiran |
| Kelas Saya | `/siswa/courses` | Daftar kelas yang diikuti, gabung kelas baru via kode |
| Tugas Saya | `/siswa/tugas` | Melihat tugas, mengunduh lampiran, mengumpulkan jawaban |
| Submit Tugas | `/siswa/tugas/submit` | Form pengumpulan tugas dengan upload file |
| Materi Pelajaran | `/siswa/materi` | Mengunduh materi pembelajaran dari guru |
| Absensi Saya | `/siswa/absensi` | Self-attendance (absen mandiri), riwayat kehadiran |
| Daftar Tugas | `/siswa/assignments` | Ringkasan seluruh tugas aktif |
| Nilai Saya | `/siswa/reports` | Melihat nilai UTS/UAS per mata pelajaran |
| Profil Siswa | `/siswa/profile` | Edit profil, NISN, kelas |

### 🔑 Halaman Umum (Semua Role)

| Halaman | Path | Deskripsi |
|---------|------|-----------|
| Login | `/login` | Autentikasi email + password |
| Reset Password | `/reset-password` | Lupa password via email verification |
| Landing | `/` | Redirect ke halaman login |

---

## 📁 Struktur Folder Proyek

```
Sistem-E-learning-main/
│
├── Frontend/                          # Next.js 15 Frontend Application
│   ├── app/                           # App Router (Next.js 15)
│   │   ├── layout.tsx                 # Root layout (HTML head, LmsProvider)
│   │   ├── page.tsx                   # Landing page (redirect ke /login)
│   │   ├── globals.css                # Global CSS + Tailwind imports
│   │   ├── login/page.tsx             # Halaman login
│   │   ├── reset-password/page.tsx    # Halaman reset password
│   │   ├── admin/                     # Halaman-halaman Admin
│   │   ├── guru/                      # Halaman-halaman Guru
│   │   └── siswa/                     # Halaman-halaman Siswa
│   │
│   ├── components/                    # Komponen reusable
│   │   ├── DashboardLayout.tsx        # Layout utama dashboard (sidebar + header)
│   │   ├── HeadlineAnimation.tsx      # Animasi headline login
│   │   └── TypewriterText.tsx         # Efek typewriter
│   │
│   ├── context/LmsContext.tsx         # React Context (global state provider)
│   ├── hooks/                         # Custom React Hooks
│   │   ├── useAuth.ts                 # Hook autentikasi (login/logout/me)
│   │   ├── useNotifications.ts        # Hook notifikasi realtime
│   │   └── useRealtimeData.ts         # Hook polling data otomatis
│   │
│   ├── lib/api.ts                     # API service layer (fetchApi, api.*)
│   ├── types/                         # TypeScript type definitions
│   ├── .env.local                     # Environment variables
│   ├── next.config.mjs                # Next.js configuration
│   └── package.json                   # Frontend dependencies
│
├── backend/                           # Laravel 12 Backend API
│   ├── app/
│   │   ├── Http/Controllers/Api/      # 12 API Controllers
│   │   ├── Http/Middleware/           # CheckRole middleware
│   │   ├── Http/Requests/            # Form Request Validation
│   │   ├── Models/                    # 9 Eloquent Models
│   │   ├── Services/                  # 4 Business Logic Services
│   │   ├── Policies/                  # 3 Authorization Policies
│   │   ├── Events/                    # 2 Event Classes
│   │   └── Listeners/                 # 2 Event Listeners
│   │
│   ├── database/migrations/           # 19 Migration Files
│   ├── routes/api.php                 # API Routes definition
│   ├── nixpacks.toml                  # Railway build config
│   ├── Procfile                       # Railway startup command
│   └── composer.json                  # Backend dependencies
│
├── postman/                           # Postman API collection
├── Data_Import_Akun_Massal_50_User.xlsx
└── .gitignore
```

---

## 🗄 Database Schema

### Tabel & Kolom Lengkap

#### 1. `users` — Pengguna Sistem
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | BIGINT PK AI | Primary key |
| name | VARCHAR(255) | Nama lengkap |
| email | VARCHAR(255) UNIQUE | Email (untuk login) |
| password | VARCHAR(255) | Password (bcrypt hash) |
| role | ENUM('admin','guru','siswa') | Role pengguna |
| nisn_or_nip | VARCHAR NULL | NISN (siswa) / NIP (guru) |
| class_name | VARCHAR NULL | Nama kelas (siswa) |
| phone | VARCHAR(20) NULL | Nomor telepon |
| bio | TEXT NULL | Bio/deskripsi |
| subject | VARCHAR NULL | Mata pelajaran (guru) |
| specialization | VARCHAR NULL | Spesialisasi (guru) |

#### 2. `courses` — Kelas Pembelajaran
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | BIGINT PK AI | Primary key |
| title | VARCHAR(255) | Nama kelas/mata pelajaran |
| description | TEXT NULL | Deskripsi kelas |
| teacher_id | FK → users.id | ID guru pengajar |
| code | VARCHAR UNIQUE | Kode kelas (untuk enroll) |
| attendance_open_time | TIME NULL | Waktu buka absensi |
| attendance_close_time | TIME NULL | Waktu tutup absensi |

#### 3. `course_student` — Pivot: Siswa ↔ Kelas
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| course_id | FK → courses.id | ID kelas |
| student_id | FK → users.id | ID siswa |
| status | ENUM('active','dropped') | Status enrollment |
| uts_score | INT NULL | Nilai UTS |
| uas_score | INT NULL | Nilai UAS |

#### 4. `assignments` — Tugas
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | BIGINT PK AI | Primary key |
| course_id | FK → courses.id | ID kelas |
| title | VARCHAR(255) | Judul tugas |
| instruction | TEXT NULL | Instruksi tugas |
| attachment_path | VARCHAR NULL | Path file lampiran |
| attachment_name | VARCHAR NULL | Nama asli file |
| due_date | DATETIME | Tenggat pengumpulan |

#### 5. `submissions` — Pengumpulan Tugas
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| id | BIGINT PK AI | Primary key |
| assignment_id | FK → assignments.id | ID tugas |
| student_id | FK → users.id | ID siswa |
| file_path | VARCHAR NULL | Path file jawaban |
| original_filename | VARCHAR NULL | Nama asli file |
| note | TEXT NULL | Catatan siswa |
| score | INT NULL | Nilai (0-100) |
| teacher_feedback | TEXT NULL | Feedback dari guru |
| status | ENUM('submitted','graded','late') | Status |
| submitted_at | DATETIME | Waktu pengumpulan |

#### 6. `materials` — Materi Pelajaran
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| course_id | FK → courses.id | ID kelas |
| title | VARCHAR(255) | Judul materi |
| content | TEXT NULL | Konten/deskripsi materi |
| file_path | VARCHAR NULL | Path file materi |

#### 7. `attendances` — Absensi
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| course_id | FK → courses.id | ID kelas |
| student_id | FK → users.id | ID siswa |
| date | DATE | Tanggal absensi |
| status | ENUM('hadir','izin','sakit','alpa') | Status kehadiran |
| note | TEXT NULL | Catatan |

#### 8. `notifications` — Notifikasi
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| user_id | FK → users.id | ID penerima |
| type | VARCHAR | Tipe notifikasi |
| title | VARCHAR | Judul |
| message | TEXT | Isi pesan |
| data | JSON NULL | Data tambahan |
| read_at | TIMESTAMP NULL | Waktu dibaca |

#### 9. `activity_logs` — Log Aktivitas
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| user_id | FK → users.id | ID pengguna |
| action | VARCHAR | Aksi |
| entity_type | VARCHAR | Tipe entitas |
| entity_id | BIGINT NULL | ID entitas |
| changes | JSON NULL | Data perubahan |
| ip_address | VARCHAR(45) NULL | IP address |

#### 10. `settings` — Pengaturan Platform
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| key | VARCHAR UNIQUE | Kunci pengaturan |
| value | TEXT NULL | Nilai pengaturan |

#### 11. `personal_access_tokens` — Token API Sanctum
| Kolom | Tipe | Deskripsi |
|-------|------|-----------|
| tokenable_type / tokenable_id | Polymorphic | Ref ke user |
| name | VARCHAR | Nama token |
| token | VARCHAR(64) UNIQUE | Token hash |
| abilities | TEXT NULL | Permission |

---

## 🔌 API Endpoints

### Autentikasi (Public)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| POST | `/api/v1/auth/login` | Login (email + password) |
| POST | `/api/v1/auth/forgot-password` | Kirim link reset password |
| POST | `/api/v1/auth/reset-password` | Reset password dengan token |

### Autentikasi (Authenticated — Bearer Token)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/v1/auth/me` | Data user yang login |
| POST | `/api/v1/auth/logout` | Logout (hapus token) |
| PUT | `/api/v1/auth/profile` | Update profil sendiri |

### Kelas & Enrollment
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/v1/courses` | Daftar kelas (sesuai role) |
| GET | `/api/v1/available-courses` | Kelas tersedia (siswa) |
| POST | `/api/v1/courses` | Buat kelas (guru/admin) |
| PUT | `/api/v1/courses/{id}` | Edit kelas |
| DELETE | `/api/v1/courses/{id}` | Hapus kelas |
| POST | `/api/v1/courses/{id}/enroll` | Gabung kelas |
| POST | `/api/v1/courses/enroll-by-code` | Gabung via kode |
| PUT | `/api/v1/courses/{id}/students/{sid}/grades` | Input nilai |

### Tugas & Pengumpulan
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/v1/assignments` | Daftar tugas |
| POST | `/api/v1/assignments` | Buat tugas (guru) |
| POST | `/api/v1/assignments/{id}/submit` | Submit jawaban (siswa) |
| PUT | `/api/v1/submissions/{id}/grade` | Beri nilai (guru) |

### Materi, Absensi, Notifikasi
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET/POST/DELETE | `/api/v1/materials` | CRUD materi |
| GET/POST | `/api/v1/courses/{id}/attendances` | Absensi kelas |
| POST | `/api/v1/attendances/self` | Absen mandiri (siswa) |
| GET/PUT | `/api/v1/notifications` | Notifikasi |

### Admin Only (role:admin middleware)
| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| GET | `/api/v1/admin/stats` | Statistik dashboard |
| CRUD | `/api/v1/admin/users` | Manajemen user |
| POST | `/api/v1/admin/users/bulk-import` | Import massal |
| GET/PUT | `/api/v1/admin/settings` | Pengaturan platform |

---

## 🚀 Deployment Architecture

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│     VERCEL        │     │     RAILWAY       │     │   RAILWAY MySQL  │
│  (Frontend Host)  │────▶│  (Backend Host)   │────▶│   (Database)     │
│                   │     │                   │     │                  │
│  Next.js 15 SSG   │ API │  Laravel 12       │ SQL │  MySQL 8.0       │
│  Static Export    │ ──▶ │  PHP 8.3          │ ──▶ │  Host: internal  │
│                   │     │  Nixpacks build   │     │  Port: 3306      │
└──────────────────┘     └──────────────────┘     └──────────────────┘
```

---

*Dokumentasi ini di-generate berdasarkan analisis source code proyek Sistem E-Learning.*
