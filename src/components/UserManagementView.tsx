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
import { Badge, Button, DataTable, EmptyState, Field, IconButton, Input, Modal, Select } from './ui';
import { useConfirm } from '../context/ConfirmContext';

type UserFormState = {
  name: string;
  email: string;
  role: UserRole;
  nip_nisn: string;
  phone: string;
  password: string;
  password_confirmation: string;
};

const emptyForm: UserFormState = {
  name: '',
  email: '',
  role: 'guru',
  nip_nisn: '',
  phone: '',
  password: '',
  password_confirmation: '',
};

export const UserManagementView: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, toggleUserActive, currentUser, addToast } = useApp();
  const confirm = useConfirm();

  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [form, setForm] = useState<UserFormState>(emptyForm);

  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    return true;
  });

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setIsAddModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      nip_nisn: user.nip_nisn ?? '',
      phone: user.phone ?? '',
      password: '',
      password_confirmation: '',
    });
    setIsAddModalOpen(true);
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingUser(null);
    setForm(emptyForm);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) return;
    if (form.password && form.password !== form.password_confirmation) {
      addToast('Konfirmasi password tidak sama.', 'danger');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        role: form.role,
        is_active: editingUser?.is_active ?? true,
        nip_nisn: form.nip_nisn || undefined,
        phone: form.phone || undefined,
        ...(form.password ? { password: form.password, password_confirmation: form.password_confirmation } : {}),
      };

      if (editingUser) {
        await updateUser(editingUser.id, payload);
      } else {
        await addUser(payload);
      }

      closeModal();
    } catch {
      // Toast is handled by the data layer.
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    const confirmed = await confirm({
      title: user.is_active ? 'Nonaktifkan Pengguna?' : 'Aktifkan Pengguna?',
      message: `Akun "${user.name}" akan diubah menjadi ${user.is_active ? 'nonaktif' : 'aktif'}.`,
      confirmLabel: user.is_active ? 'Ya, Nonaktifkan' : 'Ya, Aktifkan',
    });
    if (!confirmed) return;

    setPendingUserId(user.id);
    try {
      await toggleUserActive(user.id);
    } catch {
      // Toast is handled by the data layer.
    } finally {
      setPendingUserId(null);
    }
  };

  const handleDelete = async (user: User) => {
    if (user.id === currentUser.id) return;
    const confirmed = await confirm({
      title: 'Hapus Pengguna?',
      message: `Akun "${user.name}" akan dihapus dari sistem.`,
      confirmLabel: 'Ya, Hapus',
    });
    if (!confirmed) return;

    setPendingUserId(user.id);
    try {
      await deleteUser(user.id);
    } catch {
      // Toast is handled by the data layer.
    } finally {
      setPendingUserId(null);
    }
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

        <Button
          id="btn-add-user-modal"
          onClick={openCreateModal}
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Tambah Pengguna Baru
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 text-xs">
        {['all', 'admin', 'guru', 'siswa'].map((r) => (
          <Button
            key={r}
            onClick={() => setRoleFilter(r)}
            variant={roleFilter === r ? 'primary' : 'secondary'}
            size="sm"
            className="uppercase"
          >
            {r === 'all' ? 'Semua Role' : r}
          </Button>
        ))}
      </div>

      {/* Users Table */}
      <DataTable
        data={filteredUsers}
        empty={<EmptyState icon={<Users className="w-6 h-6" />} title="Belum Ada Pengguna" description="Tidak ada pengguna yang cocok dengan filter ini." />}
        columns={[
          {
            key: 'name',
            header: 'Nama Lengkap',
            cell: u => <span className="font-bold text-slate-900 dark:text-slate-100">{u.name}</span>,
          },
          {
            key: 'email',
            header: 'Email',
            cell: u => <span className="font-mono text-slate-600 dark:text-slate-400">{u.email}</span>,
          },
          {
            key: 'nip_nisn',
            header: 'NIP / NISN',
            cell: u => <span className="font-mono text-slate-600 dark:text-slate-400">{u.nip_nisn || '-'}</span>,
          },
          {
            key: 'role',
            header: 'Role Akses',
            cell: u => (
              <Badge tone={u.role === 'admin' ? 'rose' : u.role === 'guru' ? 'blue' : 'emerald'}>
                {u.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                {u.role === 'guru' && <Briefcase className="w-3 h-3" />}
                {u.role === 'siswa' && <GraduationCap className="w-3 h-3" />}
                {u.role}
              </Badge>
            ),
          },
          {
            key: 'status',
            header: 'Status Akun',
            cell: u => (
              <Button
                size="sm"
                variant={u.is_active ? 'success' : 'secondary'}
                onClick={() => handleToggleStatus(u)}
                disabled={u.id === currentUser.id || pendingUserId === u.id}
                title={u.id === currentUser.id ? 'Akun sendiri tidak dapat dinonaktifkan' : 'Ubah status akun'}
                aria-label={`Ubah status akun ${u.name}`}
                className="h-7 px-2 text-[11px]"
              >
                {u.is_active ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {u.is_active ? 'Aktif' : 'Nonaktif'}
              </Button>
            ),
          },
          {
            key: 'actions',
            header: 'Aksi Cepat',
            className: 'text-right',
            cell: u => (
              <div className="flex items-center justify-end gap-1.5">
                <IconButton label={`Edit ${u.name}`} variant="primary" onClick={() => openEditModal(u)}>
                  <Edit className="w-4 h-4" />
                </IconButton>
                <IconButton
                  label={u.id === currentUser.id ? 'Akun sendiri tidak dapat dihapus' : `Hapus ${u.name}`}
                  variant="danger"
                  onClick={() => handleDelete(u)}
                  disabled={u.id === currentUser.id || pendingUserId === u.id}
                >
                  <Trash2 className="w-4 h-4" />
                </IconButton>
              </div>
            ),
          },
        ]}
      />

      {/* Add User Modal */}
      <Modal
        open={isAddModalOpen}
        title={editingUser ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}
        onClose={closeModal}
        footer={(
          <>
            <Button variant="ghost" onClick={closeModal}>Batal</Button>
            <Button id="btn-save-new-user" type="submit" form="form-user-management" loading={saving}>
              {editingUser ? <Edit className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? 'Menyimpan...' : editingUser ? 'Simpan Perubahan' : 'Simpan Pengguna'}
            </Button>
          </>
        )}
      >
        <form id="form-user-management" onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <Field label="Nama Lengkap" required>
                <Input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Contoh: Budi Santoso, S.Pd."
                />
              </Field>

              <Field label="Email Akun" required>
                <Input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="budi.santoso@sekolah.sch.id"
                />
              </Field>

              <Field label="Peran / Role" required>
                <Select
                  value={form.role}
                  onChange={(e) => setForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                >
                  <option value="guru">Guru (Pembuat & Penguji Soal)</option>
                  <option value="siswa">Siswa (Peserta Ujian CBT)</option>
                  <option value="admin">Administrator (Akses Penuh)</option>
                </Select>
              </Field>

              <Field label="NIP / NISN">
                <Input
                  type="text"
                  value={form.nip_nisn}
                  onChange={(e) => setForm(prev => ({ ...prev, nip_nisn: e.target.value }))}
                  placeholder="198501152010011002 atau NISN Siswa"
                  className="font-mono"
                />
              </Field>

              <Field label="No. Telepon">
                <Input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="08123456789"
                />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label={`Password ${editingUser ? 'Baru' : ''}`} required={!editingUser}>
                  <Input
                    type="password"
                    required={!editingUser}
                    minLength={8}
                    value={form.password}
                    onChange={(e) => setForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder={editingUser ? 'Kosongkan jika tetap' : 'Minimal 8 karakter'}
                  />
                </Field>
                <Field label="Konfirmasi" required={!editingUser || Boolean(form.password)}>
                  <Input
                    type="password"
                    required={!editingUser || Boolean(form.password)}
                    minLength={8}
                    value={form.password_confirmation}
                    onChange={(e) => setForm(prev => ({ ...prev, password_confirmation: e.target.value }))}
                    placeholder="Ulangi password"
                  />
                </Field>
              </div>
            </form>
      </Modal>
    </div>
  );
};
