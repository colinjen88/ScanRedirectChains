/**
 * Export scan results as CSV with BOM for Excel compatibility
 */
export function exportCSV(results) {
    if (!results || results.length === 0) return

    const headers = ['來源網址', '最終目標網址', '跳轉次數', '最終狀態', '完整轉址路徑 (以 -> 分隔)']
    const csvRows = [headers.join(',')]

    results.forEach(r => {
        const finalStatus = r.is_error ? 'Error' : (r.chain[r.chain.length - 1]?.status || '200')
        const chainPath = r.chain.map(step => `[${step.status}] ${step.url}`).join(' -> ')

        const row = [
            `"${r.original_url}"`,
            `"${r.final_url}"`,
            r.total_redirects,
            `"${finalStatus}"`,
            `"${chainPath}"`,
        ]
        csvRows.push(row.join(','))
    })

    // BOM for Excel Chinese support
    const csvString = '\uFEFF' + csvRows.join('\n')
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.setAttribute('download', `Redirect_Scan_Report_${new Date().getTime()}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}
