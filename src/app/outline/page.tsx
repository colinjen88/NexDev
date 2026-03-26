import type { Metadata } from 'next';
import React from 'react';
import { getOutlineSections, getAiOutlineSections } from '@/lib/content/outline-loader';
import { OutlineCards } from '@/components/outline/OutlineCards';
import { OutlineFlowBar } from '@/components/outline/OutlineFlowBar';
import { Zap } from 'lucide-react';

export const metadata: Metadata = {
  title: '速讀大綱 | 學習型知識工作台',
  description: '濃縮精華，3 分鐘掌握核心觀念，適合碎片時間複習。',
};

export default async function OutlinePage() {
  const outlineSections = await getOutlineSections();
  const aiOutlineSections = await getAiOutlineSections();

  return (
    <div className="w-full max-w-4xl mx-auto py-8">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--accent-warm)]/10 mb-4 animate-in zoom-in-50 duration-500">
          <Zap className="w-8 h-8 text-[var(--accent-warm)]" />
        </div>
        <h2 className="text-3xl font-serif text-[var(--text)] mb-3">速讀大綱模式</h2>
        <p className="text-[var(--text-muted)]">濃縮精華，3 分鐘掌握核心觀念，適合碎片時間複習</p>
      </div>

      <OutlineFlowBar sections={outlineSections} />
      
      <div className="mt-12 px-4 md:px-0 space-y-12">
        <div>
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--accent-primary)]">
            <span className="w-1.5 h-6 bg-[var(--accent-primary)] rounded-full"></span>
            標準開發流程大綱
          </h3>
          <OutlineCards sections={outlineSections} />
        </div>

        <div>
           <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-[var(--accent-info)]">
            <span className="w-1.5 h-6 bg-[var(--accent-info)] rounded-full"></span>
            AI 驅動開發大綱
          </h3>
          <OutlineCards sections={aiOutlineSections} isAiGuide={true} />
        </div>
      </div>
    </div>
  );
}
