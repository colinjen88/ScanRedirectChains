/**
 * Get the display status class for a result
 */
export function getStatusClass(result) {
    if (result.is_error) return 'bg-red-100 text-red-700'
    const lastStep = result.chain[result.chain.length - 1]
    if (lastStep && lastStep.status >= 400) return 'bg-red-100 text-red-700'
    if (result.total_redirects >= 3) return 'bg-amber-100 text-amber-800'
    return 'bg-green-100 text-green-700'
}

/**
 * Get the status dot color class
 */
export function getStatusDotClass(result) {
    if (result.is_error) return 'bg-red-500'
    const lastStep = result.chain[result.chain.length - 1]
    if (lastStep && lastStep.status >= 400) return 'bg-red-500'
    if (result.total_redirects >= 3) return 'bg-amber-500'
    return 'bg-green-500'
}

/**
 * Get human-readable final status text
 */
export function getFinalStatus(result) {
    if (result.is_error) return '錯誤 (Error)'
    const lastStep = result.chain[result.chain.length - 1]
    return lastStep ? `${lastStep.status} OK` : '200 OK'
}
