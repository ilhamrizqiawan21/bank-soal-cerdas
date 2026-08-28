import { Role } from '../types';
import { canAccessRegisteredView } from './viewAccess';

export function landingViewForRole(role: Role): string {
  return role === 'siswa' ? 'ujian-siswa' : 'dashboard';
}

export function roleLabel(role: Role): string {
  if (role === 'admin') return 'Administrator';
  if (role === 'guru') return 'Guru';
  return 'Siswa';
}

export function canAccessView(view: string, role: Role): boolean {
  return canAccessRegisteredView(view, role);
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
