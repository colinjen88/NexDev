'use client';

import React from 'react';
import { useAppShell } from './AppShellProvider';
import { Menu, PanelRightClose, PanelRightOpen, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GuideSection } from '@/lib/content/types';
import { PageTOC } from '@/components/guide/PageTOC';
import { useReadingProgress } from '@/lib/hooks/useReadingProgress';
import { CheckCircle2, Minimize } from 'lucide-react';
import { SearchPalette } from '@/components/shared/SearchPalette';
import { ReadingPreferencesPanel } from '@/components/shared/ReadingPreferencesPanel';

export function AppShell({ children, guideSections = [] }: { children: React.ReactNode; guideSections?: GuideSection[] }) {
  const { isSidebarOpen, setSidebarOpen, isUtilityPanelOpen, setUtilityPanelOpen, toggleUtilityPanel, readingPreferences, updateReadingPreference } = useAppShell();
  const { progresses } = useReadingProgress();
  const pathname = usePathname();
  const isGuideRoute = pathname?.startsWith('/guide');
  
  // Find current active section if we are on a guide content page
  const activeSlugMatches = pathname?.match(/^\/guide\/([^\/]+)$/);
  const activeSlug = activeSlugMatches ? activeSlugMatches[1] : null;
  const activeSection = activeSlug ? guideSections.find(g => g.slug === activeSlug) : null;

  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col md:flex-row font-sans text-[var(--text)]">
      <SearchPalette isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* --- Mobile Top Bar --- */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[var(--surface)] border-b border-[var(--line)] sticky top-0 z-20">
        <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 text-[var(--accent-primary)]">
          <Menu className="w-6 h-6" />
        </button>
        <Link href="/" className="font-serif font-bold text-lg text-[var(--text)]">學習型知識工作台</Link>
        <div className="w-8"></div>
      </div>

      {/* --- Left Navigation Sidebar --- */}
      {/* Desktop: fixed / Relative width 280px. Mobile: Off-canvas */}
      <>
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 z-30 md:hidden" 
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <aside 
          className={`fixed md:sticky top-0 left-0 h-screen w-[280px] bg-[var(--surface)] border-r border-[var(--line)] shadow-lg md:shadow-none z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          } ${readingPreferences.isFocusMode ? 'md:hidden md:border-r-0' : 'md:flex'}`}
        >
          <div className="p-4 flex items-center justify-between border-b border-[var(--line)]">
            <Link href="/" className="font-serif font-bold text-lg text-[var(--text)] hidden md:block" onClick={() => setSidebarOpen(false)}>
              學習型知識工作台
            </Link>
            <span className="font-serif font-bold text-lg text-[var(--text)] md:hidden">導航</span>
            <button onClick={() => setSidebarOpen(false)} className="md:hidden p-2 -mr-2 text-[var(--text-muted)]">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {!isGuideRoute ? (
              <>
                <Link href="/" className="block p-2 rounded-lg hover:bg-[var(--surface-soft)] text-sm font-medium transition-colors" key="nav-home">首頁學習儀表板</Link>
                <Link href="/guide" className="block p-2 rounded-lg hover:bg-[var(--surface-soft)] text-sm font-medium transition-colors" key="nav-guide">指南總覽</Link>
                <Link href="/outline" className="block p-2 rounded-lg hover:bg-[var(--surface-soft)] text-sm font-medium transition-colors" key="nav-outline">速讀大綱</Link>
                <Link href="/checklist" className="block p-2 rounded-lg hover:bg-[var(--surface-soft)] text-sm font-medium transition-colors" key="nav-checklist">互動清單</Link>
                <Link href="/compare" className="block p-2 rounded-lg hover:bg-[var(--surface-soft)] text-sm font-medium transition-colors" key="nav-compare">比較模式</Link>
              </>
            ) : (
              // Guide Route Navigation
              <>
                <Link href="/guide" className="block p-2 rounded-lg text-sm font-bold text-[var(--accent-primary)] mb-4">← 返回總覽</Link>
                <div className="space-y-1">
                  {guideSections.map(g => {
                    const isActive = pathname === `/guide/${g.slug}`;
                    const isCompleted = progresses[g.slug]?.isCompleted;
                    return (
                      <Link 
                        key={g.slug} 
                        href={`/guide/${g.slug}`} 
                        className={`block p-2 md:p-3 rounded-lg text-sm transition-colors flex items-start gap-2 ${isActive ? 'bg-[var(--surface-soft)] text-[var(--accent-primary)] font-bold' : 'text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]'}`}
                      >
                         <span className="opacity-60 text-xs mt-0.5">{g.sortOrder.toString().padStart(2, '0')}</span>
                         <span className="leading-snug flex-1">{g.title}</span>
                         {isCompleted && <CheckCircle2 className="w-4 h-4 text-[var(--accent-primary)] shrink-0 self-center" />}
                      </Link>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </aside>
      </>

      {/* --- Main Content Area --- */}
      <main className="flex-1 flex flex-col min-w-0 transition-all duration-300 relative max-w-full md:max-w-none">
        {/* Desktop Top Command Bar Placeholder */}
        <header className="hidden md:flex h-14 border-b border-[var(--line)] bg-[var(--surface)] items-center px-6 justify-between shrink-0 sticky top-0 z-10 w-full">
          <div className="text-sm font-medium text-[var(--text-muted)] flex items-center space-x-4">
             {/* Command Palette Trigger Area */}
             <div 
               className="px-3 py-1.5 bg-[var(--surface-soft)] rounded-md cursor-pointer hover:bg-[var(--line)] transition-colors flex items-center space-x-2"
               onClick={() => setIsSearchOpen(true)}
             >
               <span>搜尋此指南</span>
               <span className="text-xs bg-[var(--bg)] px-1 rounded border border-[var(--line)]">Cmd+K</span>
             </div>
          </div>
          <div className="flex items-center space-x-2">
             {readingPreferences.isFocusMode && (
                <button 
                  onClick={() => updateReadingPreference('isFocusMode', false)}
                  className="mr-2 flex items-center gap-1 text-xs bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] px-3 py-1.5 rounded-full font-bold hover:bg-[var(--accent-primary)]/20 transition-colors"
                >
                  <Minimize className="w-3.5 h-3.5" /> 退出專注
                </button>
             )}
             <button onClick={toggleUtilityPanel} className={`p-2 hover:bg-[var(--surface-soft)] rounded-full transition-colors ${readingPreferences.isFocusMode ? '' : 'xl:hidden'}`} title="Toggle Utility Panel">
                {isUtilityPanelOpen ? <PanelRightClose className="w-5 h-5 text-[var(--accent-primary)]" /> : <PanelRightOpen className="w-5 h-5 text-[var(--text-muted)]" />}
             </button>
          </div>
        </header>

        {/* Dynamic Content Scrollable Area */}
        {/* Centered with max-w of 860px */}
        <div 
          className="flex-1 w-full max-w-[860px] mx-auto p-4 md:p-8 lg:p-12 pb-24 relative overflow-y-auto dynamic-reading-wrapper"
          data-font={readingPreferences.fontSize}
          data-line={readingPreferences.lineHeight}
        >
          {children}
        </div>

        {/* Mobile Bottom Quick Actions (Phase 1, Task 4.3 preparation) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--surface)] border-t border-[var(--line)] flex justify-around items-center z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
           <Link href="/guide" className="p-3 text-[var(--text-muted)] flex flex-col items-center gap-1 active:text-[var(--accent-primary)]"><div className="w-5 h-5 bg-current opacity-70 rounded-sm"></div><span className="text-[10px]">指南</span></Link>
           <Link href="/outline" className="p-3 text-[var(--text-muted)] flex flex-col items-center gap-1 active:text-[var(--accent-primary)]"><div className="w-5 h-5 bg-current opacity-70 rounded-full"></div><span className="text-[10px]">大綱</span></Link>
           <Link href="/checklist" className="p-3 text-[var(--text-muted)] flex flex-col items-center gap-1 active:text-[var(--accent-primary)]"><div className="w-5 h-5 bg-current opacity-70"></div><span className="text-[10px]">清單</span></Link>
           <button onClick={toggleUtilityPanel} className="p-3 text-[var(--text-muted)] flex flex-col items-center gap-1"><PanelRightOpen className="w-5 h-5 bg-current opacity-70"/><span className="text-[10px]">工具</span></button>
        </div>
      </main>

      {/* --- Right Utility Panel --- */}
      {/* Desktop: fixed xl / Drawer lg+md */}
      <>
        {/* Drawer overlay for xl below */}
        {isUtilityPanelOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-30 xl:hidden" 
            onClick={() => setUtilityPanelOpen(false)}
          />
        )}
        <aside 
           className={`fixed right-0 top-0 h-screen w-[300px] bg-[var(--surface)] border-l border-[var(--line)] shadow-xl xl:shadow-none z-40 xl:sticky transform transition-transform duration-300 ease-in-out flex flex-col
           ${isUtilityPanelOpen ? 'translate-x-0' : 'translate-x-full xl:translate-x-0'} ${readingPreferences.isFocusMode ? 'xl:hidden xl:border-l-0' : 'xl:flex'}`}
        >
          <div className="p-4 flex items-center justify-between border-b border-[var(--line)]">
            <span className="font-semibold text-sm">右側工具 / 目錄</span>
            <button onClick={() => setUtilityPanelOpen(false)} className="xl:hidden p-2 -mr-2 text-[var(--text-muted)]">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
             {/* Right Panel Placeholders & Dynamic Content */}
             
             {activeSection ? (
               <div className="space-y-2">
                 <h4 className="text-xs font-bold text-[var(--text-muted)] tracking-wider">頁內目錄</h4>
                 <PageTOC headings={activeSection.headings} />
               </div>
             ) : (
               <div className="space-y-2">
                 <p className="text-sm text-[var(--text-muted)]">此頁面目前沒有頁內目錄</p>
               </div>
             )}
             
             {/* Read Progress Demo */}
             {activeSection && (
               <div className="pt-4 border-t border-[var(--line)] space-y-2">
                 <h4 className="text-xs font-bold text-[var(--text-muted)] tracking-wider uppercase">閱讀進度</h4>
                 <div className="h-2 w-full bg-[var(--line)] rounded-full overflow-hidden">
                   <div 
                     className="h-full bg-[var(--accent-primary)] transition-all duration-300" 
                     style={{ width: `${progresses[activeSection.slug]?.scrollPercent || 0}%` }}
                   ></div>
                 </div>
                 <p className="text-xs text-[var(--text-muted)]">{progresses[activeSection.slug]?.scrollPercent || 0}% 已完成</p>
               </div>
             )}
             
             {/* Reading Preferences */}
             {isGuideRoute && <ReadingPreferencesPanel />}
          </div>
        </aside>
      </>
    </div>
  );
}
