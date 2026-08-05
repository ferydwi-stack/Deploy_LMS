'use client';

import React from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FileEdit } from 'lucide-react';

export default function SiswaAssignmentsPage() {
  const assignments = [
    {
      id: '1',
      title: 'Tugas Persamaan Kuadrat',
      course: 'Matematika - X IPA 1',
      deadline: '2026-07-20 23:59',
      status: 'Belum Dikumpul',
      statusClass: 'bg-amber-100/70 text-amber-700'
    },
    {
      id: '2',
      title: 'Latihan Grafis Parabola',
      course: 'Matematika - X IPA 1',
      deadline: '2026-07-25 12:00',
      status: 'Sudah Dikumpul',
      statusClass: 'bg-emerald-100/70 text-emerald-700'
    }
  ];

  return (
    <DashboardLayout
      role="siswa"
      title="Assignments / Tugas"
      subtitle="Daftar lembar kerja, ujian, dan tugas mandiri"
    >
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Daftar Tugas Aktif</h2>
          <span className="px-3.5 py-1.5 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs">
            Tahun Ajaran 2026/2027
          </span>
        </div>

        <div className="space-y-4">
          {assignments.map((item) => (
            <div
              key={item.id}
              className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-5 flex items-center justify-between gap-4 hover:bg-slate-100/60 transition"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <FileEdit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">{item.title}</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">{item.course}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tenggat</p>
                  <p className="text-xs font-bold text-slate-700 mt-0.5">{item.deadline}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.statusClass}`}>
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
