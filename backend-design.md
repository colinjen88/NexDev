# 學習型內容網站後端架構設計與開發提示詞

對應前端與內容文件：

- [design.md](./design.md)
- [api-spec-draft.md](./api-spec-draft.md)
- [db-schema-draft.md](./db-schema-draft.md)
- [to-gemini-backend.md](./to-gemini-backend.md)
- [study.md](./study.md)
- [study-quick-outline.md](./study-quick-outline.md)
- [study-implementation-checklist.md](./study-implementation-checklist.md)

本文件目標：

- 為這個學習型內容網站設計合適、實用、可演進的後端方案
- 明確定義後端職責、模組邊界、資料模型、接口契約與採用技術
- 提供可直接交給後端工程師或 AI coding assistant 的完整提示詞
- 與 `design.md` 的前端規劃對齊，便於協同開發

配套文件：

- `api-spec-draft.md`：接口與 OpenAPI 草案
- `db-schema-draft.md`：PostgreSQL schema 初稿與 migration 討論基線

這次只做後端設計與提示詞，不進行開發。

---

## 1. 後端定位：先避免過度設計

### 1.1 這個產品第一性原則

這個網站本質上是：

- 內容驅動的學習產品
- 閱讀、速讀、清單三模式切換的知識工具
- 前端體驗比複雜交易邏輯更重要

所以後端設計的正確姿勢不是一開始就重系統，而是：

- 第一版先讓前端能順利運作
- 後端只承擔真正需要伺服器的能力
- 先採用**模組化單體（modular monolith）**
- 以 API 合約清楚、資料邊界清楚、可演進為主

### 1.2 什麼能力真的需要後端

這個產品如果只是純靜態閱讀，其實可以先不需要後端。

但一旦你想要下面這些能力，後端就開始有價值：

- 跨裝置同步閱讀進度
- 跨裝置同步 checklist 勾選狀態
- 搜尋索引與進階搜尋
- 使用者書籤、收藏、筆記
- 事件追蹤與產品分析
- 後台管理與內容版本化
- 對外分享與協作

### 1.3 後端建議採分階段設計

| 階段 | 後端形態 | 目標 |
|---|---|---|
| Phase 0 | 無後端或極薄 API | 先把內容網站與本地進度跑起來 |
| Phase 1 | 模組化單體後端 | 支援同步、搜尋、事件與基礎管理 |
| Phase 2 | 擴充式後端 | 補進階搜尋、背景工作、管理端、觀測性強化 |

---

## 2. 後端職責範圍

### 2.1 後端應負責

- 提供穩定的內容接口
- 提供進度同步接口
- 提供 checklist 狀態同步接口
- 提供搜尋接口
- 提供事件接收接口
- 提供內容與版本元資料
- 提供系統健康檢查與觀測性

### 2.2 後端不必一開始就負責

- 即時通訊
- 複雜社交系統
- 高度即時協作編輯
- 多角色權限後台
- 大規模分散式服務拆分

---

## 3. 建議後端架構策略

### 3.1 第一版建議：模組化單體

第一版最實用的架構：

- 一個 API 服務
- 一個 PostgreSQL
- 一個 Redis
- 一個背景工作處理器
- 一組內容檔案來源或內容同步流程

理由：

- 邊界清楚但不過度拆分
- 好維護、好部署、好除錯
- 足以支撐學習產品的內容、進度、搜尋與分析

### 3.2 模組邊界

建議拆成以下模組：

| 模組 | 職責 |
|---|---|
| `content` | 內容讀取、版本、文件樹、章節資訊 |
| `outline` | 速讀大綱資料提供 |
| `checklist` | 清單結構與項目定義 |
| `progress` | 閱讀進度與已讀狀態同步 |
| `checklist_state` | 使用者勾選狀態同步 |
| `search` | 搜尋索引與查詢 |
| `analytics` | 事件接收與基礎聚合 |
| `auth` | 可選登入與 session 管理 |
| `system` | 健康檢查、設定、版本資訊 |

### 3.3 內容來源策略

建議把內容系統分成兩層：

