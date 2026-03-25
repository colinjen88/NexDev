'use client';

import React from 'react';
import { Zap, BookDashed, ChevronRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useReadingProgress } from '@/lib/hooks/useReadingProgress';
import { GuideSection } from '@/lib/content/types';

export function ContinueLearning({ sections }: { sections: GuideSection[] }) {
  const router = useRouter();
  const { getRecentProgress, isLoaded } = useReadingProgress();
  
  if (!isLoaded) return <div className="animate-pulse h-48 bg-[var(--surface-soft)] rounded-2xl w-full"></div>;

  const recent = getRecentProgress();
  
  // If no reading progress, we show the first section as recommendation
  const targetSection = recent ? sections.find(s => s.slug === recent.subjectSlug) : sections[0];
  if (!targetSection) return null;
  
  const progress = recent?.scrollPercent || 0;
  
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-[var(--accent-warm)]" />
        <h2 className="text-lg font-serif font-bold text-[var(--text)]">接續學習</h2>
      </div>
      <div 
        className="relative overflow-hidden bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer group hover:border-[var(--accent-primary)]"
        onClick={() => router.push(`/guide/${targetSection.slug}`)}
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--accent-primary)]/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/3 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

        <div className="flex items-center gap-6 mb-6 sm:mb-0 relative z-10 w-full sm:w-auto">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center flex-shrink-0 bg-[var(--bg)] rounded-full shadow-inner">
            <svg className="w-full h-full transform -rotate-90 p-1" viewBox="0 0 36 36">
              <path className="text-[var(--line)]" strokeWidth="3" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className="text-[var(--accent-primary)] transition-all duration-1000 ease-out" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${progress}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <span className="absolute text-sm sm:text-base font-bold text-[var(--accent-primary)]">{progress}%</span>
          </div>
          <div>
            <div className="text-xs sm:text-sm text-[var(--accent-primary)] font-bold mb-1.5 tracking-widest uppercase">
              Chapter {targetSection.sortOrder.toString().padStart(2, '0')}
            </div>
            <h3 className="text-xl sm:text-2xl font-serif text-[var(--text)] group-hover:text-[var(--accent-primary)] transition-colors mb-2">
              {targetSection.title}
            </h3>
            <div className="flex items-center gap-3 text-sm text-[var(--text-muted)]">
              {recent?.isCompleted ? (
                <span className="flex items-center gap-1 text-[var(--accent-primary)] font-bold"><CheckCircle2 className="w-4 h-4"/> 已完成</span>
              ) : (
                <span className="flex items-center gap-1"><BookDashed className="w-4 h-4"/> {recent ? '閱讀中' : '尚未開始'}</span>
              )}
            </div>
          </div>
        </div>
        
        <button className="relative z-10 flex items-center justify-center gap-2 bg-[var(--text)] text-[var(--surface)] px-6 py-3 rounded-xl font-medium group-hover:bg-[var(--accent-primary)] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-primary)] w-full sm:w-auto shadow-md">
          進入工作台 <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
