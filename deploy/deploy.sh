#!/bin/bash
set -e

echo "🚀 開始部署 Learning Knowledge Workspace 至 VPS"
echo "==============================================="

# 1. 確保最新程式碼
echo "[1/4] 更新程式碼碼與建置準備..."
git pull origin master || echo "初次部署尚未設定 Git? 請手動 pull"

cd deploy

# 2. 啟動服務 (並重建 images)
echo "[2/4] 啟動 Docker 容器 (背景拉取與重建)..."
docker compose down
docker compose up -d --build

# 給 DB 一點時間準備
echo "等待資料庫準備完成 (15秒)..."
sleep 15

# 3. 初始化資料庫與 Seed 內容
echo "[3/4] 執行資料庫遷移與內容種子寫入..."
docker exec devapp-backend sh -c "python -m app.scripts.seed_content" || echo "⚠️ Seed 腳本失敗，請檢查日誌"
# docker exec devapp-backend sh -c "alembic upgrade head" # 若有使用 alembic 可以解開

# 4. 註冊專案 (依據 .antigravity 守則)
echo "[4/4] 向 Gateway 註冊專案..."
curl -s -X POST "https://devapp.seobi.tw/jen/api/register-project" \
  -H "Content-Type: application/json" \
  -d '{
    "id": "learning-knowledge-workspace",
    "domain": "devapp.seobi.tw",
    "containers": ["devapp-frontend", "devapp-backend", "devapp-db", "devapp-redis"],
    "notes": "FastAPI+Next.js 部署, Caddy Proxy 標籤就緒"
  }'

echo -e "\n✅ 部署完成！請測試 https://devapp.seobi.tw"
