# API 規格草案版

對應文件：

- [backend-design.md](./backend-design.md)
- [design.md](./design.md)
- [db-schema-draft.md](./db-schema-draft.md)

目的：

- 提供學習型內容網站的 API 草案
- 作為前後端協作、OpenAPI 撰寫與 TypeScript client 生成的基線
- 幫助在真正開始寫後端前先把接口講清楚

版本：Draft v0.1  
更新日期：2026-03-24

---

## 1. 範圍與階段

這份草案以 **Phase 1 最小可用後端** 為主，優先涵蓋：

- 內容導航
- 完整指南章節內容
- 速讀大綱
- 實作清單
- 閱讀進度同步
- checklist 狀態同步
- 搜尋
- 事件接收
- 系統健康檢查

不在本版強制落地的內容：

- 完整會員登入
- 書籤與筆記
- 內容後台
- 角色與權限系統
- 高度即時協作

---

## 2. API 設計總原則

### 2.1 基本規則

- Base URL：`/api/v1`
- 風格：REST 為主
- 時間格式：ISO 8601
- 欄位命名：JSON 使用 `camelCase`
- 主體回應採 envelope：
  - 成功：`data` + `meta`
  - 失敗：`error` + `meta`

### 2.2 回應 envelope

成功：

```json
{
  "data": {},
  "meta": {
    "requestId": "req_01JXYZ123",
    "version": "v1",
    "servedAt": "2026-03-24T10:00:00Z"
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
    "requestId": "req_01JXYZ123",
    "version": "v1",
    "servedAt": "2026-03-24T10:00:00Z"
  }
}
```

### 2.3 身分辨識策略

本產品採 **local-first + optional sync** 策略，因此 API 要支援兩種主體：

- 匿名訪客：透過 `X-Visitor-Key`
- 已登入使用者：未來透過安全 session cookie

MVP 建議：

- 內容 API 可公開讀取
- `me/*` 狀態型 API 需帶：
  - `X-Visitor-Key`
  - 或未來的登入 cookie

### 2.4 快取原則

建議：

- `content/*`：可快取，建議回 `ETag` 與 `Cache-Control`
- `search`：短時效快取或不快取
- `me/*`：`private, no-store`
- `events/*`：不快取

### 2.5 中文內容搜尋注意事項

這個網站內容主要是中文，搜尋策略不能直接套英文內容站預設。

MVP 建議：

- 標題與短欄位：使用 PostgreSQL `pg_trgm`
- 全文關鍵段落搜尋：
  - 若資料量不大，可先用 trigram + 預處理摘要
  - 若之後搜尋品質要求提升，優先評估 Meilisearch

不建議一開始就假設 PostgreSQL 內建英文式 FTS 足以處理繁中全文內容。

---

## 3. 資源模型總覽

### 3.1 Guide Navigation

用途：

- 建立左側導航
- 首頁流程地圖
- 章節定位與閱讀順序

核心欄位：

- `documentSlug`
- `title`
- `phaseCode`
- `sectionSlug`
- `sortOrder`
- `summary`
- `estimatedReadMinutes`
- `relatedChecklistGroupCodes`

### 3.2 Guide Section

用途：

- 完整閱讀頁
- 單章節分享頁

核心欄位：

- `sectionSlug`
- `title`
- `summary`
- `bodyMarkdown`
- `headings`
- `estimatedReadMinutes`
- `prevSection`
- `nextSection`
- `relatedChecklistGroupCodes`

### 3.3 Outline Section

用途：

- 速讀模式

核心欄位：

- `sectionSlug`
- `title`
- `summary`
- `highlights`
- `relatedGuideSectionSlugs`

### 3.4 Checklist Group / Item

用途：

- 清單模式與比較模式

核心欄位：

- `groupCode`
- `title`
- `description`
- `items[]`
- `itemId`
- `itemCode`
- `label`
- `relatedSectionSlug`

### 3.5 Progress Record

用途：

- 同步閱讀進度

核心欄位：

- `subjectType`
- `subjectSlug`
- `scrollPercent`
- `isCompleted`
- `lastReadAt`

### 3.6 Checklist Item State

用途：

- 同步勾選狀態

核心欄位：

- `itemId`
- `isChecked`
- `checkedAt`

### 3.7 Search Result

