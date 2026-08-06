'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Calendar, CheckCircle2, UserCheck, Users, Printer, FileSpreadsheet } from 'lucide-react';
import { api, ensureArray } from '@/lib/api';

export default function AdminReportsPage() {
  const [range, setRange] = useState('minggu');
  const [downloadNotice, setDownloadNotice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState<any>(null);
  const [coursesReport, setCoursesReport] = useState<any[]>([]);

  useEffect(() => {
    const loadReportsData = async () => {
      setIsLoading(true);
      try {
        const [statsRes, coursesRes] = await Promise.all([
          api.getAdminStats().catch(() => null),
          api.getCourses().catch(() => []),
        ]);

        setStatsData(statsRes);
        const rawCourses = ensureArray(coursesRes, 'courses');

        if (rawCourses.length > 0) {
          const courseDetails = await Promise.all(
            rawCourses.map(async (c: any) => {
              const detail = await api.getCourseDetail(c.id).catch(() => null);
              const attendances = ensureArray(detail?.attendances, 'attendances');
              const students = ensureArray(detail?.students, 'students');

              const totalStudents = students.length;
              const hadirCount = attendances.filter((a: any) => String(a.status).toLowerCase() === 'hadir').length;
              const izinCount = attendances.filter((a: any) => String(a.status).toLowerCase() === 'izin').length;
              const sakitCount = attendances.filter((a: any) => String(a.status).toLowerCase() === 'sakit').length;
              const alpaCount = attendances.filter((a: any) => String(a.status).toLowerCase() === 'alpha' || String(a.status).toLowerCase() === 'alfa').length;
              const totalRecords = attendances.length;

              const percentStr = totalRecords > 0
                ? `${((hadirCount / totalRecords) * 100).toFixed(1)}%`
                : (totalStudents > 0 ? '100%' : '0%');

              return {
                id: c.id,
                class: c.title || `Kelas ${c.code || c.id}`,
                teacher: c.teacher ? (typeof c.teacher === 'object' ? c.teacher.name : c.teacher) : 'Guru Pengajar',
                total: totalStudents,
                hadir: hadirCount,
                izin: izinCount,
                sakit: sakitCount,
                alpa: alpaCount,
                percent: percentStr,
              };
            })
          );
          setCoursesReport(courseDetails);
        } else {
          setCoursesReport([]);
        }
      } catch (e) {
        console.error('Failed to load admin reports:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadReportsData();
  }, []);

  const handleExportExcel = () => {
    if (coursesReport.length === 0) {
      setDownloadNotice('Tidak ada data kelas untuk di-export.');
      setTimeout(() => setDownloadNotice(''), 3000);
      return;
    }

    let csvContent = '\uFEFF';
    csvContent += `LAPORAN REKAPITULASI PRESENSI GLOBAL - EDUSCHOOL LMS\n`;
    csvContent += `Periode: ${range.toUpperCase()} | Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}\n\n`;
    csvContent += `No;Grup / Kelas;Wali Kelas / Penanggung Jawab;Siswa Terdaftar;Hadir;Izin;Sakit;Alpa;Persentase Kehadiran\n`;

    coursesReport.forEach((row, idx) => {
      csvContent += `${idx + 1};"${row.class}";"${row.teacher}";${row.total};${row.hadir};${row.izin};${row.sakit};${row.alpa};${row.percent}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Laporan_Presensi_Global_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadNotice('Laporan Presensi (Excel CSV) berhasil diunduh!');
    setTimeout(() => setDownloadNotice(''), 4000);
  };

  const handleExportPdf = () => {
    if (coursesReport.length === 0) {
      setDownloadNotice('Tidak ada data kelas untuk dicetak.');
      setTimeout(() => setDownloadNotice(''), 3000);
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const htmlStr = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Laporan Rekapitulasi Presensi Global - Admin</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 30px; color: #1e293b; }
            .header { text-align: center; border-bottom: 2px solid #2563eb; padding-bottom: 15px; margin-bottom: 20px; }
            .header h1 { margin: 0; font-size: 22px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
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
            <p>REKAPITULASI PRESENSI GLOBAL DAN PEMANTAUAN KELAS</p>
          </div>
          <div class="meta">
            <div>
              <p><strong>Laporan:</strong> Presensi Seluruh Kelas</p>
              <p><strong>Rentang Filter:</strong> ${range.toUpperCase()}</p>
            </div>
            <div style="text-align: right;">
              <p><strong>Tanggal Cetak:</strong> ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
              <p><strong>Administrator System</strong></p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Grup / Kelas</th>
                <th>Wali Kelas / Guru</th>
                <th>Total Siswa</th>
                <th>Hadir</th>
                <th>Izin</th>
                <th>Sakit</th>
                <th>Alpa</th>
                <th>Persentase</th>
              </tr>
            </thead>
            <tbody>
              ${coursesReport.map((row, idx) => `
                <tr>
                  <td>${idx + 1}</td>
                  <td><strong>${row.class}</strong></td>
                  <td>${row.teacher}</td>
                  <td>${row.total}</td>
                  <td><span style="color:#16a34a; font-weight:bold;">${row.hadir}</span></td>
                  <td><span style="color:#2563eb; font-weight:bold;">${row.izin}</span></td>
                  <td><span style="color:#d97706; font-weight:bold;">${row.sakit}</span></td>
                  <td><span style="color:#dc2626; font-weight:bold;">${row.alpa}</span></td>
                  <td><strong>${row.percent}</strong></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            <div></div>
            <div class="signature">
              <p>Mengetahui,</p>
              <p>Kepala / Admin Sekolah</p>
              <div class="signature-space"></div>
              <p><strong><u>Administrator System</u></strong></p>
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
    setDownloadNotice('Dokumen PDF Laporan Global siap dicetak!');
    setTimeout(() => setDownloadNotice(''), 4000);
  };

  const studentAttendanceRate = statsData?.attendance_rate !== undefined ? `${statsData.attendance_rate}%` : '0%';

  return (
    <DashboardLayout
      role="admin"
      title="Laporan & Presensi Global"
      subtitle="Rekapitulasi persentase kehadiran harian siswa dan guru di seluruh sekolah"
    >
      {/* Toast Notification */}
      {downloadNotice && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-2xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{downloadNotice}</span>
        </div>
      )}

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs text-center flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">Rata-Rata Kehadiran Siswa</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-4xl font-extrabold text-[#10B981] tracking-tight mb-1">{isLoading ? '...' : studentAttendanceRate}</p>
          <p className="text-xs text-slate-400 font-medium">Kumulatif seluruh tingkat kelas</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs text-center flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">Total Staf Pengajar (Guru)</span>
            <UserCheck className="w-4 h-4 text-[#2563EB]" />
          </div>
          <p className="text-4xl font-extrabold text-[#2563EB] tracking-tight mb-1">{isLoading ? '...' : (statsData?.total_teachers || 0)}</p>
          <p className="text-xs text-slate-400 font-medium">Pengajar aktif terdaftar</p>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs text-center flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold">Total Kelas Terdaftar</span>
            <Calendar className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-4xl font-extrabold text-purple-600 tracking-tight mb-1">{isLoading ? '...' : (statsData?.total_courses || 0)}</p>
          <p className="text-xs text-slate-400 font-medium">Mata pelajaran aktif di sistem</p>
        </div>
      </div>

      {/* Main Table Section */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Rekapitulasi Kehadiran per Kelas</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Filter berdasarkan rentang waktu dan unduh laporan resmi</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Rentang Filter */}
            <select
              value={range}
              onChange={(e) => setRange(e.target.value)}
              className="px-3.5 py-2.5 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="minggu">Minggu Ini</option>
              <option value="bulan">Bulan Ini</option>
              <option value="semester">Semester Ini</option>
            </select>

            {/* Export Actions */}
            <button
              onClick={handleExportExcel}
              className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-2xl border border-emerald-200/80 transition flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Export Excel</span>
            </button>

            <button
              onClick={handleExportPdf}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-2xl border border-rose-200/80 transition flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <Printer className="w-4 h-4 text-rose-600" />
              <span>Cetak PDF</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
              <tr>
                <th className="py-4 px-6">Grup / Kelas</th>
                <th className="py-4 px-6">Wali Kelas / Penanggung Jawab</th>
                <th className="py-4 px-6 text-center">Siswa</th>
                <th className="py-4 px-6 text-center">Hadir</th>
                <th className="py-4 px-6 text-center">Izin</th>
                <th className="py-4 px-6 text-center">Sakit</th>
                <th className="py-4 px-6 text-center">Alpa</th>
                <th className="py-4 px-6 text-right">Persentase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                [1, 2].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td colSpan={8} className="py-4 px-6">
                      <div className="h-4 bg-slate-100 rounded-md w-3/4"></div>
                    </td>
                  </tr>
                ))
              ) : coursesReport.length > 0 ? (
                coursesReport.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">{row.class}</td>
                    <td className="py-4 px-6 text-slate-600 font-medium">{row.teacher}</td>
                    <td className="py-4 px-6 text-center font-bold text-slate-700">{row.total}</td>
                    <td className="py-4 px-6 text-center font-bold text-emerald-600">{row.hadir}</td>
                    <td className="py-4 px-6 text-center font-bold text-blue-600">{row.izin}</td>
                    <td className="py-4 px-6 text-center font-bold text-amber-600">{row.sakit}</td>
                    <td className="py-4 px-6 text-center font-bold text-rose-600">{row.alpa}</td>
                    <td className="py-4 px-6 text-right">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-full font-mono">
                        {row.percent}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-slate-400 font-medium">
                    Belum Ada Data Presensi Kelas
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