- **內容真實來源**：Markdown 檔案（目前就是這三份文件）
- **API 輸出層**：把內容轉成前端更好用的 JSON 結構

這樣的好處：

- 文件仍可在 Git 中維護
- 前端不必自己解析過多複雜結構
- 之後若要接 CMS，也能保留 API 形狀

---

## 4. 建議採用技術

### 4.1 預設推薦技術棧

若沒有既有團隊限制，建議：

| 類型 | 推薦技術 | 理由 |
|---|---|---|
| API 框架 | FastAPI | 開發效率高、Schema 清楚、OpenAPI 友善 |
| 資料庫 | PostgreSQL | 結構化資料、查詢能力強、可先用全文搜尋 |
| 快取 / queue | Redis | 可支援快取、rate limit、背景工作、暫存 |
| 背景工作 | Celery 或 Dramatiq | 處理事件聚合、內容索引、非同步任務 |
| API 合約 | OpenAPI | 前後端共享接口理解，方便生成 TypeScript client |
| 搜尋 | PostgreSQL FTS 起步，之後可升級 Meilisearch | 先簡後繁，避免過度設計 |
| 部署 | Docker + reverse proxy | 本地與部署一致性較高 |

### 4.2 為什麼預設選 FastAPI

- 很適合內容型與產品型 API
- OpenAPI 文件自動生成，對前後端協同很有幫助
- Pydantic schema 對接口驗證很直觀
- 對中小型產品的 API 開發節奏非常合適

### 4.3 若團隊全 TypeScript，也可考慮的替代方案

可替代為：

- NestJS + PostgreSQL + Redis + OpenAPI

如果整個團隊強烈偏好 TypeScript 全端，這會讓型別共用更自然。但若沒有這項需求，FastAPI 會更簡潔。

---

## 5. 後端階段設計

## 5.1 Phase 0：可無後端 / 極薄 API

適用情境：

- 先專注前端閱讀體驗
- 內容更新量不大
- 進度與 checklist 狀態先存在 localStorage

此階段：

- 前端可直接讀 Markdown
- 後端只需要 health check 或不需要

## 5.2 Phase 1：最小可用後端

建議在以下情況啟動：

- 想同步使用者進度
- 想做搜尋
- 想收事件分析
- 想做跨裝置體驗

此階段最小 API：

- 內容樹
- 單章節內容
- outline
- checklist
- progress 讀寫
- checklist state 讀寫
- search
- events batch ingest

## 5.3 Phase 2：進階能力

當使用量上升或內容與團隊變大，再補：

- 使用者登入
- 書籤與筆記
- CMS 或管理後台
- 搜尋引擎升級
- 內容發佈流程
- 更完整觀測性與告警

---

## 6. 後端資料模型規劃

### 6.1 內容層模型

若內容仍以 Markdown 為真實來源，資料庫不一定要存全文，但建議至少有以下穩定結構：

| 模型 | 關鍵欄位 |
|---|---|
| `document` | `id`, `slug`, `title`, `type`, `version`, `updated_at` |
| `document_section` | `id`, `document_id`, `slug`, `title`, `level`, `order`, `summary` |
| `outline_section` | `id`, `slug`, `title`, `summary`, `sort_order` |
| `checklist_group` | `id`, `code`, `title`, `sort_order` |
| `checklist_item` | `id`, `group_id`, `label`, `sort_order`, `related_section_slug` |

### 6.2 使用者狀態模型

| 模型 | 關鍵欄位 |
|---|---|
| `user` | `id`, `email`, `status`, `created_at` |
| `visitor_session` | `id`, `visitor_key`, `created_at`, `last_seen_at` |
| `reading_progress` | `id`, `subject_type`, `subject_id`, `user_id or visitor_session_id`, `scroll_percent`, `is_completed`, `last_read_at` |
| `checklist_item_state` | `id`, `item_id`, `user_id or visitor_session_id`, `is_checked`, `checked_at` |
| `bookmark` | `id`, `user_id`, `section_slug`, `note`, `created_at` |

### 6.3 事件模型

| 模型 | 關鍵欄位 |
|---|---|
| `event_ingest_log` | `id`, `event_name`, `user_id`, `visitor_session_id`, `payload`, `created_at` |
| `daily_metrics` | `date`, `metric_key`, `metric_value` |

