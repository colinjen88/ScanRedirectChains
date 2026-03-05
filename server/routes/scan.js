import { Router } from 'express'
import http from 'http'
import https from 'https'

export const scanRouter = Router()

// User-Agent presets
const USER_AGENTS = {
    default: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    googlebot: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'googlebot-mobile': 'Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    bingbot: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
}

/**
 * Follow redirects for a single URL and record the chain
 */
async function traceRedirects(targetUrl, userAgent = 'default', maxRedirects = 10) {
    const chain = []
    let currentUrl = targetUrl
    let redirectCount = 0
    const ua = USER_AGENTS[userAgent] || USER_AGENTS.default

    for (let i = 0; i <= maxRedirects; i++) {
        const startTime = Date.now()

        try {
            const result = await new Promise((resolve, reject) => {
                const parsedUrl = new URL(currentUrl)
                const client = parsedUrl.protocol === 'https:' ? https : http

                const req = client.request(
                    currentUrl,
                    {
                        method: 'HEAD',
                        headers: { 'User-Agent': ua },
                        timeout: 10000,
                        // Don't follow redirects automatically
                        maxRedirects: 0,
                    },
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

                req.on('error', (err) => {
                    const elapsed = Date.now() - startTime
                    reject({ url: currentUrl, error: err.message, time_ms: elapsed })
                })

                req.on('timeout', () => {
                    req.destroy()
                    const elapsed = Date.now() - startTime
                    reject({ url: currentUrl, error: 'Request timeout', time_ms: elapsed })
                })

                req.end()
            })

            chain.push({
                step: i + 1,
                url: result.url,
                status: result.status,
                time_ms: result.time_ms,
            })

            // If it's a redirect (3xx), follow the Location header
            if (result.status >= 300 && result.status < 400 && result.location) {
                redirectCount++
                // Handle relative URLs
                try {
                    currentUrl = new URL(result.location, currentUrl).href
                } catch {
                    currentUrl = result.location
                }
            } else {
                // Not a redirect, we've reached the final destination
                break
            }
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
 * Crawl sitemap.xml or common pages for full-site scan
 */
async function discoverUrls(baseUrl) {
    const urls = new Set()
    urls.add(baseUrl)

    // Try to fetch and parse sitemap
    try {
        const sitemapUrl = new URL('/sitemap.xml', baseUrl).href
        const response = await fetch(sitemapUrl, {
            headers: { 'User-Agent': USER_AGENTS.default },
            signal: AbortSignal.timeout(10000),
        })

        if (response.ok) {
            const text = await response.text()
            // Simple regex to extract URLs from sitemap XML
            const urlMatches = text.matchAll(/<loc>([^<]+)<\/loc>/g)
            for (const match of urlMatches) {
                urls.add(match[1])
                if (urls.size >= 10000) break // Increased limit for larger sites
            }
        }
    } catch {
        // Sitemap not available, add common paths
        const commonPaths = ['/about', '/contact', '/blog', '/services', '/products']
        for (const path of commonPaths) {
            try {
                urls.add(new URL(path, baseUrl).href)
            } catch { }
        }
    }

    return Array.from(urls)
}

// POST /api/scan
scanRouter.post('/', async (req, res) => {
    try {
        const { url, scanType = 'single', userAgent = 'default', maxRedirects = 10 } = req.body

        if (!url) {
            return res.status(400).json({ error: '請提供要掃描的 URL' })
        }

        // Validate URL
        try {
            new URL(url)
        } catch {
            return res.status(400).json({ error: '無效的 URL 格式' })
        }

        let results = []

        if (scanType === 'single') {
            const result = await traceRedirects(url, userAgent, maxRedirects)
            results = [result]
        } else {
            // Full site scan
            const urls = await discoverUrls(url)
            const CONCURRENCY = 20 // Process 20 URLs at a time for efficiency
            results = []

            for (let i = 0; i < urls.length; i += CONCURRENCY) {
                const chunk = urls.slice(i, i + CONCURRENCY)
                const chunkResults = await Promise.all(
                    chunk.map(u => traceRedirects(u, userAgent, maxRedirects))
                )
                results.push(...chunkResults)
            }
        }

        res.json({ results })
    } catch (error) {
        console.error('Scan error:', error)
        res.status(500).json({ error: '伺服器內部錯誤' })
    }
})
