'use client';

import React, { useState, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  UploadCloud, 
  FileText, 
  FileSpreadsheet, 
  Video, 
  File, 
  CheckCircle2, 
  X, 
  AlertCircle,
  Upload,
  ChevronDown
} from 'lucide-react';
import { api } from '@/lib/api';

export default function GuruUnggahMateriPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
      <GuruUnggahMateriContent />
    </Suspense>
  );
}

function GuruUnggahMateriContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('course_id') || '';
  const courseTitle = searchParams.get('title') || '';
  const courseTeacher = searchParams.get('teacher') || '';
  const courseCode = searchParams.get('code') || '';
  const queryParamsStr = `?course_id=${courseId}&title=${encodeURIComponent(courseTitle)}&teacher=${encodeURIComponent(courseTeacher)}&code=${encodeURIComponent(courseCode)}`;

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [formData, setFormData] = useState({
    judul: '',
    kelas: 'X-IPA 1',
    jenis: 'PDF',
    deskripsi: ''
  });

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
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !formData.deskripsi) {
      alert('Pilih file materi atau masukkan deskripsi/link terlebih dahulu.');
      return;
    }
    setLoading(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('course_id', courseId);
      uploadFormData.append('title', formData.judul);
      uploadFormData.append('content', formData.deskripsi || 'Modul materi pembelajaran');
      uploadFormData.append('type', formData.jenis);
      if (selectedFile) uploadFormData.append('file', selectedFile);

      await api.createMaterial(uploadFormData);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        router.push(`/guru/materi${queryParamsStr}`);
      }, 1500);
    } catch (err) {
      console.error('Upload error:', err);
      alert('Gagal mengunggah materi. Silakan coba lagi.');
      setLoading(false);
    }
  };

  return (
    <DashboardLayout 
      role="guru" 
      title="Unggah Materi Baru" 
      subtitle="Upload file materi pembelajaran"
    >
      {/* Back Link */}
      <div className="mb-6">
        <Link
          href={`/guru/materi${queryParamsStr}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition bg-white border border-slate-200 px-3.5 py-2 rounded-xl shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Materi Pembelajaran</span>
        </Link>
      </div>

      {/* Toast Alert */}
      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Materi Berhasil Diunggah!</p>
              <p className="text-xs text-emerald-600">Siswa di kelas terkait sekarang dapat mengunduh materi ini.</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Upload Form Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 max-w-4xl">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-600">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Formulir Unggah Pembelajaran</h2>
            <p className="text-xs text-slate-500">Lengkapi rincian berkas dan pilih kelas tujuan</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Judul Materi */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Judul Materi Pembelajaran <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                placeholder="Contoh: Modul 2 - Trigonometri Analitis & Identitas"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>

              {/* Pilih Kelas Dropdown */}
            {/* Field kelas disembunyikan/dihapus karena kita langsung bind ke courseId dari URL */}

            {/* Jenis Materi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Jenis File / Format <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={formData.jenis}
                  onChange={(e) => setFormData({ ...formData, jenis: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition appearance-none pr-10"
                >
                  <option className="bg-white text-slate-900" value="PDF">Dokumen PDF (.pdf)</option>
                  <option className="bg-white text-slate-900" value="PPT">Presentasi Slides (.ppt / .pptx)</option>
                  <option className="bg-white text-slate-900" value="Video">Video Pembelajaran (.mp4 / .mkv)</option>
                  <option className="bg-white text-slate-900" value="Dokumen">Dokumen Word (.doc / .docx)</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Deskripsi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Deskripsi Singkat / Catatan Siswa
            </label>
            <textarea
              rows={3}
              value={formData.deskripsi}
              onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
              placeholder="Berikan petunjuk membaca modul atau gambaran umum topik..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
            />
          </div>

          {/* Upload Drop Zone Area */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              File Materi Pembelajaran <span className="text-rose-500">*</span>
            </label>

            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition flex flex-col items-center justify-center ${
                dragActive
                  ? 'border-indigo-600 bg-indigo-50/50'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <div className="p-3 bg-white shadow-xs rounded-2xl border border-slate-200 text-indigo-600 mb-3">
                <UploadCloud className="w-8 h-8" />
              </div>

              {selectedFile ? (
                <div className="flex items-center gap-3 bg-white p-3 px-4 rounded-xl border border-slate-200 shadow-xs max-w-md w-full justify-between">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="w-5 h-5 text-indigo-600 flex-shrink-0" />
                    <div className="text-left overflow-hidden">
                      <p className="text-xs font-bold text-slate-900 truncate">{selectedFile.name}</p>
                      <p className="text-[10px] text-slate-400">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
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
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    Tarik dan lepaskan file ke sini, atau{' '}
                    <label className="text-indigo-600 hover:text-indigo-700 cursor-pointer underline">
                      pilih file
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Mendukung PDF, PPTX, MP4, atau DOCX. Maksimal ukuran berkas: 50 MB.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link
              href={`/guru/materi${queryParamsStr}`}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-sm flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Mengunggah...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Unggah Materi</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
