'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { 
  ArrowLeft, 
  Upload, 
  FileText, 
  Clock, 
  User, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Send,
  Paperclip,
  FileCheck
} from 'lucide-react';

function SubmitTugasContent() {
  const searchParams = useSearchParams();
  const assignmentId = searchParams.get('assignment_id') || searchParams.get('id') || '1';
  const courseId = searchParams.get('course_id') || '1';
  const courseTitle = searchParams.get('title') || 'Kelas Pembelajaran';
  const courseTeacher = searchParams.get('teacher') || 'Guru Pengajar';
  const courseCode = searchParams.get('code') || 'MAPEL';
  const queryParamsStr = `?course_id=${courseId}&title=${encodeURIComponent(courseTitle)}&teacher=${encodeURIComponent(courseTeacher)}&code=${encodeURIComponent(courseCode)}`;
  
  const [comment, setComment] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [taskDetail, setTaskDetail] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  React.useEffect(() => {
    const loadAssignment = async () => {
      try {
        const { api } = await import('@/lib/api');
        const assignments = await api.getAssignments(courseId).catch(() => []);
        if (Array.isArray(assignments)) {
          const found = assignments.find((a: any) => String(a.id) === String(assignmentId)) || assignments[0];
          if (found) {
            setTaskDetail(found);
          }
        }
      } catch (e) {
        console.error('Failed to load assignment:', e);
      }
    };
    loadAssignment();
  }, [assignmentId, courseId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      alert('Harap upload file tugas Anda terlebih dahulu!');
      return;
    }

    setIsSubmitting(true);
    try {
      const { api, notifyDataChanged } = await import('@/lib/api');
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (comment) formData.append('note', comment);

      await api.submitAssignment(Number(taskDetail?.id || assignmentId), formData);
      notifyDataChanged('lms_courses_updated');
      setIsSuccess(true);
    } catch (err: any) {
      alert(err.message || 'Gagal mengumpulkan tugas. Silakan coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayTaskTitle = taskDetail?.title || searchParams.get('task_title') || 'Tugas Pembelajaran';
  const displayDueDate = taskDetail?.due_date ? new Date(taskDetail.due_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-';
  const displayInstruction = taskDetail?.instruction || 'Silakan kerjakan tugas sesuai instruksi dan unggah file jawaban Anda di bawah.';

  return (
    <DashboardLayout
      role="siswa"
      title="Kirim Tugas"
      subtitle="Upload dan kirimkan hasil pekerjaan Anda"
    >
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <Link
            href={`/siswa/tugas${queryParamsStr}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Tugas</span>
          </Link>
        </div>

        {isSuccess && (
          <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 shadow-sm flex items-start gap-4 animate-fade-in">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-extrabold text-base text-emerald-900">Tugas Berhasil Dikumpulkan!</h4>
              <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                Hasil pekerjaan Anda telah terkirim kepada Guru {courseTeacher} pada {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}.
              </p>
              <div className="mt-3 flex items-center gap-3">
                <Link
                  href={`/siswa/tugas${queryParamsStr}`}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition"
                >
                  Lihat Semua Tugas
                </Link>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  Kirim Ulang
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-extrabold text-xs rounded-lg uppercase tracking-wider">
              {courseCode}
            </span>
            <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Tenggat: {displayDueDate}
            </span>
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              {displayTaskTitle}
            </h2>
            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                {courseTitle}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4 text-slate-400" />
                Guru: <strong className="text-slate-800">{courseTeacher}</strong>
              </span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-xs text-slate-600">
            <h4 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Petunjuk Pengerjaan:</h4>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{displayInstruction}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Upload className="w-5 h-5 text-indigo-600" />
            Formulir Unggah Hasil Pekerjaan
          </h3>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Berkas Tugas (File Submission) <span className="text-rose-500">*</span>
            </label>

            {!selectedFile ? (
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-8 text-center bg-slate-50/50 hover:bg-indigo-50/20 transition cursor-pointer relative group">
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.doc,.zip"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-bold text-slate-800">
                  Tarik & lepas file di sini, atau <span className="text-indigo-600 underline">pilih file</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Format yang didukung: PDF, DOCX, ZIP (Maks 10MB)
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/50 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2.5 bg-indigo-600 text-white rounded-xl shadow-xs shrink-0">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-slate-500 font-medium">Ukuran: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Hapus File"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Catatan / Komentar untuk Guru (Opsional)
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tuliskan catatan tambahan mengenai tugas ini..."
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href={`/siswa/tugas${queryParamsStr}`}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition shadow-md shadow-indigo-200 flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mengirimkan...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim Tugas Sekarang</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

export default function SiswaSubmitTugasPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">Memuat...</div>}>
      <SubmitTugasContent />
    </Suspense>
  );
}
