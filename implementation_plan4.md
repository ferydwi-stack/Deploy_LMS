# Rencana Kerja Komprehensif: Fitur Export Excel & PDF, Optimalisasi Koneksi Database MySQL, Isolasi Akun & Zero Dummy Data

Dokumen ini berisi rencana eksekusi tingkat lanjut untuk menyelesaikan 4 fokus utama:
1. **Peningkatan Fitur Export/Download Excel (.csv) & PDF 100% Berjalan**: Mengubah tombol unduh laporan di halaman Admin, Guru, dan Siswa agar menghasilkan berkas nyata (Excel/PDF) dari data MySQL.
2. **Perbaikan Masalah Data Tidak Muncul ("Data Hilang/Terputus di UI")**: Memperbaiki pencocokan format API response, konversi tipe ID (String vs Number), serta siklus penanganan token auth.
3. **Isolasi Akun User (Guru A vs Guru B & Siswa A vs Siswa B)**: Memastikan Guru/Siswa hanya dapat melihat & mengelola data milik sendiri.
4. **Eliminasi 100% Data Dummy & Fallback**: Menghapus seluruh teks/angka fiktif dan menyajikan Empty State yang bersih jika database 0 item.

---

## 📄 Bagian 1: Perbaikan Fitur Unduh / Export Excel & PDF Real

### A. Laporan Admin (`Frontend/app/admin/reports/page.tsx`)
- **Kendala**: Tombol `handleExport('excel')` dan `handleExport('pdf')` sebelumnya hanya menampilkan pesan toast dan tidak mengunduh file asli.
- **Rencana Perubahan**:
  1. **Export Excel**: Hubungkan ke API `/api/v1/admin/stats` dan data kehadiran global dari MySQL, lalu buat Blob CSV berformat UTF-8 BOM (`Rekapitulasi_Presensi_Sekolah_Global.csv`).
  2. **Export PDF**: Buat *Print-Ready Window* dengan HTML/CSS khusus kop sekolah, tabel statistik kehadiran per kelas, dan area tanda tangan resmi yang langsung memicu perintah cetak/simpan PDF (`window.print()`).

### B. Rapor & Laporan Siswa (`Frontend/app/siswa/reports/page.tsx`)
- **Kendala**: Tombol unduh rapor PDF & Excel belum membuat berkas fisik.
- **Rencana Perubahan**:
  1. **Export PDF (Rapor Siswa)**: Hasilkan Rapor Belajar Akademik Siswa resmi per semester (mencantumkan Nama Siswa, NISN, daftar Kelas yang diikuti, Rata-rata Tugas, UTS, UAS, Nilai Akhir, KKM, dan Status Ketuntasan).
  2. **Export Excel**: Hasilkan file CSV rekapitulasi nilai kumulatif siswa (`Rapor_Akademik_[NamaSiswa].csv`).

### C. Laporan Guru (`Frontend/app/guru/reports/page.tsx`)
- **Penyempurnaan**: Pastikan ekspor Excel & PDF mengambil data nilai UTS/UAS murni dari pivot database MySQL (`updateGrade`) tanpa memasukkan angka fallback 80/85 jika data belum diisi (tampilkan `Belum Diisi` / `-`).

---

## 🔌 Bagian 2: Solusi Data Tidak Muncul di Admin/Guru/Siswa ("Koneksi MySQL Putus")

### A. Penyebab Utama Masalah
1. **Format API Response Berbeda-Beda**: Beberapa endpoint mengembalikan array langsung `[...]`, sementara endpoint lain mengembalikan objek bersarang seperti `{ users: [...] }`, `{ courses: [...] }`, `{ data: [...] }`, atau `{ attendances: [...] }`. Saat Frontend melakukan `Array.isArray(data)`, pengecekan gagal dan menganggap data `[]` (kosong).
2. **Tipe ID Mismatch (String vs Number)**: Pengecekan `c.teacher_id === user.id` sering bernilai `false` jika satu bertipe String (`"2"`) dan satu bertipe Number (`2`).
3. **Token Auth Expired / Stale**: Panggilan API di latar belakang gagal 401 tapi frontend menelan error tanpa memberi tahu pengguna.

### B. Rencana Solusi
1. **Helper Universal API Array Unwrapper (`lib/api.ts`)**:
   Buat fungsi penanganan pembungkus data universal `ensureArray(res, key)` yang secara cerdas mendeteksi array baik langsung maupun di dalam kunci `data`, `users`, `courses`, `assignments`, `materials`, `students`, `attendances`, `notifications`.
2. **Karakterisasi String ID Strict**:
   Gunakan perbandingan `String(id1) === String(id2)` di seluruh filter komponen React.
3. **Pemberitahuan Ketersambungan Server Backend**:
   Jika server Laravel mati / tidak merespons, tampilkan pesan warning koneksi yang jelas alih-alih UI kosong membingungkan.

---

## 🔒 Bagian 3: Isolasi Data Akun User Strict & Zero Dummy Data

### A. Kebijakan Otorisasi Backend (`backend/app/Http/Controllers/Api/`)
1. **`AssignmentController.php`**: Filter endpoint `index` sesuai role:
   - Guru: hanya tugas yang dibuat untuk kelas yang diampunya (`course.teacher_id === $user->id`).
   - Siswa: hanya tugas dari kelas tempat siswa terdaftar aktif (`course.students`).
2. **`MaterialController.php`**: Filter endpoint `index` sesuai role guru/siswa.
3. **`CourseController.php`**: Tambahkan `$this->authorize('view', $course);` pada method `show($id)`.

### B. Pembersihan Dummy Data Frontend (`Frontend/app/`)
1. **`siswa/tugas/page.tsx`**: Hapus header hardcode `"Matematika - X IPA 1"` dan deadline fiktif. Tampilkan tugas asli dari API.
2. **`siswa/dashboard/page.tsx`**: Hitung `pendingTasks` murni dari perbandingan tugas aktif vs tugas yang sudah disubmit.
3. **`guru/tugas/page.tsx` & `guru/absensi/page.tsx`**: Hapus fallback 8 siswa dan array file dummy. Ambil data asli dari relasi pivot MySQL.
4. **`admin/users/page.tsx`**: Hapus penambahan 10 user demo otomatis pada modal import massal.

---

## 🧪 Bagian 4: Skenario Pengujian Ujung-ke-Ujung (Verification Plan)

1. **Uji Coba Export File (Excel & PDF)**:
   - Buka `/admin/reports`, `/guru/reports`, dan `/siswa/reports`.
   - Klik **Export Excel** -> Pastikan browser mengunduh berkas `.csv` asli yang dapat dibuka di MS Excel.
   - Klik **Cetak PDF** -> Pastikan jendela dialog cetak PDF browser terbuka dengan layout Rapor/Laporan rapi.

2. **Uji Coba Keterhubungan Data (No Data Loss)**:
   - Login Admin -> Tambah 1 Guru & 1 Siswa.
   - Login Guru -> Buat 1 Kelas Baru.
   - Login Siswa -> Enroll Kelas dengan Kode -> Pastikan Kelas LANGSUNG MUNCUL di Dashboard Siswa.
   - Guru buat Tugas -> Pastikan Tugas LANGSUNG MUNCUL di Halaman Tugas Siswa.
   - Siswa submit Tugas -> Pastikan Submission LANGSUNG MUNCUL di Halaman Periksa Guru.

3. **Uji Coba Data Kosong (Zero Dummy Data)**:
   - Buka aplikasi dengan database kosong -> Semua halaman harus menampilkan `0` dan **Empty State ("Belum Ada Data")** tanpa error.
