'use client';

import { useState, useEffect, useRef } from 'react';

export function useActiveHeading(headingIds: string[]) {
  const [activeId, setActiveId] = useState<string>('');
  
  // To avoid thrashing between overlapping observers
  const headingElementsRef = useRef<{ [key: string]: IntersectionObserverEntry }>({});

  useEffect(() => {
    setActiveId('');
    headingElementsRef.current = {};

    const callback: IntersectionObserverCallback = (entries) => {
      headingElementsRef.current = entries.reduce((map, headingElement) => {
        map[headingElement.target.id] = headingElement;
        return map;
      }, headingElementsRef.current);

      // Get all headings that are currently visible
      const visibleHeadings: IntersectionObserverEntry[] = [];
      Object.values(headingElementsRef.current).forEach((headingElement) => {
        if (headingElement.isIntersecting) {
          visibleHeadings.push(headingElement);
        }
      });

      // Find the top-most visible heading
      if (visibleHeadings.length > 0) {
        visibleHeadings.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        setActiveId(visibleHeadings[0].target.id);
      }
    };

    const observer = new IntersectionObserver(callback, {
      rootMargin: '-64px 0px -40% 0px', // Header offset and ignore bottom part
    });

    headingIds.forEach((id) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [headingIds]);

  return activeId;
}
