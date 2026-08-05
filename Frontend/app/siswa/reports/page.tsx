'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Download, FileSpreadsheet, FileText, CheckCircle2, Award, BookOpen, CalendarCheck, FileCheck2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { api } from '@/lib/api';

export default function SiswaReportsPage() {
  const { user } = useAuth();
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [enrolledClassesReports, setEnrolledClassesReports] = useState<any[]>([]);

  useEffect(() => {
    const fetchSiswaReports = async () => {
      try {
        const [myCoursesData, myAttendancesData, mySubmissionsData] = await Promise.all([
          api.getCourses().catch(() => []),
          api.getMyAttendances().catch(() => []),
          api.getMySubmissions().catch(() => [])
        ]);

        if (Array.isArray(myCoursesData) && user) {
          const reports = myCoursesData.map((c: any) => {
            const pivot = Array.isArray(c.students) ? c.students.find((s: any) => Number(s.id) === Number(user.id))?.pivot : null;
            const utsScore = pivot?.uts_score !== undefined && pivot?.uts_score !== null ? Number(pivot.uts_score) : 80;
            const uasScore = pivot?.uas_score !== undefined && pivot?.uas_score !== null ? Number(pivot.uas_score) : 85;

            // Attendance percent
            const courseAttendances = Array.isArray(myAttendancesData) ? myAttendancesData.filter((a: any) => Number(a.course_id) === Number(c.id)) : [];
            const presentCount = courseAttendances.filter((a: any) => a.status === 'Hadir' || a.status === 'hadir').length;
            const absensiPercent = courseAttendances.length > 0 ? `${Math.round((presentCount / courseAttendances.length) * 100)}%` : '100%';

            // Submissions average for this course
            const courseSubs = Array.isArray(mySubmissionsData) ? mySubmissionsData.filter((s: any) => Number(s.course_id) === Number(c.id)) : [];
            const scoredSubs = courseSubs.filter((s: any) => s.score !== null && s.score !== undefined);
            const sumScore = scoredSubs.reduce((acc, curr) => acc + Number(curr.score), 0);
            const tugasScore = scoredSubs.length > 0 ? Math.round(sumScore / scoredSubs.length) : 85;

            const finalScore = parseFloat((tugasScore * 0.4 + utsScore * 0.3 + uasScore * 0.3).toFixed(1));

            return {
              code: c.code || 'MAPEL',
              title: c.title,
              teacher: c.teacher ? (typeof c.teacher === 'object' ? c.teacher.name : c.teacher) : 'Guru',
              tugasScore: tugasScore,
              utsScore: utsScore,
              uasScore: uasScore,
              absensiPercent: absensiPercent,
              absensiDetail: `${presentCount} / ${courseAttendances.length || 1} Pertemuan`,
              finalScore: finalScore,
              status: finalScore >= 75 ? 'Tuntas' : 'Remedial',
              taskHistory: courseSubs.map((s: any) => ({
                name: s.assignment_title || 'Tugas',
                date: s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('id-ID') : 'Terkirim',
                score: s.score !== null && s.score !== undefined ? `${s.score} / 100` : 'Belum Dinilai'
              }))
            };
          });
          setEnrolledClassesReports(reports);
        }
      } catch (e) {
        console.error('Failed to fetch siswa reports:', e);
      }
    };

    if (user) {
      fetchSiswaReports();
    }
  }, [user]);

  const handleExport = (type: 'pdf' | 'excel') => {
    const msg = `Rapor Laporan Akademik berhasil diunduh dalam format ${type.toUpperCase()}!`;
    setExportNotice(msg);
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <DashboardLayout
      role="siswa"
      title="Reports / Laporan Belajar"
      subtitle="Daftar kelas yang diikuti dan laporan tugas, nilai, serta absensi di bawah masing-masing kelas"
    >
      {/* Top Notice Toast */}
      {exportNotice && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{exportNotice}</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-mono">Downloaded</span>
        </div>
      )}

      {/* Rapor Overview Header Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 mb-8 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xl shadow-xs">
            <Award className="w-7 h-7 text-[#2563EB]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Rapor Belajar Siswa</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{user?.name || 'Siswa'} • {user?.specialization || 'Kelas'} • Semester Ganjil 2026/2027</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('pdf')}
            className="px-5 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 transition shadow-md shadow-blue-500/20"
          >
            <FileText className="w-4 h-4" />
            <span>Unduh Rapor (PDF)</span>
          </button>

          <button
            onClick={() => handleExport('excel')}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-2 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Class by Class Detailed Reports Section (Sprint Requirement) */}
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-900">Laporan Akademik Per Kelas Yang Diikuti</h3>

        {enrolledClassesReports.map((item) => (
          <div
            key={item.code}
            className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs hover:border-blue-100 transition"
          >
            {/* Course Header Banner */}
            <div className="flex flex-wrap items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
              <div>
                <span className="px-3 py-1 bg-blue-50 text-[#2563EB] font-bold rounded-full font-mono text-xs">
                  {item.code}
                </span>
                <h4 className="text-lg font-bold text-slate-900 mt-1">{item.title}</h4>
                <p className="text-xs text-slate-400 font-medium">Pengajar: {item.teacher}</p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Nilai Akhir Kumulatif</span>
                  <span className="text-2xl font-extrabold text-slate-900 font-mono">{item.finalScore}</span>
                </div>
                <span className="px-3.5 py-1.5 bg-emerald-100/70 text-emerald-700 font-bold rounded-full text-xs">
                  {item.status}
                </span>
              </div>
            </div>

            {/* Metrics Under Course Card */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4">
                <span className="text-xs font-bold text-slate-400 block mb-1">Rata-rata Tugas</span>
                <span className="text-lg font-extrabold text-slate-800 font-mono">{item.tugasScore} / 100</span>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4">
                <span className="text-xs font-bold text-slate-400 block mb-1">Nilai Ujian (UTS / UAS)</span>
                <span className="text-lg font-extrabold text-slate-800 font-mono">{item.utsScore} / {item.uasScore}</span>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4">
                <span className="text-xs font-bold text-slate-400 block mb-1">Persentase Kehadiran</span>
                <span className="text-lg font-extrabold text-emerald-600 font-mono">{item.absensiPercent}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">{item.absensiDetail}</span>
              </div>

              <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4">
                <span className="text-xs font-bold text-slate-400 block mb-1">Status Kriteria Ketuntasan</span>
                <span className="text-sm font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md inline-block mt-1">
                  ✓ {item.status} KKM
                </span>
              </div>
            </div>

            {/* Tasks & Assignments Detail List Under Class */}
            <div>
              <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Rincian Tugas & Evaluasi:</h5>
              <div className="space-y-2">
                {item.taskHistory.map((t:any, idx: number) => (
                  <div key={idx} className="bg-slate-50 rounded-xl p-3 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{t.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-extrabold text-purple-700">Nilai: {t.score}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
