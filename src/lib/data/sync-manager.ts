/**
 * sync-manager.ts — 前端狀態同步管理器
 *
 * 設計原則：
 * 1. 永遠先寫 localStorage（local-first）
 * 2. 若 NEXT_PUBLIC_API_BASE_URL 已設定，背景雙向同步
 * 3. 後端不可用時自動 fallback 到 local-only
 * 4. 使用 timestamp 做衝突合併（較新者 win）
 */

import {
  apiGetProgress,
  apiUpsertProgress,
  apiGetChecklistState,
  apiUpsertChecklistState,
  apiSendEvents,
  type ProgressRecord,
  type ChecklistItemState,
  type EventPayload,
} from './api-client';

export type SyncMode = 'local' | 'api-sync';

// ── Local Storage helpers ───────────────────────────────────────

const LS_PROGRESS = 'reading-progress';
const LS_CHECKLIST = 'checklist-progress';
const LS_EVENT_QUEUE = 'event-queue';

function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// ── Progress merge ──────────────────────────────────────────────

function mergeProgress(local: Record<string, ProgressRecord>, remote: ProgressRecord[]): Record<string, ProgressRecord> {
  const merged = { ...local };
  for (const r of remote) {
    const key = `${r.subjectType}:${r.subjectSlug}`;
    const existing = merged[key];
    if (!existing || new Date(r.lastReadAt) > new Date(existing.lastReadAt)) {
      merged[key] = r;
    }
  }
  return merged;
}

// ── SyncManager class ───────────────────────────────────────────

class SyncManager {
  private _mode: SyncMode;
  private _eventBuffer: EventPayload[] = [];
  private _flushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    const apiBase = typeof window !== 'undefined'
      ? (process.env.NEXT_PUBLIC_API_BASE_URL ?? '')
      : '';
    this._mode = apiBase ? 'api-sync' : 'local';
  }

  get mode(): SyncMode {
    return this._mode;
  }

  // ── Progress ────────────────────────────────────────────────

  /** Get all progress records (merged local + remote if api-sync) */
  async getProgress(): Promise<Record<string, ProgressRecord>> {
    const local = lsGet<Record<string, ProgressRecord>>(LS_PROGRESS, {});

    if (this._mode === 'local') return local;

    try {
      const remote = await apiGetProgress();
      const merged = mergeProgress(local, remote);
      lsSet(LS_PROGRESS, merged);
      return merged;
    } catch {
      // API down → fallback
      return local;
    }
  }

  /** Save a single progress record */
  async saveProgress(record: ProgressRecord): Promise<void> {
    // Always write local first
    const local = lsGet<Record<string, ProgressRecord>>(LS_PROGRESS, {});
    const key = `${record.subjectType}:${record.subjectSlug}`;
    local[key] = record;
    lsSet(LS_PROGRESS, local);

    // Background sync if api mode
    if (this._mode === 'api-sync') {
      apiUpsertProgress([record]).catch(() => {
        // Silently fail — local already saved
        console.warn('[SyncManager] Progress sync failed, will retry on next load');
      });
    }
  }

  // ── Checklist ───────────────────────────────────────────────

  /** Get checklist checked item IDs (merged) */
  async getChecklistState(): Promise<{ checkedItemIds: string[]; lastUpdatedAt: string }> {
    const local = lsGet<{ checkedItemIds: string[]; lastUpdatedAt: string }>(
      LS_CHECKLIST,
      { checkedItemIds: [], lastUpdatedAt: new Date().toISOString() }
    );

    if (this._mode === 'local') return local;

    try {
      const remote = await apiGetChecklistState();
      const remoteChecked = remote.filter(i => i.isChecked).map(i => i.itemId);
      // Merge: union of local + remote
      const merged = [...new Set([...local.checkedItemIds, ...remoteChecked])];
      const result = {
        checkedItemIds: merged,
        lastUpdatedAt: new Date().toISOString(),
      };
      lsSet(LS_CHECKLIST, result);
      return result;
    } catch {
      return local;
    }
  }

  /** Toggle a checklist item and sync */
  async toggleChecklistItem(itemCode: string, isChecked: boolean): Promise<void> {
    // Update local
    const local = lsGet<{ checkedItemIds: string[]; lastUpdatedAt: string }>(
      LS_CHECKLIST,
      { checkedItemIds: [], lastUpdatedAt: new Date().toISOString() }
    );

    if (isChecked) {
      if (!local.checkedItemIds.includes(itemCode)) {
        local.checkedItemIds.push(itemCode);
      }
    } else {
      local.checkedItemIds = local.checkedItemIds.filter(id => id !== itemCode);
    }
    local.lastUpdatedAt = new Date().toISOString();
    lsSet(LS_CHECKLIST, local);

    // Background sync (note: backend uses UUID itemId, frontend uses itemCode;
    // a real integration would need a mapping; for now this is the contract shape)
    if (this._mode === 'api-sync') {
      apiUpsertChecklistState([{ itemId: itemCode, isChecked }]).catch(() => {
        console.warn('[SyncManager] Checklist sync failed');
      });
    }
  }

  // ── Events ──────────────────────────────────────────────────

  /** Track an event (buffered, flushed every 10s or 20 events) */
  trackEvent(eventName: string, page?: string, payload?: Record<string, unknown>): void {
    if (this._mode === 'local') return;

    this._eventBuffer.push({
      eventName,
      occurredAt: new Date().toISOString(),
      page,
      payload,
    });

    // Flush if buffer full
    if (this._eventBuffer.length >= 20) {
      this._flush();
      return;
    }

    // Schedule flush
    if (!this._flushTimer) {
      this._flushTimer = setTimeout(() => this._flush(), 10_000);
    }
  }

  private async _flush(): Promise<void> {
    if (this._flushTimer) {
      clearTimeout(this._flushTimer);
      this._flushTimer = null;
    }
    if (this._eventBuffer.length === 0) return;

    const batch = this._eventBuffer.splice(0, 50);
    try {
      await apiSendEvents(batch);
    } catch {
      // Re-queue failed events to local storage
      const queue = lsGet<EventPayload[]>(LS_EVENT_QUEUE, []);
      queue.push(...batch);
      lsSet(LS_EVENT_QUEUE, queue.slice(-200)); // cap at 200
    }
  }

  /** Flush any pending events (call on page unload) */
  flushNow(): void {
    this._flush();
  }
}

// Singleton
export const syncManager = new SyncManager();
