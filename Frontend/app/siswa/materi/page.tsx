'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, BookOpen, FileCheck2, CalendarCheck, Download, Eye, X, Video, FileText, Link2, Presentation, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { api, getAuthToken, getStorageUrl } from '@/lib/api';

const getDownloadUrl = (filePath: string) => {
  if (!filePath) return '';
  const fileUrl = getStorageUrl(filePath);
  const token = getAuthToken();
  return token && !fileUrl.includes('token=') ? `${fileUrl}${fileUrl.includes('?') ? '&' : '?'}token=${encodeURIComponent(token)}` : fileUrl;
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
      return data.map((m: any) => {
        const rawContent = m.content || '';
        const category = rawContent.includes('[Category:') 
          ? rawContent.split('[Category: ')[1].split(']')[0]
          : (m.file_path ? 'Dokumen' : 'Link Resource');
        const descText = rawContent.split('[Category:')[0].trim() || 'Modul materi pembelajaran.';
        
        const urlMatch = descText.match(/https?:\/\/[^\s]+/i) || rawContent.match(/https?:\/\/[^\s]+/i);
        const extractedUrl = urlMatch ? urlMatch[0] : '';
        const finalUrl = m.file_path ? getDownloadUrl(m.file_path) : extractedUrl;
        const isExternalLink = !m.file_path && Boolean(extractedUrl);

        return {
          id: m.id,
          category: category,
          title: m.title,
          desc: descText,
          url: finalUrl,
          downloadUrl: finalUrl,
          isLink: isExternalLink
        };
      });
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
              <div className="flex items-center gap-4 sm:gap-6 border-b border-slate-200 text-xs sm:text-sm font-bold pt-2 overflow-x-auto whitespace-nowrap scrollbar-none">
                <Link
                  href={`/siswa/materi${queryParamsStr}`}
                  className="flex items-center gap-2 pb-3 text-[#2563EB] border-b-2 border-[#2563EB] shrink-0"
                >
                  <BookOpen className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <span>Materi Pembelajaran</span>
                </Link>
                <Link
                  href={`/siswa/tugas${queryParamsStr}`}
                  className="flex items-center gap-2 pb-3 text-slate-500 hover:text-slate-900 transition shrink-0"
                >
                  <FileCheck2 className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Tugas Kelas</span>
                </Link>
                <Link
                  href={`/siswa/absensi${queryParamsStr}`}
                  className="flex items-center gap-2 pb-3 text-slate-500 hover:text-slate-900 transition shrink-0"
                >
                  <CalendarCheck className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Kehadiran / Absensi</span>
                </Link>
              </div>
            );
          })()}
      </div>

      {/* Main Section Header */}
      <div className="mb-6">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Daftar Modul & Bahan Ajar</h3>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {materiList && materiList.length > 0 ? materiList.map((materi: any) => (
          <div
            key={materi.id}
            className="bg-white border border-slate-100 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col justify-between overflow-hidden min-w-0"
          >
            <div className="flex items-start gap-3 sm:gap-4 mb-4 min-w-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#F8FAFC] border border-slate-100 flex items-center justify-center shrink-0">
                {getCategoryIcon(materi.category)}
              </div>
              <div className="min-w-0">
                <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 font-bold rounded-md text-[10px] uppercase tracking-wider mb-1.5 inline-block">
                  {materi.category}
                </span>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug mb-1.5 break-words">{materi.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium break-all whitespace-pre-wrap">{materi.desc}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs font-bold gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => setPreviewMateri(materi)}
                  className="px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-[#2563EB] rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Preview / Baca</span>
                </button>

                {materi.url && (
                  <a
                    href={materi.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`px-3.5 py-2 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer ${
                      materi.isLink
                        ? 'bg-blue-50 hover:bg-blue-100 text-[#2563EB]'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {materi.isLink ? <ExternalLink className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
                    <span>{materi.isLink ? 'Buka Link' : 'Unduh File'}</span>
                  </a>
                )}
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  {getCategoryIcon(previewMateri.category)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-slate-900 truncate">{previewMateri.title}</h3>
                  <p className="text-xs text-slate-400 font-medium">{previewMateri.category}</p>
                </div>
              </div>
              <button
                onClick={() => setPreviewMateri(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer shrink-0 ml-2"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-4 sm:p-6 space-y-2">
                <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">Ringkasan Materi:</p>
                <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-wrap break-words">{previewMateri.desc}</p>
              </div>

              {previewMateri.url && (
                <a
                  href={previewMateri.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3.5 bg-blue-50/60 hover:bg-blue-50 border border-blue-200/80 rounded-2xl font-mono text-[11px] break-all text-blue-700 block transition group"
                >
                  <div className="flex items-center gap-1.5 mb-1 text-blue-600 font-sans font-bold text-[10px] uppercase tracking-wider">
                    <span>{previewMateri.isLink ? 'Tautan Eksternal / Sumber:' : 'Tautan Unduhan Berkas:'}</span>
                    <ExternalLink className="w-3 h-3 text-blue-600 group-hover:translate-x-0.5 transition" />
                  </div>
                  <span className="underline">{previewMateri.url}</span>
                </a>
              )}
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
              <button
                onClick={() => setPreviewMateri(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer text-center"
              >
                Tutup
              </button>
              {previewMateri.url && (
                <a
                  href={previewMateri.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <span>{previewMateri.isLink ? 'Buka Link Sumber' : 'Unduh Berkas'}</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
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
