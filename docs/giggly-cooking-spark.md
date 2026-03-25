# 學習型知識工作台 — 完整開發計劃

## Context

本專案目前是一個**純文件倉庫**，包含完整的設計規格（前端 `design.md`、後端 `backend-design.md`、API `api-spec-draft.md`、DB `db-schema-draft.md`）以及三份 Markdown 學習內容（`study.md`、`study-quick-outline.md`、`study-implementation-checklist.md`）。

唯一的程式碼是 `index.jsx`（594 行），一個**沒有專案腳手架的獨立 React 元件**（無 package.json、無路由、無 TypeScript、資料全部 hardcoded mock）。

本計劃的目標是將這些文件和原型轉化為一個完整的「學習型知識工作台」Web 應用。

---

## 現狀 vs 目標差距分析

### index.jsx 已有（可回收利用的部分）
- HomeView：Hero + 模式卡片 + 學習路線圖（但只有 5 個 mock 章節）
- ChapterWorkspace：4 種模式切換（read/summary/checklist/compare）
- ChecklistBoard：checkbox 樣式、進度條
- 手機浮動底欄 + 滑出式清單抽屜
- 色系接近規格（暖米底 + 青綠主色 + 陶土橘）
- 字體選擇正確（Noto Serif TC + Noto Sans TC）

### index.jsx 缺失（需要新建的部分）
1. **專案腳手架**：無 Next.js、無 TypeScript、無 package.json
2. **真實路由**：用 useState 模擬，非 URL 路由
3. **真實內容**：所有資料 hardcoded，無 Markdown 解析
4. **三欄佈局**：缺少規格中的左導航欄 + 右工具欄完整結構
5. **搜尋/Command Palette**：只有外觀，無功能
6. **localStorage 持久化**：完全缺失
7. **閱讀偏好**：字級/行高/專注模式 缺失
8. **Checklist 分組/篩選**：只有 5 個扁平項目，規格需要 18 組 ~148 項
9. **設計 Token 系統**：Tailwind 內聯 hex，未用 CSS Variables
10. **可及性**：無 ARIA、無鍵盤導航、無焦點管理
11. **後端**：完全不存在

### 色彩 Token 校正（design.md 規格 vs index.jsx 現況）

| Token | design.md 規格 | index.jsx 現況 | 動作 |
|---|---|---|---|
| `--bg` | `#F4EFE6` | `#F7F5F0` | 採用規格 |
| `--surface` | `#FFF9F2` | `white` | 採用規格 |
| `--text` | `#21303A` | `#2C363F` | 採用規格 |
| `--text-muted` | `#5B6B74` | `#5A646E` | 採用規格 |
| `--line` | `#D5C8B8` | `#E6E2D6` | 採用規格 |
| `--accent-primary` | `#1F6B6B` | `#186F65` | 採用規格 |
| `--accent-warm` | `#C26B35` | `#C24914` | 採用規格 |

---

## Phase 0：專案腳手架與內容管道（基礎）

### Task 0.1：初始化 Next.js 專案 ✅

**技術選型**（與 design.md §12.1 一致）：
- Next.js App Router（開工時鎖定目前穩定主版；以 SSG 為主，內容頁零伺服器成本）
- React + TypeScript（依 Next.js 相容矩陣鎖定，strict mode）
- Tailwind CSS + CSS custom properties（開工時鎖定穩定版）
- `unified` / `remark` / `rehype` 生態系做 Markdown 解析
- `lucide-react`（沿用原型）

**目錄結構（目標狀態）：**

> 目前 repo 仍以根目錄文件為主，且已存在 `doc/to-canvas.md` 這類既有路徑。若 Phase 0 要搬到 `content/` / `docs/`，必須把「搬檔、修正相對連結、更新引用文件」視為同一個 task，不要只搬檔不修連結。

