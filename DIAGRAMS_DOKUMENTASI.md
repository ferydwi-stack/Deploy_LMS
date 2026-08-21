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
flowchart TD
    %% ================= 3 CLEAN VERTICAL ROLE COLUMNS =================
    
    %% ================= COLUMN 1: ADMINISTRATOR =================
    subgraph AdminCol [" 👑 ROLE ADMINISTRATOR (SUPER USER) "]
        direction TB
        AdminActor((👤 Administrator))
        
        AdminActor --> Adm1["1. 🔑 Login & Autentikasi Akun Sanctum"]
        Adm1 --> Adm2["2. 👤 Kelola Profil & Kontak Pribadi"]
        Adm2 --> Adm3["3. 🔔 Terima Notifikasi Real-time LMS"]
        Adm3 --> Adm4["4. 📊 Dashboard Statistik Global Sekolah"]
        Adm4 --> Adm5["5. 👥 Manajemen Pengguna (CRUD & Reset Sandi)"]
        Adm5 --> Adm6["6. 📥 Bulk Import Akun Massal (Excel/CSV 50+ User)"]
        Adm6 --> Adm7["7. 📚 Monitoring Seluruh Kelas & Tugas Aktif"]
        Adm7 --> Adm8["8. ⚙️ Pengaturan Identitas Sekolah & Semester"]
        Adm8 --> Adm9["9. 📑 Rekapitulasi & Ekspor Laporan ke Excel/CSV"]
        Adm9 --> Adm10["10. 🚪 Logout / Selesai Sesi Administrator"]
    end

    %% ================= COLUMN 2: GURU PENGAJAR =================
    subgraph GuruCol [" 👨‍🏫 ROLE GURU PENGAJAR (TENAGA PENDIDIK) "]
        direction TB
        GuruActor((👨‍🏫 Guru Pengajar))
        
        GuruActor --> Guru1["1. 🔑 Login & Autentikasi Akun Sanctum"]
        Guru1 --> Guru2["2. 👤 Kelola Profil Pribadi & Mata Pelajaran"]
        Guru2 --> Guru3["3. 🔔 Notifikasi Real-time Pengumpulan Siswa"]
        Guru3 --> Guru4["4. 📊 Dashboard Guru & Ringkasan Kelas Siswa"]
        Guru4 --> Guru5["5. ➕ Buat Kelas / Mapel & Terbitkan Kode Kelas"]
        Guru5 --> Guru6["6. 👥 Kelola & Keluarkan (Kick) Siswa di Kelas"]
        Guru6 --> Guru7["7. ⏰ Atur Jam Buka-Tutup Jadwal Presensi"]
        Guru7 --> Guru8["8. 📄 Upload Modul Bahan Ajar (PDF/Doc/Link)"]
        Guru8 --> Guru9["9. 📝 Terbitkan Tugas/LKPD, File & Deadline"]
        Guru9 --> Guru10["10. 📥 Periksa & Unduh Berkas Lembar Jawaban"]
        Guru10 --> Guru11["11. ⭐ Beri Nilai Tugas (0-100) & Catatan Feedback"]
        Guru11 --> Guru12["12. 🏆 Input Nilai Ujian Semester (UTS & UAS)"]
        Guru12 --> Guru13["13. 📋 Rekapitulasi Presensi & Rapor Kelas"]
        Guru13 --> Guru14["14. 🚪 Logout / Selesai Sesi Guru"]
    end

    %% ================= COLUMN 3: PESERTA DIDIK =================
    subgraph SiswaCol [" 👨‍🎓 ROLE PESERTA DIDIK (SISWA PEMBELAJAR) "]
        direction TB
        SiswaActor((👨‍🎓 Peserta Didik))
        
        SiswaActor --> Siswa1["1. 🔑 Login & Autentikasi Akun Sanctum"]
        Siswa1 --> Siswa2["2. 👤 Kelola Profil Siswa & Kontak Pribadi"]
        Siswa2 --> Siswa3["3. 🔔 Notifikasi Real-time Tugas & Nilai Masuk"]
        Siswa3 --> Siswa4["4. 📊 Dashboard Siswa, Jadwal Aktif & Tugas"]
        Siswa4 --> Siswa5["5. 🔍 Jelajahi Katalog & Gabung Kelas (Kode Unik)"]
        Siswa5 --> Siswa6["6. 📖 Akses & Unduh Modul Bahan Ajar (PDF/Link)"]
        Siswa6 --> Siswa7["7. ✅ Presensi / Absensi Mandiri Hari Ini"]
        Siswa7 --> Siswa8["8. 📅 Cek Riwayat Kehadiran (Hadir/Izin/Sakit/Alpa)"]
        Siswa8 --> Siswa9["9. 📝 Lihat Daftar Tugas & Batas Deadline"]
        Siswa9 --> Siswa10["10. 📤 Kumpulkan Tugas (Upload File / Submit Teks)"]
        Siswa10 --> Siswa11["11. 📊 Transkrip Rapor Nilai Siswa (Tugas, UTS, UAS)"]
        Siswa11 --> Siswa12["12. 🚪 Keluar (Leave) dari Kelas yang Diikuti"]
        Siswa12 --> Siswa13["13. 🚪 Logout / Selesai Sesi Siswa"]
    end

    %% ================= STYLING (MATCHING FLOWCHART) =================
    classDef actorStyle fill:#0F172A,stroke:#0284C7,stroke-width:2px,color:#FFFFFF;
    classDef adminStyle fill:#F5F3FF,stroke:#7C3AED,stroke-width:1.5px,color:#5B21B6;
    classDef guruStyle fill:#F0FDF4,stroke:#16A34A,stroke-width:1.5px,color:#166534;
    classDef siswaStyle fill:#FFFBEB,stroke:#D97706,stroke-width:1.5px,color:#92400E;

    class AdminActor,GuruActor,SiswaActor actorStyle;
    class Adm1,Adm2,Adm3,Adm4,Adm5,Adm6,Adm7,Adm8,Adm9,Adm10 adminStyle;
    class Guru1,Guru2,Guru3,Guru4,Guru5,Guru6,Guru7,Guru8,Guru9,Guru10,Guru11,Guru12,Guru13,Guru14 guruStyle;
    class Siswa1,Siswa2,Siswa3,Siswa4,Siswa5,Siswa6,Siswa7,Siswa8,Siswa9,Siswa10,Siswa11,Siswa12,Siswa13 siswaStyle;
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
