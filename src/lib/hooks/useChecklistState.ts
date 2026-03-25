import { useState, useEffect } from 'react';

export function useChecklistState() {
  const [checkedItemIds, setCheckedItemIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('checklist-progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.checkedItemIds)) {
          setCheckedItemIds(parsed.checkedItemIds);
          setLastUpdatedAt(parsed.lastUpdatedAt || null);
        }
      } catch (e) {
        console.error('Failed to parse checklist progress', e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      const ts = new Date().toISOString();
      localStorage.setItem('checklist-progress', JSON.stringify({
        checkedItemIds,
        lastUpdatedAt: ts
      }));
      setLastUpdatedAt(ts);
    }
  }, [checkedItemIds, isLoaded]);

  const toggleItem = (itemCode: string) => {
    setCheckedItemIds(prev => 
      prev.includes(itemCode) ? prev.filter(id => id !== itemCode) : [...prev, itemCode]
    );
  };

  const clearAll = () => setCheckedItemIds([]);

  return {
    checkedItemIds,
    toggleItem,
    clearAll,
    isLoaded,
    lastUpdatedAt
  };
}