### 6.4 ID 設計原則

前後端協作時務必保持：

- 章節、清單群組、清單項目都有穩定 ID
- slug 與 id 不混用
- 可顯示的標題與可程式依賴的 key 分離

這會直接影響：

- 前端路由穩定性
- checklist 勾選同步正確性
- 搜尋與分享連結可靠性

---

## 7. API 設計原則

### 7.1 基本規則

- API 一律版本化：`/api/v1`
- REST 為主，保持資源導向
- 所有時間欄位回傳 ISO 8601
- 所有列表接口要有 `meta`
- 所有錯誤回傳統一錯誤結構
- 不讓前端依賴資料庫實作細節

### 7.2 建議回應結構

成功：

```json
{
  "data": {},
  "meta": {
    "requestId": "req_123",
    "version": "v1"
  }
}
```

失敗：

```json
{
  "error": {
    "code": "SECTION_NOT_FOUND",
    "message": "Requested section does not exist.",
    "details": {}
  },
  "meta": {
    "requestId": "req_123"
  }
}
```

### 7.3 核心接口清單

| 方法 | 路徑 | 用途 |
|---|---|---|
| `GET` | `/api/v1/content/navigation` | 取得文件樹與章節導航 |
| `GET` | `/api/v1/content/guide` | 取得完整指南摘要或章節列表 |
| `GET` | `/api/v1/content/guide/{slug}` | 取得指定章節內容 |
| `GET` | `/api/v1/content/outline` | 取得速讀大綱 |
| `GET` | `/api/v1/content/checklist` | 取得 checklist 群組與項目 |
| `GET` | `/api/v1/search?q=` | 搜尋章節、標題、清單項目 |
| `GET` | `/api/v1/me/progress` | 取得目前閱讀進度 |
| `PUT` | `/api/v1/me/progress` | 更新閱讀進度 |
| `GET` | `/api/v1/me/checklist` | 取得 checklist 勾選狀態 |
| `PUT` | `/api/v1/me/checklist` | 批次更新 checklist 狀態 |
| `POST` | `/api/v1/events/batch` | 接收前端事件 |
| `GET` | `/api/v1/system/health` | 健康檢查 |
| `GET` | `/api/v1/system/version` | 版本與內容版本資訊 |

### 7.4 內容接口應回傳什麼

前端真正需要的是：

- 文件樹
- 章節層級
- 顯示標題
- slug
- 摘要
- 內容區塊
- 相鄰章節關係
- 對應 checklist 關聯

而不是：

- 混亂的原始 Markdown 行數資訊
- 只回整包純字串讓前端自己猜結構

### 7.5 progress 更新規則

建議採冪等更新：

- `PUT /api/v1/me/progress`
- body 至少包含：
  - `subjectType`
  - `subjectId or slug`
  - `scrollPercent`
  - `isCompleted`
  - `lastReadAt`

### 7.6 checklist 更新規則

建議支援批次寫入：

```json
{
  "items": [
    {
      "itemId": "checklist_item_a1",
      "isChecked": true
    }
  ]
}
```

理由：

- 前端可先 local update
- 再批次同步
- 後端可做 upsert，避免多次小請求

---

## 8. 前後端協作契約

### 8.1 前端不應直接綁死後端內部欄位

後端應提供前端友善 view model，例如：

- `title`
- `slug`
- `summary`
- `estimatedReadMinutes`
- `relatedChecklistGroupCodes`
- `nextSection`
- `prevSection`

而不是讓前端自己從資料庫結構推導。

### 8.2 前端應預留雙模式

前端建議支援：

- **local-first 模式**：沒有後端也能用
- **API-sync 模式**：有後端時自動同步進度與清單

這樣能避免：

- 前端被後端進度卡住
- MVP 過度依賴登入與資料庫

### 8.3 穩定對應欄位

這些欄位必須在前後端之間維持穩定：

- `documentSlug`
- `sectionSlug`
- `groupCode`
- `itemId`
- `updatedAt`
- `version`

