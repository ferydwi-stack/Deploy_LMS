'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Download, Calendar, CheckCircle2, UserCheck, Users, Printer, FileSpreadsheet } from 'lucide-react';

export default function AdminReportsPage() {
  const [range, setRange] = useState('minggu');
  const [downloadNotice, setDownloadNotice] = useState('');

  const reportData = [
    { class: 'Kelas X-IPA 1', teacher: 'Alexandra Chen, M.Pd', total: 32, hadir: 30, izin: 1, sakit: 1, alpa: 0, percent: '93.75%' },
    { class: 'Kelas XI-IPA 2', teacher: 'Noah Bergmann, S.Si', total: 28, hadir: 27, izin: 1, sakit: 0, alpa: 0, percent: '96.4%' },
    { class: 'Kelas XII-IPA 1', teacher: 'Ingrid Svensson, M.Si', total: 30, hadir: 28, izin: 0, sakit: 2, alpa: 0, percent: '93.3%' },
    { class: 'Staf Pengajar (Guru)', teacher: 'Seluruh Pengajar', total: 4, hadir: 4, izin: 0, sakit: 0, alpa: 0, percent: '100%' },
  ];

  const handleExport = (type: string) => {
    setDownloadNotice(`Laporan Kehadiran (${type.toUpperCase()}) berhasil di-generate dan diunduh!`);
    setTimeout(() => setDownloadNotice(''), 3000);
  };

  return (
    <DashboardLayout
      role="admin"
      title="Laporan & Presensi Global"
      subtitle="Rekapitulasi persentase kehadiran harian siswa dan guru di seluruh sekolah"
    >
      {/* Toast Notification */}
      {downloadNotice && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs text-center flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">Kehadiran Siswa</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-4xl font-extrabold text-[#10B981] tracking-tight mb-1">94.5%</p>
          <p className="text-xs text-slate-400 font-medium">Kumulatif seluruh tingkat kelas</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs text-center flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">Kehadiran Staf Guru</span>
            <UserCheck className="w-4 h-4 text-[#2563EB]" />
          </div>
          <p className="text-4xl font-extrabold text-[#2563EB] tracking-tight mb-1">100%</p>
          <p className="text-xs text-slate-400 font-medium">Pengajar hadir sesuai jadwal</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs text-center flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">Hari Efektif Belajar</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-4xl font-extrabold text-purple-600 tracking-tight mb-1">22 Hari</p>
          <p className="text-xs text-slate-400 font-medium">Periode Bulan Berjalan</p>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Rekapitulasi Kehadiran per Kelas</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Filter berdasarkan rentang waktu dan unduh laporan resmi</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Rentang Filter */}
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="minggu">Minggu Ini</option>
              <option value="bulan">Bulan Ini</option>
              <option value="semester">Semester Ini</option>
            </select>

            {/* Export Actions */}
            <button
              onClick={() => handleExport('excel')}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-2xl border border-emerald-200/80 transition flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={() => handleExport('pdf')}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-2xl border border-rose-200/80 transition flex items-center gap-2"
            >
              <Printer className="w-4 h-4 text-rose-600" />
              <span>Cetak PDF</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
              <tr>
                <th className="py-4 px-6">Grup / Kelas</th>
                <th className="py-4 px-6">Wali Kelas / Penanggung Jawab</th>
                <th className="py-4 px-6 text-center">Hadir</th>
                <th className="py-4 px-6 text-center">Izin</th>
                <th className="py-4 px-6 text-center">Sakit</th>
                <th className="py-4 px-6 text-center">Alpa</th>
                <th className="py-4 px-6 text-right">Persentase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reportData.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition">
                  <td className="py-4 px-6 font-bold text-slate-900">{row.class}</td>
                  <td className="py-4 px-6 text-slate-600 font-medium">{row.teacher}</td>
                  <td className="py-4 px-6 text-center font-bold text-emerald-600">{row.hadir}</td>
                  <td className="py-4 px-6 text-center font-bold text-blue-600">{row.izin}</td>
                  <td className="py-4 px-6 text-center font-bold text-amber-600">{row.sakit}</td>
                  <td className="py-4 px-6 text-center font-bold text-rose-600">{row.alpa}</td>
                  <td className="py-4 px-6 text-right">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full font-mono">
                      {row.percent}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
