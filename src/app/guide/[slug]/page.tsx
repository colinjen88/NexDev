import React from 'react';
import { getGuideSections, getGuideBySlug } from '@/lib/content/guide-loader';
import { notFound } from 'next/navigation';
import { BookDashed, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { GuideReaderTracker } from '@/components/guide/GuideReaderTracker';

export async function generateStaticParams() {
  const sections = await getGuideSections();
  return sections.map(s => ({ slug: s.slug }));
}

export default async function GuideChapter({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const section = await getGuideBySlug(resolvedParams.slug);
  if (!section) notFound();

  const prevSection = section.prevSection ? await getGuideBySlug(section.prevSection) : null;
  const nextSection = section.nextSection ? await getGuideBySlug(section.nextSection) : null;

  return (
    <>
      <GuideReaderTracker slug={section.slug} />
      <div className="max-w-2xl mx-auto bg-[var(--surface)] p-8 md:p-14 rounded-2xl border border-[var(--line)] shadow-sm animate-in fade-in zoom-in-95 duration-500">
        <div className="flex items-center gap-3 mb-6 text-[var(--accent-warm)]">
          <span className="font-bold text-sm tracking-widest uppercase bg-[var(--accent-warm)]/10 px-3 py-1 rounded-full">
            Chapter {section.sortOrder.toString().padStart(2, '0')}
          </span>
          <span className="text-sm font-medium flex items-center gap-1">
            <BookDashed className="w-4 h-4"/> 閱讀時間約 {section.estimatedReadMinutes} 分鐘
          </span>
          {section.phaseCode >= 0 && (
            <span className="text-sm font-medium flex items-center gap-1">
              • Phase {section.phaseCode}
            </span>
          )}
        </div>
        
        <h1 className="text-3xl md:text-5xl font-serif text-[var(--text)] leading-tight mb-12">
          {section.title}
        </h1>
      
      {/* Markdown Content rendered as HTML */}
      <div 
        className="prose prose-slate prose-lg max-w-none text-[var(--text)] leading-loose 
                   prose-headings:font-serif prose-headings:text-[var(--text)]
                   prose-a:text-[var(--accent-primary)] 
                   selection:bg-[var(--accent-primary)]/20 selection:text-[var(--accent-primary)]
                   prose-pre:bg-[var(--bg)] prose-pre:text-[var(--text)] prose-pre:border prose-pre:border-[var(--line)]"
        dangerouslySetInnerHTML={{ __html: section.bodyHtml }}
      />
      
      {/* Chapter Footer Navigation */}
      <div className="mt-16 pt-8 border-t border-[var(--line)] flex flex-col sm:flex-row gap-4 justify-between items-center">
        {prevSection ? (
          <Link href={`/guide/${prevSection.slug}`} className="w-full sm:w-1/2 flex items-center gap-3 p-4 rounded-xl hover:bg-[var(--surface-soft)] transition-colors group border border-transparent hover:border-[var(--line)]">
            <ChevronLeft className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)]" />
            <div className="flex-col">
              <span className="text-xs text-[var(--text-muted)] block">上一章</span>
              <span className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1">{prevSection.title}</span>
            </div>
          </Link>
        ) : <div className="hidden sm:block w-1/2"></div>}
        
        {nextSection && (
          <Link href={`/guide/${nextSection.slug}`} className="w-full sm:w-1/2 flex items-center justify-end text-right gap-3 p-4 rounded-xl hover:bg-[var(--surface-soft)] transition-colors group border border-transparent hover:border-[var(--line)]">
            <div className="flex-col">
              <span className="text-xs text-[var(--text-muted)] block">下一章</span>
              <span className="text-sm font-medium text-[var(--text)] group-hover:text-[var(--accent-primary)] transition-colors line-clamp-1">{nextSection.title}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-[var(--text-muted)] group-hover:text-[var(--accent-primary)]" />
          </Link>
        )}
      </div>
    </div>
    </>
  );
}
