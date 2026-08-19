'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, User, Mail, Lock, Key, CheckCircle2, ChevronDown } from 'lucide-react';

export default function AdminEditUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: 'Ahmad Fauzi, S.Pd',
    email: 'fauzi.guru@edulearn.id',
    nip: '198506122010011005',
    role: 'guru',
    gender: 'Laki-laki',
    phone: '081298765432',
    address: 'Jl. Merdeka No. 45, Jakarta Selatan',
    status: 'Aktif',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/admin/users');
  };

  return (
    <DashboardLayout role="admin" title="Edit Data User" subtitle="Pembaruan profil dan kredensial akun pengguna">
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
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Perbarui Data Akun</h2>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded-md uppercase">
              {formData.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Nama Lengkap *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                NIP / NIS *
              </label>
              <input
                type="text"
                required
                value={formData.nip}
                onChange={(e) => setFormData({ ...formData, nip: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
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
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition appearance-none pr-10"
                >
                  <option className="bg-white text-slate-900" value="guru">Guru / Pengajar</option>
                  <option className="bg-white text-slate-900" value="siswa">Siswa / Pelajar</option>
                  <option className="bg-white text-slate-900" value="admin">Administrator</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Key className="w-4 h-4 text-indigo-600" />
              <span>Reset Password (Opsional)</span>
            </h3>
            <p className="text-[11px] text-slate-500">Biarkan kosong jika tidak ingin mengubah kata sandi akun ini.</p>
            <input
              type="password"
              placeholder="Masukkan password baru..."
              className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
              <span>Simpan Perubahan</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
