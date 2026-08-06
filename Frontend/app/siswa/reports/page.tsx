'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FileSpreadsheet, FileText, CheckCircle2, Award } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { api, ensureArray } from '@/lib/api';

export default function SiswaReportsPage() {
  const { user } = useAuth();
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [enrolledClassesReports, setEnrolledClassesReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSiswaReports = async () => {
      setIsLoading(true);
      try {
        const [myCoursesRes, myAttendancesRes, mySubmissionsRes] = await Promise.all([
          api.getCourses().catch(() => []),
          api.getMyAttendances().catch(() => []),
          api.getMySubmissions().catch(() => [])
        ]);

        const myCourses = ensureArray(myCoursesRes, 'courses');
        const myAttendances = ensureArray(myAttendancesRes, 'attendances');
        const mySubmissions = ensureArray(mySubmissionsRes, 'submissions');

        if (myCourses.length > 0 && user) {
          const reports = myCourses.map((c: any) => {
            const pivot = Array.isArray(c.students)
              ? c.students.find((s: any) => String(s.id) === String(user.id))?.pivot
              : null;

            const utsScore = pivot?.uts_score !== undefined && pivot?.uts_score !== null ? Number(pivot.uts_score) : null;
            const uasScore = pivot?.uas_score !== undefined && pivot?.uas_score !== null ? Number(pivot.uas_score) : null;

            // Attendance percent
            const courseAttendances = myAttendances.filter((a: any) => String(a.course_id) === String(c.id));
            const presentCount = courseAttendances.filter((a: any) => String(a.status).toLowerCase() === 'hadir').length;
            const absensiPercent = courseAttendances.length > 0
              ? `${Math.round((presentCount / courseAttendances.length) * 100)}%`
              : '0%';

            // Submissions average for this course
            const courseSubs = mySubmissions.filter((s: any) => {
              if (s.course_id && String(s.course_id) === String(c.id)) return true;
              if (s.assignment && String(s.assignment.course_id) === String(c.id)) return true;
              return false;
            });

            const scoredSubs = courseSubs.filter((s: any) => s.score !== null && s.score !== undefined);
            const sumScore = scoredSubs.reduce((acc: number, curr: any) => acc + Number(curr.score), 0);
            const tugasScore = scoredSubs.length > 0 ? Math.round(sumScore / scoredSubs.length) : null;

            let finalScore: number | null = null;
            if (tugasScore !== null || utsScore !== null || uasScore !== null) {
              const t = tugasScore ?? 0;
              const u1 = utsScore ?? 0;
              const u2 = uasScore ?? 0;
              finalScore = parseFloat((t * 0.4 + u1 * 0.3 + u2 * 0.3).toFixed(1));
            }

            return {
              code: c.code || 'MAPEL',
              title: c.title,
              teacher: c.teacher ? (typeof c.teacher === 'object' ? c.teacher.name : c.teacher) : 'Guru Pengajar',
              tugasScore: tugasScore !== null ? tugasScore : '-',
              utsScore: utsScore !== null ? utsScore : '-',
              uasScore: uasScore !== null ? uasScore : '-',
              absensiPercent: absensiPercent,
              absensiDetail: `${presentCount} / ${courseAttendances.length} Pertemuan`,
              finalScore: finalScore !== null ? finalScore : '-',
              status: finalScore !== null ? (finalScore >= 75 ? 'Tuntas' : 'Remedial') : 'Belum Ada Nilai',
              taskHistory: courseSubs.map((s: any) => ({
                name: s.assignment ? (s.assignment.title || 'Tugas') : (s.assignment_title || 'Tugas'),
                score: s.score !== null && s.score !== undefined ? `${s.score} / 100` : 'Belum Dinilai'
              }))
            };
          });
          setEnrolledClassesReports(reports);
        } else {
          setEnrolledClassesReports([]);
        }
      } catch (e) {
        console.error('Failed to fetch siswa reports:', e);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSiswaReports();
    }
  }, [user]);

  const handleExportExcel = () => {
    if (enrolledClassesReports.length === 0) {
      setExportNotice('Belum ada data kelas terdaftar untuk di-export.');
      setTimeout(() => setExportNotice(null), 3000);
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += `RAPOR AKADEMIK SISWA - EDUSCHOOL LMS\n`;
    csvContent += `Nama Siswa: ${user?.name || 'Siswa'} | ID/NISN: ${user?.nisn_or_nip || user?.id || '-'}\n`;
    csvContent += `Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}\n\n`;
    csvContent += `Kode;Mata Pelajaran;Pengajar;Rata Tugas (40%);UTS (30%);UAS (30%);Kehadiran;Nilai Akhir;Status Ketuntasan\n`;

    enrolledClassesReports.forEach((row) => {
      csvContent += `"${row.code}";"${row.title}";"${row.teacher}";${row.tugasScore};${row.utsScore};${row.uasScore};${row.absensiPercent};${row.finalScore};${row.status}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Rapor_Akademik_${(user?.name || 'Siswa').replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice('Rapor Akademik (Excel CSV) berhasil diunduh!');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const handleExportPdf = () => {
    if (enrolledClassesReports.length === 0) {
      setExportNotice('Belum ada data kelas terdaftar untuk dicetak.');
      setTimeout(() => setExportNotice(null), 3000);
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlStr = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rapor Akademik Siswa - ${user?.name || 'Siswa'}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 22px; color: #0f172a; text-transform: uppercase; }
            .header p { margin: 4px 0 0; font-size: 13px; color: #64748b; font-weight: 600; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; background: #f8fafc; padding: 12px 16px; border-radius: 8px; border: 1px solid #e2e8f0; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 12px; }
            th, td { border: 1px solid #cbd5e1; padding: 9px 12px; text-align: left; }
            th { background-color: #f1f5f9; font-weight: bold; color: #334155; text-transform: uppercase; font-size: 11px; }
            .footer { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; }
            .signature { text-align: center; width: 220px; }
            .signature-space { height: 60px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>EDUSCHOOL LMS PLATFORM</h1>
            <p>RAPOR EVALUASI AKADEMIK SISWA</p>
          </div>
          <div class="meta">
            <div>
              <p><strong>Nama Siswa:</strong> ${user?.name || 'Siswa'}</p>
              <p><strong>NISN / NIP:</strong> ${user?.nisn_or_nip || user?.id || '-'}</p>
            </div>
            <div style="text-align: right;">
              <p><strong>Tanggal Cetak:</strong> ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p><strong>KKM Ketuntasan:</strong> 75</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Kode</th>
                <th>Mata Pelajaran</th>
                <th>Pengajar</th>
                <th>Rata Tugas</th>
                <th>UTS</th>
                <th>UAS</th>
                <th>Kehadiran</th>
                <th>Nilai Akhir</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${enrolledClassesReports.map((st, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td>${st.code}</td>
                  <td><strong>${st.title}</strong></td>
                  <td>${st.teacher}</td>
                  <td>${st.tugasScore}</td>
                  <td>${st.utsScore}</td>
                  <td>${st.uasScore}</td>
                  <td>${st.absensiPercent}</td>
                  <td><strong>${st.finalScore}</strong></td>
                  <td><strong>${st.status}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <div></div>
            <div class="signature">
              <p>Wali Kelas / Sekolah</p>
              <div class="signature-space"></div>
              <p><strong><u>EduSchool Platform</u></strong></p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(htmlStr);
    printWindow.document.close();
    setExportNotice('Dokumen Rapor Akademik Siswa siap dicetak!');
    setTimeout(() => setExportNotice(null), 4000);
  };

  return (
    <DashboardLayout
      role="siswa"
      title="Reports / Laporan Belajar"
      subtitle="Daftar kelas yang diikuti dan laporan tugas, nilai, serta absensi di bawah masing-masing kelas"
    >
      {/* Top Notice Toast */}
      {exportNotice && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center justify-between shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{exportNotice}</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-mono">Ready</span>
        </div>
      )}

      {/* Rapor Overview Header Card */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 mb-8 shadow-xs flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold text-xl shadow-xs">
            <Award className="w-7 h-7 text-[#2563EB]" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Rapor Belajar Siswa</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">{user?.name || 'Siswa'} • {user?.email || 'Siswa'}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportPdf}
            className="px-5 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 transition shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Unduh Rapor (PDF)</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Class by Class Detailed Reports Section */}
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-900">Laporan Akademik Per Kelas Yang Diikuti</h3>

        {isLoading ? (
          [1, 2].map((n) => (
            <div key={n} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs animate-pulse space-y-3">
              <div className="h-5 w-1/4 bg-slate-200 rounded-md"></div>
              <div className="h-4 w-1/3 bg-slate-100 rounded-md"></div>
            </div>
          ))
        ) : enrolledClassesReports.length > 0 ? (
          enrolledClassesReports.map((item) => (
            <div
              key={item.code}
              className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs hover:border-blue-100 transition"
            >
              {/* Course Header Banner */}
              <div className="flex flex-wrap items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
                <div>
                  <span className="px-3 py-1 bg-blue-50 text-[#2563EB] font-bold rounded-full font-mono text-xs">
                    {item.code}
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 mt-1">{item.title}</h4>
                  <p className="text-xs text-slate-400 font-medium">Pengajar: {item.teacher}</p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Nilai Akhir Kumulatif</span>
                    <span className="text-2xl font-extrabold text-slate-900 font-mono">{item.finalScore}</span>
                  </div>
                  <span className="px-3.5 py-1.5 bg-emerald-100/70 text-emerald-700 font-bold rounded-full text-xs">
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Metrics Under Course Card */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4">
                  <span className="text-xs font-bold text-slate-400 block mb-1">Rata-rata Tugas</span>
                  <span className="text-lg font-extrabold text-slate-800 font-mono">{item.tugasScore}</span>
                </div>

                <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4">
                  <span className="text-xs font-bold text-slate-400 block mb-1">Nilai Ujian (UTS / UAS)</span>
                  <span className="text-lg font-extrabold text-slate-800 font-mono">{item.utsScore} / {item.uasScore}</span>
                </div>

                <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4">
                  <span className="text-xs font-bold text-slate-400 block mb-1">Persentase Kehadiran</span>
                  <span className="text-lg font-extrabold text-emerald-600 font-mono">{item.absensiPercent}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">{item.absensiDetail}</span>
                </div>

                <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4">
                  <span className="text-xs font-bold text-slate-400 block mb-1">Status Kriteria Ketuntasan</span>
                  <span className="text-sm font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md inline-block mt-1">
                    {item.status}
                  </span>
                </div>
              </div>

              {/* Tasks & Assignments Detail List Under Class */}
              <div>
                <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Rincian Tugas & Evaluasi:</h5>
                <div className="space-y-2">
                  {item.taskHistory.length > 0 ? (
                    item.taskHistory.map((t: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 rounded-xl p-3 flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-800">{t.name}</span>
                        <span className="font-mono font-extrabold text-purple-700">Nilai: {t.score}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400 italic">Belum ada tugas dikumpulkan untuk kelas ini.</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-xs">
            <h4 className="text-base font-bold text-slate-900 mb-1">Belum Terdaftar Di Kelas Manapun</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Anda belum bergabung ke kelas manapun. Masuk ke halaman Kelas untuk enroll.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
