'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
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
  GraduationCap, 
  Briefcase, 
  Building,
  Save,
  Star,
  Users,
  CalendarCheck,
  FileCheck2
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api, setCurrentUser } from '@/lib/api';

export default function SiswaProfilePage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    nis: '',
    email: '',
    class: '',
    phone: '',
    bio: ''
  });

  const [saved, setSaved] = useState(false);
  const [profileStats, setProfileStats] = useState({
    avgScore: 0,
    attendancePercent: 0,
    coursesCount: 0,
    submissionPercent: 0
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        nis: user.nisn_or_nip || '',
        email: user.email || '',
        class: user.specialization || '',
        phone: user.phone || '',
        bio: user.bio || ''
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [myCoursesData, myAttendancesData, mySubmissionsData] = await Promise.all([
          api.getCourses().catch(() => []),
          api.getMyAttendances().catch(() => []),
          api.getMySubmissions().catch(() => [])
        ]);

        const coursesCount = Array.isArray(myCoursesData) ? myCoursesData.length : 0;

        const attendances = Array.isArray(myAttendancesData) ? myAttendancesData : [];
        const presentCount = attendances.filter((a: any) => String(a.status).toLowerCase() === 'hadir').length;
        const attendancePercent = attendances.length > 0 ? Math.round((presentCount / attendances.length) * 100) : 0;

        const submissions = Array.isArray(mySubmissionsData) ? mySubmissionsData : [];
        const scoredSubs = submissions.filter((s: any) => s.score !== null && s.score !== undefined);
        const avgScore = scoredSubs.length > 0 
          ? Math.round(scoredSubs.reduce((acc: number, s: any) => acc + Number(s.score), 0) / scoredSubs.length * 10) / 10
          : 0;

        const allAssignments = await api.getAllAssignments?.().catch(() => []);
        const totalAssignments = Array.isArray(allAssignments) ? allAssignments.length : submissions.length;
        const submissionPercent = totalAssignments > 0 ? Math.round((submissions.length / totalAssignments) * 100) : 100;

        setProfileStats({
          avgScore,
          attendancePercent,
          coursesCount,
          submissionPercent
        });
      } catch (e) {
        console.error('Failed to fetch profile stats:', e);
      }
    };

    if (user) {
      fetchStats();
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.updateProfile(formData);
      const updated = (res as any)?.user || (res as any)?.data || res;
      if (updated) {
        const merged = { ...user, ...updated };
        setCurrentUser(merged);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    <DashboardLayout
      role="siswa"
      title="Profil Saya"
      subtitle="Kelola informasi akun pribadi, kontak, dan kartu identitas siswa"
    >
      <div className="max-w-6xl mx-auto space-y-8 pb-8">
        
        {/* Success Toast */}
        {saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Profil siswa berhasil diperbarui!</span>
            </div>
            <span className="text-[11px] text-emerald-600 font-mono">Tersimpan</span>
          </div>
        )}

        {/* Banner Cover & Header Card */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs relative">
          {/* Top Gradient Banner */}
          <div className="h-44 bg-gradient-to-r from-[#0F172E] via-[#0D9488] to-[#2563EB] relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white text-xs font-medium">
              <GraduationCap className="w-4 h-4 text-emerald-400" />
              <span>Peserta Didik Terdaftar</span>
            </div>
          </div>

          {/* Profile Header Info */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-5">
                {/* Avatar Box (Only avatar has negative margin) */}
                <div className="-mt-14 sm:-mt-16 relative group shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[#10B981] text-white flex items-center justify-center font-bold text-3xl sm:text-4xl shadow-xl border-4 border-white">
                    {formData.name?.split(' ').map(n => n[0]).join('') || 'US'}
                  </div>
                  <button
                    type="button"
                    title="Ubah Foto Profil"
                    className="absolute bottom-1.5 right-1.5 p-1.5 rounded-xl bg-slate-900 text-white hover:bg-emerald-600 transition shadow-md group-hover:scale-105"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Text Identity Box */}
                <div className="pt-1 sm:pb-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-tight">{formData.name || 'Siswa'}</h1>
                    <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  </div>
                  <p className="text-xs font-bold text-[#10B981] mt-0.5">{formData.class}</p>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">{formData.nis}</p>
                </div>
              </div>

              {/* Badges & Status */}
              <div className="flex items-center gap-2 flex-wrap sm:pb-1">
                <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-2xl text-xs border border-emerald-200/80 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Siswa Aktif
                </span>
                <span className="px-3.5 py-1.5 bg-slate-100 text-slate-700 font-bold rounded-2xl text-xs border border-slate-200/80">
                  Tingkat SMA
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900" suppressHydrationWarning>{profileStats.avgScore || '-'}</p>
              <p className="text-[11px] text-slate-400 font-medium">Rata-rata Nilai</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <CalendarCheck className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900" suppressHydrationWarning>{profileStats.attendancePercent}%</p>
              <p className="text-[11px] text-slate-400 font-medium">Kehadiran</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900" suppressHydrationWarning>{profileStats.coursesCount} Kelas</p>
              <p className="text-[11px] text-slate-400 font-medium">Kelas Yang Diikuti</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-extrabold text-slate-900" suppressHydrationWarning>{profileStats.submissionPercent}%</p>
              <p className="text-[11px] text-slate-400 font-medium">Tugas Terkumpul</p>
            </div>
          </div>
        </div>

        {/* Main Content Two-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Form Edit Information */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Informasi Pribadi & Akun Siswa</h2>
                    <p className="text-xs text-slate-400 font-medium">Perbarui informasi profil dan kontak Anda</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Lengkap Siswa</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">NIS (Nomor Induk Siswa)</label>
                    <input
                      type="text"
                      disabled
                      value={formData.nis}
                      className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-mono text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">Email Siswa</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 pl-10"
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
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 pl-10"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Kelas & Angkatan</label>
                  <input
                    type="text"
                    required
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Bio / Moto Pembelajaran</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-600 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  className="px-6 py-3.5 bg-[#10B981] hover:bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-500/25 transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Profil Siswa</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Academic Summary & Security Info */}
          <div className="space-y-6">
            
            {/* Card Info Kartu Pelajar */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Kartu Pelajar Digital</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Status & Identitas Sekolah</p>
                </div>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-2xl">
                  <span className="text-slate-500 font-medium">Kelas / Rombel</span>
                  <span className="font-bold text-slate-800">{user?.class_name || formData.class || user?.specialization || 'Siswa Reguler'}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-2xl">
                  <span className="text-slate-500 font-medium">Kelas Diikuti</span>
                  <span className="font-bold text-slate-800 font-mono">{profileStats.coursesCount} Kelas</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-2xl">
                  <span className="text-slate-500 font-medium">Status Akun</span>
                  <span className="font-bold text-emerald-600">Aktif Terdaftar</span>
                </div>
              </div>
            </div>

            {/* Card Keamanan Akun */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Keamanan Kata Sandi</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Akses Akun Siswa</p>
                </div>
              </div>

              <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-2 text-xs text-amber-900">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Sandi Terenkripsi Aman</span>
                </div>
                <p className="text-[11px] text-amber-700/90 leading-relaxed font-medium">
                  Pengubahan kata sandi akun Siswa hanya dapat dilakukan oleh Administrator Sekolah demi keamanan data akademis Anda.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
