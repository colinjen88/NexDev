import React from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { ContinueLearning } from '@/components/home/ContinueLearning';
import { ModeCards } from '@/components/home/ModeCards';
import { StageRoadmap } from '@/components/home/StageRoadmap';
import { getGuideSections } from '@/lib/content/guide-loader';

export default async function Home() {
  const guideSections = await getGuideSections();

  return (
    <div className="max-w-6xl mx-auto py-8 sm:py-12 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Hero & Modes (Span 8) */}
        <div className="lg:col-span-8 flex flex-col gap-8 lg:gap-12">
          <HeroSection />
          <ContinueLearning />
          <ModeCards />
        </div>

        {/* Right Column: Vertical Roadmap (Span 4) */}
        <div className="lg:col-span-4 lg:border-l lg:border-[var(--line)] lg:pl-10">
          <StageRoadmap sections={guideSections} />
        </div>
      </div>
    </div>
  );
}