### 8.4 版本與快取

建議內容接口回傳：

- `etag` 或內容版本號
- `updatedAt`
- `contentVersion`

有助於：

- 前端快取
- 差異更新
- 內容變更時的同步判斷

---

## 9. 認證與 session 策略

### 9.1 第一版建議

第一版可不做正式登入，採：

- localStorage 保存
- 或 visitor cookie/session key

### 9.2 若要跨裝置同步

建議第二階段採：

- Email magic link 或 OAuth
- 同站使用 HTTP-only session cookie

不建議：

- 把長期 JWT 放在 localStorage 當主要安全方案

### 9.3 visitor 與 user 的升級路徑

建議讓匿名訪客也能使用，再提供「登入後合併進度」能力：

- `visitor_session`
- 升級為 `user`
- 合併 `reading_progress`
- 合併 `checklist_item_state`

這會讓產品體驗更順。

---

## 10. 搜尋與內容索引

### 10.1 MVP 做法

先用：

- PostgreSQL Full-Text Search
- 或啟動時將 Markdown 解析後建立輕量索引

適用於：

- 文件量不大
- 查詢型態簡單
- 想先穩定上線

### 10.2 何時升級搜尋服務

出現下面情況再考慮 Meilisearch 或 OpenSearch：

- 文件量大幅增加
- 搜尋變成核心功能
- 需要更好的 typo tolerance
- 需要 facet/filter 與更快回應

### 10.3 搜尋結果結構

搜尋結果至少要包含：

- `type`
- `title`
- `slug`
- `matchedSnippet`
- `documentType`
- `relatedChecklistGroupCode`

---

## 11. 事件追蹤與分析

### 11.1 建議接收的前端事件

- `page_view`
- `mode_switch`
- `section_open`
- `checklist_item_checked`
- `checklist_group_completed`
- `search_performed`
- `continue_learning_clicked`

### 11.2 事件接收原則

- 前端批次送出
- 後端只做接收、驗證、排隊
- 聚合與報表在背景工作處理

### 11.3 先不要做太重的分析平台

第一版只要能回答：

- 哪些章節被讀最多
- 哪些 checklist 最常被勾
- 哪些模式切換最常用
- 使用者在哪些階段中斷

就很有價值。

---

## 12. 非功能性需求

### 12.1 效能

- 內容接口要可快取
- 搜尋接口回應要足夠快
- progress / checklist state 可接受 eventual consistency
- 不要把所有內容操作都變成即時同步阻塞 UI

### 12.2 安全

- rate limit 搜尋與事件接口
- 驗證所有輸入
- secrets 不進版控
- 若有登入，session 要安全處理
- 事件接口要防濫用

### 12.3 觀測性

- 結構化日誌
- request id
- health endpoint
- metrics
- error tracking

### 12.4 可維護性

- OpenAPI 文件自動生成
- schema 單一來源
- 模組清楚
- migration 可追蹤

---

## 13. 部署與環境規劃

### 13.1 環境

- `local`
- `staging`
- `production`

### 13.2 本地開發

- Docker Compose 跑 PostgreSQL 與 Redis
- API server 與 worker 可本地啟動
- 前端與後端分開啟動，但共享 `.env.example` 與 API base URL 規則

### 13.3 部署

建議：

- 容器化
- reverse proxy
- 明確 health check
- migration 在 release 流程中有位置
- rollback 流程清楚

---

## 14. 後端開發提示詞使用方式

下面提供兩組提示詞：

1. **完整後端主提示詞**
2. **分步開發提示詞**

建議先用主提示詞生成整體架構，再拆成 API、資料、同步、分析等多輪細化。

---

## 15. 完整後端主提示詞

