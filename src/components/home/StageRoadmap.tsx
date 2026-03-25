'use client';

import React from 'react';
import { Map, CheckCircle2 } from 'lucide-react';
import { GuideSection } from '@/lib/content/types';
import Link from 'next/link';
import { useReadingProgress } from '@/lib/hooks/useReadingProgress';

export function StageRoadmap({ sections }: { sections: GuideSection[] }) {
  const { progresses, isLoaded } = useReadingProgress();
  // Extract phase 0-8 sections
  const phaseSections = sections.filter(s => s.phaseCode >= 0);
  
  // Sort by phaseCode
  const sortedSections = [...phaseSections].sort((a, b) => a.phaseCode - b.phaseCode);

  return (
    <div className="sticky top-24">
      <h2 className="text-xl font-serif text-[var(--text)] mb-8 flex items-center gap-2">
        <Map className="w-5 h-5 text-[var(--text-muted)]" /> 學習路線地圖
      </h2>
      
      <div className="relative border-l-2 border-[var(--line)] ml-4 space-y-8 pb-4">
        {sortedSections.map((node) => {
          let status = 'pending';
          if (isLoaded) {
            const p = progresses[node.slug];
            if (p?.isCompleted) status = 'completed';
            else if (p?.scrollPercent > 0) status = 'in-progress';
          }

          return (
            <div key={node.slug} className="relative pl-8 group">
              {/* Timeline Node */}
              <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full flex items-center justify-center border-4 border-[var(--bg)] transition-colors duration-300
                ${status === 'completed' ? 'bg-[var(--accent-primary)] text-[var(--surface)]' : 
                  status === 'in-progress' ? 'bg-[var(--surface)] border-[var(--accent-primary)] text-[var(--accent-primary)] shadow-[0_0_0_4px_rgba(31,107,107,0.1)]' : 
                  'bg-[var(--line)] text-[var(--text-muted)]'}`}>
                {status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-xs font-bold">{node.phaseCode}</span>}
              </div>
              
              {/* Content */}
              <div>
                <Link href={`/guide/${node.slug}`} className={`block text-base mb-1 transition-colors hover:underline ${status === 'completed' ? 'text-[var(--text)] font-medium' : status === 'in-progress' ? 'text-[var(--accent-primary)] font-bold text-lg' : 'text-[var(--text-muted)]'}`}>
                  {node.title.replace(/^第 \d+ 階段：/, '')}
                </Link>
                {status === 'in-progress' && (
                  <p className="text-sm text-[var(--text-muted)]">建議接續學習！</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
