import React, { useMemo, useState } from 'react';
import { Camera, KeyRound, Save, UserCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { User } from '../types';
import { Button, Field, Input, Select, Textarea } from './ui';

const avatarUrl = (avatar?: string) => {
  if (!avatar) return '';
  if (avatar.startsWith('blob:') || avatar.startsWith('http') || avatar.startsWith('/')) return avatar;
  return `/storage/${avatar}`;
};

export const ProfileView: React.FC = () => {
  const { currentUser, updateProfile, updateAvatar, updatePassword } = useApp();
  const [profile, setProfile] = useState({
    name: currentUser.name,
    email: currentUser.email,
    phone: currentUser.phone ?? '',
    address: currentUser.address ?? '',
    gender: currentUser.gender ?? '',
    birth_date: currentUser.birth_date ?? '',
  });
  const [password, setPassword] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

  const initials = useMemo(() => {
    return currentUser.name
      .split(' ')
      .map(part => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }, [currentUser.name]);

  const handleProfileSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        name: profile.name,
        email: profile.email,
        phone: profile.phone || undefined,
        address: profile.address || undefined,
        gender: (profile.gender as User['gender']) || null,
        birth_date: profile.birth_date || null,
      });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSavingAvatar(true);
    try {
      await updateAvatar(file);
    } finally {
      setSavingAvatar(false);
      event.target.value = '';
    }
  };

  const handlePasswordSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingPassword(true);
    try {
      await updatePassword(password);
      setPassword({ current_password: '', password: '', password_confirmation: '' });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserCircle className="w-5 h-5 text-blue-600" />
            Profil Saya
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Kelola identitas akun, foto profil, dan keamanan password.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-4">
          <div className="flex flex-col items-center text-center gap-3">
            {currentUser.avatar ? (
              <img
                src={avatarUrl(currentUser.avatar)}
                alt={currentUser.name}
                className="w-24 h-24 rounded-2xl object-cover border border-slate-200 dark:border-slate-800"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-2xl font-black">
                {initials}
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{currentUser.name}</h3>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold uppercase text-slate-600 dark:text-slate-300">
              {currentUser.role}
            </span>
          </div>

          <label className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-4 text-xs font-bold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300 cursor-pointer">
            <Camera className="w-4 h-4" />
            {savingAvatar ? 'Mengunggah...' : 'Ganti Foto Profil'}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleAvatarChange}
              disabled={savingAvatar}
            />
          </label>
        </section>

        <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Data Profil</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nama Lengkap" required>
                <Input required value={profile.name} onChange={e => setProfile(prev => ({ ...prev, name: e.target.value }))} />
              </Field>
              <Field label="Email" required>
                <Input required type="email" value={profile.email} onChange={e => setProfile(prev => ({ ...prev, email: e.target.value }))} />
              </Field>
              <Field label="No. Telepon">
                <Input value={profile.phone} onChange={e => setProfile(prev => ({ ...prev, phone: e.target.value }))} />
              </Field>
              <Field label="Tanggal Lahir">
                <Input type="date" value={profile.birth_date ?? ''} onChange={e => setProfile(prev => ({ ...prev, birth_date: e.target.value }))} />
              </Field>
              <Field label="Jenis Kelamin">
                <Select value={profile.gender ?? ''} onChange={e => setProfile(prev => ({ ...prev, gender: e.target.value }))}>
                  <option value="">Tidak diisi</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </Select>
              </Field>
              <Field label="Alamat">
                <Textarea rows={3} value={profile.address} onChange={e => setProfile(prev => ({ ...prev, address: e.target.value }))} className="resize-none" />
              </Field>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" loading={savingProfile}>
                <Save className="w-4 h-4" /> {savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
              </Button>
            </div>
          </form>
        </section>

        <section className="lg:col-span-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" />
              Ubah Password
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Field label="Password Saat Ini" required>
                <Input required type="password" value={password.current_password} onChange={e => setPassword(prev => ({ ...prev, current_password: e.target.value }))} />
              </Field>
              <Field label="Password Baru" required>
                <Input required minLength={8} type="password" value={password.password} onChange={e => setPassword(prev => ({ ...prev, password: e.target.value }))} />
              </Field>
              <Field label="Konfirmasi Password" required>
                <Input required minLength={8} type="password" value={password.password_confirmation} onChange={e => setPassword(prev => ({ ...prev, password_confirmation: e.target.value }))} />
              </Field>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="warning" loading={savingPassword}>
                <KeyRound className="w-4 h-4" /> {savingPassword ? 'Menyimpan...' : 'Ubah Password'}
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};
