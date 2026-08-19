# Rencana Perbaikan Lengkap: Pembuatan Database Laragon, Realtime Data 3 Role & Fix Error

## 📌 Akar Permasalahan Utama (Berdasarkan Log & Screenshot Browser)
1. **Error `SQLSTATE[HY000] [1049] Unknown database 'db_lms'`**:
   Saat berpindah dari XAMPP ke Laragon, service MySQL Laragon (`127.0.0.1:3306`) belum memiliki basis data `db_lms`. Akibatnya, Laravel backend tidak dapat membaca/menulis data dan mengembalikan error SQL 1049.
2. **Data 0 / Kosong pada 3 Role (Admin, Guru, Siswa)**:
   Karena database belum dibuat dan di-*seed* di Laragon, seluruh panggilan API melempar error database, sehingga tampilan frontend menunjukkan 0 user, 0 kelas, dan 0 data.
3. **Penyebab Data Realtime Tidak Berubah**:
   `Frontend/hooks/useRealtimeData.ts` memblokir *fetch* data saat *dependencies* (misal ganti kelas/filter) berubah karena pengecekan `isFirstRender.current`.
4. **Error `.next` Build Manifest Cache**:
   Folder `.next` di Frontend mengalami inkonsistensi berkas manifest akibat penghentian mendadak saat kompilasi Next.js.

---

## 🛠️ Langkah-Langkah Perbaikan (Siap Dieksekusi)

### Langkah 1: Buat & Migrate Database `db_lms` di Laragon MySQL

1. **Buat database `db_lms`** di MySQL Laragon dengan perintah shell/terminal:
   ```bash
   mysql -u root -e "CREATE DATABASE IF NOT EXISTS db_lms;"
   ```
2. **Jalankan Migrasi & Seeder** di folder `backend`:
   ```bash
   cd d:\project1\Frontend1\backend
   php artisan migrate:fresh --seed
   ```
   *Hasil: Seluruh tabel (`users`, `courses`, `assignments`, `materials`, `attendances`, `submissions`, `personal_access_tokens`) akan dibuat dan diisi dengan data awal 15+ user & kelas.*

---

### Langkah 2: Perbaiki Kode Frontend (`lib/api.ts` & `hooks/useRealtimeData.ts`)

#### 1. Edit [lib/api.ts](file:///d:/project1/Frontend1/Frontend/lib/api.ts)
Perbaiki kecocokan rute endpoint dengan Laravel API:
- Ubah `getCourseAttendances` & `saveCourseAttendances` ke `/courses/${courseId}/attendances`
- Ubah `updateProfile` ke `/auth/profile`
- Tambahkan penanganan error aman pada `fetchApi` agar tidak crash saat backend offline/reboot.

#### 2. Edit [hooks/useRealtimeData.ts](file:///d:/project1/Frontend1/Frontend/hooks/useRealtimeData.ts)
Ubah `useEffect` agar `load()` selalu dipanggil setiap kali dependensi (seperti `courseId`, `role`, `tab`) berubah, sehingga data selalu terbaharui secara *real-time*.

#### 3. Edit [app/login/page.tsx](file:///d:/project1/Frontend1/Frontend/app/login/page.tsx)
Pastikan token otentikasi Sanctum disimpan dengan benar ke `localStorage.setItem('lms_token', token)` saat login berhasil.

---

### Langkah 3: Pembersihan Cache Next.js (`Frontend/.next`)

1. Hapus direktori `.next` di `d:\project1\Frontend1\Frontend` untuk menghapus cache kompilasi yang rusak.

---

### Langkah 4: Jalankan Service Backend & Frontend

1. **Jalankan Backend Laravel (Port 8000)**:
   ```bash
   cd d:\project1\Frontend1\backend
   php artisan serve --port=8000
   ```

2. **Jalankan Frontend Next.js (Port 3000)**:
   ```bash
   cd d:\project1\Frontend1\Frontend
   npm run dev
   ```

---

## 🧪 Rencana Verifikasi

1. **Login Akun Admin** (`admin@lms.com` / `password`):
   - Buka `http://localhost:3000/login`
   - Klik login Admin atau masukkan `admin@lms.com`.
   - Pastikan statistik Dashboard menampilkan **15 Total User**, **Guru**, **Siswa**, dan **Daftar Kelas** dari MySQL Laragon.
2. **Login Akun Guru** (`guru@lms.com` / `password`):
   - Buka halaman Dashboard, Courses, Tugas, dan Absensi.
   - Pastikan data kelas diampu dan siswa terdaftar muncul secara realtime.
3. **Login Akun Siswa** (`siswa@lms.com` / `password`):
   - Buka halaman Dashboard, Courses, dan Tugas.
   - Pastikan daftar kelas terdaftar dan pengumpulan tugas terhubung dengan MySQL.
