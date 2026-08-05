# Rencana Perbaikan: Data Database Tidak Muncul pada 3 Role (Admin, Guru, Siswa), Migrasi Laragon & Fix Realtime Fetch

## Deskripsi Masalah
1. **Error `Failed to fetch` & Data 0 di Dashboard**: Terjadi karena server Laravel backend (`php artisan serve`) belum berjalan pada port 8000. `fetchApi` melempar error koneksi jaringan sehingga komponen frontend menampilkan angka 0.
2. **Kebutuhan Penggunaan Laragon (Menggantikan XAMPP)**: Pengguna meminta migrasi koneksi ke Laragon MySQL (`localhost:3306`, database `db_lms`).
3. **Penyebab Data Realtime Tidak Muncul**:
   - `useRealtimeData.ts` mengunci pemanggilan awal hanya pada render pertama via `isFirstRender.current`, sehingga tidak memuat data baru ketika dependensi berubah.
   - Beberapa rute pada `Frontend/lib/api.ts` tidak cocok dengan rute di `backend/routes/api.php` (`/attendances/course` vs `/courses/{id}/attendances`, `/users/profile` vs `/auth/profile`).

## User Review Required

> [!IMPORTANT]
> - Pengaturan database `backend/.env` dikonfigurasi langsung untuk **Laragon MySQL** (`DB_HOST=127.0.0.1`, `DB_PORT=3306`, `DB_DATABASE=db_lms`, `DB_USERNAME=root`, `DB_PASSWORD=`).
> - Tidak ada tabel atau data yang dihapus dari MySQL.

## Proposed Changes

---

### Backend & Database (Laragon)

#### [MODIFY] [backend/.env](file:///d:/project1/Frontend1/backend/.env)
- Memastikan konfigurasi database terhubung ke MySQL Laragon pada port 3306, DB `db_lms`.

#### [RUN] Serve Laravel Backend Server
- Menjalankan background service `php artisan serve --port=8000` di direktori `backend` agar endpoint `http://127.0.0.1:8000/api/v1` siap menerima permintaan API dari Next.js.

---

### Frontend API & Hook Realtime

#### [MODIFY] [api.ts](file:///d:/project1/Frontend1/Frontend/lib/api.ts)
- Menambahkan penanganan error yang aman (*graceful error catch*) pada `fetchApi` jika server backend belum siap, agar tidak terjadi uncaught `Failed to fetch` crash.
- Memperbaiki penyesuaian rute endpoint:
  - `getCourseAttendances` & `saveCourseAttendances` ke `/courses/${courseId}/attendances`
  - `updateProfile` ke `/auth/profile`

#### [MODIFY] [useRealtimeData.ts](file:///d:/project1/Frontend1/Frontend/hooks/useRealtimeData.ts)
- Memperbaiki penguncian `isFirstRender` agar `load()` segera dieksekusi saat komponen dimuat maupun saat *dependencies* (misal: `courseId`, `role`, filter) berubah secara real-time.

#### [MODIFY] [login/page.tsx](file:///d:/project1/Frontend1/Frontend/app/login/page.tsx)
- Memastikan token otentikasi Sanctum tersimpan sempurna di `localStorage` saat login agar seluruh request API mendapatkan akses data MySQL secara legal.

---

### Clean Cache Next.js

#### [CLEAN] `.next` folder
- Menghapus folder `Frontend/.next` untuk membersihkan chunk bundler usang.

## Verification Plan

### Manual Verification
1. Verifikasi koneksi MySQL Laragon via PHP (`php artisan db:monitor` / `php artisan db:seed`).
2. Jalankan `php artisan serve --port=8000` di folder `backend`.
3. Buka `http://localhost:3000` pada browser.
4. Uji login 3 Role:
   - **Admin** (`admin@lms.com` / `password`): Verifikasi angka statistik & daftar user dari MySQL (15 user terdeteksi di DB).
   - **Guru** (`guru@lms.com` / `password`): Verifikasi kelola kelas, materi, tugas, dan absensi terhubung realtime.
   - **Siswa** (`siswa@lms.com` / `password`): Verifikasi daftar kelas terdaftar, penyerahan tugas, dan presensi realtime.
