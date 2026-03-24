import { parseGuideSections } from './parser';
import { GuideSection } from './types';

let cachedGuideSections: GuideSection[] | null = null;

export async function getGuideSections(): Promise<GuideSection[]> {
  if (!cachedGuideSections) {
    cachedGuideSections = await parseGuideSections();
  }
  return cachedGuideSections;
}

export async function getGuideBySlug(slug: string): Promise<GuideSection | undefined> {
  const sections = await getGuideSections();
  return sections.find(s => s.slug === slug);
}
