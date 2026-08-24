# 🔐 Kredensial & Akun Pengguna EduSchool LMS

Dokumen ini berisi daftar lengkap akun, username/email, kata sandi (*password*), serta hak akses untuk pengujian dan operasional platform **EduSchool LMS**.

---

## 🌐 Tautan Akses Aplikasi

- **Frontend (Web App)**: [https://sistem-e-learning-g9xn.vercel.app](https://sistem-e-learning-g9xn.vercel.app)
- **Backend (RESTful API)**: [https://deploylms-production.up.railway.app/api/v1](https://deploylms-production.up.railway.app/api/v1)

---

## 🔑 Akun Demo Utama (Siap Pakai)

Semua akun utama berikut telah terdaftar di lingkungan *production* dan dapat langsung digunakan untuk login:

| No | Peran (*Role*) | Nama Pengguna | Email / Username | Password | NIP / NISN | Keterangan & Hak Akses |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **Administrator** | Administrator LMS | `admin@lms.com` | `password` | `100001` | **Akses Penuh**: Manajemen akun pengguna (CRUD & Bulk Import), konfigurasi sistem & sekolah, statistik global, dan rekapitulasi nilai/presensi. |
| **2** | **Guru Pengajar** | Budi Santoso, S.Pd | `guru@lms.com` | `password` | `19880312` | **Akses Guru**: Manajemen kelas & siswa, upload modul materi, penugasan LKPD, input nilai (Tugas, UTS, UAS), atur jadwal absensi kelas. |
| **3** | **Peserta Didik** | Ahmad Rizky | `siswa@lms.com` | `password` | `20260001` | **Akses Siswa**: Gabung kelas, unduh/baca materi modul, pengumpulan tugas (*submit* jawaban), presensi mandiri, cek nilai rapor. |
| **4** | **Peserta Didik (2)** | Siti Nurhaliza | `siswa2@lms.com` | `password` | `20260002` | **Akses Siswa Sekunder**: Digunakan untuk pengujian multi-user dan interaksi absensi/penugasan kelas bersama. |

---

## 📋 Daftar Akun Guru (Mata Pelajaran)

| No | Nama Guru | Email / Username | Password Default | NIP / ID | Mata Pelajaran Diampu |
| :---: | :--- | :--- | :--- | :--- | :--- |
| 1 | Budi Santoso, S.Pd. | `budi.santoso@sekolah.sch.id` | `password` | `1988031201` | Matematika |
| 2 | Siti Nurhaliza, M.Pd. | `siti.nurhaliza@sekolah.sch.id` | `password` | `1989041502` | Bahasa Indonesia |
| 3 | Ahmad Hidayat, S.Si. | `ahmad.hidayat@sekolah.sch.id` | `password` | `1987052003` | Fisika |
| 4 | Dewi Lestari, S.S. | `dewi.lestari@sekolah.sch.id` | `password` | `1990081004` | Bahasa Inggris |
| 5 | Eko Prasetyo, S.Kom. | `eko.prasetyo@sekolah.sch.id` | `password` | `1991120505` | Informatika |
| 6 | Rina Wijaya, S.Pd. | `rina.wijaya@sekolah.sch.id` | `password` | `1992031806` | Biologi |
| 7 | Hendra Gunawan, M.Si. | `hendra.gunawan@sekolah.sch.id` | `password` | `1986072207` | Kimia |
| 8 | Maya Putri, S.Pd. | `maya.putri@sekolah.sch.id` | `password` | `1993091408` | Sejarah |
| 9 | Agus Setiawan, S.Pd. | `agus.setiawan@sekolah.sch.id` | `password` | `1990012509` | PJOK |
| 10 | Sri Wahyuni, S.E. | `sri.wahyuni@sekolah.sch.id` | `password` | `1988113010` | Ekonomi |

---

## 🎒 Daftar Contoh Akun Siswa (Per Kelas)

| No | Nama Siswa | Email / Username | Password Default | NISN | Kelas |
| :---: | :--- | :--- | :--- | :--- | :--- |
| 1 | Aditya Pratama | `aditya.pratama1@siswa.sekolah.sch.id` | `password` | `20260011` | X IPA 1 |
| 2 | Anisa Lestari | `anisa.lestari2@siswa.sekolah.sch.id` | `password` | `20260012` | X IPA 2 |
| 3 | Bagas Nugroho | `bagas.nugroho3@siswa.sekolah.sch.id` | `password` | `20260013` | X IPS 1 |
| 4 | Cantika Putri | `cantika.putri4@siswa.sekolah.sch.id` | `password` | `20260014` | X IPS 2 |
| 5 | Dimas Saputra | `dimas.saputra5@siswa.sekolah.sch.id` | `password` | `20260015` | XI IPA 1 |
| 6 | Dinda Kirana | `dinda.kirana6@siswa.sekolah.sch.id` | `password` | `20260016` | XI IPA 2 |
| 7 | Fajar Ramadhan | `fajar.ramadhan7@siswa.sekolah.sch.id` | `password` | `20260017` | XI IPS 1 |
| 8 | Gita Gutawa | `gita.gutawa8@siswa.sekolah.sch.id` | `password` | `20260018` | XI IPS 2 |
| 9 | Hadi Purnomo | `hadi.purnomo9@siswa.sekolah.sch.id` | `password` | `20260019` | XII IPA 1 |
| 10 | Indah Permata | `indah.permata10@siswa.sekolah.sch.id` | `password` | `20260020` | XII IPA 2 |

> 💡 **Catatan untuk Login Cepat**:
> Pada halaman login web, tersedia tombol **Quick Demo Accounts** (Admin, Guru, Siswa) yang secara otomatis mengisi kolom email & password dengan satu klik.
