'use client';

import React, { useState } from 'react';
import { OutlineSection } from '@/lib/content/types';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import Link from 'next/link';

interface OutlineCardsProps {
  sections: OutlineSection[];
}

export function OutlineCards({ sections }: OutlineCardsProps) {
  // Option to hold state per card (expanded/collapsed).
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    sections.reduce((acc, s) => ({ ...acc, [s.sectionSlug]: true }), {})
  );

  const toggleExpand = (slug: string) => {
    setExpanded((prev) => ({ ...prev, [slug]: !prev[slug] }));
  };

  return (
    <div className="grid gap-6">
      {sections.map((section, idx) => {
        const isExpanded = expanded[section.sectionSlug];
        
        return (
          <div 
            key={section.sectionSlug} 
            className="group bg-[var(--surface)] border-l-4 border-l-[var(--accent-warm)] border-[var(--line)] border p-6 md:p-8 rounded-r-2xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
            id={`outline-${section.sectionSlug}`}
          >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-xl font-serif text-[var(--text)] font-bold flex items-center gap-3">
                  <span className="text-[var(--accent-warm)] opacity-50 text-sm whitespace-nowrap">Point {String(idx + 1).padStart(2, '0')}</span>
                  {section.title}
                </h3>
                <div className="flex items-center gap-2">
                  <Link 
                    href={`/guide/${section.sectionSlug}`} 
                    className="hidden md:flex items-center gap-1.5 text-xs text-[var(--text-muted)] hover:text-[var(--accent-primary)] font-medium p-1 transition-colors focus-visible:ring-2 focus-visible:ring-inset rounded"
                    title="閱讀完整指南"
                    aria-label={`閱讀完整指南：${section.title}`}
                  >
                    <BookOpen className="w-4 h-4" /> 完整指南
                  </Link>
                  <button 
                    onClick={() => toggleExpand(section.sectionSlug)}
                    className="p-1.5 text-[var(--text-muted)] hover:bg-[var(--surface-soft)] rounded-md transition-colors xl:hidden focus-visible:ring-2 focus-visible:ring-inset"
                    aria-expanded={isExpanded}
                    aria-controls={`outline-content-${section.sectionSlug}`}
                    aria-label={isExpanded ? '收合' : '展開'}
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              
              {isExpanded && (
                <div id={`outline-content-${section.sectionSlug}`} className="animate-in fade-in slide-in-from-top-2 duration-300">
                <p className="text-[var(--text)] text-lg leading-relaxed mb-4">
                  {section.summary}
                </p>
                {section.highlights && section.highlights.length > 0 && (
                  <ul className="list-disc list-outside ml-5 space-y-2 mt-4 text-[var(--text-muted)]">
                    {section.highlights.map((hlt, i) => (
                      <li key={i} className="leading-relaxed">{hlt}</li>
                    ))}
                  </ul>
                )}
                
                <div className="mt-6 md:hidden">
                   <Link 
                    href={`/guide/${section.sectionSlug}`} 
                    className="flex justify-center flex-1 items-center gap-2 text-sm text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-4 py-2 rounded-lg font-bold hover:bg-[var(--accent-primary)] hover:text-white transition-colors"
                  >
                    <BookOpen className="w-4 h-4" /> 跳到完整版
                  </Link>
                </div>
              </div>
            )}
            
          </div>
        );
      })}
    </div>
  );
}
