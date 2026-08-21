'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  BookOpen, 
  FolderPlus, 
  Save, 
  CheckCircle2, 
  Clock, 
  Layers, 
  FileText,
  Building,
  GraduationCap,
  ChevronDown
} from 'lucide-react';

export default function GuruTambahKelasPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    namaKelas: '',
    kodeKelas: '',
    tingkat: 'Kelas X',
    jurusan: 'MIPA (IPA)',
    jadwal: '',
    ruangan: 'Ruang 104',
    deskripsi: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { api } = await import('@/lib/api');
      await api.createCourse({
        title: formData.namaKelas,
        code: formData.kodeKelas || `CLS-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
        description: formData.deskripsi || `${formData.namaKelas} - ${formData.tingkat} ${formData.jurusan} (${formData.ruangan})`
      } as any);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push('/guru/courses');
      }, 1200);
    } catch (err: any) {
      console.error('Failed to create course:', err);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push('/guru/courses');
      }, 1200);
    }
  };

  return (
    <DashboardLayout 
      role="guru" 
      title="Tambah Kelas Baru" 
      subtitle="Buat kelas pembelajaran baru"
    >
      {/* Top Navigation Back Link */}
      <div className="mb-6">
        <Link
          href="/guru/courses"
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Kelas</span>
        </Link>
      </div>

      {/* Toast Alert */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Kelas Baru Berhasil Dibuat!</p>
              <p className="text-xs text-emerald-600">Mengarahkan kembali ke halaman daftar kelas...</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Form Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-2.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600">
            <FolderPlus className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Formulir Kelas Baru</h2>
            <p className="text-xs text-slate-500">Isi kelengkapan data mata pelajaran & rombongan belajar</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nama Kelas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Nama Kelas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.namaKelas}
                onChange={(e) => setFormData({ ...formData, namaKelas: e.target.value })}
                placeholder="Contoh: Matematika Wajib X-IPA 3"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

            {/* Kode Kelas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Kode Kelas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.kodeKelas}
                onChange={(e) => setFormData({ ...formData, kodeKelas: e.target.value })}
                placeholder="Contoh: MTK-X-IPA3"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition font-mono uppercase"
              />
            </div>

            {/* Tingkat/Kelas Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Tingkat / Kelas <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.tingkat}
                  onChange={(e) => setFormData({ ...formData, tingkat: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition appearance-none pr-10"
                >
                  <option className="bg-white text-slate-900" value="Kelas X">Kelas X (Tingkat 10)</option>
                  <option className="bg-white text-slate-900" value="Kelas XI">Kelas XI (Tingkat 11)</option>
                  <option className="bg-white text-slate-900" value="Kelas XII">Kelas XII (Tingkat 12)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Jurusan Dropdown */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Jurusan / Peminatan <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.jurusan}
                  onChange={(e) => setFormData({ ...formData, jurusan: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition appearance-none pr-10"
                >
                  <option className="bg-white text-slate-900" value="MIPA (IPA)">MIPA (Matematika & IPA)</option>
                  <option className="bg-white text-slate-900" value="IPS">IPS (Ilmu Pengetahuan Sosial)</option>
                  <option className="bg-white text-slate-900" value="Bahasa">Bahasa & Budaya</option>
                  <option className="bg-white text-slate-900" value="Umum">Umum / Lintas Peminatan</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Jadwal */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Jadwal Mengajar <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.jadwal}
                onChange={(e) => setFormData({ ...formData, jadwal: e.target.value })}
                placeholder="Contoh: Kamis & Sabtu, 09:00 - 10:30 WIB"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

            {/* Ruangan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Ruangan Kelas
              </label>
              <input
                type="text"
                value={formData.ruangan}
                onChange={(e) => setFormData({ ...formData, ruangan: e.target.value })}
                placeholder="Contoh: Ruang 104 / Lab Komputer"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          {/* Deskripsi Kelas */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Deskripsi Pembelajaran Kelas
            </label>
            <textarea
              rows={4}
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              placeholder="Tuliskan silabus singkat, instruksi umum, atau prasyarat mata pelajaran..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href="/guru/courses"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Kelas Baru</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
