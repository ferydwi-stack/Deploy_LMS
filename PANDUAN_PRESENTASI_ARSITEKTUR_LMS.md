# 📘 PANDUAN JOBDESK LENGKAP & MENDALAM — EDUSCHOOL LMS

> **Dokumen Presentasi & Belajar Mandiri Anggota Tim**  
> Proyek PKL — S1 Informatika, Universitas Teknokrat Indonesia × CV Newus Teknologi  
> Live: [https://sistem-e-learning-g9xn.vercel.app](https://sistem-e-learning-g9xn.vercel.app)

---

## 🗂️ DAFTAR ISI

1. [Identitas Tim & Gambaran Besar Peran](#identitas-tim)
2. [FERY DWI RAMADHI — System Analyst, DevOps, Database, Dokumentasi](#fery)
3. [FATHUR RAMANTHA — Frontend UI/UX & Design System](#fathur)
4. [I PUTU PANDU WIRANATA — Full-Stack Engineer (Backend + Frontend Logic)](#pandu)
5. [Arsitektur Sistem & Tech Stack Keseluruhan](#arsitektur)
6. [Peta Lengkap Rute API Backend](#api-routes)
7. [Alur Kerja & Flowchart Sistem](#flowchart)
8. [FAQ Tanya Jawab Presentasi](#faq)

---

## 👥 IDENTITAS TIM & GAMBARAN BESAR PERAN {#identitas-tim}

| Anggota | NPM | Bidang Utama |
| :--- | :--- | :--- |
| **Fery Dwi Ramadhi** | 23312086 | System Analyst, Cloud DevOps, Database Architect, Dokumentasi |
| **Fathur Ramantha** | 23312105 | Frontend UI/UX, Design System, Komponen Next.js |
| **I Putu Pandu Wiranata** | 23312088 | Full-Stack Engineer: RESTful API + Frontend State & Logic |

---

---

## 👨‍💻 FERY DWI RAMADHI (NPM 23312086) {#fery}
### *System Analyst · Cloud & DevOps Engineer · Database Architect · Dokumentasi Program*

---

### 📌 JOBDESK 1 — Analisis Kebutuhan Sistem & Pemodelan UML

#### 🔧 Apa yang Dibuat:
- **Dokumen Product Requirements Document (PRD)** — mendefinisikan 50 fitur fungsional untuk 3 aktor pengguna.
- **Diagram Use Case Terpadu** — memetakan setiap fitur ke aktor yang berhak menggunakannya.
- **Diagram Alir Sistem (Flowchart)** — menggambarkan alur eksekusi dari login hingga penggunaan fitur per peran.
- **Activity Diagram** — alur detail setiap proses (misal: alur presensi mandiri, alur submit tugas).
- **Sequence Diagram** — pola pertukaran pesan (Browser ↔ API ↔ Database).

#### 🎯 Kegunaan / Buat Apa:
- Menjadi **cetak biru (blueprint)** utama seluruh tim agar semua anggota membangun fitur yang sama dan tidak tumpang tindih.
- Mendefinisikan **Matriks Hak Akses (RBAC Matrix)** yang membatasi operasi per peran:
  ```
  Administrator : CRUD User, Pengaturan Sekolah, Monitoring Global, Import Massal
  Guru Pengajar : CRUD Kelas, Materi, Tugas, Nilai UTS/UAS, Jadwal Presensi
  Peserta Didik : Join Kelas, Baca Materi, Submit Tugas, Presensi Mandiri, Cek Rapor
  ```
- Mencegah *scope creep* (pelebaran fitur yang tidak terencana).

#### 🛠️ Tools & Teknologi:
- **UML 2.5 Standard** (Use Case, Activity, Sequence Diagram)
- **Mermaid.js** (diagram berbasis Markdown)
- **Draw.io / Lucidchart** (visual diagram)
- **Markdown PRD** (dokumentasi kebutuhan)

#### 🧠 Logika & Mekanisme (Logic):
- Setiap fitur dikategorikan ke 3 level akses: *baca saja, baca+tulis, admin penuh*.
- Diagram Sequence digunakan untuk memvalidasi alur token (client → bearer header → server → response JSON).

---

### 📌 JOBDESK 2 — Perancangan Arsitektur Basis Data Relasional (MySQL 8.0)

#### 🔧 Apa yang Dibuat:
- **21 file migrasi database Laravel** (dieksekusi secara berurutan saat deploy).
- **Entity Relationship Diagram (ERD)** dengan 11 tabel utama:

| Tabel | Fungsi |
| :--- | :--- |
| `users` | Menyimpan semua pengguna (Admin, Guru, Siswa) + role + nisn_or_nip |
| `courses` | Data kelas/mata pelajaran + kode kelas + jadwal presensi |
| `course_student` | Pivot *Many-to-Many* (siswa ↔ kelas) + nilai UTS & UAS |
| `materials` | Modul materi pembelajaran (judul, link URL, file path) |
| `assignments` | Data tugas LKPD (judul, deadline, bobot nilai) |
| `submissions` | Jawaban tugas siswa (file path, status, nilai, feedback) |
| `attendances` | Data presensi siswa (status: hadir/izin/sakit/alpha, tanggal, jam) |
| `notifications` | Notifikasi untuk guru dan siswa (tugas baru, nilai masuk) |
| `settings` | Konfigurasi global sekolah (nama, tahun ajaran, semester) |
| `activity_logs` | Log audit aktivitas pengguna di sistem |
| `personal_access_tokens` | Token Sanctum untuk autentikasi sesi API |

#### 🎯 Kegunaan / Buat Apa:
- Menyimpan seluruh data akademik secara **terstruktur, konsisten, dan bebas redundansi**.
- Mendukung query kompleks seperti: *"Ambil semua nilai tugas + UTS + UAS siswa di kelas X untuk dihitung nilai rapor"* secara efisien dengan satu relasi Eloquent.

#### 🛠️ Tools & Teknologi:
- **MySQL 8.0** + **InnoDB Storage Engine**
- **Laravel Eloquent Migrations** (PHP)
- **B-Tree Indexing** untuk percepatan pencarian
- **Bcrypt** untuk enkripsi password

#### 🧠 Logika & Mekanisme (Logic):
- **Normalisasi 3NF**: Memastikan tidak ada kolom yang menyimpan data dari tabel lain secara langsung.
- **Tabel Pivot `course_student`**: Hubungan Many-to-Many antara siswa dan kelas. Selain itu, tabel ini juga menyimpan `uts_score` dan `uas_score` langsung di pivot, sehingga satu siswa bisa punya nilai UTS/UAS berbeda per kelas yang dia ikuti.
- **Composite Unique Key**: Pada tabel `attendances`, kombinasi `(user_id, course_id, date)` dibuat unik — sehingga satu siswa hanya bisa tercatat hadir satu kali per kelas per hari:
  ```sql
  UNIQUE KEY `unique_student_course_date` (`user_id`, `course_id`, `date`)
  ```
- **Cascade Deletion**: Jika sebuah kelas dihapus oleh admin, seluruh data terkait (materi, tugas, presensi, notifikasi) otomatis terhapus, mencegah *orphan data*.
- **Iterasi Migrasi Bertahap**: Skema berkembang sepanjang sprint:
  - Sprint 1: Tabel dasar `users`, `courses`, `assignments`, `submissions`
  - Sprint 2: Tambah `attendances`, `notifications`, kolom `uts_score`/`uas_score` di pivot
  - Sprint 3: Tambah kolom `attachment` di tugas, `attendance_schedule` di kelas, `settings`

---

### 📌 JOBDESK 3 — Cloud & DevOps Infrastructure (Vercel + Railway)

#### 🔧 Apa yang Dibuat:
- **Pipeline Deployment Frontend** ke Vercel (Next.js Serverless + Edge CDN global).
- **Pipeline Deployment Backend** ke Railway (Containerized PHP 8.2 FPM + Nginx reverse proxy).
- **Managed MySQL Database** di Railway dengan volume penyimpanan persisten.
- **Konfigurasi CORS** (`config/cors.php`) untuk mengizinkan komunikasi aman antara domain Vercel ↔ Railway.
- **Environment Variables** terpisah untuk lokal dan produksi.

#### 🎯 Kegunaan / Buat Apa:
- Agar sistem **dapat diakses publik 24/7** di URL produksi tanpa memerlukan server fisik.
- **Vercel Edge CDN** memastikan halaman web dirender dan di-cache dekat dengan lokasi pengguna → latensi rendah.
- **Railway** menghosting PHP API dengan resource terisolasi dan auto-restart jika crash.

#### 🛠️ Tools & Teknologi:
- **Vercel** (Frontend Deployment, Serverless Functions)
- **Railway** (Backend Docker Container + MySQL)
- **Git Webhooks** (auto-deploy setiap push ke branch `main`)
- **SSL/TLS 1.3** (HTTPS otomatis)
- **Nginx** (reverse proxy untuk PHP-FPM)

#### 🧠 Logika & Mekanisme (Logic):
- **CORS Preflight Handling**: Browser modern selalu mengirim request HTTP `OPTIONS` sebelum request utama. Konfigurasi `cors.php` di Laravel menjawab preflight tersebut dengan header `Access-Control-Allow-Origin: https://sistem-e-learning-g9xn.vercel.app` dan `Access-Control-Allow-Headers: Authorization, Content-Type`.
- **Dual API Prefix**: Rute API didaftarkan di tiga prefix (`/v1`, `/api/v1`, dan root) untuk kompatibilitas dengan berbagai konfigurasi Railway.
- **Pemisahan Environment**: File `.env.production` di Railway berisi `DB_HOST`, `DB_PORT`, `DB_PASSWORD`, `APP_KEY` yang berbeda dari `.env.local` pengembang lokal, menjaga keamanan kredensial produksi.

---

### 📌 JOBDESK 4 — Penyusunan Dokumentasi Teknis & Laporan PKL Resmi

#### 🔧 Apa yang Dibuat:
- **Buku Naskah Laporan PKL** (`.docx`) format 100% standar FTIK Universitas Teknokrat Indonesia.
- **Panduan Instalasi Lokal** (README.md).
- **Dokumen Arsitektur Sistem** dan panduan pengembang (file `.md`).

#### 🎯 Kegunaan / Buat Apa:
- Memenuhi syarat kelulusan PKL secara akademik.
- Menjadi dokumen serah terima perangkat lunak profesional untuk CV Newus Teknologi.

#### 🛠️ Tools & Teknologi:
- **Python `python-docx`** (generate file Word `.docx` secara programatik)
- **Microsoft Word** (format pengetikan akhir)
- **Panduan Akademik FTIK** (referensi standar penulisan)

#### 🧠 Format & Standar Penulisan:
- Margin: Kiri 4 cm, Atas 3 cm, Kanan 3 cm, Bawah 3 cm.
- Font: **Times New Roman 12pt**, spasi 1.5, paragraf rata kanan-kiri.
- Judul BAB dimulai dari 4 cm dari tepi atas halaman.
- Sistem sitasi: **Harvard Referencing** (Penulis, Tahun).
- Penomoran: Romawi (i, ii, iii) untuk halaman awal; angka Arab (1, 2, 3) di kanan atas untuk konten.
- Halaman penyekat biru (*blue separator*) antar-anggota di BAB III.

---

---

## 🎨 FATHUR RAMANTHA (NPM 23312105) {#fathur}
### *Frontend UI/UX Specialist · Design System Engineer · Client-Side Component Developer*

---

### 📌 JOBDESK 1 — Riset Pengguna & Desain Antarmuka (UI/UX di Figma)

#### 🔧 Apa yang Dibuat:
- **User Flow Diagram** — peta perjalanan pengguna dari login sampai selesai menggunakan fitur.
- **Wireframe Low-Fidelity** — kerangka kasar tata letak halaman tanpa warna/gambar.
- **High-Fidelity Interactive Prototype** — tampilan visual akhir lengkap (warna, font, komponen) di Figma, dapat diklik dan didemonstrasikan.

#### 🎯 Kegunaan / Buat Apa:
- Menyepakati tampilan visual **sebelum kode ditulis** sehingga tidak perlu redesign berulang saat implementasi.
- Memastikan antarmuka **mudah digunakan** oleh guru yang mungkin tidak terbiasa teknologi, maupun siswa SMA yang mengakses dari smartphone.

#### 🛠️ Tools & Teknologi:
- **Figma** (wireframe, prototyping, component design)
- **Lucide Icons** (library ikon konsisten, open-source)
- **Google Fonts** (tipografi Poppins / Inter)

#### 🧠 Prinsip Desain yang Diterapkan:
- **Human-Centered Design (HCD)**: Mengutamakan kebutuhan dan kenyamanan pengguna nyata.
- **Skema Warna 60-30-10**:
  - 60% — Warna netral background (`slate-50`, `white`)
  - 30% — Warna struktural (`slate-800`, `gray-700` untuk teks dan sidebar)
  - 10% — Warna aksen primer (`blue-600 #2563EB` untuk tombol utama, `emerald-500` untuk status hadir/sukses)
- **Hierarki Visual**: Ukuran dan bobot font diatur agar mata langsung tertarik pada informasi paling penting (nilai, nama kelas, tenggat tugas).

---

### 📌 JOBDESK 2 — Design System & Tailwind CSS v4 (Responsif & Mobile-First)

#### 🔧 Apa yang Dibuat:
- **Token Desain Tailwind CSS v4** — konfigurasi palet warna, skala spasi, jari-jari sudut, bayangan (shadow), dan transisi animasi yang seragam di seluruh aplikasi.
- **Tata Letak Mobile-First** — tampilan dioptimalkan untuk layar 375px ke atas, kemudian diperlebar secara bertahap untuk tablet dan desktop.
- **Global CSS** (`globals.css`) — konfigurasi dasar Tailwind dan variabel CSS custom.

#### 🎯 Kegunaan / Buat Apa:
- Memastikan **konsistensi visual** di seluruh 30+ halaman tanpa perlu mendefinisikan ulang warna atau ukuran setiap saat.
- Menjamin aplikasi dapat **diakses nyaman dari HP** (mayoritas siswa SMA menggunakan smartphone, bukan laptop).

#### 🛠️ Tools & Teknologi:
- **Tailwind CSS v4** (utility-first CSS framework)
- **PostCSS** (pemrosesan CSS)
- **CSS Grid & Flexbox** (tata letak adaptif)

#### 🧠 Logika Responsivitas:
- **Breakpoint bertingkat**: `sm (640px)`, `md (768px)`, `lg (1024px)`, `xl (1280px)`.
- **Sidebar Mobile**: Di layar `< md` (phone/tablet kecil), sidebar disembunyikan dan bisa dibuka melalui tombol hamburger menu yang memanggil state `mobileMenuOpen = true` di `DashboardLayout.tsx`.
- **Tabel Data Responsif**: Semua tabel panjang (rekap nilai, daftar siswa, laporan presensi) dibungkus `overflow-x-auto` agar pengguna mobile bisa scroll horizontal tanpa konten terpotong.
- **Grid Kartu Adaptif**: Dashboard menggunakan `grid-cols-1 md:grid-cols-2 xl:grid-cols-4` — di mobile tampil 1 kolom, di tablet 2 kolom, di desktop 4 kolom.

---

### 📌 JOBDESK 3 — Pembangunan DashboardLayout & Komponen Navigasi Utama

#### 🔧 Apa yang Dibuat (berdasarkan kode nyata `DashboardLayout.tsx`):
- **Komponen `DashboardLayout.tsx`** — satu komponen yang digunakan oleh **semua halaman dari 3 peran** (Admin, Guru, Siswa). Menerima prop `role` dan secara otomatis menampilkan sidebar yang benar untuk setiap peran.

**Menu Sidebar yang Dikonfigurasi per Peran:**

| Peran | Menu Navigasi |
| :--- | :--- |
| **Admin** | Dashboard, Management Akun, Monitoring Kelas, Daftar Tugas, Laporan & Presensi, Pengaturan |
| **Guru** | Dashboard, Courses/Kelas, Materi, Tugas, Absensi, Nilai, Laporan, Profil |
| **Siswa** | Dashboard, Kelas Saya, Materi, Tugas, Absensi, Nilai Rapor, Profil |

- **Komponen `Navbar`** — header atas dengan nama pengguna, ikon lonceng notifikasi (badge angka merah otomatis berubah sesuai jumlah notifikasi belum dibaca), dan tombol logout.
- **Komponen `HeadlineAnimation.tsx`** — animasi teks judul dinamis.
- **Komponen `TypewriterText.tsx`** — efek teks mengetik satu karakter per waktu.

#### 🎯 Kegunaan / Buat Apa:
- Satu komponen layout bisa dipakai semua peran → hemat kode, mudah di-*maintain*.
- Navigasi sidebar aktif secara **dinamis berdasarkan `pathname`** saat ini, sehingga menu yang sedang dibuka selalu terhighlight.

#### 🛠️ Tools & Teknologi:
- **Next.js `usePathname()`** — mendeteksi URL halaman aktif untuk highlight menu.
- **Next.js `useRouter()`** — navigasi programatik (logout → redirect ke `/login`).
- **`useAuth()`** — membaca data pengguna dari `localStorage`.
- **`useNotifications()`** — mengambil jumlah notifikasi belum dibaca untuk badge lonceng.
- **Lucide React Icons** — `LayoutDashboard`, `Users`, `BookOpen`, `Bell`, `LogOut`, dsb.

#### 🧠 Logika & Mekanisme:
- **Role-Based Menu Rendering**: Objek `roleConfig` mendefinisikan menu per peran. Komponen membaca `role` prop dan mengambil daftar menu yang sesuai — tidak ada menu lintas-peran yang bocor ke tampilan.
- **Active Link Detection**: Setiap item menu dicek dengan `pathname.startsWith(item.path)`. Jika cocok, kelas `bg-blue-600 text-white` diterapkan, jika tidak `text-slate-600 hover:bg-slate-100`.
- **Mobile Overlay**: Saat hamburger diklik, sidebar tampil dengan class `translate-x-0` (animasi slide dari kiri), latar belakang gelap semi-transparan muncul, dan klik di luar sidebar akan menutupnya.

---

### 📌 JOBDESK 4 — Pengembangan 30+ Halaman Dashboard Khusus Per Peran

#### 🔧 Apa yang Dibuat:
Seluruh halaman visual antarmuka (UI pages) yang bisa dilihat dan diklik pengguna, meliputi:

**Halaman Admin (7 halaman):**
- `admin/dashboard` — kartu statistik (total pengguna, kelas, tingkat presensi) + grafik aktivitas mingguan.
- `admin/users` — tabel manajemen pengguna dengan filter role, pencarian nama/email, tambah/edit/hapus pengguna, reset password, dan tombol Import Excel massal.
- `admin/courses` — monitoring semua kelas aktif di sistem.
- `admin/assignments` — daftar semua penugasan di semua kelas.
- `admin/reports` — laporan presensi global seluruh sekolah.
- `admin/settings` — pengaturan nama sekolah, tahun ajaran, semester, toggle fitur reset password pengguna.
- `admin/profile` — halaman profil dan pengaturan akun admin.

**Halaman Guru (8 halaman):**
- `guru/dashboard` — ringkasan kelas diampu, jumlah tugas belum dinilai, jadwal absensi hari ini.
- `guru/courses` — daftar kelas yang dibuat + tombol buat kelas baru.
- `guru/courses/[id]` — detail kelas: tab Materi, Tugas, Presensi, Anggota Siswa, Nilai UTS/UAS.
- `guru/materi` — kelola modul bahan ajar (tambah link YouTube/Drive atau file upload).
- `guru/tugas` — buat tugas LKPD, lihat daftar pengumpulan, beri nilai + feedback.
- `guru/absensi` — atur jadwal jam presensi kelas, lihat rekap hadir/alpha per tanggal.
- `guru/nilai` — form input nilai UTS dan UAS per siswa per kelas.
- `guru/reports` — rekap nilai rapor kelas yang bisa diekspor ke Excel.

**Halaman Siswa (8 halaman):**
- `siswa/dashboard` — daftar kelas terdaftar, tenggat tugas terdekat, shortcut absensi.
- `siswa/courses` — katalog kelas tersedia + form join dengan kode kelas.
- `siswa/courses/[id]` — ruang kelas: baca materi, download file, klik tombol presensi mandiri.
- `siswa/materi` — daftar semua modul materi dari semua kelas yang diikuti.
- `siswa/tugas` — daftar tugas (belum dikerjakan, sudah dikumpulkan, sudah dinilai) + form upload jawaban.
- `siswa/absensi` — riwayat kehadiran per kelas (hadir/izin/sakit/alpha) dengan persentase.
- `siswa/nilai` — tampilan rapor semester: nilai LKPD rata-rata, UTS, UAS, dan nilai akhir.
- `siswa/profile` — halaman profil dan pengaturan akun siswa.

#### 🎯 Kegunaan / Buat Apa:
- Menyediakan seluruh antarmuka visual yang dapat berinteraksi dengan pengguna, dari form input hingga tabel data dan grafik.

#### 🛠️ Tools & Teknologi:
- **Next.js 15 App Router** — routing berbasis folder, tiap `page.tsx` = satu halaman URL.
- **React 19 Client Components** — komponen interaktif dengan state dan event handlers.
- **Recharts** — grafik batang dan garis untuk visualisasi data statistik.
- **Canvas Confetti** — animasi perayaan saat siswa berhasil submit tugas.
- **TypeScript** — *type safety* pada seluruh data API (mencegah `undefined.property` error).

---

### 📌 JOBDESK 5 — Optimasi UX: Skeleton Loader, Animasi, & Pencegahan Error

#### 🔧 Apa yang Dibuat:
- **Skeleton Loader Components** — placeholder abu-abu beranimasi pulsa yang muncul saat data sedang dimuat dari API.
- **Loading Spinner pada Tombol** — indikator loading berputar menggantikan label tombol saat proses pengiriman data berlangsung.
- **State `isSubmitting`** — variabel boolean yang mengunci tombol submit saat request HTTP sedang berjalan.
- **Canvas Confetti Effect** — animasi konfeti jatuh dari atas layar saat siswa berhasil mengumpulkan tugas.

#### 🎯 Kegunaan / Buat Apa:
- Mencegah **Cumulative Layout Shift (CLS)** — elemen halaman tidak meloncat saat data tiba-tiba muncul.
- Mencegah **Double Submission** — pengguna tidak bisa mengklik tombol dua kali yang menyebabkan data ganda di database.
- Memberikan **umpan balik visual instan** kepada pengguna bahwa sistem merespons aksi mereka.

#### 🛠️ Tools & Teknologi:
- **Tailwind `animate-pulse`** (efek skeleton placeholder)
- **Lucide `Loader2` + `animate-spin`** (spinner ikon berputar)
- **`canvas-confetti`** npm package (animasi konfeti)
- **React `useState<boolean>`** (`isSubmitting` state)

#### 🧠 Logika Implementasi:
```typescript
// Contoh pola pencegahan double-submit
const [isSubmitting, setIsSubmitting] = useState(false);

const handleSubmit = async () => {
  setIsSubmitting(true); // Kunci tombol
  try {
    await api.submitAssignment(data);
    confetti({ particleCount: 100, spread: 70 }); // Konfeti perayaan
  } finally {
    setIsSubmitting(false); // Buka kunci setelah selesai
  }
};

// Tombol terkunci saat loading
<button disabled={isSubmitting}>
  {isSubmitting ? <Loader2 className="animate-spin" /> : 'Kumpulkan Tugas'}
</button>
```

---

---

## ⚡ I PUTU PANDU WIRANATA (NPM 23312088) {#pandu}
### *Full-Stack Engineer · RESTful API Developer · Frontend State & Logic Specialist*

---

### 📌 JOBDESK 1 — Pembangunan 50+ Endpoint RESTful API Backend (Laravel 12)

#### 🔧 Apa yang Dibuat (berdasarkan kode nyata `routes/api.php`):
Seluruh endpoint API yang diakses oleh frontend, terorganisasi dalam 3 grup keamanan:

**Grup Publik (tanpa token):**
| Endpoint | Method | Fungsi |
| :--- | :--- | :--- |
| `/auth/login` | POST | Login & terbitkan Bearer Token |
| `/auth/forgot-password` | POST | Kirim email reset password |
| `/auth/reset-password` | POST | Perbarui password baru |

**Grup Terautentikasi (`auth:sanctum`):**
| Endpoint | Method | Fungsi |
| :--- | :--- | :--- |
| `/auth/me` | GET | Ambil profil pengguna aktif |
| `/auth/logout` | POST | Hapus token & akhiri sesi |
| `/auth/profile` | PUT | Perbarui profil pengguna |
| `/courses` | GET | Daftar kelas milik pengguna |
| `/courses` | POST | Buat kelas baru (guru) |
| `/courses/{id}` | GET/PUT/DELETE | Detail / edit / hapus kelas |
| `/courses/{id}/attendance-schedule` | PUT | Atur jam buka presensi |
| `/courses/{course}/enroll` | POST | Daftarkan siswa ke kelas |
| `/courses/enroll-by-code` | POST | Join kelas via kode unik |
| `/courses/{course}/students` | GET | Daftar anggota kelas |
| `/courses/{course}/students/{id}` | DELETE | Kick siswa dari kelas |
| `/courses/{course}/students/{id}/grades` | PUT | Input nilai UTS & UAS |
| `/courses/{course}/attendances` | GET/POST | Rekap / Catat presensi kelas |
| `/courses/{course}/attendance-stats` | GET | Statistik kehadiran per kelas |
| `/courses/{course}/report` | GET | Laporan nilai rapor kelas |
| `/assignments` | GET/POST | Daftar / buat tugas |
| `/assignments/{id}` | GET/DELETE | Detail / hapus tugas |
| `/assignments/{id}/submit` | POST | Submit jawaban tugas (siswa) |
| `/assignments/{id}/submissions` | GET | Daftar pengumpulan (guru) |
| `/submissions/my` | GET | Tugas saya (siswa) |
| `/submissions/{id}/grade` | PUT | Beri nilai + feedback (guru) |
| `/materials` | GET/POST/DELETE | Kelola modul materi |
| `/attendances/self` | POST | Presensi mandiri (siswa) |
| `/attendances/my` | GET | Riwayat presensi saya |
| `/notifications` | GET | Daftar notifikasi |
| `/notifications/unread-count` | GET | Jumlah belum dibaca |
| `/notifications/{id}/read` | PUT | Tandai satu notifikasi terbaca |
| `/notifications/read-all` | PUT | Tandai semua terbaca |
| `/siswa/stats` | GET | Statistik dashboard siswa |
| `/guru/stats` | GET | Statistik dashboard guru |

**Grup Admin Only (`auth:sanctum` + `role:admin`):**
| Endpoint | Method | Fungsi |
| :--- | :--- | :--- |
| `/admin/stats` | GET | Statistik global sekolah |
| `/admin/users` | GET | Daftar seluruh pengguna (filter + search) |
| `/admin/users` | POST | Tambah satu pengguna baru |
| `/admin/users/{id}` | PUT | Edit data pengguna |
| `/admin/users/{id}/reset-password` | PUT | Reset password pengguna |
| `/admin/users/{id}` | DELETE | Hapus pengguna |
| `/admin/users/bulk-import` | POST | Import massal dari Excel |
| `/admin/settings` | GET/PUT | Baca/perbarui pengaturan sekolah |

#### 🎯 Kegunaan / Buat Apa:
- Menyediakan **seluruh sumber data dan logika bisnis** yang dikonsumsi oleh antarmuka Next.js.
- Semua validasi data, pemrosesan logika, dan enkripsi dilakukan di server ini sebelum data disimpan ke database.

#### 🛠️ Tools & Teknologi:
- **Laravel 12 Framework** (PHP 8.2+)
- **Laravel Sanctum** (Bearer Token API authentication)
- **Eloquent ORM** (query builder berbasis objek)
- **Laravel Form Request** (class validasi input terpisah)
- **Service Layer Pattern** (`AttendanceService`, `NotificationService`)
- **Bcrypt Hashing** (enkripsi password)

#### 🧠 Logika & Mekanisme:
- **Service Layer Pattern**: Logika bisnis yang kompleks (seperti aturan presensi) dipindahkan ke class `AttendanceService` dan `NotificationService` agar controller tetap bersih dan mudah di-*maintain*.
- **Policy & `authorize()`**: Digunakan untuk memastikan hanya pemilik kelas (guru yang membuat kelas tersebut) yang bisa mengakses dan memodifikasi data kelasnya sendiri.
- **Standar Respon JSON**: Semua endpoint mengembalikan format yang konsisten:
  ```json
  { "message": "Keterangan proses", "data": { ... } }
  ```

---

### 📌 JOBDESK 2 — Keamanan Autentikasi & Otorisasi (Sanctum + RBAC)

#### 🔧 Apa yang Dibuat:
- Sistem autentikasi **Bearer Token** menggunakan **Laravel Sanctum**.
- Custom **Middleware `role:admin`** yang memproteksi grup rute admin.
- **Policy authorization** menggunakan `$this->authorize('view', $course)` di controller.

#### 🎯 Kegunaan / Buat Apa:
- Menjamin setiap request ke API sudah terautentikasi dan memiliki izin yang tepat.
- Mencegah siswa mengakses data siswa lain, atau guru lain, atau endpoint admin.

#### 🛠️ Tools & Teknologi:
- **Laravel Sanctum** — `personal_access_tokens` tabel, `auth:sanctum` middleware.
- **Custom Middleware** — `role:admin` untuk proteksi grup admin.
- **Bcrypt** — hash password di `Hash::make()` saat pembuatan/reset akun.

#### 🧠 Logika & Mekanisme:
- **Token Flow**:
  1. User login → server hash password (Bcrypt) dan cocokkan dengan database.
  2. Jika valid → generate token plain-text → simpan **hash token** di tabel `personal_access_tokens`.
  3. Token plain-text dikirim ke client, disimpan di `localStorage`.
  4. Setiap request berikutnya, client menyertakan `Authorization: Bearer <token>`.
  5. Sanctum middleware mencari hash token di database → validasi → inject `auth()->user()`.
- **Role Check**: Setelah token divalidasi, middleware `role:admin` mengecek `auth()->user()->role === 'admin'`. Jika bukan admin, langsung kembalikan `HTTP 403 Forbidden`.

---

### 📌 JOBDESK 3 — Modul Presensi Mandiri Berbasis Jendela Waktu

#### 🔧 Apa yang Dibuat:
- Endpoint `POST /attendances/self` di `AttendanceController.php`.
- Service method `selfAttend()` di `AttendanceService` yang menangani seluruh validasi waktu.
- Endpoint `PUT /courses/{id}/attendance-schedule` untuk guru mengatur jam buka presensi.

#### 🎯 Kegunaan / Buat Apa:
- Menggantikan presensi manual (tanda tangan kertas) dengan sistem digital yang **akurat secara waktu** — siswa tidak bisa absen di luar jam pelajaran.
- Guru dapat membuka dan menutup jendela presensi untuk setiap kelas secara fleksibel.

#### 🛠️ Tools & Teknologi:
- **Nesbot Carbon** (manajemen waktu dengan timezone `Asia/Jakarta`)
- **`AttendanceService`** class (service layer)
- **`Attendance::updateOrCreate()`** (upsert Eloquent)

#### 🧠 Logika & Mekanisme Detil:
- Guru menyimpan `attendance_start` dan `attendance_end` di tabel `courses` (format `HH:MM`).
- Saat siswa menekan tombol hadir, `selfAttend()` dipanggil:
  ```php
  $now = Carbon::now('Asia/Jakarta'); // Waktu server (WIB)
  $start = Carbon::parse($course->attendance_start);
  $end = Carbon::parse($course->attendance_end);

  // Jika di luar jam → tolak
  if (!$now->between($start, $end)) {
      throw new \Exception('Di luar jam presensi: ' . $start->format('H:i') . ' - ' . $end->format('H:i') . ' WIB');
  }
  ```
- Setelah lolos validasi waktu, data disimpan dengan `updateOrCreate` berbasis `(user_id, course_id, date)` → anti-duplikasi.
- Status `alpha` otomatis jika siswa absen setelah waktu selesai (konfigurasi grace period).
- Normalisasi string status: `strtolower(trim($status))` dan alias `'alpa' → 'alpha'` untuk mencegah inkonsistensi data.

---

### 📌 JOBDESK 4 — Modul Penugasan LKPD, Pengumpulan & Penilaian

#### 🔧 Apa yang Dibuat (berdasarkan kode nyata `SubmissionController.php`):
- `POST /assignments/{id}/submit` — siswa upload file jawaban atau teks catatan.
- `PUT /submissions/{id}/grade` — guru input nilai (0–100) + feedback teks.
- `GET /submissions/my` — siswa melihat semua tugas yang sudah dikumpulkan.
- `GET /assignments/{id}/submissions` — guru melihat seluruh pengumpulan di satu tugas.

#### 🎯 Kegunaan / Buat Apa:
- Menggantikan pengumpulan tugas fisik (kertas/WhatsApp) dengan sistem terstruktur yang menyimpan file, mencatat waktu pengumpulan, dan mengirim notifikasi otomatis.

#### 🛠️ Tools & Teknologi:
- **Laravel File Storage** (`$file->store('tugas', 'public')`) — simpan file di disk.
- **NotificationService** — kirim notifikasi ke guru saat tugas masuk.
- **`SubmitAssignmentRequest`** — Form Request class untuk validasi file tugas.

#### 🧠 Logika & Mekanisme Detil:
- **Validasi Keikutsertaan**: Sebelum menerima file, sistem mengecek apakah siswa terdaftar aktif di kelas terkait:
  ```php
  $isEnrolled = $assignment->course->students()
      ->where('users.id', $student->id)
      ->where('course_student.status', 'active')
      ->exists();
  ```
- **Deteksi Terlambat**: Jika `now()` melewati `assignment->due_date`, status submission otomatis menjadi `'late'`:
  ```php
  $isLate = $assignment->due_date && now()->greaterThan($assignment->due_date);
  $status = $isLate ? 'late' : 'submitted';
  ```
- **Upsert Submission**: Menggunakan `updateOrCreate` berdasarkan `(assignment_id, student_id)` sehingga siswa bisa **mengumpulkan ulang** (revisi) sebelum deadline.
- **Notifikasi Otomatis**: Setelah file tersimpan, `NotificationService::notifyTeacherOfSubmission()` langsung membuat entry di tabel `notifications` untuk guru pengampu kelas tersebut.
- **Notifikasi Nilai**: Setelah guru menyimpan nilai, `NotificationService::notifyStudentOfGrade()` mengirim notifikasi ke siswa bahwa tugasnya sudah dinilai.

---

### 📌 JOBDESK 5 — Modul Bulk Import Akun Pengguna (Excel/CSV)

#### 🔧 Apa yang Dibuat (berdasarkan kode nyata `AdminController::bulkImport()`):
- Endpoint `POST /admin/users/bulk-import` yang menerima array data pengguna dari frontend.
- Frontend membaca file Excel lokal menggunakan library SheetJS, mengonversinya ke JSON, lalu mengirimnya ke endpoint ini.

#### 🎯 Kegunaan / Buat Apa:
- Memungkinkan admin mendaftarkan **ratusan siswa dan guru sekaligus** dalam hitungan detik, tanpa menginput satu per satu.

#### 🛠️ Tools & Teknologi:
- **SheetJS (`xlsx`)** di frontend — parse file `.xlsx` / `.csv` menjadi array JSON di browser.
- **Laravel `DB::transaction()`** — pembungkus transaksi database atomik.
- **`User::updateOrCreate()`** — jika email sudah ada, update data; jika belum ada, buat baru.
- **`Hash::make('password123')`** — password default yang di-hash untuk semua akun baru.

#### 🧠 Logika & Mekanisme Detil:
```php
DB::transaction(function () use ($request, $defaultHash, &$imported) {
    foreach ($request->users as $userData) {
        // Cek apakah password custom atau password default
        $password = !empty($userData['password']) 
            && $userData['password'] !== 'password123'
            ? Hash::make($userData['password'])
            : $defaultHash;

        // Upsert berdasarkan email (tidak duplikasi)
        User::updateOrCreate(
            ['email' => $userData['email']],
            ['name' => ..., 'role' => ..., 'nisn_or_nip' => ..., 'class_name' => ...]
        );
        $imported++;
    }
});
```
- Jika salah satu iterasi gagal (misal email format salah), **seluruh transaksi dibatalkan** (`rollback`) — tidak ada data setengah-setengah yang masuk ke database.

---

### 📌 JOBDESK 6 — Central API Client & Sinkronisasi Real-Time Lintas Tab

#### 🔧 Apa yang Dibuat (berdasarkan kode nyata `useRealtimeData.ts`):

**A. `Frontend/lib/api.ts` — Modul Sentral Seluruh Request HTTP**
- Satu modul yang menjadi **pintu tunggal** semua komunikasi antara Next.js dan Laravel API.
- Otomatis menyematkan header `Authorization: Bearer <token>` dari `localStorage`.
- Setelah setiap mutasi data (POST/PUT/DELETE berhasil), otomatis memanggil `broadcastDataMutation()`.

**B. `Frontend/hooks/useRealtimeData.ts` — Hook Sinkronisasi Multi-Layer**
- Custom React hook yang mengelola seluruh siklus pengambilan dan pembaruan data secara cerdas.

**C. `Frontend/hooks/useNotifications.ts` — Hook Notifikasi Real-Time**
- Hook khusus untuk mengambil dan memperbarui notifikasi secara otomatis.
- Polling setiap 8 detik (berhenti otomatis saat tab disembunyikan).

#### 🎯 Kegunaan / Buat Apa:
- Data di halaman **selalu sinkron** tanpa pengguna perlu reload halaman secara manual.
- Ketika guru menginput nilai di tab 1, nilai tersebut **langsung muncul** di tab siswa (tab 2) dalam hitungan milidetik.

#### 🛠️ Tools & Teknologi:
- **`BroadcastChannel API`** (HTML5 Web API bawaan browser) — komunikasi antar-tab
- **`CustomEvent`** (`window.dispatchEvent`) — komunikasi dalam tab yang sama
- **React `useCallback` + `useRef`** — optimasi agar fetcher tidak berulang-ulang dibuat ulang
- **`document.hidden`** — deteksi visibilitas tab

#### 🧠 Logika & Mekanisme 4-Layer (berdasarkan kode nyata):

**Layer 1: Initial Load**
```typescript
// Fetch pertama kali saat komponen mount
useEffect(() => { void load(true); }, [load, depsKey]);
```

**Layer 2: Smart Polling (berhenti saat tab tersembunyi)**
```typescript
// Polling setiap 10 detik, tapi hanya jika tab sedang aktif
setInterval(() => {
  if (!document.hidden) void load(false);
}, refreshInterval); // default: 10.000 ms
```

**Layer 3: Window Focus & Online Revalidation**
```typescript
// Jika pengguna kembali ke tab (focus) atau internet kembali (online),
// fetch ulang data jika sudah > 2.5 detik tidak di-fetch
const handleRevalidate = () => {
  if (Date.now() - lastFetchedTime > 2500) void load(false);
};
window.addEventListener('focus', handleRevalidate);
window.addEventListener('online', handleRevalidate);
document.addEventListener('visibilitychange', handleRevalidate);
```

**Layer 4: Event-Driven Cross-Tab Mutation (BroadcastChannel)**
```typescript
// Saat mutasi terjadi di tab manapun, semua tab lain langsung refresh
const channel = new BroadcastChannel('lms-realtime-channel');
channel.onmessage = (msg) => {
  const receivedEvent = msg?.data?.event;
  if (targetEvents.includes(receivedEvent)) {
    void load(false); // Ambil data terbaru tanpa loading indicator
  }
};
```

**Fungsi `broadcastDataMutation()` (yang dipanggil setelah mutasi):**
```typescript
export function broadcastDataMutation(events: string | string[]) {
  // 1. Dispatch CustomEvent di tab ini sendiri
  window.dispatchEvent(new CustomEvent(`lms:${eventName}`, { detail: { timestamp: Date.now() } }));
  
  // 2. Broadcast ke semua tab lain yang terbuka
  const channel = new BroadcastChannel('lms-realtime-channel');
  channel.postMessage({ event: `lms:${eventName}`, timestamp: Date.now() });
  channel.close();
}
```

---

## 💻 ARSITEKTUR SISTEM & TECH STACK KESELURUHAN {#arsitektur}

### Tech Stack Lengkap per Layer:

| Layer | Teknologi | Versi | Fungsi |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js | 15 (App Router) | Routing, SSR, Bundling |
| **UI Library** | React | 19 | Komponen & State Management |
| **Bahasa Frontend** | TypeScript | 5.7 | Type-safe JavaScript |
| **CSS Framework** | Tailwind CSS | v4 | Utility-first styling |
| **Ikon** | Lucide React | Latest | Ikon SVG konsisten |
| **Grafik** | Recharts | Latest | Visualisasi data |
| **Animasi** | Canvas Confetti | Latest | Efek perayaan |
| **Backend Framework** | Laravel | 12 | RESTful API, Business Logic |
| **Bahasa Backend** | PHP | 8.2+ | Server-side scripting |
| **Autentikasi API** | Laravel Sanctum | - | Bearer Token |
| **ORM** | Eloquent | - | Database abstraction |
| **Manajemen Waktu** | Nesbot Carbon | - | Timezone, datetime |
| **Database** | MySQL | 8.0 | Relational database |
| **Frontend Hosting** | Vercel | - | Edge CDN, Serverless |
| **Backend Hosting** | Railway | - | Container PHP + MySQL |
| **Version Control** | Git + GitHub | - | Source code management |

---

## 📡 PETA LENGKAP RUTE API BACKEND {#api-routes}

```
BASE URL PRODUKSI: https://deploylms-production.up.railway.app/api/v1

🔓 PUBLIK (Tanpa Token)
├── POST /auth/login                            → Login & terbitkan token
├── POST /auth/forgot-password                  → Kirim email reset
└── POST /auth/reset-password                   → Reset password baru

🔐 TERAUTENTIKASI (Bearer Token Required)
├── GET  /auth/me                               → Profil pengguna aktif
├── POST /auth/logout                           → Hapus token sesi
├── PUT  /auth/profile                          → Update profil
│
├── GET  /courses                               → Daftar kelas saya
├── POST /courses                               → Buat kelas baru
├── GET  /courses/{id}                          → Detail kelas
├── PUT  /courses/{id}                          → Edit kelas
├── DELETE /courses/{id}                        → Hapus kelas
├── PUT  /courses/{id}/attendance-schedule      → Atur jam presensi
├── GET  /available-courses                     → Kelas tersedia untuk join
├── POST /courses/{course}/enroll               → Daftarkan siswa
├── POST /courses/enroll-by-code                → Join via kode kelas
├── POST /courses/{course}/leave                → Keluar dari kelas
├── GET  /courses/{course}/students             → Daftar anggota
├── DELETE /courses/{course}/students/{id}      → Keluarkan siswa
├── PUT  /courses/{course}/students/{id}/grades → Input UTS & UAS
├── GET  /courses/{course}/attendances          → Rekap presensi kelas
├── POST /courses/{course}/attendances          → Catat presensi kelas
├── GET  /courses/{course}/attendance-stats     → Statistik kehadiran
├── GET  /courses/{course}/report               → Laporan rapor kelas
│
├── GET  /assignments                           → Daftar tugas
├── GET  /assignments/{id}                      → Detail tugas
├── POST /assignments                           → Buat tugas baru
├── DELETE /assignments/{id}                    → Hapus tugas
├── POST /assignments/{id}/submit               → Upload jawaban (siswa)
├── GET  /assignments/{id}/submissions          → Daftar pengumpulan (guru)
├── GET  /submissions/my                        → Tugas saya (siswa)
├── PUT  /submissions/{id}/grade                → Nilai + feedback (guru)
│
├── GET  /materials                             → Daftar materi
├── POST /materials                             → Tambah materi
├── DELETE /materials/{id}                      → Hapus materi
│
├── POST /attendances/self                      → Presensi mandiri siswa
├── GET  /attendances/my                        → Riwayat presensi saya
│
├── GET  /notifications                         → Daftar notifikasi
├── GET  /notifications/unread-count            → Jumlah belum dibaca
├── PUT  /notifications/{id}/read               → Tandai satu terbaca
├── PUT  /notifications/read-all                → Tandai semua terbaca
│
├── GET  /siswa/stats                           → Statistik dashboard siswa
└── GET  /guru/stats                            → Statistik dashboard guru

🛡️ ADMIN ONLY (Token + Role Admin)
├── GET  /admin/stats                           → Statistik global sekolah
├── GET  /admin/users                           → Daftar semua pengguna
├── POST /admin/users                           → Tambah pengguna
├── PUT  /admin/users/{id}                      → Edit pengguna
├── PUT  /admin/users/{id}/reset-password       → Reset password
├── DELETE /admin/users/{id}                    → Hapus pengguna
├── POST /admin/users/bulk-import               → Import massal Excel
├── GET  /admin/settings                        → Baca pengaturan sekolah
└── PUT  /admin/settings                        → Update pengaturan sekolah
```

---

## 🔄 ALUR KERJA & FLOWCHART SISTEM {#flowchart}

### Alur Login & Redirect Berdasarkan Peran
```
[Pengguna] → Input Email + Password
     ↓
[Frontend] → POST /auth/login
     ↓
[Backend] → Cek email di database → Hash & cocokkan password
     ↓
[Berhasil] → Generate Bearer Token → Kirim ke client
     ↓
[Frontend] → Simpan token + data user di localStorage
     ↓
[Redirect berdasarkan role]
├── role = "admin"  → /admin/dashboard
├── role = "guru"   → /guru/dashboard
└── role = "siswa"  → /siswa/dashboard
```

### Alur Presensi Mandiri Siswa
```
[Siswa] → Buka halaman kelas → Klik "Hadir Sekarang"
     ↓
[Frontend] → POST /attendances/self { course_id }
     ↓
[Backend - AttendanceService::selfAttend()]
     ├── Ambil course & jadwal presensi
     ├── Bandingkan Carbon::now('Asia/Jakarta') dengan start_time & end_time
     ├── [Di luar jam] → Throw Exception → HTTP 422 → Tampilkan pesan error
     └── [Dalam jam]   → updateOrCreate attendance (hadir) → HTTP 200
          ↓
[Frontend] → Tampilkan status "HADIR ✓" warna hijau
          → broadcastDataMutation('lms:attendance') → semua tab ikut refresh
```

### Alur Sinkronisasi Real-Time Antar Tab
```
[Tab 1 - Guru input nilai] → API PUT /submissions/{id}/grade
         ↓
[lib/api.ts] → broadcastDataMutation('lms:submissions')
         │
         ├── window.dispatchEvent(CustomEvent 'lms:submissions') ← Tab 1 sendiri
         │
         └── BroadcastChannel.postMessage({ event: 'lms:submissions' })
                    ↓
         [Tab 2 - Halaman siswa]
         channel.onmessage → event matched → load(false)
         → fetch terbaru di background
         → setData(newData) → React re-render otomatis
         → Nilai baru muncul di layar siswa TANPA RELOAD!
```

---

## 🎯 FAQ TANYA JAWAB PRESENTASI {#faq}

| Pertanyaan | Jawaban Teknis |
| :--- | :--- |
| **Kenapa pakai Next.js bukan Laravel Blade?** | Next.js berjalan di Edge CDN Vercel → super cepat. Pemisahan frontend-backend memungkinkan API yang sama dipakai app mobile ke depannya. Blade terikat server Laravel, tidak scalable secara terpisah. |
| **Bagaimana keamanan API dijaga?** | Berlapis: (1) Login menghasilkan Bearer Token terenkripsi. (2) Setiap request divalidasi `auth:sanctum`. (3) Middleware `role:admin` + Laravel Policy `authorize()` memblokir akses lintas peran. |
| **Real-time tanpa WebSocket, apa itu BroadcastChannel?** | `BroadcastChannel` adalah Web API HTML5 bawaan browser untuk komunikasi antar-tab tanpa server. Tidak butuh koneksi socket terbuka terus → hemat resource server & lebih stabil. |
| **Bagaimana presensi tidak bisa dimanipulasi?** | Validasi waktu dilakukan di **server** (bukan client) menggunakan `Carbon::now('Asia/Jakarta')`. Pengguna tidak bisa memanipulasi jam browser untuk menipu sistem. |
| **Bagaimana jika import Excel ada data rusak?** | Seluruh proses import dibungkus `DB::transaction()`. Jika ada satu baris data yang gagal, seluruh transaksi di-rollback — database tetap bersih, tidak ada data setengah-setengah. |
| **Apa yang dimaksud double submission prevention?** | State `isSubmitting = true` mengunci tombol saat request HTTP berlangsung. Juga, server menggunakan `updateOrCreate` bukan `create` sehingga submit ulang hanya akan menimpa data yang ada, tidak membuat baris ganda. |

---

<div align="center">

*Dokumen ini dibuat berdasarkan kode sumber aktual proyek EduSchool LMS.*  
*Cocok digunakan untuk belajar mandiri, persiapan presentasi, dan sidang PKL.*

**EduSchool LMS — Kelompok PKL Informatika UTI × CV Newus Teknologi 🎓**

</div>