用途：

- 搜尋結果列表與跳轉

核心欄位：

- `type`
- `title`
- `slug`
- `snippet`
- `documentSlug`
- `sectionSlug`
- `groupCode`

---

## 4. Endpoint 一覽

| 方法 | 路徑 | 主要用途 | MVP |
|---|---|---|---|
| `GET` | `/api/v1/content/navigation` | 取得導覽樹與章節地圖 | Yes |
| `GET` | `/api/v1/content/guide` | 取得完整指南總覽 | Yes |
| `GET` | `/api/v1/content/guide/{sectionSlug}` | 取得單章節內容 | Yes |
| `GET` | `/api/v1/content/outline` | 取得速讀大綱 | Yes |
| `GET` | `/api/v1/content/checklist` | 取得 checklist 結構 | Yes |
| `GET` | `/api/v1/me/progress` | 取得目前主體的閱讀進度 | Yes |
| `PUT` | `/api/v1/me/progress` | 批次 upsert 閱讀進度 | Yes |
| `GET` | `/api/v1/me/checklist` | 取得目前主體的清單狀態 | Yes |
| `PUT` | `/api/v1/me/checklist` | 批次 upsert 清單勾選狀態 | Yes |
| `GET` | `/api/v1/search` | 搜尋 | Yes |
| `POST` | `/api/v1/events/batch` | 批次接收前端事件 | Yes |
| `GET` | `/api/v1/system/health` | 健康檢查 | Yes |
| `GET` | `/api/v1/system/version` | 服務與內容版本資訊 | Yes |

保留未來擴充：

- `POST /api/v1/auth/magic-link`
- `POST /api/v1/auth/logout`
- `GET /api/v1/me/bookmarks`
- `POST /api/v1/me/bookmarks`

---

## 5. Endpoint 明細

## 5.1 `GET /api/v1/content/navigation`

用途：

- 提供首頁流程地圖
- 提供 guide 左欄導航
- 提供章節與 checklist 關聯

Query：

- `includeCounts`：`boolean`，預設 `false`

Response：

```json
{
  "data": {
    "document": {
      "documentSlug": "guide",
      "title": "標準且符合業界實務的網站開發流程學習指南",
      "contentVersion": "2026-03-24",
      "updatedAt": "2026-03-24T00:00:00Z"
    },
    "phases": [
      {
        "phaseCode": "phase-0",
        "title": "問題定義與需求發現",
        "sortOrder": 0,
        "estimatedReadMinutes": 8,
        "sectionSlugs": ["problem-definition"]
      }
    ],
    "sections": [
      {
        "sectionSlug": "problem-definition",
        "title": "第 0 階段：問題定義與需求發現",
        "summary": "開始之前先釐清使用者、問題與成功指標。",
        "sortOrder": 3,
        "phaseCode": "phase-0",
        "estimatedReadMinutes": 8,
        "relatedChecklistGroupCodes": ["A", "B"]
      }
    ]
  },
  "meta": {
    "requestId": "req_123",
    "version": "v1",
    "servedAt": "2026-03-24T10:00:00Z"
  }
}
```

注意：

- `sectionSlug` 必須穩定
- `relatedChecklistGroupCodes` 供前端建立快捷入口

## 5.2 `GET /api/v1/content/guide`

用途：

- 取得 guide 頁的總覽資料
- 提供章節列表、引言、推薦閱讀路徑

Response：

```json
{
  "data": {
    "documentSlug": "guide",
    "title": "標準且符合業界實務的網站開發流程學習指南",
    "subtitle": "從 MVP 到規模化，AI 時代版",
    "updatedAt": "2026-03-24T00:00:00Z",
    "contentVersion": "2026-03-24",
    "introMarkdown": "這不是一份只教你怎麼把網站做出來的筆記...",
    "sections": [
      {
        "sectionSlug": "mindset",
        "title": "先建立正確觀念",
        "summary": "建立產品、設計、工程、營運四條線的整體觀。",
        "sortOrder": 1,
        "estimatedReadMinutes": 6
      }
    ]
  },
  "meta": {
    "requestId": "req_123",
    "version": "v1",
    "servedAt": "2026-03-24T10:00:00Z"
  }
}
```

## 5.3 `GET /api/v1/content/guide/{sectionSlug}`