```text
你是一位資深後端架構師與 API 設計師。請為一個「學習型內容網站」設計並規劃後端架構，重點是穩定、清楚、可演進、適合與前端協同開發。

這個產品的前端已規劃為一個學習型知識網站，包含三種主要模式：
1. 完整指南閱讀
2. 速讀大綱
3. 實作檢查清單

內容來源目前有三份 Markdown 文件：
- study.md
- study-quick-outline.md
- study-implementation-checklist.md

請設計後端時遵守以下原則。

一、產品定位
- 這不是高交易量金融系統
- 這是內容驅動的學習產品
- 第一優先是前後端協作清楚、資料結構穩定、接口好用
- 不要過度設計，不要一開始就拆微服務

二、架構策略
- 採 modular monolith
- 預設使用 FastAPI + PostgreSQL + Redis
- 使用 OpenAPI 做接口契約
- 預留背景工作處理事件與索引
- 內容可先來自 Markdown，再轉成前端友善的 JSON 結構

三、後端職責
- 提供內容導航與章節內容 API
- 提供 outline API
- 提供 checklist API
- 提供閱讀進度同步 API
- 提供 checklist 狀態同步 API
- 提供 search API
- 提供 analytics events ingest API
- 提供 health / version API

四、階段化要求
- Phase 0：即使沒有登入或沒有完整後端，前端仍可運作
- Phase 1：支援跨裝置同步與搜尋
- Phase 2：支援更完整管理與分析能力

五、模組拆分
- content
- outline
- checklist
- progress
- checklist_state
- search
- analytics
- auth
- system

六、資料模型要求
- 為 document、section、checklist group、checklist item 設計穩定 ID 與 slug
- 為 reading progress 與 checklist item state 設計 user / visitor 雙模式
- 考慮 visitor 升級為 user 時的資料合併
- 設計事件接收表或事件緩衝策略

七、API 契約要求
- API 使用 `/api/v1`
- 時間欄位使用 ISO 8601
- 成功與失敗回應有統一 envelope
- 內容接口回傳前端可直接用的 view model
- progress 與 checklist state 更新支援 idempotent 寫入
- checklist state 支援批次更新

八、前後端協同要求
- 提供穩定欄位：
  - documentSlug
  - sectionSlug
  - groupCode
  - itemId
  - version
  - updatedAt
- 提供 OpenAPI，可供前端生成 TypeScript client
- 不讓前端依賴資料庫內部設計

九、搜尋與分析
- MVP 搜尋先以 PostgreSQL FTS 或輕量索引實作
- 搜尋結果需帶 title、slug、snippet、type
- analytics 先做 event ingest 與簡單聚合，不要一開始做大型 BI 平台

十、認證與安全
- 第一版可支援 visitor session
- 第二版可加入 email magic link 或 OAuth
- 若有登入，偏向安全 session cookie，而不是 localStorage JWT
- 請納入 rate limit、輸入驗證、結構化日誌、request id、health check

十一、輸出內容
- 系統架構說明
- 模組邊界
- 資料模型
- API endpoint 列表
- request / response schema
- sync flow
- search strategy
- analytics flow
- deployment 與 environment 設計
- 風險與未來演進建議

十二、禁止事項
- 不要一開始就微服務化
- 不要讓前端直接依賴 raw Markdown 結構細節
- 不要設計複雜但目前用不到的權限系統
- 不要把所有進度同步設計成阻塞型即時寫入

最終結果應該是一個適合學習型產品、能和前端高品質協作、可從 MVP 穩定演進的後端設計。
```

---

## 16. 分步開發提示詞

## 16.1 提示詞 A：先做後端骨架與模組邊界

```text
請先建立這個學習型內容網站後端的模組化單體架構，不要急著寫全部細節。

目標：
- 定義 content / outline / checklist / progress / checklist_state / search / analytics / auth / system 模組
- 建立 API 路由骨架
- 建立 schema 與 service 邊界
- 建立 settings、db session、health endpoint、request id middleware

要求：
- 使用 FastAPI
- 保持模組邏輯清楚
- 不要把所有邏輯塞進單一 router
- 先明確規劃目錄結構與依賴方向
```

## 16.2 提示詞 B：先完成內容接口

```text
請專注完成 content / outline / checklist 三組內容接口設計，讓前端能先串接閱讀模式。

要求：
- 提供 navigation tree
- 提供單章節內容接口
- 提供 outline 接口
- 提供 checklist 結構接口
- 回傳前端友善的 JSON，不要只丟 raw markdown
- 每個章節、群組、項目都要有穩定 slug 或 id

請一併設計：
- schema
- view model
- 相鄰章節資訊
- 對應 checklist 關聯欄位
```