```
Dev_workflow/
├── content/                      # Markdown 內容真實來源
│   ├── study.md
│   ├── study-quick-outline.md
│   └── study-implementation-checklist.md
├── docs/                         # 設計文件（不部署）
│   ├── design.md
│   ├── backend-design.md
│   ├── api-spec-draft.md
│   ├── db-schema-draft.md
│   ├── to-canvas.md
│   ├── to-gemini-backend.md
│   └── README.md
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout（AppShell）
│   │   ├── page.tsx              # 首頁 / 學習儀表板
│   │   ├── guide/
│   │   │   ├── page.tsx          # 指南總覽
│   │   │   └── [slug]/page.tsx   # 單章節閱讀
│   │   ├── outline/page.tsx      # 速讀大綱
│   │   ├── checklist/page.tsx    # 互動清單
│   │   └── compare/page.tsx      # 比較模式
│   ├── components/
│   │   ├── layout/               # AppShell, TopCommandBar, LeftNav, RightPanel, MobileBottomBar
│   │   ├── home/                 # HeroSection, ModeCards, StageRoadmap, ContinueLearning
│   │   ├── guide/                # GuideReader, ChapterNav, PageTOC, SectionFooter
│   │   ├── outline/              # OutlineCards, OutlineFlowBar
│   │   ├── checklist/            # ChecklistBoard, ChecklistGroup, ChecklistItem, Filters, Progress
│   │   ├── compare/              # CompareView
│   │   ├── shared/               # ProgressRing, SearchPalette, ModeSwitch, BackToTop
│   │   └── mdx/                  # Callout, CodeBlock 等自訂渲染元件
│   ├── lib/
│   │   ├── content/              # parser.ts, guide-loader.ts, outline-loader.ts, checklist-loader.ts, types.ts
│   │   ├── data/                 # adapters.ts, local-store.ts, sync-manager.ts
│   │   ├── hooks/                # useReadingProgress, useChecklistState, useActiveHeading, useSearchIndex, useMediaQuery
│   │   └── utils/                # slug.ts, scroll.ts
│   ├── styles/
│   │   ├── globals.css           # CSS variables / design tokens + Tailwind 指令
│   │   ├── typography.css        # 長文閱讀排版
│   │   └── mdx.css               # MDX 專屬排版
│   └── types/                    # content.ts, progress.ts, api.ts
├── legacy/index.jsx              # 原型保留供參考
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── postcss.config.mjs
```

**安裝依賴：**
```
next react react-dom typescript @types/react @types/node
tailwindcss postcss autoprefixer
unified remark-parse remark-gfm remark-rehype rehype-stringify rehype-slug rehype-autolink-headings
lucide-react
```

### Task 0.2：建立設計 Token 系統 ✅

在 `src/styles/globals.css` 建立 CSS custom properties，`tailwind.config.ts` 引用這些變數：

```css
:root {
  --bg: #F4EFE6;
  --surface: #FFF9F2;
  --surface-soft: #E9E0D2;
  --text: #21303A;
  --text-muted: #5B6B74;
  --line: #D5C8B8;
  --accent-primary: #1F6B6B;
  --accent-warm: #C26B35;
  --accent-olive: #72834A;
  --accent-danger: #B34B3E;
  --accent-info: #3E6F9C;
}
```

字體透過 `next/font` 載入（取代 index.jsx 的 `@import url()`）：
- `Noto Serif TC`（標題）
- `Noto Sans TC`（內文）
- `JetBrains Mono`（程式碼）

### Task 0.3：內容解析管道（關鍵路徑） ✅

用 `unified` + `remark-parse` 在 build time 解析三份 Markdown：

**study.md 解析策略：**
- 先過濾非正文 H2：`這份指南的定位`、`目錄`、`Why`、`What`、`Risk`、`Test Plan`、`Notes`、`最後總結`
- 保留 17 個編號 H2 作為 17 個 guide section（各對應 `/guide/[slug]`）
- H3 = 頁內目錄項目
- 產出：`{ slug, title, phaseCode, sortOrder, summary, estimatedReadMinutes, bodyHtml, headings[], prevSection, nextSection, relatedChecklistGroupCodes[] }`
- 中文標題 → slug 使用**手動對照表**（避免自動音譯不穩定）：
  ```
  "1. 先建立正確觀念" → "mindset"
  "2. 網站開發的標準流程總覽" → "workflow-overview"
  "3. 第 0 階段：問題定義與需求發現" → "problem-definition"
  ...
  ```
- 估算閱讀時間：中文字數 ÷ 400 字/分鐘
- `Why / What / Risk / Test Plan / Notes` 建議視為「交付物、清單與模板」章節底下的模板區塊，不獨立成 guide page

**study-quick-outline.md 解析：**
- 先過濾 `一句話總結`
- 保留 14 個編號 H2 → `{ sectionSlug, title, summary, highlights[], relatedGuideSectionSlugs[] }`

**study-implementation-checklist.md 解析：**
- 18 組（A-R）→ `{ groupCode, title, items[{ itemCode, label, relatedSectionSlug }] }`
- checklist item 只計算符合 `- [ ]` 的 task bullets；檔案開頭的 3 個「使用方式」 bullets 不算 item

