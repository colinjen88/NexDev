import { useState, useEffect, useCallback, useRef } from 'react';

export interface ReadingProgressRecord {
  subjectType: 'guideSection' | 'outlineSection';
  subjectSlug: string;
  scrollPercent: number;
  isCompleted: boolean;
  lastReadAt: string;
}

export function useReadingProgress() {
  const [progresses, setProgresses] = useState<Record<string, ReadingProgressRecord>>({});
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('reading-progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          setProgresses(parsed);
        }
      } catch (e) {
        console.error('Failed to parse reading progress', e);
      }
    }
    setIsLoaded(true);
  }, []);

  const saveProgress = useCallback((record: Omit<ReadingProgressRecord, 'lastReadAt'>) => {
    setProgresses(prev => {
      const existing = prev[record.subjectSlug];
      const newRecord = {
        ...record,
        lastReadAt: new Date().toISOString(),
        isCompleted: existing?.isCompleted || record.isCompleted || record.scrollPercent > 90
      };
      const updated = { ...prev, [record.subjectSlug]: newRecord };
      localStorage.setItem('reading-progress', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getRecentProgress = useCallback((): ReadingProgressRecord | null => {
    if (!isLoaded || Object.keys(progresses).length === 0) return null;
    return Object.values(progresses).sort(
      (a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime()
    )[0] || null;
  }, [progresses, isLoaded]);

  const getProgressBySlug = useCallback((slug: string): ReadingProgressRecord | null => {
    return progresses[slug] || null;
  }, [progresses]);

  return { progresses, saveProgress, getRecentProgress, getProgressBySlug, isLoaded };
}

// Helper hook for components to automatically track scroll inside a specific section
export function useScrollTracker(subjectSlug: string, subjectType: 'guideSection' | 'outlineSection') {
  const [percent, setPercent] = useState(0);
  const { saveProgress, getProgressBySlug } = useReadingProgress();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const existing = getProgressBySlug(subjectSlug);
    if (existing) {
      setPercent(existing.scrollPercent);
    }
  }, [subjectSlug, getProgressBySlug]);

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const isDocument = e.target === document;
      const element = isDocument ? document.documentElement : (e.target as HTMLElement);
      
      const { scrollTop, scrollHeight, clientHeight } = element;
      const scrollableDist = scrollHeight - clientHeight;
      if (scrollableDist <= 0) return;
      
      const newPercent = Math.round((scrollTop / scrollableDist) * 100);
      setPercent(newPercent);
      
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        saveProgress({
          subjectType,
          subjectSlug,
          scrollPercent: newPercent,
          isCompleted: newPercent > 90
        });
      }, 2000); // 2s debounce
    };

    // Assuming the scroll container is the main wrapper in AppShell
    const container = document.querySelector('main > div.overflow-y-auto') || document.querySelector('.overflow-y-auto') || window;
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      container.removeEventListener('scroll', handleScroll);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [subjectSlug, subjectType, saveProgress]);

  return percent;
}
