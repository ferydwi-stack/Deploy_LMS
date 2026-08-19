'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FileEdit, Clock, Search, CheckCircle2, ChevronDown, BookOpen } from 'lucide-react';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { api } from '@/lib/api';

export default function AdminAssignmentsPage() {
  const [search, setSearch] = useState('');
  const [selectedCourseFilter, setSelectedCourseFilter] = useState('all');
  const [coursesList, setCoursesList] = useState<string[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  // Load Real Assignments and Submissions from MySQL API
  const loadAssignmentsFromApi = useCallback(async () => {
    try {
      const [assignmentsData, studentsData, coursesData] = await Promise.all([
        api.getAssignments().catch(() => []),
        api.getUsers('siswa').catch(() => []),
        api.getCourses().catch(() => [])
      ]);

      const realStudentCount = Array.isArray(studentsData) ? studentsData.length : 0;

      if (Array.isArray(coursesData) && coursesData.length > 0) {
        const uniqueTitles = Array.from(new Set(coursesData.map((c: any) => c.title).filter(Boolean)));
        setCoursesList(uniqueTitles as string[]);
      }

      if (Array.isArray(assignmentsData) && assignmentsData.length > 0) {
        const formatted = assignmentsData.map((a: any) => ({
          id: a.id,
          title: a.title,
          course: a.course ? a.course.title : 'Kelas',
          teacher: a.course && a.course.teacher ? (typeof a.course.teacher === 'object' ? a.course.teacher.name : a.course.teacher) : 'Guru',
          deadline: a.due_date ? a.due_date.replace('T', ' ').substring(0, 16) : '-',
          submittedCount: a.submissions_count || 0,
          totalStudents: a.course?.students_count ?? realStudentCount,
          status: (a.submissions_count || 0) >= (a.course?.students_count ?? realStudentCount) && (a.course?.students_count ?? realStudentCount) > 0 ? 'Selesai' : 'Aktif'
        }));
        setAssignments(formatted);
        return formatted;
      } else {
        setAssignments([]);
        return [];
      }
    } catch (e) {
      console.error('Failed to load assignments from MySQL API:', e);
      setAssignments([]);
      return [];
    }
  }, []);

  const { loading: isLoading } = useRealtimeData(
    loadAssignmentsFromApi,
    4000,
    [],
    'lms_courses_updated'
  );

  const filteredAssignments = assignments.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                          item.course.toLowerCase().includes(search.toLowerCase()) ||
                          item.teacher.toLowerCase().includes(search.toLowerCase());
    const matchesCourse = selectedCourseFilter === 'all' || item.course.toLowerCase().includes(selectedCourseFilter.toLowerCase());
    return matchesSearch && matchesCourse;
  });

  // Calculate stats dynamically
  const totalSubmissions = assignments.reduce((acc, curr) => acc + curr.submittedCount, 0);
  const totalPossible = assignments.reduce((acc, curr) => acc + curr.totalStudents, 0);
  const averageRate = totalPossible > 0 ? Math.round((totalSubmissions / totalPossible) * 100) : 0;

  return (
    <DashboardLayout
      role="admin"
      title="Monitoring Tugas Global"
      subtitle="Pemantauan daftar tugas, modul praktikum, dan status pengumpulan siswa buatan Guru"
    >
      {/* Stat Cards Row */}
<div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
  <div className="bg-[#4F46E5] rounded-[22px] p-6 shadow-none flex items-center justify-between text-white">
    <div>
      <p className="text-4xl font-extrabold tracking-tight">{assignments.length}</p>
      <p className="text-xs font-medium mt-1 opacity-90">Total Tugas Aktif</p>
    </div>
    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
      <FileEdit className="w-6 h-6 text-white" />
    </div>
  </div>

  <div className="bg-[#D97706] rounded-[22px] p-6 shadow-none flex items-center justify-between text-white">
    <div>
      <p className="text-4xl font-extrabold tracking-tight">
        {assignments.filter(a => a.status === 'Mendekati Tenggat').length}
      </p>
      <p className="text-xs font-medium mt-1 opacity-90">Mendekati Tenggat</p>
    </div>
    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
      <Clock className="w-6 h-6 text-white" />
    </div>
  </div>

  <div className="bg-[#10B981] rounded-[22px] p-6 shadow-none flex items-center justify-between text-white">
    <div>
      <p className="text-4xl font-extrabold tracking-tight">{averageRate}%</p>
      <p className="text-xs font-medium mt-1 opacity-90">Rata-rata Pengumpulan</p>
    </div>
    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
      <CheckCircle2 className="w-6 h-6 text-white" />
    </div>
  </div>
</div>

      {/* Top Search & Filter Bar */}
      <div className="bg-white border border-[#D6DEE7] rounded-[22px] p-5 mb-6 shadow-none flex flex-wrap items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul tugas, kelas, atau nama guru..."
            className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 pl-10"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={selectedCourseFilter}
              onChange={(e) => setSelectedCourseFilter(e.target.value)}
              className="px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 appearance-none pr-10"
            >
              <option className="bg-white text-slate-900" value="all">Semua Mata Pelajaran</option>
              {coursesList.map((title, idx) => (
                <option key={idx} className="bg-white text-slate-900" value={title}>{title}</option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Assignments List Cards */}
      <div className="space-y-4">
        {isLoading ? (
          [1, 2, 3].map((n) => (
            <div key={n} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs animate-pulse space-y-3">
              <div className="h-5 w-1/3 bg-slate-200 rounded-md"></div>
              <div className="h-4 w-1/4 bg-slate-100 rounded-md"></div>
            </div>
          ))
        ) : filteredAssignments.length > 0 ? (
          filteredAssignments.map((item) => (
            <div
              key={item.id}
              className="bg-[#EFF4F8] border border-[#D6DEE7] rounded-[22px] p-6 shadow-none hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center shrink-0 mt-0.5">
                  <FileEdit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 leading-snug">{item.title}</h3>
                  <p className="text-xs text-slate-400 font-medium mt-0.5">
                    {item.course} • Pengajar: <strong className="text-slate-700">{item.teacher}</strong>
                  </p>
                  <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-white text-slate-700 rounded-xl font-mono text-[11px] font-semibold border border-slate-200">
                    <span>Terkumpul: {item.submittedCount} / {item.totalStudents} Siswa</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:items-end gap-1.5 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold self-start md:self-auto ${
                  item.status === 'Selesai'
                    ? 'bg-emerald-100/70 text-emerald-700'
                    : item.status === 'Mendekati Tenggat'
                    ? 'bg-amber-100/70 text-amber-700'
                    : 'bg-blue-100/70 text-blue-700'
                }`}>
                  {item.status}
                </span>
                <p className="text-[11px] text-slate-400 font-mono">TENGGAT WAKTU</p>
                <p className="text-xs font-bold text-slate-800 font-mono">{item.deadline}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-xs">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h4 className="text-base font-bold text-slate-900 mb-1">Belum Ada Tugas Aktif</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Belum ada tugas atau modul praktikum yang dibuat oleh Guru di sistem.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
