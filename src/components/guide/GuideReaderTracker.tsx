'use client';

import React from 'react';
import { useScrollTracker } from '@/lib/hooks/useReadingProgress';

interface GuideReaderTrackerProps {
  slug: string;
}

export function GuideReaderTracker({ slug }: GuideReaderTrackerProps) {
  useScrollTracker(slug, 'guideSection');
  // This component doesn't render anything visible
  return null;
}
