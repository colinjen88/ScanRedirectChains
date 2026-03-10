# Redirect Scanner Pro ✨ AI 強化版

> SEO 重新導向鏈檢測與 AI 智慧修復工具

掃描網站的重新導向鏈 (Redirect Chain)，視覺化呈現轉址路徑，並透過 Gemini AI 提供專業的 SEO 修復建議。

## 功能特色

- 🔍 **真實 HTTP 轉址追蹤** — 追蹤完整的轉址鏈 (301/302/303 等)
- 🌐 **高擴展性全站掃描** — 自動解析 sitemap.xml，支援高達 10,000 個 URL 批次檢測，具備並發控制 (Concurrency Control) 機制
- 📊 **視覺化報告** — Mermaid 流程圖 + 時間軸展示
- ✨ **AI 智慧分析** — Gemini AI 提供 SEO 建議與修復代碼
- 📦 **CSV 匯出** — 一鍵匯出掃描結果
- 🛡️ **安全設計** — API Key 存放於後端，不暴露給前端
- ⏱️ **可調逾時與重試** — 進階設定可調整單次請求逾時（3–60 秒），暫時性連線錯誤自動重試最多 2 次
- 🗺️ **Sitemap Index** — 全站掃描時自動辨識 sitemap index，遞迴解析多個子 sitemap（最多 50 個）
- 📡 **即時進度** — 全站掃描時以 SSE 回傳「已掃 N / 總數 M」，前端即時更新進度

## 技術棧

| 前端 | 後端 |
|------|------|
| Vue 3 (SFC) | Node.js + Express 5 |
| Vite 6 | Gemini API Proxy |
| Tailwind CSS v4 | HTTP Redirect Tracer |
| Mermaid.js | Sitemap Parser |
| Lucide Icons | |

## 快速開始

### 1. 安裝依賴

```bash
# 前端依賴
npm install

# 後端依賴
cd server && npm install
```

### 2. 設定環境變數

```bash
# 複製範例檔案
cp server/.env.example server/.env

# 編輯 server/.env，設定你的 Gemini API Key
```

### 3. 啟動開發伺服器

```bash
# 同時啟動前端 + 後端
npm run dev:all

# 或分別啟動：
npm run dev        # 前端 (port 5173)
npm run server     # 後端 (port 3001)
```

### 4. 開啟瀏覽器

訪問 `http://localhost:5173`

### 若無法檢查網站（疑難排解）

- **必須同時啟動前端與後端**：只開 `npm run dev` 會無法掃描。請在專案根目錄執行 `npm run dev:all`，或開兩個終端分別執行 `npm run dev` 與 `npm run server`。
- **網址格式**：可輸入 `https://example.com` 或直接輸入 `example.com`（會自動補上 `https://`）。
- **後端埠號**：預設為 3001；若被佔用可設定環境變數 `PORT`（例如在 `server/.env` 加上 `PORT=3002`），並確認 `vite.config.js` 的 proxy 目標埠號一致。
- **健康檢查**：瀏覽器開啟 `http://localhost:3001/api/health` 應回傳 `{"status":"ok",...}`，若無法連線代表後端未啟動。

## 專案結構

```
scan_RedirectChains/
├── index.html              # 入口 HTML (含 SEO meta)
├── vite.config.js          # Vite 設定 (含 API proxy)
├── package.json            # 前端依賴
├── src/
│   ├── main.js             # Vue 入口
│   ├── App.vue             # 根元件
│   ├── style.css           # 全域樣式 (Tailwind v4)
│   ├── components/
│   │   ├── AppHeader.vue
│   │   ├── ScanInput.vue
│   │   ├── ScanProgress.vue
│   │   ├── StatsCards.vue
│   │   ├── ResultsDashboard.vue
│   │   ├── ResultRow.vue
│   │   ├── RedirectChainDetail.vue
│   │   ├── AIAdvisor.vue
│   │   ├── NginxFixBlock.vue
│   │   ├── KnowledgeSection.vue
│   │   └── ToastNotification.vue
│   ├── composables/
│   │   ├── useScan.js
│   │   └── useToast.js
│   └── utils/
│       ├── export.js
│       ├── mermaid.js
│       └── statusHelpers.js
└── server/
    ├── index.js            # Express 伺服器
    ├── package.json        # 後端依賴
    ├── .env.example
    └── routes/
        ├── scan.js         # 轉址掃描 API
        └── ai.js           # Gemini AI 代理
```

## 部署指南 (Docker)

本專案內含 Dockerfile 與 docker-compose.yml，可快速部署至伺服器。

### 1. 使用 Docker Compose

```yaml
# 編輯 docker-compose.yml 設定環境變數
environment:
  - PORT=3001
  - GEMINI_API_KEY=你的金鑰
```

```bash
docker compose up -d --build
```

### 2. 關於 高流量全站掃描

系統後端實作了分流機制 (Concurrency: 20)，掃描三千個以上的網頁時會分批排隊處理，以防止對目標伺服器或主機造成負載過大。

## 更新日誌

變更紀錄見 [CHANGELOG.md](./CHANGELOG.md)。

## License

MIT
