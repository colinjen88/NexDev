# AI 開發指南（/ai-guide）整合實作記錄

## 專案狀態摘要
已成功將 `modern-web-dev-guide-v3.md` 整合為 `/ai-guide` 獨立頁面區塊，並與現有教學工作台深度對接。經過完整程式碼審查與修正，目前狀態為生產就緒。

---

## 實作清單與進度

### Phase 1: 資料與解析層 (Data Layer) - [COMPLETED]
- [x] 移動指南檔案：`modern-web-dev-guide-v3.md` → `content/ai-guide.md`
- [x] 型別定義（`src/lib/content/types.ts`）：
    - `AiGuideSection` interface，包含 `relatedStandardGuideSlugs`（指向標準指南）
    - `GuideSection` 含 `relatedAiGuideSlugs`（指向 AI 指南）
    - 欄位命名設計：各自從自身視角描述對方，自帶方向性
- [x] 解析器（`src/lib/content/parser.ts`）：
    - `parseAiGuideSections()`：H2 分割、H3 TOC 抽取、閱讀時間估算
    - `AI_GUIDE_SLUG_MAP`：繁中標題 → slug 映射
    - `AI_GUIDE_CROSS_REF_MAP`：AI 指南 slug → 標準指南 slugs
    - `GUIDE_TO_AI_CROSS_REF_MAP`：標準指南 slug → AI 指南 slugs（命名反映資料流方向）
    - `AI_GUIDE_KNOWN_SKIP`：已知非章節 H2（如 `目錄`），不觸發 build 警告
    - Build 時對未登錄的 H2 發出 `console.warn`
- [x] 靜態載入器（`src/lib/content/ai-guide-loader.ts`）：記憶體 singleton 快取

### Phase 2: 路由與頁面元件 (Routes & Components) - [COMPLETED]
- [x] 總覽頁 `app/ai-guide/page.tsx`
- [x] 章節頁 `app/ai-guide/[slug]/page.tsx`：
    - 麵包屑導航（AI 驅動開發指南 > Chapter XX）
    - 交叉引用顯示真實標題（非 slug 字串）
- [x] 清單元件 `components/ai-guide/AiGuideList.tsx`：
    - `isLoaded` 保護，防止已讀狀態閃爍
    - 概覽頁頂部進度條（已讀 X/N 章節）

### Phase 3: 版面與導航 (Layout & Navigation) - [COMPLETED]
- [x] `AppShell.tsx`：`isAiGuideRoute` 路徑感知，動態切換側邊欄目錄
- [x] 手機底部欄：5 入口（指南 / AI 指南 / 大綱 / 清單 / 工具）
- [x] `ModeCards.tsx`：首頁 4 欄卡片，含 AI 指南入口

### Phase 4: 標準指南對稱更新 - [COMPLETED]
- [x] `app/guide/[slug]/page.tsx`：
    - 麵包屑導航（標準開發指南 > Chapter XX）
    - 交叉引用顯示 AI 指南真實標題（非 slug 字串）
    - Badge 統一使用 `chapterLabel` 變數（消除重複運算）
- [x] `components/guide/GuideList.tsx`：
    - 概覽頁頂部進度條（已讀 X/N 章節，綠色主題 `accent-primary`）

### Phase 5: 搜尋整合 - [COMPLETED]
- [x] `api/search-index/route.ts`：AI 指南章節與 H3 標題納入 Cmd+K 搜尋索引

---

## 驗證紀錄
- **Build**：`npm run build` 通過，40 條 SSG 路徑全數預渲染，零型別錯誤
- **Build 噪音**：已知非章節 H2（`目錄`）不再觸發 `console.warn`；真正未登錄的 H2 仍會警告
- **進度追蹤**：標準指南使用 `slug`，AI 指南使用 `ai-{slug}` 作為 localStorage key，無衝突

---

## 視覺規範

| 項目 | 標準指南 | AI 驅動開發指南 |
|------|---------|----------------|
| 主色 | `accent-primary`（綠） | `accent-info`（藍） |
| 圖示 | `BookOpen` | `Sparkles` |
| 進度條 | 綠色 | 藍色 |
| 路徑前綴 | `/guide/` | `/ai-guide/` |
| localStorage key | `{slug}` | `ai-{slug}` |
