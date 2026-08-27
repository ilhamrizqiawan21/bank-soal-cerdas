import { Role } from '../types';

const teacherViews = new Set([
  'questions',
  'questions-create',
  'questions-edit',
  'subjects',
  'kategori',
  'tag',
  'tags',
  'paket-soal',
  'paket-soal-create',
  'paket-soal-edit',
  'ujian',
  'analisis',
  'kko-master',
  'share',
  'shares',
]);

const studentViews = new Set(['dashboard', 'profile', 'ujian', 'ujian-siswa', 'ujian-cbt', 'ujian-hasil']);
const commonViews = new Set(['dashboard', 'profile', 'ujian-hasil']);

export function landingViewForRole(role: Role): string {
  return role === 'siswa' ? 'ujian-siswa' : 'dashboard';
}

export function roleLabel(role: Role): string {
  if (role === 'admin') return 'Administrator';
  if (role === 'guru') return 'Guru';
  return 'Siswa';
}

export function canAccessView(view: string, role: Role): boolean {
  if (commonViews.has(view)) return true;
  if (role === 'admin') return teacherViews.has(view) || view === 'users';
  if (role === 'guru') return teacherViews.has(view);
  return studentViews.has(view);
}

export function canManageOwnableResource(role: Role, userId: string, ownerId?: string): boolean {
  return role === 'admin' || Boolean(ownerId && userId === ownerId);
}

export function canUseSharedResource(permission?: 'view' | 'edit' | 'copy', action: 'view' | 'edit' | 'copy' = 'view'): boolean {
  if (!permission) return false;
  if (action === 'view') return true;
  if (action === 'copy') return permission === 'copy' || permission === 'edit';
  return permission === 'edit';
}
