import { parseChecklistGroups } from './parser';
import { ChecklistGroup } from './types';

let cachedChecklistGroups: ChecklistGroup[] | null = null;

export async function getChecklistGroups(): Promise<ChecklistGroup[]> {
  if (!cachedChecklistGroups) {
    cachedChecklistGroups = await parseChecklistGroups();
  }
  return cachedChecklistGroups;
}