用途：

- guide 單章節內容

Path Params：

- `sectionSlug`：必填

Response：

```json
{
  "data": {
    "documentSlug": "guide",
    "sectionSlug": "mindset",
    "title": "先建立正確觀念",
    "summary": "在動手做網站前，先釐清完整業界開發思維。",
    "phaseCode": "phase-0",
    "estimatedReadMinutes": 6,
    "updatedAt": "2026-03-24T00:00:00Z",
    "bodyMarkdown": "## 1. 先建立正確觀念 ...",
    "headings": [
      {
        "id": "網站開發不是把頁面做出來而已",
        "title": "網站開發不是把頁面做出來而已",
        "level": 3
      }
    ],
    "relatedChecklistGroupCodes": ["A"],
    "prevSection": null,
    "nextSection": {
      "sectionSlug": "workflow-overview",
      "title": "網站開發的標準流程總覽"
    }
  },
  "meta": {
    "requestId": "req_123",
    "version": "v1",
    "servedAt": "2026-03-24T10:00:00Z"
  }
}
```

錯誤：

- `SECTION_NOT_FOUND`

## 5.4 `GET /api/v1/content/outline`

用途：

- 速讀模式摘要卡

Response：

```json
{
  "data": {
    "documentSlug": "outline",
    "title": "網站開發流程學習指南：速讀版大綱",
    "updatedAt": "2026-03-24T00:00:00Z",
    "sections": [
      {
        "sectionSlug": "outline-mindset",
        "title": "先建立正確觀念",
        "summary": "掌握網站開發不是只做頁面，而是產品、設計、工程、營運四線協同。",
        "highlights": [
          "MVP 是最小可驗證價值",
          "AI 是放大器，不是自動正確機器",
          "先把最重要的一條流程做對"
        ],
        "relatedGuideSectionSlugs": ["mindset"]
      }
    ]
  },
  "meta": {
    "requestId": "req_123",
    "version": "v1",
    "servedAt": "2026-03-24T10:00:00Z"
  }
}
```

## 5.5 `GET /api/v1/content/checklist`

用途：

- 提供 checklist 結構與項目對應

Response：

```json
{
  "data": {
    "documentSlug": "checklist",
    "title": "網站開發流程學習指南：實作檢查清單版",
    "updatedAt": "2026-03-24T00:00:00Z",
    "groups": [
      {
        "groupCode": "A",
        "title": "問題定義與目標",
        "description": "在專案開始前確認產品問題、使用者與成功指標。",
        "sortOrder": 1,
        "relatedGuideSectionSlugs": ["problem-definition"],
        "items": [
          {
            "itemId": "0ef3f90b-65de-4af8-9f63-f010f6cbf1f7",
            "itemCode": "A-01",
            "label": "我能用一句話說清楚這個網站要解決什麼問題",
            "sortOrder": 1,
            "relatedSectionSlug": "problem-definition"
          }
        ]
      }
    ]
  },
  "meta": {
    "requestId": "req_123",
    "version": "v1",
    "servedAt": "2026-03-24T10:00:00Z"
  }
}
```

## 5.6 `GET /api/v1/me/progress`

用途：

- 取得當前使用者或訪客的閱讀進度

Headers：

- `X-Visitor-Key`：匿名模式必填

Query：

- `subjectType`：可選
- `documentSlug`：可選

Response：

```json
{
  "data": {
    "records": [
      {
        "subjectType": "guideSection",
        "subjectSlug": "mindset",
        "scrollPercent": 72.5,
        "isCompleted": false,
        "lastReadAt": "2026-03-24T09:58:00Z"
      }
    ]
  },
  "meta": {
    "requestId": "req_123",
    "version": "v1",
    "servedAt": "2026-03-24T10:00:00Z"
  }
}
```

錯誤：

- `VISITOR_KEY_REQUIRED`

## 5.7 `PUT /api/v1/me/progress`

用途：

- 批次 upsert 閱讀進度

Headers：

- `X-Visitor-Key`：匿名模式必填

Request：

```json
{
  "records": [
    {
      "subjectType": "guideSection",
      "subjectSlug": "mindset",
      "scrollPercent": 72.5,
      "isCompleted": false,
      "lastReadAt": "2026-03-24T09:58:00Z"
    }
  ]
}
```

