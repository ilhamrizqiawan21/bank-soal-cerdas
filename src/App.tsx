import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ToastContainer } from './components/ToastContainer';
import { DashboardView } from './components/DashboardView';
import { QuestionListView } from './components/QuestionListView';
import { QuestionFormView } from './components/QuestionFormView';
import { SubjectListView } from './components/SubjectListView';
import { PaketSoalListView } from './components/PaketSoalListView';
import { PaketSoalFormView } from './components/PaketSoalFormView';
import { UjianManagementView } from './components/UjianManagementView';
import { UjianDaftarSiswaView } from './components/UjianDaftarSiswaView';
import { UjianKerjakanCBTView } from './components/UjianKerjakanCBTView';
import { UjianHasilView } from './components/UjianHasilView';
import { AnalisisView } from './components/AnalisisView';
import { KkoMasterView } from './components/KkoMasterView';
import { CollaborationView } from './components/CollaborationView';
import { UserManagementView } from './components/UserManagementView';
import { ProfileView } from './components/ProfileView';
import { KategoriListView } from './components/KategoriListView';
import { TagListView } from './components/TagListView';
import { Button, Skeleton } from './components/ui';
import { canAccessView, landingViewForRole, roleLabel } from './lib/roleAccess';
import type { Role } from './types';

const MainLayout: React.FC = () => {
  const { currentView, currentUser, isDataLoading, dataLoadError, refreshServerData } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentViewAllowed = canAccessView(currentView, currentUser.role);

  // If in active CBT exam mode, render the full-screen distraction-free player without main chrome.
  if (currentView === 'ujian-cbt' && currentViewAllowed) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <UjianKerjakanCBTView />
        <ToastContainer />
      </div>
    );
  }

  // Render current view
  const renderCurrentView = () => {
    if (!currentViewAllowed) {
      return (
        <ForbiddenState
          role={currentUser.role}
          onBack={() => setMobileMenuOpen(false)}
        />
      );
    }

    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'questions':
        return <QuestionListView />;
      case 'questions-create':
        return <QuestionFormView isEditing={false} />;
      case 'questions-edit':
        return <QuestionFormView isEditing={true} />;
      case 'subjects':
        return <SubjectListView />;
      case 'kategori':
        return <KategoriListView />;
      case 'tag':
      case 'tags':
        return <TagListView />;
      case 'paket-soal':
        return <PaketSoalListView />;
      case 'paket-soal-create':
        return <PaketSoalFormView isEditing={false} />;
      case 'paket-soal-edit':
        return <PaketSoalFormView isEditing={true} />;
      case 'ujian':
        return currentUser.role === 'siswa' ? <UjianDaftarSiswaView /> : <UjianManagementView />;
      case 'ujian-siswa':
        return <UjianDaftarSiswaView />;
      case 'ujian-hasil':
        return <UjianHasilView />;
      case 'analisis':
        return <AnalisisView />;
      case 'kko-master':
        return <KkoMasterView />;
      case 'share':
      case 'shares':
        return <CollaborationView />;
      case 'users':
        return <UserManagementView />;
      case 'profile':
        return <ProfileView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        {/* Desktop & Mobile Sidebar */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0">
          {isDataLoading ? (
            <DataLoadingState />
          ) : dataLoadError ? (
            <DataErrorState message={dataLoadError} onRetry={() => refreshServerData()} />
          ) : (
            renderCurrentView()
          )}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

const ForbiddenState: React.FC<{ role: Role; onBack: () => void }> = ({ role, onBack }) => {
  const { setCurrentView } = useApp();

  const handleBack = () => {
    setCurrentView(landingViewForRole(role));
    onBack();
  };

  return (
    <div className="rounded-lg border border-amber-200 dark:border-amber-900 bg-white dark:bg-slate-900 p-6 text-center space-y-3">
      <h2 className="text-base font-bold text-slate-900 dark:text-white">Halaman tidak tersedia untuk role ini</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Akun Anda masuk sebagai {roleLabel(role)}. Menu ini hanya ditampilkan jika izin akun sesuai.
      </p>
      <Button variant="warning" onClick={handleBack}>
        Kembali ke Halaman Utama
      </Button>
    </div>
  );
};

const DataLoadingState: React.FC = () => (
  <div className="space-y-4" aria-busy="true" aria-live="polite">
    <Skeleton className="h-8 w-56" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[0, 1, 2].map(item => (
        <div key={item} className="h-28 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="mt-5 h-7 w-16" />
        </div>
      ))}
    </div>
    <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3">
      {[0, 1, 2, 3].map(item => (
        <Skeleton key={item} className="h-9 bg-slate-100" />
      ))}
    </div>
  </div>
);

const DataErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="rounded-lg border border-rose-200 dark:border-rose-900 bg-white dark:bg-slate-900 p-6 text-center space-y-3">
    <h2 className="text-base font-bold text-slate-900 dark:text-white">Data gagal dimuat</h2>
    <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    <Button variant="danger" onClick={onRetry}>
      Coba Lagi
    </Button>
  </div>
);

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
