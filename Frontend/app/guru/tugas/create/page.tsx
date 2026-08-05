'use client';

import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  UploadCloud, 
  FileText, 
  X, 
  Calendar, 
  BookOpen, 
  CheckCircle2,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export default function GuruBuatTugasPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(false);

  const [formData, setFormData] = useState({
    judul: '',
    kelas: 'X-IPA 1',
    mataPelajaran: 'Matematika Wajib',
    deskripsi: '',
    tenggatTanggal: '',
    tenggatWaktu: '23:59',
    bobotNilai: '100',
  });

  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setAttachedFiles(prev => [...prev, ...filesArray]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessMessage(true);
      setTimeout(() => {
        router.push('/guru/tugas');
      }, 1500);
    }, 800);
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
            href="/guru/tugas"
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
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Pilih Kelas <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.kelas}
                  onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                >
                  <option value="X-IPA 1">X-IPA 1</option>
                  <option value="X-IPA 2">X-IPA 2</option>
                  <option value="XI-IPA 1">XI-IPA 1</option>
                  <option value="XI-IPA 2">XI-IPA 2</option>
                  <option value="XII-IPA 1">XII-IPA 1</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Mata Pelajaran <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.mataPelajaran}
                  onChange={(e) => setFormData({ ...formData, mataPelajaran: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition"
                >
                  <option value="Matematika Wajib">Matematika Wajib</option>
                  <option value="Matematika Peminatan">Matematika Peminatan</option>
                </select>
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
              <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center bg-slate-50/50 transition cursor-pointer relative">
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
              {attachedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  <p className="text-xs font-bold text-slate-700">Lampiran Terpilih ({attachedFiles.length}):</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {attachedFiles.map((file, idx) => (
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
              href="/guru/tugas"
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
