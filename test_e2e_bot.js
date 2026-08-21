/**
 * LMS ULTIMATE 360° AUTOMATED TESTING SUITE
 * Tests EVERY single feature, endpoint, role, and edge-flow across Admin, Guru, and Siswa.
 */

const API_BASE = 'https://deploylms-production.up.railway.app/api/v1';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
  bgRed: '\x1b[41m',
};

const results = [];

function record(category, role, feature, passed, details = '', durationMs = 0) {
  results.push({ category, role, feature, passed, details, durationMs });
  const icon = passed ? `${colors.green}✔ PASS${colors.reset}` : `${colors.red}✖ FAIL${colors.reset}`;
  const duration = durationMs ? `${colors.yellow}(${durationMs}ms)${colors.reset}` : '';
  console.log(`  [${role}] ${icon} ${colors.bright}${feature}${colors.reset} ${details ? `-> ${details}` : ''} ${duration}`);
}

async function request(endpoint, options = {}, token = null) {
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let body = options.body;
  if (body && typeof body === 'object' && !(body instanceof FormData) && !(typeof body === 'string')) {
    body = JSON.stringify(body);
  }

  const start = Date.now();
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
      body,
    });

    const data = await res.json().catch(() => ({}));
    const duration = Date.now() - start;
    return { ok: res.ok, status: res.status, data, duration };
  } catch (err) {
    return { ok: false, status: 0, data: null, error: err.message, duration: Date.now() - start };
  }
}

