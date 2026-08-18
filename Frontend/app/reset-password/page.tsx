'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GraduationCap, Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [success, setSuccess] = useState(false);

  if (!email || !token) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-4">
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-sm font-semibold text-red-600">
          Tautan reset password tidak valid. Parameter email atau token tidak ditemukan.
        </div>
        <a
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/25 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Login
        </a>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (password.length < 8) {
      setErrorMsg('Password minimal 8 karakter.');
      return;
    }
    if (password !== passwordConfirmation) {
      setErrorMsg('Konfirmasi password tidak cocok.');
      return;
    }

    setLoading(true);
    try {
      await api.resetPassword({ email, token, password, password_confirmation: passwordConfirmation });
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal mereset password. Tautan mungkin sudah kadaluarsa.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto text-center space-y-5">
        <div className="flex justify-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-slate-900">Password Berhasil Direset</h2>
        <p className="text-sm text-slate-500 font-medium">Silakan login menggunakan password baru Anda.</p>
        <a
          href="/login"
          className="inline-flex items-center gap-2 px-5 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/25 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Login
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reset Password</h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">Masukkan password baru untuk akun <strong className="text-slate-700">{email}</strong>.</p>
        {errorMsg && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600">
            {errorMsg}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="reset-password" className="block text-xs font-bold text-slate-700 mb-1.5">Password Baru</label>
          <div className="relative">
            <input
              id="reset-password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={8}
              placeholder="Minimal 8 karakter"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition shadow-xs pl-10 pr-10 font-medium"
            />
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" aria-hidden="true" />
            <button
              type="button"
              aria-label={showPassword ? 'Sembunyikan Password' : 'Tampilkan Password'}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-800 p-0.5 rounded-lg focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="reset-confirm" className="block text-xs font-bold text-slate-700 mb-1.5">Konfirmasi Password</label>
          <div className="relative">
            <input
              id="reset-confirm"
              type={showConfirm ? 'text' : 'password'}
              required
              minLength={8}
              placeholder="Ulangi password baru"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              className="w-full px-4 py-3.5 bg-white border border-slate-300 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition shadow-xs pl-10 pr-10 font-medium"
            />
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" aria-hidden="true" />
            <button
              type="button"
              aria-label={showConfirm ? 'Sembunyikan Konfirmasi' : 'Tampilkan Konfirmasi'}
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3.5 top-3.5 text-slate-500 hover:text-slate-800 p-0.5 rounded-lg focus:outline-none"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-2 mt-4 disabled:opacity-50 cursor-pointer"
        >
          {loading ? 'Menyimpan...' : 'Reset Password'}
        </button>
      </form>

      <div className="mt-5 text-center">
        <a href="/login" className="text-xs font-bold text-[#1D4ED8] hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Kembali ke Login
        </a>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen w-full bg-[#F8FAFC] flex flex-col items-center justify-center font-sans p-6">
      <div className="mb-8 flex items-center gap-3.5">
        <div className="w-11 h-11 bg-[#2563EB] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/25 shrink-0">
          <GraduationCap className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-extrabold text-slate-900 text-xl tracking-tight leading-tight">EduSchool</h1>
          <p className="text-xs text-[#1D4ED8] font-bold">School Platform</p>
        </div>
      </div>
      <Suspense fallback={<div className="text-sm text-slate-500">Memuat...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}
