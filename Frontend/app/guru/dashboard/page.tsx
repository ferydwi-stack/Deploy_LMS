'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { BookOpen, Users, FileCheck2, ArrowRight, Plus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { api } from '@/lib/api';

export default function GuruDashboardPage() {
  const { user: currentUser, isLoading: authLoading } = useAuth();

  const fetchTeacherDashboard = React.useCallback(async () => {
    try {
      const [coursesData, assignmentsData] = await Promise.all([
        api.getCourses().catch(() => []),
        api.getAssignments().catch(() => [])
      ]);
      return { coursesData, assignmentsData };
    } catch {
      return { coursesData: [], assignmentsData: [] };
    }
  }, []);

  const { data: dashboardData, loading: dataLoading } = useRealtimeData(
    fetchTeacherDashboard,
    15000,
    [currentUser?.id]
  );

  const isLoading = authLoading || dataLoading;

  const courses = React.useMemo(() => {
    if (!dashboardData || !currentUser) return [];
    const { coursesData } = dashboardData;

    if (Array.isArray(coursesData)) {
      const loggedInName = currentUser.name || '';
      const loggedInId = currentUser.id;

      const myCourses = coursesData.filter((c: any) => {
        if (c.teacher_id && Number(c.teacher_id) === Number(loggedInId)) return true;
        if (c.teacher && typeof c.teacher === 'object' && Number(c.teacher.id) === Number(loggedInId)) return true;
        if (c.teacher && typeof c.teacher === 'string' && c.teacher.toLowerCase().includes(loggedInName.toLowerCase())) return true;
        return false;
      });

      return myCourses.map((c: any) => ({
        id: c.id,
        code: c.code || 'MAPEL',
        title: c.title,
        teacher: c.teacher ? (typeof c.teacher === 'object' ? c.teacher.name : c.teacher) : loggedInName,
        studentsCount: c.students_count || (Array.isArray(c.students) ? c.students.length : 0),
        materiCount: c.materials_count || 0,
        tugasCount: c.assignments_count || 0,
        path: '/guru/materi'
      }));
    }
    return [];
  }, [dashboardData, currentUser]);

  const teacherName = currentUser?.name || '';
  const teacherInitials = teacherName ? teacherName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'GP';

  const totalStudentsAllCourses = courses.reduce((acc, curr) => acc + curr.studentsCount, 0);

  // Compute pending tasks to grade strictly for teacher's courses
  const pendingAssignmentsCount = React.useMemo(() => {
    if (!dashboardData || !currentUser) return 0;
    const { assignmentsData } = dashboardData;
    if (!Array.isArray(assignmentsData)) return 0;

    const myCourseIds = new Set(courses.map(c => Number(c.id)));
    const myAssignments = assignmentsData.filter((a: any) => myCourseIds.has(Number(a.course_id)));

    // Count assignments that have un-graded submissions or are active
    return myAssignments.filter((a: any) => {
      const subCount = a.submissions_count || (Array.isArray(a.submissions) ? a.submissions.length : 0);
      return subCount > 0;
    }).length;
  }, [dashboardData, currentUser, courses]);

  const stats = [
    {
      title: 'Kelas Dibuat & Diampu',
      value: isLoading ? '...' : courses.length.toString(),
      badge: 'Aktif',
      badgeClass: 'bg-blue-100/70 text-blue-600',
      icon: <BookOpen className="w-5 h-5 text-blue-600" />,
      iconBg: 'bg-blue-50'
    },
    {
      title: 'Total Siswa Masuk Disemua Kelas',
      value: isLoading ? '...' : totalStudentsAllCourses.toString(),
      badge: 'Terdaftar',
      badgeClass: 'bg-purple-100/70 text-purple-700',
      icon: <Users className="w-5 h-5 text-purple-600" />,
      iconBg: 'bg-purple-50'
    },
    {
      title: 'Tugas Perlu Periksa',
      value: isLoading ? '...' : pendingAssignmentsCount.toString(),
      badge: pendingAssignmentsCount > 0 ? 'Pending' : 'Selesai',
      badgeClass: pendingAssignmentsCount > 0 ? 'bg-amber-100/70 text-amber-600' : 'bg-emerald-100/70 text-emerald-600',
      icon: <FileCheck2 className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-50'
    }
  ];

  return (
    <DashboardLayout
      role="guru"
      title="Dashboard Guru"
      subtitle="Ringkasan pengajaran, kelas yang telah dibuat, dan total siswa mengikutinya"
    >
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 mb-8 shadow-xs flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-xl shadow-md">
          {teacherInitials}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Selamat Datang, {teacherName}!</h2>
          <p className="text-xs font-medium text-slate-400 mt-1">
            Kelola pembelajaran, materi, tugas, dan pemantauan absensi kelas Anda.
          </p>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between h-44">
            <div className="flex items-center justify-between">
              <div className={`p-3 rounded-2xl ${stat.iconBg}`}>
                {stat.icon}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${stat.badgeClass}`}>
                {stat.badge}
              </span>
            </div>

            <div>
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-xs font-medium text-slate-400 mt-1">{stat.title}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-900">Kelas Yang Telah Dibuat Oleh {teacherName}</h3>
        <Link href="/guru/courses" className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1">
          <span>Kelola Semua Kelas</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Course Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2].map((n) => (
            <div key={n} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs animate-pulse space-y-4">
              <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
              <div className="h-6 w-3/4 bg-slate-200 rounded-md"></div>
            </div>
          ))
        ) : courses.length > 0 ? (
          courses.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-blue-50 text-[#2563EB] font-bold rounded-full font-mono text-xs border border-blue-100/60">
                    {course.code}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug mb-1">{course.title}</h3>
                <p className="text-xs text-slate-400 font-medium mb-6">
                  Pengajar: <strong className="text-slate-700">{course.teacher}</strong>
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>{course.studentsCount} Siswa Masuk</span>
                </div>

                <Link
                  href={`/guru/materi?course_id=${course.id}&title=${encodeURIComponent(course.title)}&teacher=${encodeURIComponent(course.teacher)}&code=${encodeURIComponent(course.code || 'BIO-XII')}`}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#2563EB] font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                >
                  <span>Masuk Kelas</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 bg-white border border-slate-100 rounded-3xl p-8 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Belum ada kelas yang dibuat oleh {teacherName}</p>
            <p className="text-xs text-slate-400">Buat kelas baru untuk memulai aktivitas pembelajaran.</p>
            <Link
              href="/guru/courses"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white text-xs font-bold rounded-2xl shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Kelas Baru Sekarang</span>
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
