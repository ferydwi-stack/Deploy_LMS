'use client';

import React, { useState, useEffect, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, FileCheck2, CalendarCheck, Upload, Download, Trash2, X, Eye, Video, FileText, Link2, Presentation, CheckCircle2, UploadCloud } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { api, getStorageUrl } from '@/lib/api';
import type { Material } from '@/types/models';

function GuruMateriContent() {
  const searchParams = useSearchParams();
  const { user: currentUser } = useAuth();

  const courseTitle = searchParams.get('title') || 'Kelas Pembelajaran';
  const courseTeacher = searchParams.get('teacher') || (currentUser?.name || 'Guru');
  const courseCode = searchParams.get('code') || 'MAPEL';
  const courseId = searchParams.get('course_id') || '1';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewMateri, setPreviewMateri] = useState<any>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

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
        url: getStorageUrl(m.file_path)
      }));
    }
    return [];
  }, [courseId]);

  const { data: materiData, loading: isLoading, refresh: refreshMaterials } = useRealtimeData(
    loadMateriFromApi,
    60000,
    [courseId]
  );

  const materiList = materiData || [];

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMateri.title) return;

    try {
      const fileCategory = selectedFile 
        ? (selectedFile.type.includes('video') ? 'Video Tutorial' 
            : selectedFile.type.includes('pdf') ? 'PDF Document' 
            : selectedFile.type.includes('presentation') ? 'Presentation Slides' 
            : selectedFile.type.includes('image') ? 'Gambar/Ilustrasi'
            : 'Dokumen') 
        : 'Link Resource';
      
      const contentWithCategory = `${newMateri.desc || 'Ringkasan materi modul pembelajaran.'} [Category: ${fileCategory}]`;
      const formData = new FormData();
      formData.append('course_id', String(parseInt(courseId)));
      formData.append('title', newMateri.title);
      formData.append('content', contentWithCategory);
      if (selectedFile) formData.append('file', selectedFile);

      await api.createMaterial(formData);

      setNewMateri({ title: '', desc: '', category: 'PDF Document', url: '' });
      setSelectedFile(null);
      setIsModalOpen(false);
      setSuccessNotice(`Materi "${newMateri.title}" berhasil diunggah!`);
      setTimeout(() => setSuccessNotice(null), 4000);
      await refreshMaterials();
    } catch (err: any) {
      console.error('Create material error:', err);
      alert(err.message || 'Gagal menyimpan materi baru');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) setSelectedFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const getCategoryIcon = (category: string) => {
    if (category.includes('Video')) return <Video className="w-5 h-5 text-purple-600" />;
    if (category.includes('Presentation')) return <Presentation className="w-5 h-5 text-amber-600" />;
    if (category.includes('Link')) return <Link2 className="w-5 h-5 text-blue-600" />;
    return <FileText className="w-5 h-5 text-emerald-600" />;
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      await api.deleteMaterial(itemToDelete.id);
      await refreshMaterials();
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (e: any) {
      console.error('Failed to delete material:', e);
      alert(e.message || 'Gagal menghapus materi');
    }
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
        <div className="flex items-center gap-4 sm:gap-6 border-b border-slate-200 text-xs sm:text-sm font-bold pt-2 overflow-x-auto whitespace-nowrap scrollbar-none">
          <Link
            href={`/guru/materi${queryParamsStr}`}
            className="flex items-center gap-2 pb-3 text-[#2563EB] border-b-2 border-[#2563EB] shrink-0"
          >
            <BookOpen className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span>Materi Pembelajaran</span>
          </Link>
          <Link
            href={`/guru/tugas${queryParamsStr}`}
            className="flex items-center gap-2 pb-3 text-slate-500 hover:text-slate-900 transition shrink-0"
          >
            <FileCheck2 className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Tugas Kelas</span>
          </Link>
          <Link
            href={`/guru/absensi${queryParamsStr}`}
            className="flex items-center gap-2 pb-3 text-slate-500 hover:text-slate-900 transition shrink-0"
          >
            <CalendarCheck className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Kehadiran / Absensi</span>
          </Link>
        </div>
      </div>

      {/* Success Toast */}
      {successNotice && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="break-words">{successNotice}</span>
        </div>
      )}

      {/* Main Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Daftar Modul & Bahan Ajar</h3>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Unggah Materi Baru</span>
        </button>
      </div>

      {/* Materi Cards List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {[1, 2].map((n) => (
            <div key={n} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs animate-pulse space-y-3">
              <div className="h-5 w-1/3 bg-slate-200 rounded-md"></div>
              <div className="h-4 w-3/4 bg-slate-100 rounded-md"></div>
            </div>
          ))}
        </div>
      ) : materiList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {materiList.map((materi) => (
            <div
              key={materi.id}
              className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition overflow-hidden min-w-0"
            >
              <div className="min-w-0">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 font-bold rounded-full font-mono text-[11px]">
                    {materi.category}
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                    {getCategoryIcon(materi.category)}
                  </div>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-1.5 break-words">{materi.title}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 break-all whitespace-pre-wrap">{materi.desc}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
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
                  onClick={() => {
                    setItemToDelete(materi);
                    setIsDeleteModalOpen(true);
                  }}
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

      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Hapus Materi</h3>
              <button
                onClick={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Materi ini akan dihapus permanen dan tidak bisa dikembalikan.</p>
              <p className="text-sm font-bold text-slate-900">{itemToDelete.title}</p>
            </div>

            <div className="pt-4 mt-6 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => { setIsDeleteModalOpen(false); setItemToDelete(null); }}
                className="px-5 py-3 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-rose-500/25 transition cursor-pointer"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
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
                <div className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-600">
                  {selectedFile ? `Otomatis: ${selectedFile.type || selectedFile.name.split('.').pop()?.toUpperCase() || 'File'}` : 'Otomatis mengikuti jenis file yang dipilih'}
                </div>
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
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Upload File Materi</label>
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition ${dragActive ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-slate-50/50'}`}
                >
                  <input
                    type="file"
                    className="hidden"
                    id="material-upload-input"
                    onChange={handleFileChange}
                  />
                  {selectedFile ? (
                    <div className="flex items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <UploadCloud className="w-5 h-5 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0 text-left">
                          <p className="text-xs font-bold text-slate-900 truncate">{selectedFile.name}</p>
                          <p className="text-[10px] text-slate-400">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedFile(null)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label htmlFor="material-upload-input" className="cursor-pointer block">
                      <div className="flex flex-col items-center justify-center py-4">
                        <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-xs font-bold text-slate-700">Seret file atau klik untuk pilih</p>
                        <p className="text-[10px] text-slate-400 mt-1">Format bebas (Maks: 50MB)</p>
                      </div>
                    </label>
                  )}
                </div>
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
