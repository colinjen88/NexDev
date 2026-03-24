import fs from 'fs';
import path from 'path';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeStringify from 'rehype-stringify';
import { visit } from 'unist-util-visit';
import { toString } from 'mdast-util-to-string';
import { toMarkdown } from 'mdast-util-to-markdown';

import { GuideSection, OutlineSection, ChecklistGroup, ChecklistItem } from './types';

// Slug Map configuration
const GUIDE_SLUG_MAP: Record<string, string> = {
  "1. 先建立正確觀念": "mindset",
  "2. 網站開發的標準流程總覽": "workflow-overview",
  "3. 第 0 階段：問題定義與需求發現": "problem-definition",
  "4. 第 1 階段：MVP 切分與範圍控制": "mvp-scope",
  "5. 第 2 階段：資訊架構、內容與 UX/UI": "ux-ui-architecture",
  "6. 第 3 階段：技術策略與架構設計": "tech-strategy-architecture",
  "7. 第 4 階段：AI 時代的實作流程": "ai-implementation",
  "8. 第 5 階段：測試、驗收與品質保證": "testing-qa",
  "9. 第 6 階段：安全、隱私、權限與風險控制": "security-privacy",
  "10. 第 7 階段：效能、可及性、SEO 與觀測性": "performance-seo",
  "11. 第 8 階段：CI/CD、部署與營運": "ci-cd-ops",
  "12. 從 MVP 走向規模化": "scaling",
  "13. 網站類型與技術取向速查": "tech-stack-cheat-sheet",
  "14. 學習路線建議：從入門到業界可用": "learning-path",
  "15. 常見失誤與反模式": "anti-patterns",
  "16. 交付物、清單與模板": "deliverables-templates",
  "17. 參考資源與延伸閱讀": "reference-resources"
};

const OUTLINE_SLUG_MAP: Record<string, string> = {
  "1. 先建立正確觀念": "mindset",
  "2. 標準流程總覽": "workflow-overview",
  "3. 問題定義": "problem-definition",
  "4. MVP 切分": "mvp-scope",
  "5. 資訊架構與 UX/UI": "ux-ui-architecture",
  "6. 技術策略與架構設計": "tech-strategy-architecture",
  "7. AI 時代的實作流程": "ai-implementation",
  "8. 測試與品質保證": "testing-qa",
  "9. 安全、隱私與權限": "security-privacy",
  "10. 效能、可及性、 SEO、觀測性": "performance-seo",
  "11. CI/CD、部署與營運": "ci-cd-ops",
  "12. 從 MVP 到規模化": "scaling",
  "13. 最值得記住的十句話": "top-ten-quotes",
  "14. 建議怎麼用這份速讀版": "how-to-use"
};

const CHECKLIST_GROUP_MAP: Record<string, string> = {
  // Letters A-R matching their sections conceptually
  "A": "problem-definition",
  "B": "mvp-scope",
  "C": "ux-ui-architecture",
  "D": "tech-strategy-architecture",
  "E": "ai-implementation",
  "F": "ai-implementation", // or source control
  "G": "tech-strategy-architecture", // coding
  "H": "testing-qa",
  "I": "security-privacy",
  "J": "performance-seo",
  "K": "performance-seo", // a11y
  "L": "performance-seo", // seo
  "M": "performance-seo", // observability
  "N": "ci-cd-ops",
  "O": "testing-qa", // go-no-go
  "P": "testing-qa", // post-launch
  "Q": "scaling",
  "R": "mindset"
};

const rootCache: Record<string, any> = {};

function getProcessor() {
  return unified()
    .use(remarkParse)
    .use(remarkGfm);
}

function getHtmlProcessor() {
  return unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings)
    .use(rehypeStringify);
}

function normalizeTitle(title: string) {
  return title.trim();
}

