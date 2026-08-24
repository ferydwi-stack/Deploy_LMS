# LAPORAN PRAKTIK KERJA LAPANGAN (PKL)
## RANCANG BANGUN LEARNING MANAGEMENT SYSTEM (LMS) BERBASIS WEB MENGGUNAKAN NEXT.JS DAN LARAVEL PADA CV NEWUS TEKNOLOGI

---

### IDENTITAS MAHASISWA & INSTANSI PKL
* **Program Studi**: S1 Informatika
* **Fakultas**: Fakultas Teknik dan Ilmu Komputer (FTIK)
* **Perguruan Tinggi**: Universitas Teknokrat Indonesia
* **Tahun Akademik**: 2026 / 2027

#### Disusun Oleh:
1. **Fery Dwi Ramadhi** (NPM: 23312086) — *Full-Stack Developer & Project Lead*
2. **Fathur Ramantha** (NPM: 23312087) — *Frontend Developer & UI/UX Specialist*
3. **I Putu Pandu** (NPM: 23312088) — *System Analyst, Database & Quality Assurance*

#### Lokasi & Periode PKL:
* **Instansi / Perusahaan**: CV Newus Teknologi
* **Alamat Perusahaan**: Jl. Salim Batubara No.118, Kupang Teba, Kec. Teluk Betung Utara, Kota Bandar Lampung, Lampung 35212
* **Waktu Pelaksanaan**: 6 Agustus 2026 – 6 September 2026

---

# DAFTAR ISI

* **LEMBAR JUDUL** ..................................................................................................... i
* **LEMBAR PERSETUJUAN** ...................................................................................... ii
* **LEMBAR PENGESAHAN** ....................................................................................... iii
* **KATA PENGANTAR** ............................................................................................... iv
* **DAFTAR ISI** ........................................................................................................... v
* **DAFTAR TABEL** .................................................................................................... vi
* **DAFTAR GAMBAR** ............................................................................................... vii
* **DAFTAR LAMPIRAN** ............................................................................................. viii
* **RINGKASAN PELAKSANAAN PKL** .................................................................... ix

---

## BAB I PENDAHULUAN
* **1.1 Latar Belakang Praktik Kerja Lapangan**
* **1.2 Tujuan Praktik Kerja Lapangan**
* **1.3 Kegunaan Praktik Kerja Lapangan**
  * 1.3.1 Kegunaan bagi Mahasiswa
  * 1.3.2 Kegunaan bagi Universitas Teknokrat Indonesia
  * 1.3.3 Kegunaan bagi Instansi / Perusahaan (CV Newus Teknologi)
* **1.4 Tempat Praktik Kerja Lapangan**
* **1.5 Jadwal Pelaksanaan Praktik Kerja Lapangan**

---

## BAB II TINJAUAN UMUM TEMPAT PKL
* **2.1 Sejarah dan Profil CV Newus Teknologi**
* **2.2 Visi, Misi, dan Tujuan Perusahaan**
* **2.3 Struktur Organisasi dan Tata Kelola Perusahaan**
* **2.4 Kegiatan Umum dan Layanan Bisnis Perusahaan**

---

## BAB III PELAKSANAAN PRAKTIK KERJA LAPANGAN

### 3.1 LAPORAN PELAKSANAAN PKL: FERY DWI RAMADHI (NPM: 23312086)
* **3.1.1 Bidang Kerja**: *Full-Stack Web Development & Backend Architecture*
* **3.1.2 Pelaksanaan Kerja**:
  * A. Analisis Arsitektur Sistem & Perancangan RESTful API Laravel 11
  * B. Perancangan Skema Basis Data Relasional MySQL (11 Tabel Inti)
  * C. Implementasi Autentikasi Multi-Role Menggunakan Laravel Sanctum
  * D. Integrasi Sinkronisasi Real-Time Menggunakan BroadcastChannel & Custom Events
  * E. Penerapan Normalisasi Validasi Presensi & Penugasan Siswa
  * F. Pengujian API Endpoint Menggunakan Postman & Deployment Cloud Railway
* **3.1.3 Kendala yang Dihadapi**:
  * A. Ketidaksesuaian Casing pada Validasi Status Presensi API
  * B. Sinkronisasi Data Lintas-Tab yang Membutuhkan Reload Halaman Manual
  * C. Konfigurasi Cross-Origin Resource Sharing (CORS) antara Vercel dan Railway
* **3.1.4 Cara Mengatasi Kendala**:
  * A. Normalisasi Input String di AttendanceController Laravel
  * B. Pembangunan useRealtimeData Hook dengan Window Focus & Broadcast Synchronization
  * C. Konfigurasi Sanctum Stateful Domains dan Middleware CORS pada Kernel Laravel

