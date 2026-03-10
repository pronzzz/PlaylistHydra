/**
 * Sanitize a string for safe use in shell arguments.
 * Allows only alphanumeric, spaces, hyphens, underscores, dots, colons, slashes.
 */
export function sanitizeForShell(input) {
    if (typeof input !== 'string') return ''
    return input.replace(/[^a-zA-Z0-9 \-_.:\/=&?%]/g, '')
}

/**
 * Sanitize a filename — strip dangerous chars.
 */
export function sanitizeFilename(name) {
    if (typeof name !== 'string') return 'untitled'
    return name
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 200)
}
