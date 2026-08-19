'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, FileCheck2, CalendarCheck, Download, Eye, X, Video, FileText, Link2, Presentation } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { api, getAuthToken } from '@/lib/api';

const getDownloadUrl = (filePath: string) => {
  if (!filePath) return '';
  const baseUrl = typeof window !== 'undefined' ? window.location.origin.replace('3000', '8000') : 'http://127.0.0.1:8000';
  const token = getAuthToken();
  const url = `${baseUrl}/storage/${filePath}`;
  return token ? `${url}?token=${encodeURIComponent(token)}` : url;
};

function SiswaMateriContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('course_id') || '1';
  const courseTitle = searchParams.get('title') || 'Kelas';
  const courseTeacher = searchParams.get('teacher') || 'Guru';
  const courseCode = searchParams.get('code') || 'COURSE';

  const [previewMateri, setPreviewMateri] = useState<any>(null);

  const loadMaterials = React.useCallback(async () => {
    const data = await api.getMaterials(courseId).catch(() => []);
    if (Array.isArray(data)) {
      return data.map((m: any) => ({
        id: m.id,
        category: m.content && m.content.includes('[Category:') 
          ? m.content.split('[Category: ')[1].split(']')[0]
          : 'PDF Document',
        title: m.title,
        desc: m.content ? m.content.split('[Category:')[0].trim().replace(/https?:\/\/\S+/g, '').trim() : 'Modul materi pembelajaran.',
        url: m.file_path ? getDownloadUrl(m.file_path) : '',
        downloadUrl: m.file_path ? getDownloadUrl(m.file_path) : ''
      }));
    }
    return [];
  }, [courseId]);

  const { data: materiList } = useRealtimeData(loadMaterials, 60000, [courseId]);

  const getCategoryIcon = (category: string) => {
    if (category.includes('Video')) return <Video className="w-5 h-5 text-purple-600" />;
    if (category.includes('Presentation')) return <Presentation className="w-5 h-5 text-amber-600" />;
    if (category.includes('Link')) return <Link2 className="w-5 h-5 text-blue-600" />;
    return <FileText className="w-5 h-5 text-emerald-600" />;
  };

  return (
    <DashboardLayout
      role="siswa"
      title="Modul Pembelajaran"
      subtitle="Bahan ajar, slide presentasi, dan video pembelajaran dari Guru"
    >
       {/* Course Sub-Header Banner */}
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

        {/* Sub-Navigation Tabs */}
        {(() => {
          const queryParamsStr = `?course_id=${courseId}&title=${encodeURIComponent(courseTitle)}&teacher=${encodeURIComponent(courseTeacher)}&code=${encodeURIComponent(courseCode)}`;
          return (
            <div className="flex items-center gap-6 border-b border-slate-200 text-sm font-bold pt-2">
              <Link
                href={`/siswa/materi${queryParamsStr}`}
                className="flex items-center gap-2 pb-3 text-[#2563EB] border-b-2 border-[#2563EB]"
              >
                <BookOpen className="w-4 h-4 text-[#2563EB]" />
                <span>Materi Pembelajaran</span>
              </Link>
              <Link
                href={`/siswa/tugas${queryParamsStr}`}
                className="flex items-center gap-2 pb-3 text-slate-500 hover:text-slate-900 transition"
              >
                <FileCheck2 className="w-4 h-4 text-slate-400" />
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
          );
        })()}
      </div>

      {/* Main Section Header */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-slate-900 tracking-tight">Daftar Modul & Bahan Ajar</h3>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {materiList && materiList.length > 0 ? materiList.map((materi: any) => (
          <div
            key={materi.id}
            className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-center shrink-0">
                {getCategoryIcon(materi.category)}
              </div>
              <div>
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 font-bold rounded-md text-[10px] uppercase tracking-wider mb-1.5 inline-block">
                  {materi.category}
                </span>
                <h4 className="text-base font-bold text-slate-900 leading-snug mb-1">{materi.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">{materi.desc}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMateri(materi)}
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-[#2563EB] rounded-xl transition flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview / Baca</span>
                </button>

                <button
                  onClick={() => {
                    if (materi.downloadUrl) {
                      window.open(materi.downloadUrl, '_blank');
                    }
                  }}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh File</span>
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-2 bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-xs">
            <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-sm font-bold text-slate-500">Belum ada materi pembelajaran tersedia</p>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewMateri && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  {getCategoryIcon(previewMateri.category)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{previewMateri.title}</h3>
                  <p className="text-xs text-slate-400 font-medium">{previewMateri.category}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewMateri(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 text-center space-y-2">
                <BookOpen className="w-12 h-12 text-blue-600 mx-auto opacity-80" />
                <p className="text-xs font-bold text-slate-800">Pratinjau Modul Pembelajaran</p>
                <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto">{previewMateri.desc}</p>
              </div>

              {previewMateri.category.includes('Link') ? (
                <div className="bg-[#E0F2FE] border border-[#7DD3FC] rounded-xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-[#0EA5E9] font-bold text-xs uppercase">
                    <Link2 className="w-4 h-4" />
                    <span>Link Sumber</span>
                  </div>
                  <a
                    href={previewMateri.url || previewMateri.desc}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block px-4 py-3 bg-white border border-[#BAE6FD] rounded-lg text-[#0EA5E9] font-bold text-xs text-center hover:bg-[#F0F9FF] transition"
                  >
                    Buka Link di Tab Baru
                  </a>
                </div>
              ) : (
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl font-mono truncate">
                  Tautan Akses: {previewMateri.url}
                </div>
              )}
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:justify-between items-center gap-3">
              {!previewMateri.category.includes('Link') && previewMateri.downloadUrl && (
                <a
                  href={previewMateri.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Unduh File</span>
                </a>
              )}
              <button
                onClick={() => setPreviewMateri(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
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

export default function SiswaMateriPage() {
  return (
    <React.Suspense fallback={null}>
      <SiswaMateriContent />
    </React.Suspense>
  );
}