---

### 3.2 LAPORAN PELAKSANAAN PKL: FATHUR RAMANTHA (NPM: 23312087)
* **3.2.1 Bidang Kerja**: *Frontend Web Development & UI/UX Design Specialist*
* **3.2.2 Pelaksanaan Kerja**:
  * A. Perancangan Mockup & Wireframe Interaktif Menggunakan Figma
  * B. Pembangunan Antarmuka Single Page Application (SPA) Berbasis Next.js (App Router)
  * C. Penerapan Sistem Desain Modern & Responsif Menggunakan Tailwind CSS
  * D. Pembuatan Dashboard Khusus Administrator, Guru Pengajar, dan Peserta Didik
  * E. Implementasi Form Interaktif: Upload Modul Bahan Ajar, Submit Tugas, dan Presensi Mandiri
  * F. Integrasi Lonceng Notifikasi Real-time & Visualisasi Diagram Rapor Siswa
* **3.2.3 Kendala yang Dihadapi**:
  * A. Cumulative Layout Shift (CLS) saat Data Statistik Dimuat Dinamis
  * B. Penanganan State Form Kompleks saat Pengunggahan Berkas Tugas Multi-Format
  * C. Penyesuaian Responsivitas Tabel Rekapitulasi Rapor pada Layar Smartphone
* **3.2.4 Cara Mengatasi Kendala**:
  * A. Penerapan Skeleton Loader dan Optimasi SSR/Client-Side Rendering Next.js
  * B. Pembangunan Komponen Upload Reusable dengan Validasi Tipe & Ukuran File Client-Side
  * C. Pemanfaatan Container Queries dan Horizontal Scroll Wrapper pada Tabel

---

### 3.3 LAPORAN PELAKSANAAN PKL: I PUTU PANDU (NPM: 23312088)
* **3.3.1 Bidang Kerja**: *System Analyst, Database Administrator & Quality Assurance*
* **3.3.2 Pelaksanaan Kerja**:
  * A. Penyusunan Product Requirements Document (PRD) dan Sprint Backlog
  * B. Pemodelan Diagram Sistem Terpadu (Unified Use Case 50 Fitur, ERD, dan Flowchart)
  * C. Manajemen Migrasi Basis Data, Relasi Foreign Key, dan Seeder 50+ Pengguna
  * D. Perancangan Fitur Bulk Import Akun Massal dari File Excel (.xlsx)
  * E. Penyusunan Skenario Uji Coba Black-Box Testing & E2E Automated Bot Runner (53 Skenario)
  * F. Evaluasi Kinerja dan Integritas Data Sistem Pasca-Deployment
* **3.3.3 Kendala yang Dihadapi**:
  * A. Format Data Unggahan Excel yang Beragam dari Pengguna Administrator
  * B. Pengujian Skenario Akses Presensi di Luar Jam Buka-Tutup yang Ditetapkan Guru
  * C. Kebutuhan Pengujian Cepat untuk 4 Akun Peran Berbeda secara Bersamaan
* **3.3.4 Cara Mengatasi Kendala**:
  * A. Validasi Heading Header Excel dan Library Maatwebsite Excel Parser
  * B. Penambahan Logika Pengecekan Waktu Server (Carbon Timezone Asia/Jakarta)
  * C. Pembuatan Automated Bot Script E2E yang Menjalankan 53 Test Case dengan Hasil 100% Passed

---

## BAB IV PENUTUP
* **4.1 Simpulan**
* **4.2 Saran**
  * 4.2.1 Saran untuk Instansi / Perusahaan (CV Newus Teknologi)
  * 4.2.2 Saran untuk Universitas Teknokrat Indonesia
  * 4.2.3 Saran untuk Mahasiswa Praktik Kerja Lapangan Berikutnya

---

## DAFTAR PUSTAKA
## LAMPIRAN-LAMPIRAN
* **Lampiran 1**: Surat Permohonan & Keterangan Penerimaan PKL
* **Lampiran 2**: Lembar Penilaian Praktik Kerja Lapangan dari Perusahaan
* **Lampiran 3**: Catatan Logbook Aktivitas Harian PKL (Agustus – September)
* **Lampiran 4**: Dokumentasi Diagram Sistem (Use Case, ERD, Flowchart Terpadu)
* **Lampiran 5**: Dokumentasi Tangkapan Layar Antarmuka Aplikasi (Screenshots UI)
* **Lampiran 6**: Foto Kegiatan PKL di CV Newus Teknologi
