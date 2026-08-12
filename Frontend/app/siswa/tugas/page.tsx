'use client';

import React, { useState, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, FileCheck2, CalendarCheck, FileEdit, CheckCircle2, Clock, Upload, X, Award, Eye, Filter, FileText } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { api } from '@/lib/api';

export default function SiswaTugasPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
      <SiswaTugasContent />
    </Suspense>
  );
}

function SiswaTugasContent() {
  const searchParams = useSearchParams();
  const courseTitle = searchParams.get('title') || 'Tugas Kelas';
  const courseTeacher = searchParams.get('teacher') || 'Guru';
  const courseCode = searchParams.get('code') || 'COURSE';
  const courseId = searchParams.get('course_id') || '1';

  const queryParamsStr = `?course_id=${courseId}&title=${encodeURIComponent(courseTitle)}&teacher=${encodeURIComponent(courseTeacher)}&code=${encodeURIComponent(courseCode)}`;

  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [viewGradeTask, setViewGradeTask] = useState<any>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'submitted' | 'graded'>('all');
  const [submitFile, setSubmitFile] = useState<File | null>(null);
  const [submitNote, setSubmitNote] = useState('');
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const { user: currentUser } = useAuth();

  const { data: assignments } = useRealtimeData(
    () => api.getAssignments(courseId),
    60000,
    [courseId]
  );

  const { data: mySubmissions } = useRealtimeData(
    () => api.getMySubmissions(),
    60000,
    []
  );

  const tasks = (() => {
    if (!Array.isArray(assignments) || assignments.length === 0) return [];

    const submissionsMap = new Map();
    if (Array.isArray(mySubmissions)) {
      mySubmissions.forEach((sub: any) => {
        submissionsMap.set(sub.assignment_id, sub);
      });
    }

    return assignments.map((a: any) => {
      const sub = submissionsMap.get(a.id);
      let taskStatus = 'Belum Dikumpulkan';
      let taskGrade = null;
      let taskFeedback = null;
      let taskFile = null;

      if (sub) {
        if (sub.score !== undefined && sub.score !== null && sub.score !== '') {
          taskStatus = 'Sudah Dinilai';
          taskGrade = sub.score;
          taskFeedback = sub.teacher_feedback || 'Sangat Baik';
        } else {
          taskStatus = 'Sudah Dikumpul';
          taskFeedback = sub.note || 'Berkas diterima, menunggu koreksi guru.';
        }
        taskFile = sub.file_url || sub.file;
      }

      return {
        id: a.id.toString(),
        title: a.title,
        category: a.type || 'Tugas Harian',
        course: a.course ? (a.course.title || a.course.name) : 'Kelas XI IPA',
        teacher: a.course && a.course.teacher ? (a.course.teacher.name || a.course.teacher) : 'Guru Pengajar',
        deadline: a.deadline || '2026-08-05 23:59',
        status: taskStatus,
        grade: taskGrade,
        feedback: taskFeedback,
        submittedFile: taskFile,
        description: a.description || a.instructions || a.detail || ''
      };
    });
  })();

  const handleOpenSubmitModal = (t: any) => {
    setSelectedTask(t);
    setSubmitFile(null);
    setSubmitNote('');
    setIsSubmitModalOpen(true);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSubmitFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSubmitFile(e.target.files[0]);
    }
  };

  const handleSubmitTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    try {
      const formData = new FormData();
      if (submitFile) {
        formData.append('file', submitFile);
      }
      formData.append('note', submitNote || 'Tugas dikumpulkan via web LMS');

      await api.submitAssignment(selectedTask.id, formData);

      setIsSubmitModalOpen(false);
      setSubmittedNotice(`Tugas "${selectedTask.title}" berhasil dikumpulkan!`);
      setTimeout(() => setSubmittedNotice(null), 4000);
    } catch (err) {
      console.error('Submit error:', err);
      alert('Gagal mengirim tugas. Silakan coba lagi.');
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
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{courseTitle}</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Pengajar: <strong className="text-slate-700">{courseTeacher}</strong> | Kode: {courseCode}
            </p>
          </div>
        </div>

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
            className="flex items-center gap-2 pb-3 text-[#2563EB] border-b-2 border-[#2563EB]"
          >
            <FileCheck2 className="w-4 h-4 text-[#2563EB]" />
            <span>Tugas Kelas</span>
          </Link>
          <Link
            href={`/siswa/absensi${queryParamsStr}`}
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
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${filterStatus === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
          >
            Semua ({tasks.length})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${filterStatus === 'pending' ? 'bg-amber-500 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
          >
            Perlu Dikerjakan ({tasks.filter(t => t.status === 'Belum Dikumpulkan').length})
          </button>
          <button
            onClick={() => setFilterStatus('submitted')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${filterStatus === 'submitted' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
          >
            Sudah Dikirim ({tasks.filter(t => t.status === 'Sudah Dikumpul').length})
          </button>
          <button
            onClick={() => setFilterStatus('graded')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${filterStatus === 'graded' ? 'bg-emerald-600 text-white' : 'text-slate-500 hover:text-slate-900'
              }`}
          >
            Sudah Dinilai ({tasks.filter(t => t.status === 'Sudah Dinilai').length})
          </button>
        </div>
      </div>

      {/* Task Cards */}
      <div className="space-y-4">
        {filteredTasks.map((task) => (
          <div key={task.id} className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-slate-900">{task.title}</h4>
                <p className="text-xs text-slate-500 mt-1">{task.description}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                {task.status}
              </span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>Deadline: {task.deadline}</span>
              <span>•</span>
              {task.submittedFile ? (
                <a
                  href={task.submittedFile.startsWith('http') ? task.submittedFile : `http://127.0.0.1:8000/storage/${task.submittedFile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  File: {task.submittedFile}
                </a>
              ) : (
                <span>File: -</span>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {task.status === 'Belum Dikumpulkan' && (
                <button
                  onClick={() => handleOpenSubmitModal(task)}
                  className="px-4 py-2 rounded-2xl bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 transition"
                >
                  Kumpulkan Tugas
                </button>
              )}
              {task.status === 'Sudah Dinilai' && (
                <button
                  onClick={() => setViewGradeTask(task)}
                  className="px-4 py-2 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition"
                >
                  Lihat Nilai
                </button>
              )}
            </div>
          </div>
        ))}
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
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">File Jawaban</label>
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-8 text-center transition flex flex-col items-center justify-center ${
                    dragActive
                      ? 'border-blue-600 bg-blue-50/50'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                  }`}
                >
                  {submitFile ? (
                    <div className="flex items-center gap-3 bg-white p-3 px-4 rounded-xl border border-slate-200 shadow-xs max-w-md w-full justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileEdit className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="text-left overflow-hidden">
                          <p className="text-xs font-bold text-slate-900 truncate">{submitFile.name}</p>
                          <p className="text-[10px] text-slate-400">{(submitFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSubmitFile(null)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        Tarik dan lepaskan file jawaban ke sini, atau{' '}
                        <label className="text-blue-600 hover:text-blue-700 cursor-pointer underline">
                          pilih file
                          <input
                            type="file"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Mendukung PDF, DOCX, PPTX, ZIP, JPG, PNG. Maksimal ukuran: 50 MB.
                      </p>
                    </div>
                  )}
                </div>
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
                  className="px-5 py-3 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition"
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
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 text-center">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nilai Akhir Tugas</p>
                <p className="text-5xl font-extrabold text-emerald-600 font-mono tracking-tight">{viewGradeTask.grade}</p>
                <span className="inline-block mt-2 px-3 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full">
                  Status: Tuntas
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl space-y-1 text-xs">
                <p className="font-bold text-slate-700">Catatan Umpan Balik Guru:</p>
                <p className="text-slate-600 leading-relaxed italic">"{viewGradeTask.feedback}"</p>
              </div>

              <div className="text-[11px] text-slate-400 font-mono truncate">
                File Terkirim: {viewGradeTask.submittedFile}
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewGradeTask(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition"
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
