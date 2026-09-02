'use client';

import React, { useState, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, FileCheck2, CalendarCheck, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';
import { useRealtimeData } from '@/hooks/useRealtimeData';

function SiswaAbsensiContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const courseTitle = searchParams.get('title') || 'Kelas Pembelajaran';
  const courseTeacher = searchParams.get('teacher') || 'Teacher';
  const courseCode = searchParams.get('code') || 'MAPEL';
  const courseId = searchParams.get('course_id') || '2';

  const [attendanceMessage, setAttendanceMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getLocalDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getLocalDateString();

  const loadAttendances = React.useCallback(async () => {
    try {
      const [courseData, attendances] = await Promise.all([
        api.getCourseDetail(Number(courseId)).catch(() => null),
        api.getMyAttendances().catch(() => []),
      ]);
      const courseAttendances = Array.isArray(attendances)
        ? attendances.filter((a: any) => String(a.course_id) === String(courseId))
        : [];
      
      const localDate = getLocalDateString();
      const hasToday = courseAttendances.some((a: any) => {
        const attDate = String(a.date || '').substring(0, 10);
        return attDate === localDate || (a.created_at && String(a.created_at).substring(0, 10) === localDate);
      });

      return {
        courseDetail: courseData,
        history: courseAttendances,
        submittedToday: hasToday,
      };
    } catch (e) {
      console.error(e);
      return { courseDetail: null, history: [], submittedToday: false };
    }
  }, [courseId]);

  const { data: realtimeAttData, refresh: refreshAttendance } = useRealtimeData(
    loadAttendances,
    5000,
    [courseId, todayStr],
    ['lms:attendances', 'lms:courses']
  );

  const courseDetail = realtimeAttData?.courseDetail || null;
  const history = realtimeAttData?.history || [];
  const submittedToday = realtimeAttData?.submittedToday || false;

  const handleFillAttendance = async () => {
    if (submittedToday || isSubmitting) return;
    setIsSubmitting(true);
    try {
      const res = await api.selfAttend(parseInt(courseId));
      setAttendanceMessage(res.message || 'Kehadiran Anda berhasil dicatat.');
      await refreshAttendance();
    } catch (e: any) {
      setAttendanceMessage(e.message || 'Gagal mencatat kehadiran.');
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isAttendanceTimeOpen = (): boolean => {
    if (!courseDetail?.attendance_open_time || !courseDetail?.attendance_close_time) {
      return false;
    }
    const now = new Date();
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const openTime = courseDetail.attendance_open_time.substring(0, 5);
    const closeTime = courseDetail.attendance_close_time.substring(0, 5);
    return currentTime >= openTime && currentTime <= closeTime;
  };

  const queryParamsStr = `?course_id=${courseId}&title=${encodeURIComponent(courseTitle)}&teacher=${encodeURIComponent(courseTeacher)}&code=${encodeURIComponent(courseCode)}`;

  return (
    <DashboardLayout
      role="siswa"
      title="Kehadiran / Absensi Kelas"
      subtitle="Pencatatan presensi mandiri harian siswa per mata pelajaran"
    >
      {/* Course Sub-Header Banner */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/siswa/courses"
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
            href={`/siswa/materi${queryParamsStr}`}
            className="flex items-center gap-2 pb-3 text-slate-500 hover:text-slate-900 transition"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Materi Pembelajaran</span>
          </Link>
          <Link
            href={`/siswa/tugas${queryParamsStr}`}
            className="flex items-center gap-2 pb-3 text-slate-500 hover:text-slate-900 transition"
          >
            <FileCheck2 className="w-4 h-4 text-slate-400" />
            <span>Tugas Kelas</span>
          </Link>
          <Link
            href={`/siswa/absensi${queryParamsStr}`}
            className="flex items-center gap-2 pb-3 text-[#2563EB] border-b-2 border-[#2563EB]"
          >
            <CalendarCheck className="w-4 h-4 text-[#2563EB]" />
            <span>Kehadiran / Absensi</span>
          </Link>
        </div>
      </div>

      {/* Main Attendance Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-8 sm:p-12 text-center shadow-xs max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 tracking-tight mb-1">Presensi Absen Mandiri Hari Ini</h3>
        <p className="text-xs text-slate-400 font-medium max-w-md mx-auto leading-relaxed mb-3">
          Klik tombol di bawah untuk mencatat kehadiran Anda pada mata pelajaran <strong className="text-slate-700">{courseTitle}</strong> hari ini.
        </p>

        {courseDetail?.attendance_open_time && courseDetail?.attendance_close_time && (
          <div className="mb-4 p-3 bg-slate-100 rounded-2xl text-xs font-semibold text-slate-700">
            ⏰ Jadwal Absensi Aktif: {courseDetail.attendance_open_time.substring(0, 5)}–{courseDetail.attendance_close_time.substring(0, 5)} WIB
            {isAttendanceTimeOpen() ? (
              <span className="ml-2 text-emerald-600">✓ Sedang Aktif</span>
            ) : (
              <span className="ml-2 text-rose-600">✗ Tidak Aktif</span>
            )}
          </div>
        )}

        {attendanceMessage && (
          <div className={`mb-4 p-3 rounded-2xl text-xs font-semibold ${
            attendanceMessage.includes('berhasil') || attendanceMessage.includes('Kehadiran')
              ? 'bg-emerald-100 text-emerald-700' 
              : 'bg-rose-100 text-rose-700'
          }`}>
            {attendanceMessage}
          </div>
        )}

        <button
          onClick={handleFillAttendance}
          disabled={submittedToday || isSubmitting || !isAttendanceTimeOpen()}
          className={`w-full max-w-sm py-3.5 rounded-2xl font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 mx-auto cursor-pointer ${
            submittedToday
              ? 'bg-emerald-500 text-white cursor-not-allowed shadow-none'
              : isSubmitting
              ? 'bg-slate-400 text-white cursor-not-allowed shadow-none'
              : !isAttendanceTimeOpen()
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
              : 'bg-[#10B981] hover:bg-emerald-600 text-white shadow-emerald-500/25'
          }`}
        >
          {isSubmitting ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
          )}
          <span>
            {submittedToday 
              ? '✓ Kehadiran Hari Ini Sudah Tercatat' 
              : isSubmitting
              ? '⏳ Memproses Presensi...'
              : !isAttendanceTimeOpen()
              ? '⏳ Absensi Belum Dibuka atau Sudah Ditutup'
              : 'Klik Untuk Absen Hadir Hari Ini'}
          </span>
        </button>

        {/* Riwayat Kehadiran */}
        <div className="mt-10 text-left pt-6 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-700 mb-3">Riwayat Kehadiran Anda Pada Mata Pelajaran Ini</p>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="flex items-center justify-between p-3.5 bg-[#F8FAFC] border border-slate-100 rounded-2xl text-xs">
                <div>
                  <p className="font-bold text-slate-900 font-mono">{h.date}</p>
                  <p className="text-[11px] text-slate-400 font-mono">Waktu Absen: {h.time}</p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-xl text-[11px]">
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function SiswaAbsensiPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
      <SiswaAbsensiContent />
    </Suspense>
  );
}
