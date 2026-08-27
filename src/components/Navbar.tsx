import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { isBootstrapped } from '../lib/api';
import {
  Search,
  Bell,
  Plus,
  UserCheck,
  Check,
  X,
  Menu,
  ChevronDown,
  LogOut,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  Sun,
  Moon
} from 'lucide-react';
import { Badge, Button, IconButton, Input } from './ui';

interface NavbarProps {
  onToggleSidebar?: () => void;
  onToggleMobileMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onToggleMobileMenu }) => {
  const {
    currentUser,
    users,
    setCurrentUser,
    pendingNotifications,
    acceptShareSoal,
    rejectShareSoal,
    acceptSharePaket,
    rejectSharePaket,
    setCurrentView,
    searchGlobalQuery,
    setSearchGlobalQuery,
    theme,
    toggleTheme,
  } = useApp();

  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const showDemoUserSwitcher = !isBootstrapped();

  useEffect(() => {
    if (!showNotifMenu && !showUserMenu) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowNotifMenu(false);
        setShowUserMenu(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showNotifMenu, showUserMenu]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchGlobalQuery.trim()) {
      setCurrentView('questions');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge tone="purple" className="normal-case"><ShieldCheck className="w-3 h-3" /> Admin</Badge>;
      case 'guru':
        return <Badge tone="blue" className="normal-case"><BookOpen className="w-3 h-3" /> Guru</Badge>;
      default:
        return <Badge tone="emerald" className="normal-case"><GraduationCap className="w-3 h-3" /> Siswa</Badge>;
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between gap-4 transition-colors">
      <div className="flex items-center gap-3">
        <IconButton
          id="btn-toggle-sidebar"
          onClick={onToggleMobileMenu || onToggleSidebar}
          label="Toggle sidebar"
        >
          <Menu className="w-5 h-5" />
        </IconButton>

        {/* Global Search */}
        {(currentUser.role === 'admin' || currentUser.role === 'guru') && (
          <form onSubmit={handleSearchSubmit} className="relative hidden md:block max-w-xs w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input
              id="global-search-input"
              type="text"
              value={searchGlobalQuery}
              onChange={(e) => setSearchGlobalQuery(e.target.value)}
              aria-label="Cari soal atau topik"
              placeholder="Cari soal / topik..."
              className="py-1.5 pl-9 text-sm bg-slate-100 dark:bg-slate-800 border-none"
            />
          </form>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {/* Theme Light/Dark Mode Switcher */}
        <IconButton
          id="btn-toggle-theme"
          onClick={toggleTheme}
          className="border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          label={theme === 'dark' ? 'Beralih ke mode terang' : 'Beralih ke mode gelap'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400 animate-in spin-in-90 duration-300" />
          ) : (
            <Moon className="w-5 h-5 text-slate-700 hover:text-indigo-600 animate-in -spin-in-90 duration-300" />
          )}
        </IconButton>

        {/* Quick Add Question Button for Teachers & Admins */}
        {(currentUser.role === 'admin' || currentUser.role === 'guru') && (
          <Button
            id="btn-quick-add-question"
            onClick={() => setCurrentView('questions-create')}
            size="sm"
            className="hidden sm:inline-flex"
          >
            <Plus className="w-4 h-4" />
            Tambah Soal
          </Button>
        )}

        {/* Notifications for Collaborations */}
        {(currentUser.role === 'admin' || currentUser.role === 'guru') && (
          <div className="relative">
            <IconButton
              id="btn-notification"
              aria-haspopup="menu"
              aria-expanded={showNotifMenu}
              onClick={() => {
                setShowNotifMenu(!showNotifMenu);
                setShowUserMenu(false);
              }}
              className="relative"
              label="Notifikasi kolaborasi"
            >
              <Bell className="w-5 h-5" />
              {pendingNotifications.length > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              )}
            </IconButton>

            {showNotifMenu && (
              <div
                id="notification-dropdown"
                role="menu"
                aria-labelledby="btn-notification"
                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Undangan Kolaborasi</h4>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                    {pendingNotifications.length} Baru
                  </span>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2">
                  {pendingNotifications.length === 0 ? (
                    <div className="py-6 text-center text-sm text-slate-400">
                      Tidak ada undangan kolaborasi baru.
                    </div>
                  ) : (
                    pendingNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col gap-2"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100">{notif.message}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 italic">"{notif.item_title}"</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 pt-1">
                          <button
                            id={`accept-notif-${notif.id}`}
                            role="menuitem"
                            onClick={() => {
                              if (notif.type === 'share_soal') acceptShareSoal(notif.share_id);
                              else acceptSharePaket(notif.share_id);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" /> Terima
                          </button>
                          <button
                            id={`reject-notif-${notif.id}`}
                            role="menuitem"
                            onClick={() => {
                              if (notif.type === 'share_soal') rejectShareSoal(notif.share_id);
                              else rejectSharePaket(notif.share_id);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:bg-rose-950/40 rounded-md transition-colors"
                          >
                            <X className="w-3.5 h-3.5" /> Tolak
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Account Switcher Dropdown */}
        <div className="relative">
          <button
            id="btn-user-menu"
            aria-haspopup="menu"
            aria-expanded={showUserMenu}
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifMenu(false);
            }}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
                {currentUser.name.split(' ')[0]}
              </div>
              <div className="text-[10px] text-slate-400 capitalize">{currentUser.role}</div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div
              id="user-menu-dropdown"
              role="menu"
              aria-labelledby="btn-user-menu"
              className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-400 font-medium">Akun Saat Ini</span>
                  {getRoleBadge(currentUser.role)}
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">{currentUser.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
              </div>

              {showDemoUserSwitcher && (
                <div className="py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-[11px] font-bold tracking-wider text-slate-400 uppercase mb-2 px-1">
                    Beralih Pengguna Cepat
                  </p>
                  <div className="space-y-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        id={`switch-user-${u.id}`}
                        role="menuitem"
                        onClick={() => {
                          setCurrentUser(u);
                          setShowUserMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                          u.id === currentUser.id
                            ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-5 h-5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-bold flex items-center justify-center">
                            {u.name.charAt(0)}
                          </span>
                          <span className="truncate">{u.name}</span>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">{u.role}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  id="btn-nav-profile"
                  role="menuitem"
                  onClick={() => {
                    setCurrentView('profile');
                    setShowUserMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-slate-400" />
                  Pengaturan & Profil
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
