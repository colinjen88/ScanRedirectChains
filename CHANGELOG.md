# 更新日誌

## [未發行]

### 修復

- **掃描無法運作**：Node 內建 `http.request` 的 `timeout` 選項無效，改為使用 `req.setTimeout()` 設定單次請求逾時，確保逾時與錯誤能正確觸發。
- **URL 驗證**：輸入 `example.com` 等無協定網址時會報錯，新增 `normalizeUrl()` 自動補上 `https://`。
- **全站掃描 sitemap**：改為使用 Node 內建 `http/https` 取得 sitemap，不再依賴全域 `fetch`，相容 Node 16+。
- **後端無 dist 時崩潰**：生產環境 wildcard 路由改為先檢查 `dist/index.html` 是否存在再送檔，避免開發時未建 dist 導致錯誤。
- **連線失敗提示**：前端掃描前先呼叫 `/api/health`，若後端未啟動則顯示明確的疑難排解訊息。

### 新增

- **可調單次請求逾時**：進階設定可設定 3–60 秒逾時（預設 10 秒），適合慢速或海外網站。
- **暫時性錯誤重試**：連線重置、逾時等可重試錯誤自動重試最多 2 次（間隔 500ms）。
- **Sitemap Index**：全站掃描時自動辨識 sitemap index，遞迴解析多個子 sitemap（最多 50 個，總 URL 上限 10,000）。
- **即時進度 (SSE)**：全站掃描改為 Server-Sent Events 串流，前端即時顯示「已掃 N / 總數 M」。

### 文件

- README 新增「若無法檢查網站」疑難排解、進階功能說明與專案結構。
