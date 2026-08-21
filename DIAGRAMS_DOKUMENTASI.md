# 📊 Dokumentasi Diagram Sistem E-Learning (EduSchool LMS)

Dokumen ini berisi kumpulan diagram visual lengkap yang memodelkan arsitektur, usecase, database (ERD), flowchart alur sistem, dan sequence diagram untuk **Sistem E-Learning EduSchool**. Seluruh diagram dibuat menggunakan standar **Mermaid** sehingga dapat dirender langsung di GitHub, GitLab, VS Code, maupun tools markdown viewer lainnya.

---

## 📑 Daftar Isi Diagram

1. [Arsitektur Sistem (System Architecture)](#1-arsitektur-sistem-system-architecture)
2. [Use Case Diagram](#2-use-case-diagram)
   - [Use Case Diagram Global](#21-use-case-diagram-global)
   - [Use Case Detail Administrator](#22-use-case-detail-administrator)
   - [Use Case Detail Guru](#23-use-case-detail-guru)
   - [Use Case Detail Siswa](#24-use-case-detail-siswa)
3. [Entity Relationship Diagram (ERD)](#3-entity-relationship-diagram-erd)
4. [Flowchart Alur Sistem (Secara Keseluruhan)](#4-flowchart-alur-sistem-secara-keseluruhan)
5. [Sequence Diagram](#5-sequence-diagram)
   - [Sequence Autentikasi (Login Sanctum)](#51-sequence-autentikasi-login-sanctum)
   - [Sequence Submit Tugas & Grading Notifikasi](#52-sequence-submit-tugas--grading-notifikasi)
   - [Sequence Self-Attendance (Absen Mandiri)](#53-sequence-self-attendance-absen-mandiri)

---

## 1. Arsitektur Sistem (System Architecture)

```mermaid
flowchart TB
    subgraph ClientLayer [" Client Layer (Browser) "]
        UI["Next.js 15 App Router<br/>(React 19, TypeScript, Tailwind CSS)"]
        StateCtx["LmsContext & useAuth<br/>(Local State & Token Storage)"]
        RealtimeHook["useRealtimeData<br/>(Event Dispatcher)"]
    end

    subgraph CDNLayer [" Edge & Deployment Layer "]
        VercelCDN["Vercel Cloud Platform<br/>(Hosting Frontend SPA/SSR)"]
    end

    subgraph BackendLayer [" Backend Application Layer (Railway) "]
        Router["Laravel 12 Routing Engine<br/>(/api/v1/*)"]
        MiddlewareAuth["Sanctum Auth & CheckRole Middleware"]
        
        subgraph Controllers [" API Controllers "]
            C_Auth["AuthController"]
            C_Admin["AdminController"]
            C_Course["CourseController"]
            C_Assign["AssignmentController"]
            C_Sub["SubmissionController"]
            C_Att["AttendanceController"]
            C_Mat["MaterialController"]
            C_Notif["NotificationController"]
        end

        subgraph ServiceDomain [" Service & Policy Layer "]
            S_Course["CourseService"]
            S_Att["AttendanceService"]
            S_Sub["SubmissionService"]
            S_Notif["NotificationService"]
            Events["Events & Listeners<br/>(SubmissionCreated, Graded)"]
        end

        subgraph StorageSystem [" Storage Subsystem "]
            LocalStorage["Local/Public Storage Link<br/>(/storage/materials, /storage/submissions)"]
        end
    end

    subgraph DataLayer [" Database Layer (Railway MySQL 8.0) "]
        MySQL[(MySQL Relational Database<br/>11 Core Tables)]
    end

    UI <--> VercelCDN
    UI -- "REST API Request (Bearer Token)" --> Router
    Router --> MiddlewareAuth
    MiddlewareAuth --> Controllers
    Controllers --> ServiceDomain
    ServiceDomain --> Events
    ServiceDomain --> StorageSystem
    ServiceDomain -- "Eloquent ORM Queries" --> MySQL
```

---

## 2. Use Case Diagram

### 2.1 Use Case Diagram Global

```mermaid
flowchart LR
    Admin((👤 Admin))
    Guru((👨‍🏫 Guru))
    Siswa((👨‍🎓 Siswa))

    subgraph SystemBoundary [" Sistem E-Learning (EduSchool LMS) "]
        UC_Login["Login & Autentikasi"]
        UC_Forgot["Reset / Lupa Password"]
        UC_Profile["Kelola Profil Pribadi"]
        UC_Notif["Melihat Notifikasi"]
        
        %% Admin Features
        UC_ManageUser["Manajemen Pengguna (CRUD & Reset Sandi)"]
        UC_ImportUser["Import Pengguna Massal (Excel/CSV)"]
        UC_Settings["Pengaturan Platform & Semester"]
        UC_ViewAllReports["Melihat Rekap Seluruh Nilai"]
        
        %% Guru Features
        UC_ManageClass["Kelola Kelas Pembelajaran"]
        UC_UploadMaterial["Upload Materi & Modul"]
        UC_CreateAssignment["Buat Tugas & Lampiran"]
        UC_GradeAssignment["Penilaian & Feedback Tugas"]
        UC_ManageAttendance["Kelola & Rekap Absensi Kelas"]
        UC_InputGrades["Input Nilai UTS & UAS"]
        
        %% Siswa Features
        UC_JoinClass["Gabung Kelas via Kode"]
        UC_DownloadMaterial["Download Materi Pelajaran"]
        UC_SubmitAssignment["Submit Pengumpulan Tugas"]
        UC_SelfAttendance["Presensi / Absensi Mandiri"]
        UC_ViewMyGrades["Melihat Rapor Nilai Siswa"]
    end

    %% All Users
    Admin --- UC_Login
    Guru --- UC_Login
    Siswa --- UC_Login

    Admin --- UC_Profile
    Guru --- UC_Profile
    Siswa --- UC_Profile

    Admin --- UC_Notif
    Guru --- UC_Notif
    Siswa --- UC_Notif

    Admin --- UC_Forgot
    Guru --- UC_Forgot
    Siswa --- UC_Forgot

    %% Admin Connections
    Admin --- UC_ManageUser
    Admin --- UC_ImportUser
    Admin --- UC_Settings
    Admin --- UC_ViewAllReports

    %% Guru Connections
    Guru --- UC_ManageClass
    Guru --- UC_UploadMaterial
    Guru --- UC_CreateAssignment
    Guru --- UC_GradeAssignment
    Guru --- UC_ManageAttendance
    Guru --- UC_InputGrades

    %% Siswa Connections
    Siswa --- UC_JoinClass
    Siswa --- UC_DownloadMaterial
    Siswa --- UC_SubmitAssignment
    Siswa --- UC_SelfAttendance
    Siswa --- UC_ViewMyGrades
```

---

### 2.2 Use Case Detail Administrator

```mermaid
flowchart LR
    Admin((👤 Administrator))

    subgraph AdminModule [" Modul Administrator "]
        UC1["Dashboard Statistik Pengguna"]
        UC2["Lihat Daftar User (Filter Role/Kelas/Mapel)"]
        UC3["Tambah User Baru Manual"]
        UC4["Edit Informasi User"]
        UC5["Reset Password Akun Pengguna"]
        UC6["Hapus Akun Pengguna"]
        UC7["Import Akun Massal (Excel / CSV)"]
        UC8["Monitoring Kelas & Mata Pelajaran"]
        UC9["Monitoring Seluruh Tugas Sekolah"]
        UC10["Kelola Pengaturan Platform & Tahun Ajaran"]
        UC11["Export & Cetak Laporan Nilai Siswa"]
    end

    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC4
    Admin --> UC5
    Admin --> UC6
    Admin --> UC7
    Admin --> UC8
    Admin --> UC9
    Admin --> UC10
    Admin --> UC11
```

---

### 2.3 Use Case Detail Guru

```mermaid
flowchart LR
    Guru((👨‍🏫 Guru / Pengajar))

    subgraph GuruModule [" Modul Guru "]
        G1["Dashboard Statistik Kelas & Siswa"]
        G2["Buat & Kelola Kelas Baru"]
        G3["Atur Jadwal Buka/Tutup Presensi Kelas"]
        G4["Upload Modul & Bahan Ajar (PDF/Doc)"]
        G5["Buat Tugas Baru dengan Tenggat Waktu"]
        G6["Lihat Status Pengumpulan Siswa"]
        G7["Beri Nilai & Feedback Ulasan Tugas"]
        G8["Input & Update Presensi Kehadiran Siswa"]
        G9["Input & Update Nilai UTS serta UAS"]
        G10["Keluarkan Siswa dari Kelas"]
        G11["Unduh / Cetak Laporan Nilai Kelas"]
    end

    Guru --> G1
    Guru --> G2
    Guru --> G3
    Guru --> G4
    Guru --> G5
    Guru --> G6
    Guru --> G7
    Guru --> G8
    Guru --> G9
    Guru --> G10
    Guru --> G11
```

---

### 2.4 Use Case Detail Siswa

```mermaid
flowchart LR
    Siswa((👨‍🎓 Siswa / Peserta Didik))

    subgraph SiswaModule [" Modul Siswa "]
        S1["Dashboard Jadwal & Tugas Aktif"]
        S2["Gabung Kelas Menggunakan Kode"]
        S3["Keluar dari Kelas yang Diikuti"]
        S4["Melihat & Mengunduh Materi Pelajaran"]
        S5["Melihat Detail & Instruksi Tugas"]
        S6["Upload File Jawaban Tugas"]
        S7["Melihat Nilai & Ulasan Guru"]
        S8["Melakukan Absensi Mandiri (Self Attendance)"]
        S9["Melihat Riwayat Kehadiran Pribadi"]
        S10["Melihat Transkrip Nilai (UTS/UAS/Tugas)"]
    end

    Siswa --> S1
    Siswa --> S2
    Siswa --> S3
    Siswa --> S4
    Siswa --> S5
    Siswa --> S6
    Siswa --> S7
    Siswa --> S8
    Siswa --> S9
    Siswa --> S10
```

---

## 3. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USERS ||--o{ COURSES : "creates / teaches"
    USERS ||--o{ COURSE_STUDENT : "enrolls in"
    COURSES ||--o{ COURSE_STUDENT : "has students"
    COURSES ||--o{ MATERIALS : "contains"
    COURSES ||--o{ ASSIGNMENTS : "has"
    ASSIGNMENTS ||--o{ SUBMISSIONS : "receives"
    USERS ||--o{ SUBMISSIONS : "submits"
    COURSES ||--o{ ATTENDANCES : "records"
    USERS ||--o{ ATTENDANCES : "attended by"
    USERS ||--o{ NOTIFICATIONS : "receives"
    USERS ||--o{ ACTIVITY_LOGS : "logs action"

    USERS {
        bigint id PK
        string name "Nama Lengkap"
        string email "Email Unik"
        string password "Hashed Password"
        enum role "admin, guru, siswa"
        string nisn_or_nip "NISN / NIP"
        string class_name "Kelas Siswa"
        string phone "No Telepon"
        text bio "Biografi"
        string subject "Mata Pelajaran Guru"
        string specialization "Bidang Keahlian"
        timestamp created_at
        timestamp updated_at
    }

    COURSES {
        bigint id PK
        string title "Nama Mata Pelajaran / Kelas"
        text description "Deskripsi Kelas"
        bigint teacher_id FK "Relasi ke USERS(id)"
        string code "Kode Unik Enrollment"
        time attendance_open_time "Waktu Buka Absensi"
        time attendance_close_time "Waktu Tutup Absensi"
        timestamp created_at
        timestamp updated_at
    }

    COURSE_STUDENT {
        bigint id PK
        bigint course_id FK "Relasi ke COURSES(id)"
        bigint student_id FK "Relasi ke USERS(id)"
        enum status "active, dropped"
        int uts_score "Nilai UTS"
        int uas_score "Nilai UAS"
        timestamp created_at
        timestamp updated_at
    }

    MATERIALS {
        bigint id PK
        bigint course_id FK "Relasi ke COURSES(id)"
        string title "Judul Materi"
        text content "Konten / Deskripsi"
        string file_path "Path File Modul"
        timestamp created_at
        timestamp updated_at
    }

    ASSIGNMENTS {
        bigint id PK
        bigint course_id FK "Relasi ke COURSES(id)"
        string title "Judul Tugas"
        text instruction "Petunjuk Pengerjaan"
        string attachment_path "File Lampiran Guru"
        string attachment_name "Nama File Asli"
        datetime due_date "Batas Waktu Pengumpulan"
        timestamp created_at
        timestamp updated_at
    }

    SUBMISSIONS {
        bigint id PK
        bigint assignment_id FK "Relasi ke ASSIGNMENTS(id)"
        bigint student_id FK "Relasi ke USERS(id)"
        string file_path "Path File Jawaban Siswa"
        string original_filename "Nama Asli File"
        text note "Catatan Tambahan Siswa"
        int score "Nilai Angka (0-100)"
        text teacher_feedback "Komentar / Evaluasi Guru"
        enum status "submitted, graded, late"
        datetime submitted_at "Waktu Submit"
        timestamp created_at
        timestamp updated_at
    }

    ATTENDANCES {
        bigint id PK
        bigint course_id FK "Relasi ke COURSES(id)"
        bigint student_id FK "Relasi ke USERS(id)"
        date date "Tanggal Kehadiran"
        enum status "hadir, izin, sakit, alpa"
        text note "Keterangan Tambahan"
        timestamp created_at
        timestamp updated_at
    }

    NOTIFICATIONS {
        bigint id PK
        bigint user_id FK "Relasi ke USERS(id)"
        string type "Jenis Notifikasi"
        string title "Judul Pesan"
        text message "Isi Pesan Notifikasi"
        json data "Metadata Tambahan"
        timestamp read_at "Status Dibaca"
        timestamp created_at
        timestamp updated_at
    }

    SETTINGS {
        bigint id PK
        string key "Nama Konfigurasi"
        text value "Isi Nilai Konfigurasi"
        timestamp created_at
        timestamp updated_at
    }

    ACTIVITY_LOGS {
        bigint id PK
        bigint user_id FK "Relasi ke USERS(id)"
        string action "Nama Aksi"
        string entity_type "Model Terkait"
        bigint entity_id "ID Record Terkait"
        json changes "Perubahan Data"
        string ip_address "Alamat IP"
        timestamp created_at
        timestamp updated_at
    }
```

---

## 4. Flowchart Alur Sistem (Secara Keseluruhan)

Diagram alir di bawah ini menyatukan seluruh proses dan interaksi sistem secara menyeluruh (*End-to-End*) dari awal hingga akhir, menggabungkan alur **Administrator**, **Guru**, **Siswa**, serta proses otomatis pada **Backend API & Database**:

```mermaid
flowchart TD
    %% ================= GLOBAL START =================
    StartSys([🏁 Mulai Operasional LMS]) --> InitPlatform

    %% ================= FASE 1: INISIALISASI & USER MANAGEMENT (ADMIN) =================
    subgraph AdminPhase [" 1. Fase Inisialisasi & Manajemen Pengguna (Admin) "]
        InitPlatform[Admin Mengatur Platform<br/>Tahun Ajaran & Semester]
        InitPlatform --> AddUsers[Kelola Akun Pengguna<br/>Tambah Manual / Bulk Import Excel]
        AddUsers --> DistributeAcc[Akun Siap Digunakan<br/>Email & Password Terdistribusi]
    end

    %% ================= FASE 2: AUTENTIKASI & ROLE ROUTING =================
    subgraph AuthPhase [" 2. Fase Autentikasi & Otorisasi Sistem "]
        DistributeAcc --> UserLogin[Pengguna Membuka Web & Login di /login]
        UserLogin --> AuthCheck{Kredensial Valid & Terdaftar di DB?}
        AuthCheck -- Tidak --> AuthFailed[Tolak Akses: Tampilkan Pesan Error]
        AuthFailed --> UserLogin
        AuthCheck -- Ya --> IssueToken[Generate Bearer Token Sanctum]
        IssueToken --> RoleRouting{Evaluasi user.role}
    end

    %% ================= FASE 3: KELAS & MATERI (GURU) =================
    subgraph GuruPhase [" 3. Fase Kegiatan Belajar Mengajar (Guru) "]
        RoleRouting -- 'guru' --> GuruDashboard[Masuk Dashboard Guru]
        GuruDashboard --> CreateCourse[Buat Kelas / Mata Pelajaran Baru]
        CreateCourse --> GenCourseCode[Sistem Generate Kode Kelas Unik]
        GenCourseCode --> SetSchedule[Atur Jadwal Buka/Tutup Presensi]
        SetSchedule --> UploadMaterials[Upload Modul Materi PDF/Doc]
        UploadMaterials --> CreateTasks[Buat Tugas Baru & Tentukan Deadline]
    end

    %% ================= FASE 4: PARTISIPASI BELAJAR (SISWA) =================
    subgraph SiswaPhase [" 4. Fase Partisipasi, Presensi & Pengerjaan (Siswa) "]
        RoleRouting -- 'siswa' --> SiswaDashboard[Masuk Dashboard Siswa]
        SiswaDashboard --> JoinCourse[Gabung Kelas via Input Kode Kelas]
        JoinCourse --> AccessMaterials[Akses Kelas & Unduh Materi Belajar]
        
        %% Presensi Mandiri
        AccessMaterials --> SelfAttendance[Presensi Mandiri / Kehadiran Siswa]
        SelfAttendance --> TimeCheck{Sesuai Jam Buka & Tutup Presensi?}
        TimeCheck -- Tidak --> AttBlocked[Presensi Ditolak: Di luar waktu]
        TimeCheck -- Ya --> AttSuccess[Presensi Tercatat: Status 'Hadir']
        
        %% Pengerjaan Tugas
        AttSuccess --> ReadAssignment[Buka & Baca Instruksi Tugas]
        ReadAssignment --> DoTask[Mengerjakan Tugas & Buat File Jawaban]
        DoTask --> UploadSubmission[Upload File Jawaban ke Sistem]
        UploadSubmission --> DeadlineCheck{Submit Sebelum Batas Waktu?}
        DeadlineCheck -- Ya --> StatusSubmitted[Status: 'submitted']
        DeadlineCheck -- Tidak --> StatusLate[Status: 'late']
    end

    %% ================= FASE 5: PENILAIAN & EVALUASI =================
    subgraph GradingPhase [" 5. Fase Penilaian & Rekap Nilai Rapor "]
        StatusSubmitted --> TriggerNotif[Sistem Trigger Notifikasi Otomatis ke Guru]
        StatusLate --> TriggerNotif
        TriggerNotif --> GuruReviewSub[Guru Memeriksa Jawaban Siswa]
        GuruReviewSub --> InputAssignmentGrade[Guru Input Nilai Tugas 0-100 & Feedback]
        InputAssignmentGrade --> InputExamGrades[Guru Input Nilai UTS & UAS Siswa]
        
        InputExamGrades --> SyncReport[Database Menghitung Rekap Nilai Rapor]
        SyncReport --> StudentViewGrades[Siswa Melihat Rapor & Notifikasi Nilai]
    end

    %% ================= FASE 6: MONITORING & LAPORAN (ADMIN) =================
    subgraph ReportPhase [" 6. Fase Monitoring & Pelaporan Sekolah (Admin) "]
        RoleRouting -- 'admin' --> AdminDashboard[Masuk Dashboard Admin]
        AdminDashboard --> MonitorActivities[Pantau Statistik Pengguna, Kelas, & Kehadiran]
        SyncReport -.-> MonitorActivities
        MonitorActivities --> ExportReports[Export Rekapitulasi Rapor Siswa]
        ExportReports --> EndSys([🏆 Selesai / Arsip Semester])
        StudentViewGrades --> EndSys
    end

    %% ================= STYLING =================
    classDef adminStyle fill:#EEF2FF,stroke:#4F46E5,stroke-width:2px;
    classDef guruStyle fill:#F0FDF4,stroke:#16A34A,stroke-width:2px;
    classDef siswaStyle fill:#FEF3C7,stroke:#D97706,stroke-width:2px;
    classDef sysStyle fill:#F1F5F9,stroke:#475569,stroke-width:2px;

    class InitPlatform,AddUsers,DistributeAcc,AdminDashboard,MonitorActivities,ExportReports adminStyle;
    class GuruDashboard,CreateCourse,GenCourseCode,SetSchedule,UploadMaterials,CreateTasks,GuruReviewSub,InputAssignmentGrade,InputExamGrades guruStyle;
    class SiswaDashboard,JoinCourse,AccessMaterials,SelfAttendance,AttSuccess,ReadAssignment,DoTask,UploadSubmission,StatusSubmitted,StatusLate,StudentViewGrades siswaStyle;
    class UserLogin,AuthCheck,IssueToken,RoleRouting,TimeCheck,DeadlineCheck,TriggerNotif,SyncReport sysStyle;
```

---

## 5. Sequence Diagram

### 5.1 Sequence Autentikasi (Login Sanctum)

```mermaid
sequenceDiagram
    autonumber
    actor User as Pengguna (Admin/Guru/Siswa)
    participant UI as Next.js Frontend
    participant API as Laravel AuthController
    participant Sanctum as Laravel Sanctum
    participant DB as MySQL Database

    User->>UI: Input Email & Password
    UI->>API: POST /api/v1/auth/login {email, password}
    API->>DB: Query: SELECT * FROM users WHERE email = ?
    DB-->>API: Return User Record
    
    alt Password Tidak Cocok / User Tidak Ditemukan
        API-->>UI: 401 Unauthorized {message: "Email atau password salah"}
        UI-->>User: Tampilkan Pesan Error
    else Kredensial Valid
        API->>Sanctum: createToken('auth_token')
        Sanctum->>DB: INSERT INTO personal_access_tokens
        DB-->>Sanctum: Token ID
        Sanctum-->>API: Plaintext Token
        API-->>UI: 200 OK {access_token, user: {id, name, role, ...}}
        UI->>UI: Simpan token ke localStorage('lms_token')
        UI->>UI: Redirect ke Dashboard sesuai Role
        UI-->>User: Tampilkan Halaman Dashboard Utama
    end
```

---

### 5.2 Sequence Submit Tugas & Grading Notifikasi

```mermaid
sequenceDiagram
    autonumber
    actor Siswa as 👨‍🎓 Siswa
    actor Guru as 👨‍🏫 Guru
    participant UI as Next.js Client
    participant SubAPI as SubmissionController
    participant EventSys as Laravel Event & Listener
    participant Storage as File Storage Disk
    participant DB as MySQL Database

    %% Siswa Submit
    Siswa->>UI: Pilih File Jawaban & Isi Catatan
    UI->>SubAPI: POST /api/v1/assignments/{id}/submit (FormData)
    SubAPI->>Storage: Simpan file ke /storage/submissions/
    Storage-->>SubAPI: Path File Disimpan
    SubAPI->>DB: INSERT INTO submissions (assignment_id, student_id, file_path, status)
    DB-->>SubAPI: Submission ID
    SubAPI->>EventSys: dispatch(new SubmissionCreated($submission))
    EventSys->>DB: INSERT INTO notifications (user_id=guru_id, message="Siswa telah mengumpulkan tugas")
    SubAPI-->>UI: 200 OK {message: "Tugas berhasil dikumpulkan"}
    UI-->>Siswa: Tampilkan status 'Terkumpul'

    %% Guru Memberi Nilai
    Guru->>UI: Buka Pengumpulan & Masukkan Nilai (e.g. 90) + Feedback
    UI->>SubAPI: PUT /api/v1/submissions/{id}/grade {score: 90, teacher_feedback: "Sangat baik"}
    SubAPI->>DB: UPDATE submissions SET score=90, teacher_feedback=..., status='graded'
    DB-->>SubAPI: Success Update
    SubAPI->>EventSys: dispatch(new SubmissionGraded($submission))
    EventSys->>DB: INSERT INTO notifications (user_id=siswa_id, message="Tugas Anda telah dinilai: 90")
    SubAPI-->>UI: 200 OK {message: "Nilai berhasil disimpan"}
    UI-->>Guru: Tampilkan status 'Ternilai'
    
    %% Siswa Menerima Notif
    Siswa->>UI: Refresh / Akses Notifikasi
    UI->>DB: GET /api/v1/notifications
    DB-->>UI: Data Notifikasi Nilai Baru
    UI-->>Siswa: Muncul Badge Notifikasi & Update Nilai Rapor
```

---

### 5.3 Sequence Self-Attendance (Absen Mandiri)

```mermaid
sequenceDiagram
    autonumber
    actor Siswa as 👨‍🎓 Siswa
    participant UI as Next.js Client
    participant AttAPI as AttendanceController
    participant AttService as AttendanceService
    participant DB as MySQL Database

    Siswa->>UI: Klik 'Presensi Mandiri' pada Kelas
    UI->>AttAPI: POST /api/v1/attendances/self {course_id}
    AttAPI->>AttService: selfAttend(user, course_id)
    AttService->>DB: Query Course Jadwal (open_time, close_time)
    DB-->>AttService: Schedule Data
    
    alt Waktu Sekarang di Luar Jadwal
        AttService-->>AttAPI: Throw ValidationException ("Di luar jadwal presensi")
        AttAPI-->>UI: 422 Unprocessable Entity
        UI-->>Siswa: Tampilkan Alert "Presensi belum dibuka / sudah ditutup"
    else Waktu Sesuai Jadwal
        AttService->>DB: Check: EXISTS(attendances WHERE course_id=? AND student_id=? AND date=TODAY)
        DB-->>AttService: False (Belum Absen)
        AttService->>DB: INSERT INTO attendances (course_id, student_id, date, status='hadir')
        DB-->>AttService: Success Insert
        AttService-->>AttAPI: Attendance Record
        AttAPI-->>UI: 200 OK {message: "Kehadiran berhasil dicatat"}
        UI-->>Siswa: Tampilkan Badge Hijau "Hadir"
    end
```

---

*Dokumentasi Diagram ini disusun untuk melengkapi pelaporan teknis, skripsi/tugas akhir, dan pemahaman arsitektur sistem E-Learning.*