**驗證**：建立 `scripts/validate-content.ts` 檢查解析結果、slug 一致性、交叉引用完整性、Markdown 相對連結、heading anchor 穩定性。

**補充建議**：不要讓前端 parser 和後端 seed script 各自推導 slug / group code。應抽出單一 manifest（例如 `content/content-manifest.json`），讓前後端共用同一份內容識別資料。

---

## Phase 1：前端骨架 — AppShell + 首頁 + 導航

### Task 1.1：Root Layout 與 AppShell ✅

**三欄佈局**（design.md §6.1）：
- 左欄 280px（可收合）
- 中欄 minmax(720px, 860px)（可滾動）
- 右欄 300px（平板可收合）

**響應式斷點**（design.md §10.1）：
- ≥1440px：完整三欄
- 1024-1439px：兩欄 + 右欄抽屜
- 768-1023px：單主欄 + 左欄抽屜
- <768px：單欄 + 底部快速欄

AppShell 用 React Context 管理 `isSidebarOpen`、`isUtilityPanelOpen`、當前模式。

### Task 1.2：首頁 / 學習儀表板 ✅

5 個區塊（design.md §7.1）：
1. **Hero 區**：標題 + 副標 + 三個主 CTA → 回收 index.jsx HomeView 的佈局
2. **學習模式卡片**：完整指南 / 速讀大綱 / 實作清單（附「適合何時使用」說明）
3. **流程地圖**（StageRoadmap）：**9 個階段（0-8）**，非 index.jsx 的 5 個 mock → 從解析後的 study.md 產生
4. **繼續學習區**：讀 localStorage → 上次位置、完成比例、最近 checklist 活動
5. **推薦閱讀路徑**：新手 / 實作前 / 上線前 三條路線

### Task 1.3：TopCommandBar ✅

回收 index.jsx `TopNav` 視覺結構，增加：
- 模式切換 tabs（Guide / Outline / Checklist）→ 用 `router.push` 非 `useState`
- 搜尋觸發（Cmd+K）→ Phase 3 實作
- 內頁 breadcrumb

### Task 1.4：Left Navigation Rail ✅

根據當前路由動態顯示不同內容：
- 首頁：模式連結 + 最近活動
- Guide 頁：章節列表 + 已讀/未讀狀態
- Checklist：分組列表 + 完成指標
- Outline：節次快跳列表

**Phase 1 驗證**：
- 首頁 5 個區塊完整渲染
- 點選模式卡可導航到對應路由（placeholder）
- 路線圖顯示 study.md 解析出的全部階段
- 四個斷點佈局正確響應
- 繼續學習區可讀寫 localStorage

---

## Phase 2：內容頁 — Guide / Outline / Checklist / Compare

### Task 2.1：指南總覽頁 `/guide` ✅

列表頁：文件標題 + 章節列表（含摘要、閱讀時間、已讀狀態）。

### Task 2.2：章節閱讀器 `/guide/[slug]`（關鍵路徑） ✅

**中欄**：
- 章節 Header（標題、所屬階段、閱讀時間）
- Markdown → HTML 渲染（build time），自訂元件：Callout、CodeBlock、Table（手機橫向滾動）
- 章節 Footer：上一章 / 下一章 / 對應 checklist 群組

**右欄**（RightUtilityPanel）：
- 頁內目錄（`useActiveHeading` + IntersectionObserver 同步高亮）
- 閱讀進度環
- 「切到速讀版」/「開啟對應清單」快捷連結
- 閱讀偏好（字級/行高/專注模式）→ Phase 3 實作

**回收 index.jsx**：ArticleContent 的編輯式視覺結構（編號標題、callout 樣式）、右側 TOC 結構。

### Task 2.3：速讀大綱頁 `/outline` ✅

- 頂部流程條（所有節次進度指示器）
- 每節一張卡片：標題 + 摘要 + 3-5 個重點 + 展開/收合 + 跳到完整版連結
- 視覺節奏要比 Guide 更快、更高對比

**回收 index.jsx**：summary 模式的左邊框卡片設計。

### Task 2.4：互動清單頁 `/checklist`（關鍵路徑） ✅

**頂部摘要**：總完成度、已完成/未完成數、最近更新群組

**篩選器**：全部 / 未完成 / 已完成 / 依群組篩選

