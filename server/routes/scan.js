import { Router } from 'express'
import http from 'http'
import https from 'https'

export const scanRouter = Router()

const DEFAULT_REQUEST_TIMEOUT_MS = 10000
const MIN_TIMEOUT_MS = 3000
const MAX_TIMEOUT_MS = 60000
const MAX_RETRIES = 2
const RETRY_DELAY_MS = 500

// 是否為可重試的暫時性錯誤
function isRetryableError(err) {
    const msg = (err && err.error) || (err && err.message) || String(err)
    return /ECONNRESET|ETIMEDOUT|ECONNREFUSED|socket hang up|network/i.test(msg)
}

// User-Agent presets
const USER_AGENTS = {
    default: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'googlebot-mobile': 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    bingbot: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
}

/** 正規化 URL：若無協定則補上 https:// */
function normalizeUrl(input) {
    const s = (input || '').trim()
    if (!s) return ''
    if (/^https?:\/\//i.test(s)) return s
    return `https://${s}`
}

/**
 * 單次 HEAD 請求（可重試）
 */
function doOneRequest(currentUrl, ua, timeoutMs, startTime) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(currentUrl)
        const client = parsedUrl.protocol === 'https:' ? https : http

        const req = client.request(
            currentUrl,
            { method: 'HEAD', headers: { 'User-Agent': ua } },
            (res) => {
                const elapsed = Date.now() - startTime
                resolve({
                    url: currentUrl,
                    status: res.statusCode,
                    time_ms: elapsed,
                    location: res.headers.location || null,
                })
            }
        )

        req.setTimeout(timeoutMs, () => {
            req.destroy()
            reject({ url: currentUrl, error: 'Request timeout', time_ms: Date.now() - startTime })
        })
        req.on('error', (err) => {
            reject({ url: currentUrl, error: err.message, time_ms: Date.now() - startTime })
        })
        req.end()
    })
}

/**
 * Follow redirects for a single URL and record the chain（支援可調逾時與重試）
 */
async function traceRedirects(targetUrl, userAgent = 'default', maxRedirects = 10, timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS) {
    const chain = []
    let currentUrl = targetUrl
    let redirectCount = 0
    const ua = USER_AGENTS[userAgent] || USER_AGENTS.default
    const clampedTimeout = Math.min(MAX_TIMEOUT_MS, Math.max(MIN_TIMEOUT_MS, timeoutMs))

    for (let i = 0; i <= maxRedirects; i++) {
        const startTime = Date.now()
        let lastErr = null

        try {
            let reachedFinal = false
            for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
                try {
                    const result = await doOneRequest(currentUrl, ua, clampedTimeout, startTime)
                    lastErr = null

                    chain.push({
                        step: i + 1,
                        url: result.url,
                        status: result.status,
                        time_ms: result.time_ms,
                    })

                    if (result.status >= 300 && result.status < 400 && result.location) {
                        redirectCount++
                        try {
                            currentUrl = new URL(result.location, currentUrl).href
                        } catch {
                            currentUrl = result.location
                        }
                    } else {
                        reachedFinal = true
                    }
                    break
                } catch (err) {
                    lastErr = err
                    if (attempt < MAX_RETRIES && isRetryableError(err)) {
                        await new Promise(r => setTimeout(r, RETRY_DELAY_MS))
                        continue
                    }
                    throw err
                }
            }
            if (lastErr) throw lastErr
            if (reachedFinal) break
        } catch (err) {
            chain.push({
                step: i + 1,
                url: err.url || currentUrl,
                status: 0,
                time_ms: err.time_ms || 0,
                error: err.error || 'Unknown error',
            })
            return {
                original_url: targetUrl,
                final_url: currentUrl,
                total_redirects: redirectCount,
                is_error: true,
                chain,
            }
        }
    }

    return {
        original_url: targetUrl,
        final_url: currentUrl,
        total_redirects: redirectCount,
        is_error: false,
        chain,
    }
}

/**
 * 使用 Node 內建 http/https 取得 URL 內容（相容 Node 16+，不依賴 fetch）
 */
function fetchUrlAsText(url, timeoutMs = 10000) {
    return new Promise((resolve, reject) => {
        const parsed = new URL(url)
        const client = parsed.protocol === 'https:' ? https : http
        const req = client.request(url, { method: 'GET', headers: { 'User-Agent': USER_AGENTS.default } }, (res) => {
            const chunks = []
            res.on('data', (chunk) => chunks.push(chunk))
            res.on('end', () => resolve({ ok: res.statusCode >= 200 && res.statusCode < 400, text: Buffer.concat(chunks).toString('utf8') }))
            res.on('error', reject)
        })
        req.on('error', reject)
        req.setTimeout(timeoutMs, () => { req.destroy(); reject(new Error('Timeout')) })
        req.end()
    })
}

const MAX_SITEMAP_INDEX_ENTRIES = 50
const MAX_DISCOVER_URLS = 10000

/** 從 XML 擷取 <loc> 清單 */
function extractLocUrls(text) {
    const list = []
    for (const m of text.matchAll(/<loc>([^<]+)<\/loc>/g)) list.push(m[1].trim())
    return list
}

