'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { ArrowLeft, BookOpen, FileCheck2, CalendarCheck, CheckCircle2, Award, X, FileText, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { api, ensureArray, getStorageUrl } from '@/lib/api';

export default function SiswaTugasPage() {
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [viewGradeTask, setViewGradeTask] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitNote, setSubmitNote] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);

  const { user: currentUser } = useAuth();

  const { data: assignmentsRes, loading: assignmentsLoading } = useRealtimeData(
    () => api.getAssignments(),
    5000,
    []
  );

  const { data: mySubmissionsRes } = useRealtimeData(
    () => api.getMySubmissions(),
    5000,
    []
  );

  const assignments = ensureArray(assignmentsRes, 'assignments');
  const mySubmissions = ensureArray(mySubmissionsRes, 'submissions');

  const tasks = (() => {
    if (assignments.length === 0) return [];

    const submissionsMap = new Map();
    mySubmissions.forEach((sub: any) => {
      submissionsMap.set(String(sub.assignment_id), sub);
    });

    return assignments.map((a: any) => {
      const sub = submissionsMap.get(String(a.id));
      let taskStatus = 'Belum Dikumpulkan';
      let taskGrade = null;
      let taskFeedback = null;
      let taskFile = null;

      if (sub) {
        if (sub.score !== undefined && sub.score !== null && sub.score !== '') {
          taskStatus = 'Sudah Dinilai';
          taskGrade = sub.score;
          taskFeedback = sub.teacher_feedback || 'Tugas telah dinilai.';
        } else {
          taskStatus = 'Sudah Dikumpul';
          taskFeedback = sub.note || 'Berkas diterima, menunggu koreksi guru.';
        }
        taskFile = sub.file_path ? getStorageUrl(sub.file_path) : (sub.original_filename || sub.file || null);
      }

      return {
        id: String(a.id),
        title: a.title,
        category: a.instruction || 'Tugas Harian',
        course: a.course ? (a.course.title || a.course.name) : 'Kelas Terdaftar',
        teacher: a.course && a.course.teacher ? (a.course.teacher.name || a.course.teacher) : 'Guru Pengajar',
        deadline: a.due_date ? a.due_date.replace('T', ' ').substring(0, 16) : 'Tanpa Tenggat',
        status: taskStatus,
        grade: taskGrade,
        feedback: taskFeedback,
        submittedFile: taskFile,
        description: a.description || a.detail || a.instruction || ''
      };
    });
  })();

  const handleOpenSubmitModal = (t: any) => {
    setSelectedTask(t);
    setSubmitFile(null);
    setSubmitNote('');
    setIsSubmitModalOpen(true);
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      const formData = new FormData();
      formData.append('note', submitNote || 'Tugas dikumpulkan via LMS');
      if (submitFile) {
        formData.append('file', submitFile);
      }

      await api.submitAssignment(selectedTask.id, formData);

      setIsSubmitModalOpen(false);
      setSubmittedNotice(`Tugas "${selectedTask.title}" berhasil dikumpulkan!`);
      setTimeout(() => setSubmittedNotice(null), 4000);
    } catch (err: any) {
      console.error('Submit error:', err);
      alert(err.message || 'Gagal mengirim tugas. Silakan coba lagi.');
    }
  };

  const filteredTasks = tasks.filter(t => {
    if (filterStatus === 'pending') return t.status === 'Belum Dikumpulkan';
    if (filterStatus === 'submitted') return t.status === 'Sudah Dikumpul';
    if (filterStatus === 'graded') return t.status === 'Sudah Dinilai';
    return true;
  });

  return (
    <DashboardLayout
      role="siswa"
      title="Tugas & Penilaian Siswa"
      subtitle="Daftar tugas kelas (perlu dikerjakan, menunggu koreksi, maupun yang sudah dinilai)"
    >
      {/* Top Toast Notice */}
      {submittedNotice && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{submittedNotice}</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-mono">Status Updated</span>
        </div>
      )}

      {/* Course Subtab Navigation */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link
            href="/siswa/courses"
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition shadow-xs"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Tugas & Penugasan Terdaftar</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Daftar penugasan aktif dari seluruh mata pelajaran yang Anda ikuti
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6 border-b border-slate-200 text-sm font-bold pt-2">
          <Link
            href="/siswa/materi"
            className="flex items-center gap-2 pb-3 text-slate-500 hover:text-slate-900 transition"
          >
            <BookOpen className="w-4 h-4 text-slate-400" />
            <span>Materi Pembelajaran</span>
          </Link>
          <Link
            href="/siswa/tugas"
            className="flex items-center gap-2 pb-3 text-[#2563EB] border-b-2 border-[#2563EB]"
          >
            <FileCheck2 className="w-4 h-4 text-[#2563EB]" />
            <span>Tugas Kelas</span>
          </Link>
          <Link
            href="/siswa/absensi"
            className="flex items-center gap-2 pb-3 text-slate-500 hover:text-slate-900 transition"
          >
            <CalendarCheck className="w-4 h-4 text-slate-400" />
            <span>Kehadiran / Absensi</span>
          </Link>
        </div>
      </div>

      {/* Section Header & Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Daftar Penugasan</h3>

        <div className="flex items-center gap-1.5 bg-[#F8FAFC] p-1.5 rounded-2xl border border-slate-200/80">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Semua ({tasks.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'pending' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Perlu Dikerjakan ({tasks.filter(t => t.status === 'Belum Dikumpulkan').length})
          </button>
          <button
            onClick={() => setFilterStatus('submitted')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'submitted' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sudah Dikirim ({tasks.filter(t => t.status === 'Sudah Dikumpul').length})
          </button>
          <button
            onClick={() => setFilterStatus('graded')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'graded' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sudah Dinilai ({tasks.filter(t => t.status === 'Sudah Dinilai').length})
          </button>
        </div>
      </div>

      {/* Task Cards */}
      <div className="space-y-4">
        {assignmentsLoading ? (
          [1, 2].map((n) => (
            <div key={n} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs animate-pulse space-y-3">
              <div className="h-5 w-1/3 bg-slate-200 rounded-md"></div>
              <div className="h-4 w-1/4 bg-slate-100 rounded-md"></div>
            </div>
          ))
        ) : filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div key={task.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 bg-blue-50 text-[#2563EB] font-bold rounded-full text-[10px]">
                      {task.course}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Pengajar: {task.teacher}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{task.title}</h4>
                  {task.description && <p className="text-xs text-slate-500 mt-1">{task.description}</p>}
                </div>
                <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${
                  task.status === 'Sudah Dinilai'
                    ? 'bg-emerald-100 text-emerald-700'
                    : task.status === 'Sudah Dikumpul'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {task.status}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 font-mono">
                <span>Tenggat: {task.deadline}</span>
                {task.submittedFile && (
                  <>
                    <span>•</span>
                    <a
                      href={task.submittedFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#2563EB] hover:underline flex items-center gap-1 font-semibold"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>File Terlampir</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {task.status === 'Belum Dikumpulkan' && (
                  <button
                    onClick={() => handleOpenSubmitModal(task)}
                    className="px-4 py-2 rounded-2xl bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                  >
                    Kumpulkan Tugas
                  </button>
                )}
                {task.status === 'Sudah Dinilai' && (
                  <button
                    onClick={() => setViewGradeTask(task)}
                    className="px-4 py-2 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                  >
                    Lihat Nilai & Feedback
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-xs">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h4 className="text-base font-bold text-slate-900 mb-1">Belum Ada Tugas Kelas</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Belum ada tugas yang diberikan oleh guru untuk kelas yang Anda ikuti saat ini.
            </p>
          </div>
        )}
      </div>

      {/* Modal Kumpulkan Jawaban */}
      {isSubmitModalOpen && selectedTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Kumpulkan Jawaban Tugas</h3>
                <p className="text-xs text-slate-400 font-medium">{selectedTask.title}</p>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Unggah File Jawaban (.pdf, .docx, .zip)</label>
                <input
                  type="file"
                  onChange={(e) => setSubmitFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Catatan Tambahan (Opsional)</label>
                <textarea
                  rows={3}
                  placeholder="Tuliskan catatan singkat untuk Guru jika ada..."
                  value={submitNote}
                  onChange={(e) => setSubmitNote(e.target.value)}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-5 py-3 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition cursor-pointer"
                >
                  Kirimkan Jawaban
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Lihat Nilai & Umpan Balik */}
      {viewGradeTask && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Hasil Penilaian Guru</h3>
                  <p className="text-xs text-slate-400 font-medium">{viewGradeTask.title}</p>
                </div>
              </div>
              <button
                onClick={() => setViewGradeTask(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nilai Akhir Tugas</p>
                <p className="text-5xl font-extrabold text-emerald-600 font-mono tracking-tight">{viewGradeTask.grade}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                  Status: Dinilai
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-1 text-xs">
                <p className="font-bold text-slate-700">Catatan Umpan Balik Guru:</p>
                <p className="text-slate-600 leading-relaxed italic">"{viewGradeTask.feedback}"</p>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewGradeTask(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
