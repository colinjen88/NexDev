'use client';

import React from 'react';
import Link from 'next/link';
import { AiGuideSection } from '@/lib/content/types';
import { BookDashed, CheckCircle } from 'lucide-react';
import { useReadingProgress } from '@/lib/hooks/useReadingProgress';

export function AiGuideList({ sections }: { sections: AiGuideSection[] }) {
  const { progresses, isLoaded } = useReadingProgress();

  function getChapterLabel(section: AiGuideSection) {
    if (section.chapterNumber === -1) return '';
    return `Chapter ${section.chapterNumber.toString().padStart(2, '0')}`;
  }

  const completedCount = isLoaded
    ? sections.filter(s => progresses[`ai-${s.slug}`]?.isCompleted).length
    : 0;
  const progressPct = sections.length > 0 ? (completedCount / sections.length) * 100 : 0;

  return (
    <div>
      {isLoaded && (
        <div className="mb-8 p-4 bg-[var(--surface)] border border-[var(--line)] rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--text)]">閱讀進度</span>
            <span className="text-sm text-[var(--text-muted)]">{completedCount} / {sections.length} 章節</span>
          </div>
          <div className="h-1.5 bg-[var(--line)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--accent-info)] rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      )}
    <div className="space-y-4">
      {sections.map((section) => {
        const isCompleted = isLoaded && progresses[`ai-${section.slug}`]?.isCompleted;
        const chapterLabel = getChapterLabel(section);
        return (
          <Link
            key={section.slug}
            href={`/ai-guide/${section.slug}`}
            className="group block bg-[var(--surface)] border border-[var(--line)] rounded-xl p-6 hover:border-[var(--accent-info)]/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            <div className="flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  {chapterLabel && (
                    <span className="text-xs font-bold tracking-wider uppercase text-[var(--accent-info)] bg-[var(--accent-info)]/10 px-2 py-0.5 rounded-full">
                      {chapterLabel}
                    </span>
                  )}
                  <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                    <BookDashed className="w-3 h-3" /> {section.estimatedReadMinutes} 分鐘
                  </span>
                  {isCompleted && (
                    <CheckCircle className="w-4 h-4 text-[var(--accent-info)] shrink-0" />
                  )}
                </div>
                <h3 className="text-lg font-serif font-bold text-[var(--text)] group-hover:text-[var(--accent-info)] transition-colors mb-1 leading-snug">
                  {section.title}
                </h3>
                <p className="text-sm text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                  {section.summary}
                </p>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
    </div>
  );
}
