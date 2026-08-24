# 🚀 PANDUAN LENGKAP ARSITEKTUR, KODE, & MATERI PRESENTASI SISTEM EDUSCHOOL LMS

> **Dokumen Resmi Presentasi & Bedah Sistem Full-Stack E-Learning**  
> Proyek Praktik Kerja Lapangan (PKL) / Tugas Akhir — Program Studi S1 Informatika  
> Fakultas Teknik dan Ilmu Komputer, Universitas Teknokrat Indonesia & CV Newus Teknologi

---

## 👥 1. IDENTITAS TIM & PEMBAGIAN PERAN (TEAM ROLES)

Proyek **EduSchool LMS** dirancang dan dibangun secara kolaboratif oleh 3 orang mahasiswa dengan pembagian tanggung jawab profesional sebagai berikut:

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│                                STRUKTUR TIM PENGEMBANG                                   │
├───────────────────────────────┬───────────────────────────────┬──────────────────────────┤
│     FERY DWI RAMADHI          │       FATHUR RAMANTHA         │  I PUTU PANDU WIRANATA   │
│       (NPM 23312086)          │        (NPM 23312105)         │      (NPM 23312088)      │
├───────────────────────────────┼───────────────────────────────┼──────────────────────────┤
│ 📌 Peran:                     │ 📌 Peran:                     │ 📌 Peran:                │
│  • System Analyst             │  • Frontend UI/UX Specialist  │  • Full-Stack Engineer   │
│  • Cloud & DevOps Engineer    │  • Design System & Styling    │    (Frontend & Backend)  │
│  • QA & Automated Testing     │  • Client-Side Components     │  • RESTful API & DB Dev  │
│  • Dokumentasi Program        │  • Responsive & Animations    │  • Real-time Sync Logic  │
├───────────────────────────────┼───────────────────────────────┼──────────────────────────┤
│ 🛠 Tanggung Jawab:            │ 🛠 Tanggung Jawab:            │ 🛠 Tanggung Jawab:       │
│  1. Analisis kebutuhan PRD    │  1. Perancangan UI/UX Figma   │  1. Pembangunan REST API │
│  2. Desain arsitektur sistem  │  2. Implementasi 30+ halaman  │     50+ endpoint Laravel │
│  3. Pemodelan ERD & DB MySQL  │     dan 20+ komponen Next.js  │  2. Integrasi Axios/API  │
│  4. Setup Cloud Vercel/Railway│  3. Tailwind CSS & tema warna │     Client (`lib/api.ts`)│
│  5. Skrip Automated Bot Test  │  4. Micro-interactions &      │  3. Logika State & Hook  │
│  6. Penulisan Laporan & Docx  │     animasi responsif mobile  │     `useRealtimeData`    │
│                               │  5. Dashboard Admin, Guru,    │  4. Modul Tugas, Presensi│
│                               │     dan Siswa                 │     dan Rekap Nilai      │
└───────────────────────────────┴───────────────────────────────┴──────────────────────────┘
```

---

## 💻 2. TEKNOLOGI & TECH STACK YANG DIGUNAKAN (WHY & HOW)

Sistem mengadopsi arsitektur **Decoupled / Headless Web Architecture** (pemisahan total antara antarmuka klien dan server API):

```
                       ┌─────────────────────────────────────────┐
                       │           CLIENT LAYER (Edge)           │
                       │           Vercel Cloud Hosting          │
                       │   Next.js 15 • React 19 • TypeScript    │
                       └────────────────────┬────────────────────┘
                                            │
                                            │ HTTPS / JSON (REST API)
                                            │ Bearer Token (Sanctum)
                                            ▼
                       ┌─────────────────────────────────────────┐
                       │          BACKEND LAYER (Server)         │
                       │          Railway Cloud Hosting          │
                       │        Laravel 12 (PHP 8.2 / FPM)       │
                       └────────────────────┬────────────────────┘
                                            │
                                            │ TCP / SQL Queries
                                            │ Eloquent ORM
                                            ▼
                       ┌─────────────────────────────────────────┐
                       │             DATABASE LAYER              │
                       │          MySQL 8.0 Managed DB           │
                       │          11 Relational Tables           │
                       └─────────────────────────────────────────┘
