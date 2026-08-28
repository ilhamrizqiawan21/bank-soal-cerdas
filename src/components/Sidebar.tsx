import React from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  HelpCircle,
  BookOpen,
  Layers,
  BarChart3,
  ClipboardCheck,
  FolderTree,
  Tag as TagIcon,
  Share2,
  Users,
  User,
  GraduationCap,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  mobileOpen?: boolean;
  onClose?: () => void;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  mobileOpen,
  onClose,
  onCloseMobile,
}) => {
  const activeOpen = mobileOpen !== undefined ? mobileOpen : (isOpen ?? false);
  const handleClose = onCloseMobile || onClose || (() => {});
  const {
    currentView,
    setCurrentView,
    currentUser,
    questions,
    subjects,
    categories,
    tags,
    paketSoalList,
    ujianList,
    pendingNotifications
  } = useApp();

  const isTeacherOrAdmin = currentUser.role === 'admin' || currentUser.role === 'guru';
  const isStudent = currentUser.role === 'siswa';

  const myExamsCount = ujianList.filter(u => u.siswa_id === currentUser.id).length;
  const activeExamsCount = ujianList.filter(u => u.status === 'active').length;

  const navigateTo = (view: string) => {
    setCurrentView(view);
    if (window.innerWidth < 1024) {
      handleClose();
    }
  };

  const navItemClass = (viewKey: string) => {
    const isActive = currentView === viewKey || currentView.startsWith(`${viewKey}-`);
    return `group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20 font-semibold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
    }`;
  };

  return (
    <>
      {/* Mobile backdrop */}
      {activeOpen && (
        <div
          id="sidebar-backdrop"
          onClick={handleClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      <aside
        id="app-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          activeOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <img
            src="/images/android-chrome-512x512.png"
            alt=""
            className="w-11 h-11 object-contain flex-shrink-0"
          />
          <div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5">
              Bank Soal Cerdas
            </h1>
            <p className="text-[11px] font-medium text-slate-400">Taksonomi Bloom & CBT</p>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-6" aria-label="Navigasi utama aplikasi">
          {/* Section: Utama */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Utama
            </p>
            <button
              id="nav-dashboard"
              onClick={() => navigateTo('dashboard')}
              className={navItemClass('dashboard')}
              aria-current={currentView === 'dashboard' ? 'page' : undefined}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>
          </div>

          {/* Section: Konten (Guru & Admin) */}
          {isTeacherOrAdmin && (
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Konten & Soal
              </p>
              <button
                id="nav-questions"
                onClick={() => navigateTo('questions')}
                className={navItemClass('questions')}
                aria-current={currentView.startsWith('questions') ? 'page' : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>Bank Soal</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-white/20 text-slate-500 group-hover:text-inherit">
                  {questions.length}
                </span>
              </button>

              <button
                id="nav-subjects"
                onClick={() => navigateTo('subjects')}
                className={navItemClass('subjects')}
                aria-current={currentView === 'subjects' ? 'page' : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Mata Pelajaran</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-white/20 text-slate-500 group-hover:text-inherit">
                  {subjects.length}
                </span>
              </button>

              <button
                id="nav-paket-soal"
                onClick={() => navigateTo('paket-soal')}
                className={navItemClass('paket-soal')}
                aria-current={currentView.startsWith('paket-soal') ? 'page' : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <Layers className="w-4 h-4" />
                  <span>Paket Soal</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-white/20 text-slate-500 group-hover:text-inherit">
                  {paketSoalList.length}
                </span>
              </button>
            </div>
          )}

          {/* Section: CBT & Ujian */}
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {isStudent ? 'Ujian Online (CBT)' : 'Aktivitas Ujian'}
            </p>
            {isTeacherOrAdmin && (
              <>
                <button
                  id="nav-ujian"
                  onClick={() => navigateTo('ujian')}
                  className={navItemClass('ujian')}
                  aria-current={currentView === 'ujian' ? 'page' : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <ClipboardCheck className="w-4 h-4" />
                    <span>Jadwal & Ujian</span>
                  </div>
                  {activeExamsCount > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500 text-white font-bold">
                      {activeExamsCount} Aktif
                    </span>
                  )}
                </button>
                <button
                  id="nav-analisis"
                  onClick={() => navigateTo('analisis')}
                  className={navItemClass('analisis')}
                  aria-current={currentView === 'analisis' ? 'page' : undefined}
                >
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="w-4 h-4" />
                    <span>Analisis Butir Soal</span>
                  </div>
                </button>
              </>
            )}

            {isStudent && (
              <button
                id="nav-ujian-siswa"
                onClick={() => navigateTo('ujian-siswa')}
                className={navItemClass('ujian-siswa')}
                aria-current={currentView === 'ujian-siswa' ? 'page' : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <GraduationCap className="w-4 h-4" />
                  <span>Ujian CBT Saya</span>
                </div>
                {myExamsCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 font-bold">
                    {myExamsCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Section: Pengelolaan & Taksonomi */}
          {isTeacherOrAdmin && (
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Taksonomi & Tag
              </p>
              <button
                id="nav-kategori"
                onClick={() => navigateTo('kategori')}
                className={navItemClass('kategori')}
                aria-current={currentView === 'kategori' ? 'page' : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <FolderTree className="w-4 h-4" />
                  <span>Kategori Asesmen</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-white/20 text-slate-500 group-hover:text-inherit">
                  {categories.length}
                </span>
              </button>

              <button
                id="nav-tag"
                onClick={() => navigateTo('tag')}
                className={navItemClass('tag')}
                aria-current={currentView === 'tag' || currentView === 'tags' ? 'page' : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <TagIcon className="w-4 h-4" />
                  <span>Tag & Karakteristik</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-white/20 text-slate-500 group-hover:text-inherit">
                  {tags.length}
                </span>
              </button>

              <button
                id="nav-share"
                onClick={() => navigateTo('share')}
                className={navItemClass('share')}
                aria-current={currentView === 'share' || currentView === 'shares' ? 'page' : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <Share2 className="w-4 h-4" />
                  <span>Kolaborasi Guru</span>
                </div>
                {pendingNotifications.length > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                )}
              </button>
            </div>
          )}

          {/* Section: Administrasi Sistem (Admin Only) */}
          {currentUser.role === 'admin' && (
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Administrasi
              </p>
              <button
                id="nav-users"
                onClick={() => navigateTo('users')}
                className={navItemClass('users')}
                aria-current={currentView === 'users' ? 'page' : undefined}
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4" />
                  <span>Manajemen User</span>
                </div>
              </button>
            </div>
          )}
        </nav>

        {/* Footer User Card */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <button
            id="nav-profile-bottom"
            onClick={() => navigateTo('profile')}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs">
                <User className="w-4 h-4" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-slate-400 capitalize">{currentUser.role}</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </aside>
    </>
  );
};
