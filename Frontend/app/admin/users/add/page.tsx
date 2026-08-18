'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Mail, Lock, Shield, Phone, MapPin, CheckCircle2, ChevronDown } from 'lucide-react';

export default function AdminAddUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    nip: '',
    role: 'guru',
    gender: 'Laki-laki',
    phone: '',
    address: '',
    status: 'Aktif',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/admin/users');
  };

  return (
    <DashboardLayout role="admin" title="Tambah User Baru" subtitle="Formulir pendaftaran akun pengguna baru">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/admin/users"
            className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 p-2 rounded-xl bg-white border border-slate-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke User Management</span>
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8 space-y-6">
          <h2 className="text-base font-bold text-slate-900 pb-3 border-b border-slate-100">Informasi Akun</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Lengkap *
              </label>
              <input
                type="text"
                required
                placeholder="Contoh: Dr. Budi Prasetyo, M.Pd"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email *
              </label>
              <input
                type="email"
                required
                placeholder="user@edulearn.id"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                NIP / NIS *
              </label>
              <input
                type="text"
                required
                placeholder="19820315..."
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Role Pengguna *
              </label>
<div className="relative">
<select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition appearance-none pr-10"
              >
                <option className="bg-white text-slate-900" value="guru">Guru / Pengajar</option>
                <option className="bg-white text-slate-900" value="siswa">Siswa / Pelajar</option>
                <option className="bg-white text-slate-900" value="admin">Administrator</option>
              </select>
<ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Jenis Kelamin
              </label>
<div className="relative">
<select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition appearance-none pr-10"
              >
                <option className="bg-white text-slate-900" value="Laki-laki">Laki-laki</option>
                <option className="bg-white text-slate-900" value="Perempuan">Perempuan</option>
              </select>
<ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
</div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                No. Telepon / Whatsapp
              </label>
              <input
                type="text"
                placeholder="08123456789"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Alamat Lengkap
            </label>
            <textarea
              rows={3}
              placeholder="Alamat rumah / domisili..."
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              href="/admin/users"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Simpan User Baru</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
