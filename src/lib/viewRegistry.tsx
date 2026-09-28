import React from 'react';
import type { Role } from '../types';
import { VIEW_ACCESS } from './viewAccess';

// Each view is its own chunk, fetched only when that route is actually visited.
// Before this, every view (and everything it imports — chart.js, the xlsx
// import/export libraries, every admin form) shipped in the one bundle every
// user downloaded on first load, including a student who only ever opens the
// CBT exam screen. AppShell wraps the render output in <Suspense>, so a
// lightweight loading skeleton shows while a chunk is fetched.
const DashboardView = React.lazy(() =>
  import('../components/DashboardView').then((m) => ({ default: m.DashboardView }))
);
const QuestionListView = React.lazy(() =>
  import('../components/QuestionListView').then((m) => ({ default: m.QuestionListView }))
);
const QuestionFormView = React.lazy(() =>
  import('../components/QuestionFormView').then((m) => ({ default: m.QuestionFormView }))
);
const SubjectListView = React.lazy(() =>
  import('../components/SubjectListView').then((m) => ({ default: m.SubjectListView }))
);
const PaketSoalListView = React.lazy(() =>
  import('../components/PaketSoalListView').then((m) => ({ default: m.PaketSoalListView }))
);
const PaketSoalFormView = React.lazy(() =>
  import('../components/PaketSoalFormView').then((m) => ({ default: m.PaketSoalFormView }))
);
const UjianManagementView = React.lazy(() =>
  import('../components/UjianManagementView').then((m) => ({ default: m.UjianManagementView }))
);
const UjianDaftarSiswaView = React.lazy(() =>
  import('../components/UjianDaftarSiswaView').then((m) => ({ default: m.UjianDaftarSiswaView }))
);
const UjianKerjakanCBTView = React.lazy(() =>
  import('../components/UjianKerjakanCBTView').then((m) => ({ default: m.UjianKerjakanCBTView }))
);
const UjianHasilView = React.lazy(() =>
  import('../components/UjianHasilView').then((m) => ({ default: m.UjianHasilView }))
);
const AnalisisView = React.lazy(() =>
  import('../components/AnalisisView').then((m) => ({ default: m.AnalisisView }))
);
const KkoMasterView = React.lazy(() =>
  import('../components/KkoMasterView').then((m) => ({ default: m.KkoMasterView }))
);
const CollaborationView = React.lazy(() =>
  import('../components/CollaborationView').then((m) => ({ default: m.CollaborationView }))
);
const UserManagementView = React.lazy(() =>
  import('../components/UserManagementView').then((m) => ({ default: m.UserManagementView }))
);
const ProfileView = React.lazy(() =>
  import('../components/ProfileView').then((m) => ({ default: m.ProfileView }))
);
const KategoriListView = React.lazy(() =>
  import('../components/KategoriListView').then((m) => ({ default: m.KategoriListView }))
);
const TagListView = React.lazy(() =>
  import('../components/TagListView').then((m) => ({ default: m.TagListView }))
);

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