/**
 * 解析 Sitemap Index：若為 index 則遞迴抓取子 sitemap 的 URL
 */
async function discoverUrls(baseUrl, fetchTimeoutMs = 10000) {
    const urls = new Set()
    urls.add(baseUrl)

    try {
        const sitemapUrl = new URL('/sitemap.xml', baseUrl).href
        const { ok, text } = await fetchUrlAsText(sitemapUrl, fetchTimeoutMs)

        if (ok && text) {
            const isSitemapIndex = /<sitemap\b/i.test(text)
            if (isSitemapIndex) {
                const sitemapRegex = /<sitemap\b[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<\/sitemap>/gi
                const sitemapUrls = []
                for (const m of text.matchAll(sitemapRegex)) {
                    sitemapUrls.push(m[1].trim())
                    if (sitemapUrls.length >= MAX_SITEMAP_INDEX_ENTRIES) break
                }
                for (const subUrl of sitemapUrls) {
                    try {
                        const { ok: subOk, text: subText } = await fetchUrlAsText(subUrl, fetchTimeoutMs)
                        if (subOk && subText) {
                            for (const u of extractLocUrls(subText)) {
                                urls.add(u)
                                if (urls.size >= MAX_DISCOVER_URLS) break
                            }
                        }
                    } catch { /* skip this sitemap */ }
                    if (urls.size >= MAX_DISCOVER_URLS) break
                }
            } else {
                for (const u of extractLocUrls(text)) {
                    urls.add(u)
                    if (urls.size >= MAX_DISCOVER_URLS) break
                }
            }
        }
        if (urls.size === 1) {
            const commonPaths = ['/about', '/contact', '/blog', '/services', '/products', '/']
            for (const path of commonPaths) {
                try {
                    urls.add(new URL(path, baseUrl).href)
                } catch { /* ignore */ }
            }
        }
    } catch {
        const commonPaths = ['/about', '/contact', '/blog', '/services', '/products', '/']
        for (const path of commonPaths) {
            try {
                urls.add(new URL(path, baseUrl).href)
            } catch { /* ignore */ }
        }
    }

    return Array.from(urls)
}

/** 寫入 SSE 事件 */
function writeSSE(res, event, data) {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

// POST /api/scan（支援 stream: true 時以 SSE 回傳全站掃描進度）
scanRouter.post('/', async (req, res) => {
    try {
        const {
            url: rawUrl,
            scanType = 'single',
            userAgent = 'default',
            maxRedirects = 10,
            timeoutMs,
            stream = false,
        } = req.body

        if (!rawUrl || typeof rawUrl !== 'string') {
            return res.status(400).json({ error: '請提供要掃描的 URL' })
        }

        const url = normalizeUrl(rawUrl)
        if (!url) {
            return res.status(400).json({ error: '請提供要掃描的 URL' })
        }

        try {
            new URL(url)
        } catch {
            return res.status(400).json({ error: '無效的 URL 格式（請確認網址正確，可含 https:// 或 http://）' })
        }

        const requestTimeoutMs = timeoutMs != null
            ? Math.min(MAX_TIMEOUT_MS, Math.max(MIN_TIMEOUT_MS, Number(timeoutMs)))
            : DEFAULT_REQUEST_TIMEOUT_MS

        let results = []

        if (scanType === 'single') {
            const result = await traceRedirects(url, userAgent, maxRedirects, requestTimeoutMs)
            results = [result]
            if (stream) {
                res.setHeader('Content-Type', 'text/event-stream')
                res.setHeader('Cache-Control', 'no-cache')
                res.setHeader('Connection', 'keep-alive')
                res.flushHeaders()
                writeSSE(res, 'progress', { total: 1, current: 1, currentUrl: url })
                writeSSE(res, 'done', { results })
                return res.end()
            }
            return res.json({ results })
        }

        // Full site scan
        const useStream = stream === true
        if (useStream) {
            res.setHeader('Content-Type', 'text/event-stream')
            res.setHeader('Cache-Control', 'no-cache')
            res.setHeader('Connection', 'keep-alive')
            res.flushHeaders()
        }

        const urls = await discoverUrls(url, requestTimeoutMs)
        const CONCURRENCY = 20
        results = []

        for (let i = 0; i < urls.length; i += CONCURRENCY) {
            const chunk = urls.slice(i, i + CONCURRENCY)
            const chunkResults = await Promise.all(
                chunk.map(u => traceRedirects(u, userAgent, maxRedirects, requestTimeoutMs))
            )
            results.push(...chunkResults)
            if (useStream) {
                writeSSE(res, 'progress', {
                    total: urls.length,
                    current: Math.min(i + chunk.length, urls.length),
                    currentUrl: chunk[chunk.length - 1] || '',
                })
            }
        }

        if (useStream) {
            writeSSE(res, 'done', { results })
            return res.end()
        }
        res.json({ results })
    } catch (error) {
        console.error('Scan error:', error)
        if (!res.headersSent) {
            res.status(500).json({ error: '伺服器內部錯誤' })
        } else {
            writeSSE(res, 'error', { error: '伺服器內部錯誤' })
            res.end()
        }
    }
})
