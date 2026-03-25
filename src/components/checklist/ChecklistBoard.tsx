'use client';

import React, { useState } from 'react';
import { ChecklistGroup } from '@/lib/content/types';
import { useChecklistState } from '@/lib/hooks/useChecklistState';
import { CheckCircle2, ListChecks, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import Link from 'next/link';

interface ChecklistBoardProps {
  groups: ChecklistGroup[];
  compact?: boolean;
}

export function ChecklistBoard({ groups, compact = false }: ChecklistBoardProps) {
  const { checkedItemIds, toggleItem, isLoaded } = useChecklistState();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    groups.reduce((acc, g) => ({ ...acc, [g.groupCode]: true }), {})
  );

  if (!isLoaded) return <div className="animate-pulse space-y-4">載入中...</div>;

  const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0);
  const completedItems = checkedItemIds.length;
  const progress = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

  const toggleGroup = (code: string) => {
    setExpandedGroups(prev => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <div className="flex flex-col h-full bg-[var(--surface)]">
      {!compact && (
        <div className="mb-8">
          <h3 className="text-2xl font-serif text-[var(--text)] flex items-center gap-3 mb-2">
            <ListChecks className="text-[var(--accent-primary)] w-6 h-6" /> 實作檢查清單
          </h3>
          <p className="text-[var(--text-muted)] text-sm">將知識轉化為行動，確保專案每個環節都符合最佳實踐。</p>
        </div>
      )}

      {/* Progress Meta */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-[var(--text-muted)]">總體完成進度</span>
        <span className="text-sm font-bold text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-3 py-1 rounded-full">
          {progress}%
        </span>
      </div>

      {/* Progress Bar */}
      <div 
        className="w-full bg-[var(--line)] rounded-full h-2 mb-6 overflow-hidden shadow-inner"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div 
          className="bg-[var(--accent-primary)] h-2 rounded-full transition-all duration-700 ease-out" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      {!compact && (
        <div className="flex gap-2 mb-6 pb-2 overflow-x-auto hide-scrollbar" role="group" aria-label="清單狀態過濾器">
          <button 
            onClick={() => setFilter('all')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === 'all' ? 'bg-[var(--text)] text-[var(--surface)]' : 'bg-[var(--line)] text-[var(--text-muted)] hover:text-[var(--text)]'}`}
          >
            全部 ({totalItems})
          </button>
          <button 
            onClick={() => setFilter('pending')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === 'pending' ? 'bg-[var(--text)] text-[var(--surface)]' : 'bg-[var(--line)] text-[var(--text-muted)] hover:text-[var(--text)]'}`}
          >
            未完成 ({totalItems - completedItems})
          </button>
          <button 
            onClick={() => setFilter('completed')}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${filter === 'completed' ? 'bg-[var(--text)] text-[var(--surface)]' : 'bg-[var(--line)] text-[var(--text-muted)] hover:text-[var(--text)]'}`}
          >
            已完成 ({completedItems})
          </button>
        </div>
      )}

      <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar pb-24 md:pb-4 pr-2">
        {groups.map(group => {
          const groupItems = group.items;
          const groupCompleted = groupItems.filter(i => checkedItemIds.includes(i.itemCode)).length;
          
          const filteredItems = groupItems.filter(item => {
            const isChecked = checkedItemIds.includes(item.itemCode);
            if (filter === 'pending' && isChecked) return false;
            if (filter === 'completed' && !isChecked) return false;
            return true;
          });

          if (filteredItems.length === 0) return null;

          return (
            <div key={group.groupCode} className="bg-[var(--bg)] border border-[var(--line)] rounded-xl overflow-hidden">
              <button 
                className="p-4 w-full text-left bg-[var(--surface)] flex justify-between items-center cursor-pointer select-none border-b border-[var(--line)] hover:bg-[var(--surface-soft)] transition-colors focus-visible:ring-2 focus-visible:ring-inset"
                onClick={() => toggleGroup(group.groupCode)}
                aria-expanded={expandedGroups[group.groupCode]}
                aria-controls={`checklist-group-${group.groupCode}`}
              >
                <div>
                  <h4 className="font-bold text-[var(--text)] flex items-center gap-2">
                    <span className="text-[var(--accent-primary)] font-serif">{group.groupCode}</span>
                    {group.title}
                  </h4>
                  <div className="text-xs text-[var(--text-muted)] mt-1 flex items-center gap-3">
                    <span>{groupCompleted} / {groupItems.length} 完成</span>
                    <div 
                      className="w-24 bg-[var(--line)] h-1.5 rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={groupItems.length === 0 ? 0 : Math.round((groupCompleted/groupItems.length)*100)}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div className="bg-[var(--accent-primary)] h-full transition-all duration-300" style={{ width: `${groupItems.length === 0 ? 0 : (groupCompleted/groupItems.length)*100}%` }}></div>
                    </div>
                  </div>
                </div>
                <div className="p-1 text-[var(--text-muted)] group-hover:bg-[var(--line)] rounded">
                  {expandedGroups[group.groupCode] ? <ChevronUp className="w-5 h-5"/> : <ChevronDown className="w-5 h-5"/>}
                </div>
              </button>

              {expandedGroups[group.groupCode] && (
                <div id={`checklist-group-${group.groupCode}`} className="p-2 space-y-1 bg-white">
                  {filteredItems.map(item => {
                    const isChecked = checkedItemIds.includes(item.itemCode);
                    return (
                      <button 
                        key={item.itemCode}
                        className={`flex w-full text-left items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-300 group focus-visible:ring-2 focus-visible:ring-inset ${
                          isChecked 
                            ? 'bg-[var(--surface)] border-transparent opacity-70 hover:opacity-100 grayscale hover:grayscale-0' 
                            : 'bg-white border-transparent hover:border-[var(--line)] hover:bg-[var(--bg)]'
                        }`}
                        onClick={() => toggleItem(item.itemCode)}
                        role="checkbox"
                        aria-checked={isChecked}
                      >
                        <div className="relative flex-shrink-0 mt-0.5">
                           <div className={`w-5 h-5 rounded border shadow-sm transition-all duration-300 flex items-center justify-center ${
                             isChecked 
                               ? 'bg-[var(--accent-primary)] border-[var(--accent-primary)]' 
                               : 'border-[var(--line)] bg-white group-hover:border-[var(--accent-primary)]'
                           }`}>
                             {isChecked && <CheckCircle2 className="w-4 h-4 text-white animate-in zoom-in duration-200" />}
                           </div>
                        </div>
                        <div className="flex-1">
                          <span className={`text-sm leading-relaxed transition-all duration-300 block ${isChecked ? 'text-[var(--text-muted)] line-through' : 'text-[var(--text)] font-medium'}`}>
                            {item.label}
                          </span>
                        </div>
                        {item.relatedSectionSlug && (
                          <Link 
                            href={`/guide/${item.relatedSectionSlug}`}
                            title="跳至對應指南"
                            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--accent-primary)] hover:bg-[var(--line)] rounded-md transition-colors shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {progress === 100 && filter === 'all' && (
          <div className="mt-8 p-6 bg-[var(--accent-primary)]/10 border border-[var(--accent-primary)]/20 rounded-xl text-center animate-in slide-in-from-bottom-4 duration-700 fade-in">
            <h4 className="text-[var(--accent-primary)] font-serif font-bold mb-2 text-xl">全站清單已完成！</h4>
            <p className="text-sm text-[var(--text-muted)] mb-4">太棒了！你的技術儲備與實作已經準備就緒。</p>
          </div>
        )}
      </div>
    </div>
  );
}
