import React from 'react';
import fs from 'fs';
import path from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import remarkMermaid from 'remark-mermaidjs';
import { Book, Sparkles, Files } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '現代 Web 開發指南 v3 (完整版) | Learning Knowledge Workspace',
  description: 'AI 驅動開發指南的完整單頁版，涵蓋 13 個章節、55 分鐘投資計劃與核心實務。',
};

async function getFullGuideHtml() {
  const filePath = path.join(process.cwd(), 'modern-web-dev-guide-v3.md');
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Using a more robust processor for the full guide
  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(content);
    
  return String(processed);
}

export default async function FullGuidePage() {
  const html = await getFullGuideHtml();
  
  if (!html) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-2xl font-bold mb-4">找不到指南檔案</h1>
        <p className="text-[var(--text-muted)]">請確保 modern-web-dev-guide-v3.md 存在於根目錄。</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-8">
      {/* Top Banner */}
      <div className="mb-12 bg-gradient-to-r from-[var(--bg)] to-[var(--surface)] p-8 sm:p-12 rounded-[2rem] border border-[var(--line)] relative overflow-hidden group">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-[var(--accent-info)]/10 rounded-full blur-3xl group-hover:bg-[var(--accent-info)]/20 transition-all duration-700"></div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-[var(--accent-info)]/10 text-[var(--accent-info)] text-xs font-bold tracking-widest uppercase rounded-full border border-[var(--accent-info)]/20">
                Standalone / Full Version
              </span>
              <Sparkles className="w-4 h-4 text-[var(--accent-info)]" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[var(--text)] leading-tight mb-4">
              現代 Web 開發指南 v3
            </h1>
            <p className="text-[var(--text-muted)] text-xl leading-relaxed max-w-2xl">
              從標準流程到 Vibe Coding，全面掌握 AI 紅利。這是完整單頁預覽版，適合用於搜尋與快速瀏覽。
            </p>
          </div>
          <div className="flex shrink-0">
             <Link 
               href="/ai-guide" 
               className="flex items-center gap-2 bg-[var(--accent-info)] text-white px-6 py-3 rounded-2xl font-bold hover:brightness-110 transition-all shadow-lg shadow-[var(--accent-info)]/20 active:scale-95"
             >
               <Files className="w-5 h-5" /> 
               切換至分章節模式
             </Link>
          </div>
        </div>
      </div>

      {/* Content Rendering */}
      <article 
        className="prose prose-slate prose-xl max-w-none text-[var(--text)]
                   prose-headings:font-serif prose-headings:text-[var(--text)]
                   prose-h1:text-center prose-h1:mb-16
                   prose-h2:border-b prose-h2:border-[var(--line)] prose-h2:pb-4 prose-h2:mt-24
                   prose-a:text-[var(--accent-info)] prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                   prose-blockquote:border-l-[var(--accent-info)] prose-blockquote:bg-[var(--accent-info)]/5 prose-blockquote:py-2 prose-blockquote:rounded-r-xl
                   prose-pre:bg-[var(--bg)] prose-pre:border prose-pre:border-[var(--line)] prose-pre:rounded-2xl
                   prose-img:rounded-2xl prose-img:shadow-lg
                   prose-table:border prose-table:border-[var(--line)]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      
      {/* Footer Nav */}
      <div className="mt-24 pt-12 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-6">
        <p className="text-[var(--text-muted)] text-sm italic font-serif">
          &ldquo;你是定義「什麼該被寫」以及「判斷寫得好不好」的人。&rdquo; — v3 Guide
        </p>
        <div className="flex items-center gap-4">
           <Link href="/" className="text-sm font-bold opacity-60 hover:opacity-100 transition-opacity">返回學習工作台</Link>
           <Link href="/ai-guide" className="text-sm font-bold text-[var(--accent-info)]">分章節閱讀 →</Link>
        </div>
      </div>
    </div>
  );
}
