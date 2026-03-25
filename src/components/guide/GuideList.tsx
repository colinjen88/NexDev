'use client';

import React from 'react';
import { GuideSection } from '@/lib/content/types';
import Link from 'next/link';
import { BookDashed, CheckCircle } from 'lucide-react';
import { useReadingProgress } from '@/lib/hooks/useReadingProgress';

export function GuideList({ sections }: { sections: GuideSection[] }) {
  const { progresses, isLoaded } = useReadingProgress();

  return (
    <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
      {sections.map(section => {
        const p = progresses[section.slug];
        const isRead = isLoaded && p?.isCompleted;

        return (
          <Link 
            href={`/guide/${section.slug}`} 
            key={section.slug}
            className="group block bg-[var(--surface)] border border-[var(--line)] p-6 rounded-2xl hover:border-[var(--accent-primary)]/40 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="text-xs font-bold text-[var(--accent-primary)] tracking-widest uppercase bg-[var(--accent-primary)]/10 px-3 py-1 rounded-full">
                Chapter {section.sortOrder.toString().padStart(2, '0')}
              </div>
              {isRead ? (
                <CheckCircle className="w-5 h-5 text-[var(--accent-olive)]" />
              ) : (
                <BookDashed className="w-5 h-5 text-[var(--line)]" />
              )}
            </div>
            <h2 className="text-xl font-serif font-bold text-[var(--text)] mb-2 group-hover:text-[var(--accent-primary)] transition-colors line-clamp-2">
              {section.title}
            </h2>
            <p className="text-[var(--text-muted)] text-sm mb-4 line-clamp-2 leading-relaxed h-[42px]">
              {section.summary}
            </p>
            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-4 border-t border-[var(--line)]">
              <span>Phase {section.phaseCode >= 0 ? section.phaseCode : 'N/A'}</span>
              <span>約 {section.estimatedReadMinutes} 分鐘</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
