'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { FileEdit, CheckCircle2, Clock, Award, Download, Eye } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeData } from '@/hooks/useRealtimeData';
import { api } from '@/lib/api';

export default function GuruAssignmentsPage() {
  const { user: currentUser } = useAuth();
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [inputGrade, setInputGrade] = useState('');
  const [inputFeedback, setInputFeedback] = useState('');

  const { data: submissionsData } = useRealtimeData(
    async () => {
      if (!currentUser) return [];
      const data = await api.getAllAssignments?.().catch(() => []);
      return Array.isArray(data) ? data : [];
    },
    60000,
    [currentUser?.id]
  );

  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    if (Array.isArray(submissionsData)) {
      const processed = submissionsData.map((a: any) => ({
        id: a.id,
        studentName: a.student?.name || 'Siswa',
        studentId: a.student?.nisn_or_nip || 'USR-000',
        course: a.course?.title || 'Kelas',
        taskTitle: a.title,
        submitTime: a.submitted_at ? new Date(a.submitted_at).toLocaleString('id-ID') : '-',
        file: a.file || '-',
        grade: a.score ?? '',
        status: a.status === 'graded' ? 'Sudah Dinilai' : 'Belum Dinilai',
        feedback: a.teacher_feedback || ''
      }));
      setSubmissions(processed);
    }
  }, [submissionsData]);

  const handleOpenGradeModal = (sub: any) => {
    setSelectedSub(sub);
    setInputGrade(sub.grade || '');
    setInputFeedback(sub.feedback || '');
  };

  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub || !inputGrade) return;

    try {
      await api.gradeSubmission(selectedSub.id, Number(inputGrade), inputFeedback);
      await api.getAllAssignments?.().catch(() => []);
      setSelectedSub(null);
    } catch (err) {
      console.error('Failed to grade:', err);
      alert('Gagal menyimpan nilai');
    }
  };

  const pendingCount = submissions.filter(s => s.status === 'Belum Dinilai').length;

  return (
    <DashboardLayout
      role="guru"
      title="Assignments / Evaluasi Tugas"
      subtitle="Koreksi pengumpulan tugas siswa dan berikan penilaian"
    >
      <div className="bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Pengumpulan Tugas Siswa</h2>
            <p className="text-xs text-slate-400 font-medium mt-0.5">
              Daftar berkas jawaban tugas yang telah dikirimkan oleh siswa.
            </p>
          </div>
          <span className="px-3.5 py-1.5 bg-[#2563EB]/10 text-[#2563EB] font-bold rounded-xl text-xs">
            {pendingCount} Tugas Perlu Dikoreksi
          </span>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-12">
            <FileEdit className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">Belum ada pengumpulan tugas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider bg-slate-50/50">
                <tr>
                  <th className="py-4 px-4">Siswa</th>
                  <th className="py-4 px-4">Tugas / Kelas</th>
                  <th className="py-4 px-4">Waktu Kirim</th>
                  <th className="py-4 px-4">Berkas</th>
                  <th className="py-4 px-4">Nilai</th>
                  <th className="py-4 px-4 text-right">Aksi Koreksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{sub.studentName}</p>
                        <p className="text-[11px] text-slate-400 font-mono">{sub.studentId}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-bold text-slate-800">{sub.taskTitle}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{sub.course}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-slate-500 font-medium">{sub.submitTime}</td>
                    <td className="py-4 px-4">
                      <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-[11px] flex items-center gap-1.5 transition">
                        <Download className="w-3.5 h-3.5 text-slate-500" />
                        <span>{sub.file}</span>
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      {sub.grade ? (
                        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-extrabold rounded-lg font-mono text-xs">
                          {sub.grade} / 100
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-800 font-bold rounded-lg text-[11px]">
                          Belum Dinilai
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={() => handleOpenGradeModal(sub)}
                        className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 justify-end ml-auto transition shadow-xs"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>{sub.grade ? 'Edit Nilai' : 'Beri Nilai'}</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Koreksi & Penilaian */}
      {selectedSub && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Koreksi & Beri Nilai</h3>
                <p className="text-xs text-slate-400 font-medium">{selectedSub.studentName} • {selectedSub.taskTitle}</p>
              </div>
              <button
                onClick={() => setSelectedSub(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSaveGrade} className="space-y-4">
              <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-3.5 flex items-center justify-between text-xs mb-2">
                <span className="font-bold text-slate-600">Berkas Jawaban:</span>
                <span className="font-mono text-[#2563EB] font-bold">{selectedSub.file}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Nilai (0 - 100)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  required
                  placeholder="e.g. 85"
                  value={inputGrade}
                  onChange={(e) => setInputGrade(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Catatan Evaluasi / Catatan Guru</label>
                <textarea
                  rows={3}
                  placeholder="Berikan umpan balik atau apresiasi..."
                  value={inputFeedback}
                  onChange={(e) => setInputFeedback(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedSub(null)}
                  className="px-5 py-3 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition"
                >
                  Simpan Nilai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
