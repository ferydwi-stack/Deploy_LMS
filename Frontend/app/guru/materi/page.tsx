'use client';

import React, { useState, useEffect, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, FileCheck2, CalendarCheck, Upload, Download, Trash2, X, Eye, Video, FileText, Link2, Presentation, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { api } from '@/lib/api';
import type { Material } from '@/types/models';

function GuruMateriContent() {
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();

  const courseTitle = searchParams.get('title') || 'Biologi Sel & Genetik Kelas XII';
  const courseTeacher = searchParams.get('teacher') || (currentUser?.name || 'Teacher');
  const courseCode = searchParams.get('code') || 'BIO-XII';
  const courseId = searchParams.get('course_id') || '2';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewMateri, setPreviewMateri] = useState<any>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const [newMateri, setNewMateri] = useState({
    title: '',
    desc: '',
    category: 'PDF Document',
    url: ''
  });

  const loadMateriFromApi = React.useCallback(async () => {
    const data = await api.getMaterials(courseId).catch(() => []);

    if (Array.isArray(data) && data.length > 0) {
      return data.map((m: Material) => ({
        id: m.id,
        category: m.content && m.content.includes('[Category:') 
          ? m.content.split('[Category: ')[1].split(']')[0]
          : 'PDF Document',
        title: m.title,
        desc: m.content ? m.content.split('[Category:')[0].trim() : 'Modul materi pembelajaran terdaftar.',
        url: m.file_path || 'https://school.edu/files/modul.pdf'
      }));
    }
    return [];
  }, [courseId]);

  const { data: materiData, loading: isLoading, refresh: refreshMaterials } = useRealtimeData(
    loadMateriFromApi,
    5000,
    [courseId]
  );

  const materiList = materiData || [];

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMateri.title) return;

    try {
      const contentWithCategory = `${newMateri.desc || 'Ringkasan materi modul pembelajaran.'} [Category: ${newMateri.category}]`;
      
      await api.createMaterial({
        course_id: parseInt(courseId),
        title: newMateri.title,
        content: contentWithCategory,
        file_path: newMateri.url || 'https://school.edu/files/modul.pdf'
      });

      setNewMateri({ title: '', desc: '', category: 'PDF Document', url: '' });
      setIsModalOpen(false);
      setSuccessNotice(`Materi "${newMateri.title}" berhasil diunggah!`);
      setTimeout(() => setSuccessNotice(null), 4000);
      await refreshMaterials();
    } catch (err: any) {
      console.error('Create material error:', err);
      alert(err.message || 'Gagal menyimpan materi baru');
    }
  };

  const handleDelete = async (id: string | number) => {
    try {
      if (typeof id === 'number' || !String(id).startsWith('demo')) {
        await api.deleteMaterial(id);
        await refreshMaterials();
      }
    } catch (e) {
      console.error('Failed to delete material:', e);
    }
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('Video')) return <Video className="w-5 h-5 text-purple-600" />;
    if (category.includes('Presentation')) return <Presentation className="w-5 h-5 text-amber-600" />;
    if (category.includes('Link')) return <Link2 className="w-5 h-5 text-blue-600" />;
    return <FileText className="w-5 h-5 text-emerald-600" />;
  };

  const queryParamsStr = `?course_id=${courseId}&title=${encodeURIComponent(courseTitle)}&teacher=${encodeURIComponent(courseTeacher)}&code=${encodeURIComponent(courseCode)}`;

  return (
    <DashboardLayout
      role="guru"
      title="Modul Pembelajaran"
      subtitle="Kelola dan unggah materi, video tutorial, dan slide bahan ajar kelas"
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
            className="flex items-center gap-2 pb-3 text-[#2563EB] border-b-2 border-[#2563EB]"
          >
            <BookOpen className="w-4 h-4 text-[#2563EB]" />
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
            className="flex items-center gap-2 pb-3 text-slate-500 hover:text-slate-900 transition"
          >
            <CalendarCheck className="w-4 h-4 text-slate-400" />
            <span>Kehadiran / Absensi</span>
          </Link>
        </div>
      </div>

      {/* Success Toast */}
      {successNotice && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Main Section Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Daftar Modul & Bahan Ajar</h3>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer"
        >
          <Upload className="w-4 h-4" />
          <span>Unggah Materi Baru</span>
        </button>
      </div>

      {/* Materi Cards List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs animate-pulse space-y-3">
              <div className="h-5 w-1/3 bg-slate-200 rounded-md"></div>
              <div className="h-4 w-3/4 bg-slate-100 rounded-md"></div>
            </div>
          ))}
        </div>
      ) : materiList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {materiList.map((materi) => (
            <div
              key={materi.id}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold rounded-full font-mono text-[11px]">
                    {materi.category}
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center">
                    {getCategoryIcon(materi.category)}
                  </div>
                </div>

                <h4 className="text-base font-bold text-slate-900 leading-snug mb-1">{materi.title}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6">{materi.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewMateri(materi)}
                    className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#2563EB] font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                  <a
                    href={materi.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5 text-slate-500" />
                    <span>Unduh</span>
                  </a>
                </div>

                <button
                  onClick={() => handleDelete(materi.id)}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition cursor-pointer"
                  title="Hapus Materi"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-xs">
          <div className="w-16 h-16 bg-blue-50 text-[#2563EB] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-8 h-8" />
          </div>
          <h4 className="text-base font-bold text-slate-900 mb-1">Belum Ada Materi Pembelajaran</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-6">
            Materi pembelajaran untuk kelas ini masih kosong. Klik tombol di bawah untuk menambahkan modul pertama.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-md transition inline-flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Unggah Materi Baru</span>
          </button>
        </div>
      )}

      {/* Modal Upload Materi Baru */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Unggah Materi Pembelajaran</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Judul Materi</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modul Struktur DNA & Sintesis Protein"
                  value={newMateri.title}
                  onChange={(e) => setNewMateri({ ...newMateri, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Kategori Format</label>
                <select
                  value={newMateri.category}
                  onChange={(e) => setNewMateri({ ...newMateri, category: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="PDF Document">Dokumen PDF / E-Book</option>
                  <option value="Video Tutorial">Video Tutorial (Link Youtube/MP4)</option>
                  <option value="Presentation Slides">Slide Presentasi (PPTX/PDF)</option>
                  <option value="Link Resource">Link Sumber Eksternal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Deskripsi Singkat</label>
                <textarea
                  placeholder="Ringkasan atau poin-poin utama materi..."
                  value={newMateri.desc}
                  onChange={(e) => setNewMateri({ ...newMateri, desc: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 h-20"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">URL File / Video</label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... atau https://youtube.com/..."
                  value={newMateri.url}
                  onChange={(e) => setNewMateri({ ...newMateri, url: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition cursor-pointer"
                >
                  Simpan Materi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewMateri && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold rounded-full font-mono text-[11px]">
                  {previewMateri.category}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">{previewMateri.title}</h3>
              </div>
              <button
                onClick={() => setPreviewMateri(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-600">
              <p className="leading-relaxed">{previewMateri.desc}</p>
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl font-mono text-[11px] break-all text-blue-600">
                {previewMateri.url}
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setPreviewMateri(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition cursor-pointer"
              >
                Tutup
              </button>
              <a
                href={previewMateri.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-md transition"
              >
                Buka Link Sumber
              </a>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default function GuruMateriPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
      <GuruMateriContent />
    </Suspense>
  );
}
