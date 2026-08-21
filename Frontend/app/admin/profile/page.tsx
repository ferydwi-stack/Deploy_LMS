'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { api, setCurrentUser } from '@/lib/api';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Save,
  Users,
  GraduationCap,
  UserCheck,
  Building,
  BookOpen,
  Cloud,
  Sparkles,
  Key
} from 'lucide-react';

export default function AdminProfilePage() {
  const { user: rawUser } = useAuth();
  const currentUser = (rawUser as any)?.user || (rawUser as any)?.data || rawUser;

  const buildFormData = (u: any) => ({
    name: u?.name || '',
    nip: u?.nisn_or_nip || u?.nip || '100001',
    email: u?.email || '',
    phone: u?.phone || '',
    bio: u?.bio || 'Administrator Utama Platform EduSchool',
    password: '',
    password_confirmation: ''
  });

  const [formData, setFormData] = useState({
    name: '',
    nip: '100001',
    email: '',
    phone: '',
    bio: '',
    password: '',
    password_confirmation: ''
  });

  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [adminStats, setAdminStats] = useState({
    users: 0,
    teachers: 0,
    students: 0,
    courses: 0
  });

  // Load user data into form
  useEffect(() => {
    if (currentUser) {
      setFormData(buildFormData(currentUser));
    }
  }, [currentUser]);

  // Robust Fetch Stats (using stats endpoint + fallback to users/courses)
  const fetchAdminStats = useCallback(async () => {
    try {
      // 1. Try fast stats API
      const statsRes = await api.getAdminStats().catch(() => null);
      if (statsRes && statsRes.total_users !== undefined) {
        return {
          users: Number(statsRes.total_users || 0),
          teachers: Number(statsRes.total_teachers || 0),
          students: Number(statsRes.total_students || 0),
          courses: Number(statsRes.total_courses || 0),
        };
      }

      // 2. Fallback: query users and courses directly
      const [usersData, coursesData] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getCourses().catch(() => [])
      ]);

      const usersList = Array.isArray(usersData) ? usersData : ((usersData as any)?.users || []);
      const coursesList = Array.isArray(coursesData) ? coursesData : ((coursesData as any)?.courses || []);

      const teachers = usersList.filter((u: any) => String(u.role).toLowerCase() === 'guru' || String(u.role).toLowerCase() === 'teacher').length;
      const students = usersList.filter((u: any) => String(u.role).toLowerCase() === 'siswa' || String(u.role).toLowerCase() === 'student').length;

      return {
        users: usersList.length,
        teachers,
        students,
        courses: coursesList.length
      };
    } catch {
      return { users: 0, teachers: 0, students: 0, courses: 0 };
    }
  }, []);

  const { data: statsData } = useRealtimeData(fetchAdminStats, 30000, []);

  useEffect(() => {
    if (statsData) {
      setAdminStats(statsData);
    }
  }, [statsData]);

  // Fetch initial profile if missing
  useEffect(() => {
    const fetchMe = async () => {
      try {
        const meData = await api.me();
        const userObj = (meData as any)?.user || (meData as any)?.data || meData;
        if (userObj) {
          setCurrentUser(userObj);
          setFormData(buildFormData(userObj));
        }
      } catch (e) {
        console.warn('Silent fail me() in profile:', e);
      }
    };
    fetchMe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSaved(false);

    if (formData.password && formData.password !== formData.password_confirmation) {
      setErrorMsg('Konfirmasi password baru tidak cocok.');
      return;
    }

    setSubmitting(true);

    try {
      const payload: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        nisn_or_nip: formData.nip
      };

      if (formData.password) {
        payload.password = formData.password;
        payload.password_confirmation = formData.password_confirmation;
      }

      const res = await api.updateProfile(payload);

      const updated = (res as any)?.user || (res as any)?.data || res;
      if (updated) {
        const merged = { ...currentUser, ...updated };
        setCurrentUser(merged);
        setFormData(buildFormData(merged));
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (err: any) {
      console.error('Gagal memperbarui profil admin:', err);
      setErrorMsg(err.message || 'Gagal menyimpan perubahan profil.');
    } finally {
      setSubmitting(false);
    }
  };

  const userInitials = (formData.name || currentUser?.name || 'Administrator')
    .split(' ')
    .filter(Boolean)
    .map((n: string) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'AL';

  return (
    <DashboardLayout
      role="admin"
      title="Profil Saya"
      subtitle="Kelola informasi akun Super Administrator, kontak resmi, dan status sistem"
    >
      <div className="max-w-6xl mx-auto space-y-6 pb-8">
        
        {/* Banner Cover & Header Card */}
        <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs relative">
          {/* Top Gradient Banner */}
          <div className="h-44 bg-gradient-to-r from-[#4C1D95] via-[#6D28D9] to-[#2563EB] relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0f_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0f_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 text-white text-xs font-medium">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Super Administrator System</span>
            </div>
          </div>

          {/* Profile Header Info */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 relative">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 sm:gap-5">
                {/* Avatar Box */}
                <div className="-mt-14 sm:-mt-16 relative group shrink-0">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#6D28D9] to-[#4F46E5] text-white flex items-center justify-center font-bold text-3xl sm:text-4xl shadow-xl border-4 border-white font-mono uppercase">
                    {userInitials}
                  </div>
                </div>

                {/* Text Identity Box */}
                <div className="pt-1 sm:pb-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
                      {formData.name || currentUser?.name || 'Administrator LMS'}
                    </h1>
                    <ShieldCheck className="w-5 h-5 text-[#6D28D9] shrink-0" />
                  </div>
                  <p className="text-xs font-bold text-[#6D28D9]">Super Administrator</p>
                  <p className="text-[11px] text-slate-400 font-mono">{formData.email || currentUser?.email || 'admin@eduschool.sch.id'}</p>
                </div>
              </div>

              {/* Badges & Status */}
              <div className="flex items-center gap-2 flex-wrap sm:pb-1">
                <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 font-bold rounded-2xl text-xs border border-emerald-200/80 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Admin Aktif (Online)
                </span>
                <span className="px-3.5 py-1.5 bg-purple-50 text-[#6D28D9] font-bold rounded-2xl text-xs border border-purple-200/80">
                  Full Access
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 4 Mini Cards Realtime Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 leading-tight" suppressHydrationWarning>{adminStats.users}</p>
              <p className="text-xs text-slate-400 font-medium">Total Pengguna</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-[#6D28D9] flex items-center justify-center shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 leading-tight" suppressHydrationWarning>{adminStats.teachers}</p>
              <p className="text-xs text-slate-400 font-medium">Guru Terdaftar</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 leading-tight" suppressHydrationWarning>{adminStats.students}</p>
              <p className="text-xs text-slate-400 font-medium">Siswa Terdaftar</p>
            </div>
          </div>

          <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-slate-900 leading-tight" suppressHydrationWarning>{adminStats.courses}</p>
              <p className="text-xs text-slate-400 font-medium">Total Kelas Aktif</p>
            </div>
          </div>
        </div>

        {/* Form Notifications */}
        {saved && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-3 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>Profil Administrator berhasil diperbarui dan disinkronkan!</span>
          </div>
        )}

        {errorMsg && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-2xl">
            {errorMsg}
          </div>
        )}

        {/* Main Grid: Form Inputs (Left) & Privilege Cards (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form Edit Profil & Ganti Password */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Informasi Pribadi & Kontak</h2>
                  <p className="text-xs text-slate-400 font-medium">Perbarui informasi profil yang tampil pada sistem</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 pl-10"
                      placeholder="Nama Administrator"
                    />
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">NIP / ID Administrator</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.nip}
                      onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                      className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 pl-10"
                      placeholder="100001"
                    />
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Email Resmi</label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 pl-10 font-mono"
                        placeholder="admin@lms.com"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">No. Telepon / WhatsApp</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 pl-10 font-mono"
                        placeholder="081234567890"
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Bio / Deskripsi</label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    className="w-full p-4 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                    placeholder="Deskripsi peran Super Administrator..."
                  />
                </div>
              </div>

              {/* Ganti Password */}
              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-500" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ubah Kata Sandi (Opsional)</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Password Baru</label>
                    <input
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                      placeholder="Minimal 6 karakter..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">Konfirmasi Password Baru</label>
                    <input
                      type="password"
                      value={formData.password_confirmation}
                      onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                      className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                      placeholder="Ulangi password..."
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4 border-t border-slate-100">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3.5 bg-[#2563EB] hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/25 transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{submitting ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Privilege & Online Service Status */}
          <div className="space-y-6 lg:col-span-5">
            
            {/* Card Hak Akses Administrator */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#6D28D9] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Hak Akses Administrator</h3>
                  <p className="text-xs text-slate-400">Status & Privilege Sistem</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between py-1">
                  <span className="text-slate-400 font-medium">Role Sistem</span>
                  <span className="px-2.5 py-0.5 bg-purple-50 text-[#6D28D9] font-bold rounded-lg text-[11px] font-mono">
                    SUPER ADMIN
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-medium">Status Akun</span>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-lg text-[11px]">
                    Aktif Terverifikasi
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-medium">Total Pengguna</span>
                  <span className="text-slate-800 font-bold font-mono">{adminStats.users} Terdaftar</span>
                </div>

                <div className="flex items-center justify-between py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-medium">Total Kelas</span>
                  <span className="text-blue-600 font-bold font-mono">{adminStats.courses} Kelas Aktif</span>
                </div>

                <div className="flex items-center justify-between py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-medium">Layanan Cloud</span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Cloud API Connected
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-medium">Status Server</span>
                  <span className="text-slate-800 font-bold">Online Production</span>
                </div>
              </div>
            </div>

            {/* Card Keamanan Sistem */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Hak Istimewa Super Admin</h3>
                  <p className="text-xs text-slate-400">Kewenangan Penuh Tata Kelola</p>
                </div>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-2 text-xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Manajemen Pengguna & Penilaian</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Super Administrator memiliki otorisasi penuh untuk menambah/mengedit akun, mereset kata sandi pengguna, mengunggah akun secara massal via Excel, serta melihat rekapitulasi nilai seluruh sekolah.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