```

### A. Sisi Frontend (Client-Side)
- **Framework**: **Next.js 15 (App Router)**
  - *Alasan*: Performa tinggi, fitur *Server & Client Components*, optimasi bundling bawaan (*Turbopack*), routing berbasis folder yang rapi.
- **Library UI**: **React 19** & **TypeScript 5.7**
  - *Alasan*: *Strict type-safety*, mencegah *runtime error* akibat data *undefined/null*.
- **Styling**: **Tailwind CSS v4**
  - *Alasan*: Desain utilitas yang sangat cepat, ukuran bundel CSS minimal, konsistensi warna antarmuka modern.
- **Ikon & Visual**: **Lucide React**, **Canvas Confetti**, **Recharts**
  - *Alasan*: Visual interaktif yang memanjakan pengguna saat menyelesaikan tugas atau melihat grafik performa akademik.

### B. Sisi Backend (Server-Side)
- **Framework**: **Laravel 12 (PHP 8.2+)**
  - *Alasan*: Framework PHP standar industri dengan arsitektur MVC/Service yang kokoh, keamanan bawaan (*CSRF, SQL Injection Protection*), dan ekosistem terlengkap.
- **Autentikasi**: **Laravel Sanctum**
  - *Alasan*: Autentikasi berbasis *Bearer Token API* yang ringan, stateless, aman untuk aplikasi web modern.
- **Basis Data & ORM**: **MySQL 8.0** & **Eloquent ORM**
  - *Alasan*: Integritas relasional tinggi (*Foreign Keys, Cascade on Delete*), query terstruktur dan mudah di-*maintenance*.
- **Pustaka Pendukung**:
  - `maatwebsite/excel`: Untuk parsing dan ekspor file spreadsheet (.xlsx/.csv).
  - `nesbot/carbon`: Manajemen manipulasi tanggal, zona waktu (WIB), dan jendela waktu presensi.

### C. Infrastruktur Cloud & Deployment
- **Frontend Hosting**: **Vercel** (Global CDN, otomatis deploy via Git).
- **Backend Hosting**: **Railway** (Containerized PHP 8.2 Engine dengan environment terisolasi).
- **Database Server**: **Railway Managed MySQL** dengan volume storage persisten.

---

## 📁 3. BEDAH STRUKTUR FOLDER LENGKAP

Berikut adalah peta struktur direktori proyek beserta fungsi dari masing-masing folder dan file:

```
Sistem-E-learning-main/
│
├── Frontend/                             # 🌐 KODE SUMBER FRONTEND (Next.js)
│   ├── app/                              # Sistem Routing Next.js (App Router)
│   │   ├── admin/                        # Dashboard & Modul Administrator
│   │   │   ├── users/                    # Kelola Pengguna (Tambah, Edit, Hapus, Import)
│   │   │   ├── reports/                  # Rekapitulasi Presensi & Nilai Global
│   │   │   ├── settings/                 # Pengaturan Sekolah & Logo
│   │   │   └── page.tsx                  # Dashboard Admin (Grafik & Statistik)
│   │   ├── guru/                         # Dashboard & Modul Guru Pengajar
│   │   │   ├── kelas/                    # Manajemen Kelas & Anggota Siswa
│   │   │   │   └── [id]/                 # Detail Kelas (Tab Materi, Tugas, Absensi, Anggota)
│   │   │   ├── materi/                   # Kelola Modul & Lampiran Bahan Ajar
│   │   │   ├── tugas/                    # Buat Tugas LKPD & Penilaian Jawaban
│   │   │   ├── absensi/                  # Atur Jadwal & Rekap Presensi Kelas
│   │   │   ├── nilai/                    # Input Nilai UTS & UAS
│   │   │   └── page.tsx                  # Dashboard Guru
│   │   ├── siswa/                        # Dashboard & Modul Peserta Didik
│   │   │   ├── kelas/                    # Katalog Kelas & Belajar Online
│   │   │   │   └── [id]/                 # Ruang Kelas Siswa (Akses Materi & Absen)
│   │   │   ├── tugas/                    # Daftar Tugas & Form Pengumpulan (Submit)
│   │   │   ├── absensi/                  # Riwayat & Tombol Presensi Mandiri
│   │   │   ├── nilai/                    # Tampilan Rapor & Nilai Mandiri
│   │   │   └── page.tsx                  # Dashboard Siswa
│   │   ├── login/                        # Halaman Login Multi-Role & Demo Account
│   │   ├── reset-password/               # Halaman Reset Kata Sandi
│   │   ├── layout.tsx                    # Root Layout (Font, Metadata, Providers)
│   │   └── globals.css                   # Global CSS & Tailwind CSS Config
│   │
│   ├── components/                       # Komponen UI Reusable
│   │   ├── Navbar.tsx                    # Header Atas (Profil, Lonceng Notifikasi)
│   │   ├── Sidebar.tsx                   # Navigasi Kiri Dinamis Sesuai Role
│   │   ├── StatCard.tsx                  # Kartu Metrik Statistik
│   │   ├── CourseCard.tsx                # Kartu Tampilan Kelas
│   │   └── ModalDialog.tsx               # Modal Dialog Pop-up
│   │
│   ├── hooks/                            # Custom React Hooks
│   │   ├── useAuth.ts                    # Hook Manajemen Sesi Login & Role Check
│   │   ├── useRealtimeData.ts            # Hook Sinkronisasi Real-time Lintas Tab
│   │   └── useNotifications.ts           # Hook Polling & Ambil Notifikasi Real-time
│   │
│   ├── lib/                              # Utility & API Integration
│   │   └── api.ts                        # Central API Client (Semua Fetch/Axios Request)
│   │
│   └── types/                            # TypeScript Type Definitions
│       └── index.ts                      # Interface User, Course, Assignment, dll.
│
├── backend/                              # ⚙️ KODE SUMBER BACKEND (Laravel 12)
│   ├── app/
│   │   ├── Http/Controllers/Api/         # Controller API (Logika Bisnis)
│   │   │   ├── AuthController.php        # Login, Logout, User Profile, Token
│   │   │   ├── AdminController.php       # CRUD Pengguna, Bulk Import, Stats
│   │   │   ├── CourseController.php      # CRUD Kelas, Tambah Siswa ke Kelas
│   │   │   ├── MaterialController.php    # Upload Modul & Tautan Pembelajaran
│   │   │   ├── AssignmentController.php  # Buat Tugas, Deadline, Bobot Nilai
│   │   │   ├── SubmissionController.php  # Kumpul Tugas Siswa, Penilaian Guru
│   │   │   ├── AttendanceController.php  # Presensi Mandiri & Validasi Waktu
│   │   │   ├── ReportController.php      # Rekap Nilai Rapor & Ekspor Excel
│   │   │   └── NotificationController.php# Ambil Notifikasi & Tandai Terbaca
│   │   │
│   │   └── Models/                       # Eloquent Models (Relasi Antar Tabel)
│   │       ├── User.php                  # Model Pengguna (Admin, Guru, Siswa)
│   │       ├── Course.php                # Model Kelas/Mata Pelajaran
│   │       ├── Material.php              # Model Bahan Ajar
│   │       ├── Assignment.php            # Model Penugasan LKPD
│   │       ├── Submission.php            # Model Jawaban Tugas Siswa
│   │       ├── Attendance.php            # Model Presensi Siswa
│   │       └── Notification.php          # Model Notifikasi
│   │
│   ├── database/
│   │   ├── migrations/                   # Skema Migrasi 11 Tabel MySQL
│   │   └── seeders/                      # Seeder Data Awal & Demo Users
│   │
│   ├── routes/
│   │   └── api.php                       # Definisi 50+ Endpoint RESTful API
│   │
│   └── config/
│       ├── cors.php                      # Konfigurasi Cross-Origin Security
│       └── sanctum.php                   # Konfigurasi Token Session Sanctum
│
├── docs/                                 # 📚 DOKUMENTASI LOKAL & LAPORAN PKL (Diabaikan dari Git)
│   ├── diagrams/                         # Aset Gambar Diagram (PNG & SVG)
│   ├── DIAGRAMS_DOKUMENTASI.md           # Penjelasan Lengkap Diagram UML & Flowchart
│   ├── BUKU PANDUAN LAPORAN PKL FTIK.pdf # Buku Acuan Standar FTIK
│   └── Laporan_PKL_FTIK_Teknokrat_...docx# File Naskah Word Laporan PKL Resmi
│
├── ACCOUNTS_README.md                    # 🔑 Daftar 54 Akun Username & Password Lengkap
└── README.md                             # 📖 Ringkasan Proyek & Panduan Setup
```

---

## 🔄 4. ALUR KERJA SISTEM (SYSTEM FLOW & BUSINESS LOGIC)

### 1. Alur Autentikasi & Otorisasi Berbasis Peran (RBAC Flow)
```mermaid
sequenceDiagram
    actor User as Pengguna (Admin/Guru/Siswa)
    participant Browser as Frontend (Next.js)
    participant Backend as Laravel API Server
    participant DB as Basis Data MySQL

    User->>Browser: Masukkan Email & Password
    Browser->>Backend: POST /api/v1/login
    Backend->>DB: Query User by Email
    DB-->>Backend: Data User & Password Hash
    Backend->>Backend: Verifikasi Hash Password
    alt Password Benar
        Backend->>DB: Generate Token Sanctum (personal_access_tokens)
        DB-->>Backend: Token String
        Backend-->>Browser: HTTP 200 { token, user: { id, name, role } }
        Browser->>Browser: Simpan Token di localStorage / Cookies
        Browser->>Browser: Redirect sesuai Role (/admin, /guru, /siswa)
    else Password Salah
        Backend-->>Browser: HTTP 422 { message: "Kredensial tidak valid" }
        Browser-->>User: Tampilkan Pesan Error
    end
