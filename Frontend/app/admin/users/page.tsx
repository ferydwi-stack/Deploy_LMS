'use client';

import React, { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { Plus, FileSpreadsheet, Edit3, Trash2, X, Search, Key, ShieldCheck, Upload, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminUserManagementPage() {
  const [filter, setFilter] = useState<'all' | 'teacher' | 'student'>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [search, setSearch] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [resetPassUser, setResetPassUser] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [newPassword, setNewPassword] = useState('');

  const [resetSuccessMsg, setResetSuccessMsg] = useState('');
  const [importSuccessMsg, setImportSuccessMsg] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedImportUsers, setParsedImportUsers] = useState<any[]>([]);

  // 1. Fetch real users directly from MySQL API
  const loadUsersFromApi = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getUsers();
      const usersData = Array.isArray(data) ? data : (data?.users || []);
      if (Array.isArray(usersData)) {
        const formatted = usersData.map((u: any, idx: number) => ({
          no: (idx + 1).toString().padStart(2, '0'),
          dbId: u.id,
          id: u.nisn_or_nip || `USR-00${u.id}`,
          initials: u.name ? u.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'US',
          name: u.name,
          email: u.email,
          username: u.email ? u.email.split('@')[0] : 'user',
          role: u.role === 'guru' ? 'Teacher' : (u.role === 'siswa' ? 'Student' : 'Admin'),
          meta: u.class_name || (u.role === 'guru' ? (u.subject || 'Guru Pengajar') : (u.role === 'siswa' ? 'Kelas X-IPA 1' : 'Admin System')),
          pass: '••••••••'
        }));
        setUsers(formatted);
      } else {
        setUsers([]);
      }
    } catch (e) {
      console.error('Failed to load users from MySQL API:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsersFromApi();
  }, [loadUsersFromApi]);

  // Form State for Adding User
  const [newUser, setNewUser] = useState({
    id: '',
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'Teacher',
    meta: ''
  });

  // 2. Handler: Add User (Realtime POST to MySQL)
  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    setIsAdding(true);
    try {
      const { api } = await import('@/lib/api');
      await api.createUser({
        name: newUser.name,
        email: newUser.email,
        password: newUser.password || 'password123',
        role: newUser.role === 'Teacher' ? 'guru' : (newUser.role === 'Student' ? 'siswa' : 'admin'),
        nisn_or_nip: newUser.id || `2026${Math.floor(1000 + Math.random() * 9000)}`,
        subject: newUser.meta || (newUser.role === 'Teacher' ? 'Guru Pengajar' : 'Kelas X-IPA 1')
      });
      setNewUser({ id: '', name: '', email: '', username: '', password: '', role: 'Teacher', meta: '' });
      setIsAddModalOpen(false);
      await loadUsersFromApi();
    } catch (err: any) {
      console.error('MySQL Add User Error:', err);
      alert('Gagal menambahkan user: ' + (err.message || 'Silakan coba lagi'));
    } finally {
      setIsAdding(false);
    }
  };

  // 3. Handler: Update User (Realtime PUT to MySQL)
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editingUser.dbId) return;
    const targetDbId = editingUser.dbId;

    try {
      const { api } = await import('@/lib/api');
      await api.updateUser(targetDbId, {
        name: editingUser.name,
        email: editingUser.email,
        role: editingUser.role === 'Teacher' ? 'guru' : (editingUser.role === 'Student' ? 'siswa' : 'admin'),
        subject: editingUser.meta
      });
      setEditingUser(null);
      await loadUsersFromApi();
    } catch (err) {
      console.error('MySQL Update User Error:', err);
    }
  };

  // 4. Handler: Reset Password (Realtime PUT to MySQL)
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassUser || !resetPassUser.dbId || !newPassword) return;
    const targetDbId = resetPassUser.dbId;
    const targetName = resetPassUser.name;

    try {
      const { api } = await import('@/lib/api');
      await api.resetUserPassword(targetDbId, newPassword);
      setResetSuccessMsg(`Password untuk ${targetName} berhasil diperbarui di Database MySQL!`);
      setResetPassUser(null);
      setNewPassword('');
      await loadUsersFromApi();
      setTimeout(() => setResetSuccessMsg(''), 3000);
    } catch (err) {
      console.error('MySQL Reset Password Error:', err);
    }
  };

  // 5. Handler: Delete User (Realtime DELETE to MySQL)
  const handleDelete = (item: any) => {
    setItemToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete || !itemToDelete.dbId) return;
    const targetDbId = itemToDelete.dbId;

    try {
      const { api } = await import('@/lib/api');
      await api.deleteUser(targetDbId);
      setIsDeleteModalOpen(false);
      setItemToDelete(null);
      await loadUsersFromApi();
    } catch (e: any) {
      console.error('MySQL Delete User Error:', e);
      alert(e.message || 'Gagal menghapus user dari database MySQL.');
    }
  };

  // 6. Handler: CSV/XLSX File selection using XLSX parser
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);

    try {
      const XLSX = await import('xlsx');
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!rows || rows.length <= 1) return;

      const dataRows = rows.slice(1).filter(r => Array.isArray(r) && r.length > 0 && r[0]);

      const parsedUsers = dataRows.map((parts: any[], idx: number) => {
        const rawName = String(parts[0] || '').trim();
        const rawEmail = String(parts[1] || '').trim();
        const rawRole = String(parts[2] || '').trim().toLowerCase();
        const rawMeta = String(parts[3] || '').trim();

        const role = (rawRole.includes('teacher') || rawRole.includes('guru')) ? 'guru' : (rawRole.includes('admin') ? 'admin' : 'siswa');

        const validEmail = (rawEmail && rawEmail.includes('@') && rawEmail.includes('.'))
          ? rawEmail
          : `user_${idx + 1}_${Math.random().toString(36).substring(2, 7)}@school.id`;
        const avatarColors = ['bg-purple-500', 'bg-blue-500', 'bg-pink-500', 'bg-orange-500', 'bg-teal-500', 'bg-indigo-500', 'bg-rose-500', 'bg-cyan-500'];
        
        return {
          name: rawName || `User ${idx + 1}`,
          email: validEmail,
          role: role,
          subject: rawMeta || (role === 'guru' ? 'Guru Pengajar' : 'Kelas X-IPA 1'),
          meta: rawMeta || (role === 'guru' ? 'Guru Pengajar' : 'Kelas X-IPA 1'),
          password: 'password123',
          nisn_or_nip: `${role === 'guru' ? 1985 : 2026}${String(idx + 1).padStart(4, '0')}`
        };
      });

      setParsedImportUsers(parsedUsers);
    } catch (err) {
      console.error('Failed to parse import file:', err);
    }
  };

  // 7. Handler: Bulk Import (Realtime POST to MySQL)
  const handleProcessImport = async () => {
    const usersToImport = parsedImportUsers.length > 0 ? parsedImportUsers : [];

    if (usersToImport.length === 0) {
      alert('Tidak ada data untuk diimpor.');
      return;
    }

    try {
      const { api } = await import('@/lib/api');
      await api.bulkImportUsers(usersToImport);
      setImportSuccessMsg(`Berhasil mengimpor ${usersToImport.length} akun pengguna ke Database MySQL!`);
      setSelectedFile(null);
      setParsedImportUsers([]);
      await loadUsersFromApi();
      setTimeout(() => {
        setImportSuccessMsg('');
        setIsImportModalOpen(false);
      }, 2000);
    } catch (e: any) {
      console.error('MySQL Bulk Import Error:', e);
      alert(e.message || 'Gagal mengimpor data user massal ke Database MySQL.');
    }
  };

  // Dynamic Class / Subject options extracted from users
  const availableClasses = Array.from(
    new Set(users.map(u => u.meta).filter(Boolean))
  ).sort();

  // Filter & Search Users
  const filteredUsers = users.filter(u => {
    const roleStr = (u.role || '').toLowerCase();
    const matchesRole = filter === 'all' || roleStr === filter.toLowerCase();
    const metaStr = (u.meta || '').toLowerCase();
    const matchesClass = classFilter === 'all' || metaStr === classFilter.toLowerCase() || metaStr.includes(classFilter.toLowerCase());

    const searchLower = (search || '').toLowerCase();
    const matchesSearch = !searchLower ||
      (u.name || '').toLowerCase().includes(searchLower) ||
      (u.email || '').toLowerCase().includes(searchLower) ||
      (u.username || '').toLowerCase().includes(searchLower) ||
      (u.meta || '').toLowerCase().includes(searchLower) ||
      (u.id || '').toLowerCase().includes(searchLower);

    return matchesRole && matchesClass && matchesSearch;
  });

  return (
    <DashboardLayout
      role="admin"
      title="User Management"
      subtitle="Kelola akun pengguna: edit, hapus, reset sandi, import massal, dan filter data Guru & Siswa"
    >
      {/* Banner / Success Toast */}
      {resetSuccessMsg && (
        <div className="mb-6 p-4 bg-[#ECFDF5] border border-emerald-200 text-[#059669] text-xs font-bold rounded-[28px] flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
          <span>{resetSuccessMsg}</span>
        </div>
      )}

      {/* Top Actions & Filter Bar */}
      <div className="bg-white border border-[#D6DEE7] rounded-[22px] p-5 mb-6 shadow-none space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari Nama, Email, Username, Kelas..."
              className="w-full px-4 py-2.5 bg-[#F8FAFC] border border-[#D6DEE7] rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB] pl-10"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          {/* Action Buttons: Import & Add Manual */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="px-4 py-2.5 bg-white hover:bg-emerald-50 border border-emerald-300 text-emerald-700 font-bold text-xs rounded-xl shadow-sm hover:shadow transition flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Import CSV / Excel</span>
            </button>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 shrink-0" />
              <span>Tambah User Manual</span>
            </button>
          </div>
        </div>

        {/* Filter Bar: Peran & Kelas */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 bg-[#F8FAFC] p-1.5 rounded-2xl border border-slate-200/80 shadow-inner">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                filter === 'all' ? 'bg-[#10B981] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Semua Role ({users.length})
            </button>
            <button
              onClick={() => setFilter('teacher')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                filter === 'teacher' ? 'bg-[#10B981] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Guru ({users.filter(u => u.role === 'Teacher').length})
            </button>
            <button
              onClick={() => setFilter('student')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                filter === 'student' ? 'bg-[#10B981] text-white shadow-sm' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Siswa ({users.filter(u => u.role === 'Student').length})
            </button>
          </div>

          {/* Class Filter */}
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <span>Filter Kelas:</span>
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2 bg-[#F8FAFC] border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="all">Semua Kelas / Mapel</option>
              {availableClasses.map((cls) => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white border border-[#D6DEE7] rounded-[22px] p-6 shadow-none overflow-hidden">
        <div className="overflow-x-auto border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-[#2563EB] text-white font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-4 px-5 w-16 text-center border-b border-blue-600 border-r border-blue-400/40">No.</th>
                <th className="py-4 px-5 border-b border-blue-600 border-r border-blue-400/40">User ID</th>
                <th className="py-4 px-5 border-b border-blue-600 border-r border-blue-400/40">Nama Pengguna</th>
                <th className="py-4 px-5 border-b border-blue-600 border-r border-blue-400/40">Username / Email</th>
                <th className="py-4 px-5 border-b border-blue-600 border-r border-blue-400/40">Kelas (Siswa) / Mapel (Guru)</th>
                <th className="py-4 px-5 border-b border-blue-600 border-r border-blue-400/40">Role</th>
                <th className="py-4 px-5 text-right border-b border-blue-600">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/90 bg-white">
              {isLoading ? (
                [1, 2, 3, 4, 5].map((n) => (
                  <tr key={n} className="animate-pulse">
                    <td className="py-4 px-5 border-r border-slate-200/80"><div className="h-4 w-6 bg-slate-200 rounded-md mx-auto"></div></td>
                    <td className="py-4 px-5 border-r border-slate-200/80"><div className="h-5 w-16 bg-slate-200 rounded-md"></div></td>
                    <td className="py-4 px-5 border-r border-slate-200/80">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200"></div>
                        <div className="h-4 w-32 bg-slate-200 rounded-md"></div>
                      </div>
                    </td>
                    <td className="py-4 px-5 border-r border-slate-200/80">
                      <div className="h-4 w-28 bg-slate-200 rounded-md mb-1"></div>
                      <div className="h-3 w-36 bg-slate-100 rounded-md"></div>
                    </td>
                    <td className="py-4 px-5 border-r border-slate-200/80"><div className="h-5 w-24 bg-slate-200 rounded-xl"></div></td>
                    <td className="py-4 px-5 border-r border-slate-200/80"><div className="h-5 w-16 bg-slate-200 rounded-full"></div></td>
                    <td className="py-4 px-5 text-right"><div className="h-7 w-28 bg-slate-200 rounded-xl ml-auto"></div></td>
                  </tr>
                ))
              ) : (
                filteredUsers.map((item) => (
                  <tr key={item.id || item.rawId || item.no} className="hover:bg-blue-50/40 transition-colors odd:bg-white even:bg-[#F8FAFC]/60">
                    <td className="py-3.5 px-5 text-slate-400 font-semibold text-center border-r border-slate-200/80">{item.no}</td>
                    <td className="py-3.5 px-5 border-r border-slate-200/80">
                      <span className="px-3 py-1 bg-[#EEF2FF] text-[#2563EB] font-bold rounded-md font-mono text-[11px] border border-[#2563EB]/20 whitespace-nowrap">
                        {item.id}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 border-r border-slate-200/80">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0F172E] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                          {item.initials}
                        </div>
                        <span className="font-bold text-slate-900 whitespace-nowrap">{item.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 border-r border-slate-200/80">
                      <p className="font-bold text-slate-700">@{item.username}</p>
                      <p className="text-[11px] text-slate-400 font-medium">{item.email}</p>
                    </td>
                    <td className="py-3.5 px-5 border-r border-slate-200/80">
                      <span className="px-3 py-1 bg-[#F1F5F9] text-[#0F172E] font-semibold rounded-xl text-[11px] whitespace-nowrap inline-block border border-slate-200/60">
                        {item.meta}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 border-r border-slate-200/80">
                      <span className={`px-3 py-1 rounded-full font-bold text-[11px] whitespace-nowrap inline-block ${
                        item.role === 'Teacher'
                          ? 'bg-purple-100/80 text-purple-700 border border-purple-200/60'
                          : item.role === 'Admin'
                          ? 'bg-blue-100/80 text-blue-700 border border-blue-200/60'
                          : 'bg-emerald-100/80 text-emerald-700 border border-emerald-200/60'
                      }`}>
                        {item.role === 'Teacher' ? 'Guru' : (item.role === 'Admin' ? 'Admin' : 'Siswa')}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setResetPassUser(item)}
                          title="Reset Kata Sandi"
                          className="px-3 py-1.5 bg-[#FFFBEB] border border-amber-200 text-amber-700 hover:bg-[#FEF3C7] font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                        >
                          <Key className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Sandi</span>
                        </button>

                        <button
                          onClick={() => setEditingUser({ ...item })}
                          className="px-3 py-1.5 bg-white border border-blue-200 text-[#2563EB] hover:bg-[#EEF2FF] font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                        >
                          <Edit3 className="w-3.5 h-3.5 shrink-0" />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => handleDelete(item)}
                          className="px-3 py-1.5 bg-white border border-rose-200 text-rose-600 hover:bg-[#FEF2F2] font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap"
                        >
                          <Trash2 className="w-3.5 h-3.5 shrink-0" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-150" role="dialog" aria-modal="true">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 shrink-0">
              <h3 className="text-lg font-bold text-slate-900">Tambah Akun Pengguna</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddUser} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">User ID / NISN / NIP</label>
                <input
                  type="text"
                  placeholder="e.g. USR-011 atau 20260010"
                  value={newUser.id}
                  onChange={(e) => setNewUser({ ...newUser, id: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alexandra Chen"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. user@school.edu"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Peran (Role)</label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                >
                  <option value="Teacher">Guru / Pengajar</option>
                  <option value="Student">Siswa / Peserta Didik</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">
                  {newUser.role === 'Teacher' ? 'Mata Pelajaran (Guru)' : 'Kelas (Siswa)'}
                </label>
                <input
                  type="text"
                  placeholder={newUser.role === 'Teacher' ? 'e.g. Guru Matematika' : 'e.g. Kelas X-IPA 1'}
                  value={newUser.meta}
                  onChange={(e) => setNewUser({ ...newUser, meta: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Kata Sandi Initial</label>
                <input
                  type="password"
                  placeholder="Default: password123"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white z-10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-5 py-3 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition cursor-pointer"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 shrink-0">
              <h3 className="text-lg font-bold text-slate-900">Edit Akun Pengguna</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateUser} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-4 py-3 bg-[#F8FAFC] border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white z-10">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-5 py-3 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-blue-500/25 transition cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPassUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Reset Sandi Pengguna</h3>
                  <p className="text-xs text-slate-400 font-medium">{resetPassUser.name}</p>
                </div>
              </div>
              <button
                onClick={() => setResetPassUser(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResetPassword} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  placeholder="Masukkan password baru..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-800 border border-amber-200">
                ⚠️ Pengguna harus login menggunakan password baru ini setelah disimpan ke MySQL.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white z-10">
                <button
                  type="button"
                  onClick={() => setResetPassUser(null)}
                  className="px-5 py-3 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-amber-500/20 transition cursor-pointer"
                >
                  Simpan Password Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Massal CSV/Excel Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Import Akun Massal</h3>
                  <p className="text-xs text-slate-400 font-medium">Unggah file (.csv / .xlsx) data siswa & guru</p>
                </div>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {importSuccessMsg ? (
                <div className="p-6 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <p className="font-bold text-sm">{importSuccessMsg}</p>
                </div>
              ) : (
                <div className="space-y-5">
                  <label className="block border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-[#F8FAFC] hover:bg-slate-50 transition cursor-pointer relative">
                    <input
                      type="file"
                      accept=".csv, .xlsx"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <Upload className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                    <p className="text-xs font-bold text-slate-700 mb-1">
                      {selectedFile ? selectedFile.name : 'Pilih File atau Tarik & Lepas File (.csv)'}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {parsedImportUsers.length > 0
                        ? `✅ Terdeteksi ${parsedImportUsers.length} baris akun dari file`
                        : 'Mendukung format CSV dengan header: Nama Lengkap, Email, Role, Kelas/Mapel'}
                    </p>
                  </label>

                  <div className="text-[11px] text-slate-500 bg-slate-50 p-4 rounded-xl space-y-1">
                    <p className="font-bold text-slate-700">Format kolom CSV yang disarankan:</p>
                    <p>1. Nama Lengkap | 2. Email | 3. Role (Teacher/Student) | 4. Kelas/Mapel</p>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 sticky bottom-0 bg-white z-10">
                    <button
                      type="button"
                      onClick={() => {
                        setIsImportModalOpen(false);
                        setSelectedFile(null);
                        setParsedImportUsers([]);
                      }}
                      className="px-5 py-3 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleProcessImport}
                      className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{parsedImportUsers.length > 0 ? `Proses Import (${parsedImportUsers.length} Data)` : 'Proses Import Data'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Konfirmasi Hapus Modal */}
      {isDeleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-sm w-full p-6 text-center shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-8 h-8 text-rose-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Hapus Pengguna</h3>
            <p className="text-sm text-slate-500 mb-6">
              Apakah Anda yakin ingin menghapus pengguna <span className="font-bold text-slate-900">{itemToDelete.name}</span>? Data tidak dapat dikembalikan.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setItemToDelete(null);
                }}
                className="flex-1 py-3 text-sm font-bold text-slate-600 bg-[#F8FAFC] hover:bg-slate-100 rounded-2xl transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="flex-1 py-3 text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-2xl shadow-lg shadow-rose-500/25 transition cursor-pointer"
              >
                Hapus Permanen
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
