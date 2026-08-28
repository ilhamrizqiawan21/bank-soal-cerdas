import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { pathToView, viewToPath } from '../lib/appRoutes';

type NavigateOptions = {
  replace?: boolean;
};

type RouteParams = Parameters<typeof viewToPath>[1];

type RouterContextValue = {
  pathname: string;
  currentView: string;
  navigate: (path: string, options?: NavigateOptions) => void;
  navigateToView: (view: string, params?: RouteParams, options?: NavigateOptions) => void;
};

const RouterContext = createContext<RouterContextValue | undefined>(undefined);

function currentPathname(): string {
  return window.location.pathname;
}

export const BrowserRouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pathname, setPathname] = useState(currentPathname);

  useEffect(() => {
    const syncPathname = () => setPathname(currentPathname());
    window.addEventListener('popstate', syncPathname);

    return () => window.removeEventListener('popstate', syncPathname);
  }, []);

  const navigate = useCallback((path: string, options: NavigateOptions = {}) => {
    if (window.location.pathname === path) {
      setPathname(path);
      return;
    }

    if (options.replace) {
      window.history.replaceState({}, '', path);
    } else {
      window.history.pushState({}, '', path);
    }

    setPathname(path);
  }, []);

  const navigateToView = useCallback((view: string, params?: RouteParams, options?: NavigateOptions) => {
    navigate(viewToPath(view, params), options);
  }, [navigate]);

  const value = useMemo<RouterContextValue>(() => ({
    pathname,
    currentView: pathToView(pathname),
    navigate,
    navigateToView,
  }), [navigate, navigateToView, pathname]);

  return (
    <RouterContext.Provider value={value}>
      {children}
    </RouterContext.Provider>
  );
};

export function useRouter(): RouterContextValue {
  const router = useContext(RouterContext);
  if (!router) {
    throw new Error('useRouter must be used within BrowserRouterProvider');
  }
  return router;
}
