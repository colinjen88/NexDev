import React from 'react';
import { useAppShell } from '@/components/layout/AppShellProvider';
import { Settings2, Maximize, Minimize } from 'lucide-react';

export function ReadingPreferencesPanel() {
  const { readingPreferences, updateReadingPreference } = useAppShell();
  const { fontSize, lineHeight, isFocusMode } = readingPreferences;

  return (
    <div className="space-y-6 pt-4 border-t border-[var(--line)]">
      <div className="flex items-center gap-2 mb-4">
        <Settings2 className="w-4 h-4 text-[var(--text-muted)]" />
        <h4 className="text-xs font-bold text-[var(--text-muted)] tracking-wider uppercase">閱讀偏好</h4>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[var(--text-muted)]">文字大小</span>
          <span className="text-[var(--accent-primary)] font-medium">{fontSize}</span>
        </div>
        <div className="flex gap-2">
          {['14px', '16px', '18px', '20px'].map((size, idx) => (
            <button
              key={size}
              onClick={() => updateReadingPreference('fontSize', size as any)}
              className={`flex-1 py-1.5 rounded text-sm border transition-colors ${fontSize === size ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)] text-[var(--accent-primary)] font-bold' : 'border-[var(--line)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'}`}
              style={{ fontSize: `${12 + idx * 2}px` }}
            >
              A
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[var(--text-muted)]">行高</span>
          <span className="text-[var(--accent-primary)] font-medium">{lineHeight}</span>
        </div>
        <div className="flex gap-2">
          {[
            { label: '緊湊', value: '1.6' },
            { label: '標準', value: '1.75' },
            { label: '寬鬆', value: '1.9' },
            { label: '超寬', value: '2.0' },
          ].map(lh => (
            <button
              key={lh.value}
              onClick={() => updateReadingPreference('lineHeight', lh.value as any)}
              className={`flex-1 py-1.5 rounded text-xs border transition-colors ${lineHeight === lh.value ? 'bg-[var(--accent-primary)]/10 border-[var(--accent-primary)] text-[var(--accent-primary)] font-bold' : 'border-[var(--line)] text-[var(--text-muted)] hover:border-[var(--text-muted)]'}`}
            >
              {lh.label}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-2">
        <button
          onClick={() => updateReadingPreference('isFocusMode', !isFocusMode)}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border transition-colors ${isFocusMode ? 'bg-[var(--accent-primary)] text-[var(--bg)] border-transparent' : 'bg-[var(--surface-soft)] border-[var(--line)] text-[var(--text)] hover:border-[var(--accent-primary)]/50'}`}
        >
          {isFocusMode ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          <span className="text-sm font-medium">{isFocusMode ? '退出專注模式' : '開啟專注模式'}</span>
        </button>
      </div>
    </div>
  );
}
