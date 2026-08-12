'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FileEdit, Clock, Award, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { api } from '@/lib/api';

export default function SiswaAssignmentsPage() {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<any[]>([]);

  const { data: assignmentsData } = useRealtimeData(
    async () => {
      if (!user) return [];
      const data = await api.getAssignments().catch(() => []);
      return Array.isArray(data) ? data : [];
    },
    60000,
    [user?.id]
  );

  useEffect(() => {
    if (assignmentsData && Array.isArray(assignmentsData)) {
      setAssignments(assignmentsData);
    }
  }, [assignmentsData]);

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

        {assignments.length === 0 ? (
          <div className="text-center py-12">
            <FileEdit className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Belum ada tugas tersedia</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assignments.map((item: any) => (
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
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{item.course?.title || 'Kelas'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-right">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tenggat</p>
                    <p className="text-xs font-bold text-slate-700 mt-0.5">
                      {item.deadline ? new Date(item.deadline).toLocaleString('id-ID') : '-'}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100/70 text-amber-700">
                    Belum Dikumpul
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
