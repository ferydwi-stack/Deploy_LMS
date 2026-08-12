'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { api, setCurrentUser } from '@/lib/api';
import {
  User,
  Mail,
  Phone,
  BookOpen,
  ShieldCheck,
  Lock,
  Camera,
  CheckCircle2,
  Award,
  Briefcase,
  Building,
  Save,
  Users,
  CalendarCheck,
  GraduationCap
} from 'lucide-react';

export default function GuruProfilePage() {
  const { user: currentUser } = useAuth();
  const buildFormData = (u: any) => ({
    name: u?.name || '',
    nip: u?.nip || u?.nisn_or_nip || '',
    email: u?.email || '',
    subject: u?.subject || u?.specialization || '',
    phone: u?.phone || '',
    bio: u?.bio || ''
  });

  const [formData, setFormData] = useState({ name: '', nip: '', email: '', subject: '', phone: '', bio: '' });
  const [saved, setSaved] = useState(false);
  const [profileStats, setProfileStats] = useState({ courses: 0, students: 0, attendanceRate: 100 });

  useEffect(() => {
    if (currentUser) setFormData(buildFormData(currentUser));
  }, [currentUser]);

  const fetchProfileStats = React.useCallback(async () => {
    try {
      const coursesData = await api.getCourses().catch(() => []);
      if (!Array.isArray(coursesData)) return { courses: 0, students: 0, attendanceRate: 100 };

      const myCourses = coursesData.filter((c: any) => {
        if (!currentUser) return true;
        if (c.teacher_id && Number(c.teacher_id) === Number(currentUser.id)) return true;
        if (c.teacher && typeof c.teacher === 'object' && Number(c.teacher.id) === Number(currentUser.id)) return true;
        if (c.teacher && typeof c.teacher === 'string' && c.teacher.toLowerCase().includes((currentUser.name || '').toLowerCase())) return true;
        return false;
      });

      let totalStudents = 0;
      myCourses.forEach((c: any) => {
        const count = c.students_count || (Array.isArray(c.students) ? c.students.length : 0);
        totalStudents += count;
      });

      return {
        courses: myCourses.length,
        students: totalStudents,
        attendanceRate: 100
      };
    } catch {
      return { courses: 0, students: 0, attendanceRate: 100 };
    }
  }, [currentUser]);

  const { data: profileStatsData } = useRealtimeData(fetchProfileStats, 60000, [currentUser?.id]);

  useEffect(() => {
    if (profileStatsData) setProfileStats(profileStatsData);
  }, [profileStatsData]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = await api.updateProfile({
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        specialization: formData.subject,
        phone: formData.phone,
        bio: formData.bio
      });

      const updated = (res as any)?.user || (res as any)?.data || res;
      if (updated) {
        const merged = { ...currentUser, ...updated, subject: formData.subject, specialization: formData.subject };
        setCurrentUser(merged);
        setFormData(buildFormData(merged));
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      console.error('Failed to save profile:', e);
      alert('Gagal menyimpan profil: ' + (e.message || 'Terjadi kesalahan'));
    }
  };

  const avatarInitials = formData.name
    ? formData.name.replace(/,.*$/, '').split(' ').filter(Boolean).map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'BK';

  return (
    <DashboardLayout
      role="guru"
      title="Profil Saya"
      subtitle="Kelola informasi pribadi, kontak, dan informasi akademis tenaga pengajar"
    >
      <div className="max-w-6xl mx-auto space-y-8 pb-8">

        {/* Success Toast */}
        {saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Profil pengajar berhasil diperbarui!</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-mono">Tersimpan</span>
          </div>
        )}

        {/* Banner Cover & Header Card */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs relative">
          {/* Top Gradient Banner */}
          <div className="h-44 bg-gradient-to-r from-[#0F172E] via-[#1E293B] to-[#2563EB] relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white text-xs font-medium">
              <Award className="w-4 h-4 text-amber-400" />
              <span>Tenaga Pendidik Bersertifikasi</span>
            </div>
          </div>

          {/* Profile Header Info */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">

              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-5">
                {/* Avatar Box */}
                <div className="-mt-14 sm:-mt-16 relative group shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-3xl sm:text-4xl shadow-xl border-4 border-white font-mono uppercase" suppressHydrationWarning>
                    {avatarInitials}
                  </div>
                  <button
                    type="button"
                    title="Ubah Foto Profil"
                    className="absolute bottom-1.5 right-1.5 p-1.5 rounded-xl bg-slate-900 text-white hover:bg-blue-600 transition shadow-md group-hover:scale-105"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Text Identity Box */}
                <div className="pt-1 sm:pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight" suppressHydrationWarning>{formData.name}</h1>
                    <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0" />
                  </div>
                  <p className="text-xs font-bold text-[#2563EB] mt-0.5" suppressHydrationWarning>{formData.subject}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5" suppressHydrationWarning>{formData.nip}</p>
                </div>
              </div>

              {/* Badges & Status */}
              <div className="flex items-center gap-2 flex-wrap sm:pb-1">
                <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-2xl text-xs border border-emerald-200/80 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Pengajar Aktif
                </span>
                <span className="px-3.5 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs border border-slate-200/80">
                  Wali Kelas XII IPA
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Stats Row (3 Clean Cards: Kelas, Siswa, Kehadiran Mengajar) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 leading-tight" suppressHydrationWarning>{profileStats.courses} Kelas</p>
              <p className="text-xs text-slate-400 font-medium">Kelas Diampu</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 leading-tight" suppressHydrationWarning>{profileStats.students} Siswa</p>
              <p className="text-xs text-slate-400 font-medium">Total Peserta Didik</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 leading-tight" suppressHydrationWarning>{profileStats.attendanceRate}%</p>
              <p className="text-xs text-slate-400 font-medium">Kehadiran Mengajar</p>
            </div>
          </div>
        </div>

        {/* Main Grid: Form Inputs & Academic Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: Form Edit Profil */}
          <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center gap-3 pb-4 mb-6 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Informasi Pribadi & Kontak</h3>
                <p className="text-xs text-slate-400">Perbarui informasi profil yang tampil pada sistem</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Lengkap & Gelar</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">NIP / ID Pengajar</label>
                  <input
                    type="text"
                    readOnly
                    value={formData.nip}
                    className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-mono text-slate-500 cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Email Resmi Sekolah</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 pl-10"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">No. Telepon / WhatsApp</label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 pl-10"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Spesialisasi Mata Pelajaran</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Bio / Deskripsi Pengajar</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/25 transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Academic Credentials & Security */}
          <div className="space-y-6 lg:col-span-5">

            {/* Card Info Akademik Logis & Profesional */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Informasi Akademis</h3>
                  <p className="text-xs text-slate-400">Kualifikasi & Status Kepegawaian</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 font-medium">Pendidikan Terakhir</span>
                  <strong className="text-slate-800 font-bold">S2 Pend. Biologi / Sains</strong>
                </div>
                <div className="flex items-center justify-between py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-medium">Status Kepegawaian</span>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-[11px]">
                    Guru Tetap (PNS)
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-medium">Unit Kerja</span>
                  <strong className="text-slate-800 font-bold">SMA EduSchool</strong>
                </div>
                <div className="flex items-center justify-between py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-medium">Sertifikasi Pendidik</span>
                  <span className="text-emerald-600 font-bold">Sertifikasi Biologi (Lulus)</span>
                </div>
              </div>
            </div>

            {/* Card Keamanan Akun */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Keamanan Akun</h3>
                  <p className="text-xs text-slate-400">Status Sandi & Hak Akses</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Sandi Terenkripsi Sistem</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Untuk alasan keamanan instansi, pengubahan atau reset kata sandi utama akun Guru dikelola secara terpusat melalui Administrator Sistem.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
