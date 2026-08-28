import React from 'react';
import { AppShell } from './components/AppShell';
import { AppProvider } from './context/AppContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { BrowserRouterProvider } from './context/RouterContext';

export default function App() {
  return (
    <BrowserRouterProvider>
      <AppProvider>
        <ConfirmProvider>
          <AppShell />
        </ConfirmProvider>
      </AppProvider>
    </BrowserRouterProvider>
  );
}
