'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AppShellContextType {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  isUtilityPanelOpen: boolean;
  setUtilityPanelOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  toggleUtilityPanel: () => void;
}

const AppShellContext = createContext<AppShellContextType | undefined>(undefined);

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isUtilityPanelOpen, setUtilityPanelOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const toggleUtilityPanel = () => setUtilityPanelOpen(prev => !prev);

  return (
    <AppShellContext.Provider
      value={{
        isSidebarOpen,
        setSidebarOpen,
        isUtilityPanelOpen,
        setUtilityPanelOpen,
        toggleSidebar,
        toggleUtilityPanel,
      }}
    >
      {children}
    </AppShellContext.Provider>
  );
}

export function useAppShell() {
  const context = useContext(AppShellContext);
  if (context === undefined) {
    throw new Error('useAppShell must be used within an AppShellProvider');
  }
  return context;
}
