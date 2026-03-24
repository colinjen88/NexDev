import React from 'react';
import { getGuideSections } from '@/lib/content/guide-loader';
import Link from 'next/link';
import { BookDashed, CheckCircle } from 'lucide-react';

export default async function GuideOverview() {
  const sections = await getGuideSections();

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 animate-in fade-in duration-500">
      <div className="mb-12">
        <h1 className="text-4xl sm:text-5xl font-serif text-[var(--text)] leading-tight mb-4">
          標準網站開發指南<br />
          <span className="text-[var(--text-muted)] text-2xl sm:text-3xl">從 MVP 到規模化的觀念與實務</span>
        </h1>
        <p className="text-[var(--text-muted)] text-lg">共有 {sections.length} 個章節，涵蓋從需求分析到部署維運的完整軟體工程生命週期。</p>
      </div>

      <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6">
        {sections.map(section => {
          // Placeholder for Phase 3 reading progress sync feature.
          const isRead = false; 

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
    </div>
  );
}
