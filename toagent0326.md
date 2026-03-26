# Handoff Memo: AI Guide Integration + Full Site Review
**Date**: 2026-03-26 (integrated → reviewed → site-wide audit completed same day)
**Target**: Another AI Agent (Reviewer/Maintainer)
**Context**: "Learning Knowledge Workspace" — Next.js 15 + Tailwind + Unified/Remark pipeline.

---

## 1. Objective
Integrate `modern-web-dev-guide-v3.md` as a standalone `/ai-guide` section, then conduct a full site review to ensure consistency between the new section and the existing app.

---

## 2. Final Architecture

### A. Data Layer (`src/lib/content/`)

| File | Role |
|------|------|
| `types.ts` | `GuideSection.relatedAiGuideSlugs` ↔ `AiGuideSection.relatedStandardGuideSlugs` |
| `parser.ts` | `parseAiGuideSections()`, `AI_GUIDE_SLUG_MAP`, `AI_GUIDE_CROSS_REF_MAP`, `GUIDE_TO_AI_CROSS_REF_MAP`, `AI_GUIDE_KNOWN_SKIP` |
| `ai-guide-loader.ts` | Singleton in-memory cache |

**Parser notes:**
- `AI_GUIDE_KNOWN_SKIP`: H2 headings intentionally skipped without `console.warn` (e.g., `目錄`).
- Any other unrecognised H2 still triggers `console.warn` at build time.
- Field naming convention: each cross-ref field names the *destination* guide — `relatedAiGuideSlugs` (on GuideSection) vs `relatedStandardGuideSlugs` (on AiGuideSection).

### B. Pages & Routing

| Route | Features |
|-------|---------|
| `/ai-guide` | Overview with `AiGuideList` — progress bar, `isLoaded` guard, `Chapter XX` labels, `CheckCircle` icon for completed chapters |
| `/ai-guide/[slug]` | Breadcrumb → `Sparkles + AI 驅動開發指南 > Chapter XX`; cross-refs show actual standard guide titles |
| `/guide` | Overview with `GuideList` — progress bar, `isLoaded` guard |
| `/guide/[slug]` | Breadcrumb → `BookOpen + 標準開發指南 > Chapter XX`; cross-refs show actual AI guide titles |

All 6 content pages (`/guide`, `/guide/[slug]`, `/ai-guide`, `/ai-guide/[slug]`, `/outline`, `/checklist`) have `generateMetadata` / `export const metadata` for browser tab titles and SEO.

### C. Layout & Navigation (`AppShell.tsx`)

- **Sidebar**: pathname-aware — shows AI guide chapter list on `/ai-guide/*`, standard guide list on `/guide/*`, default nav elsewhere.
- **Mobile bottom bar**: 5 entries — Guide / AI Guide / Outline / Checklist / Tools.
- **Desktop top bar**:
  - `{cmdKey}+K` shortcut label detects platform at runtime (`Cmd` on Mac, `Ctrl` on Windows/Linux).
  - Right utility panel button visible at all screen widths in focus mode; hidden at `xl:` otherwise.
- **Right utility panel progress bar**: green (`accent-primary`) for standard guide, blue (`accent-info`) for AI guide.

### D. Visual Conventions

| | Standard Guide | AI Guide |
|---|---|---|
| Accent | `accent-primary` (green) | `accent-info` (blue) |
| Icon | `BookOpen` | `Sparkles` |
| Chapter label | `Chapter 01` | `Chapter 01` (same format) |
| Completed icon | `CheckCircle` (green) | `CheckCircle` (blue) |
| Progress bar | green | blue |
| localStorage key | `{slug}` | `ai-{slug}` |

### E. Theme Compliance

All `bg-white` hardcodes replaced with CSS variables:
- `OutlineCards.tsx`: card background → `bg-[var(--surface)]`
- `ChecklistBoard.tsx`: group item area → `bg-[var(--bg)]`; unchecked item → `bg-[var(--surface)]`; checkbox indicator → `bg-[var(--surface)]`

---

## 3. Build Verification
- `npm run build` passes. **40 SSG paths** pre-rendered, zero TypeScript errors, zero console warnings.
- All page metadata resolves correctly (static + dynamic `generateMetadata`).

---

## 4. Key Files Quick Reference

```
src/
  app/
    guide/page.tsx                  ← metadata + GuideList
    guide/[slug]/page.tsx           ← generateMetadata + breadcrumb + cross-ref titles
    ai-guide/page.tsx               ← metadata + AiGuideList
    ai-guide/[slug]/page.tsx        ← generateMetadata + breadcrumb + cross-ref titles
    outline/page.tsx                ← metadata
    checklist/page.tsx              ← metadata
  components/
    layout/AppShell.tsx             ← sidebar routing, cmdKey detection, progress bar colour
    guide/GuideList.tsx             ← progress stats bar
    ai-guide/AiGuideList.tsx        ← progress stats bar, Chapter XX labels, CheckCircle icon
    outline/OutlineCards.tsx        ← theme-aware background
    checklist/ChecklistBoard.tsx    ← theme-aware backgrounds (3 locations)
  lib/content/
    types.ts                        ← GuideSection + AiGuideSection interfaces
    parser.ts                       ← parsing, slug maps, known-skip set
    ai-guide-loader.ts              ← singleton cache
docs/
  ai-guide-integration-status.md   ← full integration status with visual convention table
```

---

**Current Status**: Production-ready. All integration work, cross-section consistency fixes, theme compliance, SEO metadata, and UI polish completed and verified.
