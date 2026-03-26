'use client';

import React from 'react';
import { Zap, BookDashed, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useReadingProgress } from '@/lib/hooks/useReadingProgress';
import { GuideSection } from '@/lib/content/types';

export function ContinueLearning({ 
  sections, 
  aiSections 
}: { 
  sections: GuideSection[];
  aiSections: AiGuideSection[];
}) {
  const router = useRouter();
  const { getRecentProgress, isLoaded } = useReadingProgress();
  
  if (!isLoaded) return <div className="animate-pulse h-48 bg-[var(--surface-soft)] rounded-2xl w-full"></div>;

  const recent = getRecentProgress();
  
  // Find which guide to link to
  let targetSection: GuideSection | AiGuideSection | undefined;
  let href = '';
  let label = '';
  let themeColorClass = 'text-[var(--accent-primary)]';
  let themeBgClass = 'text-[var(--accent-primary)]'; // Actually used for the progress bar color

  if (recent?.subjectType === 'aiGuideSection') {
     const slugWithoutPrefix = recent.subjectSlug.replace('ai-', '');
     targetSection = aiSections.find(s => s.slug === slugWithoutPrefix);
     href = `/ai-guide/${slugWithoutPrefix}`;
     label = (targetSection as AiGuideSection)?.chapterNumber === -1 
        ? 'AI Guide' 
        : `AI Chapter ${(targetSection as AiGuideSection)?.chapterNumber.toString().padStart(2, '0')}`;
     themeColorClass = 'text-[var(--accent-info)]';
     themeBgClass = 'text-[var(--accent-info)]';
  } else {
     targetSection = recent ? sections.find(s => s.slug === recent.subjectSlug) : sections[0];
     href = `/guide/${targetSection?.slug}`;
     label = `Chapter ${targetSection?.sortOrder.toString().padStart(2, '0')}`;
     themeColorClass = 'text-[var(--accent-primary)]';
     themeBgClass = 'text-[var(--accent-primary)]';
  }
  
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-[var(--accent-warm)]" />
        <h2 className="text-lg font-serif font-bold text-[var(--text)]">接續學習</h2>
      </div>
      <div 
        className={`relative overflow-hidden bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer group ${recent?.subjectType === 'aiGuideSection' ? 'hover:border-[var(--accent-info)]' : 'hover:border-[var(--accent-primary)]'}`}
        onClick={() => router.push(href)}
      >
        <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-current to-transparent rounded-full -translate-y-1/2 translate-x-1/3 opacity-0 group-hover:opacity-10 transition-opacity duration-700 ${themeColorClass}`}></div>

        <div className="flex items-center gap-6 mb-6 sm:mb-0 relative z-10 w-full sm:w-auto">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0 bg-[var(--bg)] rounded-full shadow-inner">
            <svg className="w-full h-full transform -rotate-90 p-1" viewBox="0 0 36 36">
              <path className="text-[var(--line)]" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className={`${themeBgClass} transition-all duration-1000 ease-out`} strokeWidth="3" strokeLinecap="round" strokeDasharray={`${progress}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className={`absolute text-sm sm:text-base font-bold ${themeColorClass}`}>{progress}%</span>
          </div>
          <div>
            <div className={`text-xs sm:text-sm font-bold mb-1.5 tracking-widest uppercase ${themeColorClass}`}>
              {label}
            </div>
            <h3 className={`text-xl sm:text-2xl font-serif text-[var(--text)] transition-colors mb-2 ${recent?.subjectType === 'aiGuideSection' ? 'group-hover:text-[var(--accent-info)]' : 'group-hover:text-[var(--accent-primary)]'}`}>
              {targetSection?.title || '載入中'}
            </h3>
            <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
              {recent?.isCompleted ? (
                <span className={`flex items-center gap-1 font-bold ${themeColorClass}`}><CheckCircle2 className="w-4 h-4"/> 已完成</span>
              ) : (
                <span className="flex items-center gap-1"><BookDashed className="w-4 h-4"/> {recent ? '閱讀中' : '尚未開始'}</span>
              )}
            </div>
          </div>
        </div>
        
        <button className={`relative z-10 flex items-center justify-center gap-2 text-[var(--surface)] px-6 py-3 rounded-xl font-medium transition-colors focus:ring-2 focus:ring-offset-2 w-full sm:w-auto shadow-md ${recent?.subjectType === 'aiGuideSection' ? 'bg-[var(--accent-info)] hover:bg-[var(--accent-info)]/90 focus:ring-[var(--accent-info)]' : 'bg-[var(--text)] hover:bg-[var(--accent-primary)] focus:ring-[var(--accent-primary)]'}`}>
          進入工作台 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
