import React from 'react';
import fs from 'fs';
import path from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { Terminal, ShieldCheck, Zap } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI 專案部署守則 | Learning Knowledge Workspace',
  description: 'AI 代理的即時伺服器現況、部署規則與 Gateway 整合指令。',
};

async function getAgentContextHtml() {
  const filePath = path.join(process.cwd(), 'ac');
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');
  
  const processed = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeStringify)
    .process(content);
    
  return String(processed);
}

export default async function AgentContextPage() {
  const html = await getAgentContextHtml();
  
  if (!html) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h1 className="text-2xl font-bold mb-4">找不到守則檔案 (ac)</h1>
        <p className="text-[var(--text-muted)]">請確保專案根目錄下存在 ac 檔案。</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-12 bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-info)]/10 p-8 rounded-3xl border border-[var(--line)]">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--line)]">
            <ShieldCheck className="w-8 h-8 text-[var(--accent-primary)]" />
          </div>
          <div>
            <h1 className="text-3xl font-serif font-bold text-[var(--text)]">AI 專案部署守則</h1>
            <p className="text-[var(--text-muted)] text-sm mt-1">Docker-VPS-Gateway 整合規範</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-4 bg-[var(--surface)]/50 rounded-xl border border-[var(--line)]">
            <Terminal className="w-5 h-5 text-[var(--accent-info)] shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-bold block mb-1">純文字存取口令</span>
              <code className="bg-[var(--bg)] px-2 py-0.5 rounded border border-[var(--line)] text-xs">/jen/api/agent-context</code>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-[var(--surface)]/50 rounded-xl border border-[var(--line)]">
            <Zap className="w-5 h-5 text-[var(--accent-warm)] shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-bold block mb-1">強制流程要求</span>
              <span className="text-[var(--text-muted)]">部署前必須先獲取最新 Port 使用清單</span>
            </div>
          </div>
        </div>
      </div>

      <div 
        className="prose prose-slate prose-lg max-w-none text-[var(--text)]
                   prose-headings:font-serif prose-headings:text-[var(--text)]
                   prose-a:text-[var(--accent-primary)] 
                   prose-code:bg-[var(--surface-soft)] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
                   prose-pre:bg-[var(--bg)] prose-pre:border prose-pre:border-[var(--line)]
                   prose-strong:text-[var(--accent-primary)]"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      
      <div className="mt-16 pt-8 border-t border-[var(--line)] text-center text-[var(--text-muted)] text-sm">
        <p>© 2026 Learning Knowledge Workspace · 自動更新機制已就緒</p>
      </div>
    </div>
  );
}
