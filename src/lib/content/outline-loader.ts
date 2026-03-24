import { parseOutlineSections } from './parser';
import { OutlineSection } from './types';

let cachedOutlineSections: OutlineSection[] | null = null;

export async function getOutlineSections(): Promise<OutlineSection[]> {
  if (!cachedOutlineSections) {
    cachedOutlineSections = await parseOutlineSections();
  }
  return cachedOutlineSections;
}
