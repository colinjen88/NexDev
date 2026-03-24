'use client';

import React from 'react';
import { useActiveHeading } from '@/lib/hooks/useActiveHeading';

interface Heading {
  id: string;
  level: number;
  text: string;
}

export function PageTOC({ headings }: { headings: Heading[] }) {
  const activeId = useActiveHeading(headings.map(h => h.id));

  if (!headings || headings.length === 0) {
    return <p className="text-sm text-[var(--text-muted)]">此頁面目前沒有頁內目錄</p>;
  }

  return (
    <ul className="text-sm space-y-2 text-[var(--text)] opacity-80">
      {headings.map(h => {
        const isActive = activeId === h.id;
        return (
          <li key={h.id} className="transition-colors">
            <a 
              href={`#${h.id}`} 
              className={`block pl-2 border-l-2 custom-toc-transition ${isActive ? 'border-[var(--accent-primary)] text-[var(--accent-primary)] font-medium' : 'border-transparent hover:text-[var(--accent-primary)]'} `}
            >
              <span className={h.level > 2 ? 'pl-2 text-xs opacity-80' : ''}>{h.text}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}
