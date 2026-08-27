'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Download, FileSpreadsheet, FileText, CheckCircle2, Award, BookOpen, CalendarCheck, FileCheck2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { api } from '@/lib/api';

export default function SiswaReportsPage() {
  const { user } = useAuth();
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [enrolledClassesReports, setEnrolledClassesReports] = useState<any[]>([]);

  useEffect(() => {
    const fetchSiswaReports = async () => {
      try {
        const [myCoursesData, myAttendancesData, mySubmissionsData] = await Promise.all([
          api.getCourses().catch(() => []),
          api.getMyAttendances().catch(() => []),
          api.getMySubmissions().catch(() => [])
        ]);

        if (Array.isArray(myCoursesData) && user) {
          const reports = myCoursesData.map((c: any) => {
            const pivot = Array.isArray(c.students) ? c.students.find((s: any) => Number(s.id) === Number(user.id))?.pivot : null;
            
            const courseSubs = Array.isArray(mySubmissionsData) ? mySubmissionsData.filter((s: any) => {
              const subCourseId = s.assignment?.course_id || s.assignment?.course?.id || s.course_id;
              return Number(subCourseId) === Number(c.id);
            }) : [];
            
            const scoredSubs = courseSubs.filter((s: any) => s.score !== null && s.score !== undefined);
            
            const courseAttendances = Array.isArray(myAttendancesData) ? myAttendancesData.filter((a: any) => Number(a.course_id) === Number(c.id)) : [];
            const presentCount = courseAttendances.filter((a: any) => String(a.status).toLowerCase() === 'hadir').length;
            const absensiPercent = courseAttendances.length > 0 ? `${Math.round((presentCount / courseAttendances.length) * 100)}%` : '-';

            const categorized = { tugas: [] as number[], uts: [] as number[], uas: [] as number[], remediUts: [] as number[], remediUas: [] as number[] };
            scoredSubs.forEach((s: any) => {
              const instruction = String(s.assignment?.instruction || s.assignment_category || '').toLowerCase();
              const title = String(s.assignment?.title || s.assignment_title || '').toLowerCase();
              const combined = `${instruction} ${title}`;
              const score = Number(s.score);
              const isRemedi = combined.includes('remedi');
              if (combined.includes('uts')) {
                if (isRemedi) categorized.remediUts.push(score);
                else categorized.uts.push(score);
              } else if (combined.includes('uas')) {
                if (isRemedi) categorized.remediUas.push(score);
                else categorized.uas.push(score);
              } else {
                categorized.tugas.push(score);
              }
            });
            const highest = (values: number[]) => values.length ? Math.max(...values) : 0;
            const tugasScore = categorized.tugas.length > 0 ? Math.round(categorized.tugas.reduce((acc, curr) => acc + curr, 0) / categorized.tugas.length) : null;
            const utsScoreRaw = Math.max(highest(categorized.uts), highest(categorized.remediUts));
            const utsScore = utsScoreRaw > 0 ? utsScoreRaw : null;
            const uasScoreRaw = Math.max(highest(categorized.uas), highest(categorized.remediUas));
            const uasScore = uasScoreRaw > 0 ? uasScoreRaw : null;
            
            const finalScore = tugasScore !== null && utsScore !== null && uasScore !== null 
              ? parseFloat((tugasScore * 0.4 + utsScore * 0.3 + uasScore * 0.3).toFixed(1)) 
              : (tugasScore !== null && utsScore !== null ? parseFloat((tugasScore * 0.5 + utsScore * 0.5).toFixed(1)) : (tugasScore !== null ? tugasScore : null));
            const status = finalScore !== null ? (finalScore >= 75 ? 'Tuntas' : 'Remedial') : 'Belum Ada Data';

            const taskHistory = scoredSubs.map((s: any) => ({
              name: s.assignment?.title || s.assignment_title || 'Tugas / Evaluasi',
              date: s.submitted_at ? new Date(s.submitted_at).toLocaleDateString('id-ID') : 'Terkirim',
              score: s.score !== null && s.score !== undefined ? `${s.score} / 100` : 'Belum Dinilai',
              category: String(s.assignment?.instruction || s.assignment_category || '').replace(/^Modul\/Kategori:\s*/i, '').trim() || 'Tugas Harian'
            }));

            return {
              code: c.code || 'MAPEL',
              title: c.title,
              teacher: c.teacher ? (typeof c.teacher === 'object' ? c.teacher.name : c.teacher) : 'Guru',
              tugasScore: tugasScore ?? 0,
              utsScore: utsScore,
              uasScore: uasScore,
              absensiPercent: absensiPercent,
              absensiDetail: `${presentCount} / ${courseAttendances.length || 1} Pertemuan`,
              finalScore: finalScore,
              status: status,
              taskHistory: taskHistory
            };
          });
          setEnrolledClassesReports(reports);
        }
      } catch (e) {
        console.error('Failed to fetch siswa reports:', e);
      }
    };

    if (user) {
      fetchSiswaReports();
    }
  }, [user]);

  const handleExport = async (type: 'pdf' | 'csv' | 'excel') => {
    if (!enrolledClassesReports || enrolledClassesReports.length === 0) {
      alert('Belum ada data laporan atau presensi untuk diekspor.');
      return;
    }

    const studentName = String(user?.name || 'Siswa').replace(/[^a-zA-Z0-9]/g, '_');

    if (type === 'csv') {
      const csvRows = [
        ['No', 'Mata Pelajaran', 'Kode', 'Pengajar', 'Nilai Tugas', 'UTS', 'UAS', 'Persentase Kehadiran', 'Detail Kehadiran', 'Nilai Akhir', 'Status'],
        ...enrolledClassesReports.map((row, idx) => [
          idx + 1,
          row.title,
          row.code,
          row.teacher,
          row.tugasScore ?? '-',
          row.utsScore ?? '-',
          row.uasScore ?? '-',
          row.absensiPercent,
          row.absensiDetail,
          row.finalScore ?? '-',
          row.status,
        ])
      ];

      const csvContent = '\uFEFF' + csvRows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Laporan_Presensi_Nilai_${studentName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportNotice('Laporan Presensi & Nilai (CSV) berhasil diunduh.');
      setTimeout(() => setExportNotice(null), 4000);
      return;
    }

    if (type === 'excel') {
      try {
        const XLSX = await import('xlsx');
        const raporData = enrolledClassesReports.map((row, index) => ({
          'No': index + 1,
          'Kode': row.code,
          'Mata Pelajaran / Kelas': row.title,
          'Pengajar': row.teacher,
          'Nilai Rata-rata Tugas': row.tugasScore ?? '-',
          'Nilai UTS': row.utsScore ?? '-',
          'Nilai UAS': row.uasScore ?? '-',
          'Persentase Kehadiran': row.absensiPercent,
          'Detail Kehadiran': row.absensiDetail,
          'Nilai Akhir Kumulatif': row.finalScore ?? '-',
          'Status Ketuntasan': row.status,
        }));

        const wb = XLSX.utils.book_new();
        const wsRapor = XLSX.utils.json_to_sheet(raporData);
        XLSX.utils.book_append_sheet(wb, wsRapor, 'Rapor & Presensi');
        XLSX.writeFile(wb, `Laporan_Presensi_Nilai_${studentName}.xlsx`);

        setExportNotice('Laporan Presensi & Nilai Excel (.xlsx) berhasil diunduh.');
        setTimeout(() => setExportNotice(null), 4000);
      } catch (err) {
        console.error('Failed to export excel:', err);
      }
      return;
    }

    if (type === 'pdf') {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Laporan Hasil Belajar & Presensi Siswa</title>
            <style>
              * { box-sizing: border-box; }
              body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 32px; color: #0f172a; margin: 0; background: #fff; }
              .header { border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-end; }
              .title { font-size: 20px; font-weight: bold; color: #1e293b; margin: 0; }
              .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; }
              .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 12px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
              table { width: 100%; border-collapse: collapse; margin-top: 12px; margin-bottom: 24px; font-size: 11px; }
              th, td { border: 1px solid #cbd5e1; padding: 8px 10px; text-align: left; }
              th { background: #f1f5f9; font-weight: bold; color: #334155; }
              .center { text-align: center; }
              .badge { display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 10px; font-weight: bold; background: #dcfce7; color: #166534; }
              .badge-warn { background: #fee2e2; color: #991b1b; }
              .footer { margin-top: 32px; display: flex; justify-content: space-between; font-size: 11px; color: #64748b; }
              @media print {
                body { padding: 16px; }
                button { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <div>
                <h1 class="title">EduSchool LMS Platform</h1>
                <p class="subtitle">Laporan Akademik & Presensi Kehadiran Siswa</p>
              </div>
              <div style="text-align: right; font-size: 11px; color: #64748b;">
                Dicetak pada: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>

            <div class="info-box">
              <div><strong>Nama Siswa:</strong> ${user?.name || '-'}</div>
              <div><strong>NIS / NISN:</strong> ${user?.nisn_or_nip || '-'}</div>
              <div><strong>Kelas / Rombel:</strong> ${user?.specialization || user?.class_name || 'Siswa Reguler'}</div>
              <div><strong>Email:</strong> ${user?.email || '-'}</div>
            </div>

            <h3 style="font-size: 14px; margin: 16px 0 8px 0; color: #1e293b;">Ringkasan Nilai & Presensi Per Mata Pelajaran</h3>
            <table>
              <thead>
                <tr>
                  <th style="width: 30px;" class="center">No</th>
                  <th>Mata Pelajaran</th>
                  <th>Pengajar</th>
                  <th class="center">Tugas</th>
                  <th class="center">UTS</th>
                  <th class="center">UAS</th>
                  <th class="center">Kehadiran</th>
                  <th class="center">Nilai Akhir</th>
                  <th class="center">Status</th>
                </tr>
              </thead>
              <tbody>
                ${enrolledClassesReports.map((row, idx) => `
                  <tr>
                    <td class="center">${idx + 1}</td>
                    <td><strong>${row.title}</strong> (${row.code})</td>
                    <td>${row.teacher}</td>
                    <td class="center">${row.tugasScore ?? '-'}</td>
                    <td class="center">${row.utsScore ?? '-'}</td>
                    <td class="center">${row.uasScore ?? '-'}</td>
                    <td class="center">${row.absensiPercent} (${row.absensiDetail})</td>
                    <td class="center"><strong>${row.finalScore ?? '-'}</strong></td>
                    <td class="center">
                      <span class="badge ${row.status === 'Remedial' ? 'badge-warn' : ''}">${row.status}</span>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="footer">
              <div>* Dokumen ini dibuat otomatis oleh Sistem E-Learning EduSchool</div>
              <div>Mengetahui,<br><br><br><strong>Wali Kelas / Guru Pengajar</strong></div>
            </div>
          </body>
        </html>`;

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);

      setExportNotice('Rapor PDF siap dicetak / disimpan.');
      setTimeout(() => setExportNotice(null), 4000);
    }
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
          <span className="text-[11px] text-emerald-600 font-mono">Downloaded</span>
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
            <p className="text-xs text-slate-400 font-medium mt-0.5">{user?.name || 'Siswa'} • {user?.specialization || 'Kelas'} • Semester Ganjil 2026/2027</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport('pdf')}
            className="px-5 py-3 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-2xl text-xs flex items-center gap-2 transition shadow-md shadow-blue-500/20 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Unduh Rapor (PDF)</span>
          </button>

          <button
            onClick={() => handleExport('csv')}
            className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs flex items-center gap-2 transition cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Class by Class Detailed Reports Section (Sprint Requirement) */}
      <div className="space-y-6">
        <h3 className="text-base font-bold text-slate-900">Laporan Akademik Per Kelas Yang Diikuti</h3>

        {enrolledClassesReports.map((item) => (
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
                <span className="text-lg font-extrabold text-slate-800 font-mono">{item.tugasScore} / 100</span>
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
                  ✓ {item.status} KKM
                </span>
              </div>
            </div>

            {/* Tasks & Assignments Detail List Under Class */}
            <div>
              <h5 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">Rincian Tugas & Evaluasi:</h5>
              <div className="space-y-2">
                {item.taskHistory.map((t:any, idx: number) => (
                  <div key={idx} className="bg-slate-50 rounded-xl p-3 flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">{t.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-extrabold text-purple-700">Nilai: {t.score}</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-bold">
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
