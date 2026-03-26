import { parseOutlineSections, parseAiOutlineSections } from './parser';
import { OutlineSection } from './types';

let cachedOutlineSections: OutlineSection[] | null = null;

export async function getOutlineSections(): Promise<OutlineSection[]> {
  if (!cachedOutlineSections) {
    cachedOutlineSections = await parseOutlineSections();
  }
  return cachedOutlineSections;
}

let cachedAiOutlineSections: OutlineSection[] | null = null;
export async function getAiOutlineSections(): Promise<OutlineSection[]> {
  if (!cachedAiOutlineSections) {
    cachedAiOutlineSections = await parseAiOutlineSections();
  }
  return cachedAiOutlineSections;
}
