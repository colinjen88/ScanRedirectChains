/**
 * Generate Mermaid flowchart code from a scan result
 */
export function generateMermaidCode(result) {
    let code = 'graph TD\n'

    result.chain.forEach((step, idx) => {
        try {
            const urlObj = new URL(step.url)
            let shortUrl = urlObj.pathname + urlObj.search
            if (shortUrl === '/' || shortUrl === '') shortUrl = urlObj.hostname
            // Escape special chars for Mermaid
            shortUrl = shortUrl.replace(/["()]/g, '')

            code += `  node${idx}["[${step.status}]<br/>${shortUrl}"]\n`
            if (idx > 0) {
                code += `  node${idx - 1} --> node${idx}\n`
            }
        } catch {
            code += `  node${idx}["[${step.status}]<br/>Invalid URL"]\n`
            if (idx > 0) {
                code += `  node${idx - 1} --> node${idx}\n`
            }
        }
    })

    // Apply styles based on status code
    result.chain.forEach((step, idx) => {
        if (step.status >= 400) {
            code += `  style node${idx} fill:#fee2e2,stroke:#ef4444,stroke-width:2px,color:#991b1b\n`
        } else if (step.status >= 300) {
            code += `  style node${idx} fill:#fef3c7,stroke:#f59e0b,stroke-width:2px,color:#92400e\n`
        } else {
            code += `  style node${idx} fill:#dcfce3,stroke:#22c55e,stroke-width:2px,color:#166534\n`
        }
    })

    return code
}

/**
 * Generate basic Nginx fix suggestion
 */
export function generateNginxFix(result) {
    try {
        const originalUrl = new URL(result.original_url)
        const finalUrl = new URL(result.final_url)
        const originalPath = originalUrl.pathname + originalUrl.search

        if (originalUrl.hostname !== finalUrl.hostname) {
            return `# 跨網域轉址修復\nrewrite ^${originalPath}/?$ ${result.final_url} permanent;`
        } else {
            const finalPath = finalUrl.pathname + finalUrl.search
            return `# 同網域轉址修復\nlocation = ${originalPath} {\n    return 301 ${finalPath};\n}`
        }
    } catch {
        return '# 無法解析網址以生成代碼'
    }
}