**清單主體**：18 組（A-R），每組含：
- 群組標題 + 說明 + 小計進度條
- 展開/收合
- 項目清單（checkbox 觸控區域 ≥44px）
- 每項可跳回對應 Guide 章節

**狀態管理**（`useChecklistState`）：
- localStorage key `checklist-progress`
- 資料結構：`{ checkedItemIds: string[], lastUpdatedAt: string }`
- 提供 `toggleItem()`, `clearGroup()`, `getGroupProgress()`

**回收 index.jsx**：ChecklistBoard 的 checkbox 樣式和進度條。

### Task 2.5：比較模式 `/compare` ✅

- 左窗格：可切換 Guide section / Outline section
- 右窗格：對應 checklist 群組
- 同步定位按鈕
- 桌機完整體驗，平板堆疊切換，手機導向個別頁面

**回收 index.jsx**：compare 模式的 60/40 分割佈局。

**Phase 2 驗證**：
- 17 個核心 Guide section 全部正確渲染（排版品質）
- 14 個核心 Outline section 顯示為可展開卡片
- 18 組 148 個 checklist task item 完整顯示
- Checkbox 狀態跨頁面刷新持久化（localStorage）
- Active heading 同步運作
- 上一章/下一章導航正確
- Deep link `/guide/[slug]#heading-slug` 可用

---

## Phase 3：搜尋、進度追蹤、閱讀偏好

### Task 3.1：搜尋 / Command Palette ✅

- Cmd+K / Ctrl+K 開啟
- 搜尋範圍：章節標題、摘要、checklist 項目、outline 重點
- 結果依類型分組
- **實作**：build time 建立 JSON 搜尋索引，client-side 用 `flexsearch` 或 `minisearch`，但要先驗證中文搜尋品質；若預設 tokenizer 不夠，改採字元 n-gram 預處理或提前接後端搜尋 API

### Task 3.2：閱讀進度系統 ✅

`useReadingProgress` hook：
- 資料結構（對齊 api-spec-draft.md）：
  ```typescript
  { subjectType: 'guideSection' | 'outlineSection',
    subjectSlug: string,
    scrollPercent: number,    // scroll debounce 2s 更新
    isCompleted: boolean,     // 滾動超過 90% 設為 true
    lastReadAt: string }      // ISO 8601
  ```
- localStorage key `reading-progress`
- 餵入：首頁繼續學習、左導航已讀標記、StageRoadmap 狀態、Guide 總覽頁

### Task 3.3：閱讀偏好 ✅

字級（14/16/18/20px）、行高（1.6/1.75/1.9/2.0）、專注模式（收合左右欄）。localStorage key `reading-preferences`。

### Task 3.4：Data Adapter Layer ✅

建立 View Model 類型對齊 API 規格（`GuideSectionVM`, `OutlineSectionVM`, `ChecklistGroupVM`, `ReadingProgressVM`, `ChecklistStateVM`），確保未來接後端只需換資料源，不改元件。

**Phase 3 驗證**：
- Cmd+K 開啟搜尋，中文查詢返回相關結果
- 閱讀進度持久化且首頁正確顯示
- 字級/行高 即時套用
- 專注模式隱藏側欄

---

## Phase 4：可及性、響應式、視覺精修

### Task 4.1：鍵盤導航 ✅
- Tab 可達所有互動元素
- Enter/Space 啟動按鈕和 checkbox
- Escape 關閉 modal / drawer / 搜尋
- 焦點環使用 `--accent-primary`

### Task 4.2：ARIA 與語義 HTML ✅
- Landmarks：`<nav>`, `<main>`, `<aside>`, `<header>`
- 模式切換：`role="tablist"` + `role="tab"`
- 進度環：`role="progressbar"` + `aria-valuenow`
- 所有 icon button：`aria-label`

### Task 4.3：手機優化 ✅
- 底部欄（回收 index.jsx 原型）
- Checklist 抽屜（回收 index.jsx 原型）
- 左導航抽屜 + 遮罩
- Sticky filter chips
- 觸控目標 ≥44px
- `@media (hover: hover)` 隔離 hover 效果

### Task 4.4：排版與視覺精修 ✅
- 內容最大寬度 820-860px
- H2/H3 間距 > 段落間距
- 長文每 3-5 段有節奏變化（callout / table / divider）
- 卡片圓角 16-20px（主要）/ 12px（次要）
- 微動效：卡片 stagger 60-90ms、進度條 180-220ms

