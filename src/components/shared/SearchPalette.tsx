'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Search, Loader2, FileText, CheckSquare, List, X } from 'lucide-react';
import { useSearchIndex, EnrichedSearchResult } from '@/lib/hooks/useSearchIndex';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchPalette({ isOpen, onClose }: SearchPaletteProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  
  const { initSearch, search, isLoading, miniSearch } = useSearchIndex();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      if (!miniSearch && !isLoading) {
        initSearch();
      }
    } else {
      setQuery('');
    }
  }, [isOpen, miniSearch, isLoading, initSearch]);

  const results = search(query).slice(0, 10); // Limit to top 10 for performance

  // Handle keyboard shortcut (Escape) within modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
        e.preventDefault();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleResultClick = (url: string) => {
    router.push(url);
    onClose();
  };

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div 
        className="fixed left-1/2 top-20 sm:top-32 -translate-x-1/2 w-full max-w-2xl px-4 z-50 animate-in slide-in-from-top-4 fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-label="全站搜尋"
      >
        <div className="bg-[var(--surface)] border border-[var(--line)] rounded-xl shadow-2xl flex flex-col overflow-hidden">
          
          <div className="flex items-center px-4 py-3 border-b border-[var(--line)] bg-[var(--bg)]">
            <Search className="w-5 h-5 text-[var(--accent-primary)] mr-3 flex-shrink-0" />
            <input
              ref={inputRef}
              type="search"
              aria-label="搜尋關鍵字"
              className="flex-1 bg-transparent border-none outline-none text-[var(--text)] text-lg placeholder-[var(--text-muted)] p-1"
              placeholder={isLoading ? '載入搜尋索引中...' : '搜尋全站內容... (支援 Cmd+K)'}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={isLoading}
            />
            {isLoading && <Loader2 className="w-5 h-5 text-[var(--accent-primary)] animate-spin flex-shrink-0" />}
            <button 
              onClick={onClose}
              className="p-1 text-[var(--text-muted)] hover:bg-[var(--line)] rounded ml-2 focus-visible:ring-2 focus-visible:ring-inset"
              aria-label="關閉搜尋"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div 
            className="max-h-[60vh] overflow-y-auto w-full custom-scrollbar flex-1 bg-[var(--surface)]"
            aria-live="polite"
          >
            {!query ? (
              <div className="p-8 text-center text-[var(--text-muted)] text-sm">
                快速尋找章節、重點大綱或實作清單項目
              </div>
            ) : results.length > 0 ? (
              <div className="p-2 space-y-1">
                {results.map((res: EnrichedSearchResult) => {
                  let Icon = FileText;
                  if (res.type === 'Checklist') Icon = CheckSquare;
                  if (res.type === 'Outline') Icon = List;

                  return (
                    <button
                      key={res.id}
                      onClick={() => handleResultClick(res.url)}
                      className="w-full flex items-start gap-4 p-3 rounded-lg hover:bg-[var(--bg)] border border-transparent hover:border-[var(--line)] transition-colors text-left group focus-visible:ring-2 focus-visible:ring-inset"
                    >
                      <Icon className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)] mt-0.5 shrink-0" />
                      <div className="flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold px-2 py-0.5 bg-[var(--line)] text-[var(--text-muted)] rounded truncate flex-shrink-0">
                            {res.type}
                          </span>
                          <span className="text-sm font-bold text-[var(--text)] truncate group-hover:text-[var(--accent-primary)]">
                            {res.title}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)] truncate">{res.summary}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 text-center text-[var(--text-muted)] text-sm">
                找不到相關結果：「{query}」
              </div>
            )}
          </div>
          
          <div className="px-4 py-2 border-t border-[var(--line)] text-xs text-[var(--text-muted)] flex justify-end bg-[var(--bg)]">
            <span className="flex items-center gap-1 font-sans">
               <kbd className="px-1 border border-[var(--line)] rounded font-sans text-[10px]">esc</kbd> 關閉
            </span>
          </div>

        </div>
      </div>
    </>
  );
}
