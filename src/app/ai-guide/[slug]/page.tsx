import type { Metadata } from 'next';
import React from 'react';
import { getAiGuideSections, getAiGuideBySlug } from '@/lib/content/ai-guide-loader';
import { getGuideSections } from '@/lib/content/guide-loader';
import { notFound } from 'next/navigation';
import { BookDashed, ChevronLeft, ChevronRight, BookOpen, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { GuideReaderTracker } from '@/components/guide/GuideReaderTracker';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const section = await getAiGuideBySlug(slug);
  if (!section) return { title: 'AI 驅動開發指南 | 學習型知識工作台' };
  return {
    title: `${section.title} | AI 驅動開發指南`,
    description: section.summary,
  };
}

export async function generateStaticParams() {
  const sections = await getAiGuideSections();
  return sections.map(s => ({ slug: s.slug }));
}

export default async function AiGuideChapter({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const section = await getAiGuideBySlug(resolvedParams.slug);
  if (!section) notFound();

  const prevSection = section.prevSection ? await getAiGuideBySlug(section.prevSection) : null;
  const nextSection = section.nextSection ? await getAiGuideBySlug(section.nextSection) : null;

  const guideSections = section.relatedStandardGuideSlugs.length > 0 ? await getGuideSections() : [];
  const guideSlugToTitle = Object.fromEntries(guideSections.map(s => [s.slug, s.title]));

  const chapterLabel = section.chapterNumber === -1
    ? (section.slug === 'preface' ? '前言' : '結語')
    : `Chapter ${section.chapterNumber.toString().padStart(2, '0')}`;

  return (
    <>
      <GuideReaderTracker slug={`ai-${section.slug}`} />
      <nav className="flex items-center gap-1.5 text-sm text-[var(--text-muted)] mb-6 max-w-2xl mx-auto">
        <Link href="/ai-guide" className="flex items-center gap-1 hover:text-[var(--accent-info)] transition-colors">
          <Sparkles className="w-3.5 h-3.5" />
          AI 驅動開發指南
        </Link>
        <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="text-[var(--text)] font-medium truncate">{chapterLabel}</span>
      </nav>
      <div className="max-w-2xl mx-auto bg-[var(--surface)] p-8 md:p-14 rounded-2xl border border-[var(--line)] shadow-sm animate-in fade-in zoom-in-95 duration-500">
        <div className="flex items-center gap-3 mb-6 text-[var(--accent-info)] flex-wrap">
          <span className="font-bold text-sm tracking-widest uppercase bg-[var(--accent-info)]/10 px-3 py-1 rounded-full">
            {chapterLabel}
          </span>
          <span className="text-sm font-medium flex items-center gap-1">
            <BookDashed className="w-4 h-4"/> 閱讀時間約 {section.estimatedReadMinutes} 分鐘
          </span>
        </div>
        
        <h1 className="text-3xl md:text-5xl font-serif text-[var(--text)] leading-tight mb-12">
          {section.title}
        </h1>
      
      {/* Markdown Content rendered as HTML */}
      <div 
        className="prose prose-slate prose-lg max-w-none text-[var(--text)] leading-loose 
                   prose-headings:font-serif prose-headings:text-[var(--text)]
                   prose-a:text-[var(--accent-info)] 
                   selection:bg-[var(--accent-info)]/20 selection:text-[var(--accent-info)]
                   prose-pre:bg-[var(--bg)] prose-pre:text-[var(--text)] prose-pre:border prose-pre:border-[var(--line)]"
        dangerouslySetInnerHTML={{ __html: section.bodyHtml }}
      />

      {/* Cross-reference to standard guide */}
      {section.relatedStandardGuideSlugs.length > 0 && (
        <div className="mt-12 p-5 bg-[var(--accent-primary)]/5 border border-[var(--accent-primary)]/20 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-4 h-4 text-[var(--accent-primary)]" />
            <span className="text-sm font-bold text-[var(--accent-primary)]">延伸閱讀 — 標準開發指南</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {section.relatedStandardGuideSlugs.map(slug => (
              <Link
                key={slug}
                href={`/guide/${slug}`}
                className="text-sm text-[var(--accent-primary)] hover:underline bg-[var(--surface)] px-3 py-1.5 rounded-lg border border-[var(--line)] hover:border-[var(--accent-primary)]/30 transition-colors"
              >
                📖 {guideSlugToTitle[slug] ?? slug}
              </Link>
            ))}
          </div>
        </div>
      )}
      
      {/* Chapter Footer Navigation */}
      <div className="mt-16 pt-8 border-t border-[var(--line)] flex flex-col sm:flex-row gap-4 justify-between items-center">
        {prevSection ? (
          <Link href={`/ai-guide/${prevSection.slug}`} className="w-full sm:w-1/2 flex items-center gap-3 p-4 rounded-xl hover:bg-[var(--surface-soft)] transition-colors group border border-transparent hover:border-[var(--line)]">
            <ChevronLeft className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent-info)]" />
            <div className="flex-col">
              <span className="text-xs text-[var(--text-muted)] block">上一章</span>
              <span className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent-info)] transition-colors line-clamp-1">{prevSection.title}</span>
            </div>
          </Link>
        ) : <div className="hidden sm:block w-1/2"></div>}
        
        {nextSection && (
          <Link href={`/ai-guide/${nextSection.slug}`} className="w-full sm:w-1/2 flex items-center justify-end text-right gap-3 p-4 rounded-xl hover:bg-[var(--surface-soft)] transition-colors group border border-transparent hover:border-[var(--line)]">
            <div className="flex-col">
              <span className="text-xs text-[var(--text-muted)] block">下一章</span>
              <span className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent-info)] transition-colors line-clamp-1">{nextSection.title}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent-info)]" />
          </Link>
        )}
      </div>
    </div>
    </>
  );
}
