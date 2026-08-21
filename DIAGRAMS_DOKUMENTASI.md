# 📊 Dokumentasi Diagram Sistem E-Learning (EduSchool LMS)

Dokumen ini berisi **3 Diagram Utama Terpadu** yang memodelkan fungsionalitas use case, struktur relasi database (ERD), dan alur operasional sistem (Flowchart) untuk **Sistem E-Learning EduSchool LMS**.

---

## 📑 Daftar Isi Diagram Utama

1. [Diagram Use Case Terpadu (Unified Use Case Diagram)](#1-diagram-use-case-terpadu-unified-use-case-diagram)
2. [Diagram Relasi Database Terpadu (Unified Entity Relationship Diagram - ERD)](#2-diagram-relasi-database-terpadu-unified-entity-relationship-diagram---erd)
3. [Diagram Alir Sistem Terpadu (Unified End-to-End System Flowchart)](#3-diagram-alir-sistem-terpadu-unified-end-to-end-system-flowchart)

---

## 1. Diagram Use Case Terpadu (Unified Use Case Diagram)

Diagram Use Case ini menyatukan seluruh aktor (**Administrator**, **Guru Pengajar**, dan **Peserta Didik / Siswa**) ke dalam satu batasan sistem terpadu yang mencakup seluruh modul fungsional:

```mermaid
flowchart LR
    %% Actors
    Admin((👤 Administrator))
    Guru((👨‍🏫 Guru Pengajar))
    Siswa((👨‍🎓 Peserta Didik))

    subgraph SystemBoundary [" 🏫 Sistem E-Learning EduSchool LMS "]
        
        %% Shared Core
        subgraph CoreModule [" 🔐 Modul Autentikasi & Akun (Shared) "]
            UC_Login(["Login & Autentikasi"])
            UC_Forgot(["Lupa / Reset Password"])
            UC_Profile(["Kelola Profil Pribadi"])
            UC_Notif(["Notifikasi Lonceng Real-time"])
        end

        %% Admin
        subgraph AdminModule [" 🛡️ Modul Administrator "]
            UC_AdmDashboard(["Dashboard Statistik Global"])
            UC_ManageUser(["Manajemen Pengguna (CRUD)"])
            UC_ResetPassUser(["Reset Sandi Akun Pengguna"])
            UC_BulkImport(["Bulk Import Akun (Excel/CSV)"])
            UC_MonitorCourse(["Monitoring Kelas & Mapel"])
            UC_Settings(["Pengaturan Sekolah & Semester"])
            UC_ExportReports(["Rekapitulasi & Ekspor Laporan"])
        end

        %% Guru
        subgraph GuruModule [" 📚 Modul Guru Pengajar "]
            UC_GuruDashboard(["Dashboard Guru & Statistik"])
            UC_ManageCourse(["Buat & Kelola Kelas Mapel"])
            UC_SetAttendanceSched(["Atur Jadwal Jam Presensi"])
            UC_UploadMaterial(["Unggah Modul Ajar (PDF/Link)"])
            UC_CreateTask(["Terbitkan Tugas / LKPD & Deadline"])
            UC_ReviewSubmissions(["Periksa Jawaban Tugas Siswa"])
            UC_GradeTask(["Beri Nilai & Feedback Ulasan"])
            UC_InputExams(["Input Nilai Ujian UTS & UAS"])
            UC_ManageClassAttendance(["Rekap Presensi Harian Kelas"])
            UC_KickStudent(["Keluarkan Siswa dari Kelas"])
        end

        %% Siswa
        subgraph SiswaModule [" 🎒 Modul Peserta Didik (Siswa) "]
            UC_SiswaDashboard(["Dashboard Jadwal & Tugas Siswa"])
            UC_JoinCourse(["Gabung Kelas (Kode / Katalog)"])
            UC_LeaveCourse(["Keluar dari Kelas"])
            UC_ReadMaterial(["Akses & Baca Modul Pembelajaran"])
            UC_SelfAttend(["Presensi / Absensi Mandiri"])
            UC_ViewAttHistory(["Cek Riwayat Kehadiran Siswa"])
            UC_SubmitTask(["Kumpul Tugas (Teks / File)"])
            UC_ViewGrades(["Rapor Nilai Siswa (Tugas/UTS/UAS)"])
        end

    end

    %% Shared Connections
    Admin --- UC_Login
    Guru --- UC_Login
    Siswa --- UC_Login

    Admin --- UC_Forgot
    Guru --- UC_Forgot
    Siswa --- UC_Forgot

    Admin --- UC_Profile
    Guru --- UC_Profile
    Siswa --- UC_Profile

    Admin --- UC_Notif
    Guru --- UC_Notif
    Siswa --- UC_Notif

    %% Admin Connections
    Admin --- UC_AdmDashboard
    Admin --- UC_ManageUser
    Admin --- UC_ResetPassUser
    Admin --- UC_BulkImport
    Admin --- UC_MonitorCourse
    Admin --- UC_Settings
    Admin --- UC_ExportReports

    %% Guru Connections
    Guru --- UC_GuruDashboard
    Guru --- UC_ManageCourse
    Guru --- UC_SetAttendanceSched
    Guru --- UC_UploadMaterial
    Guru --- UC_CreateTask
    Guru --- UC_ReviewSubmissions
    Guru --- UC_GradeTask
    Guru --- UC_InputExams
    Guru --- UC_ManageClassAttendance
    Guru --- UC_KickStudent

    %% Siswa Connections
    Siswa --- UC_SiswaDashboard
    Siswa --- UC_JoinCourse
    Siswa --- UC_LeaveCourse
    Siswa --- UC_ReadMaterial
    Siswa --- UC_SelfAttend
    Siswa --- UC_ViewAttHistory
    Siswa --- UC_SubmitTask
    Siswa --- UC_ViewGrades

    %% Styling
    classDef actorStyle fill:#1E293B,stroke:#0F172A,stroke-width:2px,color:#FFFFFF;
    classDef coreStyle fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px;
    classDef adminStyle fill:#F5F3FF,stroke:#7C3AED,stroke-width:1.5px;
    classDef guruStyle fill:#F0FDF4,stroke:#16A34A,stroke-width:1.5px;
    classDef siswaStyle fill:#FFFBEB,stroke:#D97706,stroke-width:1.5px;

    class Admin,Guru,Siswa actorStyle;
    class UC_Login,UC_Forgot,UC_Profile,UC_Notif coreStyle;
    class UC_AdmDashboard,UC_ManageUser,UC_ResetPassUser,UC_BulkImport,UC_MonitorCourse,UC_Settings,UC_ExportReports adminStyle;
    class UC_GuruDashboard,UC_ManageCourse,UC_SetAttendanceSched,UC_UploadMaterial,UC_CreateTask,UC_ReviewSubmissions,UC_GradeTask,UC_InputExams,UC_ManageClassAttendance,UC_KickStudent guruStyle;
    class UC_SiswaDashboard,UC_JoinCourse,UC_LeaveCourse,UC_ReadMaterial,UC_SelfAttend,UC_ViewAttHistory,UC_SubmitTask,UC_ViewGrades siswaStyle;
```

---

## 2. Diagram Relasi Database Terpadu (Unified Entity Relationship Diagram - ERD)

Diagram ERD terpadu ini memodelkan seluruh **11 tabel basis data MySQL 8.0**, lengkap dengan atribut, *Primary Key (PK)*, *Foreign Key (FK)*, tipe data, serta kardinalitas relasi:

```mermaid
erDiagram
    USERS ||--o{ COURSES : "creates / teaches (1:N)"
    USERS ||--o{ COURSE_STUDENT : "enrolls in (1:N)"
    COURSES ||--o{ COURSE_STUDENT : "has members (1:N)"
    COURSES ||--o{ MATERIALS : "contains (1:N)"
    COURSES ||--o{ ASSIGNMENTS : "has (1:N)"
    ASSIGNMENTS ||--o{ SUBMISSIONS : "receives (1:N)"
    USERS ||--o{ SUBMISSIONS : "submits (1:N)"
    COURSES ||--o{ ATTENDANCES : "records (1:N)"
    USERS ||--o{ ATTENDANCES : "attended by (1:N)"
    USERS ||--o{ NOTIFICATIONS : "receives (1:N)"
    USERS ||--o{ ACTIVITY_LOGS : "logs action (1:N)"

    USERS {
        bigint id PK "Auto Increment"
        string name "Nama Lengkap"
        string email "Email Unik Login"
        string password "Bcrypt Hashed"
        enum role "admin, guru, siswa"
        string nisn_or_nip "NISN Siswa / NIP Guru"
        string class_name "Kelas Siswa (e.g. XII-IPA-1)"
        string phone "Nomor Telepon / WhatsApp"
        text bio "Biografi / Profil Ringkas"
        string subject "Mata Pelajaran Pengampu"
        string specialization "Bidang Keahlian Guru"
        timestamp created_at "Waktu Registrasi"
        timestamp updated_at "Waktu Update"
    }

    COURSES {
        bigint id PK "Auto Increment"
        string title "Nama Mata Pelajaran / Kelas"
        text description "Deskripsi Silabus"
        bigint teacher_id FK "Relasi ke USERS.id"
        string code "Kode Unik Enrollment (e.g. BIO-123)"
        string grade_level "Tingkat Kelas (X, XI, XII)"
        string color_theme "Tema Warna UI"
        time attendance_open_time "Waktu Buka Presensi"
        time attendance_close_time "Waktu Tutup Presensi"
        timestamp created_at
        timestamp updated_at
    }

    COURSE_STUDENT {
        bigint id PK "Auto Increment"
        bigint course_id FK "Relasi ke COURSES.id"
        bigint student_id FK "Relasi ke USERS.id"
        enum status "active, dropped"
        int uts_score "Nilai Ujian Tengah Semester"
        int uas_score "Nilai Ujian Akhir Semester"
        timestamp created_at "Tanggal Masuk Kelas"
        timestamp updated_at
    }

    MATERIALS {
        bigint id PK "Auto Increment"
        bigint course_id FK "Relasi ke COURSES.id"
        string title "Judul Modul Pembelajaran"
        text content "Ringkasan / Tautan Link Eksternal"
        string file_path "Path File Dokumen PDF/Doc"
        timestamp created_at
        timestamp updated_at
    }

    ASSIGNMENTS {
        bigint id PK "Auto Increment"
        bigint course_id FK "Relasi ke COURSES.id"
        string title "Judul Tugas / LKPD"
        text instruction "Petunjuk & Panduan Pengerjaan"
        string attachment_path "Path File Lampiran Guru"
        string attachment_name "Nama File Asli"
        int max_score "Skor Maksimal (Default: 100)"
        datetime due_date "Batas Waktu Pengumpulan"
        timestamp created_at
        timestamp updated_at
    }

    SUBMISSIONS {
        bigint id PK "Auto Increment"
        bigint assignment_id FK "Relasi ke ASSIGNMENTS.id"
        bigint student_id FK "Relasi ke USERS.id"
        string file_path "Path File Jawaban Siswa"
        string original_filename "Nama Asli File Unggahan"
        text content "Jawaban Berbasis Teks"
        int score "Nilai Angka (0-100)"
        text teacher_feedback "Komentar / Catatan Guru"
        enum status "submitted, graded, late"
        datetime submitted_at "Waktu Submit Jawaban"
        timestamp created_at
        timestamp updated_at
    }

    ATTENDANCES {
        bigint id PK "Auto Increment"
        bigint course_id FK "Relasi ke COURSES.id"
        bigint student_id FK "Relasi ke USERS.id"
        date date "Tanggal Presensi (YYYY-MM-DD)"
        enum status "hadir, izin, sakit, alpha"
        text note "Keterangan / Catatan Izin"
        timestamp created_at
        timestamp updated_at
    }

    NOTIFICATIONS {
        bigint id PK "Auto Increment"
        bigint user_id FK "Relasi ke USERS.id"
        string type "Jenis Notifikasi"
        string title "Judul Notifikasi"
        text message "Isi Pesan Notifikasi"
        json data "Payload Metadata"
        timestamp read_at "Waktu Dibaca (Nullable)"
        timestamp created_at
        timestamp updated_at
    }

    SETTINGS {
        bigint id PK "Auto Increment"
        string key "Kunci Konfigurasi (Unique)"
        text value "Nilai Pengaturan Sistem"
        timestamp created_at
        timestamp updated_at
    }

    ACTIVITY_LOGS {
        bigint id PK "Auto Increment"
        bigint user_id FK "Relasi ke USERS.id"
        string action "Aksi yang Dilakukan"
        string entity_type "Model Entitas"
        bigint entity_id "ID Entitas"
        json changes "Detail Perubahan Data"
        string ip_address "Alamat IP Pengguna"
        timestamp created_at
        timestamp updated_at
    }
```

---

## 3. Diagram Alir Sistem Terpadu (Unified End-to-End System Flowchart)

Diagram alir terpadu ini menyajikan seluruh proses operasional pembelajaran digital secara *End-to-End* dalam satu alur komprehensif:

```mermaid
flowchart TD
    %% ================= START =================
    StartSys(["🏁 Mulai Operasional E-Learning"]) --> InitPlatform

    %% ================= 1. ADMIN INITIALIZATION =================
    subgraph AdminPhase [" 1. Fase Inisialisasi & Tata Kelola Pengguna (Administrator) "]
        InitPlatform["Admin Mengatur Identitas Sekolah<br/>Tahun Ajaran & Semester Aktif"]
        InitPlatform --> AddUsers["Kelola Akun Pengguna<br/>Tambah Manual / Bulk Import Excel 50+ User"]
        AddUsers --> DistributeAcc["Akun Siap Digunakan<br/>Email & Password Terdistribusi ke Guru & Siswa"]
    end

    %% ================= 2. AUTHENTICATION & ROLE ROUTING =================
    subgraph AuthPhase [" 2. Fase Autentikasi & Otorisasi Sesi "]
        DistributeAcc --> UserLogin["Pengguna Membuka Web LMS & Login di /login"]
        UserLogin --> AuthCheck{"Kredensial Valid & Terdaftar di DB?"}
        AuthCheck -- "Tidak Valid" --> AuthFailed["Tolak Akses: Tampilkan Notifikasi Error"]
        AuthFailed --> UserLogin
        AuthCheck -- "Valid" --> IssueToken["Generate Bearer Token Sanctum<br/>Simpan ke LocalStorage"]
        IssueToken --> RoleRouting{"Evaluasi user.role"}
    end

    %% ================= 3. GURU CLASS & LESSON CREATION =================
    subgraph GuruPhase [" 3. Fase Pengelolaan Kelas & Materi (Guru) "]
        RoleRouting -- "guru" --> GuruDashboard["Buka Dashboard Guru"]
        GuruDashboard --> CreateCourse["Buat Kelas / Mata Pelajaran Baru"]
        CreateCourse --> GenCourseCode["Sistem Terbitkan Kode Kelas Unik"]
        GenCourseCode --> SetSchedule["Atur Jam Buka-Tutup Presensi Kelas"]
        SetSchedule --> UploadMaterials["Unggah Modul Bahan Ajar PDF/Doc/Link"]
        UploadMaterials --> CreateTasks["Terbitkan Tugas / LKPD Baru & Tentukan Deadline"]
    end

    %% ================= 4. SISWA LEARNING & PARTICIPATION =================
    subgraph SiswaPhase [" 4. Fase Pembelajaran, Presensi & Pengerjaan (Siswa) "]
        RoleRouting -- "siswa" --> SiswaDashboard["Buka Dashboard Siswa"]
        SiswaDashboard --> JoinCourse["Gabung Kelas via Input Kode Unik / Katalog"]
        JoinCourse --> AccessMaterials["Buka Kelas & Pelajari Modul Bahan Ajar"]
        
        %% Presensi Mandiri
        AccessMaterials --> SelfAttendance["Lakukan Presensi / Absensi Mandiri"]
        SelfAttendance --> TimeCheck{"Waktu Sekarang Masuk Jam Presensi?"}
        TimeCheck -- "Di Luar Waktu" --> AttBlocked["Presensi Ditolak: Belum Dibuka / Sudah Lewat"]
        TimeCheck -- "Sesuai Waktu" --> AttSuccess["Presensi Disimpan: Status 'Hadir'"]
        
        %% Pengerjaan Tugas
        AttSuccess --> ReadAssignment["Buka & Baca Instruksi Tugas"]
        ReadAssignment --> DoTask["Mengerjakan Tugas & Menyiapkan Lembar Jawaban"]
        DoTask --> UploadSubmission["Kirimkan Tugas (Submit Teks / File)"]
        UploadSubmission --> DeadlineCheck{"Waktu Submit Sebelum Deadline?"}
        DeadlineCheck -- "Tepat Waktu" --> StatusSubmitted["Status Disimpan: 'submitted'"]
        DeadlineCheck -- "Terlambat" --> StatusLate["Status Disimpan: 'late'"]
    end

    %% ================= 5. GRADING & EXAMS =================
    subgraph GradingPhase [" 5. Fase Penilaian & Input Nilai Semester (Guru) "]
        StatusSubmitted --> TriggerNotif["Sistem Kirim Notifikasi Real-time ke Guru"]
        StatusLate --> TriggerNotif
        TriggerNotif --> GuruReviewSub["Guru Memeriksa Berkas Jawaban Siswa"]
        GuruReviewSub --> InputAssignmentGrade["Guru Input Nilai Tugas 0-100 & Catatan Feedback"]
        InputAssignmentGrade --> InputExamGrades["Guru Input Nilai Ujian Semester UTS & UAS"]
        
        InputExamGrades --> SyncReport["Database Menghitung Rekap Nilai Rapor & Persentase Presensi"]
        SyncReport --> StudentViewGrades["Siswa Melihat Rapor Nilai & Ulasan Guru"]
    end

    %% ================= 6. MONITORING & REPORT EXPORT =================
    subgraph ReportPhase [" 6. Fase Monitoring & Pelaporan Sekolah (Administrator) "]
        RoleRouting -- "admin" --> AdminDashboard["Buka Dashboard Administrator"]
        AdminDashboard --> MonitorActivities["Pantau Statistik Global: Kelas, User, & Presensi"]
        SyncReport --> MonitorActivities
        MonitorActivities --> ExportReports["Ekspor Rekapitulasi Rapor Siswa ke Excel (.xlsx) / CSV"]
        ExportReports --> EndSys(["🏆 Selesai / Arsip Periode Semester"])
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

*Dokumentasi 3 Diagram Utama Terpadu disusun untuk melengkapi pelaporan teknis, skripsi/tugas akhir, dan pemahaman komprehensif arsitektur sistem E-Learning.*
