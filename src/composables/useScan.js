import { ref } from 'vue'

export function useScan(showToast) {
    const url = ref('')
    const scanType = ref('single')
    const isScanning = ref(false)
    const progress = ref(0)
    const progressText = ref('')
    const currentScanningUrl = ref('')
    const results = ref([])
    const showAdvanced = ref(false)
    const userAgent = ref('default')
    const maxRedirects = ref(10)

    const startScan = async () => {
        if (!url.value) return

        isScanning.value = true
        progress.value = 0
        results.value = []

        progressText.value = '正在連線至掃描伺服器...'
        currentScanningUrl.value = url.value

        try {
            // Simulate initial progress
            progress.value = 10
            progressText.value = '正在發送掃描請求...'

            const response = await fetch('/api/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    url: url.value,
                    scanType: scanType.value,
                    userAgent: userAgent.value,
                    maxRedirects: maxRedirects.value,
                }),
            })

            progress.value = 60
            progressText.value = '正在分析回應資料...'

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}))
                throw new Error(errData.error || `伺服器回應錯誤 (HTTP ${response.status})`)
            }

            const data = await response.json()
            progress.value = 90
            progressText.value = '整理掃描結果中...'

            // Small delay for UX
            await new Promise(r => setTimeout(r, 300))

            results.value = data.results || []
            progress.value = 100
        } catch (error) {
            console.error('Scan error:', error)
            showToast(`掃描失敗：${error.message}`, 'error')
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
        results,
        showAdvanced,
        userAgent,
        maxRedirects,
        startScan,
    }
}