```

---

### 2. Alur Presensi Mandiri Siswa (Time-Window Validation)
Fitur unggulan di mana siswa hanya bisa presensi pada jam pelajaran aktif:
```mermaid
flowchart TD
    A([Siswa Buka Menu Presensi]) --> B[Frontend Ambil Data Jadwal Kelas]
    B --> C{Apakah Kelas Memiliki Jam Presensi Aktif?}
    C -- Tidak --> D[Tampilkan Status: 'Belum Ada Jadwal Absen']
    C -- Ya --> E{Waktu Sekarang di Antara Start & End Time?}
    E -- Di Luar Jam --> F[Tombol Disabled: 'Di Luar Jam Presensi']
    E -- Dalam Jam --> G[Tombol Aktif: 'Klik untuk Presensi Hadir']
    G --> H[Siswa Menekan Tombol Presensi]
    H --> I[POST /api/v1/attendances dengan status='hadir']
    I --> J{Apakah Sudah Absen Hari Ini?}
    J -- Sudah Ada Data --> K[Update Data Presensi]
    J -- Belum Ada --> L[Insert Data Presensi Baru]
    K --> M[Kirim Notifikasi Berhasil & Trigger Real-time Event]
    L --> M
    M --> N([Status Berubah Jadi 'HADIR' Berwarna Hijau])
