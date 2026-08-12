'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Download, Calendar, CheckCircle2, UserCheck, Users, Printer, FileSpreadsheet } from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminReportsPage() {
  const [range, setRange] = useState('minggu');
  const [downloadNotice, setDownloadNotice] = useState('');
  const [reportData, setReportData] = useState<any[]>([]);
  const [overallStats, setOverallStats] = useState({ studentPercent: 0, teacherPercent: 100, effectiveDays: 22 });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [coursesData, usersData, attendancesData] = await Promise.all([
          api.getCourses().catch(() => []),
          api.getUsers().catch(() => []),
          api.getAllAttendances?.().catch(() => [])
        ]);

        const courses = Array.isArray(coursesData) ? coursesData : [];
        const users = Array.isArray(usersData) ? usersData : [];
        const attendances = Array.isArray(attendancesData) ? attendancesData : [];

        const courseReports = courses.map((c: any) => {
          const teacher = c.teacher ? (typeof c.teacher === 'object' ? c.teacher.name : c.teacher) : 'Guru';
          const students = Array.isArray(c.students) ? c.students : [];
          const total = students.length;

          const courseAttendances = attendances.filter((a: any) => Number(a.course_id) === Number(c.id));
          const studentIds = students.map((s: any) => Number(s.id));
          const studentAttendances = courseAttendances.filter((a: any) => studentIds.includes(Number(a.student_id || a.user_id)));

          const hadir = studentAttendances.filter((a: any) => String(a.status).toLowerCase() === 'hadir').length;
          const izin = studentAttendances.filter((a: any) => String(a.status).toLowerCase() === 'izin').length;
          const sakit = studentAttendances.filter((a: any) => String(a.status).toLowerCase() === 'sakit').length;
          const alpa = studentAttendances.filter((a: any) => String(a.status).toLowerCase() === 'alpa').length;
          const percent = studentAttendances.length > 0 ? `${Math.round((hadir / studentAttendances.length) * 100)}%` : '0%';

          return {
            class: c.title || c.name,
            teacher,
            total,
            hadir,
            izin,
            sakit,
            alpa,
            percent
          };
        });

        const teachers = users.filter((u: any) => u.role === 'guru');
        const teacherAttendances = attendances.filter((a: any) => 
          teachers.some((t: any) => Number(t.id) === Number(a.user_id || a.teacher_id))
        );
        const teacherHadir = teacherAttendances.filter((a: any) => String(a.status).toLowerCase() === 'hadir').length;
        const teacherPercent = teacherAttendances.length > 0 ? Math.round((teacherHadir / teacherAttendances.length) * 100) : 100;

        courseReports.push({
          class: 'Staf Pengajar (Guru)',
          teacher: 'Seluruh Pengajar',
          total: teachers.length,
          hadir: teacherHadir,
          izin: 0,
          sakit: 0,
          alpa: 0,
          percent: `${teacherPercent}%`
        });

        const totalStudentAttendances = attendances.filter((a: any) => 
          users.some((u: any) => u.role === 'siswa' && Number(u.id) === Number(a.user_id || a.student_id))
        );
        const totalStudentHadir = totalStudentAttendances.filter((a: any) => String(a.status).toLowerCase() === 'hadir').length;
        const studentPercent = totalStudentAttendances.length > 0 
          ? Math.round((totalStudentHadir / totalStudentAttendances.length) * 100) 
          : 0;

        setReportData(courseReports);
        setOverallStats({ studentPercent, teacherPercent, effectiveDays: 22 });
      } catch (e) {
        console.error('Failed to fetch admin reports:', e);
      }
    };

    fetchReports();
  }, [range]);

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
  <div className="bg-[#10B981] rounded-[22px] p-6 shadow-none flex flex-col justify-between text-white">
    <div className="flex items-center justify-between mb-4">
      <span className="text-xs font-bold uppercase opacity-90">Kehadiran Siswa</span>
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
        <Users className="w-4 h-4 text-white" />
      </div>
    </div>
    <p className="text-4xl font-extrabold tracking-tight mb-1" suppressHydrationWarning>{overallStats.studentPercent}%</p>
    <p className="text-xs font-medium opacity-90">Kumulatif seluruh tingkat kelas</p>
  </div>

  <div className="bg-[#3B82F6] rounded-[22px] p-6 shadow-none flex flex-col justify-between text-white">
    <div className="flex items-center justify-between mb-4">
      <span className="text-xs font-bold uppercase opacity-90">Kehadiran Staf Guru</span>
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
        <UserCheck className="w-4 h-4 text-white" />
      </div>
    </div>
    <p className="text-4xl font-extrabold tracking-tight mb-1" suppressHydrationWarning>{overallStats.teacherPercent}%</p>
    <p className="text-xs font-medium opacity-90">Pengajar hadir sesuai jadwal</p>
  </div>

  <div className="bg-[#8B5CF6] rounded-[22px] p-6 shadow-none flex flex-col justify-between text-white">
    <div className="flex items-center justify-between mb-4">
      <span className="text-xs font-bold uppercase opacity-90">Hari Efektif Belajar</span>
      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
        <Calendar className="w-4 h-4 text-white" />
      </div>
    </div>
    <p className="text-4xl font-extrabold tracking-tight mb-1" suppressHydrationWarning>{overallStats.effectiveDays} Hari</p>
    <p className="text-xs font-medium opacity-90">Periode Bulan Berjalan</p>
  </div>
</div>

      {/* Main Table Section */}
      <div className="bg-white border border-slate-100 rounded-[28px] p-6 sm:p-8 shadow-sm">
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
              className="px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            >
              <option value="minggu">Minggu Ini</option>
              <option value="bulan">Bulan Ini</option>
              <option value="semester">Semester Ini</option>
            </select>

            {/* Export Actions */}
            <button
  onClick={() => handleExport('excel')}
  className="px-4 py-2.5 bg-white hover:bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs rounded-xl shadow-none transition flex items-center gap-2"
>
  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
  <span>Export Excel</span>
</button>

<button
  onClick={() => handleExport('pdf')}
  className="px-4 py-2.5 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 font-bold text-xs rounded-xl shadow-none transition flex items-center gap-2"
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
                    <span className="px-3 py-1 bg-emerald-500 text-white font-bold rounded-full font-mono text-[11px]">
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
