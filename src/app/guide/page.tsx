import React from 'react';
import { getGuideSections } from '@/lib/content/guide-loader';
import Link from 'next/link';
import { BookDashed, CheckCircle } from 'lucide-react';
import { GuideList } from '@/components/guide/GuideList';

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
      <GuideList sections={sections} />
    </div>
  );
}
