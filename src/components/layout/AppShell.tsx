'use client';

import React from 'react';
import { useAppShell } from './AppShellProvider';
import { Menu, PanelRightClose, PanelRightOpen, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GuideSection, AiGuideSection } from '@/lib/content/types';
import { PageTOC } from '@/components/guide/PageTOC';
import { useReadingProgress } from '@/lib/hooks/useReadingProgress';
import { CheckCircle2, Minimize, BookOpen, List, CheckSquare, Sparkles } from 'lucide-react';
import { SearchPalette } from '@/components/shared/SearchPalette';
import { ReadingPreferencesPanel } from '@/components/shared/ReadingPreferencesPanel';

export function AppShell({ children, guideSections = [], aiGuideSections = [] }: { children: React.ReactNode; guideSections?: GuideSection[]; aiGuideSections?: AiGuideSection[] }) {
  const { isSidebarOpen, setSidebarOpen, isUtilityPanelOpen, setUtilityPanelOpen, toggleUtilityPanel, readingPreferences, updateReadingPreference } = useAppShell();
  const { progresses } = useReadingProgress();
  const pathname = usePathname();
  const isGuideRoute = pathname?.startsWith('/guide');
  const isAiGuideRoute = pathname?.startsWith('/ai-guide');
  const isAnyGuideRoute = isGuideRoute || isAiGuideRoute;
  
  // Find current active section if we are on a guide content page
  const activeSlugMatches = pathname?.match(/^\/guide\/([^\/]+)$/);
  const activeSlug = activeSlugMatches ? activeSlugMatches[1] : null;
  const activeSection = activeSlug ? guideSections.find(g => g.slug === activeSlug) : null;

  // Find current active AI guide section
  const aiActiveSlugMatches = pathname?.match(/^\/ai-guide\/([^\/]+)$/);
  const aiActiveSlug = aiActiveSlugMatches ? aiActiveSlugMatches[1] : null;
  const aiActiveSection = aiActiveSlug ? aiGuideSections.find(g => g.slug === aiActiveSlug) : null;

  // Unified active section for right panel
  const anyActiveSection = activeSection || aiActiveSection;
  const anyActiveProgressKey = activeSection ? activeSection.slug : aiActiveSection ? `ai-${aiActiveSection.slug}` : null;

  const [isSearchOpen, setIsSearchOpen] = React.useState(false);
  const [cmdKey, setCmdKey] = React.useState('Ctrl');

  React.useEffect(() => {
    if (/Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent)) {
      setCmdKey('Cmd');
    }
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
        <button 
          onClick={() => setSidebarOpen(true)} 
          className="p-2 -ml-2 text-[var(--accent-primary)] focus-visible:ring-2 focus-visible:ring-inset"
          aria-label="開啟導航選單"
          aria-expanded={isSidebarOpen}
        >
          <Menu className="w-6 h-6" />
        </button>
        <Link href="/" className="font-serif font-bold text-lg text-[var(--text)]">學習型知識工作台</Link>
        <div className="w-8"></div>
      </div>

      {/* --- Left Navigation Sidebar --- */}
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
            <button 
              onClick={() => setSidebarOpen(false)} 
              className="md:hidden p-2 -mr-2 text-[var(--text-muted)] focus-visible:ring-2"
              aria-label="關閉導航選單"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isGuideRoute ? (
              // Standard Guide Route Navigation
              <>
                <Link href="/guide" className="block p-2 rounded-lg text-sm font-bold text-[var(--accent-primary)] mb-4">← 返回指南總覽</Link>
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
            ) : isAiGuideRoute ? (
              // AI Guide Route Navigation
              <>
                <Link href="/ai-guide" className="block p-2 rounded-lg text-sm font-bold text-[var(--accent-info)] mb-4">← 返回 AI 指南總覽</Link>
                <div className="space-y-1">
                  {aiGuideSections.map(g => {
                    const isActive = pathname === `/ai-guide/${g.slug}`;
                    const isCompleted = progresses[`ai-${g.slug}`]?.isCompleted;
                    const chapterLabel = g.chapterNumber === -1 ? '' : g.chapterNumber.toString().padStart(2, '0');
                    return (
                      <Link 
                        key={g.slug} 
                        href={`/ai-guide/${g.slug}`} 
                        className={`block p-2 md:p-3 rounded-lg text-sm transition-colors flex items-start gap-2 ${isActive ? 'bg-[var(--accent-info)]/10 text-[var(--accent-info)] font-bold' : 'text-[var(--text-muted)] hover:bg-[var(--surface-soft)] hover:text-[var(--text)]'}`}
                      >
                         {chapterLabel && <span className="opacity-60 text-xs mt-0.5">{chapterLabel}</span>}
                         <span className="leading-snug flex-1">{g.title}</span>
                         {isCompleted && <CheckCircle2 className="w-4 h-4 text-[var(--accent-info)] shrink-0 self-center" />}
                      </Link>
                    );
                  })}
                </div>
              </>
            ) : (
              // Default navigation (home, outline, checklist, etc.)
              <>
                <Link href="/" className="block p-2 rounded-lg hover:bg-[var(--surface-soft)] text-sm font-medium transition-colors" key="nav-home">首頁學習儀表板</Link>
                <Link href="/guide" className="block p-2 rounded-lg hover:bg-[var(--surface-soft)] text-sm font-medium transition-colors" key="nav-guide">指南總覽</Link>
                <Link href="/ai-guide" className="block p-2 rounded-lg hover:bg-[var(--surface-soft)] text-sm font-medium transition-colors" key="nav-ai-guide">
                  <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[var(--accent-info)]" /> AI 開發指南</span>
                </Link>
                <Link href="/outline" className="block p-2 rounded-lg hover:bg-[var(--surface-soft)] text-sm font-medium transition-colors" key="nav-outline">速讀大綱</Link>
                <Link href="/checklist" className="block p-2 rounded-lg hover:bg-[var(--surface-soft)] text-sm font-medium transition-colors" key="nav-checklist">互動清單</Link>
                <Link href="/compare" className="block p-2 rounded-lg hover:bg-[var(--surface-soft)] text-sm font-medium transition-colors" key="nav-compare">比較模式</Link>
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
             <button 
               className="px-3 py-1.5 bg-[var(--surface-soft)] rounded-md cursor-pointer hover:bg-[var(--line)] transition-colors flex items-center space-x-2"
               onClick={() => setIsSearchOpen(true)}
               aria-label="搜尋此指南"
             >
               <span>搜尋此指南</span>
               <span className="text-xs bg-[var(--bg)] px-1 rounded border border-[var(--line)]">{cmdKey}+K</span>
             </button>
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
             <button 
                onClick={toggleUtilityPanel} 
                className={`p-2 hover:bg-[var(--surface-soft)] rounded-full transition-colors ${readingPreferences.isFocusMode ? '' : 'xl:hidden'}`} 
                title="Toggle Utility Panel"
                aria-label="切換右側工具欄"
                aria-expanded={isUtilityPanelOpen}
             >
                {isUtilityPanelOpen ? <PanelRightClose className="w-5 h-5 text-[var(--accent-primary)]" /> : <PanelRightOpen className="w-5 h-5 text-[var(--text-muted)]" />}
             </button>
          </div>
        </header>

        {/* Dynamic Content Scrollable Area */}
        <div 
          className="flex-1 w-full max-w-[860px] mx-auto p-4 md:p-8 lg:p-12 pb-24 relative overflow-y-auto dynamic-reading-wrapper"
          data-font={readingPreferences.fontSize}
          data-line={readingPreferences.lineHeight}
        >
          {children}
        </div>

        {/* Mobile Bottom Quick Actions — 5 entries */}
        <nav 
          aria-label="手機快速導航"
          className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[var(--surface)] border-t border-[var(--line)] flex justify-around items-center z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] pb-safe"
        >
           <Link href="/guide" className={`p-2 flex flex-col items-center gap-0.5 transition-colors ${pathname === '/guide' || isGuideRoute ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`} aria-label="指南總覽">
             <BookOpen className="w-5 h-5" />
             <span className="text-[10px] font-medium">指南</span>
           </Link>
           <Link href="/ai-guide" className={`p-2 flex flex-col items-center gap-0.5 transition-colors ${pathname === '/ai-guide' || isAiGuideRoute ? 'text-[var(--accent-info)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`} aria-label="AI 開發指南">
             <Sparkles className="w-5 h-5" />
             <span className="text-[10px] font-medium">AI 指南</span>
           </Link>
           <Link href="/outline" className={`p-2 flex flex-col items-center gap-0.5 transition-colors ${pathname === '/outline' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`} aria-label="速讀大綱">
             <List className="w-5 h-5" />
             <span className="text-[10px] font-medium">大綱</span>
           </Link>
           <Link href="/checklist" className={`p-2 flex flex-col items-center gap-0.5 transition-colors ${pathname === '/checklist' ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`} aria-label="實作清單">
             <CheckSquare className="w-5 h-5" />
             <span className="text-[10px] font-medium">清單</span>
           </Link>
           <button 
             onClick={toggleUtilityPanel} 
             className={`p-2 flex flex-col items-center gap-0.5 transition-colors ${isUtilityPanelOpen ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text)]'}`}
             aria-label="右側工具"
             aria-expanded={isUtilityPanelOpen}
           >
             <PanelRightOpen className="w-5 h-5" />
             <span className="text-[10px] font-medium">工具</span>
           </button>
        </nav>
      </main>

      {/* --- Right Utility Panel --- */}
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
            <button 
              onClick={() => setUtilityPanelOpen(false)} 
              className="xl:hidden p-2 -mr-2 text-[var(--text-muted)] focus-visible:ring-2"
              aria-label="關閉右側工具欄"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
             {/* Page TOC — works for both guide and ai-guide */}
             {anyActiveSection ? (
               <div className="space-y-2">
                 <h4 className="text-xs font-bold text-[var(--text-muted)] tracking-wider">頁內目錄</h4>
                 <PageTOC headings={anyActiveSection.headings} />
               </div>
             ) : (
               <div className="space-y-2">
                 <p className="text-sm text-[var(--text-muted)]">此頁面目前沒有頁內目錄</p>
               </div>
             )}
             
             {/* Read Progress — works for both guide and ai-guide */}
             {anyActiveSection && anyActiveProgressKey && (
               <div className="pt-4 border-t border-[var(--line)] space-y-2">
                 <h4 className="text-xs font-bold text-[var(--text-muted)] tracking-wider uppercase">閱讀進度</h4>
                 <div 
                   className="h-2 w-full bg-[var(--line)] rounded-full overflow-hidden"
                   role="progressbar"
                   aria-valuenow={progresses[anyActiveProgressKey]?.scrollPercent || 0}
                   aria-valuemin={0}
                   aria-valuemax={100}
                 >
                   <div 
                     className={`h-full ${isAiGuideRoute ? 'bg-[var(--accent-info)]' : 'bg-[var(--accent-primary)]'} transition-all duration-300`}
                     style={{ width: `${progresses[anyActiveProgressKey]?.scrollPercent || 0}%` }}
                   ></div>
                 </div>
                 <p className="text-xs text-[var(--text-muted)]">{progresses[anyActiveProgressKey]?.scrollPercent || 0}% 已完成</p>
               </div>
             )}
             
             {/* Reading Preferences */}
             {isAnyGuideRoute && <ReadingPreferencesPanel />}
          </div>
        </aside>
      </>
    </div>
  );
}
