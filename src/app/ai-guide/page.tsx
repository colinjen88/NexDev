import type { Metadata } from 'next';
import React from 'react';
import { getAiGuideSections } from '@/lib/content/ai-guide-loader';
import { Sparkles } from 'lucide-react';
import { AiGuideList } from '@/components/ai-guide/AiGuideList';

export const metadata: Metadata = {
  title: 'AI 驅動開發指南 | 學習型知識工作台',
  description: '從 Prompt 工程到工具鏈組合，全面掌握 AI 協作開發的 13 個章節。',
};

export default async function AiGuideOverview() {
  const sections = await getAiGuideSections();

  return (
    <div className="max-w-4xl mx-auto py-8 sm:py-12 animate-in fade-in duration-500">
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-[var(--accent-info)]/10">
            <Sparkles className="w-7 h-7 text-[var(--accent-info)]" />
          </div>
        </div>
        <h1 className="text-4xl sm:text-5xl font-serif text-[var(--text)] leading-tight mb-4">
          AI 驅動開發指南<br />
          <span className="text-[var(--text-muted)] text-2xl sm:text-3xl">從 Prompt 工程到工具鏈組合，全面掌握 AI 紅利</span>
        </h1>
        <p className="text-[var(--text-muted)] text-lg">
          共有 {sections.length} 個章節，涵蓋 Clean Code 審查、AI 環境建置、Prompt 實戰、模型選型到部署上線的完整 AI 協作開發流程。
        </p>
      </div>
      <AiGuideList sections={sections} />
    </div>
  );
}
