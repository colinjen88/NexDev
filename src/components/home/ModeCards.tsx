import React from 'react';
import { BookOpen, TextSelect, Zap, LayoutPanelLeft, Sparkles } from 'lucide-react';
import Link from 'next/link';

export function ModeCards() {
  const modes = [
    { icon: BookOpen, title: '完整指南', desc: '深度閱讀，掌握底層邏輯與系統思考。', href: '/guide', color: 'text-[var(--accent-primary)]', bg: 'bg-[var(--accent-primary)]/10' },
    { icon: Sparkles, title: '現代 Web Dev 指南 v3', desc: '從標準流程到 Vibe Coding，全面掌握 AI 工具鏈、指令工程與模型選型。', href: '/ai-guide', color: 'text-[var(--accent-info)]', bg: 'bg-[var(--accent-info)]/10' },
    { icon: Zap, title: '速讀大綱', desc: '3 分鐘抓取重點，適合碎片時間複習。', href: '/outline', color: 'text-[var(--accent-warm)]', bg: 'bg-[var(--accent-warm)]/10' },
    { icon: LayoutPanelLeft, title: '對照實作', desc: '左看教學右打勾，最高效的實作體驗。', href: '/checklist', color: 'text-[var(--text)]', bg: 'bg-[var(--text)]/10' }
  ];

  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <TextSelect className="w-5 h-5 text-[var(--accent-warm)]" />
        <h2 className="text-lg font-serif font-bold text-[var(--text)]">學習模式探索</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {modes.map((mode, i) => (
          <Link href={mode.href} key={i} className="block group bg-[var(--surface)] border border-[var(--line)] rounded-xl p-6 hover:border-[var(--accent-primary)]/30 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col items-start cursor-pointer">
            <div className={`p-3 rounded-xl mb-4 ${mode.bg} ${mode.color}`}>
              <mode.icon className="w-6 h-6" />
            </div>
            <h4 className="text-lg font-serif font-bold text-[var(--text)] mb-2 group-hover:text-[var(--accent-primary)] transition-colors">{mode.title}</h4>
            <p className="text-[var(--text-muted)] text-sm leading-relaxed">{mode.desc}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
