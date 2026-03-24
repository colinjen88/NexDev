# 給 Gemini Pro 的後端架構 / API / 資料設計提示詞

用途：

- 這是一份臨時提示詞檔，專門用來交給 Gemini Pro 協助規劃後端架構、API、資料模型、同步策略與實作路線
- 重點是產出後端設計方案、接口與資料結構，不是直接生成一大包未驗證程式碼

對應文件：

- [backend-design.md](./backend-design.md)
- [api-spec-draft.md](./api-spec-draft.md)
- [db-schema-draft.md](./db-schema-draft.md)
- [design.md](./design.md)
- [study.md](./study.md)

---

## 主提示詞

```text
你是一位資深後端架構師與 API 設計師。請幫我為一個「學習型知識工作台」網站規劃後端架構、API、資料模型與同步策略。

這個產品不是一般 CMS，也不是高併發交易系統，而是一個幫助使用者學習網站開發流程的內容型產品。前端已規劃成三種主要模式：
1. 完整指南閱讀模式
2. 速讀大綱模式
3. 實作檢查清單模式

網站核心需求是：
- 讀取完整內容
- 讀取速讀大綱
- 讀取 checklist
- 支援閱讀進度同步
- 支援 checklist 狀態同步
- 支援搜尋
- 支援基礎事件追蹤

目前內容來源來自 Markdown 文件，但希望後端提供對前端友善的 API 與穩定資料結構。

請根據以下要求設計後端。

一、產品定位
- 這是一個內容驅動的學習網站
- 前端體驗比複雜後端商業邏輯更重要
- 後端重點是內容、同步、搜尋、分析與前後端協作
- 第一版避免過度設計

二、架構要求
- 優先採 modular monolith
- 建議技術可使用 FastAPI + PostgreSQL + Redis
- 預留 background worker 處理搜尋索引與事件聚合
- 透過 OpenAPI 做前後端契約
- 不要一開始就拆微服務

三、請規劃的模組
- content
- outline
- checklist
- progress
- checklist_state
- search
- analytics
- auth
- system

四、請解決的核心問題
- Markdown 內容如何轉成前端好用的 JSON
- guide / outline / checklist 三種模式如何對齊資料模型
- 匿名 visitor 與未來 user 如何共存
- 閱讀進度與 checklist 狀態如何 local-first 再 sync
- 中文內容搜尋 MVP 如何處理
- 前端如何依賴穩定欄位而不綁死內部 DB 結構

五、API 設計要求
- 路由基線使用 `/api/v1`
- 請設計以下 endpoint：
  - `GET /content/navigation`
  - `GET /content/guide`
  - `GET /content/guide/{sectionSlug}`
  - `GET /content/outline`
  - `GET /content/checklist`
  - `GET /me/progress`
  - `PUT /me/progress`
  - `GET /me/checklist`
  - `PUT /me/checklist`
  - `GET /search`
  - `POST /events/batch`
  - `GET /system/health`
  - `GET /system/version`
- 成功與錯誤回應使用統一 envelope
- 時間格式使用 ISO 8601
- JSON 欄位使用 camelCase

六、資料模型要求
- 請設計這些核心表或等效模型：
  - documents
  - document_sections
  - outline_sections
  - checklist_groups
  - checklist_items
  - visitor_sessions
  - users
  - reading_progress
  - checklist_item_states
  - search_documents
  - event_ingest_logs
- 請考慮 unique key、索引、同步 upsert 與 visitor/user principal 約束

七、同步策略要求
- 前端先 local-first
- 後端同步是增益，不是阻塞
- progress 與 checklist state 應支援 idempotent upsert
- visitor 升級成 user 時，請規劃資料合併策略

八、搜尋要求
- 內容主要是中文
- 請不要直接假設英文式全文搜尋預設可用
- MVP 可優先用 PostgreSQL trigram 或輕量策略
- 若認為更適合，請說明何時該升級到 Meilisearch

九、安全與觀測性要求
- rate limit
- request id
- 結構化日誌
- health check
- 基本 metrics
- 若未登入，使用 visitor key 或等效識別

十、請輸出內容
- 系統架構圖或模組說明
- API endpoint 設計與 request/response 範例
- 資料表草案
- 索引與 constraint 建議
- visitor / user 合併流程
- 搜尋與事件資料流
- MVP 與 Phase 2 演進路線
- 風險與建議

十一、請避免
- 過早微服務化
- 設計現在根本用不到的複雜權限系統
- 把所有同步變成強即時阻塞操作
- 讓前端直接依賴 raw markdown 結構
- 給出抽象空話而沒有欄位、接口、流程細節

十二、最終結果應該長這樣
- 可以讓前端快速開始串接
- 可以從 MVP 穩定演進
- 可以支援 local-first + api-sync
- 對內容型產品真的實用
```

