import type { Metadata } from 'next';
import React from 'react';
import { getChecklistGroups } from '@/lib/content/checklist-loader';
import { ChecklistBoard } from '@/components/checklist/ChecklistBoard';

export const metadata: Metadata = {
  title: '實作清單 | 學習型知識工作台',
  description: '將知識轉化為行動，確保專案每個環節都符合最佳實踐的互動式檢查清單。',
};

export default async function ChecklistPage() {
  const checklistGroups = await getChecklistGroups();

  return (
    <div className="w-full max-w-3xl mx-auto py-8 lg:py-12 animate-in fade-in duration-500">
      <div className="bg-[var(--surface)] p-8 md:p-12 rounded-2xl border border-[var(--line)] shadow-sm">
        <ChecklistBoard groups={checklistGroups} />
      </div>
    </div>
  );
}
