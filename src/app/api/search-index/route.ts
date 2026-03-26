import { NextResponse } from 'next/server';
import { getGuideSections } from '@/lib/content/guide-loader';
import { getAiGuideSections } from '@/lib/content/ai-guide-loader';
import { getOutlineSections } from '@/lib/content/outline-loader';
import { getChecklistGroups } from '@/lib/content/checklist-loader';

// Generate static JSON at build time
export const dynamic = 'force-static';

export async function GET() {
  const guides = await getGuideSections();
  const aiGuides = await getAiGuideSections();
  const outlines = await getOutlineSections();
  const checklists = await getChecklistGroups();

  const documents: any[] = [];

  guides.forEach(g => {
    documents.push({
      id: `guide-${g.slug}`,
      type: 'Guide',
      title: g.title,
      summary: g.summary,
      url: `/guide/${g.slug}`,
      searchStr: `${g.title} ${g.summary}`
    });
    g.headings?.forEach(h => {
      documents.push({
        id: `guide-${g.slug}-h${h.id}`,
        type: 'Section',
        title: h.text,
        summary: `載於指南：${g.title}`,
        url: `/guide/${g.slug}#${h.id}`,
        searchStr: `${h.text} ${g.title}`
      });
    });
  });

  outlines.forEach(o => {
    documents.push({
      id: `outline-${o.sectionSlug}`,
      type: 'Outline',
      title: o.title,
      summary: o.summary,
      url: `/outline#outline-${o.sectionSlug}`,
      searchStr: `${o.title} ${o.summary} ` + (o.highlights || []).join(' ')
    });
  });

  checklists.forEach(c => {
    c.items.forEach(item => {
      documents.push({
        id: `checklist-${item.itemCode}`,
        type: 'Checklist',
        title: item.label,
        summary: `群組：[${c.groupCode}] ${c.title}`,
        url: `/checklist`,
        searchStr: `${item.label} ${c.title}`
      });
    });
  });

  aiGuides.forEach(g => {
    documents.push({
      id: `ai-guide-${g.slug}`,
      type: 'AI Guide',
      title: g.title,
      summary: g.summary,
      url: `/ai-guide/${g.slug}`,
      searchStr: `${g.title} ${g.summary}`
    });
    g.headings?.forEach(h => {
      documents.push({
        id: `ai-guide-${g.slug}-h${h.id}`,
        type: 'AI Section',
        title: h.text,
        summary: `載於 AI 指南：${g.title}`,
        url: `/ai-guide/${g.slug}#${h.id}`,
        searchStr: `${h.text} ${g.title}`
      });
    });
  });

  return NextResponse.json(documents);
}