---

## 精簡版提示詞

適合快速丟給 Gemini Pro 拿第一輪架構方案時使用。

```text
請幫我設計一個內容型學習網站的後端架構。

這個網站有三種前端模式：
1. 完整指南
2. 速讀大綱
3. 實作 checklist

需要的後端能力：
- 內容 API
- progress 同步
- checklist state 同步
- 搜尋
- events ingest

請以 modular monolith 為主，建議 FastAPI + PostgreSQL + Redis，並規劃：
- 模組切分
- API endpoint
- 資料表
- visitor / user 模式
- local-first + sync 策略
- 中文搜尋 MVP 做法

不要過早微服務化，也不要只講抽象概念。請給可落地的接口、欄位與資料流。
```

---

## API 對焦版提示詞

如果你想專門叫 Gemini Pro 幫你精修 API，可用下面這版。

```text
請專注設計這個學習型內容網站的 REST API。

請針對以下 endpoint 提供：
- path
- method
- query params
- path params
- request body
- response body
- error codes
- idempotency 規則

endpoint：
- GET /api/v1/content/navigation
- GET /api/v1/content/guide
- GET /api/v1/content/guide/{sectionSlug}
- GET /api/v1/content/outline
- GET /api/v1/content/checklist
- GET /api/v1/me/progress
- PUT /api/v1/me/progress
- GET /api/v1/me/checklist
- PUT /api/v1/me/checklist
- GET /api/v1/search
- POST /api/v1/events/batch
- GET /api/v1/system/health
- GET /api/v1/system/version

請注意：
- JSON 使用 camelCase
- 回應有統一 envelope
- 內容是中文，搜尋 API 要考慮中文搜尋現實
- 前端會用 local-first，再做 API sync
```

---

## 資料庫對焦版提示詞

如果你想專門叫 Gemini Pro 幫你精修 DB schema，可用下面這版。

```text
請專注設計一個內容型學習網站的 PostgreSQL schema。

核心需求：
- guide / outline / checklist 三種內容模式
- visitor 與 user 共存
- reading progress sync
- checklist state sync
- search index
- event ingest

請輸出：
- 資料表列表
- 欄位設計
- PK / FK / unique / check constraints
- 索引策略
- upsert 關鍵
- migration 順序
- 中文搜尋 MVP 的資料層處理方式

請至少涵蓋：
- documents
- document_sections
- outline_sections
- checklist_groups
- checklist_items
- visitor_sessions
- users
- reading_progress
- checklist_item_states
- search_documents
- event_ingest_logs

請不要只給概念，要給偏實作的 schema 初稿。
```

---

## 實作路線版提示詞

如果你要 Gemini Pro 幫你排「後端先做什麼」，可用下面這版。

```text
請幫我把這個學習型內容網站的後端拆成一個合理的實作順序。

已知需求：
- 前端先 local-first
- 後端逐步補 sync / search / analytics
- MVP 重點是前後端協作順暢

請列出：
1. 第一週該先做哪些模組
2. 哪些 API 可以先 stub
3. 哪些資料表要先建
4. 哪些功能應延後
5. 哪些地方最容易過度設計
6. 如何讓前端先跑、後端再穩定接上
```

---

## 使用建議

建議你這樣用：

1. 先用「精簡版提示詞」拿第一輪後端方向
2. 再用「主提示詞」拿完整方案
3. 想細化 API 時，用「API 對焦版提示詞」
4. 想細化 DB 時，用「資料庫對焦版提示詞」
5. 想排開發順序時，用「實作路線版提示詞」

---

## 補充提醒

交給 Gemini Pro 前，可以附帶這句：

```text
請優先給「可協同開發、可逐步落地、適合 MVP 演進」的方案，而不是理論上很完整但過重的企業級設計。
```
