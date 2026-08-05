'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { Users, BookOpen, GraduationCap, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

export default function AdminDashboardPage() {
  const [counts, setCounts] = useState({
    totalUsers: 0,
    teachers: 0,
    students: 0,
    courses: 0
  });

  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const { api } = await import('@/lib/api');
      const [usersData, coursesData] = await Promise.all([
        api.getUsers().catch(() => []),
        api.getCourses().catch(() => [])
      ]);

      const usersList = Array.isArray(usersData) ? usersData : (usersData?.users || []);
      const coursesList = Array.isArray(coursesData) ? coursesData : (coursesData?.courses || []);

      if (Array.isArray(usersList)) {
        const teacherCount = usersList.filter((u: any) => u.role === 'guru').length;
        const studentCount = usersList.filter((u: any) => u.role === 'siswa').length;
        
        setCounts({
          totalUsers: usersList.length,
          teachers: teacherCount,
          students: studentCount,
          courses: Array.isArray(coursesList) ? coursesList.length : 0
        });

        const latest = usersList.slice(0, 4).map((u: any) => ({
          name: u.name,
          email: u.email,
          role: u.role === 'guru' ? 'Guru' : (u.role === 'siswa' ? 'Siswa' : 'Admin'),
          type: u.role === 'guru' ? 'Teacher' : (u.role === 'siswa' ? 'Student' : 'Admin'),
          date: 'Aktif'
        }));
        setRecentUsers(latest);
      }
    } catch (e) {
      console.error('Failed to load dashboard data from MySQL:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const stats = [
    {
      title: 'Total Akun Pengguna',
      value: isLoading ? '...' : counts.totalUsers.toString(),
      badge: 'Aktif',
      badgeClass: 'bg-[#2563EB]/10 text-[#2563EB]',
      icon: <Users className="w-5 h-5 text-[#2563EB]" />,
      iconBg: 'bg-blue-50'
    },
    {
      title: 'Guru Terdaftar',
      value: isLoading ? '...' : counts.teachers.toString(),
      badge: 'Pengajar',
      badgeClass: 'bg-purple-100/70 text-purple-700',
      icon: <UserCheck className="w-5 h-5 text-purple-600" />,
      iconBg: 'bg-purple-50'
    },
    {
      title: 'Siswa Terdaftar',
      value: isLoading ? '...' : counts.students.toString(),
      badge: 'Peserta Didik',
      badgeClass: 'bg-emerald-100/70 text-emerald-700',
      icon: <GraduationCap className="w-5 h-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50'
    },
    {
      title: 'Total Kelas Aktif',
      value: isLoading ? '...' : counts.courses.toString(),
      badge: 'Aktif',
      badgeClass: 'bg-amber-100/70 text-amber-700',
      icon: <BookOpen className="w-5 h-5 text-amber-600" />,
      iconBg: 'bg-amber-50'
    }
  ];

  return (
    <DashboardLayout
      role="admin"
      title="Dashboard Admin"
      subtitle="Overview sistem manajemen pembelajaran EduSchool"
    >
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 mb-8 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center font-bold text-xl shadow-md">
            AD
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Panel Administrator Utama</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Kelola pengguna (Guru & Siswa) dan pantau daftar kelas sistem.</p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 font-bold rounded-2xl text-xs border border-emerald-200/60">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Sistem Normal (100% Online MySQL)</span>
        </div>
      </div>

      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      {/* Navigation Quick Links Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/admin/users"
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-blue-200 transition group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Management Akun Pengguna</h3>
              <p className="text-xs text-slate-400 font-medium">Kelola, tambah, edit, hapus, dan cari akun Guru & Siswa</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-[#2563EB] transition-all" />
        </Link>

        <Link
          href="/admin/courses"
          className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs hover:shadow-md hover:border-blue-200 transition group flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Daftar Kelas Sistem</h3>
              <p className="text-xs text-slate-400 font-medium">Lihat kelas, guru pengampu, dan daftar siswa anggotanya</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-purple-600 transition-all" />
        </Link>
      </div>
    </DashboardLayout>
  );
}