### Task 4.5：效能 ✅
- 所有內容頁 SSG 靜態生成
- 搜尋索引 lazy load（搜尋開啟時才載入）
- Tailwind purge 未使用樣式
- 目標：Lighthouse 全項 >90

**Phase 4 驗證**：
- Tab 遍歷全站無卡住
- 螢幕閱讀器正確報讀頁面結構
- 320px 寬度裝置佈局正常
- WCAG 2.2 AA 對比度全通過
- Lighthouse accessibility ≥95

---

## Phase 5：後端基礎（FastAPI + PostgreSQL）

> **可與前端 Phase 2-4 並行開發**，雙方依據 `api-spec-draft.md` 作為契約。

### Task 5.1：後端專案結構 ✅

```
backend/
├── docker-compose.yml          # PostgreSQL + Redis + API
├── pyproject.toml
├── Dockerfile
├── alembic/                    # Database migrations
├── app/
│   ├── main.py                 # FastAPI app factory
│   ├── config.py               # Pydantic settings
│   ├── dependencies.py         # DI（db session, visitor key 解析）
│   ├── middleware/              # request_id.py, rate_limit.py
│   ├── models/                 # SQLAlchemy 2.0 async models（13 張表）
│   ├── schemas/                # Pydantic v2 request/response schemas
│   ├── routers/                # content.py, progress.py, checklist_state.py, search.py, events.py, system.py
│   ├── services/               # content_service, progress_service, search_service, event_service, sync_service
│   └── scripts/seed_content.py # Markdown → DB 匯入
```

**技術：** Python 3.12+，FastAPI / SQLAlchemy / Pydantic 依開工時穩定版鎖定，Alembic、PostgreSQL 15+（pgcrypto + pg_trgm + citext）、Redis 7+

### Task 5.2：資料庫 Migration ✅

依 `db-schema-draft.md` 順序建立 13 張表：
1. Extensions + Enums
2. `documents` → `document_sections` → `outline_sections`
3. `checklist_groups` → `checklist_items`
4. `users` → `visitor_sessions`
5. `reading_progress` → `checklist_item_states`（含 dual-principal CHECK constraint）
6. `search_documents`（pg_trgm GIN 索引）
7. `event_ingest_logs`
8. `bookmarks` + `daily_metrics`（Phase 2 預留空表）

### Task 5.3：內容匯入腳本 ✅

`seed_content.py`：讀 content/ 下三份 Markdown → 解析 → upsert content tables → 重建 `search_documents`。

### Task 5.4：內容 API（5 個唯讀端點） ✅

| 方法 | 路徑 | 用途 |
|---|---|---|
| GET | `/api/v1/content/navigation` | 導航樹 + 階段地圖 |
| GET | `/api/v1/content/guide` | 指南總覽 + 章節列表 |
| GET | `/api/v1/content/guide/{sectionSlug}` | 單章節（body + headings + prev/next）|
| GET | `/api/v1/content/outline` | 速讀大綱 |
| GET | `/api/v1/content/checklist` | 清單群組 + 項目 |

Cache headers：`Cache-Control: public, max-age=3600`, `ETag`。

### Task 5.5：系統端點 ✅

- `GET /api/v1/system/health` — DB + Redis 連接檢查
- `GET /api/v1/system/version` — API 版本 + 內容版本 + git SHA

### Task 5.6：Docker Compose ✅

PostgreSQL 15 + Redis 7 + API server，一鍵 `docker compose up`。

**Phase 5 驗證**：
- `docker compose up` 啟動成功
- `GET /api/v1/system/health` → `{"data":{"status":"ok"}}`
- `GET /api/v1/content/navigation` → 17 個章節
- `GET /api/v1/content/guide/mindset` → 第一章完整內容
- `GET /api/v1/content/checklist` → 18 組 ~148 項

---

## Phase 6：狀態同步 API + 前後端整合

### Task 6.1：Progress Sync ✅

- `GET /api/v1/me/progress` — 取得當前 visitor 的所有進度
- `PUT /api/v1/me/progress` — 批次 upsert

身分識別（MVP）：`X-Visitor-Key` header，前端首次造訪產生 UUID 存 localStorage。
Upsert 邏輯：`ON CONFLICT ... DO UPDATE`，只在 incoming `lastReadAt` 較新時更新。

### Task 6.2：Checklist State Sync ✅

- `GET /api/v1/me/checklist` — 取得所有勾選狀態
- `PUT /api/v1/me/checklist` — 批次 upsert

