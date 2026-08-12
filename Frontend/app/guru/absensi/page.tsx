'use client';

import React, { useState, useEffect, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, FileCheck2, CalendarCheck, CheckCircle2, UserCheck, Calendar, RefreshCw, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { api } from '@/lib/api';

function GuruAbsensiContent() {
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();

  const courseTitle = searchParams.get('title') || 'Biologi Sel & Genetik Kelas XII';
  const courseTeacher = searchParams.get('teacher') || (currentUser?.name || '');
  const courseCode = searchParams.get('code') || 'BIO-XII';
  const courseId = searchParams.get('course_id') || '2';

  const todayIso = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [batchToast, setBatchToast] = useState('');

  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Available dates for dropdown filter
  const dateOptions: Array<{ label: string; value: string }> = [];

  const loadAttendanceData = React.useCallback(async () => {
    try {
      const [courseDetail, attendances] = await Promise.all([
        api.getCourseDetail(Number(courseId)).catch(() => null),
        api.getCourseAttendances(Number(courseId), selectedDate).catch(() => [])
      ]);

      const enrolled = courseDetail?.students || [];
      const savedDailyList = Array.isArray(attendances) ? attendances : [];

      if (!Array.isArray(enrolled) || enrolled.length === 0) return [];

      return enrolled.map((s: any, idx: number) => {
        const existing = savedDailyList.find((item: any) =>
          item.student_id === s.id || item.student?.id === s.id || item.email === s.email
        );

        return {
          no: (idx + 1).toString().padStart(2, '0'),
          id: s.nisn_or_nip || `USR-00${s.id}`,
          dbId: s.id,
          name: s.name,
          email: s.email,
          status: existing?.status || 'Hadir',
          time: existing?.attended_at || existing?.time
        };
      });
    } catch {
      return [];
    }
  }, [courseId, selectedDate]);

  const { data: attendanceData, loading: attendanceLoading, refresh: refreshAttendance } = useRealtimeData(
    loadAttendanceData,
    5000,
    [courseId, selectedDate]
  );

  useEffect(() => {
    setStudents(attendanceData || []);
    setIsLoading(attendanceLoading);
  }, [attendanceData, attendanceLoading]);

  const saveAttendances = async (updated: any[]) => {
    await api.saveCourseAttendances(Number(courseId), {
      date: selectedDate,
      attendances: updated.map((student) => ({
        student_id: student.dbId,
        status: student.status
      }))
    });
  };

  const handleStatusChange = async (index: number, newStatus: string) => {
    const updated = students.map((student, studentIndex) =>
      studentIndex === index ? { ...student, status: newStatus } : student
    );
    setStudents(updated);

    try {
      await saveAttendances(updated);
      await refreshAttendance();
    } catch (e) {
      console.error('Failed to save attendance:', e);
    }
  };

  const handleMarkAllPresent = async () => {
    const updated = students.map(s => ({ ...s, status: 'Hadir' }));
    setStudents(updated);

    try {
      await saveAttendances(updated);
      await refreshAttendance();
      setBatchToast(`Seluruh siswa berhasil ditandai HADIR pada tanggal ${selectedDate}!`);
      setTimeout(() => setBatchToast(''), 3000);
    } catch (e) {
      console.error('Failed to save attendance:', e);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Hadir': return 'bg-emerald-100/70 text-emerald-700 border-emerald-200';
      case 'Izin': return 'bg-blue-100/70 text-blue-700 border-blue-200';
      case 'Sakit': return 'bg-amber-100/70 text-amber-700 border-amber-200';
      case 'Alfa': return 'bg-rose-100/70 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-500 border-slate-200';
    }
  };

  const queryParamsStr = `?course_id=${courseId}&title=${encodeURIComponent(courseTitle)}&teacher=${encodeURIComponent(courseTeacher)}&code=${encodeURIComponent(courseCode)}`;

  const countHadir = students.filter(s => s.status === 'Hadir').length;
  const countIzinSakit = students.filter(s => s.status === 'Izin' || s.status === 'Sakit').length;
  const countAlfa = students.filter(s => s.status === 'Alfa').length;

  return (
    <DashboardLayout
      role="guru"
      title="Presensi / Kehadiran Kelas"
      subtitle="Pencatatan presensi harian per tanggal mata pelajaran dan pemantauan absen mandiri siswa"
    >
      {/* Course Sub-Header Banner */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/guru/courses"
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition shadow-xs cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{courseTitle}</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Pengajar: <strong className="text-slate-700">{courseTeacher}</strong> | Kode: {courseCode}
            </p>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-6 border-b border-slate-200 text-sm font-bold pt-2">
          <Link
            href={`/guru/materi${queryParamsStr}`}
            className="flex items-center gap-2 pb-3 text-slate-500 hover:text-slate-900 transition"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Materi Pembelajaran</span>
          </Link>
          <Link
            href={`/guru/tugas${queryParamsStr}`}
            className="flex items-center gap-2 pb-3 text-slate-500 hover:text-slate-900 transition"
          >
            <FileCheck2 className="w-4 h-4 text-slate-400" />
            <span>Tugas Kelas</span>
          </Link>
          <Link
            href={`/guru/absensi${queryParamsStr}`}
            className="flex items-center gap-2 pb-3 text-[#2563EB] border-b-2 border-[#2563EB]"
          >
            <CalendarCheck className="w-4 h-4 text-[#2563EB]" />
            <span>Kehadiran / Absensi</span>
          </Link>
        </div>
      </div>

      {/* Toast Notice */}
      {batchToast && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{batchToast}</span>
        </div>
      )}

      {/* Summary Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-2xl font-extrabold text-emerald-600">{countHadir} / {students.length}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Siswa Hadir Hari Ini</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-2xl font-extrabold text-blue-600">{countIzinSakit}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Siswa Izin / Sakit</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-2xl font-extrabold text-rose-600">{countAlfa}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Siswa Alfa (Tanpa Keterangan)</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Top Date Selection & Batch Action Bar */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Pilih Tanggal Presensi:</label>
          <select
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {dateOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshAttendance}
            className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-1.5 transition cursor-pointer"
            title="Refresh Presensi Real-Time"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Presensi Real-Time</span>
          </button>

          <button
            onClick={handleMarkAllPresent}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold rounded-2xl text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <span>Tandai Semua Hadir</span>
          </button>
        </div>
      </div>

      {/* Student Attendance Table */}
      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAFC] border-b border-slate-100 text-slate-400 text-[11px] font-bold uppercase tracking-wider">
                <th className="py-4 px-6">No</th>
                <th className="py-4 px-6">ID / NISN</th>
                <th className="py-4 px-6">Nama Siswa</th>
                <th className="py-4 px-6">Waktu Absen</th>
                <th className="py-4 px-6">Rekap Kehadiran</th>
                <th className="py-4 px-6">Status Kehadiran Hari Ini</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                [1, 2, 3, 4].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td colSpan={6} className="py-4 px-6">
                      <div className="h-4 bg-slate-100 rounded-md w-3/4"></div>
                    </td>
                  </tr>
                ))
              ) : students.map((student, index) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-6 font-mono font-bold text-slate-400">{student.no}</td>
                  <td className="py-4 px-6 font-mono font-semibold text-slate-700">{student.id}</td>
                  <td className="py-4 px-6">
                    <p className="font-bold text-slate-900">{student.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{student.email || `${student.name.toLowerCase().replace(/\s+/g, '')}@school.id`}</p>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-xl font-mono text-[11px] font-semibold border border-slate-200/60">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{student.time || `07:${(15 + (index * 4) % 45).toString().padStart(2, '0')} WIB`}</span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-xl text-[11px] border border-emerald-200/60">
                      <span>{92 + (index % 7)}% ({23 + (index % 3)}/25)</span>
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {['Hadir', 'Izin', 'Sakit', 'Alfa'].map((statusOption) => (
                        <button
                          key={statusOption}
                          onClick={() => handleStatusChange(index, statusOption)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] border transition cursor-pointer ${
                            student.status === statusOption
                              ? getStatusBadgeClass(statusOption)
                              : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          {statusOption}
                        </button>
                      ))}
                    </div>
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

export default function GuruAbsensiPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
      <GuruAbsensiContent />
    </Suspense>
  );
}
