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
flowchart TB
    %% ================= TOP ACTORS =================
    subgraph ActorsBar [" 👥 PENGGUNA SISTEM (ACTORS) "]
        direction LR
        Admin((👤 Administrator))
        Guru((👨‍🏫 Guru Pengajar))
        Siswa((👨‍🎓 Peserta Didik))
    end

    subgraph SystemBoundary [" 🏫 Sistem E-Learning EduSchool LMS (Batasan Sistem Terpadu) "]
        direction TB
        
        %% ================= 1. CORE SHARED USE CASES =================
        subgraph CoreModule [" 🔐 1. Modul Autentikasi & Akun Bersama (Shared Core) "]
            direction TB
            UC_Login(["Login & Autentikasi Akun (Sanctum)"])
            UC_Forgot(["Lupa / Reset Password Akun Mandiri"])
            UC_Profile(["Lihat & Edit Profil Pribadi (No HP/Bio)"])
            UC_Notif(["Menerima Lonceng Notifikasi Real-time"])
            UC_MarkNotif(["Tandai Notifikasi Dibaca (Satuan / Semua)"])
            UC_Logout(["Logout / Keluar Sesi Pengguna"])
        end

        %% ================= 2. ADMINISTRATOR USE CASES =================
        subgraph AdminModule [" 🛡️ 2. Modul Administrator (Super User) "]
            direction TB
            UC_AdmDashboard(["Dashboard Statistik Global LMS"])
            UC_ListUsers(["Lihat Daftar Pengguna (Filter Role/Kelas/Search)"])
            UC_AddUser(["Tambah Pengguna Baru Manual (Guru/Siswa)"])
            UC_EditUser(["Edit Data Pengguna (NIP/NISN/Mapel/Kelas)"])
            UC_ResetPassUser(["Reset Kata Sandi Akun Pengguna Lain"])
            UC_DeleteUser(["Hapus Akun Pengguna"])
            UC_BulkImport(["Bulk Import Akun Massal (Excel/CSV 50+ User)"])
            UC_MonitorCourse(["Monitoring Seluruh Kelas & Mata Pelajaran"])
            UC_MonitorAssign(["Monitoring Seluruh Tugas & LKPD Sekolah"])
            UC_Settings(["Kelola Identitas Sekolah & Tahun Ajaran"])
            UC_ExportReports(["Rekapitulasi & Ekspor Laporan ke Excel/CSV"])
        end

        %% ================= 3. GURU USE CASES =================
        subgraph GuruModule [" 📚 3. Modul Guru Pengajar (Tenaga Pendidik) "]
            direction TB
            UC_GuruDashboard(["Dashboard Guru & Ringkasan Siswa"])
            UC_CreateCourse(["Buat Kelas / Mapel & Terbitkan Kode Kelas"])
            UC_EditCourse(["Edit Informasi Kelas & Silabus Mapel"])
            UC_ManageStudents(["Lihat & Kelola Siswa di Kelas"])
            UC_KickStudent(["Keluarkan (Kick) Siswa dari Kelas"])
            UC_SetAttendanceSched(["Atur Jadwal Buka-Tutup Presensi Kelas"])
            UC_UploadMaterial(["Unggah Modul Bahan Ajar (PDF/Doc/Teks)"])
            UC_LinkMaterial(["Publikasikan Materi Tautan Web / Video"])
            UC_DeleteMaterial(["Hapus Bahan Ajar / Modul"])
            UC_CreateTask(["Terbitkan Tugas/LKPD, Lampiran & Deadline"])
            UC_EditTask(["Edit & Hapus Tugas / LKPD"])
            UC_MonitorSubmissions(["Monitoring Status Pengumpulan Jawaban Siswa"])
            UC_ReviewSubmissions(["Unduh & Periksa Berkas Lembar Jawaban"])
            UC_GradeTask(["Beri Nilai Tugas (0-100) & Catatan Feedback"])
            UC_InputExams(["Input Nilai Ujian Semester (UTS & UAS)"])
            UC_ManageClassAttendance(["Rekap Presensi Harian (Hadir/Izin/Sakit/Alpa)"])
            UC_OverrideAttendance(["Edit / Override Presensi Manual Siswa"])
            UC_ExportClassReport(["Unduh / Cetak Rekap Nilai & Presensi Kelas"])
        end

        %% ================= 4. SISWA USE CASES =================
        subgraph SiswaModule [" 🎒 4. Modul Peserta Didik (Siswa Pembelajar) "]
            direction TB
            UC_SiswaDashboard(["Dashboard Siswa, Jadwal & Tugas Aktif"])
            UC_BrowseCourses(["Jelajahi Katalog Kelas Pembelajaran"])
            UC_JoinCourseCode(["Gabung Kelas via Input Kode Unik"])
            UC_JoinCourseDirect(["Gabung Kelas Langsung dari Katalog"])
            UC_LeaveCourse(["Keluar (Leave) dari Kelas yang Diikuti"])
            UC_ReadMaterial(["Akses & Unduh Berkas Modul Pembelajaran"])
            UC_OpenLinkMaterial(["Buka Tautan Sumber / Video Eksternal"])
            UC_SelfAttend(["Presensi / Absensi Mandiri Hari Ini"])
            UC_ViewAttHistory(["Cek Riwayat Kehadiran (Hadir/Izin/Sakit/Alpa)"])
            UC_ViewTaskList(["Lihat Daftar Tugas & Batas Deadline"])
            UC_ViewTaskDetail(["Buka Lembar Instruksi & Lampiran Tugas"])
            UC_SubmitTask(["Kumpulkan Tugas (Upload File / Submit Teks)"])
            UC_CheckMySubmissions(["Cek Bukti & Riwayat Pengumpulan Tugas"])
            UC_ReceiveGradeNotif(["Terima Notifikasi Real-time Nilai dari Guru"])
            UC_ViewFeedback(["Lihat Nilai Tugas & Catatan Evaluasi Guru"])
            UC_ViewGrades(["Lihat Transkrip Rapor Nilai (Tugas/UTS/UAS)"])
        end

    end

    %% ================= ACTOR TO USE CASE ASSOCIATIONS =================
    %% Shared Core Connections
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

    Admin --- UC_MarkNotif
    Guru --- UC_MarkNotif
    Siswa --- UC_MarkNotif

    Admin --- UC_Logout
    Guru --- UC_Logout
    Siswa --- UC_Logout

    %% Admin Connections
    Admin --- UC_AdmDashboard
    Admin --- UC_ListUsers
    Admin --- UC_AddUser
    Admin --- UC_EditUser
    Admin --- UC_ResetPassUser
    Admin --- UC_DeleteUser
    Admin --- UC_BulkImport
    Admin --- UC_MonitorCourse
    Admin --- UC_MonitorAssign
    Admin --- UC_Settings
    Admin --- UC_ExportReports

    %% Guru Connections
    Guru --- UC_GuruDashboard
    Guru --- UC_CreateCourse
    Guru --- UC_EditCourse
    Guru --- UC_ManageStudents
    Guru --- UC_KickStudent
    Guru --- UC_SetAttendanceSched
    Guru --- UC_UploadMaterial
    Guru --- UC_LinkMaterial
    Guru --- UC_DeleteMaterial
    Guru --- UC_CreateTask
    Guru --- UC_EditTask
    Guru --- UC_MonitorSubmissions
    Guru --- UC_ReviewSubmissions
    Guru --- UC_GradeTask
    Guru --- UC_InputExams
    Guru --- UC_ManageClassAttendance
    Guru --- UC_OverrideAttendance
    Guru --- UC_ExportClassReport

    %% Siswa Connections
    Siswa --- UC_SiswaDashboard
    Siswa --- UC_BrowseCourses
    Siswa --- UC_JoinCourseCode
    Siswa --- UC_JoinCourseDirect
    Siswa --- UC_LeaveCourse
    Siswa --- UC_ReadMaterial
    Siswa --- UC_OpenLinkMaterial
    Siswa --- UC_SelfAttend
    Siswa --- UC_ViewAttHistory
    Siswa --- UC_ViewTaskList
    Siswa --- UC_ViewTaskDetail
    Siswa --- UC_SubmitTask
    Siswa --- UC_CheckMySubmissions
    Siswa --- UC_ReceiveGradeNotif
    Siswa --- UC_ViewFeedback
    Siswa --- UC_ViewGrades

    %% Styling
    classDef actorStyle fill:#0F172A,stroke:#0284C7,stroke-width:2px,color:#FFFFFF;
    classDef coreStyle fill:#EFF6FF,stroke:#3B82F6,stroke-width:1.5px,color:#1E3A8A;
    classDef adminStyle fill:#F5F3FF,stroke:#7C3AED,stroke-width:1.5px,color:#5B21B6;
    classDef guruStyle fill:#F0FDF4,stroke:#16A34A,stroke-width:1.5px,color:#166534;
    classDef siswaStyle fill:#FFFBEB,stroke:#D97706,stroke-width:1.5px,color:#92400E;

    class Admin,Guru,Siswa actorStyle;
    class UC_Login,UC_Forgot,UC_Profile,UC_Notif,UC_MarkNotif,UC_Logout coreStyle;
    class UC_AdmDashboard,UC_ListUsers,UC_AddUser,UC_EditUser,UC_ResetPassUser,UC_DeleteUser,UC_BulkImport,UC_MonitorCourse,UC_MonitorAssign,UC_Settings,UC_ExportReports adminStyle;
    class UC_GuruDashboard,UC_CreateCourse,UC_EditCourse,UC_ManageStudents,UC_KickStudent,UC_SetAttendanceSched,UC_UploadMaterial,UC_LinkMaterial,UC_DeleteMaterial,UC_CreateTask,UC_EditTask,UC_MonitorSubmissions,UC_ReviewSubmissions,UC_GradeTask,UC_InputExams,UC_ManageClassAttendance,UC_OverrideAttendance,UC_ExportClassReport guruStyle;
    class UC_SiswaDashboard,UC_BrowseCourses,UC_JoinCourseCode,UC_JoinCourseDirect,UC_LeaveCourse,UC_ReadMaterial,UC_OpenLinkMaterial,UC_SelfAttend,UC_ViewAttHistory,UC_ViewTaskList,UC_ViewTaskDetail,UC_SubmitTask,UC_CheckMySubmissions,UC_ReceiveGradeNotif,UC_ViewFeedback,UC_ViewGrades siswaStyle;
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
    %% ================= 1. START & LOGIN =================
    StartNode(["🏁 Mulai (Buka Website LMS)"]) --> OpenLogin["Pengguna Mengakses Halaman Login (/login)"]
    OpenLogin --> InputCreds["Input Alamat Email & Kata Sandi"]
    InputCreds --> CheckCreds{"Validasi Kredensial Akun<br/>(Laravel Sanctum API)"}
    
    CheckCreds -- "❌ Tidak Valid" --> LoginFailed["Tampilkan Notifikasi Error:<br/>Email atau Password Salah"]
    LoginFailed --> InputCreds
    
    CheckCreds -- "✔ Valid" --> GenToken["Generate Bearer Token Sanctum<br/>Simpan ke LocalStorage / Sesi"]
    GenToken --> EvalRole{"Evaluasi Peran Akun<br/>(user.role)"}

    %% ================= 2. THREE ROLE BRANCHES =================
    EvalRole -- "👑 Role: Administrator" --> AdminFlow
    EvalRole -- "👨‍🏫 Role: Guru Pengajar" --> GuruFlow
    EvalRole -- "👨‍🎓 Role: Peserta Didik" --> SiswaFlow

    %% ================= ADMIN SUBGRAPH (JALUR KIRI) =================
    subgraph AdminFlow [" 👑 ALUR ADMINISTRATOR "]
        direction TB
        AdmDash["1. Masuk Dashboard Administrator<br/>Pantau Metrik Global Sekolah"]
        AdmDash --> AdmUsers["2. Manajemen Akun Pengguna<br/>• Tambah User Manual (Guru/Siswa)<br/>• Bulk Import 50+ User via Excel<br/>• Reset Password & Hapus User"]
        AdmUsers --> AdmMonitor["3. Monitoring Pembelajaran<br/>Pantau Seluruh Kelas & Tugas Aktif"]
        AdmMonitor --> AdmSettings["4. Pengaturan Sistem<br/>Konfigurasi Nama Sekolah & Semester"]
        AdmSettings --> AdmReports["5. Rekapitulasi Laporan Global<br/>Ekspor Data Presensi & Nilai ke Excel/CSV"]
    end

    %% ================= GURU SUBGRAPH (JALUR TENGAH) =================
    subgraph GuruFlow [" 👨‍🏫 ALUR GURU PENGAJAR "]
        direction TB
        GuruDash["1. Masuk Dashboard Guru<br/>Lihat Ringkasan Kelas & Siswa"]
        GuruDash --> GuruCreateCourse["2. Buat Kelas / Mata Pelajaran Baru<br/>Sistem Generate Kode Kelas Unik"]
        GuruCreateCourse --> GuruSched["3. Atur Jam Presensi Kelas<br/>Set Waktu Buka & Tutup Kehadiran"]
        GuruSched --> GuruMaterial["4. Upload Bahan Ajar / Modul<br/>Format Dokumen PDF atau Link Eksternal"]
        GuruMaterial --> GuruTask["5. Terbitkan Tugas / LKPD Baru<br/>Tentukan Instruksi, File & Deadline"]
        GuruTask --> GuruReview["6. Periksa Jawaban Siswa Masuk<br/>Download Berkas / Baca Jawaban"]
        GuruReview --> GuruGrade["7. Beri Nilai Tugas (0-100)<br/>& Berikan Catatan Feedback Ulasan"]
        GuruGrade --> GuruExams["8. Input Nilai Ujian Semester<br/>Input Nilai UTS & UAS Per Siswa"]
        GuruExams --> GuruReport["9. Cek Rekapitulasi Nilai & Presensi<br/>Lihat Persentase Kehadiran Kelas"]
    end

    %% ================= SISWA SUBGRAPH (JALUR KANAN) =================
    subgraph SiswaFlow [" 👨‍🎓 ALUR PESERTA DIDIK (SISWA) "]
        direction TB
        SiswaDash["1. Masuk Dashboard Siswa<br/>Lihat Jadwal Kelas & Tugas Aktif"]
        SiswaDash --> SiswaJoin["2. Gabung ke Kelas Pembelajaran<br/>Input Kode Unik Kelas / Pilih Katalog"]
        SiswaJoin --> SiswaLearn["3. Buka Kelas & Pelajari Modul<br/>Unduh Dokumen PDF / Buka Tautan"]
        SiswaLearn --> SiswaAttend["4. Lakukan Presensi Mandiri<br/>Check-in Kehadiran Sesuai Jadwal"]
        SiswaAttend --> SiswaSubmit["5. Kerjakan & Kumpulkan Tugas<br/>Unggah File Jawaban / Tulis Teks"]
        SiswaSubmit --> SiswaNotif["6. Menerima Notifikasi Lonceng<br/>Update Nilai & Feedback dari Guru"]
        SiswaNotif --> SiswaRapor["7. Lihat Rapor Nilai Siswa<br/>Transkrip Nilai Tugas, UTS & UAS"]
    end

    %% ================= 3. TERMINATION =================
    AdmReports --> UserLogout["Pengguna Melakukan Logout / Selesai Sesi"]
    GuruReport --> UserLogout
    SiswaRapor --> UserLogout
    UserLogout --> EndNode(["🏁 Selesai (Sesi Berakhir)"])

    %% ================= STYLING =================
    classDef startStyle fill:#0F172A,stroke:#0284C7,stroke-width:2px,color:#FFFFFF;
    classDef authStyle fill:#F1F5F9,stroke:#64748B,stroke-width:1.5px,color:#0F172A;
    classDef adminStyle fill:#F5F3FF,stroke:#7C3AED,stroke-width:1.5px,color:#5B21B6;
    classDef guruStyle fill:#F0FDF4,stroke:#16A34A,stroke-width:1.5px,color:#166534;
    classDef siswaStyle fill:#FFFBEB,stroke:#D97706,stroke-width:1.5px,color:#92400E;

    class StartNode,EndNode startStyle;
    class OpenLogin,InputCreds,CheckCreds,LoginFailed,GenToken,EvalRole,UserLogout authStyle;
    class AdmDash,AdmUsers,AdmMonitor,AdmSettings,AdmReports adminStyle;
    class GuruDash,GuruCreateCourse,GuruSched,GuruMaterial,GuruTask,GuruReview,GuruGrade,GuruExams,GuruReport guruStyle;
    class SiswaDash,SiswaJoin,SiswaLearn,SiswaAttend,SiswaSubmit,SiswaNotif,SiswaRapor siswaStyle;
```

---

*Dokumentasi 3 Diagram Master Utama disusun untuk melengkapi pelaporan teknis, skripsi/tugas akhir, dan pemahaman arsitektur sistem E-Learning.*
