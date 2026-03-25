import React, { useState } from 'react';
import { GuideSection, ChecklistGroup } from '@/lib/content/types';
import { ChecklistBoard } from '@/components/checklist/ChecklistBoard';

export default async function ComparePage() {
  const { getGuideSections } = await import('@/lib/content/guide-loader');
  const { getChecklistGroups } = await import('@/lib/content/checklist-loader');
  const guideSections = await getGuideSections();
  const checklistGroups = await getChecklistGroups();

  return (
    <div className="flex-1 flex flex-col md:flex-row w-full animate-in fade-in duration-500 h-[calc(100vh-160px)] -mt-8 -mx-4 md:-mx-8 lg:-mx-12">
      {/* Left: Reading */}
      <div className="w-full md:w-3/5 overflow-y-auto bg-[var(--surface)] border-r border-[var(--line)] p-8 lg:p-12 xl:p-16 custom-scrollbar">
        <div className="max-w-3xl mx-auto">
          <div className="text-[var(--accent-warm)] font-bold text-xs tracking-widest mb-4 uppercase bg-[var(--accent-warm)]/10 inline-block px-3 py-1 rounded-full">
             多章節對照閱讀
          </div>
          <h1 className="text-3xl lg:text-4xl font-serif text-[var(--text)] leading-tight mb-8">對照實作模式</h1>
           
          {/* Mock Guide Content Flowing */}
          <div className="space-y-16">
            {guideSections.slice(0, 3).map((section) => (
              <div key={section.slug}>
                <h2 className="text-2xl font-serif mb-6 pb-2 border-b border-[var(--line)]">{section.title}</h2>
                <div 
                  className="prose prose-slate prose-lg max-w-none prose-headings:font-serif prose-a:text-[var(--accent-primary)] text-[var(--text)] leading-loose selection:bg-[var(--accent-primary)]/20 selection:text-[var(--accent-primary)]"
                  dangerouslySetInnerHTML={{ __html: section.bodyHtml.substring(0, 1000) + '... (請切換至單篇指南閱讀完整內容)' }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Right: Working Board */}
      <div className="w-full md:w-2/5 bg-[var(--bg)] overflow-hidden p-6 lg:p-10 shadow-inner flex flex-col h-full border-t md:border-t-0 border-[var(--line)]">
        <div className="bg-white rounded-2xl p-6 border border-[var(--line)] shadow-sm flex-1 overflow-hidden h-full flex flex-col">
          <ChecklistBoard groups={checklistGroups} compact={true} />
        </div>
      </div>
    </div>
  );
}
