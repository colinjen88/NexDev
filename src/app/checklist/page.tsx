import React from 'react';
import { getChecklistGroups } from '@/lib/content/checklist-loader';
import { ChecklistBoard } from '@/components/checklist/ChecklistBoard';

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
