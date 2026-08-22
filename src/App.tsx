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
import { KategoriListView } from './components/KategoriListView';
import { TagListView } from './components/TagListView';

const MainLayout: React.FC = () => {
  const { currentView, currentUser } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // If in active CBT exam mode, render the full-screen distraction-free player without main chrome
  if (currentView === 'ujian-cbt') {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <UjianKerjakanCBTView />
        <ToastContainer />
      </div>
    );
  }

  // Render current view
  const renderCurrentView = () => {
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
          {renderCurrentView()}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
