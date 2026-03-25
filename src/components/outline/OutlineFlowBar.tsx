'use client';

import React from 'react';
import { OutlineSection } from '@/lib/content/types';

interface OutlineFlowBarProps {
  sections: OutlineSection[];
}

export function OutlineFlowBar({ sections }: OutlineFlowBarProps) {
  const scrollToSection = (slug: string) => {
    const el = document.getElementById(`outline-${slug}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="sticky top-14 z-20 bg-[var(--surface)] border-b border-[var(--line)] p-4 md:p-6 mb-8 shadow-sm overflow-x-auto whitespace-nowrap hide-scrollbar">
      <div className="flex items-center gap-4">
        {sections.map((section, idx) => (
          <React.Fragment key={section.sectionSlug}>
            <button 
              onClick={() => scrollToSection(section.sectionSlug)}
              className="flex items-center group flex-shrink-0"
            >
              <div className="w-8 h-8 rounded-full border-2 border-[var(--line)] bg-[var(--bg)] group-hover:border-[var(--accent-warm)] transition-colors flex items-center justify-center text-xs font-bold text-[var(--text-muted)] group-hover:text-[var(--accent-warm)]">
                {String(idx + 1).padStart(2, '0')}
              </div>
              <span className="ml-2 text-sm text-[var(--text-muted)] group-hover:text-[var(--text)] transition-colors max-w-[150px] truncate">
                {section.title}
              </span>
            </button>
            {idx < sections.length - 1 && (
              <div className="w-8 h-[2px] bg-[var(--line)] flex-shrink-0" />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