## 16.3 提示詞 C：完成 progress 與 checklist state 同步

```text
請完成閱讀進度與 checklist 狀態同步設計。

需求：
- 支援 visitor session 與 user 模式
- progress 可記錄 scrollPercent、isCompleted、lastReadAt
- checklist state 支援批次 upsert
- 接口要 idempotent
- 前端可以 local-first，再背景同步

請特別考慮：
- visitor 升級成 user 時如何合併資料
- 多次重送請求如何避免重複寫入
- 前端離線後重新同步的合理策略
```

## 16.4 提示詞 D：完成搜尋接口

```text
請為這個學習型內容網站設計 MVP 搜尋功能。

要求：
- 優先用 PostgreSQL FTS 或等效輕量方案
- 搜尋範圍包含：
  - 章節標題
  - 章節摘要
  - checklist 項目
- 搜尋結果至少回傳：
  - type
  - title
  - slug
  - snippet
  - relatedChecklistGroupCode

不要一開始就上重型搜尋基礎設施，除非有明確必要。
```

## 16.5 提示詞 E：完成 analytics 事件接收

```text
請完成學習型內容網站的事件接收接口設計。

需求：
- 接收前端批次事件
- 事件至少包含：
  - eventName
  - occurredAt
  - visitorSessionId or userId
  - page
  - payload
- 寫入事件記錄或排入背景處理
- 不要讓事件接口拖慢前端體驗

請優先支援這些事件：
- page_view
- mode_switch
- section_open
- checklist_item_checked
- search_performed
- continue_learning_clicked
```

## 16.6 提示詞 F：前後端契約與 TypeScript client

```text
請為這個後端補齊前後端協同所需的接口契約能力。

要求：
- OpenAPI 文件完整
- schema 命名清楚
- 錯誤碼明確
- 提供可生成 TypeScript client 的穩定規格
- 不要讓前端自己猜欄位用途

請特別確保下面欄位穩定：
- documentSlug
- sectionSlug
- groupCode
- itemId
- updatedAt
- version
```

## 16.7 提示詞 G：最後精修

```text
請對整個後端設計做最後精修，目標是讓它從可用提升到適合長期演進。

請全面檢查：
- 模組邊界是否清楚
- schema 是否一致
- API 是否對前端友善
- visitor 與 user 模式是否合理
- migration 與資料模型是否可維護
- health / logging / metrics / request id 是否完整
- rate limit 與輸入驗證是否到位
- search 與 analytics 是否沒有過度設計

請避免：
- 過多抽象層
- 提前微服務化
- 為不存在的複雜需求設計複雜系統
- API 看似完整但前端其實難以使用
```

---

## 17. 前端需要先知道的接口摘要

這一節是寫給 `design.md` 所對應前端規劃的後端協作摘要。

### 17.1 前端最先會用到的接口

- `GET /api/v1/content/navigation`
- `GET /api/v1/content/guide/{slug}`
- `GET /api/v1/content/outline`
- `GET /api/v1/content/checklist`
- `GET /api/v1/me/progress`
- `PUT /api/v1/me/progress`
- `GET /api/v1/me/checklist`
- `PUT /api/v1/me/checklist`
- `GET /api/v1/search?q=...`
- `POST /api/v1/events/batch`

### 17.2 前端應建立 data adapter，不直接綁 API 內部結構

前端 view model 可考慮：

- `GuideSectionVM`
- `OutlineSectionVM`
- `ChecklistGroupVM`
- `ReadingProgressVM`
- `ChecklistStateVM`

### 17.3 前端先以 local-first 為主，後端同步是增益不是阻塞

這是協同開發上最重要的原則之一：

- 前端先能單獨運作
- 後端接口加上去後，前端再自動同步
- 這樣能讓前端頁面設計與互動開發先跑起來，不會互相卡住

---

## 18. 最終一句話後端目標

把後端設計成：

**一個對前端友善、以內容與同步為核心、從 MVP 就清楚可用、之後又能平穩演進的模組化單體後端。**
