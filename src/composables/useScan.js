import { ref } from 'vue'

/** 將連線/網路錯誤轉成使用者可理解的訊息 */
function getFriendlyErrorMessage(error) {
    const msg = (error && error.message) || String(error)
    if (/fetch|network|failed to fetch|load failed|NetworkError/i.test(msg)) {
        return '無法連線至掃描服務，請確認已啟動後端（在專案目錄執行 npm run server 或 npm run dev:all）'
    }
    return msg
}

/** 解析 SSE 流：依序觸發 onEvent(event, data) */
async function parseSSE(response, onEvent) {
    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const blocks = buffer.split(/\n\n+/)
        buffer = blocks.pop() || ''
        for (const block of blocks) {
            let event = 'message'
            let dataStr = ''
            for (const line of block.split('\n')) {
                if (line.startsWith('event:')) event = line.slice(6).trim() || event
                else if (line.startsWith('data:')) dataStr = line.slice(5).trim()
            }
            try {
                const data = dataStr ? JSON.parse(dataStr) : {}
                onEvent(event, data)
            } catch (_) { /* ignore */ }
        }
    }
    if (buffer.trim()) {
        let event = 'message'
        let dataStr = ''
        for (const line of buffer.split('\n')) {
            if (line.startsWith('event:')) event = line.slice(6).trim() || event
            else if (line.startsWith('data:')) dataStr = line.slice(5).trim()
        }
        try {
            if (dataStr) onEvent(event, JSON.parse(dataStr))
        } catch (_) { /* ignore */ }
    }
}

export function useScan(showToast) {
    const url = ref('')
    const scanType = ref('single')
    const isScanning = ref(false)
    const progress = ref(0)
    const progressText = ref('')
    const currentScanningUrl = ref('')
    const progressTotal = ref(0)
    const progressCurrent = ref(0)
    const results = ref([])
    const showAdvanced = ref(false)
    const userAgent = ref('default')
    const maxRedirects = ref(10)
    const timeoutMs = ref(10000)

    const startScan = async () => {
        if (!url.value) return

        isScanning.value = true
        progress.value = 0
        progressTotal.value = 0
        progressCurrent.value = 0
        results.value = []
        progressText.value = '正在連線至掃描伺服器...'
        currentScanningUrl.value = url.value

        const payload = {
            url: url.value,
            scanType: scanType.value,
            userAgent: userAgent.value,
            maxRedirects: maxRedirects.value,
            timeoutMs: timeoutMs.value,
        }

        try {
            const healthRes = await fetch('/api/health', { method: 'GET' }).catch(() => null)
            if (!healthRes || !healthRes.ok) {
                showToast(getFriendlyErrorMessage(new Error('Failed to fetch')), 'error')
                isScanning.value = false
                return
            }

            progress.value = 10
            progressText.value = '正在發送掃描請求...'

            const useStream = scanType.value === 'site'
            if (useStream) payload.stream = true

            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.error || `伺服器回應錯誤 (HTTP ${response.status})`)
            }

            if (useStream && response.headers.get('Content-Type')?.includes('text/event-stream')) {
                await parseSSE(response, (event, data) => {
                    if (event === 'progress') {
                        progressTotal.value = data.total || 0
                        progressCurrent.value = data.current || 0
                        currentScanningUrl.value = data.currentUrl || ''
                        progressText.value = `正在掃描 (${data.current || 0} / ${data.total || 0})`
                        progress.value = data.total ? Math.round((data.current / data.total) * 90) + 5 : 50
                    } else if (event === 'done') {
                        results.value = data.results || []
                        progress.value = 100
                        progressText.value = '整理掃描結果中...'
                    } else if (event === 'error') {
                        throw new Error(data.error || '伺服器錯誤')
                    }
                })
            } else {
                progress.value = 60
                progressText.value = '正在分析回應資料...'
                const data = await response.json()
                progress.value = 90
                progressText.value = '整理掃描結果中...'
                await new Promise(r => setTimeout(r, 300))
                results.value = data.results || []
                progress.value = 100
            }
        } catch (error) {
            console.error('Scan error:', error)
            const message = getFriendlyErrorMessage(error)
            showToast(`掃描失敗：${message}`, 'error')
        } finally {
            isScanning.value = false
        }
    }

    return {
        url,
        scanType,
        isScanning,
        progress,
        progressText,
        currentScanningUrl,
        progressTotal,
        progressCurrent,
        results,
        showAdvanced,
        userAgent,
        maxRedirects,
        timeoutMs,
        startScan,
    }
}
