import type { Role } from '../types';

type ViewAccessDefinition = {
  roles: readonly Role[];
};

const ADMIN_AND_GURU = ['admin', 'guru'] as const;
const ALL_ROLES = ['admin', 'guru', 'siswa'] as const;
const STUDENT_ONLY = ['siswa'] as const;

export const VIEW_ACCESS: Record<string, ViewAccessDefinition> = {
  dashboard: { roles: ALL_ROLES },
  questions: { roles: ADMIN_AND_GURU },
  'question-form': { roles: ADMIN_AND_GURU },
  'questions-create': { roles: ADMIN_AND_GURU },
  'questions-edit': { roles: ADMIN_AND_GURU },
  subjects: { roles: ADMIN_AND_GURU },
  kategori: { roles: ADMIN_AND_GURU },
  tag: { roles: ADMIN_AND_GURU },
  tags: { roles: ADMIN_AND_GURU },
  'paket-soal': { roles: ADMIN_AND_GURU },
  'paket-soal-create': { roles: ADMIN_AND_GURU },
  'paket-soal-edit': { roles: ADMIN_AND_GURU },
  ujian: { roles: ALL_ROLES },
  'ujian-siswa': { roles: STUDENT_ONLY },
  'ujian-cbt': { roles: STUDENT_ONLY },
  'ujian-hasil': { roles: ALL_ROLES },
  analisis: { roles: ADMIN_AND_GURU },
  'kko-master': { roles: ADMIN_AND_GURU },
  share: { roles: ADMIN_AND_GURU },
  shares: { roles: ADMIN_AND_GURU },
  users: { roles: ['admin'] },
  profile: { roles: ALL_ROLES },
};

export function canAccessRegisteredView(view: string, role: Role): boolean {
  return VIEW_ACCESS[view]?.roles.includes(role) ?? false;
}

export function viewsForRole(role: Role): string[] {
  return Object.entries(VIEW_ACCESS)
    .filter(([, access]) => access.roles.includes(role))
    .map(([view]) => view);
}