Response：

```json
{
  "data": {
    "updated": 1
  },
  "meta": {
    "requestId": "req_123",
    "version": "v1",
    "servedAt": "2026-03-24T10:00:00Z"
  }
}
```

規則：

- 以 `subjectType + subjectSlug + principal` 為唯一鍵 upsert
- `scrollPercent` 限制 `0` 到 `100`

## 5.8 `GET /api/v1/me/checklist`

用途：

- 取得 checklist 勾選狀態

Headers：

- `X-Visitor-Key`：匿名模式必填

Query：

- `groupCode`：可選

Response：

```json
{
  "data": {
    "items": [
      {
        "itemId": "0ef3f90b-65de-4af8-9f63-f010f6cbf1f7",
        "isChecked": true,
        "checkedAt": "2026-03-24T09:40:00Z"
      }
    ]
  },
  "meta": {
    "requestId": "req_123",
    "version": "v1",
    "servedAt": "2026-03-24T10:00:00Z"
  }
}
```

## 5.9 `PUT /api/v1/me/checklist`

用途：

- 批次 upsert checklist 勾選狀態

Headers：

- `X-Visitor-Key`：匿名模式必填

Request：

```json
{
  "items": [
    {
      "itemId": "0ef3f90b-65de-4af8-9f63-f010f6cbf1f7",
      "isChecked": true
    },
    {
      "itemId": "cc84d6b6-b39f-4c23-b5c5-84a7dd6ed405",
      "isChecked": false
    }
  ]
}
```

Response：

```json
{
  "data": {
    "updated": 2
  },
  "meta": {
    "requestId": "req_123",
    "version": "v1",
    "servedAt": "2026-03-24T10:00:00Z"
  }
}
```

規則：

- 以 `itemId + principal` 為唯一鍵 upsert
- `isChecked=false` 可保留紀錄，避免重複 insert/delete 抖動

## 5.10 `GET /api/v1/search`

用途：

- 搜尋 guide、outline、checklist

Query：

- `q`：必填
- `types`：可選，逗號分隔，例如 `guideSection,checklistItem`
- `limit`：可選，預設 `10`，最大 `30`

Response：

```json
{
  "data": {
    "query": "MVP",
    "results": [
      {
        "type": "guideSection",
        "title": "第 1 階段：MVP 切分與範圍控制",
        "slug": "mvp-scope",
        "documentSlug": "guide",
        "sectionSlug": "mvp-scope",
        "groupCode": null,
        "snippet": "MVP 不是半成品，而是最小可驗證價值..."
      }
    ]
  },
  "meta": {
    "requestId": "req_123",
    "version": "v1",
    "servedAt": "2026-03-24T10:00:00Z"
  }
}
```

錯誤：

- `SEARCH_QUERY_REQUIRED`
- `SEARCH_QUERY_TOO_SHORT`

## 5.11 `POST /api/v1/events/batch`

用途：

- 接收前端行為事件

Request：

```json
{
  "events": [
    {
      "eventName": "page_view",
      "occurredAt": "2026-03-24T09:59:00Z",
      "page": "/guide/mindset",
      "payload": {
        "mode": "guide"
      }
    },
    {
      "eventName": "checklist_item_checked",
      "occurredAt": "2026-03-24T10:00:00Z",
      "page": "/checklist",
      "payload": {
        "itemId": "0ef3f90b-65de-4af8-9f63-f010f6cbf1f7",
        "groupCode": "A"
      }
    }
  ]
}
```

Response：

```json
{
  "data": {
    "accepted": 2
  },
  "meta": {
    "requestId": "req_123",
    "version": "v1",
    "servedAt": "2026-03-24T10:00:00Z"
  }
}
```

規則：

- 批次上限建議 `50`
- 後端接收後應快速入庫或入 queue
- 不要讓事件寫入阻塞前端操作

## 5.12 `GET /api/v1/system/health`

用途：

- 健康檢查

Response：

```json
{
  "data": {
    "status": "ok",
    "checks": {
      "database": "ok",
      "redis": "ok"
    }
  },
  "meta": {
    "requestId": "req_123",
    "version": "v1",
    "servedAt": "2026-03-24T10:00:00Z"
  }
}
```

## 5.13 `GET /api/v1/system/version`