### Task 6.3：搜尋端點 ✅

`GET /api/v1/search?q=...&types=...&limit=...`
MVP 先用 `pg_trgm`（字元 trigram，對中文可用但品質有限）。

### Task 6.4：事件接收端點 ✅

`POST /api/v1/events/batch`（最多 50 筆），快速寫入 `event_ingest_logs`。

### Task 6.5：前端 SyncManager ✅

```typescript
// src/lib/data/sync-manager.ts
// 根據 NEXT_PUBLIC_API_BASE_URL 是否設定決定模式
class SyncManager {
  mode: 'local' | 'api-sync';

  async getProgress() {
    if (this.mode === 'local') return localStore.getProgress();
    const [local, remote] = await Promise.all([localStore.getProgress(), api.getProgress()]);
    return mergeByTimestamp(local, remote); // local 較新的 win
  }

  async saveProgress(record) {
    localStore.saveProgress(record);          // 永遠先寫 local
    if (this.mode === 'api-sync')
      api.upsertProgress([record]).catch(queueForRetry);
  }
}
```

後端不可用時自動 fallback 到 local-only。

### Task 6.6：OpenAPI Client 生成 ✅

用 `openapi-typescript-codegen` 或 `orval` 從 FastAPI OpenAPI spec 生成 TypeScript client。

**Phase 6 驗證**：
- 裝置 A 閱讀 → 裝置 B 看到進度（同 visitor key）
- Checklist 同理
- 搜尋 API 返回中文相關結果
- 後端不可用時前端 graceful fallback

---

## Phase 7：分析、安全、部署

### Task 7.1：前端事件追蹤

批次發送（10 秒或 20 筆先到先 flush）：
`page_view`, `mode_switch`, `section_open`, `checklist_item_checked`, `search_performed`

### Task 7.2：後端安全

- Rate limit：search 30/min, events 10/min, sync 60/min
- Request ID middleware
- 結構化 JSON 日誌

### Task 7.3：部署

- 前端：Next.js static export → Vercel / Cloudflare Pages
- 後端：Docker container → Railway / Fly.io
- 環境：local / staging / production
- Migration 在 pre-deploy 步驟執行

---

## 並行開發策略

```
Phase 0 (腳手架) ────────────────────────────────────────────┐
  └─→ Phase 1 (骨架+首頁) ──────────────────────────────────┤
       └─→ Phase 2 (內容頁) ──────────── ┐                  │
            └─→ Phase 3 (搜尋+進度)      │                  │
                 └─→ Phase 4 (精修)      │                  │
                                          │                  │
Phase 5 (後端) ────── 可與 Phase 2-4 並行 ┘                  │
  └─→ Phase 6 (前後端整合) ── 需要 Phase 4 + Phase 5 完成 ──┤
       └─→ Phase 7 (部署)                                   │
```

**關鍵並行點**：後端 Phase 5 可在前端 Phase 2 開始後立即啟動，雙方透過 `api-spec-draft.md` 的 13 個端點定義作為契約，互不阻塞。

---

## 風險與緩解

| 風險 | 影響 | 緩解 |
|---|---|---|
| 中文 slug 對照不一致 | 高 — 路由和交叉引用中斷 | 手動 slug map + CI 驗證腳本 |
| Markdown 結構變動導致解析壞掉 | 中 | content validation 腳本 + parser 容錯處理 |
| 文件搬遷後相對連結失效 | 中 | 搬檔與 link repair 同輪完成，並加 Markdown link check |
| localStorage 被清除 | 低 — 預期行為 | 提示訊息 + 後端同步作為升級路徑 |
| pg_trgm 中文搜尋品質不足 | 中 | 未來可換 Meilisearch（API 不變）|
| 平板三欄佈局尷尬 | 中 | 優先設計 graceful degradation |

---

## 關鍵參考文件

| 文件 | 用途 |
|---|---|
| `design.md` | 前端規格權威來源：佈局、元件、token、斷點、驗收標準 |
| `api-spec-draft.md` | 前後端整合契約：13 端點 + request/response 範例 |
| `db-schema-draft.md` | 13 張表 DDL + 約束 + 索引 + migration 順序 |
| `backend-design.md` | 後端架構決策：模組、Phase 分階、技術選型 |
| `study.md` | 主要內容源（17 章），決定整個導航和路由結構 |
| `index.jsx` | 原型（594 行），提供可回收的視覺模式 |
