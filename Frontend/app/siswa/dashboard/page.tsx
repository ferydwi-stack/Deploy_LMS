'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { BookOpen, Edit3, CalendarCheck, Bell, FileText, ArrowRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { api } from '@/lib/api';

export default function SiswaDashboardPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [stats, setStats] = useState({
    courses: 0,
    pendingTasks: 0,
    attendance: '0%'
  });

  const { data: courses } = useRealtimeData(() => api.getCourses(), 5000);
  const { data: notifs } = useRealtimeData(() => api.getNotifications(), 5000);
  const { data: attendances } = useRealtimeData(() => api.getMyAttendances(), 5000);

  useEffect(() => {
    const notifList = Array.isArray(notifs) ? notifs : (notifs?.notifications || []);
    if (notifList.length > 0) {
      const formattedNotifs = notifList.slice(0, 3).map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        course: n.course,
        time: n.time,
        link: n.link || '/siswa/tugas',
        badge: n.badge,
        badgeBg: n.type === 'tugas' ? 'bg-amber-100 text-amber-700' : n.type === 'materi' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700',
        icon: n.type === 'tugas' ? <Edit3 className="w-5 h-5 text-amber-600" /> : n.type === 'materi' ? <FileText className="w-5 h-5 text-blue-600" /> : <CalendarCheck className="w-5 h-5 text-emerald-600" />,
        iconBg: n.type === 'tugas' ? 'bg-amber-50' : n.type === 'materi' ? 'bg-blue-50' : 'bg-emerald-50'
      }));
      setNotifications(formattedNotifs);
    }
  }, [notifs]);

  useEffect(() => {
    if (courses && attendances) {
      const attendanceList = Array.isArray(attendances) ? attendances : (attendances?.attendances || []);
      const totalAttendance = attendanceList.length > 0 
        ? Math.round((attendanceList.filter((a: any) => String(a.status).toLowerCase() === 'hadir').length / attendanceList.length) * 100)
        : 0;
      
      setStats({
        courses: Array.isArray(courses) ? courses.length : 0,
        pendingTasks: 1,
        attendance: `${totalAttendance}%`
      });
    }
  }, [courses, attendances]);

  return (
    <DashboardLayout
      role="siswa"
      title="Dashboard Belajar Siswa"
      subtitle="Ringkasan notifikasi tugas, materi, dan absensi aktif Anda"
    >
      {/* Welcome Banner Box */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 mb-8 shadow-xs flex items-center gap-5">
        <div className="w-14 h-14 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-xl shadow-md">
          {user?.name?.split(' ').map(n => n[0]).join('') || 'US'}
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-900">Halo, {user?.name || 'Siswa'}!</h2>
          <p className="text-xs font-medium text-slate-400 mt-1">Selamat datang kembali di platform pembelajaran LMS.</p>
        </div>
      </div>

      {/* Notification Cards Section (Klik card langsung menuju detail kelas/fitur) */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Bell className="w-4 h-4 text-[#2563EB]" />
          <h3 className="text-base font-bold text-slate-900">Card Notifikasi Pembelajaran (Klik Untuk Buka Kelas)</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {notifications.map((notif) => (
            <Link
              key={notif.id}
              href={notif.link}
              className="bg-white border border-slate-100 rounded-3xl p-5 shadow-xs hover:shadow-md hover:border-blue-200 transition group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-2xl ${notif.iconBg}`}>
                    {notif.icon}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${notif.badgeBg}`}>
                    {notif.badge}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#2563EB] transition leading-snug mb-1">
                  {notif.title}
                </h4>
                <p className="text-xs text-slate-400 font-medium">{notif.course}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#2563EB]">
                <span className="text-[11px] text-slate-400 font-medium">{notif.time}</span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Buka kelas <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between h-44">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-blue-50">
              <BookOpen className="w-5 h-5 text-blue-600" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100/70 text-blue-600">
              Aktif
            </span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.courses}</p>
            <p className="text-xs font-medium text-slate-400 mt-1">Kelas Yang Diikuti</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between h-44">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-amber-50">
              <Edit3 className="w-5 h-5 text-amber-600" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100/70 text-amber-600">
              Aktif
            </span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.pendingTasks}</p>
            <p className="text-xs font-medium text-slate-400 mt-1">Tugas Belum Dikumpul</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between h-44">
          <div className="flex items-center justify-between">
            <div className="p-3 rounded-2xl bg-emerald-50">
              <CalendarCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100/70 text-emerald-600">
              Aktif
            </span>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-slate-900 tracking-tight">{stats.attendance}</p>
            <p className="text-xs font-medium text-slate-400 mt-1">Kehadiran Bulan Ini</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