```

---

### 3. Alur Penugasan LKPD & Penilaian (Assignment & Grading Flow)
```
[GURU]                              [SISTEM LMS]                           [SISWA]
  │                                      │                                    │
  ├── 1. Buat Tugas LKPD ───────────────>│                                    │
  │   (Judul, Deadline, Bobot)           │── 2. Kirim Notifikasi Tugas Baru ─>│
  │                                      │                                    ├── 3. Buka Tugas & Unduh Soal
  │                                      │                                    │
  │                                      │<── 4. Upload File Jawaban / Teks ──┤
  │                                      │    (POST /api/v1/submissions)      │
  │                                      │                                    │
  │<── 5. Muncul Notifikasi Pengumpulan ─┤                                    │
  │                                      │                                    │
  ├── 6. Beri Nilai (0-100) & Feedback ─>│                                    │
  │                                      │── 7. Update Nilai ke Rapor Siswa ─>│
  │                                      │                                    └── 8. Nilai Langsung Terlihat!
```

---

### 4. Alur Sinkronisasi Real-time Lintas Tab (`useRealtimeData`)
Salah satu pencapaian teknis terbesar proyek ini: **data terbarui seketika tanpa reload browser!**

```mermaid
sequenceDiagram
    participant TabA as Tab Browser 1 (Guru Input Nilai)
    participant Channel as BroadcastChannel API (Browser)
    participant DOM as Custom DOM Event Bus
    participant TabB as Tab Browser 2 (Siswa / Dashboard)

    TabA->>TabA: Guru Mengubah Nilai / Mengirim Tugas
    TabA->>Channel: broadcast.postMessage({ type: 'DATA_MUTATED', entity: 'grades' })
    TabA->>DOM: window.dispatchEvent(new CustomEvent('lms:data-changed'))
    Channel-->>TabB: Tangkap Sinyal Melalui Event Listener
    TabB->>TabB: Hook useRealtimeData Memicu Revalidation
    TabB->>TabB: Fetch Ulang Data Terbaru di Latar Belakang
    TabB->>TabB: Tampilan Ter-update Otomatis Tanpa Kedipan/Reload!
