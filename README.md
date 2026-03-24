# 文件總覽

這個資料夾目前是一套完整的「網站開發流程學習網站」文件組，包含學習內容、前端規劃、後端規劃、API 草案、資料表草案與設計提示詞。

---

## 1. 核心學習文件

- [study.md](./study.md)  
  完整版主文件。適合系統理解整體網站開發流程。

- [study-quick-outline.md](./study-quick-outline.md)  
  速讀版大綱。適合快速複習、面試、帶人、kick-off 對齊。

- [study-implementation-checklist.md](./study-implementation-checklist.md)  
  實作檢查清單版。適合實際做網站時逐項核對。

---

## 2. 前端規劃文件

- [design.md](./design.md)  
  前端產品定位、資訊架構、版面配置、UI/UX、前後端協作基線與 AI 開發提示詞。

- [to-canvas.md](./doc/to-canvas.md)  
  專門提供給 Gemini Pro / Canva 做前端視覺與介面設計的臨時提示詞檔。

---

## 3. 後端規劃文件

- [backend-design.md](./backend-design.md)
  後端架構、模組、技術選型、資料模型與後端提示詞主文件。

- [api-spec-draft.md](./api-spec-draft.md)
  API 草案、endpoint 明細、payload 範例與 OpenAPI 骨架。

- [db-schema-draft.md](./db-schema-draft.md)
  PostgreSQL schema 初稿、索引、約束、migration 順序與資料流建議。

- [to-gemini-backend.md](./to-gemini-backend.md)
  專門提供給 Gemini Pro 協助規劃後端架構、API、資料模型與實作路線的提示詞檔。

---

## 4. 建議閱讀順序

### 如果你要先學觀念

1. [study.md](./study.md)
2. [study-quick-outline.md](./study-quick-outline.md)
3. [study-implementation-checklist.md](./study-implementation-checklist.md)

### 如果你要先規劃前端

1. [study.md](./study.md)
2. [design.md](./design.md)
3. [to-canvas.md](./doc/to-canvas.md)

### 如果你要先規劃後端

1. [study.md](./study.md)
2. [backend-design.md](./backend-design.md)
3. [to-gemini-backend.md](./to-gemini-backend.md)
4. [api-spec-draft.md](./api-spec-draft.md)
5. [db-schema-draft.md](./db-schema-draft.md)

### 如果你要做前後端協作

1. [design.md](./design.md)
2. [backend-design.md](./backend-design.md)
3. [to-gemini-backend.md](./to-gemini-backend.md)
4. [api-spec-draft.md](./api-spec-draft.md)
5. [db-schema-draft.md](./db-schema-draft.md)

---

## 5. 檔名與結構說明

目前檔名已經具備兩個優點，因此本輪不建議改名：

- 各文件用途清楚
- 彼此已有交叉引用

除非之後真的要發展成正式 docs 專案，否則目前這組檔名已足夠穩定：

- `study-*`：學習內容層
- `design.md` / `doc/to-canvas.md`：前端設計層
- `backend-design.md` / `to-gemini-backend.md` / `api-spec-draft.md` / `db-schema-draft.md`：後端設計層

---

## 6. 建議下一步

如果要往實作走，建議優先順序：

1. 先用 [design.md](./design.md) + [to-canvas.md](./doc/to-canvas.md) 確認前端介面方向
2. 再用 [backend-design.md](./backend-design.md) + [to-gemini-backend.md](./to-gemini-backend.md) 確認後端架構方向
3. 再用 [api-spec-draft.md](./api-spec-draft.md) 對齊前後端資料契約
4. 最後再用 [db-schema-draft.md](./db-schema-draft.md) 落 migration 與 ORM 模型