/** Parses study.md */
export async function parseGuideSections(): Promise<GuideSection[]> {
  const filePath = path.join(process.cwd(), 'content', 'study.md');
  const content = fs.readFileSync(filePath, 'utf-8');
  const tree = getProcessor().parse(content);
  
  const sections: any[] = [];
  let currentSection: any = null;

  tree.children.forEach((node: any) => {
    if (node.type === 'heading' && node.depth === 2) {
      const title = toString(node).trim();
      // Only keep numbered headings
      if (/^\d+\./.test(title)) {
        currentSection = {
          title,
          nodes: []
        };
        sections.push(currentSection);
      } else {
        currentSection = null; // discard non-numbered sections like "目錄", "這份指南的定位"
      }
    } else if (currentSection) {
      currentSection.nodes.push(node);
    }
  });

  const guideSections: GuideSection[] = [];
  
  let sortOrder = 1;
  for (let i = 0; i < sections.length; i++) {
    const sec = sections[i];
    const slug = GUIDE_SLUG_MAP[sec.title] || `section-${sortOrder}`;
    
    // Extract Phase Code roughly
    const phaseMatch = sec.title.match(/第 (\d+) 階段/);
    const phaseCode = phaseMatch ? parseInt(phaseMatch[1], 10) : -1;

    // Estimate Reading time
    const mdString = sec.nodes.map((n: any) => toString(n)).join('\n');
    const wordCount = mdString.replace(/[^\u4e00-\u9fa5]/g, '').length;
    let estimatedReadMinutes = Math.ceil(wordCount / 400);
    if (estimatedReadMinutes === 0) estimatedReadMinutes = 1;

    // Generate HTML
    const htmlAst = await getHtmlProcessor().run({ type: 'root', children: sec.nodes });
    const bodyHtml = getHtmlProcessor().stringify(htmlAst as any);

    // Extract Headings for TOC (H3)
    const headings: Array<{ id: string, level: number, text: string }> = [];
    visit({ type: 'root', children: sec.nodes }, 'heading', (node: any) => {
      if (node.depth === 3) {
        const text = toString(node).trim();
        const id = text.toLowerCase().replace(/\s+/g, '-'); // simple fallback
        headings.push({ id, level: 3, text });
      }
    });

    // We can do better for `id` but for now we'll match `rehype-slug` behaviour
    // A quick hack for correct IDs is scanning the HTML output (which `rehype-slug` mutated) or doing AST walk on rehype AST
    const rehypeAst = await unified().use(remarkParse).use(remarkRehype).use(rehypeSlug).run({ type: 'root', children: sec.nodes });
    headings.length = 0; // reset
    visit(rehypeAst, 'element', (node: any) => {
      if (node.tagName === 'h3') {
        const text = toString(node);
        const id = node.properties.id as string;
        headings.push({ id, level: 3, text });
      }
    });

    // A tiny summary
    const firstP = sec.nodes.find((n: any) => n.type === 'paragraph');
    const summary = firstP ? toString(firstP) : sec.title;

    guideSections.push({
      slug,
      title: sec.title.replace(/^\d+\.\s*/, ''), // removes the number prefix
      phaseCode,
      sortOrder,
      summary,
      estimatedReadMinutes,
      bodyHtml: String(bodyHtml),
      headings,
      prevSection: null,
      nextSection: null,
      relatedChecklistGroupCodes: []
    });
    sortOrder++;
  }

  // Link previous and next
  for (let i = 0; i < guideSections.length; i++) {
    if (i > 0) guideSections[i].prevSection = guideSections[i - 1].slug;
    if (i < guideSections.length - 1) guideSections[i].nextSection = guideSections[i + 1].slug;
  }

  return guideSections;
}

/** Parses study-quick-outline.md */
export async function parseOutlineSections(): Promise<OutlineSection[]> {
  const filePath = path.join(process.cwd(), 'content', 'study-quick-outline.md');
  const content = fs.readFileSync(filePath, 'utf-8');
  const tree = getProcessor().parse(content);
  
  const sections: any[] = [];
  let currentSection: any = null;

  tree.children.forEach((node: any) => {
    if (node.type === 'heading' && node.depth === 2) {
      const title = toString(node).trim();
      if (/^\d+\./.test(title)) {
        currentSection = { title, nodes: [] };
        sections.push(currentSection);
      } else {
        currentSection = null;
      }
    } else if (currentSection) {
      currentSection.nodes.push(node);
    }
  });

  return sections.map(sec => {
    const sectionSlug = OUTLINE_SLUG_MAP[sec.title] || 'unknown';
    // find lists for highlights
    const highlights: string[] = [];
    visit({ type: 'root', children: sec.nodes }, 'listItem', (node: any) => {
      highlights.push(toString(node).trim());
    });
    // find first p for summary
    const firstP = sec.nodes.find((n: any) => n.type === 'paragraph');
    const summary = firstP ? toString(firstP) : '';

    return {
      sectionSlug,
      title: sec.title.replace(/^\d+\.\s*/, ''),
      summary,
      highlights,
      relatedGuideSectionSlugs: [sectionSlug]
    };
  });
}

/** Parses study-implementation-checklist.md */
export async function parseChecklistGroups(): Promise<ChecklistGroup[]> {
  const filePath = path.join(process.cwd(), 'content', 'study-implementation-checklist.md');
  const content = fs.readFileSync(filePath, 'utf-8');
  const tree = getProcessor().parse(content);
  
  const groups: ChecklistGroup[] = [];
  let currentGroup: ChecklistGroup | null = null;
  let itemCounter = 1;

  tree.children.forEach((node: any) => {
    if (node.type === 'heading' && node.depth === 2) {
      const title = toString(node).trim();
      // Format usually: "A. 問題定義與目標"
      const match = title.match(/^([A-Z])\.\s*(.+)/);
      if (match) {
        const groupCode = match[1];
        const groupTitle = match[2];
        currentGroup = {
          groupCode,
          title: groupTitle,
          items: []
        };
        groups.push(currentGroup);
        itemCounter = 1;
      } else {
        currentGroup = null;
      }
    } else if (currentGroup && node.type === 'list') {
      visit(node, 'listItem', (liNode: any) => {
        // Must contain a checkbox
        if (liNode.checked !== null && liNode.checked !== undefined) {
          const label = toString(liNode).trim();
          const targetSlug = CHECKLIST_GROUP_MAP[currentGroup!.groupCode];
          currentGroup!.items.push({
            itemCode: `${currentGroup!.groupCode}-${itemCounter}`,
            label,
            relatedSectionSlug: targetSlug
          });
          itemCounter++;
        }
      });
    } else if (currentGroup && node.type === 'paragraph' && currentGroup.items.length === 0) {
      // Potentially a description if occurs before the lists
      currentGroup.description = toString(node).trim();
    }
  });

  return groups;
}
