import { useState, useEffect, useCallback } from 'react';
import MiniSearch, { SearchResult } from 'minisearch';

export interface SearchDoc {
  id: string;
  type: string;
  title: string;
  summary: string;
  url: string;
  searchStr: string;
}

export type EnrichedSearchResult = SearchResult & {
  type: string;
  title: string;
  summary: string;
  url: string;
};

// Bi-gram and Uni-gram tokenization for CJK text
const tokenize = (text: string) => {
  const result = [];
  const chars = text.toLowerCase().split('');
  for (let i = 0; i < chars.length; i++) {
    result.push(chars[i]);
    if (i < chars.length - 1) {
      result.push(chars[i] + chars[i+1]);
    }
  }
  // Also split by spaces normally
  const words = text.toLowerCase().split(/[^a-z0-9]/i).filter(Boolean);
  return [...result, ...words];
};

export function useSearchIndex() {
  const [miniSearch, setMiniSearch] = useState<MiniSearch | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Lazy initialization, we call initialization when search dialog opens
  const initSearch = useCallback(async () => {
    if (miniSearch || isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/search-index');
      if (!res.ok) throw new Error('Failed to fetch search index');
      const data: SearchDoc[] = await res.json();
      
      const ms = new MiniSearch({
        fields: ['title', 'summary', 'searchStr'],
        storeFields: ['id', 'type', 'title', 'summary', 'url'],
        searchOptions: {
          prefix: true,
          fuzzy: 0.2
        },
        tokenize: tokenize,
        // Using same tokenizer for index and search
        processTerm: (term, _fieldName) => term.toLowerCase()
      });
      ms.addAll(data);
      setMiniSearch(ms);
    } catch (e) {
      console.error('Search init failed', e);
    } finally {
      setIsLoading(false);
    }
  }, [miniSearch, isLoading]);

  const search = useCallback((query: string): EnrichedSearchResult[] => {
    if (!miniSearch || !query.trim()) return [];
    
    // Fallback: tokenize the query with our tokenizer to allow better CJK search
    const queryTokens = tokenize(query).filter(t => t.length > 1 || query.length === 1);
    
    let results = miniSearch.search(query);
    
    // If strict match gives no results, try matching our bigrams query via Combine OR
    if (results.length === 0 && queryTokens.length > 0) {
       results = miniSearch.search(query, {
         combineWith: 'OR'
       });
    }

    return results as EnrichedSearchResult[];
  }, [miniSearch]);

  return { miniSearch, isLoading, initSearch, search };
}
