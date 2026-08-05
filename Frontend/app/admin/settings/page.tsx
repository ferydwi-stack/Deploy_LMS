'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Save, CheckCircle2, Building2, Calendar, Mail, Bell, ShieldCheck } from 'lucide-react';

export default function AdminSettingsPage() {
  const [schoolName, setSchoolName] = useState('SMA EduSchool Nusantara');
  const [adminEmail, setAdminEmail] = useState('admin@eduschool.sch.id');
  const [academicYear, setAcademicYear] = useState('2025/2026');
  const [semester, setSemester] = useState('Ganjil');
  const [allowStudentSelfEnroll, setAllowStudentSelfEnroll] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout
      role="admin"
      title="Pengaturan Platform"
      subtitle="Konfigurasi profil sekolah, tahun ajaran aktif, dan preferensi sistem EduSchool"
    >
      <div className="max-w-4xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Toast Alert */}
          {saved && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Pengaturan platform berhasil disimpan!</span>
            </div>
          )}

          {/* Section 1: Pengaturan Tahun Ajaran & Semester */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Tahun Ajaran & Semester Aktif</h2>
                <p className="text-xs text-slate-400 font-medium">Tentukan kalender akademik aktif untuk periode pembelajaran</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Tahun Ajaran</label>
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="2024/2025">2024/2025</option>
                  <option value="2025/2026">2025/2026 (Aktif)</option>
                  <option value="2026/2027">2026/2027</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Semester Aktif</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="Ganjil">Semester Ganjil</option>
                  <option value="Genap">Semester Genap</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Profil Instansi Sekolah */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Identitas Instansi Sekolah</h2>
                <p className="text-xs text-slate-400 font-medium">Informasi resmi lembaga dan kontak administrator utama</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Nama Resmi Sekolah</label>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2">Email Administrator Utama</label>
                <input
                  type="email"
                  required
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Preferensi Akses & Notifikasi */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Hak Akses & Notifikasi</h2>
                <p className="text-xs text-slate-400 font-medium">Atur izin pendaftaran mandiri siswa dan pengiriman email</p>
              </div>
            </div>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-100/60 transition">
                <div>
                  <p className="text-xs font-bold text-slate-900">Pendaftaran Mandiri Siswa</p>
                  <p className="text-[11px] text-slate-400 font-medium">Izinkan siswa mencari & mendaftar kelas buatan guru secara mandiri</p>
                </div>
                <input
                  type="checkbox"
                  checked={allowStudentSelfEnroll}
                  onChange={(e) => setAllowStudentSelfEnroll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 bg-[#F8FAFC] border border-slate-100 rounded-2xl cursor-pointer hover:bg-slate-100/60 transition">
                <div>
                  <p className="text-xs font-bold text-slate-900">Notifikasi Email Otomatis</p>
                  <p className="text-[11px] text-slate-400 font-medium">Kirim pengingat email otomatis untuk pengumuman & tenggat tugas</p>
                </div>
                <input
                  type="checkbox"
                  checked={emailNotifications}
                  onChange={(e) => setEmailNotifications(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-md focus:ring-blue-500"
                />
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-3.5 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/25 transition flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
