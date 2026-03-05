import { Router } from 'express'
import { marked } from 'marked'

export const aiRouter = Router()

const GEMINI_MODEL = 'gemini-2.5-flash-preview-09-2025'

/**
 * Fetch with exponential backoff retry
 */
async function fetchWithRetry(url, options, retries = 3, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            const response = await fetch(url, {
                ...options,
                signal: AbortSignal.timeout(30000),
            })
            if (!response.ok) {
                const text = await response.text()
                throw new Error(`HTTP ${response.status}: ${text}`)
            }
            return await response.json()
        } catch (e) {
            if (i === retries - 1) throw e
            await new Promise(res => setTimeout(res, delay))
            delay *= 2
        }
    }
}

// POST /api/ai/analyze
aiRouter.post('/analyze', async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey || apiKey === 'your-gemini-api-key-here') {
        return res.status(503).json({
            error: 'AI 功能未啟用。請在 server/.env 中設定有效的 GEMINI_API_KEY。',
        })
    }

    try {
        const { original_url, final_url, chain } = req.body

        if (!original_url || !final_url || !chain) {
            return res.status(400).json({ error: '缺少必要參數' })
        }

        const prompt = `身為一位資深的 SEO 專家與系統管理員，請分析以下網站的「重新導向鏈 (Redirect Chain)」並給予建議。

【原始網址】：${original_url}
【最終網址】：${final_url}
【跳轉歷程】：
${chain}

請提供以下內容（使用繁體中文，並使用 Markdown 排版）：
### 1. 🔍 SEO 影響評估
用簡潔白話的方式總結這個特定轉址路徑的問題所在（例如：發生了協議 HTTP 轉換 HTTPS、又加上結尾斜線等，為什麼這樣對搜尋引擎不好）。

### 2. 🛠️ 最佳實踐與修復建議
說明應該如何調整網站架構，讓起點直接對應到終點。

### 3. 💻 伺服器設定代碼
請提供在 **Nginx** 與 **Apache (.htaccess)** 兩種環境下的「一步到位」轉址修復代碼，並附上簡短註解說明。確保代碼安全且語法正確。`

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: {
                parts: [{
                    text: '你是一位精通 SEO 與 Linux 伺服器管理的專業助手。回答要專業、簡潔、友善。',
                }],
            },
        }

        const data = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text
        if (!text) {
            throw new Error('API 未回傳預期格式的文字')
        }

        // Parse Markdown to HTML on the server side
        const html = marked.parse(text)

        res.json({ html, raw: text })
    } catch (error) {
        console.error('Gemini API Error:', error.message)
        res.status(500).json({
            error: `AI 分析失敗：${error.message}`,
        })
    }
})
