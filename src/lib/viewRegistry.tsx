import React from 'react';
import { DashboardView } from '../components/DashboardView';
import { QuestionListView } from '../components/QuestionListView';
import { QuestionFormView } from '../components/QuestionFormView';
import { SubjectListView } from '../components/SubjectListView';
import { PaketSoalListView } from '../components/PaketSoalListView';
import { PaketSoalFormView } from '../components/PaketSoalFormView';
import { UjianManagementView } from '../components/UjianManagementView';
import { UjianDaftarSiswaView } from '../components/UjianDaftarSiswaView';
import { UjianKerjakanCBTView } from '../components/UjianKerjakanCBTView';
import { UjianHasilView } from '../components/UjianHasilView';
import { AnalisisView } from '../components/AnalisisView';
import { KkoMasterView } from '../components/KkoMasterView';
import { CollaborationView } from '../components/CollaborationView';
import { UserManagementView } from '../components/UserManagementView';
import { ProfileView } from '../components/ProfileView';
import { KategoriListView } from '../components/KategoriListView';
import { TagListView } from '../components/TagListView';
import type { Role } from '../types';
import { VIEW_ACCESS } from './viewAccess';

type ViewContext = {
  role: Role;
};

type ViewDefinition = {
  breadcrumbs: string[];
  roles: readonly Role[];
  fullScreen?: boolean;
  render: (context: ViewContext) => React.ReactNode;
};

export const viewRegistry: Record<string, ViewDefinition> = {
  dashboard: {
    breadcrumbs: ['Dashboard'],
    roles: VIEW_ACCESS.dashboard.roles,
    render: () => <DashboardView />,
  },
  questions: {
    breadcrumbs: ['Bank Soal'],
    roles: VIEW_ACCESS.questions.roles,
    render: () => <QuestionListView />,
  },
  'questions-create': {
    breadcrumbs: ['Bank Soal', 'Tambah Soal'],
    roles: VIEW_ACCESS['questions-create'].roles,
    render: () => <QuestionFormView isEditing={false} />,
  },
  'questions-edit': {
    breadcrumbs: ['Bank Soal', 'Edit Soal'],
    roles: VIEW_ACCESS['questions-edit'].roles,
    render: () => <QuestionFormView isEditing={true} />,
  },
  subjects: {
    breadcrumbs: ['Master Data', 'Mata Pelajaran'],
    roles: VIEW_ACCESS.subjects.roles,
    render: () => <SubjectListView />,
  },
  kategori: {
    breadcrumbs: ['Master Data', 'Kategori'],
    roles: VIEW_ACCESS.kategori.roles,
    render: () => <KategoriListView />,
  },
  tag: {
    breadcrumbs: ['Master Data', 'Karakteristik'],
    roles: VIEW_ACCESS.tag.roles,
    render: () => <TagListView />,
  },
  tags: {
    breadcrumbs: ['Master Data', 'Karakteristik'],
    roles: VIEW_ACCESS.tags.roles,
    render: () => <TagListView />,
  },
  'paket-soal': {
    breadcrumbs: ['Paket Soal'],
    roles: VIEW_ACCESS['paket-soal'].roles,
    render: () => <PaketSoalListView />,
  },
  'paket-soal-create': {
    breadcrumbs: ['Paket Soal', 'Tambah Paket'],
    roles: VIEW_ACCESS['paket-soal-create'].roles,
    render: () => <PaketSoalFormView isEditing={false} />,
  },
  'paket-soal-edit': {
    breadcrumbs: ['Paket Soal', 'Edit Paket'],
    roles: VIEW_ACCESS['paket-soal-edit'].roles,
    render: () => <PaketSoalFormView isEditing={true} />,
  },
  ujian: {
    breadcrumbs: ['Ujian CBT'],
    roles: VIEW_ACCESS.ujian.roles,
    render: ({ role }) => (role === 'siswa' ? <UjianDaftarSiswaView /> : <UjianManagementView />),
  },
  'ujian-siswa': {
    breadcrumbs: ['Ujian Saya'],
    roles: VIEW_ACCESS['ujian-siswa'].roles,
    render: () => <UjianDaftarSiswaView />,
  },
  'ujian-cbt': {
    breadcrumbs: ['Ujian Saya', 'Kerjakan'],
    roles: VIEW_ACCESS['ujian-cbt'].roles,
    fullScreen: true,
    render: () => <UjianKerjakanCBTView />,
  },
  'ujian-hasil': {
    breadcrumbs: ['Ujian CBT', 'Hasil'],
    roles: VIEW_ACCESS['ujian-hasil'].roles,
    render: () => <UjianHasilView />,
  },
  analisis: {
    breadcrumbs: ['Analisis'],
    roles: VIEW_ACCESS.analisis.roles,
    render: () => <AnalisisView />,
  },
  'kko-master': {
    breadcrumbs: ['Master Data', 'KKO'],
    roles: VIEW_ACCESS['kko-master'].roles,
    render: () => <KkoMasterView />,
  },
  share: {
    breadcrumbs: ['Kolaborasi'],
    roles: VIEW_ACCESS.share.roles,
    render: () => <CollaborationView />,
  },
  shares: {
    breadcrumbs: ['Kolaborasi'],
    roles: VIEW_ACCESS.shares.roles,
    render: () => <CollaborationView />,
  },
  users: {
    breadcrumbs: ['Administrasi', 'Pengguna'],
    roles: VIEW_ACCESS.users.roles,
    render: () => <UserManagementView />,
  },
  profile: {
    breadcrumbs: ['Akun', 'Profil'],
    roles: VIEW_ACCESS.profile.roles,
    render: () => <ProfileView />,
  },
};

export function getViewDefinition(view: string): ViewDefinition {
  return viewRegistry[view] ?? viewRegistry.dashboard;
}

export function renderView(view: string, context: ViewContext): React.ReactNode {
  return getViewDefinition(view).render(context);
}

export function isFullScreenView(view: string): boolean {
  return Boolean(getViewDefinition(view).fullScreen);
}

export function getBreadcrumbLabels(view: string): string[] {
  return getViewDefinition(view).breadcrumbs;
}