```

---

## 🔍 5. PENJELASAN KODE PROGRAM INTI (CODE DEEP DIVE)

### A. Client API Centralized (`Frontend/lib/api.ts`)
Seluruh interaksi HTTP dari antarmuka ke backend dipusatkan dalam modul `api.ts`.
- **Fitur Utama**:
  - Otomatis menyematkan `Authorization: Bearer <token>` pada setiap *request*.
  - Menangani *fallback* jika server offline atau mengembalikan error format.
  - Otomatis memicu event `BroadcastChannel` setiap kali terjadi operasi mutasi data (`POST`, `PUT`, `DELETE`).

```typescript
// Contoh implementasi di Frontend/lib/api.ts
async function customFetch(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Jika operasi mengubah data, pancarkan sinyal real-time
  if (['POST', 'PUT', 'DELETE'].includes(options.method || 'GET')) {
    notifyDataMutation(endpoint);
  }

  return response.json();
}
```

---

### B. Hook Real-time Sinkronisasi (`Frontend/hooks/useRealtimeData.ts`)
Hook ini dipasang pada setiap halaman dashboard dan tabel data agar data selalu sinkron:

```typescript
// Frontend/hooks/useRealtimeData.ts
export function useRealtimeData(fetcher: () => void, dependencies = []) {
  useEffect(() => {
    // 1. Eksekusi pertama kali
    fetcher();

    // 2. Pasang pendengar BroadcastChannel (Antar-tab)
    const channel = new BroadcastChannel('lms_realtime_sync');
    channel.onmessage = (event) => {
      fetcher(); // Ambil data baru saat tab lain melakukan aksi
    };

    // 3. Pasang pendengar Window Focus (Saat user kembali ke tab ini)
    const onFocus = () => fetcher();
    window.addEventListener('focus', onFocus);

    return () => {
      channel.close();
      window.removeEventListener('focus', onFocus);
    };
  }, dependencies);
}
```

---

### C. Backend Controller & Normalisasi Validasi (Laravel 12)
Contoh pada `AttendanceController.php` yang mampu menangani presensi secara aman dengan normalisasi string dan proteksi waktu:

```php
public function store(Request $request)
{
    $request->validate([
        'course_id' => 'required|exists:courses,id',
        'status' => 'required|string',
    ]);

    // Normalisasi case-sensitivity (menghindari error huruf besar/kecil)
    $normalizedStatus = strtolower(trim($request->status));
    
    $attendance = Attendance::updateOrCreate(
        [
            'user_id' => auth()->id(),
            'course_id' => $request->course_id,
            'date' => Carbon::now('Asia/Jakarta')->toDateString(),
        ],
        [
            'status' => $normalizedStatus,
            'time' => Carbon::now('Asia/Jakarta')->toTimeString(),
        ]
    );

    return response()->json([
        'success' => true,
        'message' => 'Presensi berhasil dicatat!',
        'data' => $attendance
    ], 200);
}
```

---

## 🎤 6. SKENARIO & RANCANGAN SLIDE PRESENTASI TIM

Untuk memudahkan presentasi kelompok di depan Dosen Pembimbing, Dosen Penguji, atau Manajemen Perusahaan, berikut adalah **panduan pembagian giliran bicara (Script Presentasi)**:

### 🎬 Pembukaan (Moderator / Tim)
> *"Selamat pagi/siang Bapak/Ibu Dosen Penguji dan Pembimbing. Kami dari kelompok PKL S1 Informatika Universitas Teknokrat Indonesia di CV Newus Teknologi ingin mempresentasikan hasil proyek sistem kami yang berjudul **EduSchool: Sistem Learning Management System (LMS) Terpadu Berbasis Next.js dan Laravel 12**."*

---

### 🗣️ Bagian 1: FERY DWI RAMADHI (System Analyst, DevOps & QA)
**Materi yang Dipresentasikan**:
1. **Latar Belakang Masalah**: Kebutuhan sekolah akan sistem e-learning yang ringan, tidak lemot, dan memiliki kontrol presensi yang akurat.
2. **Arsitektur Sistem & Basis Data**:
   - Menjelaskan arsitektur *Decoupled* (Next.js di Vercel + Laravel di Railway + MySQL 8.0).
   - Menunjukkan diagram ERD (11 tabel relasional) dan bagaimana data terhubung secara aman.
3. **Cloud Infrastructure & Testing**:
   - Menjelaskan bagaimana sistem di-*deploy* ke cloud produksi publik.
   - Memaparkan hasil **Automated Bot Testing (53 skenario uji coba)** yang meraih tingkat kelolosan **100% (Passed)**.

---

### 🗣️ Bagian 2: FATHUR RAMANTHA (Frontend UI/UX Specialist)
**Materi yang Dipresentasikan**:
1. **Perancangan Desain UI/UX di Figma**:
   - Menjelaskan prinsip *Human-Centered Design*, tata warna modern, dan konsistensi tipografi.
2. **Implementasi Komponen Next.js & Tailwind CSS**:
   - Mendemokan 3 antarmuka Dashboard yang berbeda:
     - **Dashboard Admin**: Ringkasan data, grafik aktivitas, kelola akun.
     - **Dashboard Guru**: Manajemen kelas, materi ajar, input nilai tugas & ujian.
     - **Dashboard Siswa**: Ruang kelas interaktif, pengumpulan tugas, presensi mandiri.
3. **Responsivitas & Solusi CLS (Cumulative Layout Shift)**:
   - Menunjukkan bagaimana antarmuka menyesuaikan dengan mulus di layar smartphone/tablet menggunakan *Skeleton Loaders*.

---

### 🗣️ Bagian 3: I PUTU PANDU WIRANATA (Full-Stack Engineer - Frontend & Backend)
**Materi yang Dipresentasikan**:
1. **Pembangunan RESTful API Laravel 12**:
   - Menjelaskan bagaimana lebih dari 50 endpoint API dibuat, diamankan dengan *Laravel Sanctum*, dan divalidasi dengan cermat.
2. **Integrasi Client-Server & Real-Time Sync**:
   - Mendemokan fitur **Auto-Sync Real-time**: Membuka dua tab browser (satu Guru, satu Siswa), guru menginput nilai atau membuat tugas, dan layar siswa langsung terbarui otomatis dalam hitungan detik tanpa reload!
3. **Fitur Unggulan**:
   - Fitur *Bulk Import Spreadsheet* 50+ akun siswa/guru secara instan.
   - Fitur *Ekspor Laporan Nilai & Presensi* langsung ke format file Microsoft Excel (.xlsx).

---

### 🎯 7. PERTANYAAN YANG SERING DITANYAKAN (FAQ) & JAWABAN TEKNIS

| Pertanyaan Penguji | Jawaban Teknis yang Direkomendasikan |
| :--- | :--- |
| **1. Mengapa memisahkan Frontend (Next.js) dan Backend (Laravel) daripada monolitik Blade?** | *"Dengan memisahkan frontend dan backend, kami mendapatkan keunggulan arsitektur modern: frontend berjalan sangat cepat di Edge CDN (Vercel) dengan pengalaman SPA (Single Page Application) yang mulus, sementara backend Laravel berfokus penuh sebagai API Service yang aman dan terukur. Jika di masa depan ingin dibuat aplikasi mobile (misal Flutter/React Native), API yang sama bisa langsung digunakan kembali tanpa perlu menulis ulang backend."* |
| **2. Bagaimana cara mengamankan API agar tidak sembarang orang bisa mengakses data nilai atau kelas?** | *"Kami menerapkan otorisasi berlapis: Pertama, autentikasi menggunakan **Laravel Sanctum Bearer Token** yang di-hash di database. Kedua, kami memasang **Middleware Role-Based Access Control (RBAC)** di setiap rute API, sehingga misalnya token siswa tidak akan pernah bisa mengakses endpoint manajemen user admin ataupun endpoint input nilai guru."* |
| **3. Bagaimana mekanisme real-time data bekerja tanpa menggunakan WebSocket yang boros resource?** | *"Kami menggunakan pendekatan **Hybrid Event-Driven Sync** via `BroadcastChannel API` bawaan browser dan custom hook `useRealtimeData`. Setiap mutasi data di sisi client memancarkan sinyal ke seluruh tab yang aktif untuk melakukan revalidasi query data terbaru di background. Pendekatan ini sangat hemat daya, tidak membebani server dengan koneksi socket terbuka terus-menerus, dan memiliki fallback window focus revalidation."* |
| **4. Bagaimana jika pengguna mengunggah file Excel import yang formatnya salah?** | *"Backend kami dilengkapi validasi header otomatis menggunakan pustaka Maatwebsite Excel. Jika susunan kolom atau format data tidak sesuai dengan template master, sistem akan membatalkan transaksi database secara aman dan menampilkan notifikasi kesalahan yang spesifik kepada administrator."* |

---

<div align="center">

**EduSchool LMS — Siap untuk Presentasi Akademik & Industri dengan Kualitas Terbaik! 🎓✨**

</div>
