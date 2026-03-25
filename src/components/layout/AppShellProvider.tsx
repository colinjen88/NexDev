'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface ReadingPreferences {
  fontSize: '14px' | '16px' | '18px' | '20px';
  lineHeight: '1.6' | '1.75' | '1.9' | '2.0';
  isFocusMode: boolean;
}

export const DEFAULT_PREFS: ReadingPreferences = {
  fontSize: '16px',
  lineHeight: '1.75',
  isFocusMode: false,
};

interface AppShellContextType {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
  isUtilityPanelOpen: boolean;
  setUtilityPanelOpen: (isOpen: boolean) => void;
  toggleSidebar: () => void;
  toggleUtilityPanel: () => void;
  readingPreferences: ReadingPreferences;
  updateReadingPreference: <K extends keyof ReadingPreferences>(key: K, value: ReadingPreferences[K]) => void;
}

const AppShellContext = createContext<AppShellContextType | undefined>(undefined);

export function AppShellProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isUtilityPanelOpen, setUtilityPanelOpen] = useState(false);
  const [readingPreferences, setReadingPreferences] = useState<ReadingPreferences>(DEFAULT_PREFS);
  const [isLoaded, setIsLoaded] = useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem('reading-preferences');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setReadingPreferences({ ...DEFAULT_PREFS, ...parsed });
      } catch (e) {
        console.error('Failed to parse reading preferences', e);
      }
    }
    setIsLoaded(true);
  }, []);

  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('reading-preferences', JSON.stringify(readingPreferences));
    }
  }, [readingPreferences, isLoaded]);

  const toggleSidebar = () => setSidebarOpen(prev => !prev);
  const toggleUtilityPanel = () => setUtilityPanelOpen(prev => !prev);

  const updateReadingPreference = <K extends keyof ReadingPreferences>(key: K, value: ReadingPreferences[K]) => {
    setReadingPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AppShellContext.Provider
      value={{
        isSidebarOpen,
        setSidebarOpen,
        isUtilityPanelOpen,
        setUtilityPanelOpen,
        toggleSidebar,
        toggleUtilityPanel,
        readingPreferences,
        updateReadingPreference,
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
