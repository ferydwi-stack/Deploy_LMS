'use client';

import React, { useState, useEffect, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, FileCheck2, CalendarCheck, CheckCircle2, UserCheck, Calendar, RefreshCw, Clock, ChevronDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { api } from '@/lib/api';

function GuruAbsensiContent() {
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();

  const courseTitle = searchParams.get('title') || 'Kelas Pembelajaran';
  const courseTeacher = searchParams.get('teacher') || (currentUser?.name || 'Guru');
  const courseCode = searchParams.get('code') || 'MAPEL';
  const courseId = searchParams.get('course_id') || '1';

  const todayIso = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [batchToast, setBatchToast] = useState('');

  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceOpenTime, setAttendanceOpenTime] = useState('');
  const [attendanceCloseTime, setAttendanceCloseTime] = useState('');
  const [scheduleMessage, setScheduleMessage] = useState('');
  const [attendanceStats, setAttendanceStats] = useState<Record<number, any>>({});

  const dateOptions: Array<{ label: string; value: string }> = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const val = d.toISOString().split('T')[0];
    const label = i === 0 ? 'Hari Ini' : d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
    dateOptions.push({ label, value: val });
  }

  const loadAttendanceData = React.useCallback(async () => {
    try {
      const [courseDetail, attendances, statsRes] = await Promise.all([
        api.getCourseDetail(Number(courseId)).catch(() => null),
        api.getCourseAttendances(Number(courseId), selectedDate).catch(() => []),
        api.getCourseAttendanceStats(Number(courseId)).catch(() => ({ stats: {} })),
      ]);

       const enrolled = courseDetail?.students || [];
       setAttendanceOpenTime(courseDetail?.attendance_open_time || '');
       setAttendanceCloseTime(courseDetail?.attendance_close_time || '');
       setAttendanceStats(statsRes?.stats || {});
       const savedDailyList = Array.isArray(attendances) ? attendances : [];

      if (!Array.isArray(enrolled) || enrolled.length === 0) return [];

      return enrolled.map((s: any, idx: number) => {
        const existing = savedDailyList.find((item: any) =>
          String(item.student_id) === String(s.id) || String(item.student?.id) === String(s.id) || item.email === s.email
        );

        let timeFormatted = '-';
        if (existing?.updated_at) {
          const d = new Date(existing.updated_at);
          timeFormatted = d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }) + ' WIB';
        } else if (existing?.created_at) {
          const d = new Date(existing.created_at);
          timeFormatted = d.toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', hour: '2-digit', minute: '2-digit' }) + ' WIB';
        }

        return {
          no: (idx + 1).toString().padStart(2, '0'),
          id: s.nisn_or_nip || `USR-00${s.id}`,
          dbId: s.id,
          name: s.name,
          email: s.email,
          status: existing?.status || '-',
          note: existing?.note || '',
          time: timeFormatted,
        };
      });
    } catch {
      return [];
    }
  }, [courseId, selectedDate]);

  const { data: attendanceData, loading: attendanceLoading, refresh: refreshAttendance } = useRealtimeData(
    loadAttendanceData,
    8000,
    [courseId, selectedDate],
    ['lms:attendances', 'lms:courses']
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

  const handleSaveSchedule = async () => {
    if (!attendanceOpenTime || !attendanceCloseTime) {
      setScheduleMessage('Jam mulai dan selesai absensi wajib diisi.');
      return;
    }

    try {
      await api.updateAttendanceSchedule(courseId, {
        attendance_open_time: attendanceOpenTime,
        attendance_close_time: attendanceCloseTime,
      });
      setScheduleMessage(`Absensi aktif pukul ${attendanceOpenTime}–${attendanceCloseTime} WIB.`);
    } catch (error: any) {
      setScheduleMessage(error.message || 'Jadwal absensi gagal disimpan.');
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
    const s = status.toLowerCase();
    if (s === 'hadir') return 'bg-emerald-100/70 text-emerald-700 border-emerald-200';
    if (s === 'izin') return 'bg-blue-100/70 text-blue-700 border-blue-200';
    if (s === 'sakit') return 'bg-amber-100/70 text-amber-700 border-amber-200';
    if (s === 'alfa' || s === 'alpha') return 'bg-rose-100/70 text-rose-700 border-rose-200';
    return 'bg-slate-100 text-slate-500 border-slate-200';
  };

  const statusLabel = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'hadir') return 'Hadir';
    if (s === 'izin') return 'Izin';
    if (s === 'sakit') return 'Sakit';
    if (s === 'alfa' || s === 'alpha') return 'Alfa';
    return '-';
  };

  const queryParamsStr = `?course_id=${courseId}&title=${encodeURIComponent(courseTitle)}&teacher=${encodeURIComponent(courseTeacher)}&code=${encodeURIComponent(courseCode)}`;

  const countHadir = students.filter(s => s.status.toLowerCase() === 'hadir').length;
  const countIzinSakit = students.filter(s => s.status.toLowerCase() === 'izin' || s.status.toLowerCase() === 'sakit').length;
  const countAlfa = students.filter(s => s.status.toLowerCase() === 'alfa' || s.status.toLowerCase() === 'alpha').length;
  const countBelum = students.filter(s => s.status === '-').length;

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
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-2xl font-extrabold text-emerald-600">{countHadir} / {students.length}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Siswa Hadir</p>
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
            <p className="text-xs text-slate-400 font-medium mt-0.5">Siswa Alfa</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-2xl font-extrabold text-slate-500">{countBelum}</p>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Belum Absen</p>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Schedule Setting Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-3xl p-5 mb-6 shadow-xs">
        <p className="text-xs font-bold text-slate-700 mb-3">⏰ Atur Jadwal Absensi Aktif</p>
        <div className="flex flex-wrap items-end gap-3">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Jam Mulai Absensi:</label>
            <input
              type="time"
              value={attendanceOpenTime}
              onChange={(e) => setAttendanceOpenTime(e.target.value)}
              className="px-3 py-2 bg-white border border-blue-300 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Jam Selesai Absensi:</label>
            <input
              type="time"
              value={attendanceCloseTime}
              onChange={(e) => setAttendanceCloseTime(e.target.value)}
              className="px-3 py-2 bg-white border border-blue-300 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button
            onClick={handleSaveSchedule}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition cursor-pointer"
          >
            Simpan Jadwal
          </button>
          {scheduleMessage && (
            <span className="text-xs font-semibold text-blue-700 px-3 py-1 bg-blue-100 rounded-xl">
              {scheduleMessage}
            </span>
          )}
        </div>
      </div>

      {/* Top Date Selection & Batch Action Bar */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 mb-6 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-slate-700">Pilih Tanggal Presensi:</label>
          <div className="relative">
            <select
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 appearance-none pr-10"
            >
              {dateOptions.map((opt) => (
                <option className="bg-white text-slate-900" key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
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
                <th className="py-4 px-4">No</th>
                <th className="py-4 px-4">ID / NISN</th>
                <th className="py-4 px-4">Nama Siswa</th>
                <th className="py-4 px-4">Waktu Absen</th>
                <th className="py-4 px-4">Status Hari Ini</th>
                <th className="py-4 px-4">Catatan</th>
                <th className="py-4 px-4">Rekap Kehadiran</th>
                <th className="py-4 px-4">Ubah Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {isLoading ? (
                [1, 2, 3, 4].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td colSpan={8} className="py-4 px-4">
                      <div className="h-4 bg-slate-100 rounded-md w-3/4"></div>
                    </td>
                  </tr>
                ))
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 px-4 text-center text-slate-400">
                    Belum ada siswa terdaftar di kelas ini.
                  </td>
                </tr>
              ) : students.map((student, index) => {
                const stats = attendanceStats[student.dbId];
                const statsText = stats
                  ? `${stats.percentage}% (${stats.hadir}/${stats.total})`
                  : '-';
                const statsDetail = stats
                  ? `H:${stats.hadir} I:${stats.izin} S:${stats.sakit} A:${stats.alpha}`
                  : '';
                const rekapColor = stats
                  ? stats.percentage >= 80 ? 'text-emerald-700 bg-emerald-50 border-emerald-200/60'
                    : stats.percentage >= 60 ? 'text-amber-700 bg-amber-50 border-amber-200/60'
                    : 'text-rose-700 bg-rose-50 border-rose-200/60'
                  : 'text-slate-400 bg-slate-50 border-slate-200/60';

                return (
                <tr key={student.id} className="hover:bg-slate-50/50 transition">
                  <td className="py-4 px-4 font-mono font-bold text-slate-400">{student.no}</td>
                  <td className="py-4 px-4 font-mono font-semibold text-slate-700">{student.id}</td>
                  <td className="py-4 px-4">
                    <p className="font-bold text-slate-900">{student.name}</p>
                    <p className="text-[11px] text-slate-400 font-mono">{student.email}</p>
                  </td>
                  <td className="py-4 px-4">
                    {student.time !== '-' ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-xl font-mono text-[11px] font-semibold border border-slate-200/60">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{student.time}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">Belum absen</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    {student.status !== '-' ? (
                      <span className={`inline-flex items-center px-3 py-1 rounded-xl font-bold text-[11px] border ${getStatusBadgeClass(student.status)}`}>
                        {statusLabel(student.status)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-xl font-bold text-[11px] border bg-slate-100 text-slate-400 border-slate-200">
                        Belum Absen
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-[11px] text-slate-500">{student.note || '-'}</span>
                  </td>
                  <td className="py-4 px-4">
                    <div className={`inline-flex flex-col items-start px-3 py-1.5 rounded-xl font-bold text-[11px] border ${rekapColor}`}>
                      <span>{statsText}</span>
                      {statsDetail && <span className="text-[10px] font-normal mt-0.5">{statsDetail}</span>}
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5">
                      {['Hadir', 'Izin', 'Sakit', 'Alfa'].map((statusOption) => (
                        <button
                          key={statusOption}
                          onClick={() => handleStatusChange(index, statusOption)}
                          className={`px-2.5 py-1.5 rounded-xl font-bold text-[11px] border transition cursor-pointer ${
                            student.status.toLowerCase() === statusOption.toLowerCase() || (statusOption === 'Alfa' && student.status.toLowerCase() === 'alpha')
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
                );
              })}
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