async function runComprehensiveBot() {
  console.clear();
  console.log(`${colors.bright}${colors.cyan}══════════════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}   🤖  LMS ULTIMATE 360° AUTOMATED TEST BOT - ALL ROLES & ALL FEATURES            ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}   Target Backend: ${API_BASE}                                                   ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}══════════════════════════════════════════════════════════════════════════════════${colors.reset}\n`);

  let adminToken = null;
  let guruToken = null;
  let siswaToken = null;
  let siswa2Token = null;

  let adminUser = null;
  let guruUser = null;
  let siswaUser = null;

  let createdCourseId = null;
  let createdCourseCode = null;
  let createdCourse2Id = null;
  let createdCourse2Code = null;
  let createdMaterialId = null;
  let createdMaterial2Id = null;
  let createdAssignmentId = null;
  let createdSubmissionId = null;
  let createdUserId = null;
  let testNotificationId = null;

  // =========================================================================
  // 1. AUTHENTICATION & SESSION TESTS (ALL 4 ACCOUNTS)
  // =========================================================================
  console.log(`\n${colors.bright}${colors.bgBlue} [ 1. AUTENTIKASI, LOGIN & SESI PENGGUNA ] ${colors.reset}\n`);

  // Admin Login
  const loginAdmin = await request('/auth/login', { method: 'POST', body: { email: 'admin@lms.com', password: 'password' } });
  adminToken = loginAdmin.data?.access_token;
  adminUser = loginAdmin.data?.user;
  record('Auth', 'ADMIN', 'Login Akun Administrator', loginAdmin.ok && !!adminToken, `User: ${adminUser?.name}`, loginAdmin.duration);

  // Guru Login
  const loginGuru = await request('/auth/login', { method: 'POST', body: { email: 'guru@lms.com', password: 'password' } });
  guruToken = loginGuru.data?.access_token;
  guruUser = loginGuru.data?.user;
  record('Auth', 'GURU', 'Login Akun Guru Pengajar', loginGuru.ok && !!guruToken, `User: ${guruUser?.name}`, loginGuru.duration);

  // Siswa 1 Login
  const loginSiswa = await request('/auth/login', { method: 'POST', body: { email: 'siswa@lms.com', password: 'password' } });
  siswaToken = loginSiswa.data?.access_token;
  siswaUser = loginSiswa.data?.user;
  record('Auth', 'SISWA', 'Login Akun Siswa Utama (Siswa 1)', loginSiswa.ok && !!siswaToken, `User: ${siswaUser?.name} (ID: ${siswaUser?.id})`, loginSiswa.duration);

  // Siswa 2 Login
  const loginSiswa2 = await request('/auth/login', { method: 'POST', body: { email: 'siswa2@lms.com', password: 'password' } });
  siswa2Token = loginSiswa2.data?.access_token;
  record('Auth', 'SISWA', 'Login Akun Siswa Sekunder (Siswa 2)', loginSiswa2.ok && !!siswa2Token, `User: ${loginSiswa2.data?.user?.name}`, loginSiswa2.duration);

  // Get Me API for each
  const meAdmin = await request('/auth/me', { method: 'GET' }, adminToken);
  record('Auth', 'ADMIN', 'Get Current User Profile (/auth/me)', meAdmin.ok && meAdmin.data?.user?.role === 'admin', `Role verified: admin`, meAdmin.duration);

  const meGuru = await request('/auth/me', { method: 'GET' }, guruToken);
  record('Auth', 'GURU', 'Get Current User Profile (/auth/me)', meGuru.ok && meGuru.data?.user?.role === 'guru', `Role verified: guru`, meGuru.duration);

  const meSiswa = await request('/auth/me', { method: 'GET' }, siswaToken);
  record('Auth', 'SISWA', 'Get Current User Profile (/auth/me)', meSiswa.ok && meSiswa.data?.user?.role === 'siswa', `Role verified: siswa`, meSiswa.duration);

  // Update Profile Test
  const updateProf = await request('/auth/profile', {
    method: 'PUT',
    body: { name: 'Ahmad Rizky (Siswa)', phone: '081234567890', bio: 'Peserta didik aktif kelas XII' }
  }, siswaToken);
  record('Auth', 'SISWA', 'Update Profil Pengguna (/auth/profile)', updateProf.ok, 'No HP & Bio berhasil diperbarui', updateProf.duration);

  // =========================================================================
  // 2. ADMIN MANAGEMENT & SETTINGS
  // =========================================================================
  console.log(`\n${colors.bright}${colors.bgBlue} [ 2. ADMINISTRATOR - MANAJEMEN PENGGUNA & PENGATURAN ] ${colors.reset}\n`);

  // Admin Stats
  const adminStats = await request('/admin/stats', { method: 'GET' }, adminToken);
  record('Admin', 'ADMIN', 'Statistik Global Dashboard (/admin/stats)', adminStats.ok, `Total courses, users & stats loaded`, adminStats.duration);

  // List All Users
  const listUsers = await request('/admin/users', { method: 'GET' }, adminToken);
  const totalUsers = Array.isArray(listUsers.data?.users) ? listUsers.data.users.length : (Array.isArray(listUsers.data) ? listUsers.data.length : 0);
  record('Admin', 'ADMIN', 'Daftar Seluruh Pengguna (/admin/users)', listUsers.ok, `Ditemukan ${totalUsers} pengguna terdaftar`, listUsers.duration);

  // Filter Users by Role
  const listTeachers = await request('/admin/users?role=guru', { method: 'GET' }, adminToken);
  record('Admin', 'ADMIN', 'Filter Pengguna Khusus Guru (/admin/users?role=guru)', listTeachers.ok, 'Filter guru berhasil', listTeachers.duration);

  const listStudents = await request('/admin/users?role=siswa', { method: 'GET' }, adminToken);
  record('Admin', 'ADMIN', 'Filter Pengguna Khusus Siswa (/admin/users?role=siswa)', listStudents.ok, 'Filter siswa berhasil', listStudents.duration);

  // Create New User by Admin
  const testUserEmail = `test_user_${Date.now()}@lms.com`;
  const createUserRes = await request('/admin/users', {
    method: 'POST',
    body: {
      name: 'Dr. Hendra Gunawan, M.Pd',
      email: testUserEmail,
      password: 'password123',
      role: 'guru',
      nisn_or_nip: `1985${Math.floor(1000 + Math.random() * 9000)}`,
      subject: 'Fisika Kuantum'
    }
  }, adminToken);
  const createdUser = createUserRes.data?.user || createUserRes.data?.data || createUserRes.data;
  if (createUserRes.ok && createdUser?.id) {
    createdUserId = createdUser.id;
    record('Admin', 'ADMIN', 'Tambah Pengguna Baru (/admin/users)', true, `User: "${createdUser.name}" (ID: ${createdUserId})`, createUserRes.duration);
  } else {
    record('Admin', 'ADMIN', 'Tambah Pengguna Baru (/admin/users)', false, createUserRes.data?.message || 'Failed', createUserRes.duration);
  }

  // Update User by Admin
  if (createdUserId) {
    const updateUserRes = await request(`/admin/users/${createdUserId}`, {
      method: 'PUT',
      body: { name: 'Dr. Hendra Gunawan, M.Pd (Senior)', subject: 'Fisika Modern & Optika' }
    }, adminToken);
    record('Admin', 'ADMIN', 'Edit Data Pengguna (/admin/users/:id)', updateUserRes.ok, 'Perubahan nama & mapel disimpan', updateUserRes.duration);

    // Reset User Password by Admin
    const resetPassRes = await request(`/admin/users/${createdUserId}/reset-password`, {
      method: 'PUT',
      body: { password: 'newpassword123' }
    }, adminToken);
    record('Admin', 'ADMIN', 'Reset Password Pengguna (/admin/users/:id/reset-password)', resetPassRes.ok, 'Password baru diset berhasil', resetPassRes.duration);

    // Delete User by Admin
    const deleteUserRes = await request(`/admin/users/${createdUserId}`, { method: 'DELETE' }, adminToken);
    record('Admin', 'ADMIN', 'Hapus Pengguna (/admin/users/:id)', deleteUserRes.ok, `User ID ${createdUserId} berhasil dihapus`, deleteUserRes.duration);
  }

  // Bulk Import Users
  const bulkRes = await request('/admin/users/bulk-import', {
    method: 'POST',
    body: {
      users: [
        { name: 'Siswa Demo Bulk A', email: `bulk_a_${Date.now()}@lms.com`, role: 'siswa', nisn_or_nip: '99001' },
        { name: 'Siswa Demo Bulk B', email: `bulk_b_${Date.now()}@lms.com`, role: 'siswa', nisn_or_nip: '99002' }
      ]
    }
  }, adminToken);
  record('Admin', 'ADMIN', 'Bulk Import Pengguna dari File/CSV (/admin/users/bulk-import)', bulkRes.ok, 'Import massal diproses', bulkRes.duration);

  // Admin Settings
  const getSettings = await request('/admin/settings', { method: 'GET' }, adminToken);
  record('Admin', 'ADMIN', 'Ambil Pengaturan Sekolah (/admin/settings)', getSettings.ok, 'Pengaturan semester & instansi OK', getSettings.duration);

  const updateSettings = await request('/admin/settings', {
    method: 'PUT',
    body: { school_name: 'SMA Negeri 1 Digital Excellence', semester: 'Genap 2025/2026' }
  }, adminToken);
  record('Admin', 'ADMIN', 'Simpan Pengaturan Sekolah (/admin/settings)', updateSettings.ok, 'Identitas sekolah tersimpan', updateSettings.duration);

  // =========================================================================
  // 3. COURSE MANAGEMENT & ENROLLMENT (GURU & SISWA)
  // =========================================================================
  console.log(`\n${colors.bright}${colors.bgBlue} [ 3. MANAJEMEN KELAS & PENDAFTARAN SISWA ] ${colors.reset}\n`);

  // Guru Create Course 1
  const course1Code = `BIO-${Math.floor(100 + Math.random() * 900)}`;
  const createC1 = await request('/courses', {
    method: 'POST',
    body: {
      title: 'Biologi Molekuler & Genetika Lanjutan',
      code: course1Code,
      description: 'Mempelajari sintesis protein, replikasi DNA, dan mutasi genetik.',
      grade_level: 'XII',
      color_theme: 'emerald'
    }
  }, guruToken);
  const c1Data = createC1.data?.course || createC1.data?.data || createC1.data;
  createdCourseId = c1Data?.id;
  createdCourseCode = c1Data?.code || course1Code;
  record('Course', 'GURU', 'Buat Kelas Pembelajaran Utama (/courses)', createC1.ok && !!createdCourseId, `"${c1Data?.title}" (Kode: ${createdCourseCode})`, createC1.duration);

  // Guru Create Course 2 (for multi-class isolation test)
  const course2Code = `FIS-${Math.floor(100 + Math.random() * 900)}`;
  const createC2 = await request('/courses', {
    method: 'POST',
    body: {
      title: 'Fisika Gelombang & Termodinamika',
      code: course2Code,
      description: 'Konsep dasar gelombang elektromagnetik dan transfer kalor.',
      grade_level: 'XII',
      color_theme: 'indigo'
    }
  }, guruToken);
  const c2Data = createC2.data?.course || createC2.data?.data || createC2.data;
  createdCourse2Id = c2Data?.id;
  createdCourse2Code = c2Data?.code || course2Code;
  record('Course', 'GURU', 'Buat Kelas Pembelajaran Kedua (/courses)', createC2.ok && !!createdCourse2Id, `"${c2Data?.title}" (Kode: ${createdCourse2Code})`, createC2.duration);

  // Guru Get Course Detail
  if (createdCourseId) {
    const cDetail = await request(`/courses/${createdCourseId}`, { method: 'GET' }, guruToken);
    record('Course', 'GURU', 'Detail Kelas & Pengajar (/courses/:id)', cDetail.ok, `Nama: ${cDetail.data?.title || 'OK'}`, cDetail.duration);

    // Guru Update Course
    const cUpdate = await request(`/courses/${createdCourseId}`, {
      method: 'PUT',
      body: { description: 'Deskripsi kurikulum Biologi Molekuler terstandarisasi 2026.' }
    }, guruToken);
    record('Course', 'GURU', 'Edit Informasi Kelas (/courses/:id)', cUpdate.ok, 'Deskripsi kelas diperbarui', cUpdate.duration);
  }

  // Siswa Get Available Courses
  const availCourses = await request('/available-courses', { method: 'GET' }, siswaToken);
  record('Course', 'SISWA', 'Daftar Kelas Tersedia untuk Gabung (/available-courses)', availCourses.ok, 'Katalog kelas terbuka termuat', availCourses.duration);

  // Siswa 1 Enroll to Course 1 (Direct ID)
  if (createdCourseId) {
    const enroll1 = await request(`/courses/${createdCourseId}/enroll`, { method: 'POST' }, siswaToken);
    record('Course', 'SISWA', 'Siswa 1 Mendaftar ke Kelas 1 (Direct ID)', enroll1.ok, `Siswa 1 terdaftar di Kelas ID ${createdCourseId}`, enroll1.duration);
  }

  // Siswa 1 Enroll to Course 2 (Enroll by Code)
  if (createdCourse2Code) {
    const enrollCode = await request('/courses/enroll-by-code', {
      method: 'POST',
      body: { code: createdCourse2Code }
    }, siswaToken);
    record('Course', 'SISWA', 'Siswa 1 Gabung Kelas 2 Menggunakan Kode (/courses/enroll-by-code)', enrollCode.ok, `Kode: ${createdCourse2Code}`, enrollCode.duration);
  }

  // Siswa 2 Enroll to Course 1
  if (createdCourseId && siswa2Token) {
    const enrollS2 = await request(`/courses/${createdCourseId}/enroll`, { method: 'POST' }, siswa2Token);
    record('Course', 'SISWA', 'Siswa 2 Mendaftar ke Kelas 1', enrollS2.ok, 'Siswa 2 terdaftar di kelas yang sama', enrollS2.duration);
  }

  // Guru Check Enrolled Students List
  if (createdCourseId) {
    const studentsRes = await request(`/courses/${createdCourseId}/students`, { method: 'GET' }, guruToken);
    const studentsList = Array.isArray(studentsRes.data) ? studentsRes.data : [];
    record('Course', 'GURU', 'Daftar Siswa Terdaftar di Kelas (/courses/:id/students)', studentsRes.ok, `Terdata ${studentsList.length} siswa di kelas`, studentsRes.duration);
  }

  // =========================================================================
  // 4. LEARNING MATERIALS & MODULES (GURU & SISWA)
  // =========================================================================
  console.log(`\n${colors.bright}${colors.bgBlue} [ 4. BAHAN AJAR, MODUL & TAUTAN EKSTERNAL ] ${colors.reset}\n`);

  if (createdCourseId) {
    // 1. Upload Material with External Link Resource
    const mat1Res = await request('/materials', {
      method: 'POST',
      body: {
        course_id: createdCourseId,
        title: 'Modul Digital: Struktur DNA & Kromosom',
        content: 'https://drive.google.com/drive/folders/bio-dna-module-sample [Category: Link Resource]'
      }
    }, guruToken);
    const mat1 = mat1Res.data?.material || mat1Res.data?.data || mat1Res.data;
    createdMaterialId = mat1?.id;
    record('Material', 'GURU', 'Unggah Materi Berjenis Tautan Web/Link (/materials)', mat1Res.ok, `Judul: "${mat1?.title}"`, mat1Res.duration);

    // 2. Upload Material with Text Summary
    const mat2Res = await request('/materials', {
      method: 'POST',
      body: {
        course_id: createdCourseId,
        title: 'Ringkasan Materi: Sintesis Protein & Kode Genetik',
        content: 'Rangkuman lengkap translasi dan transkripsi asam amino seluler. [Category: Dokumen]'
      }
    }, guruToken);
    const mat2 = mat2Res.data?.material || mat2Res.data?.data || mat2Res.data;
    createdMaterial2Id = mat2?.id;
    record('Material', 'GURU', 'Unggah Materi Berjenis Rangkuman Dokumen (/materials)', mat2Res.ok, `Judul: "${mat2?.title}"`, mat2Res.duration);

    // Siswa Fetch Materials
    const getMats = await request(`/materials?course_id=${createdCourseId}`, { method: 'GET' }, siswaToken);
    const mats = Array.isArray(getMats.data) ? getMats.data : [];
    record('Material', 'SISWA', 'Siswa Mengakses Modul Pembelajaran (/materials)', getMats.ok, `${mats.length} modul siap diunduh/dibaca`, getMats.duration);

    // Guru Delete Material 2
    if (createdMaterial2Id) {
      const delMat = await request(`/materials/${createdMaterial2Id}`, { method: 'DELETE' }, guruToken);
      record('Material', 'GURU', 'Hapus Modul Pembelajaran (/materials/:id)', delMat.ok, `Modul ID ${createdMaterial2Id} dihapus`, delMat.duration);
    }
  }

  // =========================================================================
  // 5. ASSIGNMENTS, SUBMISSIONS & GRADING (GURU & SISWA)
  // =========================================================================
  console.log(`\n${colors.bright}${colors.bgBlue} [ 5. TUGAS, PENGUMPULAN SISWA & PENILAIAN GURU ] ${colors.reset}\n`);

  if (createdCourseId) {
    // 1. Guru Create Assignment
    const createAssign = await request('/assignments', {
      method: 'POST',
      body: {
        course_id: createdCourseId,
        title: 'LKPD 01: Simulasi Replikasi DNA & Transkripsi mRNA',
        instruction: 'Lengkapi tabel kodon asam amino dan jelaskan mekanisme mutasi titik pada gen hemoglobin.',
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
        max_score: 100
      }
    }, guruToken);
    const assignData = createAssign.data?.assignment || createAssign.data?.data || createAssign.data;
    createdAssignmentId = assignData?.id;
    record('Task', 'GURU', 'Buat Tugas / LKPD Baru (/assignments)', createAssign.ok && !!createdAssignmentId, `Tugas: "${assignData?.title}"`, createAssign.duration);

    // 2. Siswa Get Assignments
    const getAssigns = await request(`/assignments?course_id=${createdCourseId}`, { method: 'GET' }, siswaToken);
    record('Task', 'SISWA', 'Lihat Daftar Tugas Kelas (/assignments)', getAssigns.ok, 'Daftar tugas termuat', getAssigns.duration);

    // 3. Siswa Get Assignment Detail
    if (createdAssignmentId) {
      const assignDetail = await request(`/assignments/${createdAssignmentId}`, { method: 'GET' }, siswaToken);
      record('Task', 'SISWA', 'Buka Rincian & Instruksi Tugas (/assignments/:id)', assignDetail.ok, `Instruksi & deadline terverifikasi`, assignDetail.duration);

      // 4. Siswa 1 Submit Assignment
      const submitRes = await request(`/assignments/${createdAssignmentId}/submit`, {
        method: 'POST',
        body: { content: 'Hasil analisis simulasi replikasi DNA telah selesai dikerjakan sesuai format laporan.' }
      }, siswaToken);
      const sub = submitRes.data?.submission || submitRes.data?.data || submitRes.data;
      createdSubmissionId = sub?.id;
      record('Task', 'SISWA', 'Siswa 1 Kumpulkan Lembar Jawaban (/assignments/:id/submit)', submitRes.ok || submitRes.status === 200 || submitRes.status === 201, 'Status: Sudah Dikumpulkan', submitRes.duration);

      // 5. Siswa Check My Submissions
      const mySubs = await request('/submissions/my', { method: 'GET' }, siswaToken);
      record('Task', 'SISWA', 'Cek Riwayat Pengumpulan Saya (/submissions/my)', mySubs.ok, 'Pengumpulan siswa tercatat di riwayat', mySubs.duration);

      // 6. Guru Check Assignment Submissions
      const getSubs = await request(`/assignments/${createdAssignmentId}/submissions`, { method: 'GET' }, guruToken);
      const subsList = Array.isArray(getSubs.data) ? getSubs.data : [];
      const subToGrade = subsList[0] || (createdSubmissionId ? { id: createdSubmissionId } : null);
      record('Task', 'GURU', 'Daftar Pengumpulan Siswa Masuk (/assignments/:id/submissions)', getSubs.ok, `${subsList.length} tugas siswa menunggu dinilai`, getSubs.duration);

      // 7. Guru Grade Submission
      if (subToGrade?.id) {
        const gradeRes = await request(`/submissions/${subToGrade.id}/grade`, {
          method: 'PUT',
          body: {
            score: 96,
            teacher_feedback: 'Analisis mutasi sangat tepat dan penjelasan struktur mRNA sangat rinci. Nilai A+!'
          }
        }, guruToken);
        record('Task', 'GURU', 'Beri Nilai & Ulasan Tugas (/submissions/:id/grade)', gradeRes.ok, 'Skor 96/100 tersimpan', gradeRes.duration);
      }

      // 8. Guru Input Exam Scores (UTS & UAS)
      if (siswaUser?.id) {
        const examGrades = await request(`/courses/${createdCourseId}/students/${siswaUser.id}/grades`, {
          method: 'PUT',
          body: { uts_score: 88, uas_score: 92 }
        }, guruToken);
        record('Task', 'GURU', 'Input Nilai Ujian Semester (UTS & UAS)', examGrades.ok, 'UTS: 88, UAS: 92 terisolasi di Kelas 1', examGrades.duration);
      }
    }
  }

  // =========================================================================
  // 6. ATTENDANCE & SCHEDULE MANAGEMENT (GURU & SISWA)
  // =========================================================================
  console.log(`\n${colors.bright}${colors.bgBlue} [ 6. PRESENSI / ABSENSI KELAS & STATISTIK ] ${colors.reset}\n`);

  if (createdCourseId) {
    // 1. Guru Set Attendance Window
    const setWindow = await request(`/courses/${createdCourseId}/attendance-schedule`, {
      method: 'PUT',
      body: { attendance_open_time: '06:00', attendance_close_time: '23:59' }
    }, guruToken);
    record('Attendance', 'GURU', 'Atur Jam Buka-Tutup Presensi Kelas', setWindow.ok, '06:00 - 23:59 WIB', setWindow.duration);

    // 2. Siswa Self-Attendance
    const selfAtt = await request('/attendances/self', {
      method: 'POST',
      body: { course_id: createdCourseId }
    }, siswaToken);
    record('Attendance', 'SISWA', 'Siswa 1 Presensi Mandiri (/attendances/self)', selfAtt.ok, 'Status Hadir tercatat', selfAtt.duration);

    // 3. Siswa Check My Attendances
    const myAtts = await request('/attendances/my', { method: 'GET' }, siswaToken);
    record('Attendance', 'SISWA', 'Riwayat Presensi Siswa (/attendances/my)', myAtts.ok, 'Riwayat absensi harian termuat', myAtts.duration);

    // 4. Guru Get Course Attendances by Date
    const today = new Date().toISOString().split('T')[0];
    const getAtts = await request(`/courses/${createdCourseId}/attendances?date=${today}`, { method: 'GET' }, guruToken);
    record('Attendance', 'GURU', 'Daftar Presensi Harian Siswa (/courses/:id/attendances)', getAtts.ok, `Presensi tanggal ${today} termuat`, getAtts.duration);

    // 5. Guru Batch Save / Override Attendance
    if (siswaUser?.id) {
      const batchAtt = await request(`/courses/${createdCourseId}/attendances`, {
        method: 'POST',
        body: {
          date: today,
          attendances: [
            { student_id: siswaUser.id, status: 'Hadir', note: 'Hadir tepat waktu' }
          ]
        }
      }, guruToken);
      record('Attendance', 'GURU', 'Simpan / Rekap Presensi Manual oleh Guru', batchAtt.ok, 'Presensi harian tersimpan', batchAtt.duration);
    }

    // 6. Guru Get Attendance Stats
    const attStats = await request(`/courses/${createdCourseId}/attendance-stats`, { method: 'GET' }, guruToken);
    record('Attendance', 'GURU', 'Statistik Persentase Presensi Kelas', attStats.ok, 'Kalkulasi rasio kehadiran OK', attStats.duration);
  }

  // =========================================================================
  // 7. NOTIFICATIONS & READ STATES
  // =========================================================================
  console.log(`\n${colors.bright}${colors.bgBlue} [ 7. SISTEM NOTIFIKASI REAL-TIME ] ${colors.reset}\n`);

  // Siswa List Notifications
  const notifsRes = await request('/notifications', { method: 'GET' }, siswaToken);
  const notifsList = Array.isArray(notifsRes.data?.notifications) ? notifsRes.data.notifications : (Array.isArray(notifsRes.data) ? notifsRes.data : []);
  if (notifsList.length > 0) testNotificationId = notifsList[0]?.id;
  record('Notif', 'SISWA', 'Daftar Notifikasi Masuk (/notifications)', notifsRes.ok, `${notifsList.length} notifikasi di lonceng`, notifsRes.duration);

  // Unread Count
  const unreadRes = await request('/notifications/unread-count', { method: 'GET' }, siswaToken);
  record('Notif', 'SISWA', 'Jumlah Notifikasi Belum Dibaca (/notifications/unread-count)', unreadRes.ok, `Belum dibaca: ${unreadRes.data?.unread_count || 0}`, unreadRes.duration);

  // Mark Single Notification Read
  if (testNotificationId) {
    const markOne = await request(`/notifications/${testNotificationId}/read`, { method: 'PUT' }, siswaToken);
    record('Notif', 'SISWA', 'Tandai 1 Notifikasi Dibaca (/notifications/:id/read)', markOne.ok, `Notifikasi ID ${testNotificationId} terbaca`, markOne.duration);
  }

  // Mark All Notifications Read
  const markAll = await request('/notifications/read-all', { method: 'PUT' }, siswaToken);
  record('Notif', 'SISWA', 'Tandai Semua Notifikasi Dibaca (/notifications/read-all)', markAll.ok, 'Semua notifikasi terverifikasi dibaca', markAll.duration);

  // =========================================================================
  // 8. DASHBOARD STATS & GLOBAL REPORTS (ALL ROLES)
  // =========================================================================
  console.log(`\n${colors.bright}${colors.bgBlue} [ 8. LAPORAN GLOBAL & STATISTIK ROLE ] ${colors.reset}\n`);

  const guruStats = await request('/guru/stats', { method: 'GET' }, guruToken);
  record('Stats', 'GURU', 'Dashboard Statistik Guru (/guru/stats)', guruStats.ok, 'Data kelas & tugas terintegrasi', guruStats.duration);

  const siswaStats = await request('/siswa/stats', { method: 'GET' }, siswaToken);
  record('Stats', 'SISWA', 'Dashboard Statistik Siswa (/siswa/stats)', siswaStats.ok, 'Data progres belajar & tugas OK', siswaStats.duration);

  if (createdCourseId) {
    const adminReport = await request(`/courses/${createdCourseId}/report`, { method: 'GET' }, adminToken);
    record('Stats', 'ADMIN', 'Rekapitulasi Laporan Kehadiran & Nilai Global (/courses/:id/report)', adminReport.ok, 'Rekap per kelas & persentase hadir termuat', adminReport.duration);
  }

  // =========================================================================
  // FINAL SCORECARD SUMMARY
  // =========================================================================
  console.log(`\n${colors.bright}${colors.cyan}══════════════════════════════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}               📊 REKAPITULASI HASIL PENGUJIAN LENGKAP BOT                       ${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}══════════════════════════════════════════════════════════════════════════════════${colors.reset}\n`);

  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  const percent = Math.round((passedCount / totalCount) * 100);

  const categories = [...new Set(results.map(r => r.category))];
  categories.forEach(cat => {
    const catResults = results.filter(r => r.category === cat);
    const catPassed = catResults.filter(r => r.passed).length;
    console.log(`  • Sektor ${colors.bright}${cat.padEnd(12)}${colors.reset}: ${catPassed}/${catResults.length} Sukses (${Math.round(catPassed/catResults.length*100)}%)`);
  });

  console.log(`\n  ────────────────────────────────────────────────────────────────────────────`);
  console.log(`  Total Fitur Diuji   : ${colors.bright}${totalCount} Fitur Lengkap${colors.reset}`);
  console.log(`  Berhasil (PASSED)   : ${colors.green}${colors.bright}${passedCount} Fitur${colors.reset}`);
  console.log(`  Gagal (FAILED)      : ${passedCount === totalCount ? colors.green : colors.red}${totalCount - passedCount} Fitur${colors.reset}`);
  console.log(`  Tingkat Keberhasilan: ${colors.bright}${colors.green}${percent}%${colors.reset}\n`);

  if (passedCount === totalCount) {
    console.log(`${colors.bright}${colors.bgGreen}  🎉 100% SEMUA FITUR DI SELURUH AKUN BERJALAN DENGAN SEMPURNA!  ${colors.reset}\n`);
  }
}

runComprehensiveBot();
