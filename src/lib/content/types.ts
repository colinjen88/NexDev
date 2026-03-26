export interface GuideSection {
  slug: string;
  title: string;
  phaseCode: number;
  sortOrder: number;
  summary: string;
  estimatedReadMinutes: number;
  bodyHtml: string;
  headings: Array<{
    id: string;
    level: number;
    text: string;
  }>;
  prevSection: string | null;
  nextSection: string | null;
  relatedChecklistGroupCodes: string[];
  relatedAiGuideSlugs: string[];
}

export interface OutlineSection {
  sectionSlug: string;
  title: string;
  summary: string;
  highlights: string[];
  relatedGuideSectionSlugs: string[];
}

export interface ChecklistItem {
  itemCode: string;
  label: string;
  relatedSectionSlug?: string;
}

export interface ChecklistGroup {
  groupCode: string;
  title: string;
  description?: string;
  items: ChecklistItem[];
}

export interface AiGuideSection {
  slug: string;
  title: string;
  chapterNumber: number;
  sortOrder: number;
  summary: string;
  estimatedReadMinutes: number;
  bodyHtml: string;
  headings: Array<{
    id: string;
    level: number;
    text: string;
  }>;
  prevSection: string | null;
  nextSection: string | null;
  relatedStandardGuideSlugs: string[];
}
