'use client';

import React, { useState, Suspense } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ArrowLeft, 
  UploadCloud, 
  FileText, 
  X, 
  Calendar, 
  BookOpen, 
  CheckCircle2,
  Sparkles,
  HelpCircle,
  ChevronDown
} from 'lucide-react';
import { api } from '@/lib/api';
import { useLms } from '@/context/LmsContext';

export default function GuruBuatTugasPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
      <GuruBuatTugasContent />
    </Suspense>
  );
}

function GuruBuatTugasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('course_id') || '';
  const courseTitle = searchParams.get('title') || '';
  const courseTeacher = searchParams.get('teacher') || '';
  const courseCode = searchParams.get('code') || '';
  const queryParamsStr = `?course_id=${courseId}&title=${encodeURIComponent(courseTitle)}&teacher=${encodeURIComponent(courseTeacher)}&code=${encodeURIComponent(courseCode)}`;

  useLms();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  
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
    if (e.dataTransfer.files?.length) setSelectedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length) setSelectedFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
  };

  const removeFile = (index: number) => setSelectedFiles(prev => prev.filter((_, i) => i !== index));

  const [formData, setFormData] = useState({
    judul: '',
    kelas: 'X-IPA 1',
    mataPelajaran: 'Matematika Wajib',
    deskripsi: '',
    tenggatTanggal: '',
    tenggatWaktu: '23:59',
    bobotNilai: '100',
  });


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('course_id', courseId);
      uploadFormData.append('title', formData.judul);
      uploadFormData.append('instruction', `Modul/Kategori: ${formData.mataPelajaran}\n\n${formData.deskripsi}`);
      if (formData.tenggatTanggal) {
        uploadFormData.append('due_date', `${formData.tenggatTanggal} ${formData.tenggatWaktu}:00`);
      }
      if (selectedFiles.length > 0) {
        uploadFormData.append('file', selectedFiles[0]); // ambil file pertama saja sesuai backend
      }

      await api.createAssignment(uploadFormData);
      
      setIsSubmitting(false);
      setSuccessMessage(true);
      setTimeout(() => {
        router.push(`/guru/tugas${queryParamsStr}`);
      }, 1500);
    } catch (err: any) {
      console.error('Upload assignment error:', err);
      alert('Gagal membuat tugas. Silakan coba lagi.');
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout 
      role="guru" 
      title="Buat Tugas Baru" 
      subtitle="Formulir pembuatan tugas untuk siswa"
    >
      <div className="max-w-4xl mx-auto">
        {/* Back Link Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href={`/guru/tugas${queryParamsStr}`}
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-indigo-600 transition bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Kembali ke Daftar Tugas</span>
          </Link>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-3 text-emerald-800 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">Tugas Berhasil Dibuat!</p>
              <p className="text-xs text-emerald-700">Mengalihkan ke halaman daftar tugas...</p>
            </div>
          </div>
        )}

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            
            {/* Header Section */}
            <div className="border-b border-slate-100 pb-5">
              <h2 className="text-base font-extrabold text-slate-900">Informasi Tugas</h2>
              <p className="text-xs text-slate-500 mt-0.5">Lengkapi rincian tugas yang akan didistribusikan kepada siswa.</p>
            </div>

            {/* Judul Tugas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Judul Tugas <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                placeholder="Contoh: Tugas 1 - Persamaan Kuadrat & Matriks"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
              />
            </div>

            {/* Grid 2 Columns: Kelas & Mata Pelajaran */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Kelas Dropdown (Hidden because tied to active course) */}
              
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Kategori Tugas <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.mataPelajaran}
                    onChange={(e) => setFormData({ ...formData, mataPelajaran: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition appearance-none pr-10"
                  >
                    <option className="bg-white text-slate-900" value="Tugas Harian">Tugas Harian</option>
                    <option className="bg-white text-slate-900" value="UTS">UTS (Ujian Tengah Semester)</option>
                    <option className="bg-white text-slate-900" value="UAS">UAS (Ujian Akhir Semester)</option>
                    <option className="bg-white text-slate-900" value="Remedi UTS">Remedial UTS</option>
                    <option className="bg-white text-slate-900" value="Remedi UAS">Remedial UAS</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Grid 2 Columns: Tenggat Waktu & Bobot Nilai */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tenggat Tanggal <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={formData.tenggatTanggal}
                  onChange={(e) => setFormData({ ...formData, tenggatTanggal: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Tenggat Jam <span className="text-rose-500">*</span>
                </label>
                <input
                  type="time"
                  required
                  value={formData.tenggatWaktu}
                  onChange={(e) => setFormData({ ...formData, tenggatWaktu: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Bobot Nilai Maksimal <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  required
                  min="10"
                  max="100"
                  value={formData.bobotNilai}
                  onChange={(e) => setFormData({ ...formData, bobotNilai: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Deskripsi Tugas */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Deskripsi & Petunjuk Pengerjaan <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={5}
                required
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                placeholder="Tuliskan petunjuk pengerjaan tugas, tata cara pengumpulan, dan instruksi lengkap untuk siswa..."
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition resize-y"
              />
            </div>

            {/* File Upload / Lampiran Area */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Lampiran / Dokumen Pendukung (Opsional)
              </label>
<div
                 onDragEnter={handleDrag}
                 onDragOver={handleDrag}
                 onDragLeave={handleDrag}
                 onDrop={handleDrop}
                 className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer relative ${dragActive ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50'}`}
               >
                 <input
                   type="file"
                   multiple
                   onChange={handleFileChange}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                 />
                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-slate-800">
                    Klik untuk memilih file atau seret & lepas dokumen di sini
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Format didukung: PDF, DOCX, XLSX, PPTX, JPG, PNG (Maks. 25MB)
                  </p>
                </div>
              </div>

              {/* List of uploaded files */}
              {selectedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold text-slate-700">Lampiran Terpilih ({selectedFiles.length}):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedFiles.map((file, idx) => (
                      <div 
                        key={idx} 
                        className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl text-xs shadow-xs"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <FileText className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                          <span className="font-semibold text-slate-800 truncate">{file.name}</span>
                          <span className="text-[10px] text-slate-400 font-mono flex-shrink-0">
                            ({(file.size / 1024).toFixed(1)} KB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Footer Submit Buttons */}
          <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex items-center justify-between gap-4">
            <Link
              href={`/guru/tugas${queryParamsStr}`}
              className="px-4 py-2.5 border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Terbitkan Tugas</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
