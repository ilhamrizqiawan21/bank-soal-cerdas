import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { canAccessView } from '../lib/roleAccess';
import { isFullScreenView, renderView } from '../lib/viewRegistry';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ToastContainer } from './ToastContainer';
import { AppBreadcrumb } from './AppBreadcrumb';
import { DataErrorState, DataLoadingState, ForbiddenState } from './AppStates';

export const AppShell: React.FC = () => {
  const {
    currentView,
    currentUser,
    isDataLoading,
    dataLoadError,
    refreshServerData,
    setCurrentView,
    shouldRedirectUnauthenticated,
  } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const currentViewAllowed = canAccessView(currentView, currentUser.role);

  useEffect(() => {
    if (!shouldRedirectUnauthenticated) return;

    const loginUrl = new URL('/login', window.location.origin);
    loginUrl.searchParams.set('intended', window.location.pathname);
    window.location.assign(loginUrl.toString());
  }, [shouldRedirectUnauthenticated]);

  if (shouldRedirectUnauthenticated) {
    return <DataLoadingState />;
  }

  if (isFullScreenView(currentView) && currentViewAllowed) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        {renderView(currentView, { role: currentUser.role })}
        <ToastContainer />
      </div>
    );
  }

  const renderMainContent = () => {
    if (!currentViewAllowed) {
      return <ForbiddenState role={currentUser.role} onBack={() => setMobileMenuOpen(false)} />;
    }

    return renderView(currentView, { role: currentUser.role });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar onToggleMobileMenu={() => setMobileMenuOpen(prev => !prev)} />

      <div className="flex-1 flex max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        <main className="flex-1 min-w-0">
          <AppBreadcrumb currentView={currentView} onNavigate={setCurrentView} />
          {isDataLoading ? (
            <DataLoadingState />
          ) : dataLoadError ? (
            <DataErrorState message={dataLoadError} onRetry={() => refreshServerData()} />
          ) : (
            renderMainContent()
          )}
        </main>
      </div>

      <ToastContainer />
    </div>
  );
};
