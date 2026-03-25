/**
 * api-client.ts — 輕量 fetch wrapper，對齊 api-spec-draft.md
 *
 * 所有 /me/* 端點自動帶 X-Visitor-Key header。
 * 後端不可用時 throw，由 SyncManager 捕獲做 fallback。
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

function getVisitorKey(): string {
  if (typeof window === 'undefined') return '';
  let key = localStorage.getItem('visitor-key');
  if (!key) {
    key = crypto.randomUUID();
    localStorage.setItem('visitor-key', key);
  }
  return key;
}

async function fetchJSON<T = any>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      'X-Visitor-Key': getVisitorKey(),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
  return res.json();
}

// ── Progress ────────────────────────────────────────────────────

export interface ProgressRecord {
  subjectType: string;
  subjectSlug: string;
  scrollPercent: number;
  isCompleted: boolean;
  lastReadAt: string;
}

export async function apiGetProgress(): Promise<ProgressRecord[]> {
  const json = await fetchJSON<{ data: { records: ProgressRecord[] } }>('/api/v1/me/progress');
  return json.data.records;
}

export async function apiUpsertProgress(records: ProgressRecord[]): Promise<number> {
  const json = await fetchJSON<{ data: { updated: number } }>('/api/v1/me/progress', {
    method: 'PUT',
    body: JSON.stringify({ records }),
  });
  return json.data.updated;
}

// ── Checklist ───────────────────────────────────────────────────

export interface ChecklistItemState {
  itemId: string;
  isChecked: boolean;
  checkedAt?: string | null;
}

export async function apiGetChecklistState(): Promise<ChecklistItemState[]> {
  const json = await fetchJSON<{ data: { items: ChecklistItemState[] } }>('/api/v1/me/checklist');
  return json.data.items;
}

export async function apiUpsertChecklistState(
  items: { itemId: string; isChecked: boolean }[]
): Promise<number> {
  const json = await fetchJSON<{ data: { updated: number } }>('/api/v1/me/checklist', {
    method: 'PUT',
    body: JSON.stringify({ items }),
  });
  return json.data.updated;
}

// ── Search ──────────────────────────────────────────────────────

export interface SearchResult {
  type: string;
  title: string;
  slug: string;
  documentSlug: string;
  sectionSlug: string | null;
  groupCode: string | null;
  snippet: string;
}

export async function apiSearch(
  q: string,
  types?: string,
  limit = 10
): Promise<{ query: string; results: SearchResult[] }> {
  const params = new URLSearchParams({ q, limit: String(limit) });
  if (types) params.set('types', types);
  const json = await fetchJSON<{ data: { query: string; results: SearchResult[] } }>(
    `/api/v1/search?${params}`
  );
  return json.data;
}

// ── Events ──────────────────────────────────────────────────────

export interface EventPayload {
  eventName: string;
  occurredAt: string;
  page?: string;
  payload?: Record<string, unknown>;
}

export async function apiSendEvents(events: EventPayload[]): Promise<number> {
  const json = await fetchJSON<{ data: { accepted: number } }>('/api/v1/events/batch', {
    method: 'POST',
    body: JSON.stringify({ events }),
  });
  return json.data.accepted;
}
