import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Plus,
  ShieldCheck,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  XCircle,
  Edit,
  Trash2,
  X,
  Save,
  KeyRound
} from 'lucide-react';
import { User, UserRole } from '../types';

export const UserManagementView: React.FC = () => {
  const { users, addUser, toggleUserActive, setCurrentUser, addToast } = useApp();

  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('guru');
  const [nipNisn, setNipNisn] = useState('');

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    return true;
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    addUser({
      name,
      email,
      role,
      is_active: true,
      nip_nisn: nipNisn || undefined,
    });

    setName('');
    setEmail('');
    setNipNisn('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Manajemen Pengguna & Hak Akses
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola data akun Administrator, Guru Pendidik, dan Peserta Didik (Siswa)
          </p>
        </div>

        <button
          id="btn-add-user-modal"
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Pengguna Baru
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        {['all', 'admin', 'guru', 'siswa'].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all uppercase ${
              roleFilter === r
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {r === 'all' ? 'Semua Role' : r}
          </button>
        ))}
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-4">Nama Lengkap</th>
                <th className="p-4">Email</th>
                <th className="p-4">NIP / NISN</th>
                <th className="p-4">Role Akses</th>
                <th className="p-4">Status Akun</th>
                <th className="p-4 text-right">Aksi Cepat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-slate-100">
                    {u.name}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 font-mono">
                    {u.email}
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-400 font-mono">
                    {u.nip_nisn || '-'}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        u.role === 'admin'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : u.role === 'guru'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}
                    >
                      {u.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                      {u.role === 'guru' && <Briefcase className="w-3 h-3" />}
                      {u.role === 'siswa' && <GraduationCap className="w-3 h-3" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleUserActive(u.id)}
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md ${
                        u.is_active
                          ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60'
                          : 'text-slate-400 bg-slate-100 dark:bg-slate-800'
                      }`}
                    >
                      {u.is_active ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" /> Aktif
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3" /> Nonaktif
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => {
                        setCurrentUser(u);
                        addToast(`Beralih simulasi ke akun ${u.name} (${u.role.toUpperCase()})`, 'info');
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/60 rounded-lg transition-colors"
                      title="Masuk sebagai user ini"
                    >
                      Login Sebagai
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      {isAddModalOpen && (
        <div
          id="modal-add-user-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Tambah Pengguna Baru</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso, S.Pd."
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Akun <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="budi.santoso@sekolah.sch.id"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Peran / Role <span className="text-rose-500">*</span>
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-semibold"
                >
                  <option value="guru">Guru (Pembuat & Penguji Soal)</option>
                  <option value="siswa">Siswa (Peserta Ujian CBT)</option>
                  <option value="admin">Administrator (Akses Penuh)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  NIP / NISN
                </label>
                <input
                  type="text"
                  value={nipNisn}
                  onChange={(e) => setNipNisn(e.target.value)}
                  placeholder="198501152010011002 atau NISN Siswa"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Batal
                </button>
                <button
                  id="btn-save-new-user"
                  type="submit"
                  className="inline-flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm"
                >
                  <Save className="w-4 h-4" /> Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