用途：

- 提供服務版本、內容版本、部署資訊

Response：

```json
{
  "data": {
    "apiVersion": "v1",
    "serviceVersion": "0.1.0",
    "contentVersion": "2026-03-24",
    "gitSha": "abc123def",
    "builtAt": "2026-03-24T08:00:00Z"
  },
  "meta": {
    "requestId": "req_123",
    "version": "v1",
    "servedAt": "2026-03-24T10:00:00Z"
  }
}
```

---

## 6. 錯誤碼草案

| Code | 說明 | HTTP |
|---|---|---|
| `SECTION_NOT_FOUND` | 找不到章節 | 404 |
| `GROUP_NOT_FOUND` | 找不到清單群組 | 404 |
| `ITEM_NOT_FOUND` | 找不到清單項目 | 404 |
| `VISITOR_KEY_REQUIRED` | 缺少匿名主體識別 | 401 |
| `INVALID_PROGRESS_PAYLOAD` | progress 請求格式錯誤 | 422 |
| `INVALID_CHECKLIST_PAYLOAD` | checklist 請求格式錯誤 | 422 |
| `SEARCH_QUERY_REQUIRED` | 搜尋字串為空 | 400 |
| `SEARCH_QUERY_TOO_SHORT` | 搜尋字串過短 | 400 |
| `RATE_LIMITED` | 觸發速率限制 | 429 |
| `INTERNAL_ERROR` | 未預期錯誤 | 500 |

---

## 7. OpenAPI 3.1 草案骨架

下面是一份可延伸成正式 `openapi.yaml` 的骨架示意。

```yaml
openapi: 3.1.0
info:
  title: Learning Workflow API
  version: 0.1.0
  description: API draft for the learning-oriented workflow site.
servers:
  - url: /api/v1
components:
  securitySchemes:
    visitorKey:
      type: apiKey
      in: header
      name: X-Visitor-Key
    sessionCookie:
      type: apiKey
      in: cookie
      name: sid
  schemas:
    Meta:
      type: object
      properties:
        requestId:
          type: string
        version:
          type: string
        servedAt:
          type: string
          format: date-time
    ErrorBody:
      type: object
      properties:
        code:
          type: string
        message:
          type: string
        details:
          type: object
          additionalProperties: true
    GuideSection:
      type: object
      properties:
        documentSlug:
          type: string
        sectionSlug:
          type: string
        title:
          type: string
        summary:
          type: string
        phaseCode:
          type: string
        estimatedReadMinutes:
          type: integer
        bodyMarkdown:
          type: string
    ChecklistItemState:
      type: object
      properties:
        itemId:
          type: string
          format: uuid
        isChecked:
          type: boolean
        checkedAt:
          type: string
          format: date-time
paths:
  /content/navigation:
    get:
      summary: Get content navigation tree
  /content/guide/{sectionSlug}:
    get:
      summary: Get guide section detail
  /content/outline:
    get:
      summary: Get outline data
  /content/checklist:
    get:
      summary: Get checklist data
  /me/progress:
    get:
      summary: Get current progress
    put:
      summary: Upsert current progress
  /me/checklist:
    get:
      summary: Get checklist states
    put:
      summary: Upsert checklist states
  /search:
    get:
      summary: Search across documents
  /events/batch:
    post:
      summary: Ingest analytics events
  /system/health:
    get:
      summary: Health check
  /system/version:
    get:
      summary: Service and content version
```

---

## 8. 前端對接備忘錄

給前端最重要的幾點：

- 先實作 local-first，不要被同步阻塞
- 所有 API response 進前端前先經過 adapter / mapper
- 不要在元件中散落依賴原始欄位
- 對 `sectionSlug`、`groupCode`、`itemId` 做穩定依賴
- content endpoints 可快取，`me/*` endpoints 不可快取

---

## 9. 目前仍待確認的開放問題

1. 匿名同步是用 `X-Visitor-Key` 還是未來改成 server-issued cookie
2. 搜尋 MVP 要只做標題與摘要，還是要含全文片段
3. `PUT /me/progress` 是否未來要支援更多 subject type
4. 書籤與筆記要不要在下一版一起保留接口
5. 中文搜尋 MVP 最終採 `pg_trgm` 還是直接用 Meilisearch

