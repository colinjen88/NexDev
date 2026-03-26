import { parseAiGuideSections } from './parser';
import { AiGuideSection } from './types';

let cachedAiGuideSections: AiGuideSection[] | null = null;

export async function getAiGuideSections(): Promise<AiGuideSection[]> {
  if (!cachedAiGuideSections) {
    cachedAiGuideSections = await parseAiGuideSections();
  }
  return cachedAiGuideSections;
}

export async function getAiGuideBySlug(slug: string): Promise<AiGuideSection | undefined> {
  const sections = await getAiGuideSections();
  return sections.find(s => s.slug === slug);
}
